import fs from "node:fs";
const entries = JSON.parse(fs.readFileSync("docs/traceability.json", "utf8"));
const results = entries.map((entry) => ({
  ...entry,
  missingFiles: entry.files.filter((file) => !fs.existsSync(file)),
}));
const report = {
  scope:
    "File-existence traceability check only. This does not prove feature completion or cloud acceptance.",
  requirements: results,
};
fs.mkdirSync("docs/evidence", { recursive: true });
fs.writeFileSync(
  "docs/evidence/alignment-check.json",
  JSON.stringify(report, null, 2) + "\n",
);
const failures = results.filter((r) => r.missingFiles.length);
console.log(
  `${results.length} requirements mapped; ${failures.length} missing-file mappings. Live acceptance remains separately reported.`,
);
if (failures.length) process.exitCode = 1;
