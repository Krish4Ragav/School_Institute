import { NavLink } from "react-router-dom";
import { GraduationCap, School, X } from "lucide-react";
import { useApp } from "../../store/AppContext";
import { useT } from "../../i18n";
import { groupedNav, logoutNav } from "./nav";

export function Sidebar({
  open,
  onClose,
  unreadCount,
}: {
  open: boolean;
  onClose: () => void;
  unreadCount: number;
}) {
  const { user, state, logout } = useApp();
  const t = useT();
  if (!user) return null;
  const groups = groupedNav(user.role);
  const displayName = state.settings.name || user.name || "";
  const roleLabel =
    user.role === "teacher" ? "Teacher" : user.role === "parent" ? "Parent" : "Student";

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />}
      <aside className={`sidebar ${open ? "mobile-open" : ""}`} aria-label="Primary">
        <div className="sidebar-head">
          <div className="school-logo">
            <School size={24} />
          </div>
          <div className="sidebar-brand">
            <div className="name">School Institute</div>
            <div className="tagline">Connecting Students, Teachers & Parents</div>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm mobile-sidebar-toggle" onClick={onClose} aria-label="Close menu" style={{ marginLeft: "auto" }}>
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {groups.map((g) => (
            <div key={g.group}>
              <div className="nav-group-label">{t(g.group)}</div>
              {g.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  onClick={onClose}
                >
                  <item.icon />
                  <span>{t(item.label)}</span>
                  {item.path === "/messages" && unreadCount > 0 && (
                    <span className="nav-badge">{unreadCount}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
          <button className="nav-link" onClick={logout}>
            <logoutNav.icon />
            <span>{t(logoutNav.label)}</span>
          </button>
        </nav>

        <div className="sidebar-foot">
          <div className="sidebar-user">
            <span className="avatar avatar-32" style={{ background: `linear-gradient(135deg, ${user.avatarColor}, ${user.avatarColor}bb)` }}>
              {displayName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
            </span>
            <div>
              <div className="u-name">{displayName}</div>
              <div className="u-role">{roleLabel}</div>
            </div>
          </div>
          <GraduationCap size={16} />
        </div>
      </aside>
    </>
  );
}