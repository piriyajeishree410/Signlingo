// frontend/src/api/signs.api.js
// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API_URL = import.meta.env.VITE_BACKEND_URL ?? "https://signlingo-hzlg.onrender.com/api";

export async function fetchSigns(q = "", limit = 60, signal) {
  const url = new URL(`${API_URL}/signs`);
  if (q) url.searchParams.set("q", q);
  if (limit) url.searchParams.set("limit", String(limit));

  const res = await fetch(url, { credentials: "include", signal });
  if (!res.ok) throw new Error("Failed to load signs");
  return res.json(); // { items, total }
}

export async function fetchSignById(id) {
  const res = await fetch(`${API_URL}/signs/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch sign");
  return res.json(); // full detail
}
