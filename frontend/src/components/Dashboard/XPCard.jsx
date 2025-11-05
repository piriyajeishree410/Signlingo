import styles from "./XPCard.module.css";

const XPCard = ({ xp = 250, goal = 500 }) => {
  const percentage = Math.min((xp / goal) * 100, 100);

  return (
    <div className={styles.card}>
      <h3>Daily XP</h3>
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <p>
          <strong>{xp}</strong> / {goal} XP
        </p>
      </div>
    </div>
  );
};

export default XPCard;
