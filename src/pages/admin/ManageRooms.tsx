import React, { useEffect, useState } from 'react'
import { type RoomRow } from '../../supabase/database'
import { createRoom, listRooms, removeRoom, updateRoom } from '../../supabase/queries'

const emptyRoom: RoomRow = { id: '', block: '', room_number: '', capacity: 0 }

export default function ManageRooms() {
	const [rooms, setRooms] = useState<RoomRow[]>([])
	const [form, setForm] = useState<RoomRow>(emptyRoom)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [message, setMessage] = useState('')

	useEffect(() => {
		void listRooms().then(({ data }) => setRooms((data ?? []) as RoomRow[]))
	}, [])

	async function saveRoom() {
		if (!form.block.trim() || !form.room_number.trim()) return setMessage('Block and room number are required.')
		if (editingId) {
			const { error } = await updateRoom(editingId, { block: form.block.trim(), room_number: form.room_number.trim(), capacity: Number(form.capacity) || 0 })
			if (error) return setMessage(error.message)
			setRooms((current) => current.map((room) => room.id === editingId ? { ...room, ...form, capacity: Number(form.capacity) || 0 } : room))
			setMessage('Room updated.')
		} else {
			const row: RoomRow = { id: crypto.randomUUID(), block: form.block.trim(), room_number: form.room_number.trim(), capacity: Number(form.capacity) || 0 }
			const { error } = await createRoom(row)
			if (error) return setMessage(error.message)
			setRooms((current) => [row, ...current])
			setMessage('Room created.')
		}
		setForm(emptyRoom)
		setEditingId(null)
	}

	async function deleteRoom(roomId: string) {
		const { error } = await removeRoom(roomId)
		if (error) return setMessage(error.message)
		setRooms((current) => current.filter((room) => room.id !== roomId))
		setMessage('Room removed.')
	}

	return (
		<div className="space-y-6">
			<div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6">
				<div className="text-sm uppercase tracking-[0.3em] text-text-500">Manage Rooms</div>
				<h1 className="mt-2 text-2xl font-bold text-text-900">Create and maintain rooms</h1>
				<div className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_160px_auto]">
					<input value={form.block} onChange={(e) => setForm((current) => ({ ...current, block: e.target.value }))} placeholder="Block" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-900 outline-none" />
					<input value={form.room_number} onChange={(e) => setForm((current) => ({ ...current, room_number: e.target.value }))} placeholder="Room number" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-900 outline-none" />
					<input type="number" value={form.capacity} onChange={(e) => setForm((current) => ({ ...current, capacity: Number(e.target.value) }))} placeholder="Capacity" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-900 outline-none" />
					<button onClick={saveRoom} className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-bg">{editingId ? 'Update' : 'Create'}</button>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{rooms.map((room) => (
					<div key={room.id} className="glass-card rounded-3xl border-white/10 bg-white/5 p-5">
						<div className="text-lg font-bold text-text-900">{room.block}-{room.room_number}</div>
						<div className="mt-1 text-sm text-text-500">Capacity: {room.capacity}</div>
						<div className="mt-4 flex gap-2">
							<button onClick={() => { setEditingId(room.id); setForm(room) }} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-900">Edit</button>
							<button onClick={() => deleteRoom(room.id)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-red-300">Delete</button>
						</div>
					</div>
				))}
			</div>

			{message ? <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-500">{message}</div> : null}
		</div>
	)
}
