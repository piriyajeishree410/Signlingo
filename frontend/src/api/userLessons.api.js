// frontend/src/api/userLessons.api.js

// Build base URL from Vite env (works for any port/host you set in .env)
const HOST = import.meta.env.VITE_BACKEND_HOST ?? "localhost";
const PORT = import.meta.env.VITE_BACKEND_PORT ?? "5000";
const PREFIX = import.meta.env.VITE_API_PREFIX ?? "/api";

// If VITE_API_URL is set, it wins. Otherwise we compose host/port/prefix.
const API_BASE =
  import.meta.env.VITE_API_URL ?? `http://${HOST}:${PORT}${PREFIX}`;

const BASE_URL = `${API_BASE}/user-lessons`;

// Small helper to keep fetch+errors consistent and include cookies for sessions
async function jfetch(url, opts = {}) {
  const res = await fetch(url, { credentials: "include", ...opts });
  if (!res.ok) {
    let msg = `Request failed: ${res.status}`;
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

/** Creates/starts a user lesson record (idempotent) */
export function startLesson(userId, lessonId) {
  return jfetch(`${BASE_URL}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, lessonId }),
  });
}

/** Fetch existing progress for a specific lesson and user */
export function fetchUserProgress(userId, lessonId) {
  const u = new URL(`${BASE_URL}/progress`);
  u.searchParams.set("userId", userId);
  u.searchParams.set("lessonId", lessonId);
  return jfetch(u.toString());
}

/** Mark a single sign as completed, awarding XP if new */
export function markSignDone(userId, lessonId, signId) {
  return jfetch(`${BASE_URL}/${lessonId}/progress`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, signId }),
  });
}

/** Reset a lesson’s progress for a user */
export function resetLesson(userId, lessonId) {
  return jfetch(`${BASE_URL}/${lessonId}/reset`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
}
