import express from "express";
import helmet from "helmet";
import cors from "cors";
import { apiV1Router } from "./routes";
import { apiRateLimiter } from "./middlewares/rateLimiter";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(apiRateLimiter);

app.use("/api/v1", apiV1Router);

app.use(errorHandler);

export default app;
