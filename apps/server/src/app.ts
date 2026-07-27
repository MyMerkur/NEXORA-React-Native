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

// express-rate-limit keys on req.ip. Behind the VPS reverse proxy (staging/production), every
// request otherwise resolves to the proxy's IP, turning per-client rate limits into one shared
// bucket for all users. Trust exactly one hop (the proxy in front of this process) — not an
// unbounded chain — and only outside local dev/test, where there's no real proxy to trust.
if (env.NODE_ENV === "staging" || env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

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
