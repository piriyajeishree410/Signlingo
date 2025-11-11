import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
import { connectDB } from "./db/mongoClient.js";
import authRoutes from "./routes/auth.routes.js";
import userLessonsRoutes from "./routes/userLessons.routes.js";
import lessonsRoutes from "./routes/lessons.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import signsRoutes from "./routes/signs.routes.js"; // <-- add this
import profileRoutes from "./routes/profile.routes.js";
import leaderboardRouter from "./routes/leaderboard.routes.js";

dotenv.config();

const app = express();
app.use(express.json());

const ALLOWED_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
//   res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   if (req.method === "OPTIONS") return res.sendStatus(200);
//   next();
// });

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === ALLOWED_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
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

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

// --- Session setup --- (should be before routes)
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
      sameSite: "none",   
      secure: true, 
    },
  })
);

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/signs", signsRoutes);
app.get("/", (req, res) => res.send("SignLingo backend running"));
app.use("/api/lessons", lessonsRoutes);
app.use("/api/user-lessons", userLessonsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/leaderboard", leaderboardRouter);

const PORT = process.env.PORT || 5000;

// --- Connect to DB, then start the server ---
connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection failed:", err));
