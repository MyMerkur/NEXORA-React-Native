import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  createCourseHandler,
  listCoursesHandler,
  listMyCoursesHandler,
  enrollInCourseHandler,
  listMyEnrollmentsHandler,
  listCourseEnrollmentsHandler,
  completeEnrollmentHandler,
} from "../controllers/course.controller";

export const courseRouter = Router();

courseRouter.use(requireAuth);
courseRouter.post("/courses", createCourseHandler);
courseRouter.get("/courses", listCoursesHandler);
courseRouter.get("/courses/mine", listMyCoursesHandler);
courseRouter.post("/courses/:courseId/enroll", enrollInCourseHandler);
courseRouter.get("/enrollments/mine", listMyEnrollmentsHandler);
courseRouter.get("/courses/:courseId/enrollments", listCourseEnrollmentsHandler);
courseRouter.post("/courses/:courseId/enrollments/:enrollmentId/complete", completeEnrollmentHandler);
