import express from "express";
import {
  startLesson,
  getUserLessons,
  updateProgress,
  resetLesson,
  getAllUserLessons,
  getProgressForLesson,
} from "../controllers/userLessons.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/progress",requireAuth, getProgressForLesson);

router.get("/",requireAuth, getAllUserLessons);

// CREATE - start a new lesson
router.post("/start",requireAuth, startLesson);

// READ - get all lessons for user
router.get("/",requireAuth, getUserLessons);

// UPDATE - mark sign as done / complete lesson / add XP
router.put("/:lessonId/progress",requireAuth, updateProgress);

// DELETE - reset progress
router.delete("/:lessonId/reset",requireAuth, resetLesson);

export default router;
