import Busboy from "busboy";
import type { IncomingMessage } from "http";

export function parsePhotoUploads(req: IncomingMessage): Promise<Buffer[]> {
  return new Promise((resolve, reject) => {
    const contentType = req.headers["content-type"];
    console.log(`[parseMultipart] content-type=${contentType} content-length=${req.headers["content-length"]}`);
    if (!contentType || !contentType.includes("multipart/form-data")) {
      reject(new Error("Expected multipart/form-data request"));
      return;
    }

    const busboy = Busboy({
      headers: { "content-type": contentType },
      limits: { fileSize: 8 * 1024 * 1024, files: 10 },
    });

    const buffers: Buffer[] = [];

    busboy.on("file", (fieldname, file, info) => {
      const chunks: Buffer[] = [];
      console.log(`[parseMultipart] file part: field=${fieldname} filename=${info.filename} mimeType=${info.mimeType}`);
      file.on("data", (chunk: Buffer) => chunks.push(chunk));
      file.on("limit", () => console.log(`[parseMultipart] file hit size limit: ${info.filename}`));
      file.on("end", () => {
        const buf = Buffer.concat(chunks);
        console.log(`[parseMultipart] file complete: ${info.filename} bytes=${buf.length}`);
        buffers.push(buf);
      });
    });

    busboy.on("error", (err) => {
      console.log(`[parseMultipart] busboy error:`, err);
      reject(err);
    });
    busboy.on("finish", () => {
      console.log(`[parseMultipart] finished, total files=${buffers.length}`);
      resolve(buffers);
    });

    req.pipe(busboy);
  });
}
