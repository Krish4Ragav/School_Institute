import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useApp } from "../../store/AppContext";
import { useT } from "../../i18n";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { navItems } from "./nav";
import { ToastStack } from "../ui/primitives";

function titleFor(pathname: string) {
  if (pathname === "/") return "Dashboard";
  for (const n of navItems) {
    if (pathname === n.path) return n.label;
  }
  if (pathname.startsWith("/exams")) return "Exams & Results";
  if (pathname === "/apply-leave") return "Apply for leave";
  const seg = pathname.split("/")[1];
  const cap = seg.charAt(0).toUpperCase() + seg.slice(1);
  return cap || "Dashboard";
}

export function Layout() {
  const { state } = useApp();
  const t = useT();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const unread = state.notifications.filter((n) => !n.read).length;
  const compact = state.settings.compact ? " compact-mode" : "";

  const title = useMemo(() => t(titleFor(location.pathname)), [location.pathname, t]);

  return (
    <div className={`app-shell${compact}`}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} unreadCount={unread} />
      <div className="app-body">
        <TopBar onMenu={() => setSidebarOpen(true)} title={title} />
        <main className="app-main">
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export function ToastHost() {
  const { toast } = useApp();
  return <ToastStack toasts={toast} />;
}