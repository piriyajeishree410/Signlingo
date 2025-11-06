import React, { useState } from "react";
import s from "./ProfilePage.module.css";
import avatar from "../../assets/images/avatar.png";

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "Nandana Pradeep",
    age: 22,
    email: "nandana@example.com",
    xp: 2400,
    xpGoal: 3000,
    streak: 12,
    level: 5,
    quizzesDone: 37,
  });
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const lessons = [
    { id: "alphabet", title: "Alphabet A–Z", progress: 82 },
    { id: "greetings", title: "Greetings & Essentials", progress: 45 },
    { id: "numbers", title: "Numbers 1–20", progress: 60 },
    { id: "daily", title: "Daily Phrases", progress: 20 },
  ];

  const quizzes = [
    { id: "quiz-1", title: "Alphabets Check", progress: 40 },
    { id: "quiz-2", title: "Greetings Sprint", progress: 70 },
    { id: "quiz-3", title: "Numbers Drill", progress: 10 },
  ];

  return (
    <div className={s.page}>
      <section className={s.profileCard}>
        <div className={s.headerRow}>
          <div className={s.userBlock}>
            <img
              className={s.avatar}
              src={avatar}
              alt="User avatar"
              onError={(e) => (e.currentTarget.style.visibility = "hidden")}
            />
            <div>
              <div className={s.nameRow}>
                <h1 className={s.name}>{user.name}</h1>
                {/* Edit & Delete icon buttons */}
                <button
                  className={s.iconBtn}
                  onClick={() => setShowEdit(true)}
                  title="Edit profile"
                >
                  {/* pencil */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M14.06 6.19l3.75 3.75"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                </button>
                <button
                  className={`${s.iconBtn} ${s.danger}`}
                  onClick={() => setShowDelete(true)}
                  title="Delete account"
                >
                  {/* trash */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 7h16M9 7V5h6v2m-8 0v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                </button>
              </div>
              <p className={s.subline}>
                <span>Age {user.age}</span> ·{" "}
                <a href={`mailto:${user.email}`}>{user.email}</a>
              </p>
              <p className={s.badge}>Bonus Booster • LV {user.level}</p>
            </div>
          </div>

          <div className={s.actions}>
            <button
              className={s.ghostBtn}
              onClick={() => (window.location.href = "/app/lessons")}
            >
              Continue Learning
            </button>
            <button
              className={s.primaryBtn}
              onClick={() => (window.location.href = "/app/quizzes")}
            >
              Start Quiz
            </button>
          </div>
        </div>

        <div className={s.xpRow}>
          <Progress value={user.xp} max={user.xpGoal} />
          <span className={s.xpText}>
            {user.xp} / {user.xpGoal} XP
          </span>
        </div>

        <div className={s.metrics}>
          <Metric label="Streak" value={user.streak} />
          <Metric label="Level" value={user.level} />
          <Metric label="Quizzes Done" value={user.quizzesDone} />
        </div>
      </section>

      {/* Lessons section */}
      <section className={s.sectionCard}>
        <div className={s.sectionHead}>
          <h2>Lessons in Progress</h2>
          <span className={s.count}>{lessons.length}</span>
        </div>
        <div className={s.itemGrid}>
          {lessons.map((l) => (
            <ItemCard
              key={l.id}
              title={l.title}
              progress={l.progress}
              onContinue={() =>
                (window.location.href = `/app/lessons?unit=${l.id}`)
              }
            />
          ))}
        </div>
      </section>

      {/* Quizzes section */}
      <section className={s.sectionCard}>
        <div className={s.sectionHead}>
          <h2>Quizzes</h2>
          <span className={s.count}>{quizzes.length}</span>
        </div>
        <div className={s.itemGrid}>
          {quizzes.map((qz) => (
            <ItemCard
              key={qz.id}
              title={qz.title}
              progress={qz.progress}
              onContinue={() =>
                (window.location.href = `/app/quizzes?quiz=${qz.id}`)
              }
            />
          ))}
        </div>
      </section>

      {/* Edit Modal */}
      {showEdit && (
        <EditProfileModal
          initial={user}
          onClose={() => setShowEdit(false)}
          onSave={(u) => {
            setUser((prev) => ({ ...prev, ...u }));
            setShowEdit(false);
          }}
        />
      )}

      {/* Delete Confirm */}
      {showDelete && (
        <ConfirmModal
          title="Delete account?"
          message="This action cannot be undone."
          confirmLabel="Delete"
          tone="danger"
          onCancel={() => setShowDelete(false)}
          onConfirm={() => {
            setShowDelete(false);
            // Do your API call here; for now redirect to login.
            window.location.href = "/login";
          }}
        />
      )}
    </div>
  );
}

function Progress({ value = 0, max = 100 }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div
      className={s.bar}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={s.fill} style={{ width: `${pct}%` }} />
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className={s.metricCard}>
      <div className={s.metricValue}>{value}</div>
      <div className={s.metricLabel}>{label}</div>
    </div>
  );
}

function ItemCard({ title, progress, onContinue }) {
  return (
    <article className={s.lessonItem}>
      <div className={s.lessonHeader}>
        <div className={s.lessonIcon} />
        <h3 className={s.lessonTitle}>{title}</h3>
      </div>
      <Progress value={progress} max={100} />
      <div className={s.lessonMeta}>
        <span>{progress}%</span>
        <button className={s.smallBtn} onClick={onContinue}>
          Continue
        </button>
      </div>
    </article>
  );
}

/* ----------------- Modals ----------------- */
function EditProfileModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    name: initial.name || "",
    age: initial.age ?? "",
    email: initial.email || "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "age" ? value.replace(/\D/g, "") : value,
    }));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    onSave({
      name: form.name.trim(),
      age: Number(form.age) || initial.age,
      email: form.email.trim(),
    });
  }

  return (
    <div className={s.backdrop} onClick={onClose}>
      <div
        className={s.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={s.modalHead}>
          <h3>Edit Profile</h3>
          <button className={s.modalClose} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form className={s.form} onSubmit={submit}>
          <label className={s.label}>
            <span>Name</span>
            <input
              className={s.input}
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>
          <label className={s.label}>
            <span>Age</span>
            <input
              className={s.input}
              name="age"
              value={form.age}
              onChange={handleChange}
              inputMode="numeric"
            />
          </label>
          <label className={s.label}>
            <span>Email</span>
            <input
              className={s.input}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <div className={s.modalActions}>
            <button type="button" className={s.ghostBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={s.primaryBtn}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  tone = "default",
  onCancel,
  onConfirm,
}) {
  return (
    <div className={s.backdrop} onClick={onCancel}>
      <div
        className={s.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={s.modalHead}>
          <h3>{title}</h3>
          <button
            className={s.modalClose}
            onClick={onCancel}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className={s.confirmBody}>
          <p>{message}</p>
        </div>
        <div className={s.modalActions}>
          <button className={s.ghostBtn} onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`${s.primaryBtn} ${tone === "danger" ? s.dangerSolid : ""}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
