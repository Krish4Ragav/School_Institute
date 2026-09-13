export function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pick = <T>(rng: () => number, arr: T[]): T =>
  arr[Math.floor(rng() * arr.length)];

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return formatDate(new Date());
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function addDaysFromToday(days: number): string {
  return addDays(todayISO(), days);
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00").getTime();
  const db = new Date(b + "T00:00:00").getTime();
  return Math.round((db - da) / 86400000);
}

export function prettyDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function prettyDateLong(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function weekday(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long",
  });
}

export function monthShort(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    month: "short",
  });
}

export function dayNum(iso: string) {
  return new Date(iso + "T00:00:00").getDate();
}

export function todaysShort(): string {
  return new Date().toLocaleDateString("en-IN", { weekday: "short" });
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function gradeFor(pct: number): { grade: string; remark: string } {
  if (pct >= 90) return { grade: "A+", remark: "Outstanding" };
  if (pct >= 80) return { grade: "A", remark: "Excellent" };
  if (pct >= 70) return { grade: "B+", remark: "Very Good" };
  if (pct >= 60) return { grade: "B", remark: "Good" };
  if (pct >= 50) return { grade: "C", remark: "Fair" };
  if (pct >= 40) return { grade: "D", remark: "Needs Improvement" };
  return { grade: "E", remark: "Needs Attention" };
}

export const avatarPalette = [
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#059669",
  "#d97706",
  "#0891b2",
  "#dc2626",
  "#4f46e5",
  "#16a34a",
  "#ea580c",
  "#0e7490",
  "#9333ea",
];

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

export function todayGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function relativeTime(iso: string): string {
  const days = daysBetween(iso, todayISO());
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 1 && days < 7) return `In ${days} days`;
  if (days < -1 && days > -7) return `${Math.abs(days)} days ago`;
  return prettyDate(iso);
}

export const inr = (n: number) =>
  "₹" + n.toLocaleString("en-IN");

export function pctOf(a: number, b: number): number {
  if (!b) return 0;
  return Math.round((a / b) * 1000) / 10;
}

export function classLabel(c: number, s: string) {
  const ord = (n: number) =>
    n === 1 ? "I" : n === 2 ? "II" : n === 3 ? "III" : n === 4 ? "IV" : n === 5 ? "V" : n === 6 ? "VI" : n === 7 ? "VII" : n === 8 ? "VIII" : n === 9 ? "IX" : "X";
  return `${ord(c)}-${s}`;
}

const romanMap: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10 };

export function parseClassLabel(label: string): { className: number; section: "A" | "B" } {
  const [rom, sec] = label.split("-");
  return { className: romanMap[rom] ?? 1, section: (sec === "B" ? "B" : "A") };
}