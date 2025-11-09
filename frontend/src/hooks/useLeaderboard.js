// frontend/src/hooks/useLeaderboard.js
import { useEffect, useState } from "react";
import { LeaderboardAPI } from "../api/leaderboard.api";

export default function useLeaderboard(limit = 10) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState([]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");
    LeaderboardAPI.top(limit)
      .then(({ top }) => {
        if (alive) setData(top || []);
      })
      .catch((e) => alive && setErr(e.message || "Failed to load leaderboard"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [limit]);

  return { loading, err, data };
}
