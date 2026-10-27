// Reproducible Linux fallback when the Playwright CDN cannot be downloaded.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createRequire } from "node:module";
import { brotliDecompressSync } from "node:zlib";
import { execFileSync, spawnSync } from "node:child_process";
const require = createRequire(import.meta.url);
const root = path.dirname(path.dirname(require.resolve("@sparticuz/chromium")));
const output = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-test-browser-"));
try {
  for (const file of [
    "chromium.br",
    "al2023.tar.br",
    "fonts.tar.br",
    "swiftshader.tar.br",
  ]) {
    const target = path.join(output, file.replace(/\.br$/, ""));
    fs.writeFileSync(
      target,
      brotliDecompressSync(fs.readFileSync(path.join(root, "bin", file))),
    );
    if (file.endsWith(".tar.br"))
      execFileSync("tar", ["--no-same-owner", "-xf", target, "-C", output]);
  }
  const executable = path.join(output, "chromium");
  fs.chmodSync(executable, 0o755);
  const cli = path.join(
    path.dirname(require.resolve("@playwright/test/package.json")),
    "cli.js",
  );
  const result = spawnSync(
    process.execPath,
    [cli, "test", ...process.argv.slice(2)],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        PLAYWRIGHT_CHROMIUM_EXECUTABLE: executable,
        FONTCONFIG_PATH: path.join(output, "fonts"),
        LD_LIBRARY_PATH: [
          path.join(output, "lib"),
          output,
          process.env.LD_LIBRARY_PATH ?? "",
        ]
          .filter(Boolean)
          .join(":"),
      },
    },
  );
  process.exitCode = result.status ?? 1;
} finally {
  fs.rmSync(output, { recursive: true, force: true });
}
