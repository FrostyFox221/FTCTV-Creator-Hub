import { Router, type IRouter, type Request, type Response } from "express";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import {
  LocalStorageService,
  ObjectNotFoundError,
  localStorageService,
} from "../lib/objectStorage";

const router: IRouter = Router();

/**
 * POST /storage/uploads/request-url
 *
 * Instead of returning a presigned URL (Replit/GCS),
 * we now return an internal upload endpoint that accepts the file directly.
 * The client should PUT the file to the returned uploadURL.
 */
router.post("/storage/uploads/request-url", async (req: Request, res: Response) => {
  try {
    const { objectId, objectPath } = await localStorageService.generateUploadId();

    // Return a local PUT URL for the client to upload to
    const uploadURL = `/api/storage/put/${objectId}`;

    res.json({
      uploadURL,
      objectPath,
      metadata: req.body,
    });
  } catch (error) {
    req.log.error({ err: error }, "Error generating upload URL");
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

/**
 * PUT /storage/put/:objectId
 *
 * Accepts the raw file body and saves it to disk.
 * This replaces the old presigned URL upload to GCS.
 */
router.put("/storage/put/:objectId", async (req: Request, res: Response) => {
  try {
    const { objectId } = req.params;
    if (!objectId || objectId.includes("..") || objectId.includes("/")) {
      res.status(400).json({ error: "Invalid object ID" });
      return;
    }

    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    const data = Buffer.concat(chunks);

    if (data.length === 0) {
      res.status(400).json({ error: "Empty body" });
      return;
    }

    // Max 10MB
    if (data.length > 10 * 1024 * 1024) {
      res.status(413).json({ error: "File too large (max 10MB)" });
      return;
    }

    // Detect extension from Content-Type
    const contentType = req.headers["content-type"] || "";
    const extMap: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
      "image/svg+xml": ".svg",
      "video/mp4": ".mp4",
      "video/webm": ".webm",
      "application/pdf": ".pdf",
    };
    const ext = extMap[contentType] || "";

    await localStorageService.saveFile(objectId, data, ext);

    res.status(200).json({ ok: true });
  } catch (error) {
    req.log.error({ err: error }, "Error saving uploaded file");
    res.status(500).json({ error: "Upload failed" });
  }
});

/**
 * GET /storage/objects/*
 *
 * Serve uploaded files from local disk.
 */
router.get("/storage/objects/*path", async (req: Request, res: Response) => {
  try {
    const raw = req.params.path;
    const objectName = Array.isArray(raw) ? raw.join("/") : raw;

    if (!objectName || objectName.includes("..")) {
      res.status(400).json({ error: "Invalid path" });
      return;
    }

    const data = await localStorageService.readFile(objectName);
    const mimeType = localStorageService.getMimeType(objectName);

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Length", data.length);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(data);
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "File not found" });
      return;
    }
    req.log.error({ err: error }, "Error serving object");
    res.status(500).json({ error: "Failed to serve file" });
  }
});

/**
 * GET /storage/public-objects/*
 *
 * Same as /storage/objects/* — on local storage there's no distinction.
 */
router.get("/storage/public-objects/*filePath", async (req: Request, res: Response) => {
  try {
    const raw = req.params.filePath;
    const objectName = Array.isArray(raw) ? raw.join("/") : raw;

    if (!objectName || objectName.includes("..")) {
      res.status(400).json({ error: "Invalid path" });
      return;
    }

    const data = await localStorageService.readFile(objectName);
    const mimeType = localStorageService.getMimeType(objectName);

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Length", data.length);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(data);
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "File not found" });
      return;
    }
    req.log.error({ err: error }, "Error serving public object");
    res.status(500).json({ error: "Failed to serve file" });
  }
});

export default router;
