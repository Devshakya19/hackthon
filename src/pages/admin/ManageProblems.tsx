import React, { useEffect, useState } from "react";
import { type ProblemRow } from "../../supabase/database";
import {
  createProblem,
  listProblems,
  removeProblem,
  updateProblem,
} from "../../supabase/queries";

const emptyProblem: ProblemRow = {
  id: "",
  title: "",
  description: "",
  status: "available",
  locked_by: null,
  assigned_to: null,
  locked_until: null,
};

export default function ManageProblems() {
  const [problems, setProblems] = useState<ProblemRow[]>([]);
  const [form, setForm] = useState<ProblemRow>(emptyProblem);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void listProblems().then(({ data }) =>
      setProblems((data ?? []) as ProblemRow[])
    );
  }, []);

  async function saveProblem() {
    if (!form.title.trim() || !form.description.trim())
      return setMessage("Title and description are required.");
    if (editingId) {
      const { error } = await updateProblem(editingId, {
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
      });
      if (error) return setMessage(error.message);
      setProblems((current) =>
        current.map((problem) =>
          problem.id === editingId
            ? {
                ...problem,
                title: form.title.trim(),
                description: form.description.trim(),
                status: form.status,
              }
            : problem
        )
      );
      setMessage("Problem updated.");
    } else {
      const row: ProblemRow = {
        ...form,
        id: crypto.randomUUID(),
        title: form.title.trim(),
        description: form.description.trim(),
      };
      const { error } = await createProblem(row);
      if (error) return setMessage(error.message);
      setProblems((current) => [row, ...current]);
      setMessage("Problem created.");
    }
    setForm(emptyProblem);
    setEditingId(null);
  }

  async function deleteProblem(problemId: string) {
    const { error } = await removeProblem(problemId);
    if (error) return setMessage(error.message);
    setProblems((current) =>
      current.filter((problem) => problem.id !== problemId)
    );
    setMessage("Problem removed.");
  }

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6">
        <div className="text-sm uppercase tracking-[0.3em] text-text-500">
          Manage Problems
        </div>
        <h1 className="mt-2 text-2xl font-bold text-text-900">
          Create and publish problem statements
        </h1>
        <div className="mt-6 grid gap-3">
          <input
            value={form.title}
            onChange={(e) =>
              setForm((current) => ({ ...current, title: e.target.value }))
            }
            placeholder="Problem title"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-900 outline-none"
          />
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                description: e.target.value,
              }))
            }
            placeholder="Problem description"
            className="min-h-32 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-900 outline-none"
          />
          <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <select
              value={form.status}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  status: e.target.value as ProblemRow["status"],
                }))
              }
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-900 outline-none"
            >
              <option value="available">available</option>
              <option value="locked">locked</option>
              <option value="assigned">assigned</option>
              <option value="completed">completed</option>
            </select>
            <button
              onClick={saveProblem}
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-bg"
            >
              {editingId ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {problems.map((problem) => (
          <div
            key={problem.id}
            className="glass-card rounded-3xl border-white/10 bg-white/5 p-5"
          >
            <div className="text-lg font-bold text-text-900">
              {problem.title}
            </div>
            <div className="mt-2 text-sm text-text-500">
              {problem.description}
            </div>
            <div className="mt-3 text-xs text-text-500">
              Status: {problem.status}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setEditingId(problem.id);
                  setForm(problem);
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-900"
              >
                Edit
              </button>
              <button
                onClick={() => deleteProblem(problem.id)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-red-300"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {message ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-500">
          {message}
        </div>
      ) : null}
    </div>
  );
}
