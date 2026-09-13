import { SchoolEvent } from "./types";
import { addDaysFromToday } from "./helpers";

export const schoolEvents: SchoolEvent[] = [
  {
    id: "ev1",
    title: "Annual Sports Day",
    date: addDaysFromToday(19),
    time: "8:00 AM – 3:00 PM",
    location: "School Main Ground",
    description:
      "Our flagship athletics carnival featuring track events, field events and inter-house relays. Parade, student march-past and prize distribution will follow the events. Refreshments provided for all participants.",
    category: "Sports",
    color: "#2563eb",
  },
  {
    id: "ev2",
    title: "Science Exhibition",
    date: addDaysFromToday(12),
    time: "10:00 AM – 2:00 PM",
    location: "School Main Hall",
    description:
      "Students showcase working models, experiments and innovations across physics, chemistry and biology. Parents and guests can interact with young scientists and vote for the People's Choice award.",
    category: "Academic",
    color: "#7c3aed",
  },
  {
    id: "ev3",
    title: "Parent-Teacher Meeting",
    date: addDaysFromToday(7),
    time: "9:00 AM – 1:00 PM",
    location: "School Auditorium & Classrooms",
    description:
      "Meet your child's teachers to discuss progress, strengths and areas of improvement for the current term. Appointments are allocated in 15-minute slots through the PTM pass.",
    category: "Meeting",
    color: "#059669",
  },
  {
    id: "ev4",
    title: "Cultural Fest",
    date: addDaysFromToday(62),
    time: "4:00 PM onwards",
    location: "School Open-Air Stage",
    description:
      "An evening of dance, drama and music performed by students from Classes I–X. The fest concludes with the annual cultural trophy distribution and prize ceremony.",
    category: "Cultural",
    color: "#d97706",
  },
  {
    id: "ev5",
    title: "Independence Day Celebration",
    date: addDaysFromToday(-29),
    time: "8:30 AM – 11:00 AM",
    location: "School Ground",
    description:
      "Flag hoisting ceremony, patriotic performances and a special address by our chief guest. Students of Classes VI–X participated in the march-past.",
    category: "National",
    color: "#e11d48",
  },
  {
    id: "ev6",
    title: "School Foundation Day",
    date: addDaysFromToday(120),
    time: "9:30 AM – 1:00 PM",
    location: "School Auditorium",
    description:
      "Celebrating another year of learning at School Institute. Alumni talks, cultural showcases and the annual report will be part of the morning's programme.",
    category: "Institutional",
    color: "#0891b2",
  },
];

export function eventsOnDate(date: string): SchoolEvent[] {
  return schoolEvents.filter((e) => e.date === date);
}