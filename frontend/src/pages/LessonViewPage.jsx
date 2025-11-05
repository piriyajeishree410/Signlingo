import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../components/Lessons/Lessons.module.css";

const lessonData = {
  1: {
    title: "Alphabets",
    signs: [
      { id: 1, image: "/images/signs/A.png", label: "A", desc: "This sign represents the letter A." },
      { id: 2, image: "/images/signs/B.png", label: "B", desc: "This sign represents the letter B." },
      { id: 3, image: "/images/signs/C.png", label: "C", desc: "This sign represents the letter C." },
    ],
  },
  2: {
    title: "Greetings",
    signs: [
      { id: 1, image: "/images/signs/hello.png", label: "Hello", desc: "Used to greet someone." },
      { id: 2, image: "/images/signs/thankyou.png", label: "Thank you", desc: "Used to express gratitude." },
    ],
  },
};

export default function LessonViewPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const lesson = lessonData[lessonId];
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(false);

  if (!lesson) return <div style={{ padding: "2rem" }}>Lesson not found.</div>;

  const currentSign = lesson.signs[index];
  const hasNext = index < lesson.signs.length - 1;

  const handleNext = () => {
    setAnimate(true);
    setTimeout(() => {
      setAnimate(false);
      if (hasNext) setIndex(index + 1);
    }, 300);
  };

  const progressPercent = ((index + 1) / lesson.signs.length) * 100;

  return (
    <div className={styles.lessonView}>
      <h1 className={styles.lessonTitle}>{lesson.title}</h1>

      {/* progress indicator */}
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
      <p className={styles.progressText}>
        Sign {index + 1} of {lesson.signs.length}
      </p>

      {/* sign card */}
      <div
        key={currentSign.id}
        className={`${styles.signCard} ${animate ? styles.fadeOut : styles.fadeIn}`}
      >
        <img src={currentSign.image} alt={currentSign.label} className={styles.signImage} />
        <h2 className={styles.signLabel}>{currentSign.label}</h2>
        <p className={styles.signDesc}>{currentSign.desc}</p>
        <p className={styles.practiceNote}>
          Practice this sign a few times before moving to the next or test it in Live Practice.
        </p>

        <div className={styles.lessonButtons}>
          {hasNext && (
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
      </div>
    </div>
  );
}
