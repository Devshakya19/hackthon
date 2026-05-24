import React from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import LandingPage from '../pages/marketing/LandingPage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPassword from '../pages/auth/ForgotPassword'
import VerifyEmail from '../pages/auth/VerifyEmail'
import DashboardLayout from '../layouts/DashboardLayout'
import DashboardHome from '../pages/dashboard/DashboardHome'
import TeamPage from '../pages/dashboard/TeamPage'
import ProblemStatements from '../pages/dashboard/ProblemStatements'
import Announcements from '../pages/dashboard/Announcements'
import SubmissionPage from '../pages/dashboard/SubmissionPage'
import AdminDashboard from '../pages/admin/AdminDashboard'
import ManageRooms from '../pages/admin/ManageRooms'
import ManageProblems from '../pages/admin/ManageProblems'
import ManageTeams from '../pages/admin/ManageTeams'
import ManageAnnouncements from '../pages/admin/ManageAnnouncements'
import SeatManager from '../pages/admin/SeatManager'
import JudgingPanel from '../pages/admin/JudgingPanel'
import EmergencyControls from '../pages/admin/EmergencyControls'
import { useAuth } from '../hooks/useAuth'

function LoadingGate() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-bg text-text-900">
			<div className="glass-card px-6 py-4 text-sm text-text-500">Checking session...</div>
		</div>
	)
}

function ProtectedRoute() {
	const { loading, isAuthenticated } = useAuth()

	if (loading) return <LoadingGate />
	if (!isAuthenticated) return <Navigate to="/login" replace />
	return <Outlet />
}

function PublicRoute() {
  const { loading, isAuthenticated, role } = useAuth()

	if (loading) return <LoadingGate />
  if (isAuthenticated) return <Navigate to={role === 'admin' ? '/dashboard/admin' : '/dashboard'} replace />
	return <Outlet />
}

function DashboardEntry() {
  const { role } = useAuth()

  if (role === 'admin') return <Navigate to="admin" replace />
  return <DashboardHome />
}

function RequireRole({ allowedRoles }: { allowedRoles: Array<'leader' | 'member' | 'admin'> }) {
  const { loading, role } = useAuth()

  if (loading) return <LoadingGate />
  if (!allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardEntry />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="problems" element={<ProblemStatements />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="submission" element={<SubmissionPage />} />
          <Route element={<RequireRole allowedRoles={['admin']} />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/rooms" element={<ManageRooms />} />
            <Route path="admin/problems" element={<ManageProblems />} />
            <Route path="admin/teams" element={<ManageTeams />} />
            <Route path="admin/announcements" element={<ManageAnnouncements />} />
            <Route path="admin/seating" element={<SeatManager />} />
            <Route path="admin/judging" element={<JudgingPanel />} />
            <Route path="admin/emergency" element={<EmergencyControls />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
