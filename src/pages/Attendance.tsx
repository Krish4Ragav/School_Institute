import { useEffect, useMemo, useState } from "react";
import { Check, X, Clock, Save, CalendarCheck2, TrendingUp, Users2 } from "lucide-react";
import { useApp } from "../store/AppContext";
import { studentsList } from "../data/students";
import { teachersList } from "../data/teachers";
import { parseClassLabel, todayISO, classLabel, prettyDate } from "../data/helpers";
import { attendanceStatsForStudent, weeklyAttendanceSeries, attendanceStatsForClass } from "../utils/stats";
import type { AttendanceDay } from "../data/types";
import { Card, CardHead, Badge, Button, Avatar, EmptyState } from "../components/ui/primitives";
import { Donut, Bars, Line } from "../components/charts";

type Status = "Present" | "Absent" | "Late";

export default function Attendance() {
  const { user } = useApp();
  if (user?.role === "teacher") return <TeacherAttendance />;
  return <ViewAttendance />;
}

/* ============ TEACHER ============ */
function TeacherAttendance() {
  const { user, state, saveAttendance } = useApp();
  const teacher = teachersList.find((t) => t.empId === (user?.teacherId ?? "")) ?? teachersList[0];
  const home = parseClassLabel(teacher.classes[0]);

  const [className, setClassName] = useState(home.className);
  const [section, setSection] = useState<"A" | "B">(home.section);
  const [date, setDate] = useState(todayISO());
  const [local, setLocal] = useState<Record<string, Status>>({});

  const roster = useMemo(
    () => studentsList.filter((s) => s.className === className && s.section === section),
    [className, section]
  );

  useEffect(() => {
    const existing = state.attendanceDays.find(
      (d) => d.className === className && d.section === section && d.date === date
    );
    const init: Record<string, Status> = {};
    for (const s of roster) init[s.id] = existing?.records[s.id] ?? "Present";
    setLocal(init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [className, section, date, roster.length]);

  const savedForDate = state.attendanceDays.find(
    (d) => d.className === className && d.section === section && d.date === date
  );
  const isSaved = !!(savedForDate && Object.keys(savedForDate.records).length > 0);

  const counts = useMemo(() => {
    const c = { Present: 0, Absent: 0, Late: 0 };
    for (const v of Object.values(local)) c[v]++;
    return c;
  }, [local]);

  const weekly = weeklyAttendanceSeries(state.attendanceDays, className, section, undefined, 7);
  const clsStats = attendanceStatsForClass(state.attendanceDays, className, section);

  const save = () => {
    const day: AttendanceDay = { date, className, section, records: { ...local } };
    saveAttendance(day);
  };

  const mark = (sid: string, st: Status) => {
    setLocal((prev) => ({ ...prev, [sid]: st }));
  };

  const markAll = (st: Status) => {
    const next: Record<string, Status> = {};
    for (const s of roster) next[s.id] = st;
    setLocal(next);
  };

  return (
    <>
      <div className="page-head" style={{ marginBottom: 18 }}>
        <div>
          <h1>Mark Attendance</h1>
          <div className="sub">Record and update attendance for your class</div>
        </div>
        <div className="page-actions">
          <Button variant="outline" size="sm" onClick={() => markAll("Present")}><Check size={15} /> All present</Button>
          <Button variant="outline" size="sm" onClick={() => markAll("Absent")}><X size={15} /> All absent</Button>
          {isSaved ? (
            <Badge tone="green" style={{ padding: "8px 12px", fontSize: "var(--fs-sm)" }}>Saved for {prettyDate(date)}</Badge>
          ) : (
            <Badge tone="amber" style={{ padding: "8px 12px", fontSize: "var(--fs-sm)" }}>Unsaved changes</Badge>
          )}
        </div>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ padding: "14px 16px" }}>
          <div className="filters-bar">
            <div className="select-field">
              <label className="sr-only" htmlFor="att-class">Class</label>
              <select id="att-class" className="select" value={className} onChange={(e) => setClassName(Number(e.target.value))}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>
            <div className="select-field">
              <label className="sr-only" htmlFor="att-sec">Section</label>
              <select id="att-sec" className="select" value={section} onChange={(e) => setSection(e.target.value as "A" | "B")}>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
            </div>
            <div className="input-search" style={{ width: 190 }}>
              <CalendarCheck2 size={16} />
              <input type="date" className="input" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} aria-label="Attendance date" />
            </div>
            <div className="att-summary" style={{ marginLeft: "auto" }}>
              <div className="att-stat-mini" style={{ minWidth: 80 }}><div className="a-value" style={{ color: "var(--green)" }}>{counts.Present}</div><div className="a-label">Present</div></div>
              <div className="att-stat-mini" style={{ minWidth: 80 }}><div className="a-value" style={{ color: "var(--amber)" }}>{counts.Late}</div><div className="a-label">Late</div></div>
              <div className="att-stat-mini" style={{ minWidth: 80 }}><div className="a-value" style={{ color: "var(--rose)" }}>{counts.Absent}</div><div className="a-label">Absent</div></div>
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 18 }}>
        <div className="table-wrap">
          <table className="table table-responsive nowrap">
            <thead>
              <tr><th>Student</th><th>ID</th><th>Roll</th><th>Status</th></tr>
            </thead>
            <tbody>
              {roster.map((s) => {
                const st = local[s.id] ?? "Present";
                return (
                  <tr key={s.id} className={st === "Present" ? "att-row present" : st === "Absent" ? "att-row absent" : "att-row late"} style={{ background: st === "Present" ? "var(--green-soft)" : st === "Absent" ? "var(--rose-soft)" : "var(--amber-soft)" }}>
                    <td data-label="Student">
                      <div className="t-main">
                        <Avatar name={s.name} size={32} color={s.avatarColor} />
                        <div>
                          <div className="t-strong">{s.name}</div>
                          <div className="meta">{s.gender === "M" ? "Male" : "Female"} · {s.dob}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="ID" className="mono">{s.id}</td>
                    <td data-label="Roll">{s.rollNo}</td>
                    <td data-label="Status">
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button className={`att-status-pill ${st === "Present" ? "att-pill-p" : "att-pill-n"}`} onClick={() => mark(s.id, "Present")} aria-label="Present" title="Present"><Check size={15} /></button>
                        <button className={`att-status-pill ${st === "Late" ? "att-pill-l" : "att-pill-n"}`} onClick={() => mark(s.id, "Late")} aria-label="Late" title="Late"><Clock size={15} /></button>
                        <button className={`att-status-pill ${st === "Absent" ? "att-pill-a" : "att-pill-n"}`} onClick={() => mark(s.id, "Absent")} aria-label="Absent" title="Absent"><X size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {roster.length === 0 && <EmptyState title="No students" message="No students match this class and section." />}
        </div>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 22 }}>
        <Button size="lg" onClick={save}><Save size={18} /> Save attendance</Button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1.4fr 1fr" }}>
        <Card>
          <CardHead title="Today's breakdown" sub={`${classLabel(className, section)} · ${prettyDate(date)}`} />
          <div className="card-body" style={{ textAlign: "center" }}>
            <Donut
              data={[
                { label: "Present", value: counts.Present, color: "#22c55e" },
                { label: "Late", value: counts.Late, color: "#f59e0b" },
                { label: "Absent", value: counts.Absent, color: "#f43f5e" },
              ]}
              center={roster.length ? `${Math.round(((counts.Present + counts.Late) / roster.length) * 100)}%` : "0%"}
              centerSub="Present"
            />
          </div>
        </Card>
        <Card>
          <CardHead title="Weekly trends" sub="Attendance % · last 7 school days" />
          <div className="card-body">
            <Bars data={weekly} format={(v) => v + "%"} />
          </div>
        </Card>
        <Card>
          <CardHead title="Class statistics" sub="Rolling record" />
          <div className="card-body">
            <div className="kv"><span className="k"><CalendarCheck2 size={13} /> Days recorded</span><span className="v">{clsStats.days}</span></div>
            <div className="kv"><span className="k"><Users2 size={13} /> Total entries</span><span className="v">{clsStats.total}</span></div>
            <div className="kv"><span className="k"><Check size={13} /> Average attendance</span><span className="v" style={{ color: "var(--green)" }}>{clsStats.pct}%</span></div>
            <div className="kv"><span className="k"><TrendingUp size={13} /> Monthly %</span><span className="v">{clsStats.pct}%</span></div>
          </div>
        </Card>
      </div>
    </>
  );
}

/* ============ STUDENT / PARENT VIEW ============ */
function ViewAttendance() {
  const { user, state, notify } = useApp();
  const student = studentsList.find((s) => s.id === user?.studentId);
  if (!student) return null;

  const days = useMemo(() => {
    return state.attendanceDays
      .filter((d) => d.className === student.className && d.section === student.section && d.records[student.id])
      .slice(-12)
      .reverse();
  }, [state.attendanceDays, student.className, student.section, student.id]);

  const stats = attendanceStatsForStudent(state.attendanceDays, student.id);
  const series = weeklyAttendanceSeries(state.attendanceDays, student.className, student.section, student.id, 7);

  return (
    <>
      <div className="page-head" style={{ marginBottom: 18 }}>
        <div>
          <h1>Attendance</h1>
          <div className="sub">{user?.role === "parent" ? `${student.name}'s attendance record` : "Your attendance record"}</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr", marginBottom: 18 }}>
        <Card className="card-pad">
          <div style={{ fontSize: "var(--fs-xl)", fontWeight: 800, fontFamily: "var(--font-head)", color: "var(--green)" }}>{stats.pct}%</div>
          <div style={{ color: "var(--text-3)", fontWeight: 500, fontSize: "var(--fs-sm)" }}>Overall attendance</div>
        </Card>
        <Card className="card-pad">
          <div style={{ fontSize: "var(--fs-xl)", fontWeight: 800, fontFamily: "var(--font-head)" }}>{stats.present}</div>
          <div style={{ color: "var(--text-3)", fontWeight: 500, fontSize: "var(--fs-sm)" }}>Days present</div>
        </Card>
        <Card className="card-pad">
          <div style={{ fontSize: "var(--fs-xl)", fontWeight: 800, fontFamily: "var(--font-head)", color: "var(--amber)" }}>{stats.late}</div>
          <div style={{ color: "var(--text-3)", fontWeight: 500, fontSize: "var(--fs-sm)" }}>Late arrivals</div>
        </Card>
        <Card className="card-pad">
          <div style={{ fontSize: "var(--fs-xl)", fontWeight: 800, fontFamily: "var(--font-head)", color: "var(--rose)" }}>{stats.absent}</div>
          <div style={{ color: "var(--text-3)", fontWeight: 500, fontSize: "var(--fs-sm)" }}>Days absent</div>
        </Card>
      </div>

      <div className="grid grid-ideals" style={{ marginBottom: 18 }}>
        <Card>
          <CardHead title="Trend" sub="Last 7 school days" />
          <div className="card-body">
            <Line data={series} format={(v) => v + "%"} />
          </div>
        </Card>
        <Card>
          <CardHead title="Distribution" sub="All recorded days" />
          <div className="card-body" style={{ textAlign: "center" }}>
            <Donut
              data={[
                { label: "Present", value: stats.present, color: "#22c55e" },
                { label: "Late", value: stats.late, color: "#f59e0b" },
                { label: "Absent", value: stats.absent, color: "#f43f5e" },
              ]}
              center={`${stats.pct}%`}
              centerSub="Overall"
            />
          </div>
        </Card>
      </div>

      <Card>
        <CardHead title="Daily record" sub="Most recent first" />
        <div className="table-wrap">
          <table className="table table-responsive nowrap">
            <thead>
              <tr><th>Date</th><th>Day</th><th>Status</th></tr>
            </thead>
            <tbody>
              {days.map((d) => {
                const st = d.records[student.id];
                return (
                  <tr key={d.date}>
                    <td data-label="Date" className="t-strong">{prettyDate(d.date)}</td>
                    <td data-label="Day">{new Date(d.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long" })}</td>
                    <td data-label="Status">
                      <Badge tone={st === "Present" ? "green" : st === "Late" ? "amber" : "rose"} dot>{st}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {days.length === 0 && <EmptyState title="No attendance yet" message="Attendance records will appear here after they are marked." />}
        </div>
      </Card>
      <div style={{ marginTop: 10 }}>
        <Button variant="ghost" size="sm" onClick={() => notify("Attendance is recorded by your class teacher daily.", "info")}>Why is my attendance missing a day?</Button>
      </div>
    </>
  );
}