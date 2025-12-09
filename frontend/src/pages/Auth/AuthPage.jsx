import { useState } from "react";
import styles from "./AuthPage.module.css";
import LoginForm from "../../components/Auth/LoginForm.jsx";
import SignupForm from "../../components/Auth/SignupForm.jsx";
import loginImg from "../../assets/images/img3.webp";
import PropTypes from "prop-types";
import { useAuth } from "../../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const { user, loading } = useAuth();

  if (loading) return null;

  // If already logged in, then redirect to /app
  if (user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <main className={styles.wrap}>
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

AuthPage.propTypes = {};
