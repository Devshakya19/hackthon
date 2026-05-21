import React from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import LandingPage from '../pages/marketing/LandingPage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPassword from '../pages/auth/ForgotPassword'
import VerifyEmail from '../pages/auth/VerifyEmail'
import DashboardLayout from '../layouts/DashboardLayout'
import DashboardHome from '../pages/dashboard/DashboardHome'
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
	const { loading, isAuthenticated } = useAuth()

	if (loading) return <LoadingGate />
	if (isAuthenticated) return <Navigate to="/dashboard" replace />
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
          <Route index element={<DashboardHome />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
