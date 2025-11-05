import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import s from "./QuizPlayPage.module.css";

/* Small inline SVG placeholders for “images” so you don’t need assets yet */
const svgPlaceholder = (label) =>
  `data:image/svg+xml;utf8,` +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="420">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#9CC5A1"/>
        <stop offset="100%" stop-color="#49A078"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" rx="24" ry="24" fill="url(#g)"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
          font-family="Verdana, Arial" font-size="56" fill="#FFFFFF" opacity="0.95">
      ${label}
    </text>
  </svg>`);

/* Two dummy questions */
const QUIZ = [
  {
    id: "q1",
    img: svgPlaceholder("SIGN A"),
    options: ["Hello", "A", "Thanks", "Good Night"],
    correctIdx: 1,
  },
  {
    id: "q2",
    img: svgPlaceholder("SIGN THANKS"),
    options: ["Morning", "Sorry", "Thanks", "Please"],
    correctIdx: 2,
  },
];

const TOTAL_TIME = 40_000; // 40 seconds

export default function QuizPlayPage() {
  const { level } = useParams();
  const navigate = useNavigate();

  const [i, setI] = useState(0); // question index
  const [pick, setPick] = useState(null); // selected option index
  const [msLeft, setMsLeft] = useState(TOTAL_TIME);
  const [failModal, setFailModal] = useState(false);
  const [winModal, setWinModal] = useState(false);

  const ticking = useRef(false);
  const raf = useRef(0);
  const stamp = useRef(0);

  const q = useMemo(() => QUIZ[i], [i]);
  const pctLeft = Math.max(
    0,
    Math.min(100, Math.round((msLeft / TOTAL_TIME) * 100))
  );
  const secsLeft = Math.ceil(msLeft / 1000);

  // start / restart timer for each question
  useEffect(() => {
    setPick(null);
    setMsLeft(TOTAL_TIME);
    setFailModal(false);
    ticking.current = true;
    stamp.current = performance.now();
    const loop = (t) => {
      if (!ticking.current) return;
      const dt = t - stamp.current;
      stamp.current = t;
      setMsLeft((v) => {
        const nv = Math.max(0, v - dt);
        if (nv === 0) {
          ticking.current = false;
          // only fail if user hasn't answered yet
          setFailModal(true);
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
  }, [i]);

  const submit = () => {
    if (pick == null) return;
    const isCorrect = pick === q.correctIdx;
    if (!isCorrect) {
      ticking.current = false;
      setFailModal(true);
      return;
    }
    // correct → next question or win
    if (i < QUIZ.length - 1) {
      setI((v) => v + 1);
    } else {
      ticking.current = false;
      setWinModal(true);
    }
  };

  const retry = () => {
    setI(0);
    setPick(null);
    setFailModal(false);
    setWinModal(false);
    setMsLeft(TOTAL_TIME);
  };

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
          <img
            className={s.promptImg}
            src={q.img}
            alt="Sign prompt"
            draggable="false"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        <div className={s.options}>
          {q.options.map((op, idx) => {
            const isPicked = pick === idx;
            return (
              <button
                key={idx}
                className={`${s.option} ${isPicked ? s.optionPicked : ""}`}
                onClick={() => setPick(idx)}
              >
                <span className={s.bubble}>{idx + 1}</span>
                {op}
              </button>
            );
          })}
        </div>

        <div className={s.actions}>
          <button
            className={s.submit}
            onClick={submit}
            disabled={pick == null}
            title={pick == null ? "Choose an option" : "Submit answer"}
          >
            Submit
          </button>
        </div>
      </div>

      {/* Fail modal (timeout or wrong) */}
      {failModal && (
        <div
          className={s.modalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-label="Result"
        >
          <div className={s.modal}>
            <h2 className={s.modalTitle}>Failed</h2>
            <StarRow filled={0} />
            <div className={s.modalBtns}>
              <CircleBtn label="Retry" onClick={retry}>
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

      {/* Win modal (after last question) */}
      {winModal && (
        <div
          className={s.modalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-label="Result"
        >
          <div className={s.modal}>
            <h2 className={s.modalTitle}>Level Complete!</h2>
            <StarRow filled={3} />
            <div className={s.modalBtns}>
              <CircleBtn label="Retry" onClick={retry}>
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
    </div>
  );
}

/* ---------- tiny helpers (SVG icons & UI) ---------- */
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
        d="M12 6V3l5 4l-5 4V8a5 5 0 1 0 4.9 6h2.1A7 7 0 1 1 12 6z"
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
