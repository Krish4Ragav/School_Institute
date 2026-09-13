import {
  LayoutDashboard,
  Users,
  UserRound,
  CalendarCheck2,
  CalendarRange,
  ClipboardList,
  GraduationCap,
  Wallet,
  Megaphone,
  CalendarHeart,
  MessageSquareText,
  Library,
  Bus,
  FileClock,
  BarChart3,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { Role } from "../../data/types";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles: Role[];
  group: string;
}

export const navGroups = ["Main", "Academics", "Communication", "Resources", "System"];

export const navItems: NavItem[] = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard, roles: ["teacher", "student", "parent"], group: "Main" },
  { label: "Students", path: "/students", icon: Users, roles: ["teacher"], group: "Main" },
  { label: "Teachers", path: "/teachers", icon: UserRound, roles: ["teacher"], group: "Main" },
  { label: "Attendance", path: "/attendance", icon: CalendarCheck2, roles: ["teacher", "student", "parent"], group: "Academics" },
  { label: "Timetable", path: "/timetable", icon: CalendarRange, roles: ["teacher", "student", "parent"], group: "Academics" },
  { label: "Assignments", path: "/assignments", icon: ClipboardList, roles: ["teacher", "student", "parent"], group: "Academics" },
  { label: "Exams & Results", path: "/exams", icon: GraduationCap, roles: ["teacher", "student", "parent"], group: "Academics" },
  { label: "Leave Requests", path: "/leaves", icon: FileClock, roles: ["teacher", "student", "parent"], group: "Academics" },
  { label: "Messages", path: "/messages", icon: MessageSquareText, roles: ["teacher", "student", "parent"], group: "Communication" },
  { label: "Notices", path: "/notices", icon: Megaphone, roles: ["teacher", "student", "parent"], group: "Communication" },
  { label: "Events", path: "/events", icon: CalendarHeart, roles: ["teacher", "student", "parent"], group: "Communication" },
  { label: "Fees", path: "/fees", icon: Wallet, roles: ["student", "parent"], group: "Resources" },
  { label: "Library", path: "/library", icon: Library, roles: ["teacher", "student", "parent"], group: "Resources" },
  { label: "Transport", path: "/transport", icon: Bus, roles: ["teacher", "student", "parent"], group: "Resources" },
  { label: "Reports", path: "/reports", icon: BarChart3, roles: ["teacher", "parent"], group: "System" },
  { label: "Settings", path: "/settings", icon: Settings, roles: ["teacher", "student", "parent"], group: "System" },
];

export const logoutNav: NavItem = {
  label: "Logout",
  path: "/logout",
  icon: LogOut,
  roles: ["teacher", "student", "parent"],
  group: "System",
};

export function groupedNav(role: Role): { group: string; items: NavItem[] }[] {
  return navGroups
    .map((g) => ({ group: g, items: navItems.filter((i) => i.group === g && i.roles.includes(role)) }))
    .filter((g) => g.items.length > 0);
}