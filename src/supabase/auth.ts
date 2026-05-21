import { supabase } from './client'
import { upsertProfileFromUser } from './database'
import { createTeam, createTeamMember, getTeamByLeaderId, updateUserById } from './queries'

export async function signInWithEmail(email: string, password: string) {
	return supabase.auth.signInWithPassword({ email, password })
}

export async function signUpWithEmail(email: string, password: string, teamName?: string) {
	return supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				team_name: teamName ?? '',
			},
		},
	})
}

export async function signOutUser() {
	return supabase.auth.signOut()
}

export async function resendVerificationEmail(email: string) {
	return supabase.auth.resend({
		type: 'signup',
		email,
	})
}

export async function sendPasswordResetEmail(email: string) {
	return supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${window.location.origin}/reset-password`,
	})
}

export async function getCurrentSession() {
	return supabase.auth.getSession()
}

export async function syncProfileFromAuth(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }, teamName?: string) {
	return upsertProfileFromUser(user as any, teamName)
}

export async function ensureTeamForUser(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }, teamName?: string) {
	const existingTeam = await getTeamByLeaderId(user.id)
	if (existingTeam.data) {
		return existingTeam.data
	}

	const nextTeamName = teamName?.trim() || String(user.user_metadata?.team_name ?? user.user_metadata?.name ?? user.email ?? 'Team')
	const teamId = crypto.randomUUID()
	const hiddenCode = `${nextTeamName.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 6) || 'TEAM'}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`
	const memberName = String(user.user_metadata?.name ?? user.user_metadata?.full_name ?? user.email ?? 'Leader')

	const createdTeam = await createTeam({
		id: teamId,
		team_name: nextTeamName,
		leader_id: user.id,
		room_id: null,
		seat_number: null,
		problem_id: null,
	})

	if (createdTeam.error) {
		throw createdTeam.error
	}

	const createdMember = await createTeamMember({
		id: crypto.randomUUID(),
		team_id: teamId,
		name: memberName,
		email: user.email ?? '',
	})

	if (createdMember.error) {
		throw createdMember.error
	}

	const updatedUser = await updateUserById(user.id, {
		team_id: teamId,
		hidden_code: hiddenCode,
		selected_problem: null,
	})

	if (updatedUser.error) {
		throw updatedUser.error
	}

	return createdTeam.data
}