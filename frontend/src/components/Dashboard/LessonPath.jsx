import styles from "./LessonPath.module.css";
import LessonNode from "./LessonNode";

const LessonPath = () => {
  const lessons = [
    { id: 1, title: "Alphabets", status: "completed" },
    { id: 2, title: "Greetings", status: "active" },
    { id: 3, title: "Numbers", status: "locked" },
  ];

  return (
    <div className={styles.pathContainer}>
      {lessons.map((lesson, index) => (
        <div key={lesson.id} className={styles.lessonWrapper}>
          <LessonNode lesson={lesson} />
          {index < lessons.length - 1 && (
            <div
              className={`${styles.connector} ${
                lesson.status === "completed"
                  ? styles.connectorCompleted
                  : styles.connectorPending
              }`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LessonPath;
