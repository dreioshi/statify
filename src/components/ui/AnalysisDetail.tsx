import { correlationStrength } from "@/lib/statistics/regression";
import { interpretRegression, interpretTTest, interpretZTest } from "@/lib/statistics/interpret";
import type { ZResult } from "@/lib/statistics/z-tests";
import type { TResult } from "@/lib/statistics/t-tests";
import type { AnalysisRecord } from "@/types/analysis";

type Obj = Record<string, any>;
const oneLabels: Record<string, string> = { mean: "Sample mean (x̄)", mu: "Hypothesized mean (μ₀)", sigma: "Population std. deviation (σ)", n: "Sample size (n)" };
const twoLabels: Record<string, string> = { mean1: "Sample 1 mean (x̄₁)", mean2: "Sample 2 mean (x̄₂)", variance1: "Sample 1 variance", variance2: "Sample 2 variance", n1: "Sample 1 size (n₁)", n2: "Sample 2 size (n₂)" };
const oneLabelsT = (variance: boolean): Record<string, string> => ({ mean: "Sample mean (x̄)", mu: "Hypothesized mean (μ₀)", s: variance ? "Sample variance (s²)" : "Sample std. deviation (s)", n: "Sample size (n)" });
const twoLabelsT = (variance: boolean): Record<string, string> => ({
  mean1: "Sample 1 mean (x̄₁)", mean2: "Sample 2 mean (x̄₂)",
  s1: variance ? "Sample 1 variance (s₁²)" : "Sample 1 std. deviation (s₁)",
  s2: variance ? "Sample 2 variance (s₂²)" : "Sample 2 std. deviation (s₂)",
  n1: "Sample 1 size (n₁)", n2: "Sample 2 size (n₂)",
});
const tailText: Record<string, string> = { two: "Two-tailed (≠)", left: "Left-tailed (<)", right: "Right-tailed (>)" };
const equation = (a: number, b: number) => `Ŷ = ${a.toFixed(3)} ${b < 0 ? "−" : "+"} ${Math.abs(b).toFixed(3)}X`;

function RegressionDetail({ record }: { record: AnalysisRecord }) {
  const res = record.result as Obj;
  const inputs = (record.inputs ?? {}) as Obj;
  const points: { x: number; y: number }[] = res.points ?? [];
  const r2 = res.r2 ?? res.r * res.r;
  const xName = inputs.xName || "X";
  const yName = inputs.yName || "Y";
  const interp = interpretRegression({ ...res, r2 } as any, xName, yName);
  return (
    <>
      <div className="equation-card"><small>Fitted regression line</small><strong>{equation(res.a, res.b)}</strong></div>
      <div className="metric-grid metric-grid-3">
        <div className="metric-card"><small>Pearson r</small><b>{res.r.toFixed(4)}</b><span>{correlationStrength(res.r)} {res.r >= 0 ? "positive" : "negative"}</span></div>
        <div className="metric-card"><small>r² (determination)</small><b>{r2.toFixed(4)}</b><span>{(r2 * 100).toFixed(1)}% of Y explained</span></div>
        <div className="metric-card"><small>Observations</small><b>{points.length}</b><span>{xName} vs {yName}</span></div>
        <div className="metric-card"><small>Slope (b)</small><b>{res.b.toFixed(3)}</b><span>Change in fitted Y per X unit</span></div>
        <div className="metric-card"><small>Intercept (a)</small><b>{res.a.toFixed(3)}</b><span>Fitted Y when X = 0</span></div>
      </div>

      <h3 className="detail-title">Interpretation</h3>
      <p className="interp-headline">{interp.headline}</p>
      <div className="interp-grid">
        {interp.items.map(item => <article key={item.title} className="interp-item"><h3>{item.title}</h3><p>{item.text}</p></article>)}
      </div>

      <h3 className="detail-title">Data, fitted values &amp; residuals</h3>
      <div className="responsive-table">
        <table>
          <thead><tr><th>#</th><th>{xName}</th><th>Actual {yName}</th><th>Fitted Ŷ</th><th>Residual</th></tr></thead>
          <tbody>
            {points.map((p, i) => (
              <tr key={i}><td>{i + 1}</td><td>{p.x}</td><td>{p.y}</td><td>{res.fitted?.[i]?.toFixed(3)}</td><td>{res.residuals?.[i]?.toFixed(3)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function HypothesisDetail({ record }: { record: AnalysisRecord }) {
  const res = record.result as ZResult & TResult & Obj;
  const inputs = (record.inputs ?? {}) as Obj;
  // Older Z-test records have no `family` field, so anything that is not "t" is a Z-test.
  const isT = inputs.family === "t";
  const S = isT ? "t" : "Z";
  const test: "one" | "two" = inputs.test === "two" ? "two" : "one";
  const labels = isT
    ? (test === "one" ? oneLabelsT(inputs.spread === "var") : twoLabelsT(inputs.spread === "var"))
    : (test === "one" ? oneLabels : twoLabels);
  const stat: number = isT ? res.t : res.z;
  const interp = isT
    ? interpretTTest(res, inputs.hyp?.h0 ?? "", inputs.hyp?.h1 ?? "", test)
    : interpretZTest(res, inputs.hyp?.h0 ?? "", inputs.hyp?.h1 ?? "", test);
  const rejected = res.decision === "Reject H₀";
  return (
    <>
      <div className="metric-grid">
        <div className="metric-card"><small>Null hypothesis (H₀)</small><b>{inputs.hyp?.h0 || "—"}</b></div>
        <div className="metric-card"><small>Alternative hypothesis (H₁)</small><b>{inputs.hyp?.h1 || "—"}</b></div>
      </div>

      <div className="stat-grid">
        <article className="stat-card"><span>Calculated {S}</span><strong>{stat.toFixed(4)}</strong><small>Standard error {res.standardError.toFixed(5)}{isT ? ` · df = ${res.df}` : ""}</small></article>
        <article className="stat-card"><span>Critical {S} value(s)</span><strong>{res.critical.map(v => v.toFixed(3)).join(" / ")}</strong><small>α = {res.alpha}</small></article>
        <article className={`stat-card decision ${rejected ? "reject" : "keep"}`}><span>Decision</span><strong>{res.decision}</strong><small>{rejected ? `${S} is inside the rejection region` : `${S} is outside the rejection region`}</small></article>
      </div>

      <div className={`decision-panel ${rejected ? "reject" : "keep"}`}>
        <b>{interp.decision}</b>
        <p>{interp.detail}</p>
        {isT && res.dfNote && <small>{res.dfNote}{test === "two" ? ". Conservative class rule; software using Welch–Satterthwaite df may differ slightly." : "."}</small>}
      </div>

      <h3 className="detail-title">Test setup and inputs</h3>
      <div className="computation-grid">
        <div><small>Procedure</small><b>{test === "one" ? `One-sample ${S}-test` : `Two-sample ${S}-test`}</b></div>
        <div><small>Alternative</small><b>{tailText[inputs.tail ?? res.tail] ?? "—"}</b></div>
        <div><small>Significance level</small><b>α = {inputs.alpha ?? res.alpha}</b></div>
        {isT && <div><small>Degrees of freedom</small><b>df = {res.df}</b></div>}
        {Object.keys(labels).filter(k => inputs[k] !== undefined).map(k => (
          <div key={k}><small>{labels[k]}</small><b>{inputs[k]}</b></div>
        ))}
      </div>
    </>
  );
}

export default function AnalysisDetail({ record }: { record: AnalysisRecord }) {
  try {
    return record.type === "Regression" ? <RegressionDetail record={record} /> : <HypothesisDetail record={record} />;
  } catch {
    return <p className="helper-text">This saved record is in an older format and can't be displayed as cards.</p>;
  }
}