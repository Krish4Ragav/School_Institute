import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck2, ClipboardList, Check, X, Clock3 } from "lucide-react";
import { useApp } from "../store/AppContext";
import { studentsList } from "../data/students";
import { teachersList } from "../data/teachers";
import { prettyDate } from "../data/helpers";
import { Card, CardHead, Badge, Button, EmptyState } from "../components/ui/primitives";
import type { LeaveRequest } from "../data/types";

type LeaveType = "Sick" | "Vacation" | "Family event" | "Personal" | "Other";

function daysBetween(from: string, to: string) {
  return Math.max(0, Math.round((new Date(to + "T00:00:00").getTime() - new Date(from + "T00:00:00").getTime()) / 86400000) + 1);
}

const typeTone: Record<LeaveType, "blue" | "rose" | "cyan" | "violet" | "orange"> = {
  Sick: "rose", Vacation: "cyan", "Family event": "violet", Personal: "blue", Other: "orange",
};

export default function Leaves() {
  const { user, state } = useApp();
  const navigate = useNavigate();
  const teacher = teachersList.find((t) => t.empId === user?.teacherId);
  const child = studentsList.find((s) => s.id === user?.studentId);
  const [tab, setTab] = useState<"mine" | "review">("mine");

  const isTeacher = user?.role === "teacher";
  const teacherClasses = teacher?.classes ?? [];

  const classLeaves = useMemo(() => {
    if (!isTeacher) return [];
    return state.leaves.filter((l) => {
      const s = studentsList.find((x) => x.id === l.studentId);
      return s && teacherClasses.includes(`${s.className}-${s.section}`);
    });
  }, [state.leaves, isTeacher, teacherClasses]);

  const myLeaves = useMemo(
    () =>
      (isTeacher ? classLeaves : state.leaves.filter((l) => l.studentId === child?.id)).sort((a, b) =>
        b.date.localeCompare(a.date)
      ),
    [isTeacher, classLeaves, state.leaves, child]
  );

  const reviewQueue = useMemo(() => classLeaves.filter((l) => l.status === "Pending"), [classLeaves]);

  const historySub = isTeacher
    ? teacherClasses.join(", ") || "Your classes"
    : child
      ? `${child.name} · Class ${child.className}-${child.section}`
      : undefined;

  const counts = {
    total: myLeaves.length,
    pending: myLeaves.filter((l) => l.status === "Pending").length,
    approved: myLeaves.filter((l) => l.status === "Approved").length,
  };

  return (
    <>
      <div className="page-head" style={{ marginBottom: 18 }}>
        <div>
          <h1>Leave Requests</h1>
          <div className="sub">{isTeacher ? "Review and grant leave" : "Apply and track leave"}</div>
        </div>
        {!isTeacher && <Button onClick={() => navigate("/apply-leave")}><ClipboardList size={16} /> Apply for leave</Button>}
      </div>

      {isTeacher && (
        <div className="chip-group" style={{ marginBottom: 18 }}>
          <button className={`chip ${tab === "mine" ? "active" : ""}`} onClick={() => setTab("mine")}>Class requests</button>
          <button className={`chip ${tab === "review" ? "active" : ""}`} onClick={() => setTab("review")}>Review requests {reviewQueue.length > 0 && <span className="chip-n">({reviewQueue.length})</span>}</button>
        </div>
      )}

      {tab === "mine" || !isTeacher ? (
        <>
          <div className="grid grid-3" style={{ marginBottom: 18 }}>
            <Card className="card-pad">
              <div className="stat-mini">
                <span className="stat-icon" style={{ background: "var(--brand-100)", color: "var(--brand-700)" }}><CalendarCheck2 size={16} /></span>
                <div>
                  <div className="t-strong" style={{ fontSize: "var(--fs-xl)" }}>{counts.total}</div>
                  <div className="text-3" style={{ fontSize: "var(--fs-sm)" }}>Total requests</div>
                </div>
              </div>
            </Card>
            <Card className="card-pad">
              <div className="stat-mini">
                <span className="stat-icon" style={{ background: "var(--amber-soft)", color: "var(--amber)" }}><Clock3 size={16} /></span>
                <div>
                  <div className="t-strong" style={{ fontSize: "var(--fs-xl)" }}>{counts.pending}</div>
                  <div className="text-3" style={{ fontSize: "var(--fs-sm)" }}>Pending approval</div>
                </div>
              </div>
            </Card>
            <Card className="card-pad">
              <div className="stat-mini">
                <span className="stat-icon" style={{ background: "var(--green-soft)", color: "var(--green)" }}><Check size={16} /></span>
                <div>
                  <div className="t-strong" style={{ fontSize: "var(--fs-xl)" }}>{counts.approved}</div>
                  <div className="text-3" style={{ fontSize: "var(--fs-sm)" }}>Approved</div>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <CardHead title="Request history" sub={historySub} />
            <div className="table-wrap">
              <table className="table table-responsive">
                <thead>
                  <tr><th>Type</th><th>Dates</th><th>Days</th><th>Reason</th><th>Submitted</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {myLeaves.map((l) => (
                    <tr key={l.id}>
                      <td data-label="Type"><Badge tone={typeTone[l.type as LeaveType]} dot>{l.type}</Badge></td>
                      <td data-label="Dates">
                        <span style={{ fontWeight: 600 }}>{prettyDate(l.from)} → {prettyDate(l.to)}</span>
                      </td>
                      <td data-label="Days">{daysBetween(l.from, l.to)} day{daysBetween(l.from, l.to) > 1 ? "s" : ""}</td>
                      <td data-label="Reason" className="text-3">{l.reason || "—"}</td>
                      <td data-label="Submitted" style={{ whiteSpace: "nowrap" }}>{prettyDate(l.date)}</td>
                      <td data-label="Status">
                        <Badge tone={l.status === "Approved" ? "green" : l.status === "Rejected" ? "rose" : "amber"} dot>{l.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {myLeaves.length === 0 && <EmptyState title="No leave requests yet" message="Apply for leave with a few taps." />}
            </div>
          </Card>
        </>
      ) : (
        <Card>
          <CardHead title="Review pending requests" sub={`${teacherClasses.join(", ") || "Your classes"} · as class mentor`} />
          <div className="card-body" style={{ paddingTop: 6 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {reviewQueue.map((l) => {
                const s = studentsList.find((x) => x.id === l.studentId);
                return <ReviewRow key={l.id} leave={l} studentName={s?.name ?? ""} />;
              })}
              {reviewQueue.length === 0 && (
                <EmptyState title="All caught up" message={`No pending leave requests from ${teacherClasses.join(", ") || "your classes"}.`} />
              )}
            </div>
          </div>
        </Card>
      )}
    </>
  );
}

function ReviewRow({ leave, studentName }: { leave: LeaveRequest; studentName: string }) {
  const { decideLeave } = useApp();
  return (
    <div className="review-row">
      <div className="review-ava">{studentName.charAt(0) || "S"}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700 }}>{studentName}</div>
        <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-3)", marginTop: 2 }}>
          {leave.type} · {prettyDate(leave.from)} → {prettyDate(leave.to)} ({daysBetween(leave.from, leave.to)} day{daysBetween(leave.from, leave.to) > 1 ? "s" : ""}){leave.reason ? ` — ${leave.reason}` : ""}
        </div>
      </div>
      <div className="review-actions" style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <Button size="sm" variant="success" onClick={() => decideLeave(leave.id, "Approved")}><Check size={14} /> Approve</Button>
        <Button size="sm" variant="outline" onClick={() => decideLeave(leave.id, "Rejected")}><X size={14} /> Reject</Button>
      </div>
    </div>
  );
}