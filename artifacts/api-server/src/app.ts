import express, { type Express } from "express";
import cors from "cors";
import compression from "compression";
import pinoHttp from "pino-http";
import router from "./routes";
import { startRssFetcher } from "./services/rss-fetcher";
import { logger } from "./lib/logger";
import { activityLogger } from "./middlewares/activity-logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(activityLogger);
app.use("/api", router);

// Start RSS hourly news fetcher
startRssFetcher();

export default app;
