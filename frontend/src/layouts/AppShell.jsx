import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { StatsProvider } from "../context/UserStatsContext.jsx";
import RightStats from "../components/RightStats/RightStats.jsx";
import SideNav from "../components/Nav/SideNav.jsx";
import styles from "./AppShell.module.css";
import PropTypes from "prop-types";

export default function AppShell() {
  const { pathname } = useLocation();
  const hideRight = pathname.startsWith("/app/profile");

  return (
    <StatsProvider>
      {/* ✅ Skip link for keyboard users */}
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <div className={`${styles.shell} ${hideRight ? styles.noRight : ""}`}>
        <aside className={styles.left}>
          <SideNav />
        </aside>
        <main className={styles.content}>
          <Outlet />
        </main>
        {!hideRight && (
          <div className={styles.right}>
            <RightStats />
          </div>
        )}
      </div>
    </StatsProvider>
  );
}
AppShell.propTypes = {};
