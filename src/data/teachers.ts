import { Teacher } from "./types";
import { avatarPalette } from "./helpers";

export const teachersList: Teacher[] = [
  { id: "t1", empId: "T101", name: "Priya Nair", subject: "English", classes: ["V-A", "V-B", "VI-A"], email: "priya.nair@school.edu.in", phone: "98765 43210", qualification: "M.A. English, B.Ed", experience: 9, joinYear: 2015, status: "Available", avatarColor: avatarPalette[0] },
  { id: "t2", empId: "T102", name: "Rahul Menon", subject: "Mathematics", classes: ["V-A", "V-B", "IX-A", "IX-B"], email: "rahul.menon@school.edu.in", phone: "98765 43211", qualification: "M.Sc. Mathematics, B.Ed", experience: 12, joinYear: 2012, status: "Available", avatarColor: avatarPalette[1] },
  { id: "t3", empId: "T103", name: "Sneha Rao", subject: "Science", classes: ["V-A", "V-B", "VII-A"], email: "sneha.rao@school.edu.in", phone: "98765 43212", qualification: "M.Sc. Physics, B.Ed", experience: 7, joinYear: 2017, status: "Available", avatarColor: avatarPalette[2] },
  { id: "t4", empId: "T104", name: "Arjun Kumar", subject: "Social Studies", classes: ["V-A", "VIII-A", "VIII-B"], email: "arjun.kumar@school.edu.in", phone: "98765 43213", qualification: "M.A. History, B.Ed", experience: 15, joinYear: 2008, status: "On Leave", avatarColor: avatarPalette[3] },
  { id: "t5", empId: "T105", name: "Anita Desai", subject: "Hindi", classes: ["III-A", "III-B", "V-A"], email: "anita.desai@school.edu.in", phone: "98765 43214", qualification: "M.A. Hindi, B.Ed", experience: 10, joinYear: 2014, status: "Available", avatarColor: avatarPalette[4] },
  { id: "t6", empId: "T106", name: "Mohammed Faizal", subject: "Computer Studies", classes: ["IV-A", "V-A", "IX-A", "IX-B"], email: "faizal.m@school.edu.in", phone: "98765 43215", qualification: "M.C.A.", experience: 6, joinYear: 2018, status: "Available", avatarColor: avatarPalette[5] },
  { id: "t7", empId: "T107", name: "Kavya Hegde", subject: "Mathematics", classes: ["I-A", "I-B", "II-A", "II-B"], email: "kavya.hegde@school.edu.in", phone: "98765 43216", qualification: "B.Sc. Mathematics, D.Ed", experience: 8, joinYear: 2016, status: "Available", avatarColor: avatarPalette[6] },
  { id: "t8", empId: "T108", name: "Ramesh Iyer", subject: "Science", classes: ["IX-B", "X-A", "X-B"], email: "ramesh.iyer@school.edu.in", phone: "98765 43217", qualification: "M.Sc. Chemistry, B.Ed", experience: 18, joinYear: 2004, status: "Available", avatarColor: avatarPalette[7] },
  { id: "t9", empId: "T109", name: "Divya Menon", subject: "English", classes: ["VII-A", "VII-B", "IX-A"], email: "divya.menon@school.edu.in", phone: "98765 43218", qualification: "M.A. English, B.Ed", experience: 5, joinYear: 2019, status: "Available", avatarColor: avatarPalette[8] },
  { id: "t10", empId: "T110", name: "Suresh Bhat", subject: "Physical Education", classes: ["All Classes"], email: "suresh.bhat@school.edu.in", phone: "98765 43219", qualification: "B.P.Ed, M.P.Ed", experience: 16, joinYear: 2006, status: "Available", avatarColor: avatarPalette[9] },
  { id: "t11", empId: "T111", name: "Lakshmi Pillai", subject: "Kannada", classes: ["VI-A", "VI-B", "VIII-A"], email: "lakshmi.pillai@school.edu.in", phone: "98765 43220", qualification: "M.A. Kannada, B.Ed", experience: 11, joinYear: 2013, status: "Available", avatarColor: avatarPalette[10] },
  { id: "t12", empId: "T112", name: "Nikhil Patil", subject: "Social Studies", classes: ["V-B", "VI-B", "X-A"], email: "nikhil.patil@school.edu.in", phone: "98765 43221", qualification: "M.A. Geography, B.Ed", experience: 9, joinYear: 2015, status: "On Leave", avatarColor: avatarPalette[11] },
  { id: "t13", empId: "T113", name: "Meghana Kulkarni", subject: "Computer Studies", classes: ["III-A", "III-B", "V-B"], email: "meghana.k@school.edu.in", phone: "98765 43222", qualification: "M.Sc. IT, B.Ed", experience: 4, joinYear: 2020, status: "Available", avatarColor: avatarPalette[2] },
  { id: "t14", empId: "T114", name: "Vasanth Kumar", subject: "Mathematics", classes: ["IX-A", "IX-B", "X-A", "X-B"], email: "vasanth.k@school.edu.in", phone: "98765 43223", qualification: "M.Sc. Mathematics, B.Ed", experience: 13, joinYear: 2011, status: "Available", avatarColor: avatarPalette[5] },
];

export function teacherById(id: string): Teacher | undefined {
  return teachersList.find((t) => t.id === id) ?? teachersList.find((t) => t.empId === id);
}

export function teacherByName(name: string): Teacher[] {
  return teachersList.filter((t) => t.name.toLowerCase().includes(name.toLowerCase()));
}