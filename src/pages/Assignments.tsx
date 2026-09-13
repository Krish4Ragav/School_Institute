import React, { useMemo, useState } from "react";
import {
  Plus,
  FileText,
  CalendarClock,
  CheckCircle2,
  Send,
  Search,
  ClipboardList,
  UserRound,
} from "lucide-react";
import { useApp } from "../store/AppContext";
import { studentsList, subjectsForClass } from "../data/students";
import { teachersList } from "../data/teachers";
import { daysBetween, todayISO, prettyDate } from "../data/helpers";
import { assignmentStatusFor } from "../utils/stats";
import type { Assignment } from "../data/types";
import { Card, Badge, Button, Modal, Avatar, EmptyState, Progress } from "../components/ui/primitives";

function DueChip({ dueDate }: { dueDate: string }) {
  const days = daysBetween(todayISO(), dueDate);
  const cls = days < 0 ? "due-today" : days === 0 ? "due-today" : days <= 3 ? "due-soon" : "due-ok";
  const label = days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Due today" : days === 1 ? "Due tomorrow" : `Due in ${days} days`;
  return <span className={`due-chip ${cls}`}>{label}</span>;
}

export default function Assignments() {
  const { user, state } = useApp();
  const role = user?.role;
  const student = studentsList.find((s) => s.id === user?.studentId);
  const teacher = teachersList.find((t) => t.empId === user?.teacherId);

  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [opened, setOpened] = useState<Assignment | null>(null);
  const [creating, setCreating] = useState(false);
  const [submissionsOf, setSubmissionsOf] = useState<Assignment | null>(null);

  const baseList = useMemo(() => {
    let list = state.assignments;
    if (role === "student" || role === "parent") {
      list = list.filter((a) => a.className === student?.className && a.section === student?.section);
    }
    return list;
  }, [state.assignments, role, student, teacher]);

  const filtered = useMemo(() => {
    return baseList.filter((a) => {
      const matchQ = !q.trim() || (a.title + " " + a.subject).toLowerCase().includes(q.trim().toLowerCase());
      const matchSub = subject === "all" || a.subject === subject;
      let matchStatus = true;
      if (role === "teacher") {
        matchStatus = statusFilter === "all" || (statusFilter === "done" ? a.submissions.every((s) => s.status !== "Pending") : a.submissions.some((s) => s.status === "Pending"));
      } else if (student) {
        const myStatus = assignmentStatusFor(a, student.id);
        if (statusFilter === "done") matchStatus = myStatus !== "Pending";
        if (statusFilter === "pending") matchStatus = myStatus === "Pending";
      }
      return matchQ && matchSub && matchStatus;
    });
  }, [baseList, q, subject, statusFilter, role, student]);

  const subjects = useMemo(
    () => Array.from(new Set(baseList.map((a) => a.subject))),
    [baseList]
  );

  return (
    <>
      <div className="page-head" style={{ marginBottom: 18 }}>
        <div>
          <h1>Assignments</h1>
          <div className="sub">
            {role === "teacher" ? "Create assignments and track submissions" : role === "parent" ? `${student?.name}'s homework and assignments` : "Your homework and assignments"}
          </div>
        </div>
        {role === "teacher" && (
          <div className="page-actions">
            <Button onClick={() => setCreating(true)}><Plus size={17} /> New assignment</Button>
          </div>
        )}
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ padding: "14px 16px" }}>
          <div className="filters-bar">
            <div className="input-search">
              <Search size={16} />
              <input className="input" placeholder="Search assignments…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search assignments" />
            </div>
            <div className="select-field">
              <label className="sr-only" htmlFor="asg-subject">Subject</label>
              <select id="asg-subject" className="select" value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="all">All subjects</option>
                {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="select-field">
              <label className="sr-only" htmlFor="asg-status">Status</label>
              <select id="asg-status" className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="done">Submitted</option>
              </select>
            </div>
            <span className="text-3" style={{ marginLeft: "auto", fontSize: "var(--fs-sm)", fontWeight: 600 }}>{filtered.length} shown</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {filtered.map((a) => {
          const myStatus = student ? assignmentStatusFor(a, student.id) : undefined;
          const doneCount = a.submissions.filter((s) => s.status !== "Pending").length;
          const subForMe = student ? a.submissions.find((s) => s.studentId === student.id) : undefined;
          return (
            <Card key={a.id} hover className="assignment-card">
              <div className="card-body">
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                  <span className="tag" style={{ background: "var(--brand-50)", color: "var(--brand-700)" }}>{a.subject}</span>
                  <Badge tone="gray">Class {a.className}-{a.section}</Badge>
                  {role === "student" || role === "parent" ? (
                    <Badge tone={myStatus === "Pending" ? "amber" : "green"} dot>{myStatus}</Badge>
                  ) : (
                    <Badge tone="gray">{doneCount}/{a.submissions.length} submitted</Badge>
                  )}
                </div>
                <h3 style={{ fontSize: "var(--fs-lg)", marginBottom: 4 }}>{a.title}</h3>
                <div className="text-3" style={{ fontSize: "var(--fs-sm)", marginBottom: 12 }}>
                  Assigned by {a.teacher} · Assigned {prettyDate(a.assignedDate)}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                  <span className="text-2" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "var(--fs-sm)", fontWeight: 600 }}>
                    <CalendarClock size={15} style={{ color: "var(--brand-600)" }} /> <DueChip dueDate={a.dueDate} />
                  </span>
                  {(role === "student" || role === "parent") && subForMe?.status === "Graded" && subForMe.score != null && (
                    <Badge tone="blue">Score {subForMe.score}/{subForMe.maxScore}</Badge>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button variant="outline" size="sm" onClick={() => setOpened(a)}><FileText size={15} /> Open</Button>
                  {role === "teacher" && (
                    <Button variant="soft" size="sm" onClick={() => setSubmissionsOf(a)}><UserRound size={15} /> Submissions</Button>
                  )}
                  {role === "student" && myStatus === "Pending" && (
                    <Button size="sm" onClick={() => setOpened(a)}><Send size={15} /> Submit</Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <Card><EmptyState title="No assignments found" message="Try a different subject or status filter." /></Card>
      )}

      {opened && (
        <AssignmentModal assignment={opened} onClose={() => setOpened(null)} studentId={student?.id} />
      )}
      {creating && <CreateAssignment onClose={() => setCreating(false)} teacherName={teacher?.name ?? ""} />}
      {submissionsOf && <SubmissionsModal assignment={submissionsOf} onClose={() => setSubmissionsOf(null)} />}
    </>
  );
}

function AssignmentModal({ assignment, onClose, studentId }: { assignment: Assignment; onClose: () => void; studentId?: string }) {
  const { submitAssignment } = useApp();
  const sub = studentId ? assignment.submissions.find((s) => s.studentId === studentId) : undefined;
  const isMinePending = !!studentId && (sub?.status ?? "Pending") === "Pending";
  const [submitted, setSubmitted] = useState(false);

  return (
    <Modal open onClose={onClose} title="Assignment details">
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <span className="tag" style={{ background: "var(--brand-50)", color: "var(--brand-700)", fontSize: "var(--fs-sm)" }}>{assignment.subject}</span>
        <Badge tone="gray">Class {assignment.className}-{assignment.section}</Badge>
        {sub && <Badge tone={sub.status === "Pending" ? "amber" : "green"} dot>{sub.status}</Badge>}
      </div>
      <h3 style={{ fontSize: "var(--fs-xl)", marginBottom: 10 }}>{assignment.title}</h3>
      <div className="kv"><span className="k">Assigned by</span><span className="v">{assignment.teacher}</span></div>
      <div className="kv"><span className="k">Assigned on</span><span className="v">{prettyDate(assignment.assignedDate)}</span></div>
      <div className="kv"><span className="k">Due date</span><span className="v"><DueChip dueDate={assignment.dueDate} /></span></div>
      <hr className="divider" />
      <div className="section-title" style={{ fontWeight: 700, marginBottom: 8 }}>Instructions</div>
      <p className="text-2" style={{ fontSize: "var(--fs-md)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{assignment.description}</p>

      <hr className="divider" />
      {studentId ? (
        isMinePending && !submitted ? (
          <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
            <span style={{ fontSize: "var(--fs-sm)", color: "var(--text-3)" }}>
              <ClipboardList size={14} style={{ verticalAlign: -2 }} /> Submit your file or notes to mark this as done.
            </span>
            <Button onClick={() => { submitAssignment(assignment.id); setSubmitted(true); }}>
              <Send size={16} /> Submit assignment
            </Button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--green)", fontWeight: 600, fontSize: "var(--fs-md)" }}>
            <CheckCircle2 size={17} /> {submitted ? "Submitted! Your teacher has been notified." : `Submitted on ${sub?.submittedAt ?? "recorded"}.`}
          </div>
        )
      ) : (
        <p className="text-3" style={{ fontSize: "var(--fs-sm)" }}>Log in as a student to submit this assignment.</p>
      )}
      <div className="modal-foot" style={{ margin: "16px -22px -20px" }}>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}

function CreateAssignment({ onClose, teacherName }: { onClose: () => void; teacherName: string }) {
  const { createAssignment } = useApp();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("English");
  const [className, setClassName] = useState("5");
  const [section, setSection] = useState("A");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Give the assignment a title.";
    if (!dueDate) errs.dueDate = "Pick a due date.";
    if (!description.trim()) errs.description = "Add a short description / instructions.";
    if (daysBetween(todayISO(), dueDate) < 0 && dueDate) errs.dueDate = "Due date can't be in the past.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    createAssignment({ title: title.trim(), subject, className: Number(className), section, dueDate, description: description.trim() });
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Create assignment" footer={
      <>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" form="create-asg">Publish assignment</Button>
      </>
    }>
      <form id="create-asg" onSubmit={submit}>
        <div className="field">
          <label htmlFor="asg-title">Title <span className="req">*</span></label>
          <input id="asg-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fractions Practice Sheet" />
          {errors.title && <div className="form-error">{errors.title}</div>}
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="asg-subject2">Subject</label>
            <select id="asg-subject2" className="select" value={subject} onChange={(e) => setSubject(e.target.value)}>
              {Array.from(new Set(subjectsForClass(5).concat(["English", "Mathematics", "Science", "Social Studies", "Hindi", "Computer Studies"]))).map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="asg-due">Due date</label>
            <input id="asg-due" type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            {errors.dueDate && <div className="form-error">{errors.dueDate}</div>}
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="asg-class2">Class</label>
            <select id="asg-class2" className="select" value={className} onChange={(e) => setClassName(e.target.value)}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((c) => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="asg-sec2">Section</label>
            <select id="asg-sec2" className="select" value={section} onChange={(e) => setSection(e.target.value)}>
              <option value="A">A</option><option value="B">B</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="asg-desc">Instructions <span className="req">*</span></label>
          <textarea id="asg-desc" className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what students need to do…" />
          {errors.description && <div className="form-error">{errors.description}</div>}
        </div>
        <div className="field" style={{ margin: 0, fontSize: "var(--fs-xs)", color: "var(--text-4)" }}>
          Publishing as {teacherName || "Teacher"} · Students will see it immediately.
        </div>
      </form>
    </Modal>
  );
}

function SubmissionsModal({ assignment, onClose }: { assignment: Assignment; onClose: () => void }) {
  const { gradeSubmission } = useApp();
  const [scores, setScores] = useState<Record<string, string>>({});
  const roster = studentsList.filter((s) => s.className === assignment.className && s.section === assignment.section);
  const total = assignment.submissions.length || roster.length;
  const done = assignment.submissions.filter((s) => s.status !== "Pending").length;

  const graded = (sid: string, score: number) => {
    gradeSubmission(assignment.id, sid, score);
  };

  return (
    <Modal open onClose={onClose} title={`Submissions · ${assignment.title}`} wide>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
        <Badge tone="blue">{done}/{total} submitted</Badge>
        <Badge tone="gray">Max 20</Badge>
        <Progress pct={done / Math.max(1, total) * 100} style={{ flex: 1, minWidth: 120 }} />
      </div>
      <div className="table-wrap">
        <table className="table nowrap">
          <thead>
            <tr><th>Student</th><th>Status</th><th>Submitted</th><th>Score (out of 20)</th><th /></tr>
          </thead>
          <tbody>
            {roster.map((s) => {
              const sub = assignment.submissions.find((x) => x.studentId === s.id);
              const status = sub?.status ?? "Pending";
              const val = scores[s.id] ?? (sub?.score?.toString() ?? "");
              return (
                <tr key={s.id}>
                  <td>
                    <div className="t-main">
                      <Avatar name={s.name} size={32} color={s.avatarColor} />
                      <div><div className="t-strong">{s.name}</div><div className="meta">{s.id}</div></div>
                    </div>
                  </td>
                  <td><Badge tone={status === "Pending" ? "amber" : status === "Submitted" ? "blue" : "green"} dot>{status}</Badge></td>
                  <td className="mono">{sub?.submittedAt ?? "—"}</td>
                  <td>
                    {status === "Pending" ? (
                      <span className="text-4">—</span>
                    ) : (
                      <input
                        className="input"
                        type="number"
                        min={0}
                        max={20}
                        style={{ width: 80 }}
                        value={val}
                        onChange={(e) => setScores((p) => ({ ...p, [s.id]: e.target.value }))}
                        aria-label={`Score for ${s.name}`}
                      />
                    )}
                  </td>
                  <td>
                    {status !== "Pending" && (
                      <Button size="sm" variant="success" disabled={!val} onClick={() => graded(s.id, Number(val))}>
                        Save
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="modal-foot" style={{ margin: "16px -22px -20px" }}>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}