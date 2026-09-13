import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useApp } from "./store/AppContext";
import { Layout, ToastHost } from "./components/layout/Layout";
import { Role } from "./data/types";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Attendance from "./pages/Attendance";
import Timetable from "./pages/Timetable";
import Assignments from "./pages/Assignments";
import ExamsResults from "./pages/ExamsResults";
import Fees from "./pages/Fees";
import Notices from "./pages/Notices";
import Events from "./pages/Events";
import Messages from "./pages/Messages";
import Library from "./pages/Library";
import Transport from "./pages/Transport";
import Leaves from "./pages/Leaves";
import ApplyLeave from "./pages/ApplyLeave";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function RoleGate({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { user } = useApp();
  if (!user) return null;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />

          <Route element={<RoleGate roles={["teacher"]}><Students /></RoleGate>} path="/students" />
          <Route element={<RoleGate roles={["teacher"]}><Teachers /></RoleGate>} path="/teachers" />

          <Route element={<RoleGate roles={["teacher", "student", "parent"]}><Attendance /></RoleGate>} path="/attendance" />
          <Route element={<RoleGate roles={["teacher", "student", "parent"]}><Timetable /></RoleGate>} path="/timetable" />
          <Route element={<RoleGate roles={["teacher", "student", "parent"]}><Assignments /></RoleGate>} path="/assignments" />
          <Route element={<RoleGate roles={["teacher", "student", "parent"]}><ExamsResults /></RoleGate>} path="/exams" />

          <Route element={<RoleGate roles={["student", "parent"]}><Fees /></RoleGate>} path="/fees" />

          <Route element={<RoleGate roles={["teacher", "student", "parent"]}><Notices /></RoleGate>} path="/notices" />
          <Route element={<RoleGate roles={["teacher", "student", "parent"]}><Events /></RoleGate>} path="/events" />
          <Route element={<RoleGate roles={["teacher", "student", "parent"]}><Messages /></RoleGate>} path="/messages" />

          <Route element={<RoleGate roles={["teacher", "student", "parent"]}><Library /></RoleGate>} path="/library" />
          <Route element={<RoleGate roles={["teacher", "student", "parent"]}><Transport /></RoleGate>} path="/transport" />
          <Route element={<RoleGate roles={["teacher", "student", "parent"]}><Leaves /></RoleGate>} path="/leaves" />
          <Route element={<RoleGate roles={["student", "parent"]}><ApplyLeave /></RoleGate>} path="/apply-leave" />

          <Route element={<RoleGate roles={["teacher", "parent"]}><Reports /></RoleGate>} path="/reports" />
          <Route element={<RoleGate roles={["teacher", "student", "parent"]}><Settings /></RoleGate>} path="/settings" />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <ToastHost />
    </>
  );
}