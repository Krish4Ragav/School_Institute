import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Cake,
  BookOpen,
  ClipboardList,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  Droplets,
} from "lucide-react";
import { useApp } from "../store/AppContext";
import { studentsList } from "../data/students";
import { attendanceStatsForStudent, assignmentStatusFor } from "../utils/stats";
import { prettyDate, gradeFor } from "../data/helpers";
import { Avatar, Badge, Card, CardHead, Button, Modal, EmptyState, Progress } from "../components/ui/primitives";

export default function Students() {
  const { state } = useApp();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(
    typeof params.get("student") === "string" ? params.get("student") : null
  );

  const filtered = useMemo(() => {
    return studentsList.filter((s) => {
      const matchQ =
        !q.trim() ||
        (s.name + " " + s.id + " " + s.parentName).toLowerCase().includes(q.trim().toLowerCase());
      const matchC = classFilter === "all" || s.className === Number(classFilter);
      const matchS = sectionFilter === "all" || s.section === sectionFilter;
      return matchQ && matchC && matchS;
    });
  }, [q, classFilter, sectionFilter]);

  const closeProfile = () => {
    setSelected(null);
    if (params.get("student")) {
      setParams({}, { replace: true });
    }
  };

  return (
    <>
      <div className="page-head" style={{ marginBottom: 18 }}>
        <div>
          <h1>Students</h1>
          <div className="sub">{studentsList.length} students · Classes I–X · Electronic City, Bengaluru</div>
        </div>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ padding: "14px 16px" }}>
          <div className="filters-bar">
            <div className="input-search">
              <Search size={16} />
              <input
                className="input"
                placeholder="Search by name, ID or parent…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Search students"
              />
            </div>
            <div className="select-field">
              <label className="sr-only" htmlFor="stu-class">Class</label>
              <select id="stu-class" className="select" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                <option value="all">All classes</option>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((c) => (
                  <option key={c} value={c} style={{ fontVariantNumeric: "normal" }}>
                    Class {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="select-field">
              <label className="sr-only" htmlFor="stu-sec">Section</label>
              <select id="stu-sec" className="select" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
                <option value="all">All sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setQ(""); setClassFilter("all"); setSectionFilter("all"); }}>
              Reset
            </Button>
            <span className="text-3" style={{ marginLeft: "auto", fontSize: "var(--fs-sm)", fontWeight: 600 }}>
              {filtered.length} shown
            </span>
          </div>
        </div>
      </Card>

      <Card>
        <div className="table-wrap">
          <table className="table table-responsive nowrap">
            <thead>
              <tr>
                <th>Student</th>
                <th>ID</th>
                <th>Class</th>
                <th>Section</th>
                <th>Attendance</th>
                <th>Performance</th>
                <th>Status</th>
                <th aria-label="Open" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const att = attendanceStatsForStudent(state.attendanceDays, s.id);
                return (
                  <tr key={s.id} style={{ cursor: "pointer" }} onClick={() => setSelected(s.id)}>
                    <td data-label="Student">
                      <div className="t-main">
                        <Avatar name={s.name} size={38} color={s.avatarColor} />
                        <div>
                          <div className="t-strong">{s.name}</div>
                          <div className="meta">{s.parentName}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="ID" className="mono">{s.id}</td>
                    <td data-label="Class">{s.className}</td>
                    <td data-label="Section">{s.section}</td>
                    <td data-label="Attendance">
                      <div style={{ minWidth: 90 }}>
                        <div className="t-strong" style={{ color: att.pct >= 85 ? "var(--green)" : att.pct >= 70 ? "var(--amber)" : "var(--rose)" }}>
                          {att.pct}%
                        </div>
                        <Progress pct={att.pct} sm color={att.pct >= 85 ? "var(--green-2)" : att.pct >= 70 ? "var(--amber-2)" : "var(--rose-2)"} />
                      </div>
                    </td>
                    <td data-label="Performance">
                      <Badge tone={s.curAcademicPct >= 80 ? "green" : s.curAcademicPct >= 60 ? "blue" : "amber"}>
                        {s.curAcademicPct}% · {gradeFor(s.curAcademicPct).grade}
                      </Badge>
                    </td>
                    <td data-label="Status">
                      <Badge tone={s.status === "Active" ? "green" : "gray"} dot>
                        {s.status}
                      </Badge>
                    </td>
                    <td data-label="">
                      <Button variant="ghost" size="sm" icon aria-label={`Open ${s.name}`} onClick={(e) => { e.stopPropagation(); setSelected(s.id); }}>
                        <ChevronRight size={17} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <EmptyState
              title="No students found"
              message="Try adjusting your search or filters."
              action={<Button variant="outline" onClick={() => { setQ(""); setClassFilter("all"); setSectionFilter("all"); }}>Clear filters</Button>}
            />
          )}
        </div>
      </Card>

      <StudentProfileModal
        studentId={selected}
        onClose={closeProfile}
      />
    </>
  );
}

function StudentProfileModal({ studentId, onClose }: { studentId: string | null; onClose: () => void }) {
  const { state, notify } = useApp();
  const student = studentsList.find((s) => s.id === studentId);
  if (!student) return null;
  const att = attendanceStatsForStudent(state.attendanceDays, student.id);
  const marks = student.marks.filter((m) => m.exam === "Unit Test 1");
  const assignments = state.assignments.filter((a) => a.className === student.className && a.section === student.section);
  const myAssignments = assignments.filter((a) => assignmentStatusFor(a, student.id) !== "Pending").length;
  const classYear = new Date().getFullYear() - student.admissionYear;
  const grade = gradeFor(student.curAcademicPct);

  return (
    <Modal open onClose={onClose} title="Student profile" wide footer={
      <>
        <Button variant="outline" onClick={() => notify(`Message queued for ${student.parentName}`, "info")}><Mail size={15} /> Message parent</Button>
        <Button onClick={onClose}>Close</Button>
      </>
    }>
      <div className="profile-hero" style={{ marginBottom: 20 }}>
        <Avatar name={student.name} size={72} color={student.avatarColor} />
        <div className="ph-text" style={{ flex: 1, minWidth: 220 }}>
          <h2>{student.name}</h2>
          <div className="ph-meta">
            <Badge tone="blue">{student.id}</Badge>
            <Badge tone="violet">Class {student.className}-{student.section}</Badge>
            <Badge tone="green" dot>{student.status}</Badge>
            <Badge tone="gray">Roll {student.rollNo}</Badge>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-head)", fontSize: "2rem", fontWeight: 800, lineHeight: 1 }}>{student.curAcademicPct}%</div>
          <Badge tone={student.curAcademicPct >= 80 ? "green" : "amber"}>Grade {grade.grade} · {grade.remark}</Badge>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", marginBottom: 18 }}>
        <Card>
          <CardHead title="Personal information" />
          <div className="card-body">
            <div className="info-grid">
              <div className="kv"><span className="k">Date of birth</span><span className="v">{prettyDate(student.dob)}</span></div>
              <div className="kv"><span className="k">Blood group</span><span className="v">{student.bloodGroup}</span></div>
              <div className="kv"><span className="k">Gender</span><span className="v">{student.gender === "M" ? "Male" : "Female"}</span></div>
              <div className="kv"><span className="k">Admission year</span><span className="v">{student.admissionYear} · {classYear} yrs at SI</span></div>
              <div className="kv" style={{ gridColumn: "1 / -1", textAlign: "left" }}>
                <span className="k" style={{ display: "flex", alignItems: "center", gap: 5 }}><MapPin size={13} /> Address</span>
                <span className="v" style={{ textAlign: "left" }}>{student.address}</span>
              </div>
            </div>
            <hr className="divider" />
            <div className="section-title" style={{ fontWeight: 700, fontFamily: "var(--font-head)", marginBottom: 4 }}>Parent / Guardian</div>
            <div className="info-grid">
              <div className="kv"><span className="k"><Cake size={13} /> Name</span><span className="v">{student.parentName}</span></div>
              <div className="kv"><span className="k">Occupation</span><span className="v">{student.fatherOccupation}</span></div>
              <div className="kv"><span className="k"><Phone size={13} /> Phone</span><span className="v">{student.parentPhone}</span></div>
              <div className="kv"><span className="k"><Mail size={13} /> Email</span><span className="v">{student.parentEmail}</span></div>
            </div>
          </div>
        </Card>
        <Card>
          <CardHead title="Attendance summary" sub="All recorded school days" />
          <div className="card-body">
            <div className="att-summary" style={{ marginBottom: 4 }}>
              <div className="att-stat-mini"><div className="a-value" style={{ color: "var(--green)" }}>{att.pct}%</div><div className="a-label">Overall</div></div>
              <div className="att-stat-mini"><div className="a-value" style={{ color: "var(--green)" }}>{att.present}</div><div className="a-label">Present</div></div>
              <div className="att-stat-mini"><div className="a-value" style={{ color: "var(--amber)" }}>{att.late}</div><div className="a-label">Late</div></div>
              <div className="att-stat-mini"><div className="a-value" style={{ color: "var(--rose)" }}>{att.absent}</div><div className="a-label">Absent</div></div>
            </div>
            <div className="kv" style={{ marginTop: 12 }}>
              <span className="k"><GraduationCap size={13} /> Subjects</span>
              <span className="v">{student.subjects.length} core subjects</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {student.subjects.map((sub) => (
                <span key={sub} className="tag" style={{ background: "var(--brand-50)", color: "var(--brand-700)" }}>{sub}</span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.3fr 1fr" }}>
        <Card>
          <CardHead title="Recent marks" sub="Unit Test 1 · out of 20" />
          <div className="card-body">
            <div className="table-wrap">
              <table className="table" style={{ minWidth: 0 }}>
                <thead>
                  <tr><th>Subject</th><th>Marks</th><th>Score</th></tr>
                </thead>
                <tbody>
                  {marks.map((m) => (
                    <tr key={m.subject}>
                      <td className="t-strong">{m.subject}</td>
                      <td><Badge tone={m.scored / m.max >= 0.8 ? "green" : m.scored / m.max >= 0.6 ? "blue" : "amber"}>{Math.round((m.scored / m.max) * 100)}%</Badge></td>
                      <td className="mono">{m.scored} / {m.max}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
        <Card>
          <CardHead title="Assignments" sub={`${assignments.length} assigned in class`} />
          <ul className="dash-list">
            {assignments.slice(0, 5).map((a) => {
              const st = assignmentStatusFor(a, student.id);
              return (
                <li key={a.id}>
                  <span className="n-icon" style={{ background: st === "Pending" ? "var(--amber-soft)" : "var(--green-soft)", color: st === "Pending" ? "#b45309" : "#15803d" }}>
                    {st === "Pending" ? <ClipboardList size={15} /> : <CheckCircle2 size={15} />}
                  </span>
                  <div className="dl-main">
                    <div className="dl-title">{a.title}</div>
                    <div className="dl-sub">{a.subject} · due {prettyDate(a.dueDate)}</div>
                  </div>
                  <Badge tone={st === "Pending" ? "amber" : "green"}>{st}</Badge>
                </li>
              );
            })}
          </ul>
          <div className="card-body tight" style={{ borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <span className="text-3" style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}><TrendingUp size={14} style={{ verticalAlign: -2 }} /> {myAssignments}/{assignments.length} completed</span>
            <Badge tone="blue">Lib: {student.issuedBooks.length} book{student.issuedBooks.length === 1 ? "" : "s"} issued</Badge>
          </div>
        </Card>
      </div>
      <div className="kv" style={{ marginTop: 4 }}>
        <span className="k"><BookOpen size={13} /> Academic history</span>
        <span className="v">Current {student.curAcademicPct}% · Previous year {student.prevAcademicPct}%</span>
      </div>
      <div className="kv">
        <span className="k"><Droplets size={13} /> Transport</span>
        <span className="v">{student.className >= 6 ? "Bus R3 · Bommasandra route" : "Bus R1 · Electronic City route"}</span>
      </div>
      <div className="modal-foot" style={{ margin: "16px -22px -20px" }}>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}