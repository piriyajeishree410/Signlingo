import { useCallback, useEffect, useRef, useState } from "react";
import {
  getProfileOverview as apiGet,
  updateProfile as apiUpdate,
  deleteProfile as apiDelete,
} from "../api/profile.api";

/**
 * useProfileOverview()
 * - Loads user, lessons-in-progress, and quiz stats.
 * - Exposes updateProfile/deleteProfile helpers that auto-refresh the overview.
 * - If VITE_DEBUG_USER_ID is set (or opts.userId provided), it appends ?userId=... for dev.
 */
export default function useProfileOverview(opts = {}) {
  const debugUserId = opts.userId ?? import.meta.env.VITE_DEBUG_USER_ID ?? null;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [user, setUser] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizStats, setQuizStats] = useState({
    totalScore: 0,
    levelsUnlocked: 1,
    levelsCompleted: 0,
  });

  const mounted = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const json = await apiGet(
        debugUserId ? { userId: debugUserId } : undefined
      );
      const { user, lessons, quizzes } = json.data;
      if (!mounted.current) return;
      setUser(user);
      setLessons(lessons);
      setQuizStats(quizzes);
    } catch (e) {
      if (!mounted.current) return;
      setErr(e.message || "Failed to load profile");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [debugUserId]);

  const updateProfile = useCallback(
    async (payload) => {
      await apiUpdate(payload);
      await load();
    },
    [load]
  );

  const deleteProfile = useCallback(async () => {
    await apiDelete();
    // caller will handle redirect
  }, []);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  return {
    loading,
    err,
    user,
    lessons,
    quizStats,
    updateProfile,
    deleteProfile,
    refresh: load,
  };
}
