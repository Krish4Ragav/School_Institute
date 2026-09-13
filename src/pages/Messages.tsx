import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Send,
  MessageSquareText,
  ChevronLeft,
  Paperclip,
  Smile,
  Users,
} from "lucide-react";
import { useApp } from "../store/AppContext";
import { studentsList } from "../data/students";
import { teachersList } from "../data/teachers";
import { users } from "../data/users";
import type { Conversation } from "../data/types";
import { Avatar, Badge, Button, Modal, EmptyState } from "../components/ui/primitives";

function convWeight(c: Conversation): number {
  const last = c.messages[c.messages.length - 1];
  if (!last) return 0;
  const t = last.time;
  if (t.startsWith("Just now")) return 100;
  if (t.startsWith("Today")) return 50;
  if (t.startsWith("Yesterday")) return 40;
  const day = Number(t.split(" ")[1] ?? "0");
  return 39 - day;
}

export default function Messages() {
  const { user, state, sendMessage } = useApp();
  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [mobilePane, setMobilePane] = useState<"list" | "chat">("list");
  const [newMsg, setNewMsg] = useState(false);

  const visible = useMemo(() => {
    if (!user) return [];
    return state.conversations
      .filter((c) => c.participantIds.includes(user.id))
      .filter((c) => {
        if (!q.trim()) return true;
        const search = c.participantIds.filter((id) => id !== user.id).map((id) => c.participantNames[id] ?? id).join(" ") + " " + c.messages.map((m) => m.text).join(" ");
        return search.toLowerCase().includes(q.trim().toLowerCase());
      })
      .sort((a, b) => convWeight(b) - convWeight(a));
  }, [state.conversations, user, q]);

  useEffect(() => {
    if (activeId && !visible.some((c) => c.id === activeId)) {
      setActiveId(null);
      setMobilePane("list");
    }
  }, [visible, activeId]);

  const active = visible.find((c) => c.id === activeId) ?? null;
  const otherId = active ? active.participantIds.find((id) => id !== user?.id) ?? "" : "";
  const otherName = active ? active.participantNames[otherId] ?? otherId : "";
  const unread = active?.messages.filter((m) => m.senderId !== user?.id && m.read === false).length ?? 0;

  const send = () => {
    if (!draft.trim() || !active) return;
    sendMessage(active.id, draft);
    setDraft("");
  };

  return (
    <>
      <div className="page-head" style={{ marginBottom: 18 }}>
        <div>
          <h1>Messages</h1>
          <div className="sub">School messaging · keep everyone in the loop</div>
        </div>
        <Button onClick={() => setNewMsg(true)}><Users size={16} /> New message</Button>
      </div>

      <div className="msgs-layout">
        {/* Conversation list */}
        <div className="conv-list" style={{ display: mobilePane === "list" ? undefined : "none" }}>
          <div className="cl-pad">
            <div className="input-search">
              <Search size={16} />
              <input className="input" placeholder="Search messages…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search conversations" />
            </div>
          </div>
          <div className="conv-scroll">
            {visible.map((c) => {
              const oid = c.participantIds.find((id) => id !== user?.id) ?? "";
              const name = c.participantNames[oid] ?? oid;
              const last = c.messages[c.messages.length - 1];
              const lastIsMe = last?.senderId === user?.id;
              return (
                <div
                  key={c.id}
                  className={`conv-item ${activeId === c.id ? "active" : ""}`}
                  onClick={() => {
                    setActiveId(c.id);
                    setMobilePane("chat");
                  }}
                >
                  <Avatar name={name} size={38} />
                  <div className="c-main">
                    <div className="c-name">
                      <span>{name}</span>
                      {last && <span className="c-time">{last.time.replace("Today ", "").replace("Yesterday ", "Yest ")}</span>}
                    </div>
                    <div className="c-preview">
                      {lastIsMe && <span style={{ color: "var(--text-4)" }}>You: </span>}
                      {last?.text ?? "No messages yet"}
                    </div>
                  </div>
                </div>
              );
            })}
            {visible.length === 0 && (
              <EmptyState title="No conversations" message="Search again or start a new message." />
            )}
          </div>
        </div>

        {/* Chat pane */}
        <div className="chat-pane" style={{ display: mobilePane === "chat" ? undefined : "none" }}>
          {active ? (
            <>
              <div className="chat-head">
                <button className="btn btn-ghost btn-icon btn-sm" style={{ display: mobilePane === "list" ? "none" : undefined }} onClick={() => setMobilePane("list")} aria-label="Back">
                  <ChevronLeft size={18} />
                </button>
                <Avatar name={otherName} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>{otherName}</div>
                  <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-3)" }}>
                    {unread > 0 ? `${unread} unread` : "Online"}
                  </div>
                </div>
                {unread > 0 && <Badge tone="rose">{unread}</Badge>}
              </div>
              <div className="chat-body">
                {active.messages.map((m) => {
                  const me = m.senderId === user?.id;
                  return (
                    <div key={m.id} className={`bubble ${me ? "me" : "them"}`}>
                      {m.text}
                      <span className="b-time">{m.time}</span>
                    </div>
                  );
                })}
              </div>
              <div className="chat-input-bar">
                <button className="topbar-icon-btn" aria-label="Attach"><Paperclip size={17} /></button>
                <input
                  className="input"
                  placeholder="Type a message…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  aria-label="Message"
                />
                <button className="topbar-icon-btn" aria-label="Emoji" onClick={() => setDraft((d) => d + " 🙂")}><Smile size={17} /></button>
                <Button onClick={send} disabled={!draft.trim()} icon><Send size={17} /></Button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <EmptyState
                title="Select a conversation"
                message="Choose a thread from the list to start reading and replying."
                action={<Button variant="outline" onClick={() => setNewMsg(true)}><MessageSquareText size={16} /> New message</Button>}
              />
            </div>
          )}
        </div>
      </div>

      {newMsg && <NewMessage onClose={() => setNewMsg(false)} onSelect={(cid) => { setActiveId(cid); setMobilePane("chat"); }} />}
    </>
  );
}

function NewMessage({ onClose, onSelect }: { onClose: () => void; onSelect: (conversationId: string) => void }) {
  const { user, state, createConversation } = useApp();
  const [q, setQ] = useState("");
  const [targetId, setTargetId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const resolveKey = (target: (typeof candidates)[number]): string => {
    const account = users.find((u) => u.id === target.id || u.studentId === target.id || u.teacherId === target.id);
    if (account) return account.id;
    return target.id.startsWith("s_") ? target.id : "c_" + target.id;
  };

  const candidates = useMemo(() => {
    if (user?.role === "teacher") {
      return studentsList.map((s) => ({
        id: s.id,
        name: s.name,
        sub: `Student · Class ${s.className}-${s.section}`
      }));
    }
    return teachersList.map((t) => ({
      id: t.empId,
      name: t.name,
      sub: `${t.subject} Teacher`
    }));
  }, [user?.role]);

  const filtered = candidates.filter((c) => (c.name + " " + c.sub).toLowerCase().includes(q.toLowerCase()));

  const findExisting = (theirKey: string) =>
    state.conversations.find((c) => c.participantIds.length === 2 && c.participantIds.includes(theirKey) && c.participantIds.includes(user?.id ?? ""));

  const send = () => {
    if (!targetId || !text.trim()) {
      setError("Choose a recipient and type a message.");
      return;
    }
    const target = candidates.find((c) => c.id === targetId)!;
    const theirKey = resolveKey(target);
    const existing = findExisting(theirKey);
    if (existing) {
      onClose();
      onSelect(existing.id);
      return;
    }
    createConversation([user?.id ?? "", theirKey], { [user?.id ?? ""]: user?.name ?? "", [theirKey]: target.name }, text.trim());
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="New message" footer={
      <>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={send}><Send size={16} /> Send message</Button>
      </>
    }>
      <div className="field">
        <label htmlFor="nm-target">Recipient</label>
        <div className="input-search">
          <Search size={16} />
          <input id="nm-target" className="input" placeholder="Search students / teachers…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <div style={{ maxHeight: 180, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 10, marginBottom: 14 }}>
        {filtered.map((c) => (
          <button
            key={c.id}
            className="search-result"
            style={{ background: targetId === c.id ? "var(--brand-50)" : undefined }}
            onClick={() => setTargetId(c.id)}
            type="button"
          >
            <Avatar name={c.name} size={32} />
            <span>
              <span className="sr-title" style={{ display: "block" }}>{c.name}</span>
              <span className="sr-sub" style={{ display: "block" }}>{c.sub}</span>
            </span>
            {targetId === c.id && <Badge tone="blue">Selected</Badge>}
          </button>
        ))}
      </div>
      <div className="field">
        <label htmlFor="nm-text">Message</label>
        <textarea id="nm-text" className="textarea" placeholder="Write your message…" value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      {error && <div className="form-error">{error}</div>}
    </Modal>
  );
}