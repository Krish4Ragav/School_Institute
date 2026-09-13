import { AttendanceDay, Student } from "./types";
import { mulberry32, formatDate } from "./helpers";
import { studentsList } from "./students";

const rng = mulberry32(777123);

function recentWeekdays(count: number): string[] {
  const out: string[] = [];
  const d = new Date();
  while (out.length < count) {
    d.setDate(d.getDate() - 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) out.push(formatDate(d));
  }
  return out.reverse();
}

export function generateAttendanceDay(className: number, section: string, date: string): AttendanceDay {
  const records: AttendanceDay["records"] = {};
  for (const s of studentsList) {
    if (s.className !== className || s.section !== section) continue;
    const r = rng();
    records[s.id] = r < 0.88 ? "Present" : r < 0.94 ? "Late" : "Absent";
  }
  return { date, className, section, records };
}

export const initialAttendanceDays: AttendanceDay[] = (() => {
  const days = recentWeekdays(12);
  const out: AttendanceDay[] = [];
  for (const c of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    for (const s of ["A", "B"] as const) {
      for (const date of days) {
        out.push(generateAttendanceDay(c, s, date));
      }
    }
  }
  return out;
})();

export function studentsOfClass(_id: string, className: number, section: string): Student[] {
  return studentsList.filter((s) => s.className === className && s.section === section);
}

export function statusColor(status: string): string {
  if (status === "Present") return "green";
  if (status === "Absent") return "rose";
  if (status === "Late") return "amber";
  return "gray";
}