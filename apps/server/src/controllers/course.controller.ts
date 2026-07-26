import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { createCourseSchema } from "../validators/course.validator";
import * as courseService from "../services/course.service";

export async function createCourseHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = createCourseSchema.parse(req.body);
    const result = await courseService.createCourse(req.user!.id, input);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listCoursesHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const courses = await courseService.listCourses();
    res.status(200).json({ courses });
  } catch (error) {
    next(error);
  }
}

export async function listMyCoursesHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const courses = await courseService.listMyCourses(req.user!.id);
    res.status(200).json({ courses });
  } catch (error) {
    next(error);
  }
}

export async function enrollInCourseHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await courseService.enrollInCourse(req.user!.id, req.params.courseId!);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listMyEnrollmentsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const enrollments = await courseService.listMyEnrollments(req.user!.id);
    res.status(200).json({ enrollments });
  } catch (error) {
    next(error);
  }
}

export async function listCourseEnrollmentsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const enrollments = await courseService.listCourseEnrollments(req.user!.id, req.params.courseId!);
    res.status(200).json({ enrollments });
  } catch (error) {
    next(error);
  }
}

export async function completeEnrollmentHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await courseService.completeEnrollment(
      req.user!.id,
      req.params.courseId!,
      req.params.enrollmentId!,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
