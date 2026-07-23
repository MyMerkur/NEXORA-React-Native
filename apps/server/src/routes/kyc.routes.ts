import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { requestUploadUrlHandler, confirmUploadHandler, listDocumentsHandler } from "../controllers/kyc.controller";

export const kycRouter = Router();

kycRouter.use(requireAuth);
kycRouter.post("/kyc/documents/upload-url", requestUploadUrlHandler);
kycRouter.post("/kyc/documents", confirmUploadHandler);
kycRouter.get("/kyc/documents", listDocumentsHandler);
