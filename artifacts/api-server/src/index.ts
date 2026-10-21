import app from "./app";
import { logger } from "./lib/logger";
import { startAutoSync } from "./lib/telegram-sync";
import { startTelegramConsole } from "./services/telegram-console";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Start automatic Telegram sync every 5 minutes
  startAutoSync(5);
  logger.info("Telegram auto-sync started (every 5 minutes)");

  // Start Telegram monitoring console bot
  startTelegramConsole();
  logger.info("Telegram monitoring console started");
});
