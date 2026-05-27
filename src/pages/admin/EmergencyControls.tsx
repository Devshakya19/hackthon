import React, { useState } from "react";
import {
  clearAllProblemLocks,
  releaseExpiredProblemLocks,
} from "../../supabase/queries";

export default function EmergencyControls() {
  const [message, setMessage] = useState("");

  async function releaseExpired() {
    const { error } = await releaseExpiredProblemLocks();
    setMessage(error ? error.message : "Expired locks released.");
  }

  async function clearAllLocks() {
    const { error } = await clearAllProblemLocks();
    setMessage(error ? error.message : "All problem locks cleared.");
  }

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6">
        <div className="text-sm uppercase tracking-[0.3em] text-text-500">
          Emergency Controls
        </div>
        <h1 className="mt-2 text-2xl font-bold text-text-900">
          Unlock or reset the platform state
        </h1>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={releaseExpired}
            className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-bg"
          >
            Release expired locks
          </button>
          <button
            onClick={clearAllLocks}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-text-900"
          >
            Clear all locks
          </button>
        </div>
      </div>

      {message ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-500">
          {message}
        </div>
      ) : null}
    </div>
  );
}
