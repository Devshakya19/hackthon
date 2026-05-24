import React, { useEffect, useState } from 'react'
import { type RoomRow, type TeamRow } from '../../supabase/database'
import { listRooms, listTeams, updateTeam } from '../../supabase/queries'

export default function SeatManager() {
	const [teams, setTeams] = useState<TeamRow[]>([])
	const [rooms, setRooms] = useState<RoomRow[]>([])
	const [message, setMessage] = useState('')

	useEffect(() => {
		async function load() {
			const [teamsResult, roomsResult] = await Promise.all([listTeams(), listRooms()])
			setTeams((teamsResult.data ?? []) as TeamRow[])
			setRooms((roomsResult.data ?? []) as RoomRow[])
		}

		void load()
	}, [])

	async function assignSeat(teamId: string, roomId: string, seatNumber: string) {
		const { error } = await updateTeam(teamId, { room_id: roomId || null, seat_number: seatNumber || null })
		if (error) return setMessage(error.message)
		setTeams((current) => current.map((team) => (team.id === teamId ? { ...team, room_id: roomId || null, seat_number: seatNumber || null } : team)))
		setMessage('Seat allocation updated.')
	}

	return (
		<div className="space-y-6">
			<div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6">
				<div className="text-sm uppercase tracking-[0.3em] text-text-500">Seat Manager</div>
				<h1 className="mt-2 text-2xl font-bold text-text-900">Assign rooms and seats</h1>
			</div>

			<div className="space-y-4">
				{teams.map((team) => (
					<div key={team.id} className="glass-card rounded-3xl border-white/10 bg-white/5 p-5">
						<div className="text-lg font-bold text-text-900">{team.team_name}</div>
						<div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
							<select value={team.room_id ?? ''} onChange={(e) => assignSeat(team.id, e.target.value, team.seat_number ?? '')} className="rounded-2xl border border-white/10 bg-bg/70 px-4 py-3 text-sm text-text-900 outline-none">
								<option value="">Select room</option>
								{rooms.map((room) => <option key={room.id} value={room.id}>{room.block}-{room.room_number}</option>)}
							</select>
							<input value={team.seat_number ?? ''} onChange={(e) => assignSeat(team.id, team.room_id ?? '', e.target.value)} placeholder="Seat number" className="rounded-2xl border border-white/10 bg-bg/70 px-4 py-3 text-sm text-text-900 outline-none" />
							<div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-500">Current: {team.room_id || '--'} / {team.seat_number || '--'}</div>
						</div>
					</div>
				))}
			</div>

			{message ? <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-500">{message}</div> : null}
		</div>
	)
}
