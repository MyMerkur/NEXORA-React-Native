import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  requestReferenceHandler,
  writeReferenceHandler,
  fulfillReferenceHandler,
  listIncomingRequestsHandler,
  listMyReferencesHandler,
  setReferenceVisibilityHandler,
} from "../controllers/reference.controller";

export const referenceRouter = Router();

referenceRouter.use(requireAuth);
referenceRouter.get("/references/requests/incoming", listIncomingRequestsHandler);
referenceRouter.post("/references/requests", requestReferenceHandler);
referenceRouter.post("/references/requests/:referenceId/fulfill", fulfillReferenceHandler);
referenceRouter.get("/references/me", listMyReferencesHandler);
referenceRouter.post("/references", writeReferenceHandler);
referenceRouter.patch("/references/:referenceId/visibility", setReferenceVisibilityHandler);
