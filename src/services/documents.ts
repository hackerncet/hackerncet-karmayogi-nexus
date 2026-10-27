import { z } from "zod";
import JSZip from "jszip";
import { HttpError } from "@/lib/http";
export const MAX_UPLOAD = 10 * 1024 * 1024;
const types: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain",
  md: "text/markdown",
  mp4: "video/mp4",
};
export function validateUpload(name: string, mime: string, size: number) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (
    !types[ext] ||
    !(mime === types[ext] || (ext === "md" && mime === "text/plain"))
  )
    throw new HttpError(
      415,
      "Supported: PDF, DOCX, PPTX, TXT, Markdown and MP4 with matching MIME type.",
    );
  if (size < 1 || size > MAX_UPLOAD)
    throw new HttpError(413, "Upload must be between 1 byte and 10 MiB.");
  return ext;
}
type Section = { location: string; text: string };
export function chunkSections(sections: Section[]) {
  const result: { ordinal: number; location: string; content: string }[] = [];
  for (const s of sections) {
    const text = s.text.replace(/\u0000/g, "").trim();
    for (let start = 0; start < text.length; start += 1300) {
      const content = text.slice(start, start + 1600).trim();
      if (content)
        result.push({
          ordinal: result.length,
          location: `${s.location} · characters ${start + 1}–${Math.min(start + 1600, text.length)}`,
          content,
        });
    }
  }
  if (!result.length)
    throw new HttpError(
      422,
      "No readable text was extracted. Scanned PDFs need an approved OCR adapter.",
    );
  if (result.length > 2000)
    throw new HttpError(
      413,
      "Extracted document exceeds the safe processing limit.",
    );
  return result;
}
export async function extractDocument(
  bytes: Buffer,
  ext: string,
  name: string,
): Promise<Section[]> {
  if (ext === "mp4")
    throw new HttpError(
      422,
      "Video transcription is not configured. Upload a TXT/Markdown transcript instead.",
    );
  if (ext === "txt" || ext === "md") {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return [{ location: `${name} · text`, text }];
  }
  if (ext === "pdf") {
    if (bytes.subarray(0, 5).toString() !== "%PDF-")
      throw new HttpError(415, "PDF signature mismatch.");
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: bytes });
    try {
      const result = await parser.getText();
      if (result.pages.length > 200)
        throw new HttpError(413, "Maximum 200 pages.");
      return result.pages.map((p) => ({
        location: `${name} · page ${p.num}`,
        text: p.text,
      }));
    } finally {
      await parser.destroy();
    }
  }
  if (ext === "docx" || ext === "pptx") {
    if (bytes[0] !== 0x50 || bytes[1] !== 0x4b)
      throw new HttpError(415, "Office file signature mismatch.");
    const zip = await JSZip.loadAsync(bytes, { checkCRC32: false });
    const entries = Object.values(zip.files);
    if (entries.length > 1200)
      throw new HttpError(413, "Office archive has too many entries.");
    // Inspect central-directory sizes before decompression to prevent zip bombs.
    let expanded = 0;
    for (let p = 0; p < bytes.length - 46; p++) {
      if (bytes.readUInt32LE(p) === 0x02014b50) {
        expanded += bytes.readUInt32LE(p + 24);
        if (expanded > 40 * 1024 * 1024)
          throw new HttpError(413, "Expanded document exceeds 40 MiB.");
      }
    }
    // Bound actual decompressed bytes too; central-directory sizes are untrusted.
    let actual = 0;
    for (const entry of entries) {
      if (entry.dir) continue;
      const stream = entry.nodeStream();
      await new Promise<void>((resolve, reject) => {
        stream.on("data", (part: Buffer) => {
          actual += part.length;
          if (actual > 40 * 1024 * 1024) {
            stream.pause();
            reject(
              new HttpError(413, "Actual expanded document exceeds 40 MiB."),
            );
          }
        });
        stream.once("end", () => resolve());
        stream.once("error", reject);
      });
    }
    if (ext === "docx") {
      if (!zip.file("word/document.xml"))
        throw new HttpError(415, "DOCX structure is invalid.");
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer: bytes });
      return [
        {
          location: `${name} · document (page locations unavailable)`,
          text: result.value,
        },
      ];
    }
    const slides = entries
      .filter((e) => /^ppt\/slides\/slide\d+\.xml$/.test(e.name))
      .sort(
        (a, b) =>
          Number(a.name.match(/slide(\d+)/)?.[1]) -
          Number(b.name.match(/slide(\d+)/)?.[1]),
      );
    if (!slides.length || slides.length > 200)
      throw new HttpError(422, "PPTX requires 1–200 slides.");
    return Promise.all(
      slides.map(async (s) => ({
        location: `${name} · slide ${s.name.match(/slide(\d+)/)?.[1]}`,
        text: (await s.async("string"))
          .replace(/<\/a:p>/g, "\n")
          .replace(/<[^>]+>/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">"),
      })),
    );
  }
  throw new HttpError(415, "Unsupported document");
}
export const generationInput = z.object({
  materialId: z.uuid(),
  count: z.number().int().min(1).max(10),
  difficulty: z.number().int().min(1).max(5),
  type: z.enum(["single", "multiple", "true-false", "scenario"]),
  competencyId: z.string(),
  language: z.enum(["English", "Hindi"]),
  objective: z.string().max(500),
});
