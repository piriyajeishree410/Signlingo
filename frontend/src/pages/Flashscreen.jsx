import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Flashscreen.module.css";
//import heroImg from "../assets/images/interpreter.png";

const Flashscreen = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.logo}>SignLingo</h2>
        <nav className={styles.nav}>
          <button
            className={styles.loginBtn}
            onClick={() => navigate("/login")}
          >
            Login / Signup
          </button>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.textBlock}>
          <h1 className={styles.title}>
            The best place to <span>learn sign language</span> through fun!
          </h1>
          <p className={styles.subtitle}>
            Learn. Practice. Communicate — all in one interactive platform that
            makes sign language learning engaging and easy.
          </p>
          <button className={styles.ctaBtn} onClick={() => navigate("/login")}>
            Start Learning
          </button>
        </div>
      </section>

      <section className={styles.features}>
        <h2 className={styles.featuresTitle}>Exciting Features</h2>
        <div className={styles.cards}>
          <div className={styles.card}>
            <h3>Learn with Lessons</h3>
            <p>
              Structured modules — from alphabets to greetings and everyday
              expressions.
            </p>
          </div>
          <div className={styles.card}>
            <h3>Fun Quizzes</h3>
            <p>
              Challenge yourself with multiple-choice and typing practice
              quizzes!
            </p>
          </div>
          <div className={styles.card}>
            <h3>Live Practice</h3>
            <p>
              Try real-time webcam-based recognition to perfect your gestures.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Flashscreen;
