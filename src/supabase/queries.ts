import { supabase } from "./client";
import type {
  AnnouncementRow,
  ProblemRow,
  RoomRow,
  SubmissionRow,
  TeamMemberRow,
  TeamRow,
  UserRow,
} from "./database";

export async function createUser(user: UserRow) {
  return supabase.from("users").insert(user);
}

export async function upsertUser(user: UserRow) {
  return supabase.from("users").upsert(user, { onConflict: "id" });
}

export async function getUserById(id: string) {
  return supabase.from("users").select("*").eq("id", id).single();
}

export async function updateUserById(id: string, values: Partial<UserRow>) {
  return supabase.from("users").update(values).eq("id", id).select().single();
}

export async function createTeam(team: TeamRow) {
  return supabase.from("teams").insert(team).select().single();
}

export async function getTeamByUIDAndPassword(
  teamUid: string,
  teamPassword: string
) {
  return supabase
    .from("teams")
    .select("*")
    .eq("team_uid", teamUid)
    .eq("team_password", teamPassword)
    .maybeSingle();
}

export async function getTeamByLeaderId(leaderId: string) {
  return supabase
    .from("teams")
    .select("*")
    .eq("leader_id", leaderId)
    .maybeSingle();
}

export async function updateTeam(teamId: string, values: Partial<TeamRow>) {
  return supabase.from("teams").update(values).eq("id", teamId);
}

export async function getTeam(teamId: string) {
  return supabase.from("teams").select("*").eq("id", teamId).single();
}

export async function addTeamMember(member: TeamMemberRow) {
  return supabase.from("team_members").insert(member);
}

export async function createTeamMember(member: TeamMemberRow) {
  return supabase.from("team_members").insert(member).select().single();
}

export async function getTeamMemberByUserId(userId: string) {
  return supabase
    .from("team_members")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
}

export async function updateTeamMember(
  memberId: string,
  values: Partial<TeamMemberRow>
) {
  return supabase.from("team_members").update(values).eq("id", memberId);
}

export async function removeTeamMember(memberId: string) {
  return supabase.from("team_members").delete().eq("id", memberId);
}

export async function listTeamMembers(teamId: string) {
  return supabase.from("team_members").select("*").eq("team_id", teamId);
}

export async function getTeamMembers(teamId: string) {
  return listTeamMembers(teamId);
}

export async function listProblems() {
  return supabase
    .from("problems")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function getProblem(problemId: string) {
  return supabase.from("problems").select("*").eq("id", problemId).single();
}

export async function lockProblem(
  problemId: string,
  teamId: string,
  lockedUntil?: string
) {
  return supabase
    .from("problems")
    .update({
      status: "locked",
      locked_by: teamId,
      assigned_to: null,
      locked_until: lockedUntil ?? null,
    })
    .eq("id", problemId);
}

export async function assignProblem(problemId: string, teamId: string) {
  return supabase
    .from("problems")
    .update({
      status: "assigned",
      locked_by: teamId,
      assigned_to: teamId,
      locked_until: null,
    })
    .eq("id", problemId);
}

export async function listRooms() {
  return supabase
    .from("rooms")
    .select("*")
    .order("block", { ascending: true })
    .order("room_number", { ascending: true });
}

export async function createRoom(room: RoomRow) {
  return supabase.from("rooms").insert(room);
}

export async function updateRoom(roomId: string, values: Partial<RoomRow>) {
  return supabase.from("rooms").update(values).eq("id", roomId);
}

export async function removeRoom(roomId: string) {
  return supabase.from("rooms").delete().eq("id", roomId);
}

export async function listAnnouncements() {
  return supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function createAnnouncement(announcement: AnnouncementRow) {
  return supabase.from("announcements").insert(announcement);
}

export async function updateAnnouncement(
  announcementId: string,
  values: Partial<AnnouncementRow>
) {
  return supabase.from("announcements").update(values).eq("id", announcementId);
}

export async function removeAnnouncement(announcementId: string) {
  return supabase.from("announcements").delete().eq("id", announcementId);
}

export async function createProblem(problem: ProblemRow) {
  return supabase.from("problems").insert(problem);
}

export async function updateProblem(
  problemId: string,
  values: Partial<ProblemRow>
) {
  return supabase.from("problems").update(values).eq("id", problemId);
}

export async function removeProblem(problemId: string) {
  return supabase.from("problems").delete().eq("id", problemId);
}

export async function listTeams() {
  return supabase
    .from("teams")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function removeTeam(teamId: string) {
  return supabase.from("teams").delete().eq("id", teamId);
}

export async function listAllTeamMembers() {
  return supabase
    .from("team_members")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function deleteTeamMemberByUserId(userId: string) {
  return supabase.from("team_members").delete().eq("user_id", userId);
}

export async function listSubmissions(teamId: string) {
  return supabase
    .from("submissions")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });
}

export async function getSubmissionsByTeam(teamId: string) {
  return listSubmissions(teamId);
}

export async function createSubmission(submission: SubmissionRow) {
  return supabase.from("submissions").insert(submission);
}

export async function updateSeatAllocation(
  userId: string,
  seatId: string,
  selectedProblem?: string
) {
  return supabase
    .from("users")
    .update({ seat_id: seatId, selected_problem: selectedProblem ?? null })
    .eq("id", userId);
}

export async function releaseExpiredProblemLocks() {
  const nowIso = new Date().toISOString();
  return supabase
    .from("problems")
    .update({ status: "available", locked_by: null, locked_until: null })
    .eq("status", "locked")
    .lt("locked_until", nowIso);
}

export async function clearAllProblemLocks() {
  return supabase.from("problems").update({
    status: "available",
    locked_by: null,
    assigned_to: null,
    locked_until: null,
  });
}
