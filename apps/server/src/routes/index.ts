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
import { matchingRouter } from "./matching.routes";
import { referenceRouter } from "./reference.routes";
import { profileRouter } from "./profile.routes";
import { subscriptionRouter } from "./subscription.routes";
import { paymentRouter } from "./payment.routes";
import { instructorInviteRouter } from "./instructorInvite.routes";
import { instagramRouter } from "./instagram.routes";

export const apiV1Router = Router();

apiV1Router.use(healthRouter);
apiV1Router.use(authRouter);
// paymentRouter and instagramRouter have public routes (iyzico server-to-server callback,
// Instagram's OAuth redirect) — every other router below applies a blanket requireAuth that
// runs for ANY path reaching it, so these must stay registered before them or their public
// routes get 401'd before they're ever matched. instagramRouter itself applies requireAuth
// per-route (not blanket) since most of its routes still need auth.
apiV1Router.use(paymentRouter);
apiV1Router.use(instagramRouter);
apiV1Router.use(kycRouter);
apiV1Router.use(userRouter);
apiV1Router.use(caseRouter);
apiV1Router.use(jobRouter);
apiV1Router.use(applicationRouter);
apiV1Router.use(notificationRouter);
apiV1Router.use(orgRouter);
apiV1Router.use(inboxRouter);
apiV1Router.use(matchingRouter);
apiV1Router.use(referenceRouter);
apiV1Router.use(profileRouter);
apiV1Router.use(subscriptionRouter);
apiV1Router.use(instructorInviteRouter);
