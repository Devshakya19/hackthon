import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const LandingPage = lazy(() => import("../pages/marketing/LandingPage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const JoinTeamPage = lazy(() => import("../pages/auth/JoinTeamPage"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const DashboardLayout = lazy(() => import("../layouts/DashboardLayout"));
const DashboardHome = lazy(() => import("../pages/dashboard/DashboardHome"));
const TeamPage = lazy(() => import("../pages/dashboard/TeamPage"));
const ProblemStatements = lazy(() => import("../pages/dashboard/ProblemStatements"));
const Announcements = lazy(() => import("../pages/dashboard/Announcements"));
const SubmissionPage = lazy(() => import("../pages/dashboard/SubmissionPage"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const ManageRooms = lazy(() => import("../pages/admin/ManageRooms"));
const ManageProblems = lazy(() => import("../pages/admin/ManageProblems"));
const ManageTeams = lazy(() => import("../pages/admin/ManageTeams"));
const ManageAnnouncements = lazy(() => import("../pages/admin/ManageAnnouncements"));
const SeatManager = lazy(() => import("../pages/admin/SeatManager"));
const JudgingPanel = lazy(() => import("../pages/admin/JudgingPanel"));
const EmergencyControls = lazy(() => import("../pages/admin/EmergencyControls"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));

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
    <Suspense fallback={<LoadingGate />}>
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
    </Suspense>
  );
}
