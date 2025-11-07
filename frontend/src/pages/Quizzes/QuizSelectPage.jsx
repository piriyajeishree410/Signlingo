import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import s from "./QuizSelectPage.module.css";
import { QuizAPI } from "../../api/quiz.api";

function Star({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className={s.star}>
      <path
        fill={filled ? "currentColor" : "transparent"}
        stroke="currentColor"
        d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.9 6.6 19.7l1-6.1L3.2 9.3l6.1-.9L12 2.8Z"
      />
    </svg>
  );
}

function LockIcon(props) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M7 10V8a5 5 0 0 1 10 0v2h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1Zm2 0h6V8a3 3 0 0 0-6 0v2Z"
      />
    </svg>
  );
}

export default function QuizSelectPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState({
    unlocked: 1,
    totalScore: 0,
    starsByLevel: {},
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // set total levels for your app (adjust as needed)
  const totalLevels = 12;

  async function load() {
    try {
      setLoading(true);
      setErr("");
      const data = await QuizAPI.status();
      setStatus(data);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  const perPage = 10;
  const start = page * perPage + 1;
  const end = Math.min(start + perPage - 1, totalLevels);
  const levelsOnPage = Array.from(
    { length: end - start + 1 },
    (_, i) => start + i
  );

  const canPrev = page > 0;
  const canNext = end < totalLevels;

  const goLevel = (n) => {
    if (n > (status.unlocked || 1)) return;
    navigate(`/app/quizzes/${n}`);
  };

  async function resetAll() {
    await QuizAPI.reset();
    await load();
  }

  return (
    <div className={s.scene}>
      <div className={s.clouds} aria-hidden />
      <h1 className={s.title}>Select Level</h1>

      <div className={s.toolbar}>
        <div className={s.scorePill}>Total Score: {status.totalScore ?? 0}</div>
        <button className={s.resetBtn} onClick={resetAll}>
          Reset Progress
        </button>
      </div>

      {err && <div style={{ padding: 12, color: "crimson" }}>{err}</div>}
      {loading ? (
        <div
          className={s.gridWrap}
          style={{ height: 280, display: "grid", placeItems: "center" }}
        >
          Loading…
        </div>
      ) : (
        <div className={s.gridWrap}>
          <button
            className={`${s.navBtn} ${!canPrev ? s.navDisabled : ""}`}
            onClick={() => canPrev && setPage(page - 1)}
            aria-label="Previous"
          >
            ◀
          </button>

          <div className={s.grid}>
            {levelsOnPage.map((n) => {
              const locked = n > (status.unlocked || 1);
              const stars = Math.max(
                0,
                Math.min(3, (status.starsByLevel || {})[String(n)] || 0)
              );
              return (
                <div key={n} className={s.cell}>
                  <div className={s.starRow} aria-hidden>
                    {Array.from({ length: 3 }, (_, i) => (
                      <Star key={i} filled={i < stars} />
                    ))}
                  </div>
                  <button
                    className={`${s.levelBtn} ${locked ? s.levelLocked : ""}`}
                    onClick={() => goLevel(n)}
                    disabled={locked}
                    aria-label={
                      locked ? `Level ${n} locked` : `Start Level ${n}`
                    }
                  >
                    {locked ? (
                      <LockIcon />
                    ) : (
                      <span className={s.levelNumber}>{n}</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <button
            className={`${s.navBtn} ${!canNext ? s.navDisabled : ""}`}
            onClick={() => canNext && setPage(page + 1)}
            aria-label="Next"
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
}
