import { env } from "./config/env";
import { connectDB } from "./config/db";
import { logger } from "./utils/logger";
import app from "./app";

async function bootstrap() {
  await connectDB();

  app.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  logger.error("Failed to start server", error);
  process.exit(1);
});
