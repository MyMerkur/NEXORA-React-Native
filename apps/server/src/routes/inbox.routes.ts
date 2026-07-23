import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  startThreadHandler,
  listThreadsHandler,
  listMessagesHandler,
  sendMessageHandler,
  getUnreadThreadCountHandler,
} from "../controllers/inbox.controller";

export const inboxRouter = Router();

inboxRouter.use(requireAuth);
inboxRouter.get("/inbox/unread-count", getUnreadThreadCountHandler);
inboxRouter.post("/inbox/threads", startThreadHandler);
inboxRouter.get("/inbox/threads", listThreadsHandler);
inboxRouter.get("/inbox/threads/:threadId/messages", listMessagesHandler);
inboxRouter.post("/inbox/threads/:threadId/messages", sendMessageHandler);
