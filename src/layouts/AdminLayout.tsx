import React, { useState } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { Shield, Users, LayoutDashboard, Megaphone, FileUp, Grid, Menu, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function AdminLayout() {
	const [mobileOpen, setMobileOpen] = useState(false)
	const navigate = useNavigate()
	const { profile, role, signOut } = useAuth()

	const displayName = profile?.email ? profile.email.split('@')[0] : 'Admin'

	const navItems = [
		{ id: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
		{ id: '/dashboard/admin/rooms', label: 'Manage Rooms', icon: Grid },
		{ id: '/dashboard/admin/problems', label: 'Manage Problems', icon: Shield },
		{ id: '/dashboard/admin/teams', label: 'Manage Teams', icon: Users },
		{ id: '/dashboard/admin/announcements', label: 'Announcements', icon: Megaphone },
		{ id: '/dashboard/admin/seating', label: 'Seat Manager', icon: FileUp },
		{ id: '/dashboard/admin/judging', label: 'Judging', icon: Shield },
		{ id: '/dashboard/admin/emergency', label: 'Emergency', icon: Shield },
	]

	const handleSignOut = async () => {
		await signOut()
		navigate('/login')
	}

	const sidebar = (
		<aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 flex-col border-r border-white/10 bg-bg/95 backdrop-blur-xl px-5 py-6">
			<div className="flex items-center gap-3 px-2 pb-6 border-b border-white/10">
				<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-bg font-black">ADM</div>
				<div>
					<div className="text-lg font-bold text-text-900">Admin Panel</div>
					<div className="text-xs uppercase tracking-[0.28em] text-text-500">Platform Controls</div>
				</div>
			</div>

			<nav className="mt-6 space-y-1">
				{navItems.map((item) => {
					const Icon = item.icon
					return (
						<NavLink key={item.id} to={item.id} className={({ isActive }) => `flex w-full items-center rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-text-500 hover:bg-white/5 hover:text-text-900'}`}>
							<span className="flex items-center gap-3"><Icon className="h-4 w-4" />{item.label}</span>
						</NavLink>
					)
				})}
			</nav>

			<div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4">
				<div className="text-sm font-semibold text-text-900">Signed in as</div>
				<div className="mt-2 text-sm text-text-500">{displayName}</div>
				<div className="mt-3 flex gap-2">
					<button onClick={handleSignOut} className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-bg">Sign out</button>
					<Link to="/" className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-text-500">Home</Link>
				</div>
			</div>
		</aside>
	)

	const topbar = (
		<header className="sticky top-0 z-40 border-b border-white/10 bg-bg/85 backdrop-blur-xl">
			<div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
				<button className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-text-900 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
				<div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
					<input type="text" placeholder="Search admin..." className="w-full bg-transparent text-sm text-text-900 placeholder:text-text-500 focus:outline-none" />
				</div>
				<div className="hidden md:flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
					<div className="text-sm font-semibold text-text-900">{displayName}</div>
				</div>
				<button onClick={handleSignOut} className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-bg"><LogOut className="h-4 w-4" />Sign out</button>
			</div>
		</header>
	)

	const mobileDrawer = mobileOpen ? (
		<div className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm lg:hidden">
			<aside className="flex h-full w-80 flex-col border-r border-white/10 bg-bg px-5 py-6">
				<div className="flex items-center justify-between border-b border-white/10 pb-5">
					<div className="text-lg font-bold text-text-900">Admin Navigation</div>
					<button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-900" onClick={() => setMobileOpen(false)}>Close</button>
				</div>
				<div className="mt-4 space-y-2">
					{navItems.map((item) => {
						const Icon = item.icon
						return (
							<NavLink key={item.id} to={item.id} onClick={() => setMobileOpen(false)} className={({ isActive }) => `flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium ${isActive ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 bg-white/5 text-text-900'}`}>
								<Icon className="h-4 w-4 text-primary" />{item.label}
							</NavLink>
						)
					})}
				</div>
			</aside>
		</div>
	) : null

	return (
		<div className="min-h-screen bg-bg text-text-900">
			{sidebar}
			<div className="lg:pl-72">
				{topbar}
				<main className="px-4 py-6 sm:px-6 lg:px-8"><Outlet /></main>
			</div>
			{mobileDrawer}
		</div>
	)
}
