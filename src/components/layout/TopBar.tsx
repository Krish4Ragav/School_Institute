import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  Menu,
  LogOut,
  User as UserIcon,
  CalendarHeart,
  FileClock,
  MessagesSquare,
  Wallet,
  Megaphone,
  ClipboardList,
  Users,
  Library as LibIcon,
} from "lucide-react";
import { useApp } from "../../store/AppContext";
import { useT } from "../../i18n";
import { navItems } from "./nav";
import { Avatar } from "../ui/primitives";
import { studentsList } from "../../data/students";
import { teachersList } from "../../data/teachers";
import { libraryBooks } from "../../data/library";
import { initialNotices } from "../../data/notices";
import { Role } from "../../data/types";

interface SearchResult {
  group: string;
  label: string;
  sub: string;
  icon: React.ReactNode;
  to: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  student: <Users size={16} />,
  teacher: <Users size={16} />,
  book: <LibIcon size={16} />,
  notice: <Megaphone size={16} />,
  assignment: <ClipboardList size={16} />,
  event: <CalendarHeart size={16} />,
  leave: <FileClock size={16} />,
  message: <MessagesSquare size={16} />,
  fee: <Wallet size={16} />,
};

function buildIndex(role: Role): SearchResult[] {
  const out: SearchResult[] = [];
  for (const n of navItems.filter((i) => i.roles.includes(role))) {
    out.push({ group: "Pages", label: n.label, sub: "Navigate to page", icon: <n.icon size={16} />, to: n.path });
  }
  if (role === "teacher") {
    for (const s of studentsList) {
      out.push({ group: "Students", label: s.name, sub: `Class ${s.className}-${s.section} · ${s.id}`, icon: typeIcons.student, to: `/students?student=${s.id}` });
    }
    for (const t of teachersList) {
      out.push({ group: "Teachers", label: t.name, sub: `${t.subject} · ${t.empId}`, icon: typeIcons.teacher, to: `/teachers?q=${encodeURIComponent(t.name)}` });
    }
  } else if (role === "parent" || role === "student") {
    for (const n of initialNotices) {
      out.push({ group: "Notices", label: n.title, sub: n.category, icon: typeIcons.notice, to: `/notices?q=${encodeURIComponent(n.title)}` });
    }
  }
  for (const b of libraryBooks) {
    out.push({ group: "Library", label: b.title, sub: `${b.author} · ${b.category}`, icon: typeIcons.book, to: `/library?q=${encodeURIComponent(b.title)}` });
  }
  for (const n of initialNotices.slice(0, 6)) {
    out.push({ group: "Notices", label: n.title, sub: n.category, icon: typeIcons.notice, to: `/notices?q=${encodeURIComponent(n.title)}` });
  }
  return out;
}

export function TopBar({ onMenu, title }: { onMenu: () => void; title: string }) {
  const { user, state, markNotificationsRead, logout } = useApp();
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unread = state.notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!user) return;
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      return;
    }
    const idx = buildIndex(user.role);
    const matches = idx
      .filter((r) => (r.label + " " + r.sub).toLowerCase().includes(q))
      .slice(0, 10);
    setResults(matches);
  }, [query, user]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    setShowResults(false);
    setShowNotif(false);
    setShowProfile(false);
  }, [location]);

  if (!user) return null;

  const displayName = state.settings.name || user.name || "";
  const roleLabel =
    user.role === "teacher" ? "Teacher" : user.role === "parent" ? "Parent" : "Student";

  const go = (to: string) => {
    setShowResults(false);
    setQuery("");
    navigate(to);
  };

  return (
    <header className="topbar">
      <button className="topbar-icon-btn hamburger" onClick={onMenu} aria-label="Open menu">
        <Menu size={20} />
      </button>
      <h1 className="topbar-title">{t(title)}</h1>
      <div className="spacer" />
      <div className="topbar-search" ref={searchRef}>
        <label className="sr-only" htmlFor="global-search">{t("Search")}</label>
        <Search size={17} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-4)", pointerEvents: "none" }} />
        <input
          id="global-search"
          className="input"
          placeholder={t("Search students, books, notices…")}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results.length > 0) go(results[0].to);
          }}
        />
        {showResults && query.trim() && (
          <div className="topbar-search-results">
            {results.length === 0 ? (
              <div className="search-empty">No results for “{query}”</div>
            ) : (
              results.map((r, i) => (
                <button key={i} className="search-result" onClick={() => go(r.to)}>
                  <span className="avatar avatar-32" style={{ background: "var(--brand-50)", color: "var(--brand-700)" }}>
                    {r.icon}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span className="sr-title" style={{ display: "block" }}>{r.label}</span>
                    <span className="sr-sub" style={{ display: "block" }}>{r.sub}</span>
                  </span>
                  <span className="sr-sub" style={{ marginLeft: "auto", fontSize: 10 }}>{r.group}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div style={{ position: "relative" }} ref={notifRef}>
        <button
          className="topbar-icon-btn"
          aria-label={`Notifications (${unread} unread)`}
          onClick={() => {
            setShowNotif((v) => !v);
            setShowProfile(false);
          }}
        >
          <Bell size={19} />
          {unread > 0 && <span className="count">{unread}</span>}
        </button>
        {showNotif && (
          <div className="notif-panel">
            <div className="np-head">
              <h4>{t("Notifications")}</h4>
              <button className="btn btn-ghost btn-sm" onClick={markNotificationsRead}>
                {t("Mark all read")}
              </button>
            </div>
            <div className="notif-list">
              {state.notifications.length === 0 && (
                <div className="empty" style={{ padding: 24 }}>
                  <p>{t("You're all caught up!")}</p>
                </div>
              )}
              {state.notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notif-item ${n.read ? "" : "unread"}`}
                  onClick={() => {
                    markNotificationsRead();
                    setShowNotif(false);
                    const map: Record<string, string> = {
                      assignment: "/assignments",
                      meeting: "/events",
                      exam: "/exams",
                      attendance: "/attendance",
                      notice: "/notices",
                      fee: "/fees",
                      message: "/messages",
                      event: "/events",
                      result: "/exams",
                    };
                    navigate(map[n.type] ?? "/");
                  }}
                >
                  <span className="n-icon" style={{ background: "var(--brand-50)", color: "var(--brand-600)" }}>
                    {typeIcons[n.type] ?? <Bell size={16} />}
                  </span>
                  <span className="n-text">
                    <span className="n-title">{n.title}</span>
                    <div className="n-text" style={{ fontSize: 12, color: "var(--text-3)", marginTop: 1 }}>{n.text}</div>
                    <div className="n-time">{n.time}</div>
                  </span>
                  {!n.read && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brand-500)", flexShrink: 0, marginTop: 4 }} />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ position: "relative" }} ref={profileRef}>
        <button className="profile-chip" onClick={() => { setShowProfile((v) => !v); setShowNotif(false); }}>
          <Avatar name={displayName} size={32} color={user.avatarColor} />
          <span className="pc-text">
            <span className="pc-name" style={{ display: "block" }}>{displayName}</span>
            <span className="pc-role" style={{ display: "block" }}>{roleLabel}</span>
          </span>
        </button>
        {showProfile && (
          <div className="menu" role="menu">
            <div className="menu-item" onClick={() => navigate("/settings")}>
              <UserIcon size={16} /> {t("Profile & Settings")}
            </div>
            <div className="menu-sep" />
            <button className="menu-item danger" onClick={logout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}