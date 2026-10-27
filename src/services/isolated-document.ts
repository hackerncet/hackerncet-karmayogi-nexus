import { Worker } from "node:worker_threads";
import path from "node:path";
import { HttpError } from "@/lib/http";
export function isolatedExtract(
  bytes: Buffer,
  ext: string,
  name: string,
): Promise<{ ordinal: number; location: string; content: string }[]> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      path.join(process.cwd(), "dist/document-worker.cjs"),
      {
        env: {},
        resourceLimits: {
          maxOldGenerationSizeMb: 128,
          maxYoungGenerationSizeMb: 32,
          stackSizeMb: 4,
        },
      },
    );
    const timer = setTimeout(() => {
      void worker.terminate();
      reject(
        new HttpError(
          422,
          "Extraction exceeded 20 seconds. Use a smaller document or transcript.",
        ),
      );
    }, 20000);
    const done = () => {
      clearTimeout(timer);
      void worker.terminate();
    };
    worker.once("message", (result) => {
      done();
      if (result.ok) resolve(result.chunks);
      else reject(new HttpError(422, result.error));
    });
    worker.once("error", () => {
      done();
      reject(new HttpError(422, "Isolated document processor failed."));
    });
    worker.once("exit", (code) => {
      if (code !== 0) {
        clearTimeout(timer);
        reject(
          new HttpError(422, "Document processor stopped before completion."),
        );
      }
    });
    worker.postMessage({ bytes, ext, name });
  });
}
