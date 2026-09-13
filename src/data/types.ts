export type Role = "teacher" | "student" | "parent";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  avatarColor: string;
  teacherId?: string;
  studentId?: string;
  phone: string;
}

export interface Student {
  id: string;
  name: string;
  gender: "M" | "F";
  className: number;
  section: "A" | "B";
  rollNo: number;
  dob: string;
  bloodGroup: string;
  address: string;
  avatarColor: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  fatherOccupation: string;
  admissionYear: number;
  prevAcademicPct: number;
  curAcademicPct: number;
  status: "Active" | "Inactive";
  subjects: string[];
  marks: SubjectMark[];
  issuedBooks: string[];
}

export interface SubjectMark {
  subject: string;
  exam: string;
  scored: number;
  max: number;
}

export interface Teacher {
  id: string;
  empId: string;
  name: string;
  subject: string;
  classes: string[];
  email: string;
  phone: string;
  qualification: string;
  experience: number;
  joinYear: number;
  status: "Available" | "On Leave";
  avatarColor: string;
}

export interface TimetablePeriod {
  id: string;
  day: string;
  period: number;
  start: string;
  end: string;
  subject: string;
  teacher: string;
  room: string;
  className: number;
  section: string;
  color: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  className: number;
  section: string;
  teacher: string;
  assignedDate: string;
  dueDate: string;
  description: string;
  status: "Open" | "Closed";
  submissions: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  studentId: string;
  status: "Submitted" | "Pending" | "Graded";
  submittedAt?: string;
  score?: number;
  maxScore: number;
}

export interface Exam {
  id: string;
  name: string;
  subject: string;
  className: number | null;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
}

export interface MarkEntry {
  id: string;
  studentId: string;
  examName: string;
  subject: string;
  scored: number;
  max: number;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  type: string;
  amount: number;
  paid: number;
  dueDate: string;
  status: "Paid" | "Partial" | "Pending";
  paidOn?: string;
}

export interface Notice {
  id: string;
  title: string;
  category: "General" | "Academic" | "Examination" | "Holiday" | "Event" | "Emergency";
  date: string;
  author: string;
  priority: "High" | "Medium" | "Low";
  content: string;
  pinned?: boolean;
}

export interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  color: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  time: string;
  read?: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  available: boolean;
  issuedTo?: string;
  issuedDate?: string;
  dueDate?: string;
  coverColor: string;
}

export interface TransportRoute {
  id: string;
  busNo: string;
  route: string;
  driver: string;
  conductor: string;
  stops: string[];
  startTime: string;
  endTime: string;
  students: number;
  status: "On Time" | "Running Late" | "Delayed";
  color: string;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  className: number;
  section: string;
  from: string;
  to: string;
  reason: string;
  type: string;
  status: "Pending" | "Approved" | "Rejected";
  requestedBy: string;
  date: string;
}

export interface AppNotification {
  id: string;
  title: string;
  text: string;
  time: string;
  read: boolean;
  type: "assignment" | "meeting" | "exam" | "attendance" | "notice" | "fee" | "message" | "event" | "result";
}

export interface AttendanceDay {
  date: string;
  className: number;
  section: string;
  records: Record<string, "Present" | "Absent" | "Late">;
}

export interface ResultEntry {
  studentId: string;
  examName: string;
  subject: string;
  scored: number;
  max: number;
  grade: string;
}

export interface MessageDraft {
  conversationId: string;
  text: string;
}

export type NavItem = {
  label: string;
  path: string;
  icon: string;
  roles: Role[];
  group?: string;
};