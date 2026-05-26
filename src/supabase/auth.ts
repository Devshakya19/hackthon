import { supabase } from './client'
import { upsertProfileFromUser } from './database'
import { createTeam, createTeamMember, getTeamByHiddenCode, getTeamByLeaderId, getTeamMemberByUserId, updateUserById, getTeamByUIDAndPassword } from './queries'

type PendingOnboarding = {
	role: 'leader' | 'member' | 'admin'
	teamName?: string
	hiddenCode?: string
	teamUid?: string
	teamPassword?: string
	fullName?: string
}

const ONBOARDING_STORAGE_KEY = 'bugbounty.pendingOnboarding'

function readPendingOnboarding(): PendingOnboarding | null {
	if (typeof window === 'undefined') return null
	const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY)
	if (!raw) return null
	try {
		return JSON.parse(raw) as PendingOnboarding
	} catch {
		return null
	}
}

function clearPendingOnboarding() {
	if (typeof window === 'undefined') return
	window.localStorage.removeItem(ONBOARDING_STORAGE_KEY)
}

export function clearStoredOnboarding() {
	clearPendingOnboarding()
}

export function storePendingOnboarding(payload: PendingOnboarding) {
	if (typeof window === 'undefined') return
	window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(payload))
}

export async function signInWithEmail(email: string, password: string) {
	return supabase.auth.signInWithPassword({ email, password })
}

export async function signUpWithEmail(email: string, password: string, payload?: Partial<PendingOnboarding>) {
	return supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				role: payload?.role ?? 'member',
				team_name: payload?.teamName ?? '',
				hidden_code: payload?.hiddenCode ?? '',
				name: payload?.fullName ?? '',
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
	// generate hidden code with prefix
	const prefixes = ['BUG', 'DEBUG', 'TRACE', 'CODE', 'HACK']
	const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
	let hiddenCode = `${prefix}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`
	// ensure unique hidden code
	let attempts = 0
	while (attempts < 6) {
		const exists = await getTeamByHiddenCode(hiddenCode)
		if (!exists.data) break
		hiddenCode = `${prefix}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`
		attempts += 1
	}
	// generate team UID and password
	const teamUid = `T-${crypto.randomUUID().slice(0,6).toUpperCase()}`
	const teamPassword = crypto.randomUUID().slice(0,6)
	// pick a random hidden location
	const locations = ['footer_comment', 'hidden_div', 'meta_tag', 'data_attribute', 'hidden_profile_section']
	const hiddenLocation = locations[Math.floor(Math.random() * locations.length)]
	const memberName = String(user.user_metadata?.name ?? user.user_metadata?.full_name ?? user.email ?? 'Leader')

	const createdTeam = await createTeam({
		id: teamId,
		team_name: nextTeamName,
		leader_id: user.id,
		team_uid: teamUid,
		team_password: teamPassword,
		hidden_code: hiddenCode,
		hidden_location: hiddenLocation,
		is_problem_unlocked: false,
		selected_problem_id: null,
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
		user_id: user.id,
		name: memberName,
		email: user.email ?? '',
	})

	if (createdMember.error) {
		throw createdMember.error
	}

	const updatedUser = await updateUserById(user.id, {
		role: 'leader',
		team_id: teamId,
		hidden_code: hiddenCode,
		selected_problem: null,
	})

	if (updatedUser.error) {
		throw updatedUser.error
	}

	// Ensure the users profile row is up-to-date and visible to clients
	await upsertProfileFromUser(user as any, nextTeamName)

	return createdTeam.data
}

export async function joinTeamForMember(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }, hiddenCode?: string) {
	const nextHiddenCode = hiddenCode?.trim() || String(user.user_metadata?.hidden_code ?? '')
	if (!nextHiddenCode) {
		throw new Error('Hidden code is required for member registration')
	}

	const teamResult = await getTeamByHiddenCode(nextHiddenCode)
	if (!teamResult.data) {
		throw new Error('Invalid hidden code')
	}

	const memberResult = await getTeamMemberByUserId(user.id)
	if (!memberResult.data) {
		const createdMember = await createTeamMember({
			id: crypto.randomUUID(),
			team_id: teamResult.data.id,
			user_id: user.id,
			name: String(user.user_metadata?.name ?? user.user_metadata?.full_name ?? user.email ?? 'Member'),
			email: user.email ?? '',
		})

		if (createdMember.error) {
			throw createdMember.error
		}
	}

	const updatedUser = await updateUserById(user.id, {
		role: 'member',
		team_id: teamResult.data.id,
		hidden_code: teamResult.data.hidden_code,
		selected_problem: null,
	})

	if (updatedUser.error) {
		throw updatedUser.error
	}

	return teamResult.data
}

export async function joinTeamByUidAndPassword(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }, teamUid?: string, teamPassword?: string) {
	const uid = teamUid?.trim() || String(user.user_metadata?.team_uid ?? '')
	const pwd = teamPassword?.trim() || String(user.user_metadata?.team_password ?? '')
	if (!uid || !pwd) throw new Error('Team UID and password are required')

	const teamResult = await getTeamByUIDAndPassword(uid, pwd)
	if (!teamResult.data) throw new Error('Invalid team credentials')

	const team = teamResult.data
	const memberResult = await getTeamMemberByUserId(user.id)
	if (!memberResult.data) {
		const createdMember = await createTeamMember({
			id: crypto.randomUUID(),
			team_id: team.id,
			user_id: user.id,
			name: String(user.user_metadata?.name ?? user.user_metadata?.full_name ?? user.email ?? 'Member'),
			email: user.email ?? '',
		})

		if (createdMember.error) throw createdMember.error
	}

	const updatedUser = await updateUserById(user.id, {
		role: 'member',
		team_id: team.id,
		hidden_code: team.hidden_code,
		selected_problem: null,
	})

	if (updatedUser.error) throw updatedUser.error

	return team
}

export async function completePendingOnboarding(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }) {
	const pending = readPendingOnboarding()
	if (!pending) return null

	try {
		if (pending.role === 'leader') {
			const team = await ensureTeamForUser(user, pending.teamName)
			clearPendingOnboarding()
			return team
		}

		if (pending.role === 'member') {
			let team
			if (pending.teamUid && pending.teamPassword) {
				team = await joinTeamByUidAndPassword(user, pending.teamUid, pending.teamPassword)
			} else {
				team = await joinTeamForMember(user, pending.hiddenCode)
			}
			clearPendingOnboarding()
			return team
		}

		const updatedUser = await updateUserById(user.id, { role: 'admin' })
		if (updatedUser.error) {
			throw updatedUser.error
		}
		clearPendingOnboarding()
		return updatedUser.data
	} catch (error) {
		clearPendingOnboarding()
		throw error
	}
}