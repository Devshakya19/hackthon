import React, { useEffect, useMemo, useState } from 'react'
import { type ProblemRow, type RoomRow, type TeamMemberRow, type TeamRow } from '../../supabase/database'
import { listAllTeamMembers, listProblems, listRooms, listTeams, removeTeam, updateTeam } from '../../supabase/queries'

export default function ManageTeams() {
	const [teams, setTeams] = useState<TeamRow[]>([])
	const [members, setMembers] = useState<TeamMemberRow[]>([])
	const [rooms, setRooms] = useState<RoomRow[]>([])
	const [problems, setProblems] = useState<ProblemRow[]>([])
	const [message, setMessage] = useState('')

	useEffect(() => {
		async function load() {
			const [teamsResult, membersResult, roomsResult, problemsResult] = await Promise.all([
				listTeams(),
				listAllTeamMembers(),
				listRooms(),
				listProblems(),
			])
			setTeams((teamsResult.data ?? []) as TeamRow[])
			setMembers((membersResult.data ?? []) as TeamMemberRow[])
			setRooms((roomsResult.data ?? []) as RoomRow[])
			setProblems((problemsResult.data ?? []) as ProblemRow[])
		}

		void load()
	}, [])

	const membersByTeam = useMemo(() => {
		return members.reduce<Record<string, TeamMemberRow[]>>((accumulator, member) => {
			accumulator[member.team_id] ||= []
			accumulator[member.team_id].push(member)
			return accumulator
		}, {})
	}, [members])

	async function saveTeam(teamId: string, values: Partial<TeamRow>) {
		const { error } = await updateTeam(teamId, values)
		if (error) return setMessage(error.message)
		setTeams((current) => current.map((team) => (team.id === teamId ? { ...team, ...values } : team)))
		setMessage('Team updated.')
	}

	async function deleteTeam(teamId: string) {
		const { error } = await removeTeam(teamId)
		if (error) return setMessage(error.message)
		setTeams((current) => current.filter((team) => team.id !== teamId))
		setMessage('Team removed.')
	}

	return (
		<div className="space-y-6">
			<div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6">
				<div className="text-sm uppercase tracking-[0.3em] text-text-500">Manage Teams</div>
				<h1 className="mt-2 text-2xl font-bold text-text-900">Inspect teams, members, and assignments</h1>
			</div>

			<div className="space-y-4">
				{teams.map((team) => (
					<div key={team.id} className="glass-card rounded-3xl border-white/10 bg-white/5 p-6">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
							<div className="space-y-3">
								<div className="text-xl font-bold text-text-900">{team.team_name}</div>
								<div className="text-sm text-text-500">Leader: {team.leader_id}</div>
								<div className="text-sm text-text-500">Problem: {team.problem_id || '--'}</div>
								<div className="text-sm text-text-500">Room: {team.room_id || '--'}</div>
								<div className="text-sm text-text-500">Seat: {team.seat_number || '--'}</div>
								<div className="text-xs text-text-500">Members: {(membersByTeam[team.id] ?? []).map((member) => member.name).join(', ') || 'No members'}</div>
							</div>

							<div className="grid gap-3 md:grid-cols-3 lg:w-[42rem]">
								<select value={team.room_id ?? ''} onChange={(e) => saveTeam(team.id, { room_id: e.target.value || null })} className="rounded-2xl border border-white/10 bg-bg/70 px-4 py-3 text-sm text-text-900 outline-none">
									<option value="">Assign room</option>
									{rooms.map((room) => <option key={room.id} value={room.id}>{room.block}-{room.room_number}</option>)}
								</select>
								<input value={team.seat_number ?? ''} onChange={(e) => saveTeam(team.id, { seat_number: e.target.value || null })} placeholder="Seat number" className="rounded-2xl border border-white/10 bg-bg/70 px-4 py-3 text-sm text-text-900 outline-none" />
								<select value={team.problem_id ?? ''} onChange={(e) => saveTeam(team.id, { problem_id: e.target.value || null })} className="rounded-2xl border border-white/10 bg-bg/70 px-4 py-3 text-sm text-text-900 outline-none">
									<option value="">Assign problem</option>
									{problems.map((problem) => <option key={problem.id} value={problem.id}>{problem.title}</option>)}
								</select>
							</div>
						</div>
						<div className="mt-4 flex gap-2">
							<button onClick={() => deleteTeam(team.id)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-red-300">Delete team</button>
						</div>
					</div>
				))}
			</div>

			{message ? <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-500">{message}</div> : null}
		</div>
	)
}
