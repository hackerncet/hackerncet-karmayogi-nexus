import { parentPort } from "node:worker_threads";
import { extractDocument, chunkSections } from "./documents";
parentPort?.once(
  "message",
  async (input: { bytes: Uint8Array; ext: string; name: string }) => {
    try {
      const sections = await extractDocument(
        Buffer.from(input.bytes),
        input.ext,
        input.name,
      );
      parentPort?.postMessage({ ok: true, chunks: chunkSections(sections) });
    } catch {
      parentPort?.postMessage({
        ok: false,
        error:
          "Document extraction failed or exceeded processing limits. Use a corrected document or a plain-text transcript.",
      });
    }
  },
);
