import { User, AppNotification } from "./types";
import { avatarPalette } from "./helpers";

export const users: User[] = [
  {
    id: "u_teacher1",
    name: "Priya Nair",
    email: "teacher@school.com",
    password: "teacher123",
    role: "teacher",
    avatarColor: avatarPalette[0],
    teacherId: "T101",
    phone: "98765 43210",
  },
  {
    id: "u_student1",
    name: "Aarav Sharma",
    email: "student@school.com",
    password: "student123",
    role: "student",
    avatarColor: avatarPalette[3],
    studentId: "S5101",
    phone: "91234 56789",
  },
  {
    id: "u_parent1",
    name: "Vikram Sharma",
    email: "parent@school.com",
    password: "parent123",
    role: "parent",
    avatarColor: avatarPalette[4],
    studentId: "S5101",
    phone: "98712 34567",
  },
];

export const initialNotifications: AppNotification[] = [
  { id: "n1", title: "Assignment Due", text: "Math worksheet due tomorrow", time: "2026-09-11", read: false, type: "assignment" },
  { id: "n2", title: "PTM Announced", text: "Parent-Teacher meeting on 20 Sep", time: "2026-09-10", read: false, type: "meeting" },
  { id: "n3", title: "Exam Schedule", text: "Mid-term exams from 25 Sep", time: "2026-09-09", read: false, type: "exam" },
  { id: "n4", title: "Attendance Marked", text: "Attendance recorded for Class V-A", time: "2026-09-12", read: true, type: "attendance" },
  { id: "n5", title: "New School Notice", text: "Holiday on 17 Sep — Makar Sankranti", time: "2026-09-08", read: true, type: "notice" },
  { id: "n6", title: "Fee Reminder", text: "Term 2 fees pending — due 30 Sep", time: "2026-09-07", read: true, type: "fee" },
  { id: "n7", title: "New Message", text: "Mrs. Sneha Rao sent you a message", time: "2026-09-12", read: false, type: "message" },
  { id: "n8", title: "Sports Day", text: "Annual Sports Day — 2 Oct", time: "2026-09-06", read: true, type: "event" },
  { id: "n9", title: "Results Published", text: "Unit Test 1 results are out", time: "2026-09-05", read: true, type: "result" },
  { id: "n10", title: "Science Exhibition", text: "Submit project ideas by 18 Sep", time: "2026-09-11", read: false, type: "event" },
];