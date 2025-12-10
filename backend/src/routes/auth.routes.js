// backend/src/routes/auth.routes.js
import express from "express";
import passport from "passport";
import {
  signup,
  login,
  logout,
  checkSession,
} from "../controllers/auth.controller.js";

const router = express.Router();

// SIGNUP (still manual)
router.post("/signup", signup);

// LOCAL LOGIN
router.post("/login", login);

// GOOGLE LOGIN START
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// GOOGLE CALLBACK
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: process.env.FRONTEND_URL + "/login",
  }),
  async (req, res) => {
    console.log("After Google login, req.user =", req.user);

    req.session.userId = req.user._id;

    await new Promise((resolve) => req.session.save(resolve));

    const redirectUrl = process.env.FRONTEND_URL + "/app/lessons";
    return res.redirect(redirectUrl);
  },
);

// LOGOUT
router.post("/logout", logout);

router.get("/check", checkSession);

export default router;
