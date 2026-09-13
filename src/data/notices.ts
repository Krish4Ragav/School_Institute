import { Notice } from "./types";

export const initialNotices: Notice[] = [
  {
    id: "not_1",
    title: "Parent-Teacher Meeting — Class V and VI",
    category: "Event",
    date: "2026-09-20",
    author: "Principal",
    priority: "High",
    pinned: true,
    content:
      "A Parent-Teacher Meeting for Classes V and VI will be held on Sunday, 20 September, in the school auditorium. Parents are requested to collect the PTM pass from the class teacher. Slot timings are between 9:00 AM and 1:00 PM. Kindly bring the previous reports and any query forms filled in advance.",
  },
  {
    id: "not_2",
    title: "Mid-Term Examination Timetable Released",
    category: "Examination",
    date: "2026-09-12",
    author: "Examination Cell",
    priority: "High",
    content:
      "The mid-term examination timetable for all classes is now available on the notices board and in the student portal. Examinations begin from 25 September. Students must be in uniform and arrive with their hall ticket. No electronic devices are permitted in the exam hall.",
  },
  {
    id: "not_3",
    title: "Holiday — Makar Sankranti",
    category: "Holiday",
    date: "2026-09-10",
    author: "Administration",
    priority: "Medium",
    content:
      "The school will remain closed on Thursday, 17 September, on account of Makar Sankranti. Regular classes resume on Friday, 18 September. Transport services will resume as per the usual schedule.",
  },
  {
    id: "not_4",
    title: "Science Exhibition — Project Submissions",
    category: "Academic",
    date: "2026-09-11",
    author: "Science Department",
    priority: "Medium",
    content:
      "The Annual Science Exhibition will be held on 25 September. Students from Classes I–X are encouraged to register their projects with the science teachers. The last date to submit the project proposal is 18 September. Selected projects will be displayed in the main hall.",
  },
  {
    id: "not_5",
    title: "Annual Sports Day — Practice Schedule",
    category: "Event",
    date: "2026-09-09",
    author: "Sports Department",
    priority: "Low",
    content:
      "Practice for the Annual Sports Day begins from 15 September. Students who have registered for track and field events should report to the playground during the games period. The final event will be held on 2 October.",
  },
  {
    id: "not_6",
    title: "Fee Reminder — Term 2",
    category: "General",
    date: "2026-09-07",
    author: "Accounts Office",
    priority: "High",
    content:
      "The last date for remitting Term 2 fees (Tuition, Examination and Transport) is 30 September. Payments can be made through the student portal, the fees counter, or net banking. Late payment attracts a fine of ₹100 per week.",
  },
  {
    id: "not_7",
    title: "Emergency — Weather Advisory",
    category: "Emergency",
    date: "2026-09-13",
    author: "Principal",
    priority: "High",
    content:
      "Heavy rains are forecast in Bengaluru over the next 48 hours. Parents are advised to send raincoats and umbrellas. In case of heavy downpour during school hours, the school will keep students indoors and communicate dismissal updates via SMS and the portal.",
  },
  {
    id: "not_8",
    title: "Cultural Fest — Audition Notice",
    category: "Event",
    date: "2026-09-06",
    author: "Cultural Committee",
    priority: "Low",
    content:
      "Auditions for the Annual Cultural Fest will be conducted on 28 September for dance, music and drama. Interested students must register with the cultural committee by 22 September.",
  },
];