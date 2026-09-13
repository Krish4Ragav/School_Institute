import { Conversation } from "./types";

export const initialConversations: Conversation[] = [
  {
    id: "convo_teacher_aarav",
    participantIds: ["u_teacher1", "u_student1"],
    participantNames: { u_teacher1: "Priya Nair", u_student1: "Aarav Sharma" },
    messages: [
      { id: "m1", senderId: "u_student1", text: "Good morning ma'am! I wanted to ask about the essay submission.", time: "Today 09:02" },
      { id: "m2", senderId: "u_teacher1", text: "Good morning Aarav. Yes, the essay is due on Friday. How is it coming along?", time: "Today 09:15" },
      { id: "m3", senderId: "u_student1", text: "I've finished the draft. I'll just review it tonight and submit it tomorrow.", time: "Today 09:18" },
      { id: "m4", senderId: "u_teacher1", text: "Perfect. Remember to focus on clear paragraphs and neat handwriting.", time: "Today 09:20" },
      { id: "m5", senderId: "u_student1", text: "Sure ma'am, thank you!", time: "Today 09:22" },
    ],
  },
  {
    id: "convo_teacher_parent",
    participantIds: ["u_teacher1", "u_parent1"],
    participantNames: { u_teacher1: "Priya Nair", u_parent1: "Vikram Sharma" },
    messages: [
      { id: "m6", senderId: "u_parent1", text: "Hello ma'am, I wanted to know how Aarav is doing in English this term.", time: "Yesterday 17:40" },
      { id: "m7", senderId: "u_teacher1", text: "Hi Mr. Sharma, Aarav is doing very well. He scored 18/20 in Unit Test 1. His reading is improving noticeably.", time: "Yesterday 18:05" },
      { id: "m8", senderId: "u_parent1", text: "Great to hear! Is there anything he needs to focus on?", time: "Yesterday 18:10" },
      { id: "m9", senderId: "u_teacher1", text: "Just encourage him to read a little daily and practise spellings. I'll monitor his progress.", time: "Yesterday 18:15" },
    ],
  },
  {
    id: "convo_teacher_ananya",
    participantIds: ["u_teacher1", "S5102"],
    participantNames: { u_teacher1: "Priya Nair", S5102: "Ananya Rao" },
    messages: [
      { id: "m10", senderId: "u_teacher1", text: "Ananya, please bring your English notebook tomorrow for review.", time: "Sep 10" },
      { id: "m11", senderId: "S5102", text: "Okay ma'am, I'll bring it. Thank you!", time: "Sep 10" },
    ],
  },
  {
    id: "convo_aarav_math",
    participantIds: ["u_student1", "T102"],
    participantNames: { T102: "Rahul Menon", u_student1: "Aarav Sharma" },
    messages: [
      { id: "m12", senderId: "u_student1", text: "Sir, for the fractions worksheet, do we need to show the LCM step?", time: "Yesterday 11:30" },
      { id: "m13", senderId: "T102", text: "Yes Aarav, show all working steps including LCM as discussed in class.", time: "Yesterday 11:45" },
      { id: "m14", senderId: "u_student1", text: "Understood sir, thank you.", time: "Yesterday 11:50" },
    ],
  },
  {
    id: "convo_aarav_science",
    participantIds: ["u_student1", "T103"],
    participantNames: { T103: "Sneha Rao", u_student1: "Aarav Sharma" },
    messages: [
      { id: "m15", senderId: "T103", text: "Aarav, your plant diagram submission looked great today. Well done!", time: "Today 13:05" },
      { id: "m16", senderId: "u_student1", text: "Thank you ma'am! I enjoyed the topic.", time: "Today 13:20" },
    ],
  },
  {
    id: "convo_parent_science",
    participantIds: ["u_parent1", "T103"],
    participantNames: { T103: "Sneha Rao", u_parent1: "Vikram Sharma" },
    messages: [
      { id: "m17", senderId: "u_parent1", text: "Hello ma'am, we wanted to encourage Aarav in the Science Exhibition. Is he registered?", time: "Sep 11" },
      { id: "m18", senderId: "T103", text: "Hello Mr. Sharma, yes! Aarav's 'Water Purification' model has been shortlisted.", time: "Sep 11" },
      { id: "m19", senderId: "u_parent1", text: "Wonderful news, thank you ma'am!", time: "Sep 11" },
    ],
  },
  {
    id: "convo_parent_math",
    participantIds: ["u_parent1", "T102"],
    participantNames: { T102: "Rahul Menon", u_parent1: "Vikram Sharma" },
    messages: [
      { id: "m20", senderId: "T102", text: "Thank you for attending the PTM. Aarav's multiplication concepts are strong.", time: "Aug 30" },
      { id: "m21", senderId: "u_parent1", text: "Thank you sir, we will keep up the practice at home.", time: "Aug 30" },
    ],
  },
  {
    id: "convo_aarav_pe",
    participantIds: ["u_student1", "T110"],
    participantNames: { T110: "Suresh Bhat", u_student1: "Aarav Sharma" },
    messages: [
      { id: "m22", senderId: "T110", text: "Aarav, remember to bring proper sports shoes for the 100m practice tomorrow.", time: "Yesterday 15:10" },
      { id: "m23", senderId: "u_student1", text: "Yes sir, I'll bring them. Looking forward to the race!", time: "Yesterday 15:30" },
    ],
  },
];

export function userDisplayId(id: string): string {
  return id;
}