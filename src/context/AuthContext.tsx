import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../supabase/client";
import {
  completePendingOnboarding,
  getCurrentSession,
  signOutUser,
  syncProfileFromAuth,
} from "../supabase/auth";
import {
  getProfileById,
  type ProfileRow,
  type UserRole,
} from "../supabase/database";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: ProfileRow | null;
  role: UserRole;
  loading: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function resolveRole(user: User | null): UserRole {
  const role = user?.user_metadata?.role ?? user?.app_metadata?.role;
  if (role === "leader" || role === "member" || role === "admin") {
    return role;
  }
  return "member";
}

function deriveProfile(user: User | null): ProfileRow | null {
  if (!user) return null;

  return {
    id: user.id,
    name: String(
      user.user_metadata?.name ??
        user.user_metadata?.full_name ??
        user.email ??
        "User"
    ),
    email: user.email ?? "",
    role: resolveRole(user),
    team_name: String(user.user_metadata?.team_name ?? ""),
    team_id: (user.user_metadata?.team_id as string | undefined) ?? null,
    seat_id: (user.user_metadata?.seat_id as string | undefined) ?? null,
    selected_problem:
      (user.user_metadata?.selected_problem as string | undefined) ?? null,
  };
}

async function loadProfile(user: User | null): Promise<ProfileRow | null> {
  if (!user) return null;

  const fallbackProfile = deriveProfile(user);

  try {
    await syncProfileFromAuth(user, fallbackProfile?.team_name);
    await completePendingOnboarding(user);
    const { data } = await getProfileById(user.id);
    if (data) {
      return data as ProfileRow;
    }
  } catch {
    // Keep the auth flow working even if profile tables are not ready yet.
  }

  return fallbackProfile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  async function applySession(nextSession: Session | null) {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);
    setProfile(await loadProfile(nextSession?.user ?? null));
    setLoading(false);
  }

  async function refreshSession() {
    setLoading(true);
    const { data } = await getCurrentSession();
    await applySession(data.session ?? null);
  }

  async function handleSignOut() {
    await signOutUser();
    
    // Clear hackathon-specific local storage
    localStorage.removeItem('hackathon_secret_key');
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('unlocked_')) {
        localStorage.removeItem(key);
      }
    });

    setSession(null);
    setUser(null);
    setProfile(null);
  }

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const { data } = await getCurrentSession();
      if (!mounted) return;
      await applySession(data.session ?? null);
    };

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      void applySession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      role: profile?.role ?? resolveRole(user),
      loading,
      isAuthenticated: Boolean(session),
      refreshSession,
      signOut: handleSignOut,
    }),
    [loading, profile, session, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
