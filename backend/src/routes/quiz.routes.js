import express from "express";
import {
  startQuiz,
  answerQuestion,
  finishQuiz,
  quizStatus,
  resetProgress,
} from "../controllers/quiz.controller.js";

const router = express.Router();

// All routes depend on cookie-session. No axios/cors libs.
router.get("/status", quizStatus);
router.post("/reset", resetProgress);

router.post("/start", startQuiz);
router.post("/answer", answerQuestion);
router.post("/finish", finishQuiz);

export default router;
