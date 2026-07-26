import { randomUUID } from "crypto";
import { Types } from "mongoose";
import * as courseRepository from "../repositories/course.repository";
import * as enrollmentRepository from "../repositories/enrollment.repository";
import * as certificateRepository from "../repositories/certificate.repository";
import { findUserById } from "../repositories/user.repository";
import { resolveUserSummary, type UserSummarySource } from "../utils/userSummary";
import { getQrCodeDataUrl, buildVerificationUrl } from "./certificate.service";
import { notifyCourseEnrollment, notifyCertificateIssued } from "./notification.service";
import { HttpError } from "../utils/httpError";

const INSTRUCTOR_KYC_LEVEL = 4;

async function requireInstructor(userId: string) {
  const user = await findUserById(userId);
  if (!user) {
    throw new HttpError("Kullanıcı bulunamadı", 404);
  }
  if (user.kycLevel < INSTRUCTOR_KYC_LEVEL) {
    throw new HttpError("Bu özellik sadece eğitmenler için kullanılabilir", 403);
  }
  return user;
}

interface CreateCourseInput {
  title: string;
  description?: string;
  specialties?: string[];
}

export async function createCourse(userId: string, input: CreateCourseInput) {
  const user = await requireInstructor(userId);

  const created = await courseRepository.create({
    instructorId: new Types.ObjectId(userId),
    title: input.title,
    description: input.description ?? "",
    specialties: input.specialties ?? [],
  });

  return serializeCourse(created, await resolveUserSummary(user as unknown as UserSummarySource));
}

function serializeCourse(
  course: { _id: Types.ObjectId; title: string; description: string; specialties: string[]; createdAt: Date },
  instructor: Awaited<ReturnType<typeof resolveUserSummary>>,
) {
  return {
    id: course._id.toString(),
    title: course.title,
    description: course.description,
    specialties: course.specialties,
    instructor,
    createdAt: course.createdAt,
  };
}

export async function listCourses() {
  const courses = await courseRepository.listAll();
  return Promise.all(
    courses.map(async (course) =>
      serializeCourse(course, await resolveUserSummary(course.instructorId as unknown as UserSummarySource)),
    ),
  );
}

export async function listMyCourses(userId: string) {
  await requireInstructor(userId);
  const user = await findUserById(userId);
  const courses = await courseRepository.listByInstructor(new Types.ObjectId(userId));
  const instructor = await resolveUserSummary(user as unknown as UserSummarySource);
  return courses.map((course) => serializeCourse(course, instructor));
}

export async function enrollInCourse(userId: string, courseId: string) {
  const course = await courseRepository.findById(courseId);
  if (!course) {
    throw new HttpError("Kurs bulunamadı", 404);
  }

  const user = await findUserById(userId);
  if (!user) {
    throw new HttpError("Kullanıcı bulunamadı", 404);
  }
  if (user.kycLevel < 1) {
    throw new HttpError("Kursa katılmak için kimlik doğrulaması (Level 1) gerekli", 403);
  }
  if (course.instructorId.toString() === userId) {
    throw new HttpError("Kendi kursunuza katılamazsınız", 400);
  }

  const courseObjectId = new Types.ObjectId(courseId);
  const userObjectId = new Types.ObjectId(userId);

  const existing = await enrollmentRepository.findExisting(courseObjectId, userObjectId);
  if (existing) {
    throw new HttpError("Bu kursa zaten kayıtlısınız", 409);
  }

  const created = await enrollmentRepository.create({ courseId: courseObjectId, userId: userObjectId });

  const participantName = user.showcase.displayName || user.email;
  await notifyCourseEnrollment(course.instructorId.toString(), course.title, participantName);

  return { id: created._id.toString(), status: created.status, createdAt: created.createdAt };
}

async function serializeEnrollment(enrollment: {
  _id: Types.ObjectId;
  status: string;
  completedAt?: Date | null;
  createdAt: Date;
  courseId: unknown;
}) {
  const course = enrollment.courseId as unknown as { _id: Types.ObjectId; title: string; instructorId: Types.ObjectId };
  const certificate = await certificateRepository.findByEnrollmentId(enrollment._id);

  return {
    id: enrollment._id.toString(),
    status: enrollment.status,
    completedAt: enrollment.completedAt,
    createdAt: enrollment.createdAt,
    course: { id: course._id.toString(), title: course.title },
    certificate:
      certificate && !certificate.revoked
        ? {
            verificationCode: certificate.verificationCode,
            issuedAt: certificate.issuedAt,
            qrCodeDataUrl: await getQrCodeDataUrl(certificate.verificationCode),
            verificationUrl: buildVerificationUrl(certificate.verificationCode),
          }
        : null,
  };
}

export async function listMyEnrollments(userId: string) {
  const enrollments = await enrollmentRepository.listByUser(new Types.ObjectId(userId));
  return Promise.all(enrollments.map(serializeEnrollment));
}

export async function listCourseEnrollments(userId: string, courseId: string) {
  const course = await courseRepository.findById(courseId);
  if (!course) {
    throw new HttpError("Kurs bulunamadı", 404);
  }
  if (course.instructorId.toString() !== userId) {
    throw new HttpError("Bu kursun katılımcılarını görme yetkiniz yok", 403);
  }

  const enrollments = await enrollmentRepository.listByCourse(new Types.ObjectId(courseId));
  return Promise.all(
    enrollments.map(async (enrollment) => ({
      id: enrollment._id.toString(),
      status: enrollment.status,
      completedAt: enrollment.completedAt,
      createdAt: enrollment.createdAt,
      participant: await resolveUserSummary(enrollment.userId as unknown as UserSummarySource),
    })),
  );
}

export async function completeEnrollment(userId: string, courseId: string, enrollmentId: string) {
  const course = await courseRepository.findById(courseId);
  if (!course) {
    throw new HttpError("Kurs bulunamadı", 404);
  }
  if (course.instructorId.toString() !== userId) {
    throw new HttpError("Bu kursu yönetme yetkiniz yok", 403);
  }

  const enrollment = await enrollmentRepository.findById(enrollmentId);
  if (!enrollment || enrollment.courseId.toString() !== courseId) {
    throw new HttpError("Kayıt bulunamadı", 404);
  }
  if (enrollment.status === "completed") {
    throw new HttpError("Bu kayıt zaten tamamlandı olarak işaretli", 400);
  }

  const updated = await enrollmentRepository.markCompleted(enrollmentId);

  const issuedAt = new Date();
  await certificateRepository.create({
    enrollmentId: updated!._id,
    courseId: new Types.ObjectId(courseId),
    userId: enrollment.userId,
    verificationCode: randomUUID(),
    issuedAt,
  });

  await notifyCertificateIssued(enrollment.userId.toString(), course.title);

  return { id: updated!._id.toString(), status: updated!.status, completedAt: updated!.completedAt };
}
