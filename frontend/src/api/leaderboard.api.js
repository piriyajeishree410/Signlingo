// frontend/src/api/leaderboard.api.js
// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API_URL = import.meta.env.VITE_BACKEND_URL ?? "https://signlingo-hzlg.onrender.com/api";

export const LeaderboardAPI = {
  async top(limit = 10) {
    const res = await fetch(`${API_URL}/leaderboard/top?limit=${limit}`, {
      credentials: "include",
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to load leaderboard");
    }
    return json; // { success: true, top: [...] }
  },
};
