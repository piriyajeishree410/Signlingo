import { useHelp } from "../../context/HelpContext.jsx";
import styles from "./HelpModal.module.css";

export default function HelpModal() {
  const { isOpen, closeHelp } = useHelp();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={closeHelp}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <button className={styles.closeBtn} onClick={closeHelp}>
          ✕
        </button>

        <h1 className={styles.title}>Welcome to SignLingo!</h1>

        <div className={styles.section}>
          <h2>👋 Getting Started</h2>
          <p>Begin with the Lessons tab to learn each sign step-by-step.</p>
        </div>

        <div className={styles.section}>
          <h2>🧠 Practice Quizzes</h2>
          <p>Earn XP by completing quizzes and build your daily practice streak.</p>
        </div>

        <div className={styles.section}>
          <h2>🏆 Leaderboard</h2>
          <p>See how your progress compares with other learners.</p>
        </div>

        <div className={styles.section}>
          <h2>🎥 Live Practice</h2>
          <p>Use your webcam to practice signing in real time.</p>
        </div>

        <div className={styles.section}>
          <h2>👤 Profile</h2>
          <p>Track XP, badges, and streak progress anytime from your profile.</p>
        </div>

        <div className={styles.section}>
          <h2>🔐 Logging In</h2>
          <p>
            You can sign in using Email or Google for a faster, unified experience.
          </p>
        </div>

        <p className={styles.footer}>Enjoy learning sign language! 💚</p>
      </div>
    </div>
  );
}
