import { Exam } from "./types";
import { subjectsForClass } from "./students";
import { addDaysFromToday } from "./helpers";

const subjectNames = ["English", "Mathematics", "Science", "Social Studies", "Hindi", "Computer Studies"];

export const examSchedule: Exam[] = (() => {
  const out: Exam[] = [];
  let i = 0;
  for (let c = 1; c <= 10; c++) {
    for (let s = 0; s < subjectNames.length; s++) {
      const date = addDaysFromToday(12 + s * 1 + Math.floor(s / 3));
      out.push({
        id: "exam_" + ++i,
        name: "Mid Term",
        subject: subjectsForClass(c).includes(subjectNames[s]) ? subjectNames[s] : subjectNames[s],
        className: c,
        date,
        startTime: s % 2 === 0 ? "09:00" : "14:00",
        endTime: s % 2 === 0 ? "11:00" : "16:00",
        room: s === 2 || s === 5 ? "Lab 1 & 2" : "Room " + ((c * 7 + s * 3) % 30 + 1),
      });
    }
  }
  return out;
})();

export function examForClass(className: number, _section: string): Exam[] {
  return examSchedule.filter((e) => e.className === className).slice(0, 6);
}

export function subjectsWithMarks(className: number): string[] {
  return subjectsForClass(className);
}