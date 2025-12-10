/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

// ===== API BASE URL (same logic as auth.api.js) =====
let API_URL = import.meta.env.VITE_API_URL;

// In dev, allow fallback to localhost if VITE_API_URL isn't set
if (!API_URL && import.meta.env.DEV) {
  const HOST = import.meta.env.VITE_BACKEND_HOST ?? "localhost";
  const PORT = import.meta.env.VITE_BACKEND_PORT ?? "5000";
  const PREFIX = import.meta.env.VITE_API_PREFIX ?? "/api";
  API_URL = `http://${HOST}:${PORT}${PREFIX}`;
}

// In production, if still not set, fail loudly so you notice
if (!API_URL) {
  console.error("❌ API_URL is not configured. Set VITE_API_URL in your env.");
  throw new Error("API_URL not configured");
}

// Create context
const AuthContext = createContext(null);

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // for initial load

  // Check session on page reload
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch(`${API_URL}/auth/check`, {
          credentials: "include",
        });

        if (res.status === 401) {
          // user not logged in YET
          setUser(null);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          console.error("Check session failed:", res.status);
          setUser(null);
          setLoading(false);
          return;
        }

        const data = await res.json().catch(() => ({}));

        if (data.loggedIn) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Session check failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  // Manual login
  async function login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      // optionally parse server error
      let msg = "Invalid credentials";
      try {
        const json = await res.json();
        if (json?.error) msg = json.error;
      } catch {
        // ignore parse errors
      }
      throw new Error(msg);
    }

    const data = await res.json();
    setUser(data.user);
    return data.user;
  }

  // Logout
  async function logout() {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Hook
export function useAuth() {
  return useContext(AuthContext);
}