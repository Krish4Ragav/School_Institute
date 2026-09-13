import React, { useMemo, useState } from "react";
import { CalendarRange, MapPin } from "lucide-react";
import { useApp } from "../store/AppContext";
import { days, timetableForStudent, timetableForTeacher, subjectColor } from "../data/timetable";
import { teachersList } from "../data/teachers";
import { studentsList } from "../data/students";
import { parseClassLabel, classLabel } from "../data/helpers";
import { Card, Badge, Button, Tabs } from "../components/ui/primitives";

const periodCount = 8;

export default function Timetable() {
  const { user } = useApp();
  const teacher = user?.role === "teacher" ? teachersList.find((t) => t.empId === user.teacherId) : undefined;
  const child = user?.role === "teacher" ? undefined : studentsList.find((s) => s.id === user?.studentId);

  const [view, setView] = useState<"mine" | "class">(user?.role === "teacher" ? "mine" : "class");

  const teacherClasses = useMemo(() => (teacher ? teacher.classes : []), [teacher]);
  const [tClass, setTClass] = useState(teacherClasses[0] ?? "V-A");

  const teacherPeriods = useMemo(
    () => (teacher ? timetableForTeacher(teacher.name) : []),
    [teacher]
  );

  const viewPeriods = useMemo(() => {
    if (user?.role === "teacher") {
      if (view === "mine") return teacherPeriods;
      const { className, section } = parseClassLabel(tClass);
      return timetableForStudent(className, section);
    }
    if (!child) return [];
    return timetableForStudent(child.className, child.section);
  }, [user?.role, view, teacherPeriods, tClass, child]);

  const viewLabel = useMemo(() => {
    if (user?.role === "teacher" && view === "mine") return `${teacher?.name.split(" ")[0]}'s schedule`;
    if (child) return `Class ${classLabel(child.className, child.section)}`;
    return `Class ${tClass}`;
  }, [user?.role, view, teacher, child, tClass]);

  return (
    <>
      <div className="page-head" style={{ marginBottom: 18 }}>
        <div>
          <h1>Timetable</h1>
          <div className="sub">Weekly schedule · Monday to Friday</div>
        </div>
        <div className="page-actions">
          {user?.role === "teacher" && (
            <Tabs
              items={[
                { value: "mine", label: "My schedule" },
                { value: "class", label: "Class timetable" },
              ]}
              value={view}
              onChange={(v) => setView(v)}
            />
          )}
          {user?.role === "teacher" && view === "class" && (
            <div className="select-field" style={{ width: 130 }}>
              <label className="sr-only" htmlFor="tt-class">Class</label>
              <select id="tt-class" className="select" value={tClass} onChange={(e) => setTClass(e.target.value)}>
                {Array.from(new Set(teacherClasses.concat(["V-A", "V-B", "VI-A", "VII-A", "VIII-A", "IX-A", "X-A"]))).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
          <Badge tone="blue">
            <CalendarRange size={12} /> {viewLabel}
          </Badge>
        </div>
      </div>

      <Card>
        <div className="card-body" style={{ overflowX: "auto" }}>
          <div className="tt-grid" style={{ minWidth: 700 }}>
            <div />
            {days.map((d) => (
              <div className="tt-day" key={d}>
                <strong>{d.slice(0, 3)}</strong>
              </div>
            ))}
            {Array.from({ length: periodCount }, (_, idx) => idx + 1).map((p) => {
              const period = viewPeriods.find((x) => x.period === p);
              return (
                <React.Fragment key={p}>
                  <div className="tt-time">
                    <span>{p}</span>
                    <span style={{ fontWeight: 500, fontSize: 9.5 }}>
                      {period ? `${period.start.split(":")[0]}:${period.start.split(":")[1]}` : ""}
                    </span>
                  </div>
                  {days.map((d) => {
                    const cell = viewPeriods.find((x) => x.period === p && x.day === d);
                    if (!cell) {
                      return <div key={d} className="period-empty">—</div>;
                    }
                    return (
                      <div
                        key={d}
                        className="tt-period"
                        style={{ borderLeftColor: subjectColor(cell.subject) }}
                      >
                        <div className="tp-time">{cell.start} – {cell.end}</div>
                        <div className="tp-subject">{cell.subject}</div>
                        <div className="tp-teacher">
                          {user?.role === "teacher" ? `Class ${cell.className}-${cell.section}` : cell.teacher}
                        </div>
                        <div className="tp-room">
                          <MapPin size={9} style={{ verticalAlign: -1 }} /> {cell.room}
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>
        <div className="card-body tight" style={{ borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span className="text-3" style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>
            Periods run 09:00–15:45 with short breaks.
          </span>
          <Button variant="ghost" size="sm" style={{ marginLeft: "auto" }} onClick={() => window.print()}>Print schedule</Button>
        </div>
      </Card>
    </>
  );
}