import { supabase } from './client'
import type {
	AnnouncementRow,
	ProblemRow,
	RoomRow,
	SubmissionRow,
	TeamMemberRow,
	TeamRow,
	UserRow,
} from './database'

export async function createUser(user: UserRow) {
	return supabase.from('users').insert(user)
}

export async function upsertUser(user: UserRow) {
	return supabase.from('users').upsert(user, { onConflict: 'id' })
}

export async function getUserById(id: string) {
	return supabase.from('users').select('*').eq('id', id).single()
}

export async function updateUserById(id: string, values: Partial<UserRow>) {
	return supabase.from('users').update(values).eq('id', id)
}

export async function createTeam(team: TeamRow) {
	return supabase.from('teams').insert(team)
}

export async function getTeamByLeaderId(leaderId: string) {
	return supabase.from('teams').select('*').eq('leader_id', leaderId).maybeSingle()
}

export async function updateTeam(teamId: string, values: Partial<TeamRow>) {
	return supabase.from('teams').update(values).eq('id', teamId)
}

export async function getTeam(teamId: string) {
	return supabase.from('teams').select('*').eq('id', teamId).single()
}

export async function addTeamMember(member: TeamMemberRow) {
	return supabase.from('team_members').insert(member)
}

export async function createTeamMember(member: TeamMemberRow) {
	return supabase.from('team_members').insert(member)
}

export async function updateTeamMember(memberId: string, values: Partial<TeamMemberRow>) {
	return supabase.from('team_members').update(values).eq('id', memberId)
}

export async function removeTeamMember(memberId: string) {
	return supabase.from('team_members').delete().eq('id', memberId)
}

export async function listTeamMembers(teamId: string) {
	return supabase.from('team_members').select('*').eq('team_id', teamId)
}

export async function getTeamMembers(teamId: string) {
	return listTeamMembers(teamId)
}

export async function listProblems() {
	return supabase.from('problems').select('*').order('created_at', { ascending: false })
}

export async function getProblem(problemId: string) {
	return supabase.from('problems').select('*').eq('id', problemId).single()
}

export async function lockProblem(problemId: string, teamId: string, lockedUntil?: string) {
	return supabase.from('problems').update({ status: 'locked', locked_by: teamId, assigned_to: null, locked_until: lockedUntil ?? null }).eq('id', problemId)
}

export async function assignProblem(problemId: string, teamId: string) {
	return supabase.from('problems').update({ status: 'assigned', locked_by: teamId, assigned_to: teamId, locked_until: null }).eq('id', problemId)
}

export async function listRooms() {
	return supabase.from('rooms').select('*').order('block', { ascending: true }).order('room_number', { ascending: true })
}

export async function listAnnouncements() {
	return supabase.from('announcements').select('*').order('created_at', { ascending: false })
}

export async function createAnnouncement(announcement: AnnouncementRow) {
	return supabase.from('announcements').insert(announcement)
}

export async function listSubmissions(teamId: string) {
	return supabase.from('submissions').select('*').eq('team_id', teamId).order('created_at', { ascending: false })
}

export async function createSubmission(submission: SubmissionRow) {
	return supabase.from('submissions').insert(submission)
}

export async function updateSeatAllocation(userId: string, seatId: string, hiddenCode?: string, selectedProblem?: string) {
	return supabase.from('users').update({ seat_id: seatId, hidden_code: hiddenCode ?? null, selected_problem: selectedProblem ?? null }).eq('id', userId)
}
