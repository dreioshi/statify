"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const GUEST_KEY = "statify-guest";

type AuthState = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  /** true when browsing without an account (no saving, no history) */
  guest: boolean;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
};
const Ctx = createContext<AuthState>({
  user: null, loading: false, configured: false, guest: false,
  continueAsGuest: () => {}, signOut: async () => {},
});
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestFlag, setGuestFlag] = useState(false);

  useEffect(() => {
    try { setGuestFlag(window.sessionStorage.getItem(GUEST_KEY) === "1"); } catch {}
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setLoading(false); });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  const continueAsGuest = useCallback(() => {
    try { window.sessionStorage.setItem(GUEST_KEY, "1"); } catch {}
    setGuestFlag(true);
  }, []);

  const signOut = useCallback(async () => {
    try { window.sessionStorage.removeItem(GUEST_KEY); } catch {}
    setGuestFlag(false);
    await supabase?.auth.signOut();
  }, []);

  // A signed-in user always wins over the guest flag.
  const guest = guestFlag && !user;
  return <Ctx.Provider value={{ user, loading, configured: supabase !== null, guest, continueAsGuest, signOut }}>{children}</Ctx.Provider>;
}