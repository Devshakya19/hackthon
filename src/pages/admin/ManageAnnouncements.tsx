import React, { useEffect, useState } from "react";
import { type AnnouncementRow } from "../../supabase/database";
import {
  createAnnouncement,
  listAnnouncements,
  removeAnnouncement,
  updateAnnouncement,
} from "../../supabase/queries";

const emptyAnnouncement: AnnouncementRow = {
  id: "",
  title: "",
  message: "",
  created_at: new Date().toISOString(),
};

export default function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [form, setForm] = useState<AnnouncementRow>(emptyAnnouncement);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void listAnnouncements().then(({ data }) =>
      setAnnouncements((data ?? []) as AnnouncementRow[])
    );
  }, []);

  async function saveAnnouncement() {
    if (!form.title.trim() || !form.message.trim())
      return setMessage("Title and message are required.");
    if (editingId) {
      const { error } = await updateAnnouncement(editingId, {
        title: form.title.trim(),
        message: form.message.trim(),
      });
      if (error) return setMessage(error.message);
      setAnnouncements((current) =>
        current.map((announcement) =>
          announcement.id === editingId
            ? {
                ...announcement,
                title: form.title.trim(),
                message: form.message.trim(),
              }
            : announcement
        )
      );
      setMessage("Announcement updated.");
    } else {
      const row: AnnouncementRow = {
        id: crypto.randomUUID(),
        title: form.title.trim(),
        message: form.message.trim(),
        created_at: new Date().toISOString(),
      };
      const { error } = await createAnnouncement(row);
      if (error) return setMessage(error.message);
      setAnnouncements((current) => [row, ...current]);
      setMessage("Announcement published.");
    }
    setForm(emptyAnnouncement);
    setEditingId(null);
  }

  async function deleteAnnouncement(announcementId: string) {
    const { error } = await removeAnnouncement(announcementId);
    if (error) return setMessage(error.message);
    setAnnouncements((current) =>
      current.filter((announcement) => announcement.id !== announcementId)
    );
    setMessage("Announcement removed.");
  }

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6">
        <div className="text-sm uppercase tracking-[0.3em] text-text-500">
          Manage Announcements
        </div>
        <h1 className="mt-2 text-2xl font-bold text-text-900">
          Publish live updates
        </h1>
        <div className="mt-6 grid gap-3">
          <input
            value={form.title}
            onChange={(e) =>
              setForm((current) => ({ ...current, title: e.target.value }))
            }
            placeholder="Title"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-900 outline-none"
          />
          <textarea
            value={form.message}
            onChange={(e) =>
              setForm((current) => ({ ...current, message: e.target.value }))
            }
            placeholder="Message"
            className="min-h-28 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-900 outline-none"
          />
          <button
            onClick={saveAnnouncement}
            className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-bg"
          >
            {editingId ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="glass-card rounded-3xl border-white/10 bg-white/5 p-5"
          >
            <div className="text-lg font-bold text-text-900">
              {announcement.title}
            </div>
            <div className="mt-2 text-sm text-text-500">
              {announcement.message}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setEditingId(announcement.id);
                  setForm(announcement);
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-900"
              >
                Edit
              </button>
              <button
                onClick={() => deleteAnnouncement(announcement.id)}
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
