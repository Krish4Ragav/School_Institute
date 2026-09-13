import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Megaphone, Plus, Pin, CalendarDays, UserRound, AlertTriangle } from "lucide-react";
import { useApp } from "../store/AppContext";
import { prettyDate } from "../data/helpers";
import type { Notice } from "../data/types";
import { Card, Badge, Button, Modal, EmptyState } from "../components/ui/primitives";

const categories: Notice["category"][] = ["General", "Academic", "Examination", "Holiday", "Event", "Emergency"];

const catTone: Record<Notice["category"], "blue" | "violet" | "orange" | "cyan" | "green" | "rose"> = {
  General: "blue",
  Academic: "violet",
  Examination: "orange",
  Holiday: "cyan",
  Event: "green",
  Emergency: "rose",
};

export default function Notices() {
  const { user, state } = useApp();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [cat, setCat] = useState<"all" | Notice["category"]>("all");
  const [priority, setPriority] = useState<"all" | Notice["priority"]>("all");
  const [opened, setOpened] = useState<Notice | null>(null);
  const [creating, setCreating] = useState(false);

  const list = useMemo(() => {
    return state.notices.filter((n) => {
      const mq = !query.trim() || (n.title + " " + n.content).toLowerCase().includes(query.trim().toLowerCase());
      const mc = cat === "all" || n.category === cat;
      const mp = priority === "all" || n.priority === priority;
      return mq && mc && mp;
    });
  }, [state.notices, query, cat, priority]);

  return (
    <>
      <div className="page-head" style={{ marginBottom: 18 }}>
        <div>
          <h1>Notices</h1>
          <div className="sub">Official announcements from School Institute</div>
        </div>
        {user?.role === "teacher" && (
          <Button onClick={() => setCreating(true)}><Plus size={17} /> Publish notice</Button>
        )}
      </div>

      <div className="chip-group" style={{ marginBottom: 8 }}>
        <button className={`chip ${cat === "all" ? "active" : ""}`} onClick={() => setCat("all")}>All</button>
        {categories.map((c) => (
          <button key={c} className={`chip ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ padding: "12px 16px" }}>
          <div className="filters-bar">
            <div className="input-search">
              <Megaphone size={16} />
              <input className="input" placeholder="Search notices…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search notices" />
            </div>
            <div className="select-field">
              <label className="sr-only" htmlFor="not-prio">Priority</label>
              <select id="not-prio" className="select" value={priority} onChange={(e) => setPriority(e.target.value as "all" | Notice["priority"])}>
                <option value="all">All priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <Badge tone="gray">{list.length} notices</Badge>
          </div>
        </div>
      </Card>

      <div className="grid grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {list.map((n) => (
          <Card key={n.id} hover className={`notice-card card-pad priority-${n.priority.toLowerCase()}`} style={{ cursor: "pointer" }} onClick={() => setOpened(n)}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
              <Badge tone={catTone[n.category]}>{n.category}</Badge>
              <Badge tone={n.priority === "High" ? "rose" : n.priority === "Medium" ? "amber" : "green"} dot>{n.priority}</Badge>
              {n.pinned && <Badge tone="gray"><Pin size={10} /> Pinned</Badge>}
              <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontSize: "var(--fs-xs)", color: "var(--text-3)", fontWeight: 600 }}>
                <CalendarDays size={12} /> {prettyDate(n.date)}
              </span>
            </div>
            <h3 style={{ fontSize: "var(--fs-lg)", marginBottom: 6 }}>{n.title}</h3>
            <p className="text-3" style={{ fontSize: "var(--fs-sm)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {n.content}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 10, fontSize: "var(--fs-xs)", color: "var(--text-3)", fontWeight: 600 }}>
              <UserRound size={12} /> {n.author}
            </div>
          </Card>
        ))}
      </div>
      {list.length === 0 && (
        <Card><EmptyState title="No notices found" message="Try a different category, priority or search term." /></Card>
      )}

      {opened && <NoticeModal notice={opened} onClose={() => setOpened(null)} />}
      {creating && <PublishNotice onClose={() => setCreating(false)} />}
    </>
  );
}

function NoticeModal({ notice, onClose }: { notice: Notice; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title="Notice details">
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <Badge tone={catTone[notice.category]}>{notice.category}</Badge>
        <Badge tone={notice.priority === "High" ? "rose" : notice.priority === "Medium" ? "amber" : "green"} dot>{notice.priority}</Badge>
      </div>
      <h3 style={{ fontSize: "var(--fs-xl)", marginBottom: 8 }}>{notice.title}</h3>
      <div className="kv"><span className="k"><CalendarDays size={13} /> Date</span><span className="v">{prettyDate(notice.date)}</span></div>
      <div className="kv" style={{ marginBottom: 12 }}><span className="k"><UserRound size={13} /> Author</span><span className="v">{notice.author}</span></div>
      <hr className="divider" />
      <p className="text-2" style={{ lineHeight: 1.75, whiteSpace: "pre-line", fontSize: "var(--fs-md)" }}>{notice.content}</p>
      <div className="modal-foot" style={{ margin: "16px -22px -20px" }}>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}

function PublishNotice({ onClose }: { onClose: () => void }) {
  const { publishNotice } = useApp();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Notice["category"]>("General");
  const [priority, setPriority] = useState<Notice["priority"]>("Medium");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Add a notice title.";
    if (!content.trim()) errs.content = "Write the notice content.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    publishNotice({ title: title.trim(), category, priority, content: content.trim() });
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Publish a notice" footer={
      <>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" form="pub-notice"><Megaphone size={16} /> Publish</Button>
      </>
    }>
      <form id="pub-notice" onSubmit={submit}>
        <div className="field">
          <label htmlFor="notice-title">Title <span className="req">*</span></label>
          <input id="notice-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Timetable change from Monday" />
          {errors.title && <div className="form-error">{errors.title}</div>}
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="notice-cat">Category</label>
            <select id="notice-cat" className="select" value={category} onChange={(e) => setCategory(e.target.value as Notice["category"])}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="notice-prio">Priority</label>
            <select id="notice-prio" className="select" value={priority} onChange={(e) => setPriority(e.target.value as Notice["priority"])}>
              <option>High</option><option>Medium</option><option>Low</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="notice-content">Content <span className="req">*</span></label>
          <textarea id="notice-content" className="textarea" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Describe the notice…" />
          {errors.content && <div className="form-error">{errors.content}</div>}
        </div>
        {priority === "High" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--amber-soft)", color: "#b45309", padding: "9px 12px", borderRadius: 10, fontSize: "var(--fs-sm)", fontWeight: 600 }}>
            <AlertTriangle size={15} /> High priority notices are highlighted for everyone.
          </div>
        )}
      </form>
    </Modal>
  );
}