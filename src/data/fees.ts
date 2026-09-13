import { FeeRecord } from "./types";
import { mulberry32 } from "./helpers";
import { studentsList } from "./students";

const rng = mulberry32(31337);

function makeFeesFor(studentId: string): FeeRecord[] {
  const idx = studentsList.findIndex((s) => s.id === studentId);
  const r = rng();
  const pendingTuition = idx % 7 === 0;
  const pendingExam = idx % 5 === 2;
  const hasTransport = idx % 3 !== 0;
  const partialTuition = idx % 11 === 5;
  return [
    {
      id: "fee_" + studentId + "_tuition",
      studentId,
      type: "Tuition Fee",
      amount: 12000,
      paid: pendingTuition ? (partialTuition ? 6000 : 0) : 12000,
      dueDate: "2026-09-30",
      status: pendingTuition ? (partialTuition ? "Partial" : "Pending") : "Paid",
      paidOn: pendingTuition ? (partialTuition ? "2026-08-10" : undefined) : "2026-07-05",
    },
    {
      id: "fee_" + studentId + "_exam",
      studentId,
      type: "Examination Fee",
      amount: 1500,
      paid: pendingExam ? 0 : 1500,
      dueDate: "2026-09-20",
      status: pendingExam ? "Pending" : "Paid",
      paidOn: pendingExam ? undefined : "2026-08-25",
    },
    {
      id: "fee_" + studentId + "_library",
      studentId,
      type: "Library Fee",
      amount: 500,
      paid: r < 0.9 ? 500 : 0,
      dueDate: "2026-09-15",
      status: r < 0.9 ? "Paid" : "Pending",
      paidOn: r < 0.9 ? "2026-07-12" : undefined,
    },
    ...(hasTransport
      ? [
          {
            id: "fee_" + studentId + "_transport",
            studentId,
            type: "Transport Fee",
            amount: 3000,
            paid: idx % 9 === 6 ? 1500 : 3000,
            dueDate: "2026-10-05",
            status: (idx % 9 === 6 ? "Partial" : "Paid") as FeeRecord["status"],
            paidOn: idx % 9 === 6 ? "2026-08-15" : "2026-07-20",
          } satisfies FeeRecord,
        ]
      : []),
  ];
}

export const initialFees: FeeRecord[] = studentsList.flatMap((s) => makeFeesFor(s.id));

export function feesForStudent(studentId: string): FeeRecord[] {
  return initialFees.filter((f) => f.studentId === studentId);
}