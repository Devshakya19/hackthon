import React from "react";
import { Link } from "react-router-dom";

const cards = [
  {
    title: "Manage Rooms",
    description: "Create rooms, capacities, and seat allocations.",
    to: "/dashboard/admin/rooms",
  },
  {
    title: "Manage Problems",
    description: "Create, lock, override, and publish problems.",
    to: "/dashboard/admin/problems",
  },
  {
    title: "Manage Teams",
    description: "Inspect teams, members, and assignment state.",
    to: "/dashboard/admin/teams",
  },
  {
    title: "Announcements",
    description: "Publish event-wide updates in real time.",
    to: "/dashboard/admin/announcements",
  },
  {
    title: "Seat Manager",
    description: "Assign rooms and seat numbers.",
    to: "/dashboard/admin/seating",
  },
  {
    title: "Emergency Controls",
    description: "Release or clear problem locks instantly.",
    to: "/dashboard/admin/emergency",
  },
  {
    title: "Judging",
    description: "Prepare the scoring and review workflow.",
    to: "/dashboard/admin/judging",
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl border-white/10 bg-white/5 p-6">
        <div className="text-sm uppercase tracking-[0.3em] text-text-500">
          Admin Panel
        </div>
        <h1 className="mt-2 text-2xl font-bold text-text-900">
          Platform control center
        </h1>
        <p className="mt-3 text-sm text-text-500">
          This dashboard is the foundation for room, problem, team,
          announcement, and override management.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.to}
            className="glass-card rounded-3xl border-white/10 bg-white/5 p-6 transition-transform hover:-translate-y-1"
          >
            <div className="text-lg font-bold text-text-900">{card.title}</div>
            <div className="mt-2 text-sm text-text-500">{card.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
