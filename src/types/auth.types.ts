import type { Session, User as SupabaseUser } from '@supabase/supabase-js'
import type { ProfileRow, UserRole } from '../supabase/database'

export type AuthSession = Session
export type AuthUser = SupabaseUser
export type AuthProfile = ProfileRow

export type AuthState = {
	session: AuthSession | null
	user: AuthUser | null
	profile: AuthProfile | null
	role: UserRole
	loading: boolean
	isAuthenticated: boolean
}
