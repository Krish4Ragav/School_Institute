import { Download, Mail, BarChart3, Trophy, CalendarCheck2, FileText, TrendingUp } from "lucide-react";
import { useApp } from "../store/AppContext";
import { studentsList } from "../data/students";
import { teachersList } from "../data/teachers";
import { gradeFor } from "../data/helpers";
import type { Student } from "../data/types";
import { Card, CardHead, Badge, Button, Progress, EmptyState } from "../components/ui/primitives";
import { Donut, Bars } from "../components/charts";

function classStudents(className: number, section: string) {
  return studentsList.filter((s) => s.className === className && s.section === section);
}

export default function Reports() {
  const { user, state, notify } = useApp();
  const child = studentsList.find((s) => s.id === user?.studentId);

  if (user?.role === "teacher") {
    const mentor = teachersList.find((t) => t.empId === user.teacherId);
    const cls = child ? { className: child.className, section: child.section } : { className: 5, section: "A" };
    const studs = classStudents(cls.className, cls.section);

    const attPct = (s: Student) => {
      const days = state.attendanceDays.filter((d) => d.className === s.className && d.section === s.section && d.records[s.id]);
      if (!days.length) return 0;
      const present = days.filter((d) => ["Present", "Late"].includes(d.records[s.id])).length;
      return Math.round((present / days.length) * 100);
    };

    const subjectAvg = (() => {
      const map: Record<string, { sum: number; max: number; count: number }> = {};
      for (const s of studs) {
        for (const m of s.marks) {
          (map[m.subject] ??= { sum: 0, max: m.max, count: 0 });
          map[m.subject].sum += m.scored;
          map[m.subject].max = m.max;
          map[m.subject].count += 1;
        }
      }
      return Object.entries(map).map(([name, v]) => ({
        label: name,
        value: Math.round((v.sum / (v.max * v.count)) * 100),
      }));
    })();

    const classAvg = Math.round(subjectAvg.reduce((a, x) => a + x.value, 0) / Math.max(subjectAvg.length, 1));
    const classAtt = Math.round(studs.reduce((a, s) => a + attPct(s), 0) / Math.max(studs.length, 1));
    const top = [...studs].sort((a, b) => b.curAcademicPct - a.curAcademicPct).slice(0, 5);

    return (
      <>
        <div className="page-head" style={{ marginBottom: 18 }}>
          <div>
            <h1>Reports</h1>
            <div className="sub">Class {cls.className}-{cls.section} · {mentor ? `Mentored by ${mentor.name}` : "Academic overview"}</div>
          </div>
          <Button onClick={() => notify("Class report exported as PDF", "success")}><Download size={16} /> Export report</Button>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginBottom: 18 }}>
          <Card className="card-pad">
            <div className="stat-mini">
              <span className="stat-icon" style={{ background: "var(--brand-100)", color: "var(--brand-700)" }}><BarChart3 size={16} /></span>
              <div>
                <div className="t-strong" style={{ fontSize: "var(--fs-xl)" }}>{classAvg}%</div>
                <div className="text-3" style={{ fontSize: "var(--fs-sm)" }}>Average marks · {subjectAvg.length} subjects</div>
              </div>
            </div>
          </Card>
          <Card className="card-pad">
            <div className="stat-mini">
              <span className="stat-icon" style={{ background: "var(--green-soft)", color: "var(--green)" }}><CalendarCheck2 size={16} /></span>
              <div>
                <div className="t-strong" style={{ fontSize: "var(--fs-xl)" }}>{classAtt}%</div>
                <div className="text-3" style={{ fontSize: "var(--fs-sm)" }}>Average attendance</div>
              </div>
            </div>
          </Card>
          <Card className="card-pad">
            <div className="stat-mini">
              <span className="stat-icon" style={{ background: "var(--amber-soft)", color: "var(--amber)" }}><Trophy size={16} /></span>
              <div>
                <div className="t-strong" style={{ fontSize: "var(--fs-xl)" }}>{studs.length}</div>
                <div className="text-3" style={{ fontSize: "var(--fs-sm)" }}>Students on roll</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "1.2fr 1fr", marginBottom: 18 }}>
          <Card>
            <CardHead title="Subject-wise average" sub={`Unit Test 1 · Class ${cls.className}-${cls.section}`} />
            <div className="card-body"><Bars data={subjectAvg} height={190} /></div>
          </Card>
          <Card>
            <CardHead title="Top performers" sub="By current academic percentage" />
            <div className="card-body" style={{ paddingTop: 6 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {top.map((s, i) => (
                  <div key={s.id} className="perf-row">
                    <span className="perf-rank" style={{ background: i === 0 ? "var(--amber-soft)" : "var(--brand-50)", color: i === 0 ? "var(--amber)" : "var(--brand-700)" }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{s.name}</div>
                      <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-3)" }}>Class {s.className}-{s.section} · Roll {s.rollNo}</div>
                    </div>
                    <Badge tone="blue">{s.curAcademicPct}%</Badge>
                    <Badge tone="gray">{gradeFor(s.curAcademicPct).grade}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <CardHead title="Class marks sheet" sub={`All students · class ${cls.className}-${cls.section}`} />
          <div className="table-wrap">
            <table className="table table-responsive">
              <thead>
                <tr><th>#</th><th>Name</th><th>Attendance</th><th>Prev. year</th><th>Current</th><th>Improvement</th><th>Grade</th></tr>
              </thead>
              <tbody>
                {[...studs].sort((a, b) => a.rollNo - b.rollNo).map((s, i) => (
                  <tr key={s.id}>
                    <td data-label="">{i + 1}</td>
                    <td data-label="Name"><span className="t-strong" style={{ fontSize: "var(--fs-sm)" }}>{s.name}</span></td>
                    <td data-label="Attendance"><span className="mono">{attPct(s)}%</span></td>
                    <td data-label="Prev. year"><span className="mono">{s.prevAcademicPct}%</span></td>
                    <td data-label="Current"><span className="mono" style={{ color: "var(--brand-700)", fontWeight: 700 }}>{s.curAcademicPct}%</span></td>
                    <td data-label="Improvement">
                      <span className="mono" style={{ color: s.curAcademicPct >= s.prevAcademicPct ? "var(--green)" : "var(--rose)", fontWeight: 600 }}>
                        {s.curAcademicPct >= s.prevAcademicPct ? "+" : ""}{s.curAcademicPct - s.prevAcademicPct}
                      </span>
                    </td>
                    <td data-label="Grade"><Badge tone={s.curAcademicPct >= 85 ? "green" : s.curAcademicPct >= 60 ? "blue" : "amber"}>{gradeFor(s.curAcademicPct).grade}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {studs.length === 0 && <EmptyState title="No students" />}
          </div>
        </Card>
      </>
    );
  }

  if (child) {
    const subjPct = child.marks.map((m) => ({ label: m.subject, value: Math.round((m.scored / m.max) * 100) }));
    const avg = subjPct.length ? Math.round(subjPct.reduce((a, x) => a + x.value, 0) / subjPct.length) : child.curAcademicPct;
    const days = state.attendanceDays.filter((d) => d.className === child.className && d.section === child.section && d.records[child.id]);
    const att = days.length ? Math.round((days.filter((d) => ["Present", "Late"].includes(d.records[child.id])).length / days.length) * 100) : null;
    const classmates = classStudents(child.className, child.section).sort((a, b) => b.curAcademicPct - a.curAcademicPct);
    const rank = classmates.findIndex((x) => x.id === child.id) + 1;

    return (
      <>
        <div className="page-head" style={{ marginBottom: 18 }}>
          <div>
            <h1>Progress Report</h1>
            <div className="sub">{child.name} · Class {child.className}-{child.section} · Roll {child.rollNo}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outline" onClick={() => notify(`Report emailed to ${child.parentEmail}`)}><Mail size={16} /> Email</Button>
            <Button onClick={() => notify("Progress report downloaded as PDF", "success")}><Download size={16} /> Download</Button>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr", marginBottom: 18 }}>
          <Card className="card-pad">
            <div className="stat-mini">
              <span className="stat-icon" style={{ background: "var(--brand-100)", color: "var(--brand-700)" }}><BarChart3 size={16} /></span>
              <div>
                <div className="t-strong" style={{ fontSize: "var(--fs-xl)" }}>{avg}%</div>
                <div className="text-3" style={{ fontSize: "var(--fs-sm)" }}>Overall average</div>
              </div>
            </div>
          </Card>
          <Card className="card-pad">
            <div className="stat-mini">
              <span className="stat-icon" style={{ background: "var(--violet-soft)", color: "var(--violet)" }}><FileText size={16} /></span>
              <div>
                <div className="t-strong" style={{ fontSize: "var(--fs-xl)" }}>{gradeFor(avg).grade}</div>
                <div className="text-3" style={{ fontSize: "var(--fs-sm)" }}>Overall grade</div>
              </div>
            </div>
          </Card>
          <Card className="card-pad">
            <div className="stat-mini">
              <span className="stat-icon" style={{ background: "var(--green-soft)", color: "var(--green)" }}><CalendarCheck2 size={16} /></span>
              <div>
                <div className="t-strong" style={{ fontSize: "var(--fs-xl)" }}>{att === null ? "—" : `${att}%`}</div>
                <div className="text-3" style={{ fontSize: "var(--fs-sm)" }}>Attendance</div>
              </div>
            </div>
          </Card>
          <Card className="card-pad">
            <div className="stat-mini">
              <span className="stat-icon" style={{ background: "var(--amber-soft)", color: "var(--amber)" }}><Trophy size={16} /></span>
              <div>
                <div className="t-strong" style={{ fontSize: "var(--fs-xl)" }}>#{rank}</div>
                <div className="text-3" style={{ fontSize: "var(--fs-sm)" }}>Rank of {classmates.length} in class</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "1fr 1.2fr", marginBottom: 18 }}>
          <Card>
            <CardHead title="Subject performance" sub="Unit Test 1 · out of 20" />
            <div className="card-body">
              <Donut data={subjPct} size={170} center={<strong style={{ fontSize: "1.5rem" }}>{avg}%</strong>} centerSub="average" />
            </div>
          </Card>
          <Card>
            <CardHead title="Marks breakdown" sub="Unit Test 1" />
            <div className="card-body" style={{ paddingTop: 6 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {child.marks.map((m) => {
                  const pct = Math.round((m.scored / m.max) * 100);
                  return (
                    <div key={m.subject}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{m.subject}</span>
                        <span className="mono" style={{ fontSize: "var(--fs-sm)" }}>
                          <b style={{ color: "var(--brand-700)" }}>{m.scored}</b>/{m.max} · <b>{gradeFor(pct).grade}</b>
                        </span>
                      </div>
                      <Progress pct={Math.min(100, pct)} color={pct >= 60 ? "var(--green-2)" : pct >= 40 ? "var(--amber-2)" : "var(--rose-2)"} style={{ height: 8 }} />
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <CardHead title="Academic progression" sub="Year-on-year comparison" />
          <div className="card-body">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>Previous year ({child.admissionYear - 1} academic year)</span>
                  <span className="mono" style={{ fontSize: "var(--fs-sm)" }}>{child.prevAcademicPct}%</span>
                </div>
                <Progress pct={child.prevAcademicPct} color="var(--brand-500)" style={{ height: 10 }} />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>Current year (2026–27)</span>
                  <span className="mono" style={{ fontSize: "var(--fs-sm)", color: "var(--brand-700)" }}>{child.curAcademicPct}%</span>
                </div>
                <Progress pct={child.curAcademicPct} color="var(--green-2)" style={{ height: 10 }} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, background: "var(--green-soft)", color: "var(--green)", padding: "10px 14px", borderRadius: "var(--r-sm)", fontSize: "var(--fs-sm)", fontWeight: 600 }}>
              <TrendingUp size={16} /> {child.curAcademicPct >= child.prevAcademicPct ? "Improved" : "Declined"} by {Math.abs(child.curAcademicPct - child.prevAcademicPct)}% compared to last year.
            </div>
          </div>
        </Card>
      </>
    );
  }

  return (
    <Card>
      <EmptyState title="No report available" message="Reports will show here once tied to a student record." />
    </Card>
  );
}