import { Router, type IRouter } from "express";
import healthRouter from "./health";
import postsRouter from "./posts";
import adminRouter from "./admin";
import telegramRouter from "./telegram";
import livestreamRouter from "./livestream";
import settingsRouter from "./settings";
import maintenanceRouter from "./maintenance";

const router: IRouter = Router();

router.use(healthRouter);
router.use(postsRouter);
router.use(adminRouter);
router.use(telegramRouter);
router.use(livestreamRouter);
router.use(settingsRouter);
router.use(maintenanceRouter);

export default router;
