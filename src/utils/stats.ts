import { AttendanceDay, Assignment, Student } from "../data/types";

export function studentAttendanceDays(days: AttendanceDay[], studentId: string): AttendanceDay[] {
  return days.filter((d) => d.records[studentId] !== undefined);
}

export function attendanceStatsForStudent(days: AttendanceDay[], studentId: string) {
  const mine = studentAttendanceDays(days, studentId);
  let present = 0;
  let late = 0;
  let absent = 0;
  for (const d of mine) {
    const s = d.records[studentId];
    if (s === "Present") present++;
    else if (s === "Late") late++;
    else if (s === "Absent") absent++;
  }
  const total = mine.length;
  const pct = total ? Math.round(((present + late) / total) * 1000) / 10 : 0;
  return { present, late, absent, total, pct };
}

export function attendanceStatsForClass(days: AttendanceDay[], className: number, section: string) {
  const cls = days.filter((d) => d.className === className && d.section === section);
  let present = 0;
  let late = 0;
  let absent = 0;
  for (const d of cls) {
    for (const s of Object.values(d.records)) {
      if (s === "Present") present++;
      else if (s === "Late") late++;
      else if (s === "Absent") absent++;
    }
  }
  const total = present + late + absent;
  const pct = total ? Math.round(((present + late) / total) * 1000) / 10 : 0;
  return { present, late, absent, total, pct, days: cls.length };
}

export function weeklyAttendanceSeries(
  days: AttendanceDay[],
  className: number,
  section: string,
  studentId?: string,
  count = 7
): { label: string; value: number }[] {
  const recent = days
    .filter((d) => d.className === className && d.section === section)
    .slice(-count);
  return recent.map((d) => {
    let present = 0;
    let total = 0;
    for (const [sid, s] of Object.entries(d.records)) {
      if (studentId && sid !== studentId) continue;
      total++;
      if (s === "Present" || s === "Late") present++;
    }
    return {
      label: new Date(d.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short" }),
      value: total ? Math.round((present / total) * 100) : 0,
    };
  });
}

export function monthShortLabel(ws: { label: string; value: number }[]) {
  return ws;
}

export function assignmentStatusFor(assignment: Assignment, studentId: string) {
  const sub = assignment.submissions.find((s) => s.studentId === studentId);
  return sub?.status ?? "Pending";
}

export function studentOfId(students: Student[], id: string): Student | undefined {
  return students.find((s) => s.id === id);
}