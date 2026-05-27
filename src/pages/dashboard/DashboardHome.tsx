import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ensureTeamForUser } from "../../supabase/auth";
import {
  getTeamById,
  type AnnouncementRow,
  type ProblemRow,
  type RoomRow,
  type SubmissionRow,
  type TeamMemberRow,
  type TeamRow,
} from "../../supabase/database";
import {
  getTeamByLeaderId,
  getTeamMembers,
  listAnnouncements,
  listProblems,
  listRooms,
  listSubmissions,
} from "../../supabase/queries";
import Skeleton from "../../components/Skeleton";

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="glass-card rounded-3xl border-white/10 bg-white/5 p-5">
      <div className="text-xs uppercase tracking-[0.3em] text-text-500">
        {label}
      </div>
      <div className="mt-3 text-2xl font-bold text-text-900">{value}</div>
      <div className="mt-2 text-sm text-text-500">{hint}</div>
    </div>
  );
}

export default function DashboardHome() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<TeamRow | null>(null);
  const [members, setMembers] = useState<TeamMemberRow[]>([]);
  const [problems, setProblems] = useState<ProblemRow[]>([]);
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadHome() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setMessage("");

      const baseTeamId = profile?.team_id ?? null;
      let teamResult = baseTeamId
        ? await getTeamById(baseTeamId)
        : await getTeamByLeaderId(user.id);

      if (!teamResult.data) {
        teamResult = await getTeamByLeaderId(user.id);
      }

      if (!teamResult.data) {
        try {
          await ensureTeamForUser(user, profile?.team_name);
          teamResult = await getTeamByLeaderId(user.id);
        } catch (error) {
          if (!active) return;
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to load team record"
          );
        }
      }

      const [problemsResult, roomsResult, announcementsResult] =
        await Promise.all([listProblems(), listRooms(), listAnnouncements()]);

      if (!active) return;

      const nextTeam = teamResult.data ?? null;
      setTeam(nextTeam);
      setProblems((problemsResult.data ?? []) as ProblemRow[]);
      setRooms((roomsResult.data ?? []) as RoomRow[]);
      setAnnouncements((announcementsResult.data ?? []) as AnnouncementRow[]);

      if (nextTeam?.id) {
        const [membersResult, submissionsResult] = await Promise.all([
          getTeamMembers(nextTeam.id),
          listSubmissions(nextTeam.id),
        ]);

        if (!active) return;

        setMembers((membersResult.data ?? []) as TeamMemberRow[]);
        setSubmissions((submissionsResult.data ?? []) as SubmissionRow[]);
      } else {
        setMembers([]);
        setSubmissions([]);
      }

      setLoading(false);
    }

    void loadHome();

    return () => {
      active = false;
    };
  }, [profile?.team_id, profile?.team_name, user]);

  const assignedRoom = useMemo(() => {
    if (!team?.room_id) return null;
    return rooms.find((room) => room.id === team.room_id) ?? null;
  }, [rooms, team?.room_id]);

  const selectedProblem = useMemo(() => {
    if (!team?.problem_id) return null;
    return problems.find((problem) => problem.id === team.problem_id) ?? null;
  }, [problems, team?.problem_id]);

  const teamUidDisplay = team?.team_uid?.trim() || "Not available";
  const teamPasswordDisplay = team?.team_password?.trim() || "Not available";

  const seatValue =
    team?.seat_number ||
    (assignedRoom
      ? `${assignedRoom.block}-${assignedRoom.room_number}`
      : "Unassigned");

  if (loading) {
    return (
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-4">
          <div className="p-5">
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="p-5">
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="p-5">
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="p-5">
            <Skeleton className="h-20 w-full" />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="p-6">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <div className="p-6">
              <Skeleton className="h-28 w-full" />
            </div>
            <div className="p-6">
              <Skeleton className="h-36 w-full" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-4">
        <SummaryCard
          label="Team Name"
          value={team?.team_name || profile?.team_name || "Team"}
          hint="Loaded from Supabase"
        />
        <SummaryCard
          label="Team Members"
          value={String(members.length)}
          hint="Names only in overview"
        />
        <SummaryCard
          label="Seat"
          value={seatValue}
          hint="Not editable from overview"
        />
        <SummaryCard
          label="Problem"
          value={selectedProblem?.title || "Not selected"}
          hint={
            selectedProblem
              ? "Stored in teams.problem_id"
              : "No problem selected yet"
          }
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6">
          <div className="text-sm uppercase tracking-[0.3em] text-text-500">
            Team Members
          </div>
          <h2 className="mt-2 text-2xl font-bold text-text-900">
            Current roster
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {members.length ? (
              members.map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl border border-white/10 bg-bg/60 p-4"
                >
                  <div className="text-sm font-semibold text-text-900">
                    {member.name}
                  </div>
                  <div className="text-sm text-text-500">{member.email}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-text-500">
                No team members added yet.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6">
            <div className="text-sm uppercase tracking-[0.3em] text-text-500">
              Quick Status
            </div>
            <div className="mt-4 space-y-3 text-sm text-text-500">
              <div>Announcements: {announcements.length}</div>
              <div>Problems: {problems.length}</div>
              <div>Submissions: {submissions.length}</div>
            </div>
          </div>

          <div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6">
            <div className="text-sm uppercase tracking-[0.3em] text-text-500">
              Team Credentials
            </div>
            <div className="mt-4 space-y-4 text-sm text-text-500">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-text-500/80">
                  Team UID
                </div>
                <div className="mt-2 rounded-2xl border border-white/10 bg-bg/60 px-4 py-3 font-mono text-sm text-text-900">
                  {teamUidDisplay}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-text-500/80">
                  Team Password
                </div>
                <div className="mt-2 rounded-2xl border border-white/10 bg-bg/60 px-4 py-3 font-mono text-sm text-text-900">
                  {teamPasswordDisplay}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6">
            <div className="text-sm uppercase tracking-[0.3em] text-text-500">
              Status
            </div>
            <div className="mt-3 text-sm text-text-500">
              {message ||
                "Use the sidebar to open Team, Problems, Announcements, or Submission pages."}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
