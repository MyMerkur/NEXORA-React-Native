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
  process.env.AUTH_RATE_LIMIT_MAX = "1000";

  const { connectDB } = await import("./config/db");
  await connectDB();
  app = (await import("./app")).default;
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

async function registerAndLogin(email: string, role = "hekim") {
  const response = await request(app)
    .post("/api/v1/auth/register")
    .send({ email, password: "Supersecret123", role });
  return { accessToken: response.body.accessToken as string, userId: response.body.user.id as string };
}

describe("Job endpoints", () => {
  it("rejects requests without an access token", async () => {
    const response = await request(app).get("/api/v1/jobs");
    expect(response.status).toBe(401);
  });

  it("rejects job creation for a non-employer role", async () => {
    const { accessToken } = await registerAndLogin("job-non-employer@nexora.dev", "hekim");

    const response = await request(app)
      .post("/api/v1/jobs")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Diş Hekimi aranıyor" });

    expect(response.status).toBe(403);
  });

  it("creates a job for an employer role", async () => {
    const { accessToken, userId } = await registerAndLogin("job-employer@nexora.dev", "klinik");

    const response = await request(app)
      .post("/api/v1/jobs")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Diş Hekimi aranıyor", location: "İstanbul", specialties: ["Ortodonti"] });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("open");
    expect(response.body.employer.id).toBe(userId);
  });

  it("lists only open jobs, newest first", async () => {
    const { accessToken } = await registerAndLogin("job-feed@nexora.dev", "firma");

    await request(app)
      .post("/api/v1/jobs")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Birinci ilan" });
    const secondResponse = await request(app)
      .post("/api/v1/jobs")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "İkinci ilan" });

    await request(app)
      .patch(`/api/v1/jobs/${secondResponse.body.id}/status`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ status: "closed" });

    const response = await request(app).get("/api/v1/jobs").set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.jobs.some((job: { title: string }) => job.title === "İkinci ilan")).toBe(false);
    expect(response.body.jobs.some((job: { title: string }) => job.title === "Birinci ilan")).toBe(true);
  });

  it("only allows the job owner to change its status", async () => {
    const { accessToken: ownerToken } = await registerAndLogin("job-owner@nexora.dev", "dernek");
    const { accessToken: otherToken } = await registerAndLogin("job-other@nexora.dev", "klinik");

    const created = await request(app)
      .post("/api/v1/jobs")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ title: "Asistan aranıyor" });

    const response = await request(app)
      .patch(`/api/v1/jobs/${created.body.id}/status`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ status: "closed" });

    expect(response.status).toBe(403);
  });

  it("returns the employer's own jobs regardless of status", async () => {
    const { accessToken } = await registerAndLogin("job-mine@nexora.dev", "klinik");

    await request(app).post("/api/v1/jobs").set("Authorization", `Bearer ${accessToken}`).send({ title: "İlan A" });

    const response = await request(app).get("/api/v1/jobs/mine").set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.jobs.length).toBeGreaterThanOrEqual(1);
  });
});
