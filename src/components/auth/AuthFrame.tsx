import Image from "next/image";
import { Info } from "lucide-react";
import type { ReactNode } from "react";

/** Shared layout for the login and signup pages: brand card (left), form card (right), guest note (bottom). */
export default function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <div className="auth-frame">
      <div className="auth-grid">
        <section className="auth-brand-card">
          <span className="brand-badge auth-logo-badge">
            <Image src="/statify-logo.png" alt="Statify logo" width={120} height={120} priority />
          </span>
          <h2 className="auth-wordmark">Statify</h2>
          <p className="auth-tagline">From Data to Statistical Insight.</p>
          <hr className="auth-rule" />
          <h3>Your data, made meaningful.</h3>
          <p className="auth-blurb">A workspace for regression, correlation, and hypothesis testing.</p>
          <svg className="auth-deco" viewBox="0 0 400 150" aria-hidden="true">
            {[[10,70],[50,100],[90,60],[130,85],[170,45],[210,75],[250,35],[290,65],[330,25],[370,50]].map(([x, h], i) => (
              <rect key={i} className="auth-bar" x={x} y={150 - h} width="26" height={h} rx="4" />
            ))}
            <path className="auth-curve" d="M0 118 C40 108 60 78 100 86 S160 100 200 88 S270 62 310 46 S370 22 400 12" />
            {[[100,86],[200,88],[310,46],[390,16]].map(([x, y], i) => <circle key={i} className="auth-dot" cx={x} cy={y} r="5" />)}
          </svg>
        </section>
        <section className="panel auth-panel">{children}</section>
      </div>
      <div className="auth-note" role="note">
        <span className="auth-note-icon"><Info size={22} /></span>
        <div>
          <b>Continue without an account?</b>
          <p>You can use Statify without signing in, but you won&rsquo;t be able to save your analyses or access your analysis history.</p>
        </div>
      </div>
    </div>
  );
}