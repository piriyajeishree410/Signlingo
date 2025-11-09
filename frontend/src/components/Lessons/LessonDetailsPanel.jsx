import { useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from "./Lessons.module.css";

export default function LessonDetailsPanel({ lesson, onClose }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStartOrContinue = () => {
    setLoading(true);
    setTimeout(() => {
      navigate(`/app/lesson/${lesson._id}`);
    }, 400); // short delay for UX smoothness
  };

  return (
    <aside className={styles.panel}>
      {/* header with back arrow & title */}
      <div
        className={styles.panelHeader}
        style={{
          backgroundColor: lesson.color || "#216869",
          background: `linear-gradient(135deg, ${
            lesson.color || "#216869"
          } 0%, #1f2421 100%)`,
        }}
      >
        <button
          className={styles.backArrow}
          onClick={onClose}
          title="Back to lessons"
        >
          ←
        </button>
        <div className={styles.headerText}>
          <h2 className={styles.panelTitle}>{lesson.title}</h2>
          <p className={styles.panelSubtitle}>{lesson.category} Lesson</p>
        </div>
      </div>

      <div className={styles.panelBody}>
        <p className={styles.intro}>
          {lesson.desc || "Learn these signs one by one below."}
        </p>

        <ul className={styles.summaryList}>
          <li>
            <strong>{lesson.signs?.length || 0}</strong> signs
          </li>
          <li>Approx. {lesson.estimatedMinutes || "—"} min</li>
        </ul>

        {lesson.signs?.length > 0 && (
          <div className={styles.signPreview}>
            {lesson.signs.slice(0, 4).map((s) => (
              <div key={s._id} className={styles.signPreviewItem}>
                <img src={s.media?.imageUrl} alt={s.display} />
                <span>{s.display}</span>
              </div>
            ))}
          </div>
        )}

        {/* ✅ Dynamic + smoother UX button */}
        <button
          className={styles.startBtn}
          onClick={handleStartOrContinue}
          disabled={loading}
        >
          {loading
            ? "Loading..."
            : lesson.started
            ? "Continue Lesson"
            : "Start Lesson"}
        </button>
      </div>
    </aside>
  );
}
