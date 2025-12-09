import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

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
      const res = await fetch("http://localhost:5000/api/auth/check", {
        credentials: "include",
      });

      if (res.status === 401) {
      // user not logged in YET
      setUser(null);
      setLoading(false);
      return;
    }

      // Only parse JSON if res.ok (200)
      const data = await res.json();

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

  // Manual login (Local Strategy only)
  async function login(email, password) {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error("Invalid credentials");
    const data = await res.json();

    setUser(data.user);
    return data.user;
  }

  // Logout
  async function logout() {
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
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
