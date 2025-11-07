const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function jfetch(path, opts = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

export const QuizAPI = {
  status() {
    return jfetch("/quizzes/status", { method: "GET" });
  },
  reset() {
    return jfetch("/quizzes/reset", { method: "POST" });
  },
  start({ level, topic, count }) {
    return jfetch("/quizzes/start", {
      method: "POST",
      body: { level, topic, count },
    });
  },
  answer({ sessionId, questionIndex, choice }) {
    return jfetch("/quizzes/answer", {
      method: "POST",
      body: { sessionId, questionIndex, choice },
    });
  },
  finish({ sessionId }) {
    return jfetch("/quizzes/finish", { method: "POST", body: { sessionId } });
  },
};
