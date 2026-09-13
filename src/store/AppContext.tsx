import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { uid, inr } from "../data/helpers";
import {
  User,
  AttendanceDay,
  Assignment,
  FeeRecord,
  Notice,
  Conversation,
  LeaveRequest,
  AppNotification,
} from "../data/types";
import { users, initialNotifications } from "../data/users";
import { initialAttendanceDays } from "../data/attendance";
import { initialAssignments } from "../data/assignments";
import { initialFees } from "../data/fees";
import { initialNotices } from "../data/notices";
import { initialConversations } from "../data/messages";
import { initialLeaves } from "../data/leaves";

export interface MarkEntryRow {
  id: string;
  studentId: string;
  examName: string;
  subject: string;
  scored: number;
  max: number;
}

interface Settings {
  name: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  language: string;
  notifAssignment: boolean;
  notifExam: boolean;
  notifNotice: boolean;
  notifFees: boolean;
  notifMessages: boolean;
  compact: boolean;
}

interface AppState {
  userId: string | null;
  remember: boolean;
  attendanceDays: AttendanceDay[];
  assignments: Assignment[];
  fees: FeeRecord[];
  notices: Notice[];
  conversations: Conversation[];
  leaves: LeaveRequest[];
  notifications: AppNotification[];
  markEntries: MarkEntryRow[];
  settings: Settings;
}

const defaultSettings: Settings = {
  name: "",
  email: "",
  phone: "",
  dob: "",
  address: "",
  language: "English (India)",
  notifAssignment: true,
  notifExam: true,
  notifNotice: true,
  notifFees: true,
  notifMessages: true,
  compact: false,
};

const STORAGE_KEY = "school-institute-v1";

function emptyState(): AppState {
  return {
    userId: null,
    remember: false,
    attendanceDays: initialAttendanceDays,
    assignments: initialAssignments,
    fees: initialFees,
    notices: initialNotices,
    conversations: initialConversations,
    leaves: initialLeaves,
    notifications: initialNotifications,
    markEntries: [],
    settings: defaultSettings,
  };
}

type Action =
  | { type: "LOGIN"; userId: string; remember: boolean }
  | { type: "LOGOUT" }
  | { type: "SAVE_ATTENDANCE"; day: AttendanceDay }
  | { type: "CREATE_ASSIGNMENT"; assignment: Assignment }
  | { type: "SUBSCRIBE_ASSIGNMENT"; assignmentId: string; studentId: string }
  | { type: "GRADE_SUBMISSION"; assignmentId: string; studentId: string; score: number }
  | { type: "ADD_MARKS"; rows: MarkEntryRow[] }
  | { type: "PAY_FEE"; feeId: string; amount: number; method: string }
  | { type: "ADD_NOTICE"; notice: Notice }
  | { type: "SEND_MESSAGE"; conversationId: string; text: string; senderId: string }
  | { type: "NEW_CONVERSATION"; conversation: Conversation }
  | { type: "APPLY_LEAVE"; request: LeaveRequest }
  | { type: "DECIDE_LEAVE"; id: string; status: "Approved" | "Rejected" }
  | { type: "MARK_READ" }
  | { type: "CLEAR_NOTIF" }
  | { type: "PUSH_NOTIF"; notif: AppNotification }
  | { type: "SETTINGS"; patch: Partial<Settings> };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOGIN":
      return { ...state, userId: action.userId, remember: action.remember };
    case "LOGOUT":
      return { ...state, userId: null };
    case "SAVE_ATTENDANCE": {
      const rest = state.attendanceDays.filter(
        (d) => !(d.date === action.day.date && d.className === action.day.className && d.section === action.day.section)
      );
      return { ...state, attendanceDays: [...rest, action.day] };
    }
    case "CREATE_ASSIGNMENT":
      return { ...state, assignments: [action.assignment, ...state.assignments] };
    case "SUBSCRIBE_ASSIGNMENT": {
      return {
        ...state,
        assignments: state.assignments.map((a) =>
          a.id === action.assignmentId
            ? {
                ...a,
                submissions: a.submissions.map((s) =>
                  s.studentId === action.studentId
                    ? { ...s, status: "Submitted", submittedAt: new Date().toISOString().slice(0, 10) }
                    : s
                ),
              }
            : a
        ),
      };
    }
    case "GRADE_SUBMISSION": {
      return {
        ...state,
        assignments: state.assignments.map((a) =>
          a.id === action.assignmentId
            ? {
                ...a,
                submissions: a.submissions.map((s) =>
                  s.studentId === action.studentId
                    ? { ...s, status: "Graded", score: action.score }
                    : s
                ),
              }
            : a
        ),
      };
    }
    case "ADD_MARKS":
      return {
        ...state,
        markEntries: [...state.markEntries, ...action.rows],
      };
    case "PAY_FEE":
      return {
        ...state,
        fees: state.fees.map((f) =>
          f.id === action.feeId
            ? {
                ...f,
                paid: Math.min(f.amount, f.paid + action.amount),
                status:
                  Math.min(f.amount, f.paid + action.amount) >= f.amount ? "Paid" : "Partial",
                paidOn: new Date().toISOString().slice(0, 10),
              }
            : f
        ),
      };
    case "ADD_NOTICE":
      return { ...state, notices: [action.notice, ...state.notices] };
    case "SEND_MESSAGE":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    id: uid("m"),
                    senderId: action.senderId,
                    text: action.text,
                    time: "Just now",
                  },
                ],
              }
            : c
        ),
      };
    case "NEW_CONVERSATION":
      return { ...state, conversations: [...state.conversations, action.conversation] };
    case "APPLY_LEAVE":
      return { ...state, leaves: [action.request, ...state.leaves] };
    case "DECIDE_LEAVE":
      return {
        ...state,
        leaves: state.leaves.map((l) => (l.id === action.id ? { ...l, status: action.status } : l)),
      };
    case "MARK_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };
    case "CLEAR_NOTIF":
      return { ...state, notifications: [] };
    case "PUSH_NOTIF":
      return { ...state, notifications: [action.notif, ...state.notifications] };
    case "SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.patch } };
    default:
      return state;
  }
}

function loadInitial(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const base = emptyState();
    return {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
      notifications: parsed.notifications ?? base.notifications,
    };
  } catch {
    return emptyState();
  }
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface AppContextValue {
  user: User | null;
  state: AppState;
  currentStudentIds: () => string[];
  toast: Toast[];
  login: (email: string, password: string, remember: boolean) => string | null;
  logout: () => void;
  notify: (message: string, type?: Toast["type"]) => void;
  saveAttendance: (day: AttendanceDay) => void;
  createAssignment: (a: {
    title: string;
    subject: string;
    className: number;
    section: string;
    dueDate: string;
    description: string;
  }) => void;
  submitAssignment: (assignmentId: string) => void;
  gradeSubmission: (assignmentId: string, studentId: string, score: number) => void;
  enterMarks: (rows: MarkEntryRow[]) => void;
  payFee: (feeId: string, method: string) => void;
  publishNotice: (n: { title: string; category: Notice["category"]; priority: Notice["priority"]; content: string }) => void;
  sendMessage: (conversationId: string, text: string) => void;
  createConversation: (participantIds: string[], names: Record<string, string>, firstText: string) => void;
  applyLeave: (r: Omit<LeaveRequest, "id" | "date" | "status">) => void;
  decideLeave: (id: string, status: "Approved" | "Rejected") => void;
  markNotificationsRead: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  getSettings: () => Settings;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeouts = useRef<Record<string, number>>({});

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }, [state]);

  const user = useMemo(() => users.find((u) => u.id === state.userId) ?? null, [state.userId]);

  const removeToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = uid("toast");
      setToasts((t) => [...t, { id, message, type }]);
      timeouts.current[id] = window.setTimeout(() => removeToast(id), 3600);
    },
    [removeToast]
  );

  const login = useCallback(
    (email: string, password: string, remember: boolean): string | null => {
      const u = users.find(
        (x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password
      );
      if (!u) return "Invalid email or password. Try one of the demo accounts below.";
      dispatch({ type: "LOGIN", userId: u.id, remember });
      notify(`Welcome back, ${u.name.split(" ")[0]}!`);
      return null;
    },
    [notify]
  );

  const logout = useCallback(() => {
    dispatch({ type: "LOGOUT" });
  }, []);

  const pushNotif = useCallback(
    (type: AppNotification["type"], title: string, text: string) => {
      dispatch({
        type: "PUSH_NOTIF",
        notif: {
          id: uid("notif"),
          title,
          text,
          time: new Date().toISOString().slice(0, 10),
          read: false,
          type,
        },
      });
    },
    []
  );

  const currentStudentIds = useCallback(() => {
    if (!user) return [];
    if (user.role === "parent") return user.studentId ? [user.studentId] : [];
    if (user.role === "student") return [user.studentId ?? ""].filter(Boolean);
    return [];
  }, [user]);

  const value = useMemo<AppContextValue>(() => {
    return {
      user,
      state,
      currentStudentIds,
      toast: toasts,
      login,
      logout,
      notify,
      saveAttendance: (day) => {
        dispatch({ type: "SAVE_ATTENDANCE", day });
        notify("Attendance saved for " + day.date);
      },
      createAssignment: (a) => {
        const assignment: Assignment = {
          id: uid("asg"),
          title: a.title,
          subject: a.subject,
          className: a.className,
          section: a.section,
          teacher: user?.name ?? "Teacher",
          assignedDate: new Date().toISOString().slice(0, 10),
          dueDate: a.dueDate,
          description: a.description,
          status: "Open",
          submissions: [],
        };
        dispatch({ type: "CREATE_ASSIGNMENT", assignment });
        notify("Assignment published to " + a.className + "-" + a.section);
        if (state.settings.notifAssignment) {
          pushNotif("assignment", "New Assignment", `${a.title} · Class ${a.className}-${a.section}`);
        }
      },
      submitAssignment: (assignmentId) => {
        const sid = user?.studentId;
        if (!sid) return;
        dispatch({ type: "SUBSCRIBE_ASSIGNMENT", assignmentId, studentId: sid });
        notify("Assignment submitted successfully!");
      },
      gradeSubmission: (assignmentId, studentId, score) => {
        dispatch({ type: "GRADE_SUBMISSION", assignmentId, studentId, score });
        notify("Marks recorded");
        if (state.settings.notifAssignment) {
          pushNotif("assignment", "Submission Graded", `Score ${score} recorded for your submission`);
        }
      },
      enterMarks: (rows) => {
        if (!rows.length) return;
        dispatch({ type: "ADD_MARKS", rows });
        notify(`Marks entered for ${rows.length} student${rows.length > 1 ? "s" : ""}`);
        if (state.settings.notifExam) {
          pushNotif("result", "Results Updated", `Marks entered for ${rows[0]?.examName ?? "exam"}`);
        }
      },
      payFee: (feeId, method) => {
        const fee = state.fees.find((f) => f.id === feeId);
        const remaining = fee ? Math.max(0, fee.amount - fee.paid) : 0;
        dispatch({ type: "PAY_FEE", feeId, amount: remaining, method });
        notify(`Payment of ${inr(remaining)} via ${method} successful!`, "success");
        if (state.settings.notifFees) {
          pushNotif("fee", "Payment Receipt", `Payment of ${inr(remaining)} via ${method} processed`);
        }
      },
      publishNotice: (n) => {
        const notice: Notice = {
          id: uid("not"),
          title: n.title,
          category: n.category,
          date: new Date().toISOString().slice(0, 10),
          author: user?.name ?? "Staff",
          priority: n.priority,
          content: n.content,
        };
        dispatch({ type: "ADD_NOTICE", notice });
        notify("Notice published to the notice board");
        if (state.settings.notifNotice) {
          pushNotif("notice", "New Notice", n.title);
        }
      },
      sendMessage: (conversationId, text) => {
        if (!user || !text.trim()) return;
        dispatch({ type: "SEND_MESSAGE", conversationId, text: text.trim(), senderId: user.id });
        notify("Message sent");
        if (state.settings.notifMessages) {
          pushNotif("message", "New Message", "You have a new message");
        }
      },
      createConversation: (participantIds, names, firstText) => {
        const convo: Conversation = {
          id: uid("convo"),
          participantIds,
          participantNames: names,
          messages: [
            { id: uid("m"), senderId: user?.id ?? "", text: firstText, time: "Just now" },
          ],
        };
        dispatch({ type: "NEW_CONVERSATION", conversation: convo });
        notify("Message sent");
        if (state.settings.notifMessages) {
          pushNotif("message", "New Message", "You have a new message");
        }
      },
      applyLeave: (r) => {
        const request: LeaveRequest = {
          ...r,
          id: uid("lv"),
          date: new Date().toISOString().slice(0, 10),
          status: "Pending",
        };
        dispatch({ type: "APPLY_LEAVE", request });
        notify("Leave request submitted and is awaiting approval");
      },
      decideLeave: (id, status) => {
        dispatch({ type: "DECIDE_LEAVE", id, status });
        notify(`Leave request ${status.toLowerCase()}`, status === "Approved" ? "success" : "info");
      },
      markNotificationsRead: () => dispatch({ type: "MARK_READ" }),
      updateSettings: (patch) => {
        dispatch({ type: "SETTINGS", patch });
        notify("Settings saved");
      },
      getSettings: () => state.settings ?? defaultSettings,
    };
  }, [user, state, toasts, notify, login, logout, pushNotif, currentStudentIds]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}