import express from "express";
import {
  getProfileOverview,
  updateProfile,
  deleteProfile,
} from "../controllers/profile.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
const router = express.Router();

// Dashboard-style overview (user + lessons progress + quiz stats)
router.get("/overview", requireAuth, getProfileOverview);

// You already had update & delete; leaving here for completeness
router.patch("/", requireAuth, updateProfile);
router.delete("/", requireAuth, deleteProfile);

export default router;
