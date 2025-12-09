import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Flashscreen.module.css";
import PropTypes from "prop-types";

// If your asset is PNG, just switch to .png here.
import heroImg from "../assets/images/hero-bg-2.gif";

export default function Flashscreen() {
  const navigate = useNavigate();
  const handleBrandKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate("/");
    }
  };

  return (
    <div className={styles.container}>
      {/* Top bar */}
      <header className={styles.header}>
        <div
          className={styles.brand}
          onClick={() => navigate("/")}
          role="button"
          tabIndex={0}
          onKeyDown={handleBrandKeyDown}
        >
          <span className={styles.dot} />
          <span>SignLingo</span>
        </div>

        <nav className={styles.nav}>
          <button
            className={styles.loginBtn}
            onClick={() => navigate("/login")}
          >
            Login / Signup
          </button>
        </nav>
      </header>

      {/* Hero split */}
      <section className={styles.hero}>
        {/* Left */}
        <div className={styles.left}>
          <p className={styles.kicker}>Welcome to SignLingo</p>

          <h1 className={styles.title}>
            MASTER THE GESTURES
            <br />
            <span className={styles.highlight}> OWN THE CONVERSATION!</span>
          </h1>

          <p className={styles.subtitle}>
            Learn sign language in a playful, gamified way. Practice live with
            your webcam, master letters & gestures, take quizzes, and climb the
            leaderboard.
          </p>

          <div className={styles.ctaRow}>
            <button
              className={styles.cta}
              onClick={() => navigate("/learn")}
              aria-label="Start learning SignLingo"
            >
              Start learning
            </button>
          </div>
          {/* Feature cards (row with shadows) */}
          <div className={styles.features}>
            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>🎥</div>
              <h4>Live practice</h4>
              <p>Use your webcam and get instant feedback on your signs.</p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>🔤</div>
              <h4>Letters & gestures</h4>
              <p>Master A–Z, numbers, and everyday gestures step-by-step.</p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>🧩</div>
              <h4>Quizzes</h4>
              <p>Quick checks after each lesson to lock in what you learn.</p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>🏆</div>
              <h4>Leaderboard</h4>
              <p>Keep streaks, earn badges, and challenge your friends.</p>
            </article>
          </div>
        </div>

        {/* Right – BIG rectangular image (no circle) */}
        <div className={styles.right}>
          <div className={styles.imageCard}>
            <img
              src={heroImg}
              alt="Vibrant hero image matching SignLingo theme"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

Flashscreen.propTypes = {};
