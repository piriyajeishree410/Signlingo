import { useState } from "react";
import styles from "./AuthPage.module.css";
import LoginForm from "../../components/Auth/LoginForm.jsx";
import SignupForm from "../../components/Auth/SignupForm.jsx";
import loginImg from "../../assets/images/img3.webp";

export default function AuthPage() {
  const [mode, setMode] = useState("login");

  return (
    <main className={styles.wrap}>
      {/* fixed top-right pill like the mock (UI only) */}
      <button
        className={styles.topAction}
        onClick={() => setMode("login")}
        aria-label="Sign in"
      >
        Sign in
      </button>

      {/* Full-height split layout */}
      <div className={styles.card}>
        {/* LEFT: image with overlay copy + dots */}
        <section className={styles.imageSide}>
          <img
            className={styles.img}
            src={loginImg}
            alt="Scenic hero"
            draggable="false"
          />

          {/* brand top-left over image (pure UI) */}
          <div className={styles.brandBar}>
            <span className={styles.brandLogo} aria-hidden />
            <span className={styles.brandName}>SignLingo</span>
          </div>
        </section>

        {/* RIGHT: form column */}
        <section className={styles.formSide}>
          <div className={styles.formInner}>
            <h1 className={styles.title}>
              {mode === "login"
                ? "Welcome Back !"
                : "Create your SignLingo account"}
            </h1>
            <p className={styles.subtle}>
              {mode === "login"
                ? "Sign in your account"
                : "Join us in a minute"}
            </p>

            <div className={styles.formBody}>
              {mode === "login" ? (
                <>
                  {/* Your existing component (keeps backend call intact) */}
                  <LoginForm />

                  <p className={styles.footerNote}>
                    Don&apos;t have any account?{" "}
                    <button
                      type="button"
                      className={styles.linkBtn}
                      onClick={() => setMode("signup")}
                    >
                      Register
                    </button>
                  </p>
                </>
              ) : (
                <SignupForm onSwitchToLogin={() => setMode("login")} />
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
