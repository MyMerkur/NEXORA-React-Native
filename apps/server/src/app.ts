import express from "express";
import helmet from "helmet";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import { apiV1Router } from "./routes";
import { apiRateLimiter } from "./middlewares/rateLimiter";
import { errorHandler } from "./middlewares/errorHandler";
import { env } from "./config/env";

const app = express();

app.use(
  helmet({
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    crossOriginResourcePolicy: { policy: "same-site" },
  }),
);
app.use(
  cors({
    origin: env.CORS_ALLOWED_ORIGINS,
  }),
);
app.use(express.json());
app.use(mongoSanitize());
app.use(hpp());
app.use(apiRateLimiter);

app.use("/api/v1", apiV1Router);

app.use(errorHandler);

export default app;
