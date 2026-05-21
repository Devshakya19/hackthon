import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Lock, PencilLine, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ensureTeamForUser } from '../../supabase/auth'
import {
	addTeamMember,
	assignProblem,
	getTeamByLeaderId,
	getTeamMembers,
	listAnnouncements,
	listProblems,
	listRooms,
	listSubmissions,
	removeTeamMember,
	updateTeam,
	updateTeamMember,
} from '../../supabase/queries'
import { getTeamById, type AnnouncementRow, type ProblemRow, type RoomRow, type SubmissionRow, type TeamMemberRow, type TeamRow } from '../../supabase/database'

type MemberForm = { name: string; email: string }

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
	return (
		<div className="glass-card rounded-3xl border-white/10 bg-white/5">
			<div className="text-xs uppercase tracking-[0.3em] text-text-500">{label}</div>
			<div className="mt-3 text-2xl font-bold text-text-900">{value}</div>
			<div className="mt-2 text-sm text-text-500">{hint}</div>
		</div>
	)
}

export default function DashboardHome() {
	const { user, profile } = useAuth()
	const [loading, setLoading] = useState(true)
	const [actionMessage, setActionMessage] = useState('')
	const [team, setTeam] = useState<TeamRow | null>(null)
	const [teamMembers, setTeamMembers] = useState<TeamMemberRow[]>([])
	const [problems, setProblems] = useState<ProblemRow[]>([])
	const [rooms, setRooms] = useState<RoomRow[]>([])
	const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([])
	const [submissions, setSubmissions] = useState<SubmissionRow[]>([])
	const [selectedProblem, setSelectedProblem] = useState<ProblemRow | null>(null)
	const [teamNameInput, setTeamNameInput] = useState('')
	const [memberForm, setMemberForm] = useState<MemberForm>({ name: '', email: '' })
	const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
	const [editingMemberForm, setEditingMemberForm] = useState<MemberForm>({ name: '', email: '' })
	const [hiddenInput, setHiddenInput] = useState('')
	const [isUnlocked, setIsUnlocked] = useState(false)

	const displayTeamName = team?.team_name || teamNameInput || profile?.team_name || 'Team Alpha'
	const displayHiddenCode = profile?.hidden_code || ''
	const assignedRoom = useMemo(() => {
		if (!team?.room_id) return null
		return rooms.find((room) => room.id === team.room_id) ?? null
	}, [rooms, team?.room_id])
	const latestSubmission = submissions[0] ?? null

	useEffect(() => {
		let active = true

		async function loadDashboard() {
			if (!user) {
				setLoading(false)
				return
			}

			setLoading(true)
			setActionMessage('')

			const baseTeamId = profile?.team_id ?? null
			let teamResult = baseTeamId ? await getTeamById(baseTeamId) : await getTeamByLeaderId(user.id)

			if (!teamResult.data) {
				teamResult = await getTeamByLeaderId(user.id)
			}

			if (!teamResult.data) {
				try {
					await ensureTeamForUser(user, profile?.team_name)
					teamResult = await getTeamByLeaderId(user.id)
				} catch (teamError) {
					if (!active) return
					setActionMessage(teamError instanceof Error ? teamError.message : 'Unable to prepare team record')
				}
			}

			const [problemsResult, roomsResult, announcementsResult] = await Promise.all([
				listProblems(),
				listRooms(),
				listAnnouncements(),
			])

			if (!active) return

			const nextTeam = teamResult.data ?? null
			setTeam(nextTeam)
			setTeamNameInput(nextTeam?.team_name || profile?.team_name || '')
			setProblems((problemsResult.data ?? []) as ProblemRow[])
			setRooms((roomsResult.data ?? []) as RoomRow[])
			setAnnouncements((announcementsResult.data ?? []) as AnnouncementRow[])

			if (nextTeam?.id) {
				const [membersResult, submissionsResult] = await Promise.all([
					getTeamMembers(nextTeam.id),
					listSubmissions(nextTeam.id),
				])

				if (!active) return

				setTeamMembers((membersResult.data ?? []) as TeamMemberRow[])
				setSubmissions((submissionsResult.data ?? []) as SubmissionRow[])

				if (nextTeam.problem_id) {
					const selected = (problemsResult.data ?? []).find((problem) => problem.id === nextTeam.problem_id) ?? null
					setSelectedProblem(selected as ProblemRow | null)
				} else {
					setSelectedProblem(null)
				}
			} else {
				setTeamMembers([])
				setSubmissions([])
				setSelectedProblem(null)
			}

			setLoading(false)
		}

		void loadDashboard()

		return () => {
			active = false
		}
	}, [profile?.team_id, profile?.team_name, user])

	function handleUnlockProblems() {
		if (!displayHiddenCode) {
			setActionMessage('Hidden code is not available yet.')
			return
		}

		if (hiddenInput.trim() === displayHiddenCode) {
			setIsUnlocked(true)
			setActionMessage('Problem board unlocked for your team.')
			return
		}

		setActionMessage('Invalid hidden code. Check the DOM token or team-specific code.')
	}

	async function handleSaveTeamName() {
		if (!team?.id) {
			setActionMessage('Team record not found yet.')
			return
		}

		const { error } = await updateTeam(team.id, { team_name: teamNameInput.trim() || displayTeamName })
		if (error) {
			setActionMessage(error.message)
			return
		}

		setTeam((current) => (current ? { ...current, team_name: teamNameInput.trim() || displayTeamName } : current))
		setActionMessage('Team name updated in Supabase.')
	}

	async function handleAddMember() {
		if (!team?.id) {
			setActionMessage('Create the team record first.')
			return
		}

		if (!memberForm.name.trim()) {
			setActionMessage('Member name is required.')
			return
		}

		const newMember = {
			id: crypto.randomUUID(),
			team_id: team.id,
			name: memberForm.name.trim(),
			email: memberForm.email.trim() || 'member@amity.edu',
		}

		const { error } = await addTeamMember(newMember)
		if (error) {
			setActionMessage(error.message)
			return
		}

		setTeamMembers((current) => [...current, newMember])
		setMemberForm({ name: '', email: '' })
		setActionMessage('Team member added in Supabase.')
	}

	function handleStartEdit(member: TeamMemberRow) {
		setEditingMemberId(member.id)
		setEditingMemberForm({ name: member.name, email: member.email })
	}

	async function handleSaveEdit(memberId: string) {
		const { error } = await updateTeamMember(memberId, {
			name: editingMemberForm.name.trim(),
			email: editingMemberForm.email.trim(),
		})

		if (error) {
			setActionMessage(error.message)
			return
		}

		setTeamMembers((current) => current.map((member) => (member.id === memberId ? { ...member, ...editingMemberForm } : member)))
		setEditingMemberId(null)
		setEditingMemberForm({ name: '', email: '' })
		setActionMessage('Team member updated in Supabase.')
	}

	async function handleRemoveMember(memberId: string) {
		const { error } = await removeTeamMember(memberId)
		if (error) {
			setActionMessage(error.message)
			return
		}

		setTeamMembers((current) => current.filter((member) => member.id !== memberId))
		setActionMessage('Team member removed from Supabase.')
	}

	async function handleSelectProblem(problem: ProblemRow) {
		if (!team?.id) {
			setActionMessage('Team record not found yet.')
			return
		}

		if (!isUnlocked) {
			setActionMessage('Unlock the problem board first.')
			return
		}

		if (problem.assigned_to && problem.assigned_to !== team.id) {
			setActionMessage('Locked by another team.')
			return
		}

		const { error } = await assignProblem(problem.id, team.id)
		if (error) {
			setActionMessage(error.message)
			return
		}

		const { error: teamUpdateError } = await updateTeam(team.id, { problem_id: problem.id })
		if (teamUpdateError) {
			setActionMessage(teamUpdateError.message)
			return
		}

		setSelectedProblem({ ...problem, assigned_to: team.id, locked_by: team.id, status: 'assigned' })
		setTeam((current) => (current ? { ...current, problem_id: problem.id } : current))
		setProblems((current) => current.map((item) => (item.id === problem.id ? { ...item, assigned_to: team.id, locked_by: team.id, status: 'assigned' } : item)))
		setActionMessage(`${problem.title} reserved for ${displayTeamName}.`)
	}

	const visibleProblems = problems.map((problem) => {
		const isSelected = selectedProblem?.id === problem.id
		const isLockedByOther = Boolean(problem.assigned_to && team?.id && problem.assigned_to !== team.id)
		return { problem, isSelected, isLockedByOther }
	})

	if (loading) {
		return <div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6 text-sm text-text-500">Loading dashboard data...</div>
	}

	return (
		<div className="space-y-6">
			<section id="overview" className="grid gap-4 lg:grid-cols-4">
				<StatCard label="Team" value={displayTeamName} hint={team?.leader_id ? 'DB-backed team record' : 'Waiting for team record'} />
				<StatCard label="Members" value={`${teamMembers.length}/4`} hint="Loaded from team_members" />
				<StatCard label="Seat" value={team?.seat_number || 'Unassigned'} hint={assignedRoom ? `${assignedRoom.block}-${assignedRoom.room_number}` : 'Room not assigned yet'} />
				<StatCard label="Problem" value={selectedProblem?.title || 'Not selected'} hint={selectedProblem ? 'Stored in teams.problem_id' : 'Awaiting selection'} />
			</section>

			<section id="team" className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
				<div className="glass-card rounded-3xl border-white/10 bg-white/5">
					<div className="flex items-start justify-between gap-4">
						<div>
							<div className="text-sm uppercase tracking-[0.3em] text-text-500">Team Management</div>
							<h2 className="mt-2 text-2xl font-bold text-text-900">Manage the team roster in Supabase</h2>
						</div>
						<span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-text-500">Live DB</span>
					</div>

					<div className="mt-6 grid gap-4 md:grid-cols-2">
						<label className="space-y-2">
							<span className="text-xs uppercase tracking-[0.25em] text-text-500">Team Name</span>
							<input value={teamNameInput} onChange={(e) => setTeamNameInput(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-900 outline-none placeholder:text-text-500" placeholder="Enter team name" />
						</label>
						<div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3">
							<div className="text-xs uppercase tracking-[0.25em] text-primary">Hidden Code</div>
							<div className="mt-2 text-lg font-bold text-text-900">{displayHiddenCode || 'Generating...'}</div>
							<div className="text-sm text-text-500">Stored on your user row.</div>
						</div>
					</div>

					<div className="mt-6 flex gap-3">
						<button onClick={handleSaveTeamName} className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-bg">Save Team Name</button>
					</div>

					<div className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
						<input value={memberForm.name} onChange={(e) => setMemberForm((current) => ({ ...current, name: e.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-900 outline-none placeholder:text-text-500" placeholder="Member name" />
						<input value={memberForm.email} onChange={(e) => setMemberForm((current) => ({ ...current, email: e.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-900 outline-none placeholder:text-text-500" placeholder="Member email" />
						<button onClick={handleAddMember} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-bg"><Plus className="h-4 w-4" />Add</button>
					</div>

					<div className="mt-6 space-y-3">
						{teamMembers.map((member) => (
							<div key={member.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
								<div className="flex-1">
									{editingMemberId === member.id ? (
										<div className="space-y-2">
											<input value={editingMemberForm.name} onChange={(e) => setEditingMemberForm((current) => ({ ...current, name: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-bg/80 px-3 py-2 text-sm text-text-900 outline-none" />
											<input value={editingMemberForm.email} onChange={(e) => setEditingMemberForm((current) => ({ ...current, email: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-bg/80 px-3 py-2 text-sm text-text-900 outline-none" />
										</div>
									) : (
										<>
											<div className="text-sm font-semibold text-text-900">{member.name}</div>
											<div className="text-sm text-text-500">{member.email}</div>
										</>
									)}
								</div>
								<div className="flex items-center gap-2">
									{editingMemberId === member.id ? (
										<button onClick={() => handleSaveEdit(member.id)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-text-900">Save</button>
									) : (
										<button onClick={() => handleStartEdit(member)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-text-900"><PencilLine className="h-4 w-4" />Edit</button>
									)}
									<button onClick={() => handleRemoveMember(member.id)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-red-300"><Trash2 className="h-4 w-4" />Remove</button>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="space-y-6">
					<div id="seating" className="glass-card rounded-3xl border-white/10 bg-white/5">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary"><Sparkles className="h-5 w-5" /></div>
							<div>
								<div className="text-sm uppercase tracking-[0.3em] text-text-500">Seat Allocation</div>
								<div className="text-lg font-bold text-text-900">Current room mapping</div>
							</div>
						</div>

						<div className="mt-4 grid grid-cols-3 gap-3 text-center">
							<div className="rounded-2xl border border-white/10 bg-bg/60 p-4"><div className="text-xs uppercase tracking-[0.25em] text-text-500">Block</div><div className="mt-2 text-xl font-bold text-text-900">{assignedRoom?.block || '--'}</div></div>
							<div className="rounded-2xl border border-white/10 bg-bg/60 p-4"><div className="text-xs uppercase tracking-[0.25em] text-text-500">Room</div><div className="mt-2 text-xl font-bold text-text-900">{assignedRoom?.room_number || '--'}</div></div>
							<div className="rounded-2xl border border-white/10 bg-bg/60 p-4"><div className="text-xs uppercase tracking-[0.25em] text-text-500">Seat</div><div className="mt-2 text-xl font-bold text-text-900">{team?.seat_number || '--'}</div></div>
						</div>

						<div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-text-500">
							{assignedRoom ? `Capacity ${assignedRoom.capacity} loaded from rooms table.` : 'No room assigned yet.'}
						</div>
					</div>

					<div id="announcements" className="glass-card rounded-3xl border-white/10 bg-white/5">
						<div className="text-sm uppercase tracking-[0.3em] text-text-500">Announcements</div>
						<div className="mt-4 space-y-3">
							{announcements.map((announcement) => (
								<div key={announcement.id} className="rounded-2xl border border-white/10 bg-bg/60 p-4">
									<div className="text-sm font-semibold text-text-900">{announcement.title}</div>
									<div className="mt-1 text-sm text-text-500">{announcement.message}</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			<section id="problems" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
				<div className="glass-card rounded-3xl border-white/10 bg-white/5">
					<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
						<div>
							<div className="text-sm uppercase tracking-[0.3em] text-text-500">Problem Statements</div>
							<h2 className="mt-2 text-2xl font-bold text-text-900">Unlock a problem and reserve it for your team</h2>
						</div>
						<div className="text-sm text-text-500">Status and locks come from Supabase.</div>
					</div>

					<div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
						<div className="rounded-3xl border border-dashed border-white/15 bg-bg/70 p-5">
							<div className="text-xs uppercase tracking-[0.3em] text-text-500">Hidden Code Input</div>
							<div className="mt-3 flex flex-col gap-3 sm:flex-row">
								<input value={hiddenInput} onChange={(e) => setHiddenInput(e.target.value)} placeholder="Enter team token" className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-900 outline-none placeholder:text-text-500" />
								<button onClick={handleUnlockProblems} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-bg"><Lock className="h-4 w-4" />Unlock</button>
							</div>

							<div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-text-500">
								Hidden DOM comment seeded for the team token in the frontend-only flow.
								<div className="sr-only" dangerouslySetInnerHTML={{ __html: `<!-- team-hidden-code:${displayHiddenCode} -->` }} />
							</div>

							<div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${isUnlocked ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-white/10 bg-white/5 text-text-500'}`}>
								{isUnlocked ? 'Problems unlocked. Select a problem statement below.' : 'Enter the correct team token to unlock the problem board.'}
							</div>
						</div>

						<div id="selected-problem" className="rounded-3xl border border-white/10 bg-white/5 p-5">
							<div className="text-xs uppercase tracking-[0.3em] text-text-500">Selected Problem</div>
							{selectedProblem ? (
								<div className="mt-4 space-y-3">
									<div className="text-xl font-bold text-text-900">{selectedProblem.title}</div>
									<div className="text-sm text-text-500">{selectedProblem.description}</div>
									<div className="flex flex-wrap gap-2 text-xs">
										<span className="rounded-full border border-white/10 bg-bg/70 px-3 py-1 text-text-500">{selectedProblem.status}</span>
										<span className="rounded-full border border-white/10 bg-bg/70 px-3 py-1 text-text-500">{selectedProblem.assigned_to === team?.id ? 'Reserved by your team' : 'Stored in Supabase'}</span>
									</div>
									<div className="text-sm text-text-500">Locked by: {selectedProblem.locked_by || '--'}</div>
									<div className="text-sm text-text-500">Assigned to: {selectedProblem.assigned_to || '--'}</div>
								</div>
							) : (
								<div className="mt-4 text-sm text-text-500">No problem selected yet.</div>
							)}
						</div>
					</div>

					<div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
						{visibleProblems.map(({ problem, isSelected, isLockedByOther }) => (
							<motion.button
								key={problem.id}
								whileHover={{ y: -4 }}
								onClick={() => handleSelectProblem(problem)}
								className={`rounded-3xl border p-5 text-left transition-colors ${isSelected ? 'border-primary bg-primary/10' : 'border-white/10 bg-bg/70'} ${isLockedByOther ? 'opacity-70' : ''}`}
							>
								<div className="flex items-start justify-between gap-3">
									<div>
										<div className="text-lg font-bold text-text-900">{problem.title}</div>
										<div className="mt-1 text-sm text-text-500">{problem.description}</div>
									</div>
									{isSelected ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Lock className="h-5 w-5 text-text-500" />}
								</div>

								<div className="mt-4 flex flex-wrap gap-2 text-xs">
									<span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-text-500">{problem.status}</span>
									{problem.assigned_to && problem.assigned_to !== team?.id ? <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-text-500">Locked by another team</span> : null}
								</div>

								<div className="mt-4 text-sm font-medium text-text-500">
									{isSelected ? 'Reserved by your team' : isLockedByOther ? 'Locked by another team' : isUnlocked ? 'Available to claim' : 'Locked until code unlock'}
								</div>
							</motion.button>
						))}
					</div>
				</div>

				<div className="space-y-6">
					<div className="glass-card rounded-3xl border-white/10 bg-white/5">
						<div className="text-xs uppercase tracking-[0.3em] text-text-500">Submission Preview</div>
						<div className="mt-4 rounded-2xl border border-white/10 bg-bg/60 p-4">
							{latestSubmission ? (
								<>
									<div className="text-lg font-bold text-text-900">Latest Submission</div>
									<div className="mt-2 space-y-2 text-sm text-text-500">
										<div>GitHub: {latestSubmission.github_link || '--'}</div>
										<div>PPT: {latestSubmission.ppt_link || '--'}</div>
										<div>Submitted: {latestSubmission.submitted_at || latestSubmission.created_at || '--'}</div>
									</div>
								</>
							) : (
								<div className="text-sm text-text-500">No submissions yet. DB data will appear here later.</div>
							)}
						</div>
					</div>

					<div className="glass-card rounded-3xl border-white/10 bg-white/5">
						<div className="text-xs uppercase tracking-[0.3em] text-text-500">Live Status</div>
						<div className="mt-4 text-sm text-text-500">{actionMessage || 'Use the dashboard flow to unlock and reserve a problem statement.'}</div>
					</div>
				</div>
			</section>
		</div>
	)
}