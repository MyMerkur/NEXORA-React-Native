import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import {
  createHubSchema,
  hubMembershipCheckoutSchema,
  hubPostSchema,
  hubImageUploadUrlSchema,
  hubFeedQuerySchema,
  hubDiscoverQuerySchema,
} from "../validators/hub.validator";
import * as hubService from "../services/hub.service";

export async function createHubHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = createHubSchema.parse(req.body);
    const result = await hubService.createHub(req.user!.id, input);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function discoverHubsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const query = hubDiscoverQuerySchema.parse(req.query);
    const result = await hubService.discoverHubs(req.user!.id, query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listMyHubsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const hubs = await hubService.listMyHubs(req.user!.id);
    res.status(200).json({ hubs });
  } catch (error) {
    next(error);
  }
}

export async function listManagedHubsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const hubs = await hubService.listManagedHubs(req.user!.id);
    res.status(200).json({ hubs });
  } catch (error) {
    next(error);
  }
}

export async function getHubDetailHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await hubService.getHubDetail(req.params.hubId!, req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function joinFreeHubHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await hubService.joinFreeHub(req.user!.id, req.params.hubId!);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function startHubMembershipCheckoutHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const billingInfo = hubMembershipCheckoutSchema.parse(req.body);
    const result = await hubService.startHubMembershipCheckout(req.user!.id, req.params.hubId!, billingInfo);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function leaveHubHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await hubService.leaveHub(req.user!.id, req.params.hubId!);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function hubPostImageUploadUrlHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { contentType } = hubImageUploadUrlSchema.parse(req.body);
    const result = await hubService.requestHubPostImageUploadUrl(req.user!.id, contentType);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function createHubPostHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = hubPostSchema.parse(req.body);
    const result = await hubService.createHubPost(req.user!.id, req.params.hubId!, input);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listHubFeedHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const query = hubFeedQuerySchema.parse(req.query);
    const result = await hubService.listHubFeed(req.user!.id, req.params.hubId!, query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
