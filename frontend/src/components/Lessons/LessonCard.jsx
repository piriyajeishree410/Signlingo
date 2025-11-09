import React from "react";
import styles from "./Lessons.module.css";

export default function LessonCard({ lesson, onClick }) {
  const { started, color, title, signCount, signs, estimatedMinutes, time } =
    lesson;

  return (
    <div
      className={styles.card}
      style={{ backgroundColor: color, color: "#fff" }}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardMeta}>
        {(signCount || signs?.length || 0)} Signs · {estimatedMinutes || time}
      </p>
      <span className={styles.status}>
        {started ? "Continue" : "Start"} Lesson
      </span>
    </div>
  );
}
