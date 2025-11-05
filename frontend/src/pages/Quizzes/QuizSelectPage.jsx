import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import s from "./QuizSelectPage.module.css";

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

  // demo: 12 levels, first 10 unlocked
  const totalLevels = 12;
  const unlocked = 10;

  // simple star data (0–5) for unlocked levels
  const stars = useMemo(() => {
    const m = {};
    for (let i = 1; i <= totalLevels; i++) {
      m[i] = i <= unlocked ? Math.max(1, 6 - ((i - 1) % 5)) : 0; // 5..1 pattern
    }
    return m;
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
    if (n > unlocked) return;
    navigate(`/app/quizzes/${n}`);
  };

  return (
    <div className={s.scene}>
      <div className={s.clouds} aria-hidden />
      <h1 className={s.title}>Select Level</h1>

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
            const locked = n > unlocked;
            const count = stars[n] || 0;
            return (
              <div key={n} className={s.cell}>
                <div className={s.starRow} aria-hidden>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} filled={i < count} />
                  ))}
                </div>

                <button
                  className={`${s.levelBtn} ${locked ? s.levelLocked : ""}`}
                  onClick={() => goLevel(n)}
                  disabled={locked}
                  aria-label={locked ? `Level ${n} locked` : `Start Level ${n}`}
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
    </div>
  );
}
