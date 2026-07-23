import { MongoMemoryServer } from "mongodb-memory-server";
import type { Express } from "express";
import mongoose from "mongoose";
import request from "supertest";

let mongoServer: MongoMemoryServer;
let app: Express;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.ATLAS_URI_DEV = mongoServer.getUri();
  process.env.JWT_ACCESS_SECRET = "test-access-secret";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret";

  const { connectDB } = await import("./config/db");
  await connectDB();
  app = (await import("./app")).default;
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Auth endpoints", () => {
  const credentials = { email: "test@nexora.dev", password: "supersecret123", role: "hekim" as const };

  it("registers a new user", async () => {
    const response = await request(app).post("/api/v1/auth/register").send(credentials);
    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe(credentials.email);
    expect(response.body.accessToken).toBeDefined();
  });

  it("rejects duplicate registration", async () => {
    const response = await request(app).post("/api/v1/auth/register").send(credentials);
    expect(response.status).toBe(409);
  });

  it("logs in with correct credentials", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: credentials.email, password: credentials.password });
    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
  });

  it("rejects login with wrong password", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: credentials.email, password: "wrongpassword" });
    expect(response.status).toBe(401);
  });
});
