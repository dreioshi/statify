"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen, Database, FlaskConical, TrendingUp } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { readHistory } from "@/lib/storage/history";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import type { AnalysisRecord } from "@/types/analysis";

export default function Dashboard() {
  const { user, guest } = useAuth();
  const [items, setItems] = useState<AnalysisRecord[]>([]);
  useEffect(() => { if (user) readHistory().then(setItems).catch(() => setItems([])); }, [user]);
  const regressions = items.filter(x => x.type === "Regression").length;
  const tests = items.length - regressions;
  return (
    <>
      <PageHeader title="Dashboard" description="Your workspace for course-aligned statistical analysis." />

      <section className="hero">
        <div className="hero-copy">
          <h2>Make data make sense.</h2>
          <p>Fit a line to paired data, test a claim against a critical Z value, {guest ? "and sign in whenever you want to save your results." : "and keep every result in your history automatically."}</p>
          <div className="hero-actions">
            <Link className="button primary" href="/regression">Start a regression <ArrowUpRight size={18} /></Link>
            <Link className="button ghost" href="/hypothesis-testing">Run a Z-test</Link>
          </div>
        </div>
        <div className="hero-figure" aria-hidden="true">
          <svg viewBox="0 0 320 200" role="img">
            <g className="hero-grid">{[40, 80, 120, 160].map(y => <line key={y} x1="10" x2="310" y1={y} y2={y} />)}</g>
            <path className="hero-curve" d="M10 170 C70 168 100 150 130 100 S190 20 230 60 S290 150 310 150" />
            <line className="hero-fit" x1="10" y1="165" x2="310" y2="30" />
            {[[40,150],[75,128],[110,126],[150,92],[190,78],[230,56],[270,40],[295,28]].map(([x, y], i) => <circle key={i} className="hero-dot" cx={x} cy={y} r="6" />)}
          </svg>
        </div>
      </section>

      {!guest && <div className="stat-grid">
        <article className="stat-card"><span>Saved analyses</span><strong>{items.length}</strong><small>{supabase ? "Saved to your account" : "Stored in this browser"}</small><Database /></article>
        <article className="stat-card"><span>Regressions</span><strong>{regressions}</strong><small>Module 7</small><TrendingUp /></article>
        <article className="stat-card"><span>Hypothesis tests</span><strong>{tests}</strong><small>Module 9</small><FlaskConical /></article>
      </div>}

      <div className="two-column">
        <section className="panel">
          <div className="panel-heading"><h2>Quick analysis</h2></div>
          <Link className="quick-link" href="/regression"><span className="quick-icon lime"><TrendingUp /></span><span><b>Simple linear regression</b><small>Equation, Pearson r, r², interpretation, scatter diagram</small></span><ArrowUpRight /></Link>
          <Link className="quick-link" href="/hypothesis-testing"><span className="quick-icon mint"><FlaskConical /></span><span><b>Hypothesis testing</b><small>One- and two-sample Z-test with a built-in Z-table</small></span><ArrowUpRight /></Link>
          <Link className="quick-link" href="/study-guide"><span className="quick-icon sky"><BookOpen /></span><span><b>Study guide</b><small>Review concepts from Modules 7 and 9</small></span><ArrowUpRight /></Link>
        </section>
        {guest ? (
          <section className="panel">
            <div className="panel-heading"><h2>Guest mode</h2></div>
            <div className="empty-state"><span><b>Your analyses are not saved.</b> <Link className="text-link" href="/login">Sign in</Link> or <Link className="text-link" href="/signup">create an account</Link> to keep an analysis history.</span></div>
          </section>
        ) : (
        <section className="panel">
          <div className="panel-heading"><h2>Recent analyses</h2><Link href="/history" className="text-link">View all</Link></div>
          {items.slice(0, 4).map(x => (
            <div className="recent-item" key={x.id}>
              <span className={`quick-icon ${x.type === "Regression" ? "lime" : "mint"}`}>{x.type === "Regression" ? <TrendingUp /> : <FlaskConical />}</span>
              <div><b>{x.name}</b><small>{x.type} · {new Date(x.createdAt).toLocaleString()}</small></div>
            </div>
          ))}
          {items.length === 0 && <div className="empty-state">Every analysis you run is saved here automatically.</div>}
        </section>
        )}
      </div>
    </>
  );
}