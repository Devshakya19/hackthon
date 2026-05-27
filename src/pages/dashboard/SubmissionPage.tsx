import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ensureTeamForUser } from "../../supabase/auth";
import {
  getTeamById,
  type SubmissionRow,
  type TeamRow,
} from "../../supabase/database";
import {
  createSubmission,
  getTeamByLeaderId,
  getSubmissionsByTeam,
} from "../../supabase/queries";

export default function SubmissionPage() {
  const { user, profile, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<TeamRow | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [githubLink, setGithubLink] = useState("");
  const [pptLink, setPptLink] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSubmissions() {
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

        if (!teamResult.data && role !== "admin") {
          await ensureTeamForUser(user, profile?.team_name);
          teamResult = await getTeamByLeaderId(user.id);
        }

        if (!active) return;

        const nextTeam = teamResult.data ?? null;
        setTeam(nextTeam);

        if (nextTeam?.id) {
          const { data } = await getSubmissionsByTeam(nextTeam.id);
          if (!active) return;
          setSubmissions((data ?? []) as SubmissionRow[]);
        } else {
          setSubmissions([]);
        }
      } catch (err) {
        console.error("SubmissionPage load error:", err);
        setMessage(
          err instanceof Error ? err.message : "Failed to load submissions"
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadSubmissions();
    return () => {
      active = false;
    };
  }, [profile?.team_id, profile?.team_name, user]);

  async function submitProject() {
    if (role !== "leader")
      return setMessage("Only the leader can submit the final project.");
    if (!team?.id) return setMessage("Team not ready yet.");
    if (!githubLink.trim()) return setMessage("GitHub link is required.");

    const row: SubmissionRow = {
      id: crypto.randomUUID(),
      team_id: team.id,
      github_link: githubLink.trim(),
      ppt_link: pptLink.trim() || null,
      submitted_at: new Date().toISOString(),
    };

    const { error } = await createSubmission(row);
    if (error) return setMessage(error.message);

    setSubmissions((current) => [row, ...current]);
    setGithubLink("");
    setPptLink("");
    setMessage("Submission saved in Supabase.");
  }

  if (loading) {
    return (
      <div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6 text-sm text-text-500">
        Loading submission page...
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6">
        <div className="text-sm uppercase tracking-[0.3em] text-text-500">
          Submission Page
        </div>
        <h1 className="mt-2 text-2xl font-bold text-text-900">
          Submit your project links
        </h1>

        {role === "leader" ? (
          <div className="mt-6 space-y-4">
            <input
              value={githubLink}
              onChange={(e) => setGithubLink(e.target.value)}
              placeholder="GitHub repository link"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-900 outline-none"
            />
            <input
              value={pptLink}
              onChange={(e) => setPptLink(e.target.value)}
              placeholder="Presentation link (optional)"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-900 outline-none"
            />
            <button
              onClick={submitProject}
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-bg"
            >
              Submit Project
            </button>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-500">
            Members can view submission status only. Only the leader can submit
            the final solution.
          </div>
        )}

        {message ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-500">
            {message}
          </div>
        ) : null}
      </div>

      <div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6">
        <div className="text-sm uppercase tracking-[0.3em] text-text-500">
          Previous Submissions
        </div>
        <div className="mt-4 space-y-3">
          {submissions.length ? (
            submissions.map((submission) => (
              <div
                key={submission.id}
                className="rounded-2xl border border-white/10 bg-bg/60 p-4 text-sm text-text-500"
              >
                <div>GitHub: {submission.github_link || "--"}</div>
                <div>PPT: {submission.ppt_link || "--"}</div>
                <div>
                  Submitted:{" "}
                  {submission.submitted_at || submission.created_at || "--"}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-text-500">No submissions yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
