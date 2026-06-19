import {
  createContext, useContext, useEffect, useState, useCallback, useMemo,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { AppRole } from "@/features/auth/types";

export type { AppRole };

/**
 * AuthProvider — fonte ÚNICA de autenticação para todo o app.
 *
 * Antes: cada componente que chamava `useAuth()` instanciava sua própria
 * subscrição e disparava queries duplicadas em `profiles` e `user_roles`.
 * Em uma página como o Dashboard isso significava 4-6 fetches paralelos
 * só pra montar o layout. Agora tudo passa por um Context único.
 */

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: AppRole | null;
  profile: { id: string; name: string | null; email: string | null; agency_id: string | null; avatar_url: string | null } | null;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, extra?: Record<string, unknown>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    userRole: null,
    profile: null,
  });

  const fetchUserData = useCallback(async (userId: string) => {
    const [profileRes, roleRes] = await Promise.all([
      supabase.from("profiles").select("id, name, email, agency_id, avatar_url").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
    ]);
    setState((prev) => ({
      ...prev,
      profile: profileRes.data ?? prev.profile,
      userRole: (roleRes.data?.role as AppRole) ?? "user",
    }));
  }, []);

  useEffect(() => {
    let active = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return;
        setState((prev) => ({
          ...prev,
          session,
          user: session?.user ?? null,
          isAuthenticated: !!session?.user,
          isLoading: false,
        }));
        if (session?.user) {
          // Defer to next tick to avoid blocking the auth callback
          setTimeout(() => fetchUserData(session.user.id), 0);
        } else {
          setState((prev) => ({ ...prev, profile: null, userRole: null }));
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session?.user,
        isLoading: false,
      }));
      if (session?.user) {
        fetchUserData(session.user.id);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [fetchUserData]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string, extra?: Record<string, unknown>) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, ...(extra ?? {}) }, emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, signIn, signUp, signOut }),
    [state, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Fallback defensivo: se algum componente for renderizado fora do
    // provider (ex: tela de login), retornamos um estado neutro para
    // evitar crash. O provider real cobre todas as rotas autenticadas.
    return {
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      userRole: null,
      profile: null,
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      signUp: async (email, password, name, extra) => {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name, ...(extra ?? {}) }, emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
        });
        if (error) throw error;
      },
      signOut: async () => { await supabase.auth.signOut(); },
    };
  }
  return ctx;
}
