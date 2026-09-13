import React, { useEffect } from "react";
import { X, Inbox, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { initials, avatarPalette } from "../../data/helpers";

/* ---------- cx helper ---------- */
export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* ---------- Avatar ---------- */
export function Avatar({
  name,
  size = 38,
  color,
  className,
}: {
  name: string;
  size?: 28 | 32 | 38 | 44 | 56 | 72 | 96;
  color?: string;
  className?: string;
}) {
  const computed = color ?? avatarPalette[(name.length * 7 + name.charCodeAt(0)) % avatarPalette.length];
  return (
    <span
      className={cx("avatar", `avatar-${size}`, className)}
      style={{ background: `linear-gradient(135deg, ${computed}, ${computed}cc)` }}
      aria-hidden="true"
    >
      <span className="initials">{initials(name)}</span>
    </span>
  );
}

/* ---------- Badge ---------- */
export type BadgeTone = "green" | "amber" | "rose" | "blue" | "violet" | "cyan" | "gray" | "orange";
const badgeMap: Record<BadgeTone, string> = {
  green: "badge-green",
  amber: "badge-amber",
  rose: "badge-rose",
  blue: "badge-blue",
  violet: "badge-violet",
  cyan: "badge-cyan",
  gray: "badge-gray",
  orange: "badge-orange",
};

export function Badge({
  tone = "gray",
  children,
  dot,
  className,
  style,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={cx("badge", badgeMap[tone], dot && "badge-dot", className)} style={style}>{children}</span>
  );
}

/* ---------- Button ---------- */
type BtnVariant = "primary" | "outline" | "ghost" | "danger" | "success" | "soft";
type BtnSize = "sm" | "md" | "lg";

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  block?: boolean;
  icon?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  block,
  icon,
  className,
  children,
  ...rest
}: BtnProps) {
  return (
    <button
      className={cx(
        "btn",
        `btn-${variant}`,
        size !== "md" && `btn-${size}`,
        block && "btn-block",
        icon && "btn-icon",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------- Card ---------- */
export function Card({
  children,
  className,
  hover,
  onClick,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <div className={cx("card", hover && "card-hover", className)} onClick={onClick} style={style}>
      {children}
    </div>
  );
}

export function CardHead({
  title,
  sub,
  actions,
  icon,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="card-head">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {icon && <span style={{ color: "var(--text-3)", display: "inline-flex" }}>{icon}</span>}
        <div>
          <h3>{title}</h3>
          {sub && <div className="head-sub">{sub}</div>}
        </div>
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}

/* ---------- StatCard ---------- */
export function StatCard({
  icon,
  color,
  value,
  label,
  foot,
  trend,
  trendDown,
  spark,
}: {
  icon: React.ReactNode;
  color: string;
  value: React.ReactNode;
  label: string;
  foot?: React.ReactNode;
  trend?: string;
  trendDown?: boolean;
  spark?: React.ReactNode;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className={cx("stat-icon")} style={{ background: color }}>
          {icon}
        </div>
        {foot && <div>{foot}</div>}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {trend && (
        <div className="stat-foot">
          {trendDown ? (
            <span className="trend-down">{trend}</span>
          ) : (
            <span className="trend-up">{trend}</span>
          )}
        </div>
      )}
      {spark && <div className="stat-spark">{spark}</div>}
    </div>
  );
}

/* ---------- EmptyState ---------- */
export function EmptyState({
  title = "Nothing here yet",
  message,
  action,
}: {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Inbox size={30} />
      </div>
      <h4>{title}</h4>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

/* ---------- Modal ---------- */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
  lg,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
  lg?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : "Dialog"}
        className={cx("modal", wide && "wide", lg && "lg")}
      >
        {title != null && (
          <div className="modal-head">
            <h3>{title}</h3>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Toast ---------- */
export function ToastStack({ toasts }: { toasts: { id: string; message: string; type: string }[] }) {
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={cx("toast", `toast-${t.type}`)} role="status">
          <span className="t-icon">
            {t.type === "success" && <CheckCircle2 size={18} />}
            {t.type === "error" && <AlertCircle size={18} />}
            {t.type === "info" && <Info size={18} />}
          </span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Skeleton ---------- */
export function Skeleton({ height = 16, width = "100%", style }: { height?: number; width?: string | number; style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ height, width, ...style }} />;
}

export function CardSkeleton() {
  return (
    <Card>
      <div className="card-body" style={{ padding: 18 }}>
        <Skeleton height={44} width={44} style={{ borderRadius: 14, marginBottom: 12 }} />
        <Skeleton height={24} width="60%" style={{ marginBottom: 8 }} />
        <Skeleton height={12} width="80%" />
      </div>
    </Card>
  );
}

/* ---------- Page head ---------- */
export function PageHead({
  title,
  sub,
  actions,
  breadcrumbs,
}: {
  title: string;
  sub?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; to?: string }[];
}) {
  return (
    <div>
      {breadcrumbs && (
        <nav className="breadcrumb" aria-label="Breadcrumb">
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="sep">/</span>}
              {b.to ? <a href={b.to}>{b.label}</a> : <span className="current">{b.label}</span>}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          {sub && <div className="sub">{sub}</div>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </div>
  );
}

/* ---------- Section title ---------- */
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="mini-title">{children}</div>;
}

/* ---------- Segmented tabs ---------- */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { value: T; label: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="tabs" role="tablist">
      {items.map((it) => (
        <button
          key={it.value}
          role="tab"
          aria-selected={it.value === value}
          className={cx("tab", it.value === value && "active")}
          onClick={() => onChange(it.value)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Progress bar ---------- */
export function Progress({ pct, color, sm, style }: { pct: number; color?: string; sm?: boolean; style?: React.CSSProperties }) {
  return (
    <div className={cx("progress", sm && "sm")} style={style} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className="bar" style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: color }} />
    </div>
  );
}