import { useMemo, useState } from "react";
import { CalendarClock, PencilLine, BarChart3, Save, Award } from "lucide-react";
import { useApp } from "../store/AppContext";
import { studentsList, subjectsForClass } from "../data/students";
import { teachersList } from "../data/teachers";
import { examSchedule } from "../data/exams";
import { gradeFor, prettyDate, classLabel, parseClassLabel, daysBetween, todayISO } from "../data/helpers";
import { Card, CardHead, Badge, Button, Avatar, Tabs, EmptyState, Progress } from "../components/ui/primitives";
import { Donut, Bars, Line } from "../components/charts";

type Tab = "schedule" | "results" | "marks";

const maxForExam: Record<string, number> = { "Mid Term": 50, "Unit Test 2": 20 };

export default function ExamsResults() {
  const { user } = useApp();
  const [tab, setTab] = useState<Tab>(user?.role === "teacher" ? "marks" : "results");

  return (
    <>
      <div className="page-head" style={{ marginBottom: 18 }}>
        <div>
          <h1>Exams & Results</h1>
          <div className="sub">Examination schedule, results and performance analytics</div>
        </div>
        <Tabs<Tab>
          items={[
            { value: "results", label: <><BarChart3 size={14} /> Results</> },
            { value: "schedule", label: <><CalendarClock size={14} /> Exam schedule</> },
            ...(user?.role === "teacher" ? [{ value: "marks" as Tab, label: <><PencilLine size={14} /> Enter marks</> }] : []),
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === "schedule" && <ScheduleTab />}
      {tab === "results" && <ResultsTab />}
      {tab === "marks" && <MarksTab />}
    </>
  );
}

function ScheduleTab() {
  const { user } = useApp();
  const child = studentsList.find((s) => s.id === user?.studentId);
  const [classFilter, setClassFilter] = useState(child?.className ?? 5);

  const list = useMemo(() => {
    const c = user?.role === "teacher" ? classFilter : child?.className;
    const upcoming = examSchedule.filter((e) => e.className === c && daysBetween(todayISO(), e.date) >= -3);
    return upcoming.sort((a, b) => a.date.localeCompare(b.date));
  }, [child, user?.role, classFilter]);

  return (
    <Card>
      <CardHead
        title="Mid-Term Examination schedule"
        sub="Dates, times and rooms · 2026–27"
        actions={
          user?.role === "teacher" ? (
            <div className="select-field" style={{ width: 120 }}>
              <label className="sr-only" htmlFor="exam-class">Class</label>
              <select id="exam-class" className="select" value={classFilter} onChange={(e) => setClassFilter(Number(e.target.value))}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((c) => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
          ) : undefined
        }
      />
      <div className="card-body">
        <div className="grid" style={{ gap: 12 }}>
          {list.map((e) => (
            <div key={e.id} className="exam-row">
              <div className="exam-date-box">
                <div className="ed-day">{new Date(e.date + "T00:00:00").getDate()}</div>
                <div className="ed-month">{new Date(e.date + "T00:00:00").toLocaleDateString("en-IN", { month: "short" })}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontFamily: "var(--font-head)", fontSize: "var(--fs-lg)" }}>{e.subject}</div>
                <div style={{ fontSize: "var(--fs-sm)", color: "var(--text-3)" }}>
                  {e.name} · Class {e.className} · {e.startTime} – {e.endTime}
                </div>
              </div>
              <Badge tone="blue"><CalendarClock size={12} /> {prettyDate(e.date)}</Badge>
              <Badge tone="gray">{e.room}</Badge>
            </div>
          ))}
        </div>
        {list.length === 0 && <EmptyState title="No exams scheduled" message="New schedules appear here before each exam cycle." />}
      </div>
    </Card>
  );
}

function buildResults(studentId: string, markEntries: typeof initialMarkEntries) {
  const student = studentsList.find((s) => s.id === studentId)!;
  const subjects = subjectsForClass(student.className);
  const perSubject = subjects.map((sub) => {
    const base = student.marks.filter((m) => m.subject === sub);
    const extra = markEntries.filter((m) => m.studentId === studentId && m.subject === sub);
    const all = [...base, ...extra.map((m) => ({ subject: m.subject, exam: m.examName, scored: m.scored, max: m.max }))];
    return { subject: sub, marks: all };
  });
  let scored = 0;
  let max = 0;
  for (const p of perSubject) for (const m of p.marks) { scored += m.scored; max += m.max; }
  const overall = max ? Math.round((scored / max) * 1000) / 10 : 0;
  const exams = Array.from(new Set(perSubject.flatMap((p) => p.marks.map((m) => m.exam))));
  const examSeries = exams.map((ex) => {
    let s = 0;
    let m = 0;
    for (const p of perSubject) {
      const mm = p.marks.find((x) => x.exam === ex);
      if (mm) { s += mm.scored; m += mm.max; }
    }
    return { label: ex, value: m ? Math.round((s / m) * 100) : 0 };
  });
  return { perSubject, overall, exams, examSeries, grade: gradeFor(overall), student };
}

type RRow = { id: string; studentId: string; examName: string; subject: string; scored: number; max: number };
const initialMarkEntries: RRow[] = [];

function ResultsTab() {
  const { user, state } = useApp();
  const child = studentsList.find((s) => s.id === user?.studentId);
  if (!child) {
    return (
      <Card>
        <EmptyState title="No report card" message="Select a student view to see results." />
      </Card>
    );
  }
  const r = buildResults(child.id, state.markEntries as RRow[]);
  const subjectData = r.perSubject.map((p) => {
    let s = 0, m = 0;
    for (const mm of p.marks) { s += mm.scored; m += mm.max; }
    return { label: p.subject, value: m ? Math.round((s / m) * 100) : 0 };
  });

  return (
    <>
      <div className="grid grid-ideals" style={{ marginBottom: 18 }}>
        <Card>
          <CardHead title="Overall performance report" sub={`${child.name} · ${classLabel(child.className, child.section)}`} />
          <div className="card-body">
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
              <Donut
                data={subjectData.map((d) => ({ label: d.label, value: d.value }))}
                center={`${r.overall}%`}
                centerSub={`Grade ${r.grade.grade}`}
              />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div className="kv"><span className="k">Overall percentage</span><span className="v">{r.overall}%</span></div>
                <div className="kv"><span className="k"><Award size={13} /> Grade</span><span className="v">{r.grade.grade} · {r.grade.remark}</span></div>
                <div className="kv"><span className="k">Exams evaluated</span><span className="v">{r.exams.join(", ") || "—"}</span></div>
                <div className="legend" style={{ marginTop: 8 }}>
                  <span className="li"><span className="swatch" style={{ background: "var(--green)" }} /> Pass ≥ 40%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <CardHead title="Exam-wise trend" sub="Percentage across evaluations" />
          <div className="card-body">
            {r.examSeries.length > 1 ? (
              <Line data={r.examSeries} format={(v) => v + "%"} />
            ) : (
              <Bars data={r.examSeries.length ? r.examSeries : [{ label: "Unit Test 1", value: r.overall }]} format={(v) => v + "%"} highlightLast />
            )}
          </div>
        </Card>
      </div>

      <Card>
        <CardHead title="Subject-wise performance" sub="Marks across all evaluated exams" />
        <div className="card-body">
          <div className="table-wrap">
            <table className="table nowrap">
              <thead>
                <tr><th>Subject</th><th>Exams</th><th>Marks</th><th>Score</th><th>Grade</th></tr>
              </thead>
              <tbody>
                {r.perSubject.map((p) => {
                  let s = 0, m = 0;
                  for (const mm of p.marks) { s += mm.scored; m += mm.max; }
                  const pct = m ? Math.round((s / m) * 100) : 0;
                  const g = gradeFor(pct);
                  return (
                    <tr key={p.subject}>
                      <td className="t-strong">{p.subject}</td>
                      <td>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          {p.marks.map((mm, i) => (
                            <span key={i} className="tag" style={{ background: "var(--surface-3)", color: "var(--text-2)" }}>{mm.exam}</span>
                          ))}
                        </div>
                      </td>
                      <td className="mono">{s} / {m}</td>
                      <td style={{ width: 200 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Progress pct={pct} color={pct >= 80 ? "var(--green-2)" : pct >= 60 ? "var(--amber-2)" : "var(--rose-2)"} />
                          <b className="mono">{pct}%</b>
                        </div>
                      </td>
                      <td><Badge tone={pct >= 80 ? "green" : pct >= 60 ? "blue" : pct >= 40 ? "amber" : "rose"}>{g.grade}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </>
  );
}

function MarksTab() {
  const { user, state, enterMarks, notify } = useApp();
  const teacher = teachersList.find((t) => t.empId === user?.teacherId);
  const home = parseClassLabel(teacher?.classes[0] ?? "V-A");
  const [className, setClassName] = useState(home.className);
  const [section, setSection] = useState<"A" | "B">(home.section);
  const [subject, setSubject] = useState(subjectsForClass(home.className)[0]);
  const [examName, setExamName] = useState("Mid Term");
  const [draft, setDraft] = useState<Record<string, string>>({});

  const roster = useMemo(
    () => studentsList.filter((s) => s.className === className && s.section === section),
    [className, section]
  );
  const max = maxForExam[examName] ?? 50;

  const existingScored = (sid: string) => {
    const row = state.markEntries.find((m) => m.studentId === sid && m.examName === examName && m.subject === subject);
    return row?.scored;
  };

  const saveAll = () => {
    const rows: RRow[] = [];
    let base = 0;
    for (const s of roster) {
      const val = draft[s.id] ?? "";
      if (val === "") continue;
      const scored = Math.max(0, Math.min(max, Number(val)));
      rows.push({ id: "row_" + s.id, studentId: s.id, examName, subject, scored, max });
      base++;
    }
    if (!rows.length) {
      notify("Enter at least one score before saving.", "info");
      return;
    }
    enterMarks(rows);
    setDraft({});
  };

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ padding: "14px 16px" }}>
          <div className="filters-bar">
            <div className="select-field"><label className="sr-only" htmlFor="mk-class">Class</label>
              <select id="mk-class" className="select" value={className} onChange={(e) => { setClassName(Number(e.target.value)); setSubject(subjectsForClass(Number(e.target.value))[0]); }}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((c) => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
            <div className="select-field"><label className="sr-only" htmlFor="mk-sec">Section</label>
              <select id="mk-sec" className="select" value={section} onChange={(e) => setSection(e.target.value as "A" | "B")}>
                <option value="A">Section A</option><option value="B">Section B</option>
              </select>
            </div>
            <div className="select-field"><label className="sr-only" htmlFor="mk-sub">Subject</label>
              <select id="mk-sub" className="select" value={subject} onChange={(e) => setSubject(e.target.value)}>
                {subjectsForClass(className).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="select-field"><label className="sr-only" htmlFor="mk-exam">Exam</label>
              <select id="mk-exam" className="select" value={examName} onChange={(e) => setExamName(e.target.value)}>
                <option>Mid Term</option><option>Unit Test 2</option>
              </select>
            </div>
            <Badge tone="blue">Out of {max}</Badge>
            {className === home.className && section === home.section && subject === subjectsForClass(home.className)[0] && examName === "Mid Term" && (
              <Button variant="ghost" size="sm" style={{ marginLeft: "auto" }} onClick={() => notify("Demo mode: fill the score column and click Save marks.", "info")}>?</Button>
            )}
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 18 }}>
        <div className="table-wrap">
          <table className="table table-responsive nowrap">
            <thead>
              <tr><th>Student</th><th>ID</th><th>Existing</th><th>Score</th></tr>
            </thead>
            <tbody>
              {roster.map((s) => {
                const prev = existingScored(s.id);
                const val = draft[s.id] ?? "";
                return (
                  <tr key={s.id}>
                    <td data-label="Student">
                      <div className="t-main">
                        <Avatar name={s.name} size={32} color={s.avatarColor} />
                        <div className="t-strong">{s.name}</div>
                      </div>
                    </td>
                    <td data-label="ID" className="mono">{s.id}</td>
                    <td data-label="Existing">{prev != null ? <Badge tone="green">{prev}/{max}</Badge> : <span className="text-4">—</span>}</td>
                    <td data-label="Score">
                      <input
                        className="input"
                        type="number"
                        min={0}
                        max={max}
                        style={{ width: 110 }}
                        placeholder="Enter score"
                        value={val}
                        onChange={(e) => setDraft((p) => ({ ...p, [s.id]: e.target.value }))}
                        aria-label={`Score for ${s.name}`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button size="lg" onClick={saveAll}><Save size={18} /> Save marks</Button>
      </div>
    </>
  );
}