// frontend/src/api/userLessons.api.js

const BASE_URL = "http://localhost:5000/api/user-lessons";

/**
 * Creates or starts a new user lesson record (if not already exists)
 */
export async function startLesson(userId, lessonId) {
  const res = await fetch(`${BASE_URL}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, lessonId }),
  });
  return res.json();
}

/**
 * Fetch existing progress for a specific lesson and user
 */
export async function fetchUserProgress(userId, lessonId) {
  const res = await fetch(
    `${BASE_URL}/progress?userId=${userId}&lessonId=${lessonId}`
  );
  return res.json();
}

/**
 * Mark a single sign as completed, awarding XP if new
 */
export async function markSignDone(userId, lessonId, signId) {
  const res = await fetch(`${BASE_URL}/${lessonId}/progress`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, signId }),
  });
  return res.json();
}

/**
 * Reset a lesson’s progress for a user
 */
export async function resetLesson(userId, lessonId) {
  const res = await fetch(`${BASE_URL}/${lessonId}/reset`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  return res.json();
}
