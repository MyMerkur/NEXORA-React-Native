import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { startThreadSchema, sendMessageSchema, cursorQuerySchema } from "../validators/inbox.validator";
import * as inboxService from "../services/inbox.service";

export async function startThreadHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = startThreadSchema.parse(req.body);
    const context = input.contextType ? { type: input.contextType, id: input.contextId } : undefined;
    const result = await inboxService.startOrGetThread(req.user!.id, input.targetUserId, context);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listThreadsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { cursor } = cursorQuerySchema.parse(req.query);
    const result = await inboxService.listThreads(req.user!.id, cursor);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listMessagesHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { cursor } = cursorQuerySchema.parse(req.query);
    const result = await inboxService.listMessages(req.user!.id, req.params.threadId!, cursor);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function sendMessageHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { body } = sendMessageSchema.parse(req.body);
    const result = await inboxService.sendMessage(req.user!.id, req.params.threadId!, body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getUnreadThreadCountHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await inboxService.getUnreadThreadCount(req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
