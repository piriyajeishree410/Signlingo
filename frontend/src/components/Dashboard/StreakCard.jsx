import styles from "./StreakCard.module.css";

const StreakCard = ({ streak = 5 }) => {
  return (
    <div className={styles.card}>
      <div className={styles.icon}>🔥</div>
      <div>
        <h3>{streak}-day streak</h3>
        <p>Keep it going!</p>
      </div>
    </div>
  );
};

export default StreakCard;
