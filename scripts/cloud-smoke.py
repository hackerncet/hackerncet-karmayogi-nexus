"""Read-only/negative cloud checks; never creates accounts or sends email.

Usage: NEXUS_CLOUD_CONFIG=/path/to/{url,key}.json NEXUS_ORIGIN=https://... python scripts/cloud-smoke.py
Only a publishable Supabase key is needed. Never supply a service-role key.
"""
import json
import os
import secrets
import subprocess
import sys
from datetime import datetime, timezone
from urllib.parse import urlencode

config = json.load(open(os.environ["NEXUS_CLOUD_CONFIG"], encoding="utf-8"))
origin = os.environ["NEXUS_ORIGIN"].rstrip("/")
results = []


def request(url, *, headers=None, data=None):
    args = ["curl", "--silent", "--show-error", "--max-time", "60", "-w", "\n%{http_code}", url]
    for key, value in (headers or {}).items():
        args.extend(["-H", f"{key}: {value}"])
    if data is not None:
        args.extend(["--data-binary", "@-"])
    result = subprocess.run(args, input=data, capture_output=True, text=True, check=True)
    body, status = result.stdout.rsplit("\n", 1)
    return int(status), body


def check(name, actual, expected, condition=True):
    results.append({"check": name, "http_status": actual, "expected_status": expected,
                    "passed": actual == expected and bool(condition)})


status, body = request(origin + "/api/health")
health = json.loads(body)
check("deployment configuration", status, 200, health.get("databaseConfigured"))
status, body = request(config["url"] + "/auth/v1/settings", headers={"apikey": config["key"]})
settings = json.loads(body)
check("email Auth enabled; confirmation required", status, 200,
      settings.get("external", {}).get("email") and not settings.get("mailer_autoconfirm"))
status, body = request(config["url"] + "/rest/v1/profiles?select=id", headers={"apikey": config["key"]})
check("anonymous profile access denied", status, 401, json.loads(body).get("code") == "42501")
status, body = request(config["url"] + "/rest/v1/rpc/record_lab",
                       headers={"apikey": config["key"], "Content-Type": "application/json"},
                       data=json.dumps({"lab": "sampling", "submission": {"weight": 5, "mean": 26}}))
check("anonymous grading RPC denied", status, 401)
status, body = request(origin + "/dashboard")
check("private dashboard redirects without session", status, 307)
status, body = request(origin + "/api/workspace",
                       headers={"Origin": origin, "Content-Type": "application/json"},
                       data=json.dumps({"action": "refresh", "payload": {}}))
check("unauthenticated workspace mutation denied", status, 401)
status, body = request(origin + "/api/workspace",
                       headers={"Origin": "https://attacker.invalid", "Content-Type": "application/json"},
                       data=json.dumps({"action": "refresh", "payload": {}}))
check("cross-origin mutation denied", status, 403)
status, body = request(origin + "/api/auth",
                       headers={"Origin": origin, "Content-Type": "application/x-www-form-urlencoded"},
                       data=urlencode({"action": "login", "email": secrets.token_hex(12) + "@example.invalid",
                                       "password": secrets.token_urlsafe(24)}))
check("unregistered credential login denied by live Auth", status, 401,
      "Email or password is incorrect" in body)
status, body = request(origin + "/signup")
check("configured signup form renders", status, 200, "Your account uses Supabase authentication" in body)
report = {"observed_at": datetime.now(timezone.utc).isoformat(), "origin": origin,
          "scope": "Configuration and negative HTTP checks only; email, successful sessions and file bytes not verified.",
          "checks": results, "passed": all(row["passed"] for row in results)}
print(json.dumps(report, indent=2))
sys.exit(0 if report["passed"] else 1)
