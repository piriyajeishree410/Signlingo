import { useState } from "react";
import PropTypes from "prop-types";
import s from "./LoginForm.module.css";
// import { AuthAPI } from "../../api/auth.api";

function EyeIcon({ on, ...props }) {
  return on ? (
    <svg width="22" height="22" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12 5c5.5 0 10 5 10 7s-4.5 7-10 7S2 14 2 12s4.5-7 10-7Zm0 2C8 7 4.7 10.1 4.1 12c.6 1.9 3.9 5 7.9 5s7.3-3.1 7.9-5C19.3 10.1 16 7 12 7Zm0 2a3 3 0 1 1 0 6a3 3 0 0 1 0-6Z"
      />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M3.3 2L2 3.3L5.2 6.5C3.2 8 2 10 2 12c0 2 4.5 7 10 7c2 0 3.8-.6 5.3-1.6l3.4 3.4L22 19.9L3.3 2zM7.9 9.2l1.6 1.6A3 3 0 0 0 9 12a3 3 0 0 0 4.9 2.2l1.6 1.6A7.3 7.3 0 0 1 12 17c-4 0-7.3-3.1-7.9-5c.3-.9 1-2 1.8-2.8Zm6.3-.5l-1.6-1.6c.4-.1.9-.1 1.4-.1c4 0 7.3 3.1 7.9 5c-.3.9-1 2-1.8 2.8l-2.1-2.1c.2-.5.4-1 .4-1.6a3 3 0 0 0-4.2-2.4Z"
      />
    </svg>
  );
}
EyeIcon.propTypes = { on: PropTypes.bool };

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      // await AuthAPI.login({ email, password: pw, remember })
      await new Promise((r) => setTimeout(r, 500)); // demo
      setMsg("✔ Logged in (demo). Wire to backend later.");
    } catch (err) {
      setMsg(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={s.form} onSubmit={onSubmit}>
      <div className={s.row}>
        <label className={s.label} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className={s.input}
          type="email"
          placeholder="yourname@mail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className={s.row}>
        <label className={s.label} htmlFor="password">
          Password
        </label>
        <div className={s.inputWrap}>
          <input
            id="password"
            className={s.input}
            type={show ? "text" : "password"}
            placeholder="********"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            className={s.eyeBtn}
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow((v) => !v)}
            title={show ? "Hide" : "Show"}
          >
            <EyeIcon on={show} />
          </button>
        </div>
      </div>

      <div className={s.rowLine}>
        <input
          id="remember"
          type="checkbox"
          checked={remember}
          onChange={() => setRemember(!remember)}
        />
        <label htmlFor="remember">Remember me</label>
      </div>

      <button className={s.submit} type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Log in"}
      </button>

      <hr className={s.hr} />

      <button
        className={s.altBtn}
        type="button"
        onClick={() => alert("Google OAuth hook here")}
      >
        <img
          alt=""
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          width="18"
          height="18"
        />
        Log in with Google
      </button>

      {msg && <div aria-live="polite">{msg}</div>}
    </form>
  );
}
