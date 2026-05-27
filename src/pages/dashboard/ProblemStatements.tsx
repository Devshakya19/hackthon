import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { ensureTeamForUser } from "../../supabase/auth";
import {
  getTeamById,
  type ProblemRow,
  type TeamRow,
} from "../../supabase/database";
import {
  assignProblem,
  getTeamByLeaderId,
  listProblems,
  lockProblem,
  releaseExpiredProblemLocks,
  updateTeam,
} from "../../supabase/queries";
import { subscribeToProblems } from "../../supabase/realtime";

export default function ProblemStatements() {
  const { user, profile, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<TeamRow | null>(null);
  const [problems, setProblems] = useState<ProblemRow[]>([]);
  const [message, setMessage] = useState("");
  const [selectedProblem, setSelectedProblem] = useState<ProblemRow | null>(
    null
  );
  const [pendingProblemId, setPendingProblemId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const channel = subscribeToProblems(() => {
      void listProblems().then(({ data }) => {
        if (!active) return;
        setProblems((data ?? []) as ProblemRow[]);
      });
    });

    async function loadProblems() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        await releaseExpiredProblemLocks();
        const baseTeamId = profile?.team_id ?? null;
        let teamResult = baseTeamId
          ? await getTeamById(baseTeamId)
          : await getTeamByLeaderId(user.id);

        if (!teamResult.data) {
          teamResult = await getTeamByLeaderId(user.id);
        }

        if (!teamResult.data && role !== "admin") {
          await ensureTeamForUser(user, profile?.team_name);
          teamResult = await getTeamByLeaderId(user.id);
        }

        const { data } = await listProblems();
        if (!active) return;

        const nextTeam = teamResult.data ?? null;
        setTeam(nextTeam);
        setProblems((data ?? []) as ProblemRow[]);
        setSelectedProblem(
          nextTeam?.problem_id
            ? (data ?? []).find(
                (problem) => problem.id === nextTeam.problem_id
              ) ?? null
            : null
        );
        setPendingProblemId(null);
      } catch (err) {
        console.error("ProblemStatements load error:", err);
        setMessage(
          err instanceof Error ? err.message : "Failed to load problems"
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProblems();
    return () => {
      active = false;
      void channel.unsubscribe();
    };
  }, [profile?.team_id, profile?.team_name, user]);

  // Only team leaders are allowed to unlock/select problems.
  const canManageProblems = role === "leader";
  const visibleProblems = useMemo(
    () =>
      problems.map((problem) => ({
        problem,
        isLockedByOther: Boolean(
          problem.assigned_to && team?.id && problem.assigned_to !== team.id
        ),
        isSelected: selectedProblem?.id === problem.id,
        isPending: pendingProblemId === problem.id,
      })),
    [pendingProblemId, problems, selectedProblem?.id, team?.id]
  );

  async function selectProblem(problem: ProblemRow) {
    if (!team?.id) return setMessage("Team not ready yet.");
    if (!canManageProblems)
      return setMessage("Only team leaders can unlock and select problems.");
    if (problem.assigned_to && problem.assigned_to !== team.id)
      return setMessage("This problem is already reserved by another team.");

    const lockedUntil = new Date(Date.now() + 60_000).toISOString();
    const { error: lockError } = await lockProblem(
      problem.id,
      team.id,
      lockedUntil
    );
    if (lockError) return setMessage(lockError.message);

    setProblems((current) =>
      current.map((item) =>
        item.id === problem.id
          ? {
              ...item,
              locked_by: team.id,
              locked_until: lockedUntil,
              assigned_to: null,
              status: "locked",
            }
          : item
      )
    );
    setPendingProblemId(problem.id);
    setSelectedProblem(problem);
    setMessage(
      `${problem.title} locked for 1 minute. Confirm to submit permanently.`
    );
  }

  async function confirmSelection() {
    if (!team?.id) return setMessage("Team not ready yet.");
    if (!pendingProblemId) return setMessage("Select a problem first.");
    const pendingProblem = problems.find(
      (problem) => problem.id === pendingProblemId
    );
    if (!pendingProblem) return setMessage("Pending problem not found.");

    const { error } = await assignProblem(pendingProblemId, team.id);
    if (error) return setMessage(error.message);

    const { error: teamError } = await updateTeam(team.id, {
      problem_id: pendingProblemId,
    });
    if (teamError) return setMessage(teamError.message);

    setTeam((current) =>
      current ? { ...current, problem_id: pendingProblemId } : current
    );
    setSelectedProblem({
      ...pendingProblem,
      assigned_to: team.id,
      locked_by: team.id,
      status: "assigned",
      locked_until: null,
    });
    setProblems((current) =>
      current.map((item) =>
        item.id === pendingProblemId
          ? {
              ...item,
              assigned_to: team.id,
              locked_by: team.id,
              status: "assigned",
              locked_until: null,
            }
          : item
      )
    );
    setPendingProblemId(null);
    setMessage(`${pendingProblem.title} submitted permanently for your team.`);
  }

  if (loading) {
    return (
      <div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6 text-sm text-text-500">
        Loading problems...
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6">
        <div className="text-sm uppercase tracking-[0.3em] text-text-500">
          Problem Statements
        </div>
        <h1 className="mt-2 text-2xl font-bold text-text-900">
          Review and submit your problem choice
        </h1>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleProblems.map(
            ({ problem, isSelected, isLockedByOther, isPending }) => (
              <button
                key={problem.id}
                onClick={() => selectProblem(problem)}
                disabled={!canManageProblems}
                className={`rounded-3xl border p-5 text-left transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-white/10 bg-bg/70"
                } ${isLockedByOther ? "opacity-70" : ""} ${
                  !canManageProblems ? "cursor-default opacity-80" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-bold text-text-900">
                      {problem.title}
                    </div>
                    <div className="mt-1 text-sm text-text-500">
                      {problem.description}
                    </div>
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Lock className="h-5 w-5 text-text-500" />
                  )}
                </div>
                <div className="mt-4 text-xs text-text-500">
                  {isLockedByOther
                    ? "Reserved by another team"
                    : isPending
                    ? "Locked for 1 minute"
                    : isSelected
                    ? "Selected by your team"
                    : "Available to submit"}
                </div>
              </button>
            )
          )}
        </div>

        {canManageProblems && pendingProblemId ? (
          <button
            onClick={confirmSelection}
            className="mt-6 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-bg"
          >
            Confirm final submission
          </button>
        ) : null}
      </div>

      <div className="space-y-6">
        <div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6">
          <div className="text-sm uppercase tracking-[0.3em] text-text-500">
            Selected Problem
          </div>
          {selectedProblem ? (
            <div className="mt-4 space-y-3">
              <div className="text-xl font-bold text-text-900">
                {selectedProblem.title}
              </div>
              <div className="text-sm text-text-500">
                {selectedProblem.description}
              </div>
              <div className="text-sm text-text-500">
                Status: {selectedProblem.status}
              </div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-text-500">
              No problem selected yet.
            </div>
          )}
        </div>

        <div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6">
          <div className="text-sm uppercase tracking-[0.3em] text-text-500">
            Submission Hint
          </div>
          <div className="mt-4 text-sm text-text-500">
            After the problem is locked in, leaders can confirm it permanently
            and then use the Submission page.
          </div>
        </div>

        {message ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-text-500">
            {message}
          </div>
        ) : null}
      </div>
    </div>
  );
}
