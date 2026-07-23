import { Types } from "mongoose";
import {
  createApplication as createApplicationRecord,
  findExisting,
  listByApplicant,
  listByJob,
  findApplicationById,
  updateStatus,
} from "../repositories/application.repository";
import { findJobById } from "../repositories/job.repository";
import { findUserById } from "../repositories/user.repository";
import type { ApplicationStatus } from "../models/Application";
import { HttpError } from "../utils/httpError";
import { resolveUserSummary, type UserSummarySource } from "../utils/userSummary";
import { notifyNewApplication, notifyApplicationStatusChange } from "./notification.service";

function serializeApplicationForApplicant(application: {
  _id: Types.ObjectId;
  message: string;
  status: ApplicationStatus;
  createdAt: Date;
  jobId: unknown;
}) {
  const job = application.jobId as unknown as { _id: Types.ObjectId; title: string; employerId: Types.ObjectId };
  return {
    id: application._id.toString(),
    message: application.message,
    status: application.status,
    createdAt: application.createdAt,
    job: { id: job._id.toString(), title: job.title, employerId: job.employerId.toString() },
  };
}

export async function applyToJob(userId: string, jobId: string, message?: string) {
  const job = await findJobById(jobId);
  if (!job) {
    throw new HttpError("İlan bulunamadı", 404);
  }
  if (job.status !== "open") {
    throw new HttpError("İlan artık başvuruya kapalı", 409);
  }
  if (job.employerId.toString() === userId) {
    throw new HttpError("Kendi ilanınıza başvuramazsınız", 400);
  }

  const jobObjectId = new Types.ObjectId(jobId);
  const applicantObjectId = new Types.ObjectId(userId);

  const existing = await findExisting(jobObjectId, applicantObjectId);
  if (existing) {
    throw new HttpError("Bu ilana zaten başvurdunuz", 409);
  }

  const created = await createApplicationRecord({
    jobId: jobObjectId,
    applicantId: applicantObjectId,
    message: message ?? "",
  });

  const applicant = await findUserById(userId);
  const applicantName = applicant ? applicant.showcase.displayName || applicant.email : "Bir kullanıcı";
  await notifyNewApplication(job.employerId.toString(), job.title, applicantName);

  return {
    id: created._id.toString(),
    message: created.message,
    status: created.status,
    createdAt: created.createdAt,
    job: { id: job._id.toString(), title: job.title },
  };
}

export async function listMyApplications(userId: string) {
  const applications = await listByApplicant(new Types.ObjectId(userId));
  return applications.map(serializeApplicationForApplicant);
}

export async function listJobApplications(userId: string, jobId: string) {
  const job = await findJobById(jobId);
  if (!job) {
    throw new HttpError("İlan bulunamadı", 404);
  }
  if (job.employerId.toString() !== userId) {
    throw new HttpError("Bu ilanın başvurularını görme yetkiniz yok", 403);
  }

  const applications = await listByJob(new Types.ObjectId(jobId));
  return Promise.all(
    applications.map(async (application) => {
      const applicant = await resolveUserSummary(application.applicantId as unknown as UserSummarySource);
      return {
        id: application._id.toString(),
        message: application.message,
        status: application.status,
        createdAt: application.createdAt,
        applicant,
      };
    }),
  );
}

export async function updateApplicationStatus(userId: string, applicationId: string, status: ApplicationStatus) {
  const application = await findApplicationById(applicationId);
  if (!application) {
    throw new HttpError("Başvuru bulunamadı", 404);
  }

  const job = await findJobById(application.jobId.toString());
  if (!job || job.employerId.toString() !== userId) {
    throw new HttpError("Bu başvuruyu yönetme yetkiniz yok", 403);
  }

  const updated = await updateStatus(applicationId, status);
  const applicantUser = await findUserById(application.applicantId.toString());
  const applicant = applicantUser ? await resolveUserSummary(applicantUser) : null;

  await notifyApplicationStatusChange(application.applicantId.toString(), job.title, status);

  return {
    id: updated!._id.toString(),
    message: updated!.message,
    status: updated!.status,
    createdAt: updated!.createdAt,
    applicant,
  };
}
