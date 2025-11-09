// backend/src/routes/leaderboard.routes.js
import express from "express";
import { getTopPlayers } from "../controllers/leaderboard.controller.js";

const router = express.Router();

// GET /api/leaderboard/top?limit=10
router.get("/top", getTopPlayers);

export default router;
