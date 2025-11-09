// frontend/src/pages/Leaderboard/LeaderboardPage.jsx
import React from "react";
import PropTypes from "prop-types";
import styles from "./LeaderboardPage.module.css";
import useLeaderboard from "../../hooks/useLeaderboard";

// Small helpers to make cards look nice without hardcoding players
const BG = ["#FCEFEA", "#EAF3FF", "#F6EAFE", "#EAF9F0", "#FFF6E5"];

function TopCard({ item }) {
  const badge = String(item.rank);
  const bg = BG[(item.rank - 1) % BG.length];
  return (
    <div className={styles.topCard}>
      <div className={styles.tcHeader}>
        <div className={styles.avatar} style={{ background: bg }}>
          <span className={styles.avatarEmoji}>🙂</span>
          <span className={styles.rankDot}>{badge}</span>
        </div>
        <div className={styles.tcInfo}>
          <div className={styles.nameRow}>
            <h3 className={styles.userName}>{item.name}</h3>
            <div className={styles.points}>
              <span className={styles.pointDot}>🔹</span>
              {Number(item.totalXP || 0).toLocaleString()}
            </div>
          </div>
          <div className={styles.meta}>
            <span>{item.courses ?? 0} courses with XP</span>
            <span className={styles.dot}>•</span>
            <span>{item.streak ?? 0}-day streak</span>
          </div>
        </div>
      </div>
    </div>
  );
}
TopCard.propTypes = {
  item: PropTypes.shape({
    rank: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    totalXP: PropTypes.number.isRequired,
    courses: PropTypes.number,
    streak: PropTypes.number,
  }).isRequired,
};

function Row({ r }) {
  return (
    <div className={styles.row}>
      <div className={styles.cRank}>{r.rank}</div>
      <div className={styles.cUser}>
        <div className={styles.rowAvatar}>🧑‍💻</div>
        <span className={styles.rowName}>{r.name}</span>
      </div>
      <div className={styles.cCourses}>{r.courses ?? 0} courses</div>
      <div className={styles.cStreak}>{r.streak ?? 0} days</div>
      <div className={styles.cPoints}>
        <span className={styles.pointDot}>🔹</span>
        {r.totalXP ?? 0}
      </div>
    </div>
  );
}
Row.propTypes = {
  r: PropTypes.shape({
    rank: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    courses: PropTypes.number,
    streak: PropTypes.number,
    totalXP: PropTypes.number.isRequired,
  }).isRequired,
};

export default function LeaderboardPage() {
  // Pull up to 10; cards show top 3; table shows ranks 4..10
  const { loading, err, data } = useLeaderboard(10);

  const top3 = data.slice(0, 3);
  const tableRows = data.slice(3); // ranks 4..10

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Leaderboard</h1>

      {err && <div style={{ color: "crimson", paddingBottom: 12 }}>{err}</div>}
      {loading ? (
        <div style={{ padding: 24 }}>Loading…</div>
      ) : (
        <>
          <div className={styles.topGrid}>
            {top3.map((t) => (
              <TopCard key={t.userId} item={t} />
            ))}
          </div>

          <div className={styles.table}>
            <div className={styles.tHead}>
              <div className={styles.hRank}>Rank</div>
              <div className={styles.hUser}>User</div>
              <div className={styles.hCourses}>Courses with XP</div>
              <div className={styles.hStreak}>Streak</div>
              <div className={styles.hPoints}>Total XP</div>
            </div>

            <div className={styles.tBody}>
              {tableRows.length === 0 ? (
                <div style={{ padding: 16, color: "#666" }}>
                  Not enough players yet. Play a lesson to earn XP!
                </div>
              ) : (
                tableRows.map((r) => <Row key={r.userId} r={r} />)
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
