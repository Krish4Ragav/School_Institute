import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  CalendarRange,
  Activity,
  Briefcase,
  Award,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { teachersList } from "../data/teachers";
import { timetablePeriods } from "../data/timetable";
import { Avatar, Badge, Card, CardHead, Button, Modal, EmptyState } from "../components/ui/primitives";

const subjects = Array.from(new Set(teachersList.map((t) => t.subject)));

export default function Teachers() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [subject, setSubject] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return teachersList.filter((t) => {
      const matchQ =
        !q.trim() ||
        (t.name + " " + t.empId + " " + t.subject).toLowerCase().includes(q.trim().toLowerCase());
      const matchS = subject === "all" || t.subject === subject;
      return matchQ && matchS;
    });
  }, [q, subject]);

  return (
    <>
      <div className="page-head" style={{ marginBottom: 18 }}>
        <div>
          <h1>Teachers</h1>
          <div className="sub">{teachersList.length} faculty members · dedicated to learning at School Institute</div>
        </div>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ padding: "14px 16px" }}>
          <div className="filters-bar">
            <div className="input-search">
              <Search size={16} />
              <input
                className="input"
                placeholder="Search name, ID or subject…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Search teachers"
              />
            </div>
            <div className="select-field">
              <label className="sr-only" htmlFor="tch-subject">Subject</label>
              <select id="tch-subject" className="select" value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="all">All subjects</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setQ(""); setSubject("all"); }}>Reset</Button>
            <span className="text-3" style={{ marginLeft: "auto", fontSize: "var(--fs-sm)", fontWeight: 600 }}>{filtered.length} teachers</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-3">
        {filtered.map((t) => {
          const periods = timetablePeriods.filter((p) => p.teacher === t.name);
          return (
            <Card key={t.id} hover className="card-pad" style={{ cursor: "pointer" }} onClick={() => setSelected(t.id)}>
              <div className="avatar-band" style={{ marginBottom: 14 }}>
                <Avatar name={t.name} size={56} color={t.avatarColor} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontFamily: "var(--font-head)", fontSize: "var(--fs-lg)", lineHeight: 1.2 }}>{t.name}</div>
                  <div style={{ color: "var(--text-3)", fontSize: "var(--fs-sm)", fontWeight: 500 }}>
                    {t.subject} · {t.empId}
                  </div>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <Badge tone={t.status === "Available" ? "green" : "amber"} dot>{t.status}</Badge>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {t.classes.map((c) => (
                  <span key={c} className="tag" style={{ background: "var(--brand-50)", color: "var(--brand-700)" }}>{c}</span>
                ))}
              </div>
              <div className="kv" style={{ padding: "5px 0" }}>
                <span className="k"><GraduationCap size={13} /> <span style={{ verticalAlign: 1 }}>Classes / week</span></span>
                <span className="v">{periods.length} periods</span>
              </div>
              <div className="kv" style={{ padding: "5px 0" }}>
                <span className="k"><Mail size={13} /> Email</span>
                <span className="v" style={{ fontWeight: 500 }}>{t.email}</span>
              </div>
              <div className="kv" style={{ padding: "5px 0 0" }}>
                <span className="k"><Phone size={13} /> Phone</span>
                <span className="v mono">{t.phone}</span>
              </div>
            </Card>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <Card><EmptyState title="No teachers found" message="Try a different search or subject filter." action={<Button variant="outline" onClick={() => { setQ(""); setSubject("all"); }}>Clear filters</Button>} /></Card>
      )}

      <TeacherProfileModal teacherId={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function TeacherProfileModal({ teacherId, onClose }: { teacherId: string | null; onClose: () => void }) {
  const teacher = teachersList.find((t) => t.id === teacherId);
  if (!teacher) return null;
  const periods = timetablePeriods.filter((p) => p.teacher === teacher.name);
  const days = Array.from(new Set(periods.map((p) => p.day)));

  return (
    <Modal open onClose={onClose} title="Teacher profile" wide>
      <div className="profile-hero" style={{ marginBottom: 20 }}>
        <Avatar name={teacher.name} size={72} color={teacher.avatarColor} />
        <div className="ph-text" style={{ flex: 1, minWidth: 220 }}>
          <h2>{teacher.name}</h2>
          <div className="ph-meta">
            <Badge tone="blue">{teacher.empId}</Badge>
            <Badge tone="violet">{teacher.subject}</Badge>
            <Badge tone={teacher.status === "Available" ? "green" : "amber"} dot>{teacher.status}</Badge>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-head)", fontSize: "2rem", fontWeight: 800, lineHeight: 1 }}>{periods.length}</div>
          <div style={{ color: "var(--text-3)", fontSize: "var(--fs-sm)", fontWeight: 600 }}>periods / week</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 18 }}>
        <Card>
          <CardHead title="Personal information" />
          <div className="card-body">
            <div className="info-grid">
              <div className="kv"><span className="k"><Briefcase size={13} /> Qualification</span><span className="v">{teacher.qualification}</span></div>
              <div className="kv"><span className="k"><Award size={13} /> Experience</span><span className="v">{teacher.experience} years</span></div>
              <div className="kv"><span className="k"><Clock size={13} /> Joined</span><span className="v">{teacher.joinYear}</span></div>
              <div className="kv"><span className="k"><Mail size={13} /> Email</span><span className="v">{teacher.email}</span></div>
              <div className="kv"><span className="k"><Phone size={13} /> Phone</span><span className="v mono">{teacher.phone}</span></div>
            </div>
          </div>
        </Card>
        <Card>
          <CardHead title="Teaching load" sub="Assigned classes" />
          <div className="card-body">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              {teacher.classes.map((c) => (
                <span key={c} className="tag" style={{ background: "var(--violet-soft)", color: "#6d28d9", fontSize: "var(--fs-sm)", fontWeight: 700, padding: "6px 12px" }}>{c}</span>
              ))}
            </div>
            <div className="kv">
              <span className="k"><BookOpen size={13} /> Subject</span>
              <span className="v">{teacher.subject}</span>
            </div>
            <div className="kv">
              <span className="k"><CalendarRange size={13} /> Days teaching</span>
              <span className="v">{days.join(", ")}</span>
            </div>
            <div className="kv">
              <span className="k"><Activity size={13} /> Status today</span>
              <span className="v">{teacher.status}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHead title="Weekly timetable" sub={`${teacher.name.split(" ")[0]}'s weekly schedule`} />
        <div className="card-body">
          <div className="table-wrap">
            <table className="table nowrap">
              <thead>
                <tr><th>Day</th><th>Time</th><th>Class</th><th>Subject</th><th>Room</th></tr>
              </thead>
              <tbody>
                {periods.map((p) => (
                  <tr key={p.id}>
                    <td className="t-strong">{p.day}</td>
                    <td className="mono">{p.start} – {p.end}</td>
                    <td>{p.className}-{p.section}</td>
                    <td>{p.subject}</td>
                    <td>{p.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="kv" style={{ paddingTop: 10 }}>
            <span className="k"><CheckCircle2 size={13} /> Recent activity</span>
            <span className="v" style={{ fontWeight: 500 }}>Attendance recorded · Marks entered · PTM scheduled</span>
          </div>
        </div>
      </Card>
      <div className="modal-foot" style={{ margin: "16px -22px -20px" }}>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}