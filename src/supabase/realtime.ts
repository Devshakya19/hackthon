import { supabase } from './client'

export function subscribeToAnnouncements(onChange: () => void) {
	return supabase.channel('announcements-live').on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, onChange).subscribe()
}

export function subscribeToProblems(onChange: () => void) {
	return supabase.channel('problems-live').on('postgres_changes', { event: '*', schema: 'public', table: 'problems' }, onChange).subscribe()
}

export function subscribeToTeams(onChange: () => void) {
	return supabase.channel('teams-live').on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, onChange).subscribe()
}