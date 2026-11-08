"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { BarChart3, BookOpen, ChevronRight, Database, FileText, FlaskConical, Grid2X2, LogIn, LogOut, Menu, CircleHelp, User as UserIcon, X } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useAuth } from "@/components/auth/AuthProvider";
import type { User } from "@supabase/supabase-js";

const links = [
  ["/dashboard", "Dashboard", Grid2X2],
  ["/regression", "Regression Analysis", BarChart3],
  ["/hypothesis-testing", "Hypothesis Testing", FlaskConical],
  ["/history", "Analysis History", Database],
  ["/study-guide", "Study Guide", BookOpen],
  ["/about", "About the Project", CircleHelp],
  ["/references", "References", FileText],
] as const;

function initials(user: User | null) {
  if (!user) return "G";
  const name = (user.user_metadata?.full_name as string | undefined)?.trim();
  if (name) { const p = name.split(/\s+/); return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "ST"; }
  return (user.email?.[0] ?? "S").toUpperCase();
}

export default function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, loading, guest, continueAsGuest, signOut } = useAuth();
  const isAuthPage = path === "/login" || path === "/signup";
  const allowed = !!user || guest;
  const historyBlocked = guest && path.startsWith("/history"); // guests have no analysis history
  const visibleLinks = links.filter(([href]) => !(guest && href === "/history"));

  useEffect(() => {
    if (loading || isAuthPage) return;
    if (!allowed) router.replace("/login");
    else if (historyBlocked) router.replace("/dashboard");
  }, [loading, allowed, isAuthPage, historyBlocked, router]);

  if (isAuthPage) {
    return (
      <div className="auth-page">
        <header className="auth-topbar">
          <div className="auth-topbar-brand">
            <span className="brand-badge"><Image src="/statify-logo.png" alt="Statify logo" width={46} height={46} className="brand-logo" priority /></span>
            <b>Statify</b>
            <span className="auth-topbar-sep" aria-hidden="true" />
            <small>From Data to Statistical Insight.</small>
          </div>
          <div className="auth-topbar-right">
            <ThemeToggle />
            <button type="button" className="button ghost auth-guest-btn" onClick={() => { continueAsGuest(); router.replace("/dashboard"); }}>
              <UserIcon size={18} /><span>Start without an account</span><ChevronRight size={18} />
            </button>
          </div>
        </header>
        <main className="auth-main">{children}</main>
      </div>
    );
  }
  if (loading || !allowed || historyBlocked) return <main className="auth-layout" aria-busy="true" />;
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link href="/dashboard" className="brand">
          <span className="brand-badge"><Image src="/statify-logo.png" alt="Statify logo" width={46} height={46} className="brand-logo" priority /></span>
          <span><b>Statify</b><small>From Data to Statistical Insight.</small></span>
        </Link>
        <div className="topbar-right">
          <span className="topbar-meta"><span className="status-dot" /> ADVSTAT · Modules 7 &amp; 9</span>
          <ThemeToggle />
          <span className="user-avatar" title={user?.email ?? "Guest"} aria-hidden="true">{initials(user)}</span>
          {user && <button className="icon-button" onClick={async () => { await signOut(); router.replace("/login"); }} aria-label="Sign out" title="Sign out"><LogOut size={18} /></button>}
          {guest && <button className="button ghost guest-signin" onClick={async () => { await signOut(); router.replace("/login"); }}><LogIn size={18} /><span>Sign in</span></button>}
          <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
        </div>
      </header>
      <div className="workspace">
        <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
          <nav aria-label="Main navigation">
            {visibleLinks.map(([href, label, Icon]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className={`nav-link ${path === href ? "active" : ""}`} aria-current={path === href ? "page" : undefined}>
                <Icon size={20} />{label}
              </Link>
            ))}
          </nav>
          <div className="sidebar-bottom">Statistical Analysis Workspace</div>
        </aside>
        <main className="main-content">
          {children}
          <footer className="footer">Statify — From Data to Statistical Insight · ADVSTAT final project · Modules 7 &amp; 9</footer>
        </main>
      </div>
    </div>
  );
}