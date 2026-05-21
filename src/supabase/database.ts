import { supabase } from './client'
import type { User } from '@supabase/supabase-js'

export type UserRole = 'student' | 'coordinator' | 'faculty' | 'hoi'

export type UserRow = {
	id: string
	name: string
	email: string
	role: UserRole
	team_name?: string
	team_id: string | null
	hidden_code: string | null
	seat_id: string | null
	selected_problem: string | null
	created_at?: string
	updated_at?: string
}

export type TeamRow = {
	id: string
	team_name: string
	leader_id: string
	room_id: string | null
	seat_number: string | null
	problem_id: string | null
	created_at?: string
	updated_at?: string
}

export type TeamMemberRow = {
	id: string
	team_id: string
	name: string
	email: string
	created_at?: string
	updated_at?: string
}

export type ProblemRow = {
	id: string
	title: string
	description: string
	status: 'available' | 'locked' | 'assigned' | 'completed'
	locked_by: string | null
	assigned_to: string | null
	locked_until: string | null
	created_at?: string
	updated_at?: string
}

export type RoomRow = {
	id: string
	block: string
	room_number: string
	capacity: number
	created_at?: string
	updated_at?: string
}

export type AnnouncementRow = {
	id: string
	title: string
	message: string
	created_at: string
}

export type SubmissionRow = {
	id: string
	team_id: string
	github_link: string | null
	ppt_link: string | null
	submitted_at: string | null
	created_at?: string
	updated_at?: string
}

export type ProfileRow = UserRow

function resolveRole(user: User): UserRole {
	const role = user.user_metadata?.role
	if (role === 'coordinator' || role === 'faculty' || role === 'hoi') {
		return role
	}
	return 'student'
}

export function mapSupabaseUserToUserRow(user: User, teamName?: string): UserRow {
	return {
		id: user.id,
		name: String(user.user_metadata?.name ?? user.user_metadata?.full_name ?? user.email ?? 'User'),
		email: user.email ?? '',
		role: resolveRole(user),
		team_name: teamName ?? String(user.user_metadata?.team_name ?? ''),
		team_id: teamName ? teamName : (user.user_metadata?.team_id as string | undefined) ?? null,
		hidden_code: (user.user_metadata?.hidden_code as string | undefined) ?? null,
		seat_id: (user.user_metadata?.seat_id as string | undefined) ?? null,
		selected_problem: (user.user_metadata?.selected_problem as string | undefined) ?? null,
	}
}

export async function upsertProfileFromUser(user: User, teamName?: string) {
	const profile = mapSupabaseUserToUserRow(user, teamName)
	const { team_name: _teamName, ...databaseRow } = profile
	return supabase.from('users').upsert(databaseRow, { onConflict: 'id' })
}

export async function getProfileById(userId: string) {
	return supabase.from('users').select('*').eq('id', userId).single()
}

export async function getTeamById(teamId: string) {
	return supabase.from('teams').select('*').eq('id', teamId).single()
}

export async function getTeamMembers(teamId: string) {
	return supabase.from('team_members').select('*').eq('team_id', teamId).order('created_at', { ascending: true })
}

export async function getProblems() {
	return supabase.from('problems').select('*').order('created_at', { ascending: false })
}

export async function getRooms() {
	return supabase.from('rooms').select('*').order('block', { ascending: true }).order('room_number', { ascending: true })
}

export async function getAnnouncements() {
	return supabase.from('announcements').select('*').order('created_at', { ascending: false })
}

export async function getSubmissionsByTeam(teamId: string) {
	return supabase.from('submissions').select('*').eq('team_id', teamId).order('created_at', { ascending: false })
}