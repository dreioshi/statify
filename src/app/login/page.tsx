"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Mail, TriangleAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import AuthFrame from "@/components/auth/AuthFrame";
import PasswordField from "@/components/auth/PasswordField";

export default function Login() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && user) router.replace("/dashboard"); }, [loading, user, router]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true); setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (err) { setError(err.message); return; }
    router.replace("/dashboard");
  };

  return (
    <AuthFrame>
      <h1>Welcome back</h1>
      {!supabase ? (
        <p className="error-message" role="alert">
          <TriangleAlert size={18} />
          <span>Sign-in is unavailable because Supabase is not configured. Create a <code>.env.local</code> file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then restart the dev server. You can still use &ldquo;Start without an account&rdquo; above.</span>
        </p>
      ) : (
        <form onSubmit={submit}>
          <p className="auth-subtitle">Sign in to access your saved analyses.</p>
          <label className="field-label">
            <span className="field-title"><Mail size={18} />Email address</span>
            <input type="email" placeholder="student@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <PasswordField value={password} onChange={setPassword} autoComplete="current-password" />
          {error && <p className="error-message" role="alert"><TriangleAlert size={18} />{error}</p>}
          <button className="button primary full-width auth-submit" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
          <p className="auth-divider"><span>New to Statify? <Link href="/signup">Sign up</Link></span></p>
        </form>
      )}
    </AuthFrame>
  );
}