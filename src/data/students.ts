import { Student, SubjectMark } from "./types";
import { mulberry32, pick, avatarPalette, addDaysFromToday } from "./helpers";

const boysFirst = ["Aarav", "Vihaan", "Arjun", "Rohan", "Aditya", "Kabir", "Ishaan", "Ayaan", "Siddharth", "Karthik", "Rahul", "Nikhil", "Varun", "Pranav", "Devansh", "Anirudh", "Shreyas", "Manav", "Tejas", "Kunal"];
const girlsFirst = ["Ananya", "Diya", "Kavya", "Aanya", "Saanvi", "Anika", "Meera", "Riya", "Navya", "Tanvi", "Divya", "Ishita", "Gauri", "Shreya", "Nandini", "Lakshmi", "Janhavi", "Aadya", "Myra", "Khushi"];
const surnames = ["Sharma", "Rao", "Nair", "Menon", "Shetty", "Kumar", "Iyer", "Singh", "Reddy", "Gupta", "Pillai", "Hegde", "Bhat", "Joshi", "Desai", "Patil", "Kulkarni", "Das", "Kapoor", "Verma"];

const addresses = [
  "Neeladri Road, Electronic City, Bengaluru",
  "Kudlu Gate, Electronic City Phase 1",
  "Konappana Agrahara, Electronic City",
  "Basapura Road, Electronic City",
  "Hosa Road, Electronic City",
  "Chandapura, Anekal Taluk, Bengaluru",
  "Bommasandra Industrial Area, Bengaluru",
  "Huskur Road, Electronic City",
  "Veer Sandra, Electronic City",
  "Karikere, Electronic City Phase 2",
];

const bloodGroups = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-"];
const occupations = ["Software Engineer", "Bank Manager", "Business Owner", "Doctor", "Teacher", "Civil Engineer", "Architect", "Lawyer", "Accountant", "Pharmacist"];

export function subjectsForClass(c: number): string[] {
  if (c <= 5) {
    return ["English", "Mathematics", "Science", "Social Studies", "Hindi", "Computer Studies"];
  }
  return ["English", "Mathematics", "Science", "Social Studies", "Hindi", "Computer Studies"];
}

const rng = mulberry32(20260913);

const combos: { c: number; s: "A" | "B" }[] = [];
for (let c = 1; c <= 10; c++) {
  combos.push({ c, s: "A" }, { c, s: "B" });
}

let roll = 0;
const students: Student[] = [];

for (const { c, s } of combos) {
  const base = c * 10 + (s === "A" ? 1 : 2);
  for (let i = 0; i < 4; i++) {
    roll += 1;
    const gender = rng() > 0.5 ? "M" : "F";
    const first = gender === "M" ? pick(rng, boysFirst) : pick(rng, girlsFirst);
    let surname = pick(rng, surnames);
    if (c === 5 && s === "A" && i === 0) {
      first === "Aarav" ? null : null;
      if (first !== "Aarav") surname = "Sharma"; 
    }
    const id = "S" + String(base * 100 + (i + 1)).padStart(3, "0");
    const name = first + " " + surname;
    const subjects = subjectsForClass(c);
    const marks: SubjectMark[] = [];
    for (const subject of subjects) {
      const ability = 0.55 + rng() * 0.45;
      const scored = Math.round((20 * ability * (0.75 + rng() * 0.25) * 10)) / 10;
      marks.push({
        subject,
        exam: "Unit Test 1",
        scored: Math.min(20, scored),
        max: 20,
      });
    }
    const curAcademicPct = Math.round(50 + rng() * 49);
    const prevAcademicPct = curAcademicPct + Math.round(rng() * 8 - 4);
    students.push({
      id,
      name,
      gender,
      className: c,
      section: s,
      rollNo: i + 1,
      dob: addDaysFromToday(-3650 - rng() * 0),
      bloodGroup: pick(rng, bloodGroups),
      address: pick(rng, addresses),
      avatarColor: pick(rng, avatarPalette),
      parentName: (gender === "M" ? "Rajan " : "Uma ") + surname,
      parentPhone: "9" + String(Math.floor(100000000 + rng() * 899999999)),
      parentEmail: `${first.toLowerCase()}.${surname.toLowerCase()}@gmail.com`,
      fatherOccupation: pick(rng, occupations),
      admissionYear: 2021 + Math.floor(rng() * 4),
      prevAcademicPct,
      curAcademicPct,
      status: rng() > 0.95 ? "Inactive" : "Active",
      subjects,
      marks,
      issuedBooks: [],
    });
  }
}

const aarav = students.find((s) => s.name === "Aarav Sharma");
if (aarav) {
  aarav.className = 5;
  aarav.section = "A";
  aarav.rollNo = 1;
  aarav.parentName = "Vikram Sharma";
  aarav.parentEmail = "vikram.sharma@gmail.com";
  aarav.dob = "2014-03-14";
  aarav.address = "Neeladri Road, Electronic City, Bengaluru";
  aarav.admissionYear = 2019;
  aarav.prevAcademicPct = 88;
  aarav.curAcademicPct = 91;
  aarav.issuedBooks = ["BI001", "BI008"];
  aarav.marks = [
    { subject: "English", exam: "Unit Test 1", scored: 18, max: 20 },
    { subject: "Mathematics", exam: "Unit Test 1", scored: 17, max: 20 },
    { subject: "Science", exam: "Unit Test 1", scored: 19, max: 20 },
    { subject: "Social Studies", exam: "Unit Test 1", scored: 16, max: 20 },
    { subject: "Hindi", exam: "Unit Test 1", scored: 15, max: 20 },
    { subject: "Computer Studies", exam: "Unit Test 1", scored: 20, max: 20 },
  ];
}

students.sort((a, b) => a.id.localeCompare(b.id));

export const studentsList = students;

export function studentById(id: string): Student | undefined {
  return studentsList.find((s) => s.id === id);
}

export function classRoll(id: string): string {
  return id;
}