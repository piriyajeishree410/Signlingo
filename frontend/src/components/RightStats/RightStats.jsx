import React from "react";
import { useUserStats } from "../../context/UserStatsContext.jsx";
import styles from "./RightStats.module.css";
import PropTypes from "prop-types";

function StatPill({ icon, value, label }) {
  return (
    <div className={styles.pill}>
      <span className={styles.icon} aria-hidden>
        {icon}
      </span>
      <div className={styles.pillText}>
        <div className={styles.value}>{value}</div>
        <div className={styles.label}>{label}</div>
      </div>
    </div>
  );
}

export default function RightStats() {
  // ✅ get everything directly
  const { xp = 0, streak = 0 } = useUserStats();

  // optional placeholders so UI doesn’t break
  const level = Math.floor(xp / 100) + 1;
  const dailyGoal = 100; // XP goal for the day
  const dailyProgress = xp % dailyGoal;
  const pct = Math.min(100, Math.round((dailyProgress / dailyGoal) * 100));

  return (
    <aside className={styles.rail} aria-label="User stats">
      {/* Top stat pills */}
      <div className={styles.pillsRow}>
        <StatPill
          icon={
            <svg viewBox="0 0 24 24">
              <path d="M12 2l3 6 6 .9-4.5 4.3 1 6-5.5-3-5.5 3 1-6L3 8.9 9 8l3-6z" />
            </svg>
          }
          value={level}
          label="Level"
        />
        <StatPill
          icon={
            <svg viewBox="0 0 24 24">
              <path d="M12 2C8 6 6 9 6 12a6 6 0 0012 0c0-3-2-6-6-10z" />
            </svg>
          }
          value={streak}
          label="Streak"
        />
        <StatPill
          icon={
            <svg viewBox="0 0 24 24">
              <path d="M12 2l6 6-6 14-6-14 6-6z" />
            </svg>
          }
          value={xp}
          label="XP"
        />
      </div>

      {/* Daily XP card */}
      <section className={styles.card}>
        <header className={styles.cardHeader}>
          <div className={styles.cardTitle}>Daily Quests</div>
          <button className={styles.viewAllBtn} type="button">
            VIEW ALL
          </button>
        </header>
        <div className={styles.questRow}>
          <div className={styles.questLabel}>Earn {dailyGoal} XP</div>
          <div className={styles.progress}>
            <div className={styles.progressFill} style={{ width: `${pct}%` }} />
          </div>
          <div className={styles.progressText}>
            {dailyProgress} / {dailyGoal}
          </div>
        </div>
      </section>

      {/* “Unlock Leaderboards” style card */}
      <section className={styles.card}>
        <div className={styles.cardTitle}>Unlock Leaderboards!</div>
        <p className={styles.cardSub}>
          Complete 10 more lessons to start competing
        </p>
      </section>
    </aside>
  );
}

StatPill.propTypes = {
  icon: PropTypes.node.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  label: PropTypes.string.isRequired,
};
