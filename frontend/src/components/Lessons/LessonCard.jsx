import React from "react";
import styles from "./Lessons.module.css";
import PropTypes from "prop-types";

export default function LessonCard({ lesson, onClick }) {
  const { started, color, title } =
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
        {lesson.signCount || lesson.signs?.length || 0} Signs ·{" "}
        {lesson.estimatedMinutes || lesson.time}
      </p>
      <span className={styles.status}>
        {started ? "Continue" : "Start"} Lesson
      </span>
    </div>
  );
}

LessonCard.propTypes = {
  lesson: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    title: PropTypes.string.isRequired,
    color: PropTypes.string,
    signCount: PropTypes.number,
    signs: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.object, PropTypes.string])
    ),
    estimatedMinutes: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    time: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};
