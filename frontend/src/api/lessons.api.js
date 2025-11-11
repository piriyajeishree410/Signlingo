// src/api/lessons.api.js
// const HOST = import.meta.env.VITE_BACKEND_HOST ?? "localhost";
// const PORT = import.meta.env.VITE_BACKEND_PORT ?? "5000";
// const PREFIX = import.meta.env.VITE_API_PREFIX ?? "/api";

// // Prefer a full URL if you set it; otherwise build from parts.
// const API_BASE =
//   import.meta.env.VITE_API_URL ?? `http://${HOST}:${PORT}${PREFIX}`;

const API_BASE = import.meta.env.VITE_BACKEND_URL ?? "https://signlingo-hzlg.onrender.com/api";

export async function fetchLessons() {
  const res = await fetch(`${API_BASE}/lessons`, { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to fetch lessons`);
  return res.json();
}

export async function fetchLessonById(id) {
  const res = await fetch(`${API_BASE}/lessons/${id}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Failed to fetch lesson ${id}`);
  return res.json();
}
