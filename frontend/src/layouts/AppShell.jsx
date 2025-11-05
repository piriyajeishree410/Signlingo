import { Outlet } from "react-router-dom";
import SideNav from "../components/Nav/SideNav.jsx";
import s from "./AppShell.module.css";

export default function AppShell() {
  const handleLogout = () => {
    // TODO: clear auth; for now just go to login
    window.location.href = "/login";
  };

  return (
    <div className={s.grid}>
      <SideNav onLogout={handleLogout} />
      <main className={s.content}>
        <Outlet />
      </main>
    </div>
  );
}
