import s from "./ProfilePage.module.css";
import avatar from "../../assets/images/avatar.png"; // ensure file exists

export default function ProfilePage() {
  const user = {
    name: "Nandana Pradeep",
    xp: 2400,
    xpGoal: 3000,
    streak: 12,
    level: 5,
    quizzesDone: 37,
  };
  const lessons = [
    { id: "alphabet", title: "Alphabet A–Z", progress: 82 },
    { id: "greetings", title: "Greetings & Essentials", progress: 45 },
    { id: "numbers", title: "Numbers 1–20", progress: 60 },
    { id: "daily", title: "Daily Phrases", progress: 20 },
  ];

  return (
    <div className={s.page}>
      <section className={s.profileCard}>
        <div className={s.headerRow}>
          <div className={s.userBlock}>
            <img
              className={s.avatar}
              src={avatar}
              alt="User avatar"
              onError={(e) => {
                e.currentTarget.style.visibility = "hidden";
              }}
            />
            <div>
              <h1 className={s.name}>{user.name}</h1>
              <p className={s.badge}>Bonus Booster • LV {user.level}</p>
            </div>
          </div>
          <div className={s.actions}>
            <button
              className={s.ghostBtn}
              onClick={() => (window.location.href = "/app/lessons")}
            >
              Continue Learning
            </button>
            <button
              className={s.primaryBtn}
              onClick={() => (window.location.href = "/app/quizzes")}
            >
              Start Quiz
            </button>
          </div>
        </div>

        <div className={s.xpRow}>
          <Progress value={user.xp} max={user.xpGoal} />
          <span className={s.xpText}>
            {user.xp} / {user.xpGoal} XP
          </span>
        </div>

        <div className={s.metrics}>
          <Metric label="Streak" value={user.streak} />
          <Metric label="Level" value={user.level} />
          <Metric label="Quizzes Done" value={user.quizzesDone} />
        </div>
      </section>

      <section className={s.sectionCard}>
        <div className={s.sectionHead}>
          <h2>Lessons in Progress</h2>
          <span className={s.count}>{lessons.length}</span>
        </div>
        <div className={s.lessonGrid}>
          {lessons.map((l) => (
            <article key={l.id} className={s.lessonItem}>
              <div className={s.lessonHeader}>
                <div className={s.lessonIcon} />{" "}
                <h3 className={s.lessonTitle}>{l.title}</h3>
              </div>
              <Progress value={l.progress} max={100} />
              <div className={s.lessonMeta}>
                <span>{l.progress}%</span>
                <button
                  className={s.smallBtn}
                  onClick={() =>
                    (window.location.href = `/app/lessons?unit=${l.id}`)
                  }
                >
                  Continue
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Progress({ value = 0, max = 100 }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div
      className={s.bar}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={s.fill} style={{ width: `${pct}%` }} />
    </div>
  );
}
function Metric({ label, value }) {
  return (
    <div className={s.metricCard}>
      <div className={s.metricValue}>{value}</div>
      <div className={s.metricLabel}>{label}</div>
    </div>
  );
}
