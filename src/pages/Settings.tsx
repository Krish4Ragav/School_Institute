import React, { useState } from "react";
import { UserRound, Bell, Monitor, Save, Lock, Palette, BadgeCheck } from "lucide-react";
import { useApp } from "../store/AppContext";
import { users } from "../data/users";
import { Button, Card, CardHead } from "../components/ui/primitives";

function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 0" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{label}</div>
        {desc && <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-3)", marginTop: 1 }}>{desc}</div>}
      </div>
      <button
        className={`switch ${checked ? "on" : ""}`}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
      >
        <span className="switch-dot" />
      </button>
    </div>
  );
}

export default function Settings() {
  const { user, state, updateSettings, notify } = useApp();
  const s = state.settings;
  const [form, setForm] = useState({
    name: s.name || user?.name || "",
    email: s.email || user?.email || "",
    phone: s.phone || user?.phone || "",
    dob: s.dob || "",
    address: s.address || "",
    language: s.language || "English",
  });
  const [notifs, setNotifs] = useState({
    notifAssignment: s.notifAssignment,
    notifExam: s.notifExam,
    notifNotice: s.notifNotice,
    notifFees: s.notifFees,
    notifMessages: s.notifMessages,
  });
  const [compact, setCompact] = useState(s.compact);
  const [dirty, setDirty] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setDirty(true);
  };

  const save = () => {
    updateSettings({
      ...form,
      ...notifs,
      compact,
    });
    setDirty(false);
    notify("Settings saved", "success");
  };

  return (
    <>
      <div className="page-head" style={{ marginBottom: 18 }}>
        <div>
          <h1>Settings</h1>
          <div className="sub">Manage your profile and app preferences</div>
        </div>
        <Button onClick={save} disabled={!dirty}><Save size={16} /> {dirty ? "Save changes" : "Saved"}</Button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.15fr 1fr", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <CardHead title="Profile details" sub="Shown across the school portal" icon={<UserRound size={16} />} />
            <div className="card-body">
              <div className="form-row">
                <div className="field">
                  <label htmlFor="st-name">Full name</label>
                  <input id="st-name" className="input" value={form.name} onChange={set("name")} />
                </div>
                <div className="field">
                  <label htmlFor="st-phone">Phone</label>
                  <input id="st-phone" className="input" value={form.phone} onChange={set("phone")} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="st-email">Email</label>
                <input id="st-email" className="input" value={form.email} onChange={set("email")} />
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="st-dob">Date of birth</label>
                  <input id="st-dob" className="input" type="date" value={form.dob} onChange={set("dob")} />
                </div>
                <div className="field">
                  <label htmlFor="st-lang">Language</label>
                  <select id="st-lang" className="select" value={form.language} onChange={set("language")}>
                    <option>English (India)</option>
                    <option>English</option>
                    <option>हिंदी (Hindi)</option>
                    <option>ಕನ್ನಡ (Kannada)</option>
                    <option>தமிழ் (Tamil)</option>
                    <option>తెలుగు (Telugu)</option>
                  </select>
                </div>
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="st-addr">Address</label>
                <textarea id="st-addr" className="textarea" value={form.address} onChange={set("address")} />
              </div>
            </div>
          </Card>

          <Card>
            <CardHead title="Appearance" sub="Layout density preference" icon={<Monitor size={16} />} />
            <div className="card-body">
              <Toggle checked={compact} onChange={setCompact} label="Compact mode" desc="Show more data on screen with tighter spacing" />
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <CardHead title="Notifications" sub="What should be pushed to your bell" icon={<Bell size={16} />} />
            <div className="card-body">
              <Toggle checked={notifs.notifAssignment} onChange={(v) => { setNotifs((n) => ({ ...n, notifAssignment: v })); setDirty(true); }} label="Assignments" desc="New homework and submission grades" />
              <hr className="divider" style={{ margin: "2px 0" }} />
              <Toggle checked={notifs.notifExam} onChange={(v) => { setNotifs((n) => ({ ...n, notifExam: v })); setDirty(true); }} label="Exams & results" desc="Timetable changes and result releases" />
              <hr className="divider" style={{ margin: "2px 0" }} />
              <Toggle checked={notifs.notifNotice} onChange={(v) => { setNotifs((n) => ({ ...n, notifNotice: v })); setDirty(true); }} label="Notices" desc="School announcements and holidays" />
              <hr className="divider" style={{ margin: "2px 0" }} />
              <Toggle checked={notifs.notifFees} onChange={(v) => { setNotifs((n) => ({ ...n, notifFees: v })); setDirty(true); }} label="Fees" desc="Due reminders and payment receipts" />
              <hr className="divider" style={{ margin: "2px 0" }} />
              <Toggle checked={notifs.notifMessages} onChange={(v) => { setNotifs((n) => ({ ...n, notifMessages: v })); setDirty(true); }} label="Messages" desc="New direct messages" />
            </div>
          </Card>

          <Card>
            <CardHead title="Account security" sub="Manage your sign-in options" icon={<Lock size={16} />} />
            <div className="card-body" style={{ paddingTop: 6 }}>
              <div className="kv"><span className="k"><UserRound size={13} /> Account</span><span className="v">{s.email || user?.email}</span></div>
              <div className="kv"><span className="k">Signed in as</span><span className="v">{s.name || user?.name}</span></div>
              <div className="kv" style={{ marginBottom: 12 }}><span className="k"><BadgeCheck size={13} /> Role</span><span className="v">{user?.role} portal</span></div>
              <Button variant="outline" size="sm" onClick={() => notify("Password change link sent to your email", "info")}>
                <Lock size={14} /> Change password
              </Button>
            </div>
          </Card>

          <Card className="card-pad" style={{ background: "var(--brand-50)", borderColor: "var(--brand-100)" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span className="stat-icon" style={{ background: "var(--brand-100)", color: "var(--brand-700)", flexShrink: 0 }}><Palette size={16} /></span>
              <div>
                <div style={{ fontWeight: 700 }}>School Institute theme</div>
                <p style={{ fontSize: "var(--fs-xs)", color: "var(--text-3)", margin: "4px 0 0", lineHeight: 1.5 }}>
                  Theming updates for the parent app roll out automatically. You're on the latest version.
                </p>
              </div>
            </div>
          </Card>

          <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-4)", textAlign: "center" }}>
            {users.length} demo accounts · v1.0.0 build 2026.09
          </div>
        </div>
      </div>
    </>
  );
}