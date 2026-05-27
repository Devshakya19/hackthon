import React, { useEffect, useState } from "react";
import { PencilLine, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { ensureTeamForUser } from "../../supabase/auth";
import {
  getTeamById,
  type TeamMemberRow,
  type TeamRow,
} from "../../supabase/database";
import {
  addTeamMember,
  getTeamByLeaderId,
  getTeamMembers,
  removeTeamMember,
  updateTeam,
  updateTeamMember,
} from "../../supabase/queries";

type MemberForm = { name: string; email: string };

export default function TeamPage() {
  const { user, profile, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<TeamRow | null>(null);
  const [members, setMembers] = useState<TeamMemberRow[]>([]);
  const [teamName, setTeamName] = useState("");
  const [newMember, setNewMember] = useState<MemberForm>({
    name: "",
    email: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<MemberForm>({
    name: "",
    email: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTeam() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const baseTeamId = profile?.team_id ?? null;
        let teamResult = baseTeamId
          ? await getTeamById(baseTeamId)
          : await getTeamByLeaderId(user.id);

        if (!teamResult.data) {
          teamResult = await getTeamByLeaderId(user.id);
        }

        // Don't auto-create a team for admins — admins manage teams from the admin panel only.
        if (!teamResult.data && role !== "admin") {
          await ensureTeamForUser(user, profile?.team_name);
          teamResult = await getTeamByLeaderId(user.id);
        }

        if (!active) return;

        const nextTeam = teamResult.data ?? null;
        setTeam(nextTeam);
        setTeamName(nextTeam?.team_name || profile?.team_name || "");

        if (nextTeam?.id) {
          const { data } = await getTeamMembers(nextTeam.id);
          if (!active) return;
          setMembers((data ?? []) as TeamMemberRow[]);
        } else {
          setMembers([]);
        }
      } catch (err) {
        console.error("TeamPage load error:", err);
        setMessage(err instanceof Error ? err.message : "Failed to load team");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadTeam();

    return () => {
      active = false;
    };
  }, [profile?.team_id, profile?.team_name, user, role]);

  async function saveTeamName() {
    if (!team?.id) return setMessage("Team not found.");
    const { error } = await updateTeam(team.id, {
      team_name: teamName.trim() || team.team_name,
    });
    if (error) return setMessage(error.message);
    setTeam((current) =>
      current
        ? { ...current, team_name: teamName.trim() || current.team_name }
        : current
    );
    setMessage("Team name updated.");
  }

  async function addMember() {
    if (!team?.id) return setMessage("Team not found.");
    if (!newMember.name.trim()) return setMessage("Member name is required.");
    const row: TeamMemberRow = {
      id: crypto.randomUUID(),
      team_id: team.id,
      name: newMember.name.trim(),
      email: newMember.email.trim() || "member@amity.edu",
    };
    const { error } = await addTeamMember(row);
    if (error) return setMessage(error.message);
    setMembers((current) => [...current, row]);
    setNewMember({ name: "", email: "" });
    setMessage("Member added.");
  }

  async function saveMember(memberId: string) {
    const { error } = await updateTeamMember(memberId, {
      name: editingMember.name.trim(),
      email: editingMember.email.trim(),
    });
    if (error) return setMessage(error.message);
    setMembers((current) =>
      current.map((member) =>
        member.id === memberId ? { ...member, ...editingMember } : member
      )
    );
    setEditingId(null);
    setEditingMember({ name: "", email: "" });
    setMessage("Member updated.");
  }

  async function deleteMember(memberId: string) {
    const { error } = await removeTeamMember(memberId);
    if (error) return setMessage(error.message);
    setMembers((current) => current.filter((member) => member.id !== memberId));
    setMessage("Member removed.");
  }

  if (loading) {
    return (
      <div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6 text-sm text-text-500">
        Loading team...
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm uppercase tracking-[0.3em] text-text-500">
            Team Page
          </div>
          <h1 className="mt-2 text-2xl font-bold text-text-900">
            {role === "leader" ? "Manage your team" : "View your team"}
          </h1>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-text-500">
          {members.length} members
        </div>
      </div>

      {role === "leader" ? (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
            <input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-900 outline-none"
              placeholder="Team name"
            />
            <button
              onClick={saveTeamName}
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-bg"
            >
              Save team name
            </button>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <input
              value={newMember.name}
              onChange={(e) =>
                setNewMember((current) => ({
                  ...current,
                  name: e.target.value,
                }))
              }
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-900 outline-none"
              placeholder="Member name"
            />
            <input
              value={newMember.email}
              onChange={(e) =>
                setNewMember((current) => ({
                  ...current,
                  email: e.target.value,
                }))
              }
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-900 outline-none"
              placeholder="Member email"
            />
            <button
              onClick={addMember}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-bg"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </>
      ) : null}

      <div className="mt-6 space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="rounded-2xl border border-white/10 bg-bg/60 p-4"
          >
            {editingId === member.id ? (
              role === "leader" ? (
                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <input
                    value={editingMember.name}
                    onChange={(e) =>
                      setEditingMember((current) => ({
                        ...current,
                        name: e.target.value,
                      }))
                    }
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-900 outline-none"
                  />
                  <input
                    value={editingMember.email}
                    onChange={(e) =>
                      setEditingMember((current) => ({
                        ...current,
                        email: e.target.value,
                      }))
                    }
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-900 outline-none"
                  />
                  <button
                    onClick={() => saveMember(member.id)}
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-bg"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="text-sm text-text-500">
                  Read only for members and admins.
                </div>
              )
            ) : (
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-semibold text-text-900">
                    {member.name}
                  </div>
                  <div className="text-sm text-text-500">{member.email}</div>
                </div>
                {role === "leader" ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingId(member.id);
                        setEditingMember({
                          name: member.name,
                          email: member.email,
                        });
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-text-900"
                    >
                      <PencilLine className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMember(member.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>

      {message ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-500">
          {message}
        </div>
      ) : null}
    </div>
  );
}
