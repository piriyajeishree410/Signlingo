// backend/src/routes/auth.routes.js
import express from "express";
import {
  signup,
  login,
  logout,
  checkSession,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check", checkSession);

export default router;
