import React, { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Lock } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ensureTeamForUser } from '../../supabase/auth'
import { getTeamById, type ProblemRow, type TeamRow } from '../../supabase/database'
import { assignProblem, getTeamByLeaderId, listProblems, lockProblem, releaseExpiredProblemLocks, updateTeam } from '../../supabase/queries'
import { subscribeToProblems } from '../../supabase/realtime'

export default function ProblemStatements() {
	const { user, profile, role } = useAuth()
	const [loading, setLoading] = useState(true)
	const [team, setTeam] = useState<TeamRow | null>(null)
	const [problems, setProblems] = useState<ProblemRow[]>([])
	const [hiddenCode, setHiddenCode] = useState('')
	const [unlocked, setUnlocked] = useState(false)
	const [message, setMessage] = useState('')
	const [selectedProblem, setSelectedProblem] = useState<ProblemRow | null>(null)
	const [pendingProblemId, setPendingProblemId] = useState<string | null>(null)

	useEffect(() => {
		let active = true
		const channel = subscribeToProblems(() => {
			void listProblems().then(({ data }) => {
				if (!active) return
				setProblems((data ?? []) as ProblemRow[])
			})
		})

		async function loadProblems() {
			if (!user) {
				setLoading(false)
				return
			}

			setLoading(true)
			await releaseExpiredProblemLocks()
			const baseTeamId = profile?.team_id ?? null
			let teamResult = baseTeamId ? await getTeamById(baseTeamId) : await getTeamByLeaderId(user.id)

			if (!teamResult.data) {
				teamResult = await getTeamByLeaderId(user.id)
			}

			if (!teamResult.data) {
				await ensureTeamForUser(user, profile?.team_name)
				teamResult = await getTeamByLeaderId(user.id)
			}

			const { data } = await listProblems()
			if (!active) return

			const nextTeam = teamResult.data ?? null
			setTeam(nextTeam)
			setProblems((data ?? []) as ProblemRow[])
			setSelectedProblem(nextTeam?.problem_id ? (data ?? []).find((problem) => problem.id === nextTeam.problem_id) ?? null : null)
			setPendingProblemId(null)
			setLoading(false)
		}

		void loadProblems()
		return () => {
			active = false
			void channel.unsubscribe()
		}
	}, [profile?.team_id, profile?.team_name, user])

	const displayHiddenCode = profile?.hidden_code || ''
	const canManageProblems = role === 'leader' || role === 'admin'
	const visibleProblems = useMemo(() => problems.map((problem) => ({
		problem,
		isLockedByOther: Boolean(problem.assigned_to && team?.id && problem.assigned_to !== team.id),
		isSelected: selectedProblem?.id === problem.id,
		isPending: pendingProblemId === problem.id,
	})), [pendingProblemId, problems, selectedProblem?.id, team?.id])

	function unlockBoard() {
		if (!displayHiddenCode) return setMessage('Hidden code is not available yet.')
		if (hiddenCode.trim() === displayHiddenCode) {
			setUnlocked(true)
			setMessage('Problem statements unlocked.')
			return
		}
		setMessage('Invalid hidden code.')
	}

	async function selectProblem(problem: ProblemRow) {
		if (!team?.id) return setMessage('Team not ready yet.')
		if (!canManageProblems) return setMessage('Only leader/admin can unlock and select problems.')
		if (!unlocked) return setMessage('Enter the hidden code first.')
		if (problem.assigned_to && problem.assigned_to !== team.id) return setMessage('This problem is already reserved by another team.')

		const lockedUntil = new Date(Date.now() + 60_000).toISOString()
		const { error: lockError } = await lockProblem(problem.id, team.id, lockedUntil)
		if (lockError) return setMessage(lockError.message)

		setProblems((current) => current.map((item) => (item.id === problem.id ? { ...item, locked_by: team.id, locked_until: lockedUntil, assigned_to: null, status: 'locked' } : item)))
		setPendingProblemId(problem.id)
		setSelectedProblem(problem)
		setMessage(`${problem.title} locked for 1 minute. Confirm to submit permanently.`)
	}

	async function confirmSelection() {
		if (!team?.id) return setMessage('Team not ready yet.')
		if (!pendingProblemId) return setMessage('Select a problem first.')
		const pendingProblem = problems.find((problem) => problem.id === pendingProblemId)
		if (!pendingProblem) return setMessage('Pending problem not found.')

		const { error } = await assignProblem(pendingProblemId, team.id)
		if (error) return setMessage(error.message)

		const { error: teamError } = await updateTeam(team.id, { problem_id: pendingProblemId })
		if (teamError) return setMessage(teamError.message)

		setTeam((current) => (current ? { ...current, problem_id: pendingProblemId } : current))
		setSelectedProblem({ ...pendingProblem, assigned_to: team.id, locked_by: team.id, status: 'assigned', locked_until: null })
		setProblems((current) => current.map((item) => (item.id === pendingProblemId ? { ...item, assigned_to: team.id, locked_by: team.id, status: 'assigned', locked_until: null } : item)))
		setPendingProblemId(null)
		setMessage(`${pendingProblem.title} submitted permanently for your team.`)
	}

	if (loading) {
		return <div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6 text-sm text-text-500">Loading problems...</div>
	}

	return (
		<div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
			<div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6">
				<div className="text-sm uppercase tracking-[0.3em] text-text-500">Problem Statements</div>
				<h1 className="mt-2 text-2xl font-bold text-text-900">Unlock, review, and submit your problem choice</h1>

					<div className="mt-6 rounded-3xl border border-dashed border-white/15 bg-bg/70 p-5">
					<div className="text-xs uppercase tracking-[0.3em] text-text-500">Hidden Code</div>
					<div className="mt-3 flex flex-col gap-3 sm:flex-row">
							<input value={hiddenCode} onChange={(e) => setHiddenCode(e.target.value)} placeholder="Paste hidden code" className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-900 outline-none" disabled={!canManageProblems} />
							<button onClick={unlockBoard} disabled={!canManageProblems} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-bg disabled:opacity-60"><Lock className="h-4 w-4" />Unlock</button>
					</div>
					<div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${unlocked ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-white/10 bg-white/5 text-text-500'}`}>
						{unlocked ? 'Problem board unlocked.' : 'Enter your team code to view and submit problem statements.'}
					</div>
					{canManageProblems ? null : <div className="mt-3 text-xs text-text-500">Members can only view the assigned problem.</div>}
				</div>

				<div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{visibleProblems.map(({ problem, isSelected, isLockedByOther }) => (
						<button key={problem.id} onClick={() => selectProblem(problem)} disabled={!canManageProblems} className={`rounded-3xl border p-5 text-left transition-colors ${isSelected ? 'border-primary bg-primary/10' : 'border-white/10 bg-bg/70'} ${isLockedByOther ? 'opacity-70' : ''} ${!canManageProblems ? 'cursor-default opacity-80' : ''}`}>
							<div className="flex items-start justify-between gap-3">
								<div>
									<div className="text-lg font-bold text-text-900">{problem.title}</div>
									<div className="mt-1 text-sm text-text-500">{problem.description}</div>
								</div>
								{isSelected ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Lock className="h-5 w-5 text-text-500" />}
							</div>
							<div className="mt-4 text-xs text-text-500">{isLockedByOther ? 'Reserved by another team' : isPending ? 'Locked for 1 minute' : isSelected ? 'Selected by your team' : unlocked ? 'Available to submit' : 'Locked until code unlock'}</div>
						</button>
					))}
				</div>

				{canManageProblems && pendingProblemId ? (
					<button onClick={confirmSelection} className="mt-6 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-bg">Confirm final submission</button>
				) : null}
			</div>

			<div className="space-y-6">
				<div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6">
					<div className="text-sm uppercase tracking-[0.3em] text-text-500">Selected Problem</div>
					{selectedProblem ? (
						<div className="mt-4 space-y-3">
							<div className="text-xl font-bold text-text-900">{selectedProblem.title}</div>
							<div className="text-sm text-text-500">{selectedProblem.description}</div>
							<div className="text-sm text-text-500">Status: {selectedProblem.status}</div>
						</div>
					) : <div className="mt-4 text-sm text-text-500">No problem selected yet.</div>}
				</div>

				<div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6">
					<div className="text-sm uppercase tracking-[0.3em] text-text-500">Submission Hint</div>
					<div className="mt-4 text-sm text-text-500">After the problem is locked in, leaders can confirm it permanently and then use the Submission page.</div>
				</div>

				{message ? <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-text-500">{message}</div> : null}
			</div>
		</div>
	)
}
