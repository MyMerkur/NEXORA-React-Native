import { Router } from "express";
import { loginHandler, registerHandler, refreshHandler, logoutHandler } from "../controllers/auth.controller";
import { authRateLimiter } from "../middlewares/rateLimiter";

export const authRouter = Router();

authRouter.post("/auth/register", authRateLimiter, registerHandler);
authRouter.post("/auth/login", authRateLimiter, loginHandler);
authRouter.post("/auth/refresh", authRateLimiter, refreshHandler);
authRouter.post("/auth/logout", logoutHandler);
