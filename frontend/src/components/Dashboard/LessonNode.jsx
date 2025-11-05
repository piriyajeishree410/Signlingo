import styles from "./LessonNode.module.css";

const LessonNode = ({ lesson }) => {
  const { title, status } = lesson;

  const getStatusClass = () => {
    if (status === "active") return styles.active;
    if (status === "completed") return styles.completed;
    return styles.locked;
  };

  return (
    <div className={`${styles.node} ${getStatusClass()}`}>
      <span>{title}</span>
      {status === "active" && <button className={styles.startBtn}>Start</button>}
    </div>
  );
};

export default LessonNode;
