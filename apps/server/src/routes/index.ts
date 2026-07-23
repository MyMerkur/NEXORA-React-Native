import { Router } from "express";
import { healthRouter } from "./health.routes";
import { authRouter } from "./auth.routes";
import { kycRouter } from "./kyc.routes";
import { userRouter } from "./user.routes";
import { caseRouter } from "./case.routes";
import { jobRouter } from "./job.routes";
import { applicationRouter } from "./application.routes";

export const apiV1Router = Router();

apiV1Router.use(healthRouter);
apiV1Router.use(authRouter);
apiV1Router.use(kycRouter);
apiV1Router.use(userRouter);
apiV1Router.use(caseRouter);
apiV1Router.use(jobRouter);
apiV1Router.use(applicationRouter);
