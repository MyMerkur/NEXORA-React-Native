import { Router } from "express";
import { healthRouter } from "./health.routes";
import { authRouter } from "./auth.routes";
import { kycRouter } from "./kyc.routes";
import { userRouter } from "./user.routes";
import { caseRouter } from "./case.routes";
import { jobRouter } from "./job.routes";
import { applicationRouter } from "./application.routes";
import { notificationRouter } from "./notification.routes";
import { orgRouter } from "./org.routes";
import { inboxRouter } from "./inbox.routes";

export const apiV1Router = Router();

apiV1Router.use(healthRouter);
apiV1Router.use(authRouter);
apiV1Router.use(kycRouter);
apiV1Router.use(userRouter);
apiV1Router.use(caseRouter);
apiV1Router.use(jobRouter);
apiV1Router.use(applicationRouter);
apiV1Router.use(notificationRouter);
apiV1Router.use(orgRouter);
apiV1Router.use(inboxRouter);
