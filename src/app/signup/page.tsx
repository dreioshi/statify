"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Mail, TriangleAlert, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import AuthFrame from "@/components/auth/AuthFrame";
import PasswordField from "@/components/auth/PasswordField";

export default function Signup() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && user) router.replace("/dashboard"); }, [loading, user, router]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setError(""); setNotice("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setBusy(true);
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { data: { full_name: fullName.trim() }, emailRedirectTo: `${window.location.origin}/login` },
    });
    setBusy(false);
    if (err) { setError(err.message); return; }
    // With "Confirm email" ON there is no session yet; with it OFF the user is signed in immediately.
    if (data.session) router.replace("/dashboard");
    else setNotice("Account created. Check your email for the confirmation link, then sign in.");
  };

  return (
    <AuthFrame>
      <h1>Create an account</h1>
      {!supabase ? (
        <>
          <p className="error-message" role="alert">
            <TriangleAlert size={18} />
            <span>Sign-up is unavailable because Supabase is not configured. Add your keys to <code>.env.local</code> and restart the dev server.</span>
          </p>
          <p className="auth-divider"><span><Link href="/login">Back to login</Link></span></p>
        </>
      ) : (
        <form onSubmit={submit}>
          <p className="auth-subtitle">Save your analyses and revisit them anytime.</p>
          <label className="field-label">
            <span className="field-title"><User size={18} />Full name</span>
            <input placeholder="Your name" value={fullName} onChange={e => setFullName(e.target.value)} required autoComplete="name" />
          </label>
          <label className="field-label">
            <span className="field-title"><Mail size={18} />Email address</span>
            <input type="email" placeholder="student@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <PasswordField value={password} onChange={setPassword} placeholder="At least 8 characters" autoComplete="new-password" minLength={8} />
          {error && <p className="error-message" role="alert"><TriangleAlert size={18} />{error}</p>}
          {notice && <p className="success-message" role="status"><CheckCircle2 size={18} /><span>{notice}</span></p>}
          <button className="button primary full-width auth-submit" type="submit" disabled={busy}>{busy ? "Creating account…" : "Sign up"}</button>
          <p className="auth-divider"><span>Already have an account? <Link href="/login">Sign in</Link></span></p>
        </form>
      )}
    </AuthFrame>
  );
}