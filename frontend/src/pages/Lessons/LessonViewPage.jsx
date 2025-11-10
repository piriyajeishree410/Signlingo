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
import PropTypes from "prop-types";
import { useUserStats } from "../../context/UserStatsContext";

export default function LessonViewPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [completedSigns, setCompletedSigns] = useState([]);
  const { addXp, resetXp } = useUserStats();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        // ensure a userLesson exists for this (session) user
        await startLesson(lessonId);

        // get lesson + progress
        const [lessonRes, progressRes] = await Promise.all([
          fetchLessonById(lessonId),
          fetchUserProgress(lessonId),
        ]);

        if (!lessonRes.success) {
          setError("Lesson not found");
          return;
        }
        setLesson(lessonRes.lesson);

        if (progressRes.success && progressRes.progress) {
          const { completedSigns, xpEarned } = progressRes.progress;
          const ids = (completedSigns || []).map(String);
          setCompletedSigns(ids);
          setXpEarned(xpEarned || 0);
          // continue from next unfinished sign
          const nextIdx = Math.min(
            ids.length,
            (lessonRes.lesson.signs?.length || 1) - 1
          );
          setIndex(nextIdx);
        } else {
          setCompletedSigns([]);
          setXpEarned(0);
          setIndex(0);
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [lessonId]);

  if (loading) return <div style={{ padding: "2rem" }}>Loading...</div>;
  if (error) return <div style={{ padding: "2rem" }}>{error}</div>;
  if (!lesson?.signs?.length)
    return (
      <div style={{ padding: "2rem" }}>No signs found for this lesson.</div>
    );

  const currentSign = lesson.signs[index];
  const hasNext = index < lesson.signs.length - 1;
  const isAlreadyDone = completedSigns.includes(currentSign._id?.toString());

  // show % based on real completion, not just screen index
  const progressPercent = Math.round(
    ((completedSigns.length + (isAlreadyDone ? 0 : 0)) / lesson.signs.length) *
      100
  );

  async function handleMarkDone() {
    try {
      setDone(true);
      const resp = await markSignDone(lesson._id, currentSign._id);
      if (resp.success) {
        setXpEarned(resp.xpEarned || 0);
        addXp(5);
        setCompletedSigns((prev) => [
          ...new Set([...prev, currentSign._id.toString()]),
        ]);
      }
    } catch (e) {
      console.error("Mark as done failed", e);
    }
  }

  function handleNext() {
    setAnimate(true);
    setTimeout(() => {
      setAnimate(false);
      if (hasNext) {
        setIndex((i) => i + 1);
        setDone(false);
      }
    }, 300);
  }

  async function handleResetProgress() {
    if (!window.confirm("This will delete your progress. Continue?")) return;
    try {
      await resetLesson(lesson._id);
      setCompletedSigns([]);
      setXpEarned(0);
      resetXp();
      setIndex(0);
      navigate("/app/lessons");
    } catch (e) {
      console.error("Reset failed:", e);
    }
  }

  return (
    <div className={styles.lessonView}>
      {/* Header + reset button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
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
        />
      </div>
      <p className={styles.progressText}>
        {completedSigns.length} of {lesson.signs.length} completed
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
          Practice this sign a few times before moving to the next or test it in
          Live Practice.
        </p>

        <div className={styles.lessonButtons}>
          <button
            className={styles.practiceBtn}
            onClick={handleMarkDone}
            disabled={isAlreadyDone || done}
          >
            {isAlreadyDone || done ? "✅ Marked" : "Mark as Done"}
          </button>

          {(isAlreadyDone || done) && hasNext && (
            <button className={styles.nextBtn} onClick={handleNext}>
              Next →
            </button>
          )}

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

LessonViewPage.propTypes = {};
