// Always hit same-origin `/api`.
// In dev, Vite proxy forwards `/api` → http://localhost:5000.
// In prod (Render), backend serves the frontend and `/api` on the same domain.
const API_BASE = "/api";

export const AuthAPI = {
  async signup(data) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || "Signup failed");
    return json;
  },

  async login(data) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || "Login failed");
    return json;
  },

  async logout() {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  },

  async check() {
    const res = await fetch(`${API_BASE}/auth/check`, {
      credentials: "include",
    });
    return res.json().catch(() => ({}));
  },
};
