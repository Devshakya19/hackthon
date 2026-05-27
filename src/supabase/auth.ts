import { supabase } from "./client";
import { upsertProfileFromUser } from "./database";
import {
  createTeam,
  createTeamMember,
  getTeamByLeaderId,
  getTeamMemberByUserId,
  updateUserById,
  getTeamByUIDAndPassword,
} from "./queries";

type PendingOnboarding = {
  role: "leader" | "member" | "admin";
  teamName?: string;
  teamUid?: string;
  teamPassword?: string;
  fullName?: string;
};

const SIGNUP_EMAIL_COOLDOWN_MS = 60_000;
const SIGNUP_EMAIL_COOLDOWN_PREFIX = "signup-email";

const ONBOARDING_STORAGE_KEY = "bugbounty.pendingOnboarding";

function readPendingOnboarding(): PendingOnboarding | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingOnboarding;
  } catch {
    return null;
  }
}

function clearPendingOnboarding() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}

function signupCooldownKey(email: string) {
  return `${SIGNUP_EMAIL_COOLDOWN_PREFIX}:${email.trim().toLowerCase()}`;
}

export function getSignupEmailCooldownLeft(email: string) {
  if (typeof window === "undefined") return 0;

  const trimmedEmail = email.trim();
  if (!trimmedEmail) return 0;

  const savedAt = Number(
    window.localStorage.getItem(signupCooldownKey(trimmedEmail)) ?? "0"
  );
  if (!savedAt) return 0;

  const remaining = Math.max(
    0,
    SIGNUP_EMAIL_COOLDOWN_MS - (Date.now() - savedAt)
  );
  return Math.ceil(remaining / 1000);
}

export function markSignupEmailCooldown(email: string) {
  if (typeof window === "undefined") return;

  const trimmedEmail = email.trim();
  if (!trimmedEmail) return;

  window.localStorage.setItem(
    signupCooldownKey(trimmedEmail),
    String(Date.now())
  );
}

export function isEmailRateLimitError(message: string) {
  const normalizedMessage = message.toLowerCase();
  return (
    normalizedMessage.includes("rate") ||
    normalizedMessage.includes("too many requests") ||
    normalizedMessage.includes("email confirmation") ||
    normalizedMessage.includes("signup")
  );
}

export function clearStoredOnboarding() {
  clearPendingOnboarding();
}

export function storePendingOnboarding(payload: PendingOnboarding) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(payload));
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(
  email: string,
  password: string,
  payload?: Partial<PendingOnboarding>
) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: payload?.role ?? "member",
        team_name: payload?.teamName ?? "",
        name: payload?.fullName ?? "",
      },
    },
  });
}

export async function signOutUser() {
  return supabase.auth.signOut();
}

export async function resendVerificationEmail(email: string) {
  return supabase.auth.resend({
    type: "signup",
    email,
  });
}

export async function sendPasswordResetEmail(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}

export async function getCurrentSession() {
  return supabase.auth.getSession();
}

export async function syncProfileFromAuth(
  user: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown>;
  },
  teamName?: string
) {
  return upsertProfileFromUser(user as any, teamName);
}

let ensureTeamPromise: Promise<any> | null = null;

export async function ensureTeamForUser(
  user: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown>;
  },
  teamName?: string
) {
  if (ensureTeamPromise) return ensureTeamPromise;

  ensureTeamPromise = (async () => {
    try {
      const existingTeam = await getTeamByLeaderId(user.id);
      if (existingTeam.data) {
        return existingTeam.data;
      }

      const nextTeamName =
        teamName?.trim() ||
        String(
          user.user_metadata?.team_name ??
            user.user_metadata?.name ??
            user.email ??
            "Team"
        );
      const teamId = crypto.randomUUID();
      // generate team UID and password
      const teamUid = `T-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
      const teamPassword = crypto.randomUUID().slice(0, 6);
      const memberName = String(
        user.user_metadata?.name ??
          user.user_metadata?.full_name ??
          user.email ??
          "Leader"
      );

      const createdTeam = await createTeam({
        id: teamId,
        team_name: nextTeamName,
        leader_id: user.id,
        team_uid: teamUid,
        team_password: teamPassword,
        selected_problem_id: null,
        room_id: null,
        seat_number: null,
        problem_id: null,
      });

      if (createdTeam.error) {
        throw createdTeam.error;
      }

      const createdMember = await createTeamMember({
        id: crypto.randomUUID(),
        team_id: teamId,
        user_id: user.id,
        name: memberName,
        email: user.email ?? "",
      });

      if (createdMember.error) {
        throw createdMember.error;
      }

      const updatedUser = await updateUserById(user.id, {
        role: "leader",
        team_id: teamId,
        selected_problem: null,
      });

      if (updatedUser.error) {
        throw updatedUser.error;
      }

      // Ensure the users profile row is up-to-date and visible to clients
      await upsertProfileFromUser(user as any, nextTeamName);

      return createdTeam.data;
    } finally {
      // Don't nullify immediately to prevent race conditions; we nullify at the end of the outer block.
    }
  })();

  try {
    const result = await ensureTeamPromise;
    return result;
  } finally {
    ensureTeamPromise = null;
  }
}

export async function joinTeamByUidAndPassword(
  user: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown>;
  },
  teamUid?: string,
  teamPassword?: string
) {
  const uid = teamUid?.trim() || String(user.user_metadata?.team_uid ?? "");
  const pwd =
    teamPassword?.trim() || String(user.user_metadata?.team_password ?? "");
  if (!uid || !pwd) throw new Error("Team UID and password are required");

  const teamResult = await getTeamByUIDAndPassword(uid, pwd);
  if (!teamResult.data) throw new Error("Invalid team credentials");

  const team = teamResult.data;
  const memberResult = await getTeamMemberByUserId(user.id);
  if (!memberResult.data) {
    const createdMember = await createTeamMember({
      id: crypto.randomUUID(),
      team_id: team.id,
      user_id: user.id,
      name: String(
        user.user_metadata?.name ??
          user.user_metadata?.full_name ??
          user.email ??
          "Member"
      ),
      email: user.email ?? "",
    });

    if (createdMember.error) throw createdMember.error;
  }

  const updatedUser = await updateUserById(user.id, {
    role: "member",
    team_id: team.id,
    selected_problem: null,
  });

  if (updatedUser.error) throw updatedUser.error;

  return team;
}

export async function completePendingOnboarding(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const pending = readPendingOnboarding();
  if (!pending) return null;

  try {
    if (pending.role === "leader") {
      const team = await ensureTeamForUser(user, pending.teamName);
      clearPendingOnboarding();
      return team;
    }

    if (pending.role === "member") {
      let team;
      if (pending.teamUid && pending.teamPassword) {
        team = await joinTeamByUidAndPassword(
          user,
          pending.teamUid,
          pending.teamPassword
        );
      } else {
        throw new Error("Missing team credentials for joining");
      }
      clearPendingOnboarding();
      return team;
    }

    const updatedUser = await updateUserById(user.id, { role: "admin" });
    if (updatedUser.error) {
      throw updatedUser.error;
    }
    clearPendingOnboarding();
    return updatedUser.data;
  } catch (error) {
    clearPendingOnboarding();
    throw error;
  }
}
