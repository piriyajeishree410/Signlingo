import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import s from "./QuizPlayPage.module.css";
import { useQuizSession } from "../../hooks/useQuizSession";
import PropTypes from "prop-types";

const TOTAL_TIME = 40_000;

export default function QuizPlayPage() {
  const { level } = useParams();
  const navigate = useNavigate();

  const [runKey, setRunKey] = useState(0);
  const {
    loading,
    error,
    current,
    total,
    idx,
    answers,
    selectChoice,
    checkCurrent,
    next,
    finish,
    setIdx,
  } = useQuizSession({
    lessonId: runKey,
    topic: null, // or "Alphabet" if you want to force category
    difficulty: Number(level) || 1,
    count: 3, // 3 questions per level
  });

  // UI state
  const [failModal, setFailModal] = useState(false);
  const [winModal, setWinModal] = useState(false);
  const [result, setResult] = useState(null); // from /finish
  const [correctIdxShown, setCorrectIdxShown] = useState(null); // highlight

  // timer state
  const [msLeft, setMsLeft] = useState(TOTAL_TIME);
  const ticking = useRef(false);
  const raf = useRef(0);
  const stamp = useRef(0);
  const timeoutHandled = useRef(false);

  const picked = answers?.[idx] ?? -1;
  const canSubmit = picked >= 0;

  const pctLeft = Math.max(
    0,
    Math.min(100, Math.round((msLeft / TOTAL_TIME) * 100))
  );
  const secsLeft = Math.ceil(msLeft / 1000);

  // restart timer on each q
  useEffect(() => {
    setFailModal(false);
    setWinModal(false);
    setCorrectIdxShown(null);
    setMsLeft(TOTAL_TIME);
    timeoutHandled.current = false;

    if (loading || !current) return;
    ticking.current = true;
    stamp.current = performance.now();

    const loop = (t) => {
      if (!ticking.current) return;
      const dt = t - stamp.current;
      stamp.current = t;

      setMsLeft((v) => {
        const nv = Math.max(0, v - dt);
        if (nv === 0 && !timeoutHandled.current && (answers?.[idx] ?? -1) < 0) {
          // timeout → get correct answer for modal
          timeoutHandled.current = true;
          (async () => {
            const { correctIdx } = await checkCurrent(-1);
            setCorrectIdxShown(correctIdx);
            ticking.current = false;
            setFailModal(true);
          })();
        }
        return nv;
      });

      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      ticking.current = false;
      cancelAnimationFrame(raf.current);
    };
  }, [loading, current, idx]); // eslint-disable-line

  async function submit() {
    if (!canSubmit) return;
    const { correct, correctIdx } = await checkCurrent();

    setCorrectIdxShown(correctIdx);

    if (!correct) {
      ticking.current = false;
      setFailModal(true);
      return;
    }
    // correct → next/finish after short pause
    const isLast = idx === total - 1;
    if (!isLast) {
      setTimeout(() => next(), 600);
      return;
    }
    ticking.current = false;
    const r = await finish();
    setResult(r || null);
    setWinModal(true);
  }

  function endQuizNow() {
    ticking.current = false;
    (async () => {
      const r = await finish();
      setResult(r || null);
      setWinModal(true);
      setFailModal(false);
    })();
  }

  function retryLevel() {
    setIdx(0);
    setRunKey((x) => x + 1);
    setFailModal(false);
    setWinModal(false);
    setResult(null);
    setCorrectIdxShown(null);
    setMsLeft(TOTAL_TIME);
  }

  if (error) {
    return (
      <div className={s.stage}>
        <header className={s.topbar}>
          <Link className={s.back} to="/app/quizzes">
            ← Levels
          </Link>
        </header>
        <div className={s.card} style={{ padding: 24 }}>
          Error: {error}
        </div>
      </div>
    );
  }
  if (loading || !current) {
    return (
      <div className={s.stage}>
        <header className={s.topbar}>
          <Link className={s.back} to="/app/quizzes">
            ← Levels
          </Link>
          <div className={s.timerWrap}>
            <div className={s.timerFill} style={{ width: "100%" }} />
          </div>
          <div className={s.levelPill}>Level {level}</div>
        </header>
        <div
          className={s.card}
          style={{ display: "grid", placeItems: "center", height: 420 }}
        >
          Loading…
        </div>
      </div>
    );
  }

  const correctChoiceText =
    (correctIdxShown != null && current?.choices?.[correctIdxShown]) || "";

  return (
    <div className={s.stage}>
      <header className={s.topbar}>
        <Link className={s.back} to="/app/quizzes">
          ← Levels
        </Link>
        <div className={s.timerWrap} aria-label="Question timer">
          <div className={s.timerFill} style={{ width: `${pctLeft}%` }} />
          <span className={s.timerText}>{secsLeft}s</span>
        </div>
        <div className={s.levelPill}>Level {level}</div>
      </header>

      <div className={s.card}>
        <div className={s.prompt}>
          {current.mediaUrl ? (
            <img
              className={s.promptImg}
              src={current.mediaUrl}
              alt="Sign prompt"
              draggable="false"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // fallback UI instead of hiding everything
                e.currentTarget.style.display = "none";
                const box = document.createElement("div");
                box.style.cssText =
                  "width:100%;height:100%;display:grid;place-items:center;background:#9cc5a133;border-radius:16px;color:#216869;font-weight:700";
                box.textContent = "Image unavailable";
                e.currentTarget.parentElement?.appendChild(box);
              }}
            />
          ) : (
            <div
              className={s.promptImg}
              style={{ display: "grid", placeItems: "center" }}
            >
              No image
            </div>
          )}
        </div>

        <div className={s.options}>
          {(current.choices || []).map((op, idxOpt) => {
            const isPicked = picked === idxOpt;
            const isCorrect =
              correctIdxShown != null && idxOpt === correctIdxShown;
            const isWrongPicked =
              correctIdxShown != null && isPicked && idxOpt !== correctIdxShown;

            return (
              <button
                key={idxOpt}
                className={[
                  s.option,
                  isPicked ? s.optionPicked : "",
                  isCorrect ? s.optionCorrect : "",
                  isWrongPicked ? s.optionWrong : "",
                ].join(" ")}
                onClick={() => selectChoice(idxOpt)}
                disabled={correctIdxShown != null} // lock options after check
              >
                <span className={s.bubble}>{idxOpt + 1}</span>
                {op}
              </button>
            );
          })}
        </div>

        <div className={s.actions}>
          <button
            className={s.submit}
            onClick={submit}
            disabled={!canSubmit || correctIdxShown != null}
            title={!canSubmit ? "Choose an option" : "Submit answer"}
          >
            Submit
          </button>
        </div>
      </div>

      {/* Fail modal */}
      {failModal && (
        <div
          className={s.modalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-label="Result"
        >
          <div className={s.modal}>
            <h2 className={s.modalTitle}>Incorrect</h2>
            <p className={s.summaryText}>
              Correct answer: <strong>{correctChoiceText || "—"}</strong>
            </p>
            <div className={s.modalBtns}>
              <CircleBtn label="End Quiz" onClick={endQuizNow}>
                <StopIcon />
              </CircleBtn>
              <CircleBtn label="Retry" onClick={retryLevel}>
                <RetryIcon />
              </CircleBtn>
              <CircleBtn
                label="Levels"
                onClick={() => navigate("/app/quizzes")}
              >
                <GridIcon />
              </CircleBtn>
              <CircleBtn label="Home" onClick={() => navigate("/app/lessons")}>
                <HomeIcon />
              </CircleBtn>
            </div>
          </div>
        </div>
      )}

      {/* Win modal */}
      {winModal && (
        <div
          className={s.modalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-label="Result"
        >
          <div className={s.modal}>
            <h2 className={s.modalTitle}>Level Complete!</h2>
            <StarRow filled={Math.max(0, Math.min(3, result?.stars ?? 3))} />
            <p className={s.summaryText}>
              Score: <strong>{result?.score ?? 0}</strong> &nbsp;|&nbsp; Correct{" "}
              {result?.correct ?? 0} / {result?.total ?? 0}
            </p>
            <div className={s.modalBtns}>
              <CircleBtn
                label="End Quiz"
                onClick={() => navigate("/app/quizzes")}
              >
                <StopIcon />
              </CircleBtn>
              <CircleBtn label="Retry" onClick={retryLevel}>
                <RetryIcon />
              </CircleBtn>
              <CircleBtn label="Home" onClick={() => navigate("/app/lessons")}>
                <HomeIcon />
              </CircleBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --- tiny UI helpers --- */
function Star({ on }) {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      className={on ? s.starOn : s.starOff}
    >
      <path d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.9 6.6 19.7l1-6.1L3.2 9.3l6.1-.9L12 2.8Z" />
    </svg>
  );
}
function StarRow({ filled = 0 }) {
  return (
    <div className={s.starRow}>
      {[0, 1, 2].map((n) => (
        <Star key={n} on={n < filled} />
      ))}
    </div>
  );
}
function CircleBtn({ label, onClick, children }) {
  return (
    <button
      className={s.circleBtn}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}
function RetryIcon(p) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...p}>
      <path
        fill="currentColor"
        d="M12 6V3l5 4-5 4V8a5 5 0 1 0 4.9 6h2.1A7 7 0 1 1 12 6z"
      />
    </svg>
  );
}
function GridIcon(p) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...p}>
      <path
        fill="currentColor"
        d="M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z"
      />
    </svg>
  );
}
function HomeIcon(p) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...p}>
      <path fill="currentColor" d="M12 3l9 8h-3v8h-5v-5h-2v5H6v-8H3l9-8z" />
    </svg>
  );
}
function StopIcon(p) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...p}>
      <path fill="currentColor" d="M7 7h10v10H7z" />
    </svg>
  );
}

Star.propTypes = {
  on: PropTypes.bool,
};

StarRow.propTypes = {
  filled: PropTypes.number,
};

CircleBtn.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};
