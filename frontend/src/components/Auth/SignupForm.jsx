import { useState } from "react";
import PropTypes from "prop-types";
import s from "./SignupForm.module.css";
// import { AuthAPI } from "../../api/auth.api";

export default function SignupForm({ onSwitchToLogin }) {
  const [form, setForm] = useState({
    name: "",
    age: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      // await AuthAPI.signup({ ...form, age: Number(form.age) })
      await new Promise((r) => setTimeout(r, 600)); // demo
      setMsg("✔ Account created (demo). You can now login.");
    } catch (err) {
      setMsg(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={s.form} onSubmit={onSubmit}>
      <div className={s.row}>
        <label className={s.label} htmlFor="name">
          Name
        </label>
        <input
          id="name"
          className={s.input}
          value={form.name}
          onChange={set("name")}
          required
        />
      </div>

      <div className={s.grid2}>
        <div className={s.row}>
          <label className={s.label} htmlFor="age">
            Age
          </label>
          <input
            id="age"
            className={s.input}
            type="number"
            min="1"
            value={form.age}
            onChange={set("age")}
            required
          />
        </div>
        <div className={s.row}>
          <label className={s.label} htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            className={s.input}
            type="tel"
            placeholder="123-456-7890"
            value={form.phone}
            onChange={set("phone")}
            required
          />
        </div>
      </div>

      <div className={s.row}>
        <label className={s.label} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className={s.input}
          type="email"
          value={form.email}
          onChange={set("email")}
          required
        />
      </div>

      <div className={s.row}>
        <label className={s.label} htmlFor="password">
          New password
        </label>
        <input
          id="password"
          className={s.input}
          type="password"
          value={form.password}
          onChange={set("password")}
          required
        />
      </div>

      <button className={s.submit} type="submit" disabled={loading}>
        {loading ? "Creating..." : "Sign up"}
      </button>

      <p className={s.note}>
        Already have an account?
        <button className={s.link} type="button" onClick={onSwitchToLogin}>
          Login
        </button>
      </p>

      {msg && <div aria-live="polite">{msg}</div>}
    </form>
  );
}

SignupForm.propTypes = {
  onSwitchToLogin: PropTypes.func.isRequired,
};
