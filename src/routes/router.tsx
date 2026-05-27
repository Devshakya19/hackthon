import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import LandingPage from "../pages/marketing/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import JoinTeamPage from "../pages/auth/JoinTeamPage";
import ForgotPassword from "../pages/auth/ForgotPassword";
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardHome from "../pages/dashboard/DashboardHome";
import TeamPage from "../pages/dashboard/TeamPage";
import ProblemStatements from "../pages/dashboard/ProblemStatements";
import Announcements from "../pages/dashboard/Announcements";
import SubmissionPage from "../pages/dashboard/SubmissionPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageRooms from "../pages/admin/ManageRooms";
import ManageProblems from "../pages/admin/ManageProblems";
import ManageTeams from "../pages/admin/ManageTeams";
import ManageAnnouncements from "../pages/admin/ManageAnnouncements";
import SeatManager from "../pages/admin/SeatManager";
import JudgingPanel from "../pages/admin/JudgingPanel";
import EmergencyControls from "../pages/admin/EmergencyControls";
import AdminLayout from "../layouts/AdminLayout";
import { useAuth } from "../hooks/useAuth";

function LoadingGate() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-text-900">
      <div className="glass-card px-6 py-4 text-sm text-text-500">
        Checking session...
      </div>
    </div>
  );
}

function ProtectedRoute() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) return <LoadingGate />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function PublicRoute() {
  const { loading, isAuthenticated, role } = useAuth();

  if (loading) return <LoadingGate />;
  if (isAuthenticated)
    return (
      <Navigate
        to={role === "admin" ? "/dashboard/admin" : "/dashboard"}
        replace
      />
    );
  return <Outlet />;
}

function DashboardEntry() {
  const { role } = useAuth();

  if (role === "admin") return <Navigate to="admin" replace />;
  return <DashboardHome />;
}

function RequireRole({
  allowedRoles,
}: {
  allowedRoles: Array<"leader" | "member" | "admin">;
}) {
  const { loading, role } = useAuth();

  if (loading) return <LoadingGate />;
  if (!allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/join" element={<JoinTeamPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardEntry />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="problems" element={<ProblemStatements />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="submission" element={<SubmissionPage />} />
        </Route>

        {/* Admin routes use their own layout so the left navigation is admin-specific */}
        <Route element={<RequireRole allowedRoles={["admin"]} />}>
          <Route path="/dashboard/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="rooms" element={<ManageRooms />} />
            <Route path="problems" element={<ManageProblems />} />
            <Route path="teams" element={<ManageTeams />} />
            <Route path="announcements" element={<ManageAnnouncements />} />
            <Route path="seating" element={<SeatManager />} />
            <Route path="judging" element={<JudgingPanel />} />
            <Route path="emergency" element={<EmergencyControls />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
