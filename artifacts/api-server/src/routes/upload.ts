import { Router, type Request, type Response } from "express";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const router = Router();

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

/**
 * POST /upload
 * Direct file upload via multipart/form-data (raw body approach).
 * Saves file to local disk and returns a URL.
 */
router.post("/upload", async (req: Request, res: Response) => {
  try {
    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("multipart/form-data")) {
      res.status(400).json({ error: "Expected multipart/form-data" });
      return;
    }

    // Collect raw body
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    const body = Buffer.concat(chunks);

    // Parse boundary
    const boundaryMatch = contentType.match(/boundary=(.+)/);
    if (!boundaryMatch) {
      res.status(400).json({ error: "No boundary found" });
      return;
    }
    const boundary = boundaryMatch[1].trim();

    // Simple multipart parser
    const boundaryBuffer = Buffer.from(`--${boundary}`);
    const parts = [];
    let start = body.indexOf(boundaryBuffer) + boundaryBuffer.length;

    while (true) {
      const nextBoundary = body.indexOf(boundaryBuffer, start);
      if (nextBoundary === -1) break;
      parts.push(body.slice(start, nextBoundary));
      start = nextBoundary + boundaryBuffer.length;
    }

    // Find file part
    let fileData: Buffer | null = null;
    let fileName = "upload";
    let mimeType = "application/octet-stream";

    for (const part of parts) {
      const headerEnd = part.indexOf("\r\n\r\n");
      if (headerEnd === -1) continue;
      const headers = part.slice(0, headerEnd).toString();
      if (!headers.includes("filename=")) continue;

      const nameMatch = headers.match(/filename="([^"]+)"/);
      if (nameMatch) fileName = nameMatch[1];

      const typeMatch = headers.match(/Content-Type:\s*(.+)/i);
      if (typeMatch) mimeType = typeMatch[1].trim();

      // +4 for \r\n\r\n, -2 for trailing \r\n
      fileData = part.slice(headerEnd + 4, part.length - 2);
      break;
    }

    if (!fileData) {
      res.status(400).json({ error: "No file found in request" });
      return;
    }

    // Validate: images, video (mp4/webm), PDF
    const allowedMimes = [
      "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
      "video/mp4", "video/webm",
      "application/pdf",
    ];
    if (!allowedMimes.includes(mimeType) && !mimeType.startsWith("image/")) {
      res.status(400).json({ error: "File type not allowed" });
      return;
    }
    const isVideo = mimeType === "video/mp4" || mimeType === "video/webm";
    const maxSize = isVideo ? 500 * 1024 * 1024 : 50 * 1024 * 1024; // 500MB video, 50MB other
    if (fileData.length > maxSize) {
      res.status(400).json({ error: isVideo ? "File too large (max 500MB)" : "File too large (max 50MB)" });
      return;
    }

    // Save file
    await mkdir(UPLOAD_DIR, { recursive: true });
    const ext = path.extname(fileName) || ".jpg";
    const id = randomUUID();
    const savedName = `${id}${ext}`;
    await writeFile(path.join(UPLOAD_DIR, savedName), fileData);

    const url = `/api/uploads/${savedName}`;
    res.json({ url, name: fileName, size: fileData.length });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

// Serve uploaded files
router.get("/uploads/:filename", async (req: Request, res: Response) => {
  const filename = req.params.filename as string;
  // Sanitize
  if (filename.includes("..") || filename.includes("/")) {
    res.status(400).json({ error: "Invalid filename" });
    return;
  }
  const filePath = path.join(UPLOAD_DIR, filename);
  try {
    const { readFile } = await import("fs/promises");
    const data = await readFile(filePath);
    // Simple mime detection from extension
    const ext = path.extname(filename).toLowerCase();
    const mimes: Record<string, string> = {
      ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
      ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml",
      ".mp4": "video/mp4", ".webm": "video/webm", ".pdf": "application/pdf",
    };
    res.setHeader("Content-Type", mimes[ext] || "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=604800");
    res.send(data);
  } catch {
    res.status(404).json({ error: "File not found" });
  }
});

export default router;
