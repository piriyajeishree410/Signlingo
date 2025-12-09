import express from "express";
import {
  getProfileOverview,
  updateProfile,
  deleteProfile,
} from "../controllers/profile.controller.js";
const router = express.Router();

// Dashboard-style overview (user + lessons progress + quiz stats)
router.get("/overview", getProfileOverview);

// You already had update & delete; leaving here for completeness
router.patch("/", updateProfile);
router.delete("/", deleteProfile);

export default router;
