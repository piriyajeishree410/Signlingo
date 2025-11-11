// backend/src/server.js
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { connectDB } from "./db/mongoClient.js";
import authRoutes from "./routes/auth.routes.js";
import userLessonsRoutes from "./routes/userLessons.routes.js";
import lessonsRoutes from "./routes/lessons.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import signsRoutes from "./routes/signs.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import leaderboardRouter from "./routes/leaderboard.routes.js";

dotenv.config();

const app = express();
app.use(express.json());

// --- Basics & CORS ---
const ALLOWED_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const PORT = process.env.PORT || 10000;

// If behind a proxy (Render), trust the first proxy so secure cookies work
app.set("trust proxy", 1);

// Health first (so Render can hit it even if static is misconfigured)
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// CORS (keep for local dev; same-origin prod won’t need it but harmless)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader("Access-Control-Max-Age", "600"); // cache preflight 10m
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

// --- Sessions (before routes) ---
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 24 * 60 * 60, // 1 day
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production", // works on Render with trust proxy
    },
  })
);

// --- API routes ---
app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/signs", signsRoutes);
app.use("/api/lessons", lessonsRoutes);
app.use("/api/user-lessons", userLessonsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/leaderboard", leaderboardRouter);

// --- Serve React build (after API routes) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, "../../frontend/dist");

// Serve static assets
app.use(express.static(distDir));

// SPA fallback for any non-API route → index.html
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

// --- Start server after DB connect ---
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ MongoDB connected`);
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📦 Serving React from: ${distDir}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });
