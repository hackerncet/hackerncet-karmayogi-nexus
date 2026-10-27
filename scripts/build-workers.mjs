import { build } from "esbuild";
await build({
  entryPoints: ["src/services/document-worker.ts"],
  bundle: true,
  platform: "node",
  packages: "external",
  format: "cjs",
  outfile: "dist/document-worker.cjs",
});
