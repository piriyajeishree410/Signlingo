import React from "react";
import PropTypes from "prop-types";
import { useUserStats } from "../context/UserStatsContext";

export default function TopStatusBar() {
  const { xp, streak } = useUserStats();

  return (
    <div style={styles.bar}>
      <div style={styles.iconWrap}>
        <span style={styles.icon}>⚡</span>
        <span>{xp}</span>
      </div>
      <div style={styles.iconWrap}>
        <span style={styles.icon}>🔥</span>
        <span>{streak}</span>
      </div>
    </div>
  );
}

const styles = {
  bar: {
    display: "flex",
    gap: "1.5rem",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "0.8rem 2rem 0 0",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  iconWrap: {
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
    fontWeight: "600",
    fontSize: "0.95rem",
    color: "#1f2421",
  },
  icon: { fontSize: "1rem" },
};

TopStatusBar.propTypes = {
  xp: PropTypes.number,
  streak: PropTypes.number,
};
