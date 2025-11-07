import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Flashscreen from "./pages/Flashscreen.jsx";
import AuthPage from "./pages/Auth/AuthPage.jsx";
import AppShell from "./layouts/AppShell.jsx";
import ProfilePage from "./pages/Profile/ProfilePage.jsx";
import QuizSelectPage from "./pages/Quizzes/QuizSelectPage.jsx";
import QuizPlayPage from "./pages/Quizzes/QuizPlayPage.jsx";
import LivePracticePage from "./pages/Live/LivePracticePage.jsx";
import LeaderboardPage from "./pages/Leaderboard/LeaderboardPage.jsx";
import LessonsPage from "./pages/Lessons/LessonsPage.jsx";
import LessonViewPage from "./pages/Lessons/LessonViewPage.jsx";
import CharactersPage from "./pages/Characters/CharactersPage.jsx";

/* Minimal placeholder pages for other routes */
const Stub = (t) => () => (
  <div style={{ fontSize: 24, fontWeight: 800, padding: "2rem" }}>{t}</div>
);

const QuizzesPage = Stub("Quizzes");
const LivePage = Stub("Live Practice");

export default function App() {
  return (
    <Routes>
      {/* Landing + Auth routes */}
      <Route path="/" element={<Flashscreen />} />
      <Route path="/login" element={<AuthPage />} />

      {/* AppShell with Navbar + Nested Pages */}
      <Route path="/app" element={<AppShell />}>
        <Route index element={<Navigate to="lessons" replace />} />
        <Route path="lessons" element={<LessonsPage />} />
        <Route path="lesson/:lessonId" element={<LessonViewPage />} />
        <Route path="quizzes" element={<QuizSelectPage />} />
        <Route path="quizzes/:level" element={<QuizPlayPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="live" element={<LivePracticePage />} />
        <Route path="characters" element={<CharactersPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
