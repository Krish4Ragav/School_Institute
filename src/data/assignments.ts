import { Assignment } from "./types";
import { mulberry32, addDaysFromToday, addDays } from "./helpers";
import { studentsList } from "./students";

const rng = mulberry32(991);

const specs = [
  { title: "Essay on My School", subject: "English", className: 5, section: "A", due: 2, teacher: "Priya Nair", desc: "Write a 300-word essay describing your school, its motto and the subjects you enjoy most. Focus on neat handwriting and clear paragraphs." },
  { title: "Fractions Practice Sheet", subject: "Mathematics", className: 5, section: "A", due: 5, teacher: "Rahul Menon", desc: "Solve problems Q1–Q15 from the provided fractions worksheet. Show all working steps in your notebook." },
  { title: "Plant Life Diagram", subject: "Science", className: 5, section: "A", due: 8, teacher: "Sneha Rao", desc: "Draw and label the parts of a flowering plant on an A4 sheet. Add a short note on each part's function." },
  { title: "Map Work: Rivers of India", subject: "Social Studies", className: 5, section: "A", due: 6, teacher: "Arjun Kumar", desc: "On an outline map of India, mark five major rivers and their states. Submit the map in the geography folder." },
  { title: "Hindi Comprehension", subject: "Hindi", className: 5, section: "A", due: 4, teacher: "Anita Desai", desc: "Read the comprehension passage 'बरसात का दिन' and answer the questions that follow in your Hindi notebook." },
  { title: "MS Word Basics", subject: "Computer Studies", className: 5, section: "A", due: 9, teacher: "Mohammed Faizal", desc: "Create a document with a heading, a paragraph and a table of 3 rows in MS Word. Save it as 'Basics.docx'." },
  { title: "Poem Recitation", subject: "English", className: 4, section: "B", due: 3, teacher: "Priya Nair", desc: "Memorise and practise the poem 'The Little Bird' for recitation during the English period." },
  { title: "Algebra Basics", subject: "Mathematics", className: 9, section: "A", due: 7, teacher: "Vasanth Kumar", desc: "Solve linear equations from the assignment sheet. Practice at least 10 problems from each section." },
  { title: "Chemical Reactions", subject: "Science", className: 10, section: "B", due: 10, teacher: "Ramesh Iyer", desc: "Write balanced equations for the reactions given in the worksheet and explain the observable changes." },
  { title: "History Timeline", subject: "Social Studies", className: 8, section: "A", due: 6, teacher: "Arjun Kumar", desc: "Prepare a timeline of the Indian freedom movement from 1857 to 1947 with at least ten events." },
  { title: "Multiplication Tables", subject: "Mathematics", className: 2, section: "A", due: 5, teacher: "Kavya Hegde", desc: "Practise and write multiplication tables from 2 to 10 twice in the notebook." },
  { title: "Reading Comprehension", subject: "English", className: 7, section: "B", due: 4, teacher: "Divya Menon", desc: "Answer the unseen passage questions and write a short summary in your own words." },
];

function makeSubmissions(className: number, section: string): Assignment["submissions"] {
  const cls = studentsList.filter((s) => s.className === className && s.section === section);
  return cls.map((s) => {
    const r = rng();
    if (r < 0.62) {
      return {
        studentId: s.id,
        status: "Submitted" as const,
        submittedAt: addDaysFromToday(-1 - Math.floor(rng() * 3)),
        maxScore: 20,
      };
    }
    if (r < 0.7) {
      return {
        studentId: s.id,
        status: "Graded" as const,
        submittedAt: addDaysFromToday(-2 - Math.floor(rng() * 3)),
        score: 12 + Math.floor(rng() * 9),
        maxScore: 20,
      };
    }
    return { studentId: s.id, status: "Pending" as const, maxScore: 20 };
  });
}

export const initialAssignments: Assignment[] = specs.map((sp, i) => ({
  id: "asg_" + (i + 1),
  title: sp.title,
  subject: sp.subject,
  className: sp.className,
  section: sp.section,
  teacher: sp.teacher,
  assignedDate: addDays(addDaysFromToday(sp.due), -4),
  dueDate: addDaysFromToday(sp.due),
  description: sp.desc,
  status: "Open",
  submissions: makeSubmissions(sp.className, sp.section),
}));

const essay = initialAssignments[0];
const aaravSub = essay?.submissions.find((s) => s.studentId === "S5101");
if (aaravSub) aaravSub.status = "Pending";
const scienceSub = initialAssignments[2]?.submissions.find((s) => s.studentId === "S5101");
if (scienceSub) scienceSub.status = "Submitted";