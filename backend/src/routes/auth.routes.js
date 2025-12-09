// backend/src/routes/auth.routes.js
import express from "express";
import passport from "passport";
import {
  signup,
  logout,
  checkSession,
} from "../controllers/auth.controller.js";

const router = express.Router();

// SIGNUP (still manual)
router.post("/signup", signup);

// LOCAL LOGIN
router.post(
  "/login",
  passport.authenticate("local"),
  (req, res) => {
    res.json({ user: req.user });
  }
);

// GOOGLE LOGIN START
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// GOOGLE CALLBACK
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login",
  }),
  (req, res) => {
    console.log("After Google login, req.user =", req.user);
    res.redirect("http://localhost:5173/app/lessons");
  },
);

// LOGOUT
router.post("/logout", logout);

router.get("/check", checkSession);

export default router;

