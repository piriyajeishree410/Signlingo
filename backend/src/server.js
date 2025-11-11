import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
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

const PORT = process.env.PORT || 10000;

// ---------- CORS (only needed when calling from a different origin) ----------
const allowList = new Set(
  [
    process.env.CLIENT_ORIGIN,                  // e.g. https://your-frontend.example
    "http://localhost:5173",                    // Vite dev
    "http://localhost:3000",
  ].filter(Boolean)
);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowList.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader("Vary", "Origin");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader("Access-Control-Max-Age", "600");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

// ---------- Sessions ----------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 24 * 60 * 60,
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: false, // set true if you force HTTPS & need sameSite=None
    },
  })
);

// ---------- API Routes ----------
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/signs", signsRoutes);
app.use("/api/lessons", lessonsRoutes);
app.use("/api/user-lessons", userLessonsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/leaderboard", leaderboardRouter);

// ---------- Serve Frontend (production on Render) ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dist is at ../../frontend/dist relative to backend/src/server.js
const distDir = path.resolve(__dirname, "../../frontend/dist");

// Serve static assets
app.use(express.static(distDir));

// SPA fallback for non-API routes
app.get(/^\/(?!api)(.*)/, (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

// ---------- Boot ----------
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ MongoDB connected`);
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });
