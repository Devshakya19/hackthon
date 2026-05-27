import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ensureTeamForUser } from "../../supabase/auth";
import { type AnnouncementRow } from "../../supabase/database";
import { getTeamByLeaderId, listAnnouncements } from "../../supabase/queries";
import { subscribeToAnnouncements } from "../../supabase/realtime";

export default function Announcements() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    const channel = subscribeToAnnouncements(() => {
      void listAnnouncements().then(({ data }) => {
        if (!active) return;
        setAnnouncements((data ?? []) as AnnouncementRow[]);
      });
    });

    async function loadAnnouncements() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data } = await listAnnouncements();
      if (!active) return;

      setAnnouncements((data ?? []) as AnnouncementRow[]);

      if (!profile?.team_id) {
        try {
          await ensureTeamForUser(user, profile?.team_name);
          await getTeamByLeaderId(user.id);
        } catch (error) {
          if (!active) return;
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to load team context"
          );
        }
      }

      setLoading(false);
    }

    void loadAnnouncements();
    return () => {
      active = false;
      void channel.unsubscribe();
    };
  }, [profile?.team_id, profile?.team_name, user]);

  if (loading) {
    return (
      <div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6 text-sm text-text-500">
        Loading announcements...
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6">
      <div className="text-sm uppercase tracking-[0.3em] text-text-500">
        Announcements
      </div>
      <h1 className="mt-2 text-2xl font-bold text-text-900">
        Latest updates from the organizers
      </h1>

      <div className="mt-6 space-y-4">
        {announcements.length ? (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="rounded-2xl border border-white/10 bg-bg/60 p-4"
            >
              <div className="text-lg font-bold text-text-900">
                {announcement.title}
              </div>
              <div className="mt-2 text-sm text-text-500">
                {announcement.message}
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-text-500">No announcements yet.</div>
        )}
      </div>

      {message ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-500">
          {message}
        </div>
      ) : null}
    </div>
  );
}
