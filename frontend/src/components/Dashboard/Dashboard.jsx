import styles from "./Dashboard.module.css";
import LessonNode from "./LessonNode";
import XPCard from "./XPCard";
import StreakCard from "./StreakCard";
import LessonPath from "./LessonPath";

const Dashboard = () => {
  const lessons = [
    { id: 1, title: "Alphabets", status: "active" },
    { id: 2, title: "Greetings", status: "locked" },
    { id: 3, title: "Numbers", status: "locked" },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Welcome back, Learner 👋</h1>
          <p>Continue your sign journey!</p>
        </div>
        <div className={styles.cards}>
          <XPCard xp={250} goal={500} />
          <StreakCard streak={5} />
        </div>
      </header>

      <section className={styles.lessonsSection}>
        <h2>Your Lessons</h2>
        <LessonPath />
      </section>
    </div>
  );
};

export default Dashboard;
