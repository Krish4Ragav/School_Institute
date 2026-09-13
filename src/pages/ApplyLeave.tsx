import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, FileText, ArrowLeft } from "lucide-react";
import { useApp } from "../store/AppContext";
import { studentsList } from "../data/students";
import { prettyDate, addDays, todayISO } from "../data/helpers";
import { Card, CardHead, Button } from "../components/ui/primitives";

type LeaveType = "Sick" | "Vacation" | "Family event" | "Personal" | "Other";

function daysBetween(from: string, to: string) {
  return Math.max(0, Math.round((new Date(to + "T00:00:00").getTime() - new Date(from + "T00:00:00").getTime()) / 86400000) + 1);
}

const leaveTypes: LeaveType[] = ["Sick", "Vacation", "Family event", "Personal", "Other"];

export default function ApplyLeave() {
  const { user, applyLeave } = useApp();
  const navigate = useNavigate();
  const child = studentsList.find((s) => s.id === user?.studentId);
  const [type, setType] = useState<LeaveType>("Sick");
  const [from, setFrom] = useState(addDays(todayISO(), 2));
  const [to, setTo] = useState(addDays(todayISO(), 2));
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const back = () => navigate("/leaves");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!from) errs.from = "Pick a start date.";
    if (!to) errs.to = "Pick an end date.";
    if (to && from && new Date(to) < new Date(from)) errs.to = "End date can't be before start.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    applyLeave({
      studentId: child?.id ?? "",
      studentName: child?.name ?? "",
      className: child?.className ?? 5,
      section: child?.section ?? "A",
      type,
      from,
      to,
      reason: reason.trim(),
      requestedBy: user?.name ?? "",
    });
    back();
  };

  return (
    <>
      <div className="page-head" style={{ marginBottom: 18 }}>
        <div>
          <h1>Apply for leave</h1>
          <div className="sub">Request time off for {child?.name ?? user?.name ?? "your child"}</div>
        </div>
        <div className="page-actions">
          <Button variant="outline" onClick={back}><ArrowLeft size={16} /> Cancel</Button>
          <Button type="submit" form="apply-leave"><ClipboardList size={16} /> Submit request</Button>
        </div>
      </div>

      <Card style={{ maxWidth: 640 }}>
        <CardHead title="Leave details" sub="Your request goes to your class teacher for approval" />
        <div className="card-body">
          <form id="apply-leave" onSubmit={submit}>
            <div className="field">
              <label htmlFor="lv-type">Leave type</label>
              <div className="chip-group" style={{ gap: 6 }}>
                {leaveTypes.map((t) => (
                  <button key={t} type="button" className={`chip ${type === t ? "active" : ""}`} onClick={() => setType(t)}>{t}</button>
                ))}
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="lv-from">From date <span className="req">*</span></label>
                <input id="lv-from" className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                {errors.from && <div className="form-error">{errors.from}</div>}
              </div>
              <div className="field">
                <label htmlFor="lv-to">To date <span className="req">*</span></label>
                <input id="lv-to" className="input" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
                {errors.to && <div className="form-error">{errors.to}</div>}
              </div>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="lv-reason">Reason (optional)</label>
              <textarea id="lv-reason" className="textarea" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Briefly explain…" />
            </div>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--text-4)", lineHeight: 1.55, marginTop: 14 }}>
              <FileText size={12} style={{ verticalAlign: -2 }} /> You'll be notified once {child ? "the class teacher" : "your teacher"} reviews this request. Dates: {prettyDate(from)} → {prettyDate(to)} ({daysBetween(from, to)} day{daysBetween(from, to) > 1 ? "s" : ""}).
            </p>
          </form>
        </div>
      </Card>
    </>
  );
}