import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchLessonById } from "../../api/lessons.api";
import {
  startLesson,
  fetchUserProgress,
  markSignDone,
  resetLesson,
} from "../../api/userLessons.api";
import styles from "../../components/Lessons/Lessons.module.css";

export default function LessonViewPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  // TODO: replace this with logged-in user from session/auth later
  const currentUserId = "672c9b8f11a1e1d9b2efabc3";

  const [lesson, setLesson] = useState(null);
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [completedSigns, setCompletedSigns] = useState([]);

  // 🌿 1️⃣ Load both lesson and user progress
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Ensure userLesson record exists (creates if not found)
        await startLesson(currentUserId, lessonId);

        // Fetch lesson data + user progress
        const [lessonRes, progressRes] = await Promise.all([
          fetchLessonById(lessonId),
          fetchUserProgress(currentUserId, lessonId),
        ]);

        if (lessonRes.success) {
          setLesson(lessonRes.lesson);
        } else {
          setError("Lesson not found");
          return;
        }

        if (progressRes.success && progressRes.progress) {
          const { completedSigns, xpEarned } = progressRes.progress;
          setCompletedSigns(completedSigns.map(String));
          setXpEarned(xpEarned || 0);

          // continue from the next unfinished sign
          if (completedSigns.length < lessonRes.lesson.signs.length) {
            setIndex(completedSigns.length);
          } else {
            setIndex(lessonRes.lesson.signs.length - 1);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [lessonId]);

  if (loading) return <div style={{ padding: "2rem" }}>Loading...</div>;
  if (error) return <div style={{ padding: "2rem" }}>{error}</div>;
  if (!lesson || !lesson.signs?.length)
    return <div style={{ padding: "2rem" }}>No signs found for this lesson.</div>;

  const currentSign = lesson.signs[index];
  const hasNext = index < lesson.signs.length - 1;
  const isAlreadyDone = completedSigns.includes(currentSign._id?.toString());
  const progressPercent = ((index + 1) / lesson.signs.length) * 100;

  // 🌼 2️⃣ Mark current sign as done and update XP/progress
  const handleMarkDone = async () => {
    try {
      setDone(true);
      const data = await markSignDone(currentUserId, lesson._id, currentSign._id);
      if (data.success) {
        setXpEarned(data.xpEarned);
        setCompletedSigns((prev) => [...new Set([...prev, currentSign._id.toString()])]);
      }
    } catch (err) {
      console.error("Mark as done failed", err);
    }
  };

  // 🧩 3️⃣ Go to next sign
  const handleNext = () => {
    setAnimate(true);
    setTimeout(() => {
      setAnimate(false);
      if (hasNext) {
        setIndex(index + 1);
        setDone(false);
      }
    }, 300);
  };

  // 🌸 4️⃣ Reset all progress for this user & lesson
  const handleResetProgress = async () => {
    if (!window.confirm("This will delete your progress. Continue?")) return;
    try {
      await resetLesson(currentUserId, lesson._id);
      setCompletedSigns([]);
      setXpEarned(0);
      setIndex(0);
      alert("Progress has been reset.");
      navigate("/app/lessons");
    } catch (err) {
      console.error("Reset failed:", err);
    }
  };

  return (
    <div className={styles.lessonView}>
      {/* Header + reset button */}
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <h1 className={styles.lessonTitle}>{lesson.title}</h1>
        <button className={styles.resetBtn} onClick={handleResetProgress}>
          Reset Progress
        </button>
      </div>

      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
      <p className={styles.progressText}>
        Sign {index + 1} of {lesson.signs.length}
      </p>

      {/* Sign display */}
      <div
        key={currentSign._id}
        className={`${styles.signCard} ${animate ? styles.fadeOut : styles.fadeIn}`}
      >
        <img
          src={currentSign.media?.imageUrl}
          alt={currentSign.display}
          className={styles.signImage}
        />
        <h2 className={styles.signLabel}>{currentSign.display}</h2>
        <p className={styles.signDesc}>{currentSign.description}</p>
        <p className={styles.practiceNote}>
          Practice this sign a few times before moving to the next or test it in Live Practice.
        </p>

        <div className={styles.lessonButtons}>
          {/* Mark as Done */}
          <button
            className={styles.practiceBtn}
            onClick={handleMarkDone}
            disabled={done || isAlreadyDone}
          >
            {done || isAlreadyDone ? "✅ Marked" : "Mark as Done"}
          </button>

          {/* Next only appears after marking done */}
          {(done || isAlreadyDone) && hasNext && (
            <button className={styles.nextBtn} onClick={handleNext}>
              Next →
            </button>
          )}

          {/* Live Practice */}
          <button
            className={styles.practiceBtn}
            onClick={() => navigate("/app/live")}
          >
            Live Practice
          </button>
        </div>

        {xpEarned > 0 && (
          <p className={styles.practiceNote}>🌟 XP Earned: {xpEarned}</p>
        )}
      </div>
    </div>
  );
}
