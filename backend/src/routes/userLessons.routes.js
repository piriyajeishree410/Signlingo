import express from "express";
import {
  startLesson,
  getUserLessons,
  updateProgress,
  resetLesson,
  getAllUserLessons,
  getProgressForLesson,
} from "../controllers/userLessons.controller.js";

const router = express.Router();

router.get("/progress", getProgressForLesson);

router.get("/", getAllUserLessons);

// CREATE - start a new lesson
router.post("/start", startLesson);

// READ - get all lessons for user
router.get("/", getUserLessons);

// UPDATE - mark sign as done / complete lesson / add XP
router.put("/:lessonId/progress", updateProgress);

// DELETE - reset progress
router.delete("/:lessonId/reset", resetLesson);

export default router;
