// import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import React, { createContext, useContext, useState, useEffect } from "react";

const UserStatsContext = createContext();

export function StatsProvider({ children }) {
  // 🌸 load saved XP and streak from localStorage
  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem("xp");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem("streak");
    return saved ? parseInt(saved, 10) : 0;
  });

  // 💾 whenever xp or streak changes, save it
  useEffect(() => {
    localStorage.setItem("xp", xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem("streak", streak.toString());
  }, [streak]);

  // 🌟 functions to modify xp/streak
  const addXp = (amount) => setXp((prev) => prev + amount);
  const resetXp = () => setXp(0);
  const incrementStreak = () => setStreak((prev) => prev + 1);
  const resetStreak = () => setStreak(0);

  return (
    <UserStatsContext.Provider
      value={{ xp, streak, addXp, resetXp, incrementStreak, resetStreak }}
    >
      {children}
    </UserStatsContext.Provider>
  );
}

export const useUserStats = () => useContext(UserStatsContext);

StatsProvider.propTypes = {
  /** React children rendered inside the provider */
  children: PropTypes.node.isRequired,
};
