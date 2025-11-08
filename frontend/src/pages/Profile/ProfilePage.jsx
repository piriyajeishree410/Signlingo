import React, { useMemo, useState } from "react";
import s from "./ProfilePage.module.css";
import avatar from "../../assets/images/avatar.png";
import useProfileOverview from "../../hooks/useProfileOverview";

export default function ProfilePage() {
  // modal states (useState #1 & #2)
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // custom hook (counts as another hook usage)
  const {
    loading,
    err,
    user,
    lessons,
    quizStats,
    updateProfile,
    deleteProfile,
  } = useProfileOverview();

  const quizProgressPct = useMemo(() => {
    // avoid divide-by-zero and clamp to 0..100
    if (!quizStats?.levelsUnlocked) return 0;
    const pct = (quizStats.levelsCompleted / quizStats.levelsUnlocked) * 100;
    return Math.max(0, Math.min(100, Math.round(pct)));
  }, [quizStats]);

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (err) return <div style={{ padding: 24 }}>{err}</div>;
  if (!user) return null;

  async function handleSaveProfile(form) {
    try {
      await updateProfile(form);
      setShowEdit(false);
    } catch (e) {
      alert(e.message || "Update failed");
    }
  }

  async function handleDeleteProfile() {
    try {
      await deleteProfile();
      setShowDelete(false);
      window.location.href = "/login";
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  }

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

                <button
                  type="button"
                  className={s.iconBtn}
                  onClick={() => setShowEdit(true)}
                  title="Edit profile"
                >
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
                  type="button"
                  className={`${s.iconBtn} ${s.danger}`}
                  onClick={() => setShowDelete(true)}
                  title="Delete account"
                >
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
                <span>Age {user.age ?? "—"}</span> ·{" "}
                <a href={`mailto:${user.email}`}>{user.email}</a>
              </p>
              <p className={s.badge}>Bonus Booster • LV {user.level}</p>
            </div>
          </div>

          <div className={s.actions}>
            <button
              type="button"
              className={s.ghostBtn}
              onClick={() => (window.location.href = "/app/lessons")}
            >
              Continue Learning
            </button>
            <button
              type="button"
              className={s.primaryBtn}
              onClick={() => (window.location.href = "/app/quizzes")}
            >
              Start Quiz
            </button>
          </div>
        </div>

        <div className={s.xpRow}>
          <Progress value={user.xp} max={user.xpGoal ?? 3000} />
          <span className={s.xpText}>
            {user.xp} / {user.xpGoal ?? 3000} XP
          </span>
        </div>

        <div className={s.metrics}>
          <Metric label="Streak" value={user.streak ?? 0} />
          <Metric label="Level" value={user.level ?? 1} />
          <Metric label="Quiz Levels" value={quizStats.levelsUnlocked} />
        </div>

        <div style={{ marginTop: 10, color: "#555", fontWeight: 700 }}>
          Total Quiz Score: {quizStats.totalScore}
        </div>
      </section>

      {/* Lessons */}
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
              onContinue={() => (window.location.href = `/app/lesson/${l.id}`)}
            />
          ))}
          {lessons.length === 0 && (
            <p style={{ color: "#666" }}>No active lessons yet.</p>
          )}
        </div>
      </section>

      {/* Quizzes */}
      <section className={s.sectionCard}>
        <div className={s.sectionHead}>
          <h2>Quizzes</h2>
          <span className={s.count}>{quizStats.levelsUnlocked}</span>
        </div>
        <div className={s.itemGrid}>
          <ItemCard
            title="Quiz Progress"
            progress={Math.max(
              0,
              Math.min(
                100,
                quizStats.levelsUnlocked
                  ? Math.round(quizStats.levelsUnlocked) * 10
                  : 0
              )
            )}
            onContinue={() => (window.location.href = `/app/quizzes`)}
          />
        </div>
        <div className={s.totalScore}>
          Total Quiz Score: {quizStats?.totalScore ?? 0}
        </div>
      </section>

      {/* Modals */}
      {showEdit && (
        <EditProfileModal
          initial={user}
          onClose={() => setShowEdit(false)}
          onSave={handleSaveProfile}
        />
      )}
      {showDelete && (
        <ConfirmModal
          title="Delete account?"
          message="This action cannot be undone."
          confirmLabel="Delete"
          tone="danger"
          onCancel={() => setShowDelete(false)}
          onConfirm={handleDeleteProfile}
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
        <button type="button" className={s.smallBtn} onClick={onContinue}>
          Continue
        </button>
      </div>
    </article>
  );
}

/* --- Modals (unchanged) --- */
function EditProfileModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    name: initial.name || "",
    age: initial.age ?? "",
    email: initial.email || "",
  });
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "age" ? value.replace(/\D/g, "") : value,
    }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        age: form.age ? Number(form.age) : null,
        email: form.email.trim(),
      });
    } finally {
      setSaving(false);
    }
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
          <button
            type="button"
            className={s.modalClose}
            onClick={onClose}
            aria-label="Close"
          >
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
            <button type="submit" className={s.primaryBtn} disabled={saving}>
              {saving ? "Saving..." : "Save"}
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
            type="button"
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
