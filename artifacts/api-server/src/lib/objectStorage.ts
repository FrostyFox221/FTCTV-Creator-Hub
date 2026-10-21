import { randomUUID } from "crypto";
import { mkdir, writeFile, readFile, access, readdir } from "fs/promises";
import path from "path";
import { constants } from "fs";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class LocalStorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = UPLOAD_DIR;
  }

  async ensureDir(): Promise<void> {
    await mkdir(this.uploadDir, { recursive: true });
  }

  /**
   * Generate a unique object ID for upload.
   * Returns the local path where the file will be stored.
   */
  async generateUploadId(): Promise<{ objectId: string; objectPath: string }> {
    await this.ensureDir();
    const objectId = randomUUID();
    const objectPath = `/objects/${objectId}`;
    return { objectId, objectPath };
  }

  /**
   * Save file data to local storage.
   */
  async saveFile(objectId: string, data: Buffer, ext?: string): Promise<string> {
    await this.ensureDir();
    const fileName = ext ? `${objectId}${ext}` : objectId;
    const filePath = path.join(this.uploadDir, fileName);
    await writeFile(filePath, data);
    return `/api/storage/objects/${fileName}`;
  }

  /**
   * Read a file from local storage by its ID/name.
   */
  async readFile(objectName: string): Promise<Buffer> {
    // Sanitize: prevent directory traversal
    const sanitized = path.basename(objectName);
    const filePath = path.join(this.uploadDir, sanitized);

    try {
      await access(filePath, constants.R_OK);
      return readFile(filePath);
    } catch {
      // File not found — try matching with extension (uuid -> uuid.jpg, etc.)
    }

    // Fallback: search for files starting with the sanitized name
    try {
      const files = await readdir(this.uploadDir);
      const match = files.find((f) => f.startsWith(sanitized + ".") || f === sanitized);
      if (match) {
        const matchPath = path.join(this.uploadDir, match);
        return readFile(matchPath);
      }
    } catch {
      // readdir failed
    }

    throw new ObjectNotFoundError();
  }

  /**
   * Resolve the actual filename on disk (with extension) for a given objectName.
   */
  async resolveFileName(objectName: string): Promise<string | null> {
    const sanitized = path.basename(objectName);
    const filePath = path.join(this.uploadDir, sanitized);

    try {
      await access(filePath, constants.R_OK);
      return sanitized;
    } catch {
      // try with extension
    }

    try {
      const files = await readdir(this.uploadDir);
      const match = files.find((f) => f.startsWith(sanitized + ".") || f === sanitized);
      return match || null;
    } catch {
      return null;
    }
  }

  /**
   * Check if a file exists.
   */
  async exists(objectName: string): Promise<boolean> {
    const sanitized = path.basename(objectName);
    const filePath = path.join(this.uploadDir, sanitized);
    try {
      await access(filePath, constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get mime type from extension.
   */
  getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".pdf": "application/pdf",
    };
    return mimes[ext] || "application/octet-stream";
  }
}

export const localStorageService = new LocalStorageService();
