import { Request, Response, NextFunction } from "express";
import { notifyActivity } from "../services/telegram-console";

// Paths to ignore (noisy/internal)
const IGNORED_PATHS = [
  "/api/health",
  "/api/storage/",
  "/favicon.ico",
];

// Paths that are too frequent on GET — only log mutations
const QUIET_GET_PATHS = [
  "/api/livestream",
  "/api/settings",
  "/api/maintenance",
  "/api/banners",
  "/api/ticker",
];

function shouldLog(method: string, path: string): boolean {
  // Always ignore health checks and static storage
  for (const ignored of IGNORED_PATHS) {
    if (path.startsWith(ignored)) return false;
  }

  // For quiet paths, only log non-GET
  if (method === "GET") {
    for (const quiet of QUIET_GET_PATHS) {
      if (path.startsWith(quiet)) return false;
    }
  }

  return true;
}

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  if (Array.isArray(forwarded)) return forwarded[0];
  return req.socket.remoteAddress || "unknown";
}

export function activityLogger(req: Request, res: Response, next: NextFunction) {
  const startAt = process.hrtime.bigint();
  const timestamp = new Date();
  const method = req.method;
  const path = req.originalUrl?.split("?")[0] || req.url?.split("?")[0] || "/";

  if (!shouldLog(method, path)) {
    next();
    return;
  }

  // Hook into response finish
  const originalEnd = res.end;
  res.end = function (this: Response, ...args: Parameters<typeof res.end>) {
    const durationNs = process.hrtime.bigint() - startAt;
    const durationMs = Number(durationNs / 1_000_000n);

    notifyActivity({
      method,
      path,
      statusCode: res.statusCode,
      durationMs,
      ip: getClientIp(req),
      userAgent: (req.headers["user-agent"] as string) || "",
      timestamp,
    });

    return originalEnd.apply(this, args);
  } as typeof res.end;

  next();
}
