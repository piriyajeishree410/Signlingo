import { useState } from "react";
import styles from "./AuthPage.module.css";
import LoginForm from "../../components/Auth/LoginForm.jsx";
import SignupForm from "../../components/Auth/SignupForm.jsx";
import loginImg from "../../assets/images/auth/login_image.png"; // ensure this exists

export default function AuthPage() {
  const [mode, setMode] = useState("login");

  return (
    <main className={styles.wrap}>
      {/* One shared card with a single shadow */}
      <div className={styles.card}>
        {/* Left: smaller image area */}
        <section className={styles.imageSide}>
          <img
            className={styles.img}
            src={loginImg}
            alt="SignLingo login illustration"
            draggable="false"
          />
        </section>

        {/* Right: larger form area */}
        <section className={styles.formSide}>
          <h1 className={styles.title}>
            {mode === "login" ? "Welcome back!" : "Create your account"}
          </h1>
          <p className={styles.subtle}>
            {mode === "login"
              ? "Please enter your details"
              : "A few details to get started"}
          </p>

          <div className={styles.tabs} role="tablist" aria-label="Auth mode">
            <button
              role="tab"
              aria-selected={mode === "login"}
              className={`${styles.tab} ${mode === "login" ? styles.tabActive : ""}`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              role="tab"
              aria-selected={mode === "signup"}
              className={`${styles.tab} ${mode === "signup" ? styles.tabActive : ""}`}
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
          </div>

          <div className={styles.formBody}>
            {mode === "login" ? (
              <LoginForm />
            ) : (
              <SignupForm onSwitchToLogin={() => setMode("login")} />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
