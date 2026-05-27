import React, { useState } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Megaphone,
  FileUp,
  Shield,
  Menu,
  Bell,
  Search,
  LogOut,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

type IconType = React.ElementType;

const el: any = React.createElement;

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { profile, role, signOut } = useAuth();
  const displayName = profile?.email
    ? profile.email.split("@")[0]
    : "Aman Leader";
  const displayRole = role ? role.toUpperCase() : "STUDENT";
  const navItems: Array<{ id: string; label: string; icon: IconType }> = [
    { id: "/dashboard", label: "Overview", icon: LayoutDashboard },
    ...(role === "leader" || role === "admin"
      ? [{ id: "/dashboard/team", label: "Team", icon: Users }]
      : []),
    { id: "/dashboard/problems", label: "Problems", icon: ShieldCheck },
    { id: "/dashboard/announcements", label: "Announcements", icon: Megaphone },
    ...(role === "leader"
      ? [{ id: "/dashboard/submission", label: "Submission", icon: FileUp }]
      : []),
    ...(role === "admin"
      ? [{ id: "/dashboard/admin", label: "Admin", icon: Shield }]
      : []),
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const sidebar = el(
    "aside",
    {
      className:
        "hidden lg:flex fixed inset-y-0 left-0 w-72 flex-col border-r border-white/10 bg-bg/95 backdrop-blur-xl px-5 py-6",
    },
    el(
      "div",
      {
        className: "flex items-center gap-3 px-2 pb-6 border-b border-white/10",
      },
      el(
        "div",
        {
          className:
            "flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-bg font-black shadow-[0_0_24px_rgba(0,240,255,0.25)]",
        },
        "32"
      ),
      el(
        "div",
        null,
        el(
          "div",
          { className: "text-lg font-bold text-text-900" },
          "Hackathon Hub"
        ),
        el(
          "div",
          { className: "text-xs uppercase tracking-[0.28em] text-text-500" },
          "Role Dashboard"
        )
      )
    ),
    el(
      "div",
      { className: "mt-6 rounded-3xl border border-white/10 bg-white/5 p-4" },
      el(
        "div",
        { className: "text-xs uppercase tracking-[0.3em] text-text-500" },
        "Active Role"
      ),
      el(
        "div",
        { className: "mt-2 flex items-center justify-between" },
        el(
          "div",
          null,
          el(
            "div",
            { className: "text-sm font-semibold text-text-900" },
            displayRole
          ),
          el(
            "div",
            { className: "text-xs text-text-500" },
            role === "admin"
              ? "Admin access"
              : role === "leader"
              ? "Team leader access"
              : "Member access"
          )
        ),
        el(
          "span",
          {
            className:
              "rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary",
          },
          "Live"
        )
      )
    ),
    el(
      "nav",
      { className: "mt-6 space-y-1" },
      navItems.map((item) => {
        const Icon = item.icon;
        return el(
          NavLink,
          {
            key: item.id,
            to: item.id,
            className: ({ isActive }: { isActive: boolean }) =>
              `flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-500 hover:bg-white/5 hover:text-text-900"
              }`,
          },
          el(
            "span",
            { className: "flex items-center gap-3" },
            el(Icon, { className: "h-4 w-4" }),
            item.label
          )
        );
      })
    ),
    el(
      "div",
      {
        className:
          "mt-auto rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-4",
      },
      el(
        "div",
        { className: "text-sm font-semibold text-text-900" },
        "Leader Console"
      ),
      el(
        "p",
        { className: "mt-2 text-sm text-text-500" },
        role === "leader"
          ? "Create your team, unlock the hidden code, and claim a problem statement before other teams."
          : role === "admin"
          ? "Manage rooms, problems, teams, and overrides from the admin panel."
          : "View your assigned problem and announcements."
      ),
      el(
        Link,
        {
          to: "/",
          className:
            "mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-white",
        },
        "Back to marketing"
      )
    )
  );

  const topbar = el(
    "header",
    {
      className:
        "sticky top-0 z-40 border-b border-white/10 bg-bg/85 backdrop-blur-xl",
    },
    el(
      "div",
      { className: "flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8" },
      el(
        "button",
        {
          className:
            "inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-text-900 lg:hidden",
          onClick: () => setMobileOpen(true),
          "aria-label": "Open navigation",
        },
        el(Menu, { className: "h-5 w-5" })
      ),
      el(
        "div",
        {
          className:
            "flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3",
        },
        el(Search, { className: "h-4 w-4 shrink-0 text-text-500" }),
        el("input", {
          type: "text",
          placeholder: "Search dashboard...",
          className:
            "w-full bg-transparent text-sm text-text-900 placeholder:text-text-500 focus:outline-none",
        })
      ),
      el(
        "button",
        {
          className:
            "hidden sm:inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-text-900",
        },
        el(Bell, { className: "h-4 w-4" }),
        "Alerts"
      ),
      el(
        "div",
        {
          className:
            "hidden md:flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3",
        },
        el(
          "div",
          {
            className:
              "h-9 w-9 rounded-xl bg-primary/15 text-center text-sm font-bold leading-9 text-primary",
          },
          "AL"
        ),
        el(
          "div",
          null,
          el(
            "div",
            { className: "text-sm font-semibold text-text-900" },
            displayName
          ),
          el(
            "div",
            { className: "text-xs text-text-500" },
            profile?.team_name || "Team Alpha"
          )
        )
      ),
      el(
        "button",
        {
          onClick: handleSignOut,
          className:
            "hidden sm:inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-bg shadow-[0_0_18px_rgba(0,240,255,0.22)]",
        },
        el(LogOut, { className: "h-4 w-4" }),
        "Sign out"
      )
    )
  );

  const mobileDrawer = mobileOpen
    ? el(
        "div",
        { className: "fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm lg:hidden" },
        el(
          "aside",
          {
            className:
              "flex h-full w-80 flex-col border-r border-white/10 bg-bg px-5 py-6",
          },
          el(
            "div",
            {
              className:
                "flex items-center justify-between border-b border-white/10 pb-5",
            },
            el(
              "div",
              { className: "text-lg font-bold text-text-900" },
              "Navigation"
            ),
            el(
              "button",
              {
                className:
                  "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-900",
                onClick: () => setMobileOpen(false),
              },
              "Close"
            )
          ),
          el(
            navItems.map((item) => {
              const Icon = item.icon;
              return el(
                NavLink,
                {
                  key: item.id,
                  to: item.id,
                  className: ({ isActive }: { isActive: boolean }) =>
                    `flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-white/10 bg-white/5 text-text-900"
                    }`,
                  onClick: () => {
                    setMobileOpen(false);
                  },
                },
                el(Icon, { className: "h-4 w-4 text-primary" }),
                item.label
              );
            })
          ),
          el(
            "div",
            {
              className:
                "mt-auto rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-text-500",
            },
            role === "admin"
              ? "Admin controls live here."
              : "Role-based navigation updated for the current account."
          )
        )
      )
    : null;

  return el(
    "div",
    { className: "min-h-screen bg-bg text-text-900" },
    sidebar,
    el(
      "div",
      { className: "lg:pl-72" },
      topbar,
      el("main", { className: "px-4 py-6 sm:px-6 lg:px-8" }, el(Outlet))
    ),
    mobileDrawer
  );
}
