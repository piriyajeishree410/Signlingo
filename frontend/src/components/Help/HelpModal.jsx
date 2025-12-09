import { useHelp } from "../../context/HelpContext.jsx";
import styles from "./HelpModal.module.css";

export default function HelpModal() {
  const { isOpen, closeHelp } = useHelp();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={closeHelp}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()} // prevents closing when clicking inside
      >
        {/* Close button */}
        <button className={styles.closeBtn} onClick={closeHelp}>
          ✕
        </button>

        {/* Title */}
        <h1 className={styles.title}>Welcome to SignLingo!</h1>

        {/* Getting Started */}
        <div className={styles.section}>
          <h2>👋 Getting Started</h2>
          <ul>
            <li>Begin with the Lessons tab to learn each sign step-by-step.</li>
            <li>Follow visual demos to understand hand shapes and movement.</li>
            <li>Use XP and streaks to track your daily learning progress.</li>
          </ul>
        </div>

        {/* Quizzes */}
        <div className={styles.section}>
          <h2>🧠 Practice Quizzes</h2>
          <ul>
            <li>Take quick quizzes after lessons to reinforce learning.</li>
            <li>Earn XP for correct answers and build your streak.</li>
            <li>Review explanations for mistakes so you improve faster.</li>
          </ul>
        </div>

        {/* Leaderboard */}
        <div className={styles.section}>
          <h2>🏆 Leaderboard</h2>
          <ul>
            <li>Compete with other learners once you complete 10 lessons.</li>
            <li>Higher XP means a higher ranking — keep practicing!</li>
          </ul>
        </div>

        {/* Live Practice */}
        <div className={styles.section}>
          <h2>🎥 Live Practice</h2>
          <ul>
            <li>Use your webcam to practice signs in real time.</li>
            <li>Allow camera permissions when prompted.</li>
            <li>Keep your hand inside the frame for accurate detection.</li>
          </ul>
        </div>

        {/* Profile */}
        <div className={styles.section}>
          <h2>👤 Profile</h2>
          <ul>
            <li>View your total XP, level, and practice streak.</li>
            <li>Track badges and achievements unlocked along the way.</li>
          </ul>
        </div>

        {/* Login */}
        <div className={styles.section}>
          <h2>🔐 Logging In</h2>
          <ul>
            <li>Use Email/Password or sign in instantly with Google.</li>
            <li>Your XP, lessons, and streaks stay synced across devices.</li>
          </ul>
        </div>

        {/* Keyboard Accessibility */}
        <div className={styles.section}>
          <h2>⌨️ Keyboard Navigation (Accessibility)</h2>
          <ul>
            <li><strong>Tab</strong> — Move forward through buttons, links, inputs.</li>
            <li><strong>Shift + Tab</strong> — Move backward through focus items.</li>
            <li><strong>Enter</strong> or <strong>Space</strong> — Activate selected item.</li>
          </ul>
        </div>

        {/* Footer */}
        <p className={styles.footer}>
          Enjoy learning sign language! 💚 We're here to support your journey.
        </p>
      </div>
    </div>
  );
}
