import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import postsRouter from "./posts";
import communitiesRouter from "./communities";
import eventsRouter from "./events";
import feedRouter from "./feed";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(postsRouter);
router.use(communitiesRouter);
router.use(eventsRouter);
router.use(feedRouter);

export default router;
