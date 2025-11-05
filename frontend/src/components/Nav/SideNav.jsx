import { NavLink, useNavigate } from "react-router-dom";
import s from "./SideNav.module.css";

export default function SideNav({ onLogout }) {
  const navigate = useNavigate();
  const items = [
    { to: "/app/lessons", label: "Lessons", icon: HomeIcon },
    { to: "/app/quizzes", label: "Quizzes", icon: AbcIcon },
    { to: "/app/leaderboard", label: "Leaderboard", icon: ShieldIcon },
    { to: "/app/live", label: "Live Practice", icon: LiveIcon },
    { to: "/app/characters", label: "Characters", icon: PeopleIcon },
    { to: "/app/profile", label: "Profile", icon: ProfileIcon },
  ];

  return (
    <aside className={s.wrap} aria-label="Sidebar">
      <div
        className={s.brand}
        onClick={() => navigate("/app/lessons")}
        role="button"
        tabIndex={0}
      >
        <span className={s.logoDot} />
        <span className={s.brandText}>SignLingo</span>
      </div>

      <nav className={s.menu}>
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [s.item, isActive ? s.active : ""].join(" ")
            }
            end
          >
            <Icon className={s.icon} />
            <span className={s.label}>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={s.spacer} />

      <button
        className={`${s.item} ${s.logout}`}
        onClick={onLogout}
        type="button"
      >
        <LogoutIcon className={s.icon} />
        <span className={s.label}>Logout</span>
      </button>
    </aside>
  );
}

/* tiny inline icons */
function HomeIcon(p) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...p}>
      <path fill="currentColor" d="M12 3l9 8h-3v8h-5v-5H11v5H6v-8H3l9-8z" />
    </svg>
  );
}
function AbcIcon(p) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...p}>
      <path
        fill="currentColor"
        d="M3 17h2l.6-2h3.8l.6 2h2L8.9 7H7.1L3 17Zm3.1-3.5L7.2 9h.6l1.1 4.5H6.1ZM14 17h4a3 3 0 0 0 0-6h-4v6Zm2-2v-2h2a1 1 0 1 1 0 2h-2ZM20 11V9h-6v8h6v-2h-4v-2h3a2 2 0 1 0 0-4h-3Z"
      />
    </svg>
  );
}
function ShieldIcon(p) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...p}>
      <path
        fill="currentColor"
        d="M12 2l7 3v6c0 5.25-3.5 9.74-7 11c-3.5-1.26-7-5.75-7-11V5l7-3z"
      />
    </svg>
  );
}
function LiveIcon(p) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...p}>
      <path
        fill="currentColor"
        d="M4 7h10a3 3 0 0 1 3 3v1l3-2v6l-3-2v1a3 3 0 0 1-3 3H4V7Z"
      />
    </svg>
  );
}
function PeopleIcon(p) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...p}>
      <path
        fill="currentColor"
        d="M9 11a4 4 0 1 1 0-8a4 4 0 0 1 0 8Zm6 10H3v-1a6 6 0 0 1 6-6h0a6 6 0 0 1 6 6v1Zm3-10a3 3 0 1 1 0-6a3 3 0 0 1 0 6Zm3 10h-4v-1a4.5 4.5 0 0 0-2.1-3.8A5.99 5.99 0 0 1 18 14a5.99 5.99 0 0 1 2.1.36A4.5 4.5 0 0 1 21 20v1Z"
      />
    </svg>
  );
}
function ProfileIcon(p) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...p}>
      <path
        fill="currentColor"
        d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5Zm7 8H5v-1a7 7 0 0 1 14 0v1Z"
      />
    </svg>
  );
}
function LogoutIcon(p) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...p}>
      <path
        fill="currentColor"
        d="M16 17l5-5l-5-5v3H9v4h7v3ZM4 20h8v-2H6V6h6V4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
      />
    </svg>
  );
}
