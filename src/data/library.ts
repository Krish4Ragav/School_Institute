import { Book } from "./types";

export const libraryBooks: Book[] = [
  { id: "BI001", title: "Panchatantra Tales", author: "Vishnu Sharma", category: "Fiction", isbn: "978-81-250-1234-5", available: false, issuedTo: "S5101", issuedDate: "2026-08-20", dueDate: "2026-09-17", coverColor: "#2563eb" },
  { id: "BI002", title: "Wings of Fire", author: "A.P.J. Abdul Kalam", category: "Biography", isbn: "978-81-7223-146-0", available: true, coverColor: "#e11d48" },
  { id: "BI003", title: "The Magic of Maths", author: "Rahul Menon", category: "Mathematics", isbn: "978-81-8453-221-0", available: true, coverColor: "#7c3aed" },
  { id: "BI004", title: "Discovery of India", author: "Jawaharlal Nehru", category: "History", isbn: "978-01-9432-567-8", available: true, coverColor: "#d97706" },
  { id: "BI005", title: "Science Around You", author: "Sneha Rao", category: "Science", isbn: "978-81-7371-889-3", available: false, issuedTo: "S5102", issuedDate: "2026-09-01", dueDate: "2026-09-29", coverColor: "#059669" },
  { id: "BI006", title: "Computer Basics for Kids", author: "Meghana Kulkarni", category: "Computers", isbn: "978-93-8096-154-7", available: true, coverColor: "#0891b2" },
  { id: "BI007", title: "English Grammar in Use", author: "Raymond Murphy", category: "English", isbn: "978-11-0753-697-1", available: true, coverColor: "#db2777" },
  { id: "BI008", title: "The Adventures of Tom Sawyer", author: "Mark Twain", category: "Fiction", isbn: "978-01-4240-460-4", available: false, issuedTo: "S5101", issuedDate: "2026-08-25", dueDate: "2026-09-22", coverColor: "#ea580c" },
  { id: "BI009", title: "Quantum Physics for Curious Minds", author: "Nikil Sharma", category: "Science", isbn: "978-93-8442-555-6", available: true, coverColor: "#0e7490" },
  { id: "BI010", title: "The Ramayana", author: "C. Rajagopalachari", category: "Fiction", isbn: "978-81-87543-02-3", available: true, coverColor: "#9333ea" },
  { id: "BI011", title: "Short Stories of Ruskin Bond", author: "Ruskin Bond", category: "Fiction", isbn: "978-01-4333-567-5", available: true, coverColor: "#2563eb" },
  { id: "BI012", title: "The Wonder That Was India", author: "A.L. Basham", category: "History", isbn: "978-08-1220-548-6", available: true, coverColor: "#bf4d3c" },
  { id: "BI013", title: "Everything Physics", author: "Ashok Kumar", category: "Science", isbn: "978-93-5217-890-2", available: false, issuedTo: "S9203", issuedDate: "2026-09-05", dueDate: "2026-10-03", coverColor: "#059669" },
  { id: "BI014", title: "Python for School Projects", author: "Mohammed Faizal", category: "Computers", isbn: "978-81-9415-200-3", available: true, coverColor: "#0891b2" },
  { id: "BI015", title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", isbn: "978-00-6271-487-1", available: true, coverColor: "#c026d3" },
  { id: "BI016", title: "Our Constitution", author: "Amrita Deshmukh", category: "General Knowledge", isbn: "978-81-8877-641-4", available: true, coverColor: "#d97706" },
  { id: "BI017", title: "Multiplication Mastery", author: "Kavya Hegde", category: "Mathematics", isbn: "978-93-8151-007-0", available: false, issuedTo: "S2201", issuedDate: "2026-09-10", dueDate: "2026-10-08", coverColor: "#7c3aed" },
  { id: "BI018", title: "Stories from Panchatantra (Illustrated)", author: "Vishnu Sharma", category: "Fiction", isbn: "978-81-2093-817-9", available: true, coverColor: "#ea580c" },
];

export function booksIssuedTo(studentId: string): Book[] {
  return libraryBooks.filter((b) => b.issuedTo === studentId);
}