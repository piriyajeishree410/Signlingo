import { Routes, Route, Navigate } from "react-router-dom";
import Flashscreen from "./pages/Flashscreen.jsx";
import AuthPage from "./pages/Auth/AuthPage.jsx";
import AppShell from "./layouts/AppShell.jsx";
import ProfilePage from "./pages/Profile/ProfilePage.jsx";
import QuizSelectPage from "./pages/Quizzes/QuizSelectPage.jsx";
import QuizPlayPage from "./pages/Quizzes/QuizPlayPage.jsx";

/* Minimal placeholder pages so the nav works now */
const Stub = (t) => () => (
  <div style={{ fontSize: 24, fontWeight: 800 }}>{t}</div>
);

const LessonsPage = Stub("Lessons");
const QuizzesPage = Stub("Quizzes");
const LeaderboardPage = Stub("Leaderboard");
const LivePage = Stub("Live Practice");
const CharactersPage = Stub("Characters");

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Flashscreen />} />
      <Route path="/login" element={<AuthPage />} />

      <Route path="/app" element={<AppShell />}>
        <Route index element={<Navigate to="lessons" replace />} />
        <Route path="lessons" element={<LessonsPage />} />
        {/* quizzes */}
        <Route path="quizzes" element={<QuizSelectPage />} />
        <Route path="quizzes/:level" element={<QuizPlayPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="live" element={<LivePage />} />
        <Route path="characters" element={<CharactersPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
