import { TimetablePeriod } from "./types";
import { mulberry32 } from "./helpers";
import { subjectsForClass } from "./students";
import { teachersList } from "./teachers";

export const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

const slots = [
  { start: "09:00", end: "09:45" },
  { start: "09:45", end: "10:30" },
  { start: "10:30", end: "11:15" },
  { start: "11:30", end: "12:15" },
  { start: "12:15", end: "13:00" },
  { start: "13:30", end: "14:15" },
  { start: "14:15", end: "15:00" },
  { start: "15:00", end: "15:45" },
];

const subjectColors: Record<string, string> = {
  English: "#2563eb",
  Mathematics: "#7c3aed",
  Science: "#059669",
  "Social Studies": "#d97706",
  Hindi: "#db2777",
  "Computer Studies": "#0891b2",
  Kannada: "#dc2626",
  "Physical Education": "#ea580c",
  "Art & Craft": "#be185d",
  Music: "#9333ea",
  "Moral Science": "#0e7490",
  "General Knowledge": "#2563eb",
};

const roomsBySubject: Record<string, string[]> = {
  Science: ["Lab 1", "Lab 2"],
  "Computer Studies": ["Computer Lab"],
  "Physical Education": ["Playground", "Indoor Court"],
  "Art & Craft": ["Art Studio"],
  Music: ["Music Room"],
};

function roomFor(subject: string, rng: () => number): string {
  if (roomsBySubject[subject]) {
    return roomsBySubject[subject][Math.floor(rng() * roomsBySubject[subject].length)];
  }
  return "Room " + (Math.floor(rng() * 24) + 1);
}

const teacherBySubject: Record<string, string[]> = {};
for (const t of teachersList) {
  (teacherBySubject[t.subject] ??= []).push(t.name);
}
teacherBySubject["Art & Craft"] = ["Meera Pillai", "Shalini Hebbar"];
teacherBySubject["Music"] = ["Venkatesh Acharya"];
teacherBySubject["Moral Science"] = ["Priya Nair", "Divya Menon"];
teacherBySubject["General Knowledge"] = ["Rahul Menon", "Sneha Rao"];

function teacherFor(subject: string, rng: () => number): string {
  const list = teacherBySubject[subject] ?? ["Staff"];
  return list[Math.floor(rng() * list.length)];
}

const rng = mulberry32(424242);

export const timetablePeriods: TimetablePeriod[] = (() => {
  const out: TimetablePeriod[] = [];
  let idc = 0;
  for (let c = 1; c <= 10; c++) {
    for (const sec of ["A", "B"] as const) {
      const subjects = subjectsForClass(c);
      const extra = ["Physical Education", "Art & Craft", "Music", "Moral Science", "General Knowledge"];
      const pool = [...subjects, ...extra];
      for (let d = 0; d < days.length; d++) {
        for (let p = 0; p < slots.length; p++) {
          const start = (c * 7 + sec.charCodeAt(0) * 3 + d * 5 + p * 2) % pool.length;
          const subject = pool[start];
          const color = subjectColors[subject] ?? "#2563eb";
          out.push({
            id: "tt_" + ++idc,
            day: days[d],
            period: p + 1,
            start: slots[p].start,
            end: slots[p].end,
            subject,
            teacher: subject === "Physical Education" ? "Suresh Bhat" : teacherFor(subject, rng),
            room: roomFor(subject, rng),
            className: c,
            section: sec,
            color,
          });
        }
      }
    }
  }
  return out;
})();

export function timetableForStudent(className: number, section: string): TimetablePeriod[] {
  return timetablePeriods.filter((t) => t.className === className && t.section === section);
}

export function timetableForTeacher(teacherName: string): TimetablePeriod[] {
  return timetablePeriods.filter((t) => t.teacher === teacherName);
}

export function subjectColor(subject: string): string {
  return subjectColors[subject] ?? "#2563eb";
}