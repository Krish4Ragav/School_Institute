import React, { useState } from "react";
import { Wallet, CreditCard, Building2, Landmark, CheckCircle2, Receipt, BadgeCheck, GraduationCap, Award, Bus, BookOpen } from "lucide-react";
import { useApp } from "../store/AppContext";
import { studentsList } from "../data/students";
import { inr, prettyDate } from "../data/helpers";
import type { FeeRecord } from "../data/types";
import { Card, CardHead, Badge, Button, Modal, EmptyState } from "../components/ui/primitives";

const typeMeta: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  "Tuition Fee": { icon: <GraduationCap size={14} />, color: "#1d4ed8", bg: "var(--brand-100)" },
  "Examination Fee": { icon: <Award size={14} />, color: "#6d28d9", bg: "var(--violet-soft)" },
  "Transport Fee": { icon: <Bus size={14} />, color: "#0e7490", bg: "var(--cyan-soft)" },
  "Library Fee": { icon: <BookOpen size={14} />, color: "#b45309", bg: "var(--amber-soft)" },
};

export default function Fees() {
  const { user, state } = useApp();
  const child = studentsList.find((s) => s.id === user?.studentId);
  const fees = state.fees.filter((f) => f.studentId === child?.id);
  const [paying, setPaying] = useState<FeeRecord | null>(null);

  const totalDue = fees.reduce((s, f) => s + (f.amount - f.paid), 0);
  const totalPaid = fees.reduce((s, f) => s + f.paid, 0);

  return (
    <>
      <div className="page-head" style={{ marginBottom: 18 }}>
        <div>
          <h1>Fees</h1>
          <div className="sub">
            {user?.role === "parent" ? `${child?.name}'s fee account` : "Your fee account"}
          </div>
        </div>
        {totalDue > 0 && (
          <Button onClick={() => setPaying(fees.find((f) => f.status !== "Paid") ?? null)}>
            <Wallet size={17} /> Pay pending fees
          </Button>
        )}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginBottom: 18 }}>
        <Card className="card-pad">
          <div style={{ fontSize: "var(--fs-xl)", fontWeight: 800, fontFamily: "var(--font-head)", color: totalDue > 0 ? "var(--rose)" : "var(--green)" }}>{inr(totalDue)}</div>
          <div style={{ color: "var(--text-3)", fontWeight: 500, fontSize: "var(--fs-sm)" }}>Total due ({fees.filter((f) => f.status !== "Paid").length} instalments)</div>
        </Card>
        <Card className="card-pad">
          <div style={{ fontSize: "var(--fs-xl)", fontWeight: 800, fontFamily: "var(--font-head)", color: "var(--green)" }}>{inr(totalPaid)}</div>
          <div style={{ color: "var(--text-3)", fontWeight: 500, fontSize: "var(--fs-sm)" }}>Total paid this term</div>
        </Card>
        <Card className="card-pad">
          <div style={{ fontSize: "var(--fs-xl)", fontWeight: 800, fontFamily: "var(--font-head)" }}>{fees.length}</div>
          <div style={{ color: "var(--text-3)", fontWeight: 500, fontSize: "var(--fs-sm)" }}>Fee heads (Tuition, Exam, Transport, Library)</div>
        </Card>
      </div>

      <Card>
        <CardHead title="Fee statement" sub="Academic year 2026–27 · Term 2" />
        <div className="table-wrap">
          <table className="table table-responsive nowrap">
            <thead>
              <tr><th>Fee type</th><th>Amount</th><th>Paid</th><th>Pending</th><th>Due date</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {fees.map((f) => {
                const meta = typeMeta[f.type];
                const pending = f.amount - f.paid;
                const done = f.status === "Paid";
                return (
                  <tr key={f.id}>
                    <td data-label="Fee type">
                      <div className="t-main">
                        <span className="fee-type-chip" style={{ background: meta.bg, color: meta.color }}>{meta.icon}{f.type}</span>
                        <div className="t-strong" style={{ fontSize: "var(--fs-sm)" }}>{child?.name}</div>
                      </div>
                    </td>
                    <td data-label="Amount" className="mono">{inr(f.amount)}</td>
                    <td data-label="Paid" className="mono" style={{ color: "var(--green)", fontWeight: 600 }}>{inr(f.paid)}</td>
                    <td data-label="Pending" className="mono" style={{ color: pending > 0 ? "var(--rose)" : "var(--text-4)", fontWeight: 600 }}>{inr(pending)}</td>
                    <td data-label="Due date">{prettyDate(f.dueDate)}</td>
                    <td data-label="Status">
                      <Badge tone={done ? "green" : f.status === "Partial" ? "amber" : "rose"} dot>{f.status}</Badge>
                    </td>
                    <td data-label="">
                      {done ? (
                        <Button variant="ghost" size="sm" disabled><CheckCircle2 size={16} style={{ color: "var(--green)" }} /></Button>
                      ) : (
                        <Button size="sm" onClick={() => setPaying(f)}>Pay now</Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {fees.length === 0 && <EmptyState title="No fees on record" />}
        </div>
      </Card>

      {paying && <PayModal fee={paying} onClose={() => setPaying(null)} />}
    </>
  );
}

const methods = [
  { id: "upi", label: "UPI", sub: "GPay / PhonePe / BHIM", icon: <Landmark size={18} /> },
  { id: "card", label: "Card", sub: "Credit / Debit", icon: <CreditCard size={18} /> },
  { id: "netbanking", label: "Net Banking", sub: "All major banks", icon: <Building2 size={18} /> },
];

function PayModal({ fee, onClose }: { fee: FeeRecord; onClose: () => void }) {
  const { user, payFee } = useApp();
  const child = studentsList.find((s) => s.id === fee.studentId);
  const [method, setMethod] = useState("upi");
  const [phase, setPhase] = useState<"form" | "processing" | "done">("form");
  const pending = fee.amount - fee.paid;

  const start = () => {
    setPhase("processing");
    window.setTimeout(() => {
      payFee(fee.id, methods.find((m) => m.id === method)?.label ?? "UPI");
      setPhase("done");
    }, 1400);
  };

  return (
    <Modal
      open
      onClose={phase === "processing" ? () => undefined : onClose}
      title={phase === "done" ? "Payment successful" : `Pay ${fee.type}`}
      footer={
        phase === "done" ? (
          <Button variant="success" onClick={onClose}>Done</Button>
        ) : phase === "processing" ? undefined : (
          <>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={start}><Wallet size={16} /> Pay {inr(pending)}</Button>
          </>
        )
      }
    >
      {phase === "form" && (
        <>
          <div className="pay-slip" style={{ marginBottom: 18 }}>
            <div className="kv"><span className="k">Student</span><span className="v">{child?.name} ({child?.id})</span></div>
            <div className="kv"><span className="k">Fee type</span><span className="v">{fee.type}</span></div>
            <div className="kv"><span className="k">Amount due</span><span className="v" style={{ fontSize: "var(--fs-lg)", color: "var(--brand-700)" }}>{inr(pending)}</span></div>
            <div className="kv"><span className="k">Due date</span><span className="v">{prettyDate(fee.dueDate)}</span></div>
            <div className="kv"><span className="k">Paying as</span><span className="v">{user?.name} ({user?.role})</span></div>
          </div>
          <div className="section-title">Select payment method</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {methods.map((m) => (
              <button
                key={m.id}
                className="qa-btn"
                style={{ border: method === m.id ? "1.6px solid var(--brand-500)" : "1px solid var(--border)", background: method === m.id ? "var(--brand-50)" : "var(--surface)" }}
                onClick={() => setMethod(m.id)}
                type="button"
              >
                <span className="qa-icon" style={{ background: "var(--brand-100)", color: "var(--brand-700)" }}>{m.icon}</span>
                <span>
                  <span style={{ display: "block", fontWeight: 700 }}>{m.label}</span>
                  <span style={{ display: "block", fontSize: 10.5, color: "var(--text-3)", fontWeight: 500 }}>{m.sub}</span>
                </span>
              </button>
            ))}
          </div>
          <p style={{ fontSize: "var(--fs-xs)", color: "var(--text-4)", marginTop: 12 }}>
            <BadgeCheck size={13} style={{ verticalAlign: -2 }} /> This is a mock payment — no real money moves. The fee status updates instantly.
          </p>
        </>
      )}
      {phase === "processing" && (
        <div style={{ textAlign: "center", padding: "30px 10px" }}>
          <div className="loading-spin" style={{ margin: "0 auto 16px" }} />
          <p style={{ fontWeight: 600 }}>Processing payment via {methods.find((m) => m.id === method)?.label}…</p>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--text-3)" }}>Simulating a secure gateway.</p>
        </div>
      )}
      {phase === "done" && (
        <div style={{ textAlign: "center", padding: "16px 10px" }}>
          <div style={{ width: 64, height: 64, margin: "0 auto 14px", borderRadius: "50%", background: "var(--green-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green)" }}>
            <CheckCircle2 size={32} />
          </div>
          <h3 style={{ fontSize: "var(--fs-xl)" }}>Payment received!</h3>
          <p className="text-3" style={{ marginTop: 6, fontSize: "var(--fs-sm)" }}>
            <Receipt size={14} style={{ verticalAlign: -2 }} /> {fee.type} of <b>{inr(pending)}</b> marked as paid via {methods.find((m) => m.id === method)?.label}. A receipt has been added to your account.
          </p>
        </div>
      )}
    </Modal>
  );
}