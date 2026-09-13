import { useNavigate } from "react-router-dom";
import {
  Users,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  CalendarCheck2,
  Wallet,
  TrendingUp,
  CalendarRange,
  FileText,
  Megaphone,
  CalendarClock,
  Clock,
  Timer,
  NotebookPen,
  MessageSquareText,
} from "lucide-react";
import { useApp } from "../store/AppContext";
import { studentsList } from "../data/students";
import { teachersList } from "../data/teachers";
import { timetableForStudent, subjectColor, days } from "../data/timetable";
import { examSchedule } from "../data/exams";
import { todayISO, prettyDate, todayGreeting, daysBetween, classLabel, parseClassLabel, inr, gradeFor } from "../data/helpers";
import {
  attendanceStatsForStudent,
  weeklyAttendanceSeries,
  assignmentStatusFor,
} from "../utils/stats";
import { StatCard, Card, CardHead, Badge, Button } from "../components/ui/primitives";
import { Bars, Line, Donut, Radial } from "../components/charts";

function todayTimetable(className: number, section: string) {
  const d = new Date();
  let dow = d.getDay();
  if (dow === 0 || dow === 6) dow = 1;
  return timetableForStudent(className, section).filter((t) => t.day === days[dow - 1]);
}

function upcomingExams(className: number, count = 3) {
  return examSchedule
    .filter((e) => e.className === className)
    .filter((e) => daysBetween(todayISO(), e.date) >= -1)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, count);
}

/* ==================== TEACHER ==================== */
function TeacherDashboard() {
  const { user, state } = useApp();
  const navigate = useNavigate();
  const teacher = teachersList.find((t) => t.empId === (user?.teacherId ?? "")) ?? teachersList[0];
  const { className, section } = parseClassLabel(teacher.classes[0]);
  const totalStudents = studentsList.length;
  const classStudents = studentsList.filter((s) => s.className === className && s.section === section);

  const lastDay = state.attendanceDays
    .filter((d) => d.className === className && d.section === section)
    .slice(-1)[0];
  const presentToday = lastDay
    ? Object.values(lastDay.records).filter((s) => s === "Present" || s === "Late").length
    : null;

  const myAssignments = state.assignments.filter((a) => a.className === className && a.section === section);
  const pendingCount = myAssignments.reduce((sum, a) => {
    const pend = a.submissions.filter((s) => s.status === "Pending").length;
    return sum + Math.min(1, pend);
  }, 0);

  const exams = upcomingExams(className, 2);
  const weekly = weeklyAttendanceSeries(state.attendanceDays, className, section, undefined, 7);
  const tt = todayTimetable(className, section).slice(0, 4);
  const notices = state.notices.slice(0, 3);

  const cards = [
    {
      icon: <Users size={22} />,
      color: "var(--grad-brand)",
      value: classStudents.length,
      label: "Students in " + classLabel(className, section),
      trend: `${totalStudents} across the school`,
    },
    {
      icon: <CheckCircle2 size={22} />,
      color: "var(--grad-green)",
      value: presentToday === null ? "—" : presentToday,
      label: "Present today",
      trend: presentToday === null ? "Not marked yet" : `${classStudents.length - presentToday} absent/late`,
    },
    {
      icon: <ClipboardList size={22} />,
      color: "var(--grad-amber)",
      value: pendingCount,
      label: "Pending assignments",
      trend: `${myAssignments.length} assignments in class`,
    },
    {
      icon: <GraduationCap size={22} />,
      color: "var(--grad-violet)",
      value: exams.length ? exams[0].subject : 0,
      label: "Next exam",
      trend: exams[0] ? prettyDate(exams[0].date) : "No upcoming exam",
    },
  ];

  const quick = [
    { label: "Mark Attendance", icon: <CalendarCheck2 size={18} />, to: "/attendance", bg: "var(--green-soft)", fg: "#15803d" },
    { label: "Create Assignment", icon: <NotebookPen size={18} />, to: "/assignments", bg: "var(--brand-100)", fg: "#1d4ed8" },
    { label: "Enter Marks", icon: <FileText size={18} />, to: "/exams", bg: "var(--violet-soft)", fg: "#6d28d9" },
    { label: "View Timetable", icon: <CalendarRange size={18} />, to: "/timetable", bg: "var(--cyan-soft)", fg: "#0e7490" },
  ];

  return (
    <>
      <div className="dash-greeting">
        <div>
          <h1>{todayGreeting()}, {user?.name.split(" ")[0]} 👋</h1>
          <div className="sub">
            Here's what's happening in {classLabel(className, section)} today.
          </div>
        </div>
        <div className="greet-date">
          <CalendarClock size={16} style={{ color: "var(--brand-600)" }} />
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      <div className="grid grid-stats" style={{ marginBottom: 18 }}>
        {cards.map((c, i) => (
          <StatCard key={i} icon={c.icon} color={c.color} value={c.value} label={c.label} trend={c.trend} />
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.55fr 1fr", marginBottom: 18 }}>
        <Card>
          <CardHead title="Attendance overview" sub="Last 7 school days · your class" />
          <div className="card-body">
            <Bars data={weekly} format={(v) => v + "%"} highlightLast />
          </div>
        </Card>
        <Card>
          <CardHead title="Today's timetable" sub={`${classLabel(className, section)} · ${days[new Date().getDay() === 0 || new Date().getDay() === 6 ? 0 : new Date().getDay() - 1]}`} />
          <ul className="dash-list" style={{ maxHeight: 250, overflowY: "auto" }}>
            {tt.map((p) => (
              <li key={p.id}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: subjectColor(p.subject), flexShrink: 0 }} />
                <div className="dl-main">
                  <div className="dl-title">{p.subject}</div>
                  <div className="dl-sub">{p.teacher} · {p.start}–{p.end}</div>
                </div>
                <Badge tone="gray">{p.room}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr 1fr" }}>
        <Card>
          <CardHead
            title="Assignments"
            sub="Submission status"
            actions={<Button variant="soft" size="sm" onClick={() => navigate("/assignments")}>View all</Button>}
          />
          <ul className="dash-list">
            {myAssignments.slice(0, 4).map((a) => {
              const submitted = a.submissions.filter((s) => s.status === "Submitted" || s.status === "Graded").length;
              const total = a.submissions.length;
              return (
                <li key={a.id}>
                  <span className="tag" style={{ background: `var(--brand-50)`, color: `var(--brand-700)` }}>{a.subject.slice(0, 3)}</span>
                  <div className="dl-main">
                    <div className="dl-title">{a.title}</div>
                    <div className="dl-sub">Due {prettyDate(a.dueDate)}</div>
                  </div>
                  <Badge tone={submitted >= total && total > 0 ? "green" : "amber"}>{submitted}/{total} done</Badge>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card>
          <CardHead title="Announcements" sub="School notices" />
          <ul className="dash-list">
            {notices.map((n) => (
              <li key={n.id}>
                <span className="n-icon" style={{ background: n.priority === "High" ? "var(--rose-soft)" : "var(--brand-50)", color: n.priority === "High" ? "#be123c" : "#1d4ed8" }}>
                  <Megaphone size={16} />
                </span>
                <div className="dl-main">
                  <div className="dl-title">{n.title}</div>
                  <div className="dl-sub">{n.category} · {prettyDate(n.date)}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHead title="Quick actions" />
          <div className="card-body">
            <div className="quick-actions">
              {quick.map((q) => (
                <button key={q.label} className="qa-btn" onClick={() => navigate(q.to)}>
                  <span className="qa-icon" style={{ background: q.bg, color: q.fg }}>{q.icon}</span>
                  {q.label}
                </button>
              ))}
            </div>
            <button className="btn btn-outline btn-sm" style={{ marginTop: 14, width: "100%" }} onClick={() => navigate("/leaves")}>
              <Timer size={15} /> Review leave requests
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}

/* ==================== STUDENT ==================== */
function StudentDashboard() {
  const { user, state } = useApp();
  const navigate = useNavigate();
  const student = studentsList.find((s) => s.id === user?.studentId) ?? studentsList[0];
  if (!student) return null;
  const { className, section } = student;

  const att = attendanceStatsForStudent(state.attendanceDays, student.id);
  const myAssignments = state.assignments.filter((a) => a.className === className && a.section === section);
  const due = myAssignments.filter((a) => assignmentStatusFor(a, student.id) === "Pending");
  const submitted = myAssignments.filter((a) => assignmentStatusFor(a, student.id) === "Submitted" || assignmentStatusFor(a, student.id) === "Graded");
  const exams = upcomingExams(className, 2);
  const totalScored = student.marks.reduce((s, m) => s + m.scored, 0);
  const totalMax = student.marks.reduce((s, m) => s + m.max, 0);
  const perf = totalMax ? Math.round((totalScored / totalMax) * 1000) / 10 : 0;

  const cards = [
    { icon: <CalendarCheck2 size={22} />, color: "var(--grad-green)", value: att.pct + "%", label: "Attendance", trend: `${att.present + att.late} of ${att.total} days` },
    { icon: <ClipboardList size={22} />, color: "var(--grad-amber)", value: due.length, label: "Assignments due", trend: `${submitted.length} already submitted` },
    { icon: <GraduationCap size={22} />, color: "var(--grad-violet)", value: exams.length, label: "Upcoming exams", trend: exams[0] ? `${exams[0].subject} on ${prettyDate(exams[0].date)}` : "None" },
    { icon: <TrendingUp size={22} />, color: "var(--grad-brand)", value: perf + "%", label: "Overall performance", trend: `Last year ${student.prevAcademicPct}%` },
  ];

  const quick = [
    { label: "View Assignments", icon: <ClipboardList size={18} />, to: "/assignments", bg: "var(--brand-100)", fg: "#1d4ed8" },
    { label: "View Results", icon: <FileText size={18} />, to: "/exams", bg: "var(--violet-soft)", fg: "#6d28d9" },
    { label: "View Timetable", icon: <CalendarRange size={18} />, to: "/timetable", bg: "var(--cyan-soft)", fg: "#0e7490" },
    { label: "View Attendance", icon: <CalendarCheck2 size={18} />, to: "/attendance", bg: "var(--green-soft)", fg: "#15803d" },
  ];

  const marks = student.marks.filter((m) => m.exam === "Unit Test 1");
  const subjectCards = student.subjects.map((sub) => {
    const m = marks.find((x) => x.subject === sub);
    return { subject: sub, pct: m ? (m.scored / m.max) * 100 : 0 };
  });

  return (
    <>
      <div className="dash-greeting">
        <div>
          <h1>{todayGreeting()}, {user?.name.split(" ")[0]} 🌟</h1>
          <div className="sub">Class {classLabel(className, section)} · Roll {student.rollNo} · Student ID {student.id}</div>
        </div>
        <div className="greet-date">
          <CalendarClock size={16} style={{ color: "var(--brand-600)" }} />
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      <div className="grid grid-stats" style={{ marginBottom: 18 }}>
        {cards.map((c, i) => (
          <StatCard key={i} icon={c.icon} color={c.color} value={c.value} label={c.label} trend={c.trend} />
        ))}
      </div>

      <div className="grid grid-ideals" style={{ marginBottom: 18 }}>
        <Card>
          <CardHead title="Attendance trend" sub="Your attendance · last 7 school days" />
          <div className="card-body">
            <Line data={weeklyAttendanceSeries(state.attendanceDays, className, section, student.id, 7)} format={(v) => v + "%"} />
          </div>
        </Card>
        <Card>
          <CardHead title="Overall performance" sub="Unit Test 1" />
          <div className="card-body" style={{ textAlign: "center" }}>
            <Radial pct={perf} color="var(--brand-600)" />
            <div className="legend" style={{ justifyContent: "center", marginTop: 14 }}>
              <span className="li"><span className="swatch" style={{ background: "var(--brand-600)" }} /> Current: {perf}%</span>
              <span className="li"><span className="swatch" style={{ background: "var(--border-strong)" }} /> Last year: {student.prevAcademicPct}%</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginBottom: 18 }}>
        <Card>
          <CardHead title="Today's timetable" actions={<Button variant="ghost" size="sm" onClick={() => navigate("/timetable")}>Full</Button>} />
          <ul className="dash-list">
            {todayTimetable(className, section).slice(0, 4).map((p) => (
              <li key={p.id}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: subjectColor(p.subject), flexShrink: 0 }} />
                <div className="dl-main">
                  <div className="dl-title">{p.subject}</div>
                  <div className="dl-sub">{p.start}–{p.end} · {p.room}</div>
                </div>
                <Badge tone="gray">{p.teacher.split(" ")[0]}</Badge>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHead title="Upcoming assignments" sub={`${due.length} pending`} actions={<Button variant="ghost" size="sm" onClick={() => navigate("/assignments")}>All</Button>} />
          <ul className="dash-list">
            {due.slice(0, 4).map((a) => (
              <li key={a.id}>
                <span className="tag" style={{ background: `var(--amber-soft)`, color: `#b45309` }}>
                  <Clock size={11} />
                </span>
                <div className="dl-main">
                  <div className="dl-title">{a.title}</div>
                  <div className="dl-sub">{a.subject} · due {prettyDate(a.dueDate)}</div>
                </div>
              </li>
            ))}
            {due.length === 0 && <li className="text-3">No pending assignments 🎉</li>}
          </ul>
        </Card>
        <Card>
          <CardHead title="Upcoming exams" sub="Mid Term" />
          <ul className="dash-list">
            {exams.map((e) => (
              <li key={e.id}>
                <span className="tag" style={{ background: `var(--violet-soft)`, color: `#6d28d9` }}><GraduationCap size={11} /></span>
                <div className="dl-main">
                  <div className="dl-title">{e.subject}</div>
                  <div className="dl-sub">{prettyDate(e.date)} · {e.startTime}</div>
                </div>
                <Badge tone="gray">{e.room}</Badge>
              </li>
            ))}
            {exams.length === 0 && <li className="text-3">No exams scheduled</li>}
          </ul>
        </Card>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr 1fr" }}>
        <Card>
          <CardHead title="Recent results" sub="Unit Test 1" actions={<Button variant="soft" size="sm" onClick={() => navigate("/exams")}>View all</Button>} />
          <div className="card-body">
            <div className="att-summary" style={{ marginBottom: 12 }}>
              {subjectCards.map((m) => (
                <div className="att-stat-mini" key={m.subject}>
                  <div className="a-value" style={{ color: m.pct >= 80 ? "var(--green)" : m.pct >= 60 ? "var(--amber)" : "var(--rose)" }}>{Math.round(m.pct)}%</div>
                  <div className="a-label">{m.subject}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <CardHead title="School notices" />
          <ul className="dash-list">
            {state.notices.slice(0, 3).map((n) => (
              <li key={n.id}>
                <span className="n-icon" style={{ background: "var(--brand-50)", color: "#1d4ed8" }}><Megaphone size={15} /></span>
                <div className="dl-main">
                  <div className="dl-title">{n.title}</div>
                  <div className="dl-sub">{prettyDate(n.date)}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHead title="Quick actions" />
          <div className="card-body">
            <div className="quick-actions">
              {quick.map((q) => (
                <button key={q.label} className="qa-btn" onClick={() => navigate(q.to)}>
                  <span className="qa-icon" style={{ background: q.bg, color: q.fg }}>{q.icon}</span>
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

/* ==================== PARENT ==================== */
function ParentDashboard() {
  const { user, state } = useApp();
  const navigate = useNavigate();
  const child = studentsList.find((s) => s.id === user?.studentId) ?? studentsList[0];
  if (!child) return null;
  const { className, section } = child;

  const att = attendanceStatsForStudent(state.attendanceDays, child.id);
  const fees = state.fees.filter((f) => f.studentId === child.id);
  const pendingAmount = fees.reduce((s, f) => s + (f.amount - f.paid), 0);
  const upcoming = state.assignments.filter((a) => a.className === className && a.section === section && assignmentStatusFor(a, child.id) === "Pending");
  const exams = upcomingExams(className, 2);
  const marks = child.marks.filter((m) => m.exam === "Unit Test 1");
  const perf = child.curAcademicPct;
  const grade = gradeFor(perf);

  const subjectPct = child.subjects.map((sub) => {
    const m = marks.find((x) => x.subject === sub);
    return { label: sub, value: m ? Math.round((m.scored / m.max) * 100) : 0 };
  });

  const teacherConversations = state.conversations.filter((c) => c.participantIds.includes(user?.id ?? ""));

  const cards = [
    { icon: <CalendarCheck2 size={22} />, color: "var(--grad-green)", value: att.pct + "%", label: "Child attendance", trend: `${att.present + att.late} of ${att.total} days present` },
    { icon: <Wallet size={22} />, color: "var(--grad-rose)", value: inr(pendingAmount), label: "Pending fees", trend: `${fees.filter((f) => f.status !== "Paid").length} instalments due` },
    { icon: <ClipboardList size={22} />, color: "var(--grad-amber)", value: upcoming.length, label: "Assignments to do", trend: upcoming[0] ? `Next: ${upcoming[0].title.slice(0, 22)}…` : "All caught up" },
    { icon: <GraduationCap size={22} />, color: "var(--grad-violet)", value: exams.length, label: "Upcoming exams", trend: exams[0] ? `${exams[0].subject} · ${prettyDate(exams[0].date)}` : "None" },
  ];

  const quick = [
    { label: "View Attendance", icon: <CalendarCheck2 size={18} />, to: "/attendance", bg: "var(--green-soft)", fg: "#15803d" },
    { label: "View Results", icon: <FileText size={18} />, to: "/exams", bg: "var(--violet-soft)", fg: "#6d28d9" },
    { label: "View Fees", icon: <Wallet size={18} />, to: "/fees", bg: "var(--amber-soft)", fg: "#b45309" },
    { label: "Message Teacher", icon: <MessageSquareText size={18} />, to: "/messages", bg: "var(--brand-100)", fg: "#1d4ed8" },
  ];

  return (
    <>
      <div className="dash-greeting">
        <div>
          <h1>{todayGreeting()}, {user?.name.split(" ")[0]} 💛</h1>
          <div className="sub">Keeping you in the loop on {child.name}'s school life · {classLabel(className, section)}</div>
        </div>
        <div className="greet-date">
          <CalendarClock size={16} style={{ color: "var(--brand-600)" }} />
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      <div className="grid grid-stats" style={{ marginBottom: 18 }}>
        {cards.map((c, i) => (
          <StatCard key={i} icon={c.icon} color={c.color} value={c.value} label={c.label} trend={c.trend} />
        ))}
      </div>

      <div className="grid grid-ideals" style={{ marginBottom: 18 }}>
        <Card>
          <CardHead title={`${child.name.split(" ")[0]}'s academic performance`} sub="Unit Test 1 · subject-wise" />
          <div className="card-body">
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
              <Donut
                data={subjectPct.map((s) => ({ label: s.label, value: s.value }))}
                center={perf + "%"}
                centerSub={`Grade ${grade.grade}`}
              />
              <div style={{ flex: 1, minWidth: 180 }}>
                {subjectPct.map((s) => (
                  <div key={s.label} style={{ marginBottom: 10 }}>
                    <div className="kv" style={{ padding: "2px 0", fontSize: 12 }}>
                      <span className="k">{s.label}</span>
                      <span className="v" style={{ color: s.value >= 80 ? "var(--green)" : s.value >= 60 ? "var(--amber)" : "var(--rose)" }}>{s.value}%</span>
                    </div>
                    <div className="progress sm"><div className="bar" style={{ width: `${s.value}%`, background: s.value >= 80 ? "var(--green-2)" : s.value >= 60 ? "var(--amber-2)" : "var(--rose-2)" }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <CardHead title="Attendance overview" sub="Last 7 school days" />
          <div className="card-body">
            <Bars data={weeklyAttendanceSeries(state.attendanceDays, className, section, child.id, 7)} format={(v) => v + "%"} />
            <div className="legend" style={{ marginTop: 12 }}>
              <span className="li"><span className="swatch" style={{ background: "var(--green)" }} /> Present {att.present}</span>
              <span className="li"><span className="swatch" style={{ background: "var(--amber)" }} /> Late {att.late}</span>
              <span className="li"><span className="swatch" style={{ background: "var(--rose)" }} /> Absent {att.absent}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginBottom: 18 }}>
        <Card>
          <CardHead title="Upcoming assignments" actions={<Button variant="ghost" size="sm" onClick={() => navigate("/assignments")}>All</Button>} />
          <ul className="dash-list">
            {upcoming.slice(0, 4).map((a) => (
              <li key={a.id}>
                <span className="tag" style={{ background: "var(--amber-soft)", color: "#b45309" }}><Clock size={11} /></span>
                <div className="dl-main">
                  <div className="dl-title">{a.title}</div>
                  <div className="dl-sub">{a.subject} · due {prettyDate(a.dueDate)}</div>
                </div>
              </li>
            ))}
            {upcoming.length === 0 && <li className="text-3">No pending assignments 🎉</li>}
          </ul>
        </Card>
        <Card>
          <CardHead title="Upcoming exams" sub="Mid Term" />
          <ul className="dash-list">
            {exams.map((e) => (
              <li key={e.id}>
                <span className="tag" style={{ background: "var(--violet-soft)", color: "#6d28d9" }}><GraduationCap size={11} /></span>
                <div className="dl-main">
                  <div className="dl-title">{e.subject}</div>
                  <div className="dl-sub">{prettyDate(e.date)} · {e.startTime}</div>
                </div>
              </li>
            ))}
            {exams.length === 0 && <li className="text-3">No exams scheduled</li>}
          </ul>
        </Card>
        <Card>
          <CardHead title="School announcements" />
          <ul className="dash-list">
            {state.notices.slice(0, 3).map((n) => (
              <li key={n.id}>
                <span className="n-icon" style={{ background: "var(--brand-50)", color: "#1d4ed8" }}><Megaphone size={15} /></span>
                <div className="dl-main">
                  <div className="dl-title">{n.title}</div>
                  <div className="dl-sub">{prettyDate(n.date)}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        <Card>
          <CardHead title="Fee status" actions={<Button variant="soft" size="sm" onClick={() => navigate("/fees")}>Pay fees</Button>} />
          <div className="card-body">
            <div className="kv"><span className="k">Total due</span><span className="v" style={{ color: pendingAmount > 0 ? "var(--rose)" : "var(--green)" }}>{inr(pendingAmount)}</span></div>
            <div className="kv"><span className="k">Paid</span><span className="v" style={{ color: "var(--green)" }}>{inr(fees.reduce((s, f) => s + f.paid, 0))}</span></div>
            {pendingAmount > 0 ? <Badge tone="amber" dot>Last date 30 Sep</Badge> : <Badge tone="green" dot>All fees cleared</Badge>}
          </div>
        </Card>
        <Card>
          <CardHead title="Recent teacher messages" actions={<Button variant="ghost" size="sm" onClick={() => navigate("/messages")}>Open</Button>} />
          <ul className="dash-list">
            {teacherConversations.slice(0, 3).map((c) => {
              const last = c.messages[c.messages.length - 1];
              const other = c.participantIds.find((id) => id !== user?.id) ?? "";
              return (
                <li key={c.id}>
                  <span className="n-icon" style={{ background: "var(--violet-soft)", color: "#6d28d9" }}><MessageSquareText size={15} /></span>
                  <div className="dl-main">
                    <div className="dl-title">{c.participantNames[other]}</div>
                    <div className="dl-sub" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{last.text}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card>
          <CardHead title="Quick actions" />
          <div className="card-body">
            <div className="quick-actions">
              {quick.map((q) => (
                <button key={q.label} className="qa-btn" onClick={() => navigate(q.to)}>
                  <span className="qa-icon" style={{ background: q.bg, color: q.fg }}>{q.icon}</span>
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

export default function Dashboard() {
  const { user } = useApp();
  if (!user) return null;
  if (user.role === "teacher") return <TeacherDashboard />;
  if (user.role === "student") return <StudentDashboard />;
  return <ParentDashboard />;
}