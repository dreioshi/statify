"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Activity, CheckCircle2, Eraser, FlaskRound, TriangleAlert } from "lucide-react";
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PageHeader from "@/components/ui/PageHeader";
import ZTable, { type ZMark } from "@/components/ui/ZTable";
import TTable from "@/components/ui/TTable";
import { chartColors, useTheme } from "@/components/theme/ThemeProvider";
import { oneSampleZ, twoSampleZ, type Tail, type ZResult } from "@/lib/statistics/z-tests";
import { oneSampleT, twoSampleT, tPdf, type TResult } from "@/lib/statistics/t-tests";
import { interpretTTest, interpretZTest } from "@/lib/statistics/interpret";
import { nextAnalysisName, saveHistory } from "@/lib/storage/history";
import { useAuth } from "@/components/auth/AuthProvider";

type Family = "z" | "t";
type TestKind = "one" | "two";
type Spread = "sd" | "var";
type H0Sign = "=" | "≤" | "≥";
type H1Sign = "≠" | "<" | ">";
type AnyResult = ZResult | TResult;
const isT = (r: AnyResult): r is TResult => "t" in r;
const statOf = (r: AnyResult) => (isT(r) ? r.t : r.z);

const tailFromSign = (sign: H1Sign): Tail => (sign === "≠" ? "two" : sign === "<" ? "left" : "right");
const conventionalH0 = (sign: H1Sign): H0Sign => (sign === "≠" ? "=" : sign === "<" ? "≥" : "≤");
const emptyOne = { mean: "", mu: "", sigma: "", n: "" };
const emptyTwo = { mean1: "", mean2: "", variance1: "", variance2: "", n1: "", n2: "" };
const emptyOneT = { mean: "", s: "", n: "" };
const emptyTwoT = { mean1: "", mean2: "", s1: "", s2: "", n1: "", n2: "" };
const sampleOne = { mean: "38", mu: "40", sigma: "9.5", n: "50" };
const sampleTwo = { mean1: "95", mean2: "88", variance1: "10.5", variance2: "8.5", n1: "50", n2: "50" };
const sampleOneT = { mean: "24.8", s: "4.1", n: "16" };
const sampleOneTMu = "22";
const sampleTwoT = { mean1: "78.4", mean2: "72.1", s1: "8.2", s2: "7.5", n1: "15", n2: "12" };
const oneLabels = { mean: "Sample mean (x̄)", mu: "Hypothesized mean (μ₀)", sigma: "Known population standard deviation (σ)", n: "Sample size (n)" };
const twoLabels = { mean1: "Sample 1 mean (x̄₁)", mean2: "Sample 2 mean (x̄₂)", variance1: "Sample 1 variance input", variance2: "Sample 2 variance input", n1: "Sample 1 size (n₁)", n2: "Sample 2 size (n₂)" };
const oneLabelsT = (sp: Spread) => ({ mean: "Sample mean (x̄)", s: sp === "sd" ? "Sample standard deviation (s)" : "Sample variance (s²)", n: "Sample size (n)" });
const twoLabelsT = (sp: Spread) => ({
  mean1: "Sample 1 mean (x̄₁)", mean2: "Sample 2 mean (x̄₂)",
  s1: sp === "sd" ? "Sample 1 standard deviation (s₁)" : "Sample 1 variance (s₁²)",
  s2: sp === "sd" ? "Sample 2 standard deviation (s₂)" : "Sample 2 variance (s₂²)",
  n1: "Sample 1 size (n₁)", n2: "Sample 2 size (n₂)",
});
const tailText: Record<Tail, string> = { two: "two-tailed", left: "left-tailed", right: "right-tailed" };

function readNumber(value: string, label: string) {
  if (value.trim() === "") throw new Error(`${label} is required.`);
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(`${label} must be a valid number.`);
  return n;
}

export default function HypothesisPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const c = chartColors(theme);
  const [family, setFamily] = useState<Family>("z");
  const [test, setTest] = useState<TestKind>("one");
  const [spread, setSpread] = useState<Spread>("sd");
  const [h0Sign, setH0Sign] = useState<H0Sign>("=");
  const [h1Sign, setH1Sign] = useState<H1Sign>("≠");
  const [alpha, setAlpha] = useState("0.05");
  const [one, setOne] = useState(emptyOne);
  const [two, setTwo] = useState(emptyTwo);
  const [oneT, setOneT] = useState(emptyOneT);
  const [twoT, setTwoT] = useState(emptyTwoT);
  const [name, setName] = useState("");
  const [result, setResult] = useState<AnyResult | null>(null);
  const [usedTest, setUsedTest] = useState<TestKind>("one");
  const [usedHyp, setUsedHyp] = useState({ h0: "", h1: "" });
  const [error, setError] = useState("");
  const [savedName, setSavedName] = useState("");

  const tail = tailFromSign(h1Sign);
  const left = test === "one" ? "μ" : "μ₁";
  const right = test === "one" ? (one.mu.trim() || "μ₀") : "μ₂";
  const hyp = { h0: `${left} ${h0Sign} ${right}`, h1: `${left} ${h1Sign} ${right}` };

  const reset = () => { setResult(null); setSavedName(""); };
  const changeH1 = (sign: H1Sign) => { setH1Sign(sign); setH0Sign(conventionalH0(sign)); reset(); };

  const loadSample = () => {
    if (family === "z") {
      if (test === "one") setOne(sampleOne); else setTwo(sampleTwo);
    } else {
      setSpread("sd");
      if (test === "one") { setOne(old => ({ ...old, mu: sampleOneTMu })); setOneT(sampleOneT); } else setTwoT(sampleTwoT);
    }
    setH1Sign("≠"); setH0Sign("="); setAlpha("0.05"); setError(""); reset();
  };
  const clearAll = () => {
    setOne(emptyOne); setTwo(emptyTwo); setOneT(emptyOneT); setTwoT(emptyTwoT);
    setH1Sign("≠"); setH0Sign("="); setName(""); setError(""); reset();
  };

  /** Reads a spread input and returns the standard deviation (square-roots a variance when the user gave s²). */
  const readSpread = (value: string, label: string) => {
    const v = readNumber(value, `${label} ${spread === "sd" ? "standard deviation" : "variance"}`);
    if (spread === "sd") return v;
    if (v < 0) throw new Error(`${label} variance cannot be negative.`);
    return Math.sqrt(v);
  };

  const calculate = async () => {
    setSavedName("");
    try {
      const a = Number(alpha);
      let r: AnyResult;
      let inputs: Record<string, unknown>;
      let summary: string;
      if (family === "z") {
        const zr = test === "one"
          ? oneSampleZ(readNumber(one.mean, "Sample mean"), readNumber(one.mu, "Hypothesized mean"), readNumber(one.sigma, "Population standard deviation"), readNumber(one.n, "Sample size"), a, tail)
          : twoSampleZ(readNumber(two.mean1, "Sample 1 mean"), readNumber(two.mean2, "Sample 2 mean"), readNumber(two.variance1, "Sample 1 variance"), readNumber(two.variance2, "Sample 2 variance"), readNumber(two.n1, "Sample 1 size"), readNumber(two.n2, "Sample 2 size"), a, tail);
        r = zr;
        inputs = test === "one" ? { test, ...one, hyp, alpha: a, tail } : { test, ...two, hyp, alpha: a, tail };
        summary = `${test === "one" ? "One" : "Two"}-sample Z · Z = ${zr.z.toFixed(4)} · ${zr.decision}`;
      } else {
        const tr = test === "one"
          ? oneSampleT(readNumber(oneT.mean, "Sample mean"), readNumber(one.mu, "Hypothesized mean"), readSpread(oneT.s, "Sample"), readNumber(oneT.n, "Sample size"), a, tail)
          : twoSampleT(readNumber(twoT.mean1, "Sample 1 mean"), readNumber(twoT.mean2, "Sample 2 mean"), readSpread(twoT.s1, "Sample 1"), readSpread(twoT.s2, "Sample 2"), readNumber(twoT.n1, "Sample 1 size"), readNumber(twoT.n2, "Sample 2 size"), a, tail);
        r = tr;
        inputs = test === "one"
          ? { family: "t", test, spread, mu: one.mu, ...oneT, hyp, alpha: a, tail }
          : { family: "t", test, spread, ...twoT, hyp, alpha: a, tail };
        summary = `${test === "one" ? "One" : "Two"}-sample t · t = ${tr.t.toFixed(4)} · df = ${tr.df} · ${tr.decision}`;
      }
      setResult(r); setUsedTest(test); setUsedHyp(hyp); setError("");

      // Automatically save to Analysis History (Supabase when configured)
      try {
        if (!user) return; // guests: calculate only, nothing is saved
        const finalName = name.trim() || (await nextAnalysisName("Hypothesis testing", family === "t" ? "T-test" : undefined));
        const interp = isT(r) ? interpretTTest(r, hyp.h0, hyp.h1, test) : interpretZTest(r, hyp.h0, hyp.h1, test);
        await saveHistory({
          id: crypto.randomUUID(), name: finalName, type: "Hypothesis testing", createdAt: new Date().toISOString(),
          summary, inputs, result: { ...r, interpretation: interp.detail },
        });
        setSavedName(finalName);
      } catch (saveErr) {
        setError(`Calculated, but the analysis could not be saved: ${saveErr instanceof Error ? saveErr.message : "unknown error"}`);
      }
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Unable to calculate test statistic.");
    }
  };

  const df = result && isT(result) ? result.df : null;
  const S = result && isT(result) ? "t" : "Z";
  const stat = result ? statOf(result) : 0;

  const { curve, limit } = useMemo(() => {
    const maxCrit = result ? Math.max(...result.critical.map(Math.abs)) : 0;
    const lim = df === null ? 4 : Math.min(15, Math.max(4, Math.ceil(maxCrit * 1.15)));
    const pdf = (x: number) => (df === null ? Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI) : tPdf(x, df));
    const steps = 160;
    const data = Array.from({ length: steps + 1 }, (_, i) => {
      const x = -lim + (i * 2 * lim) / steps, y = pdf(x);
      return {
        x, y,
        lower: tail !== "right" && result && x <= result.critical[0] ? y : 0,
        upper: tail !== "left" && result && x >= (tail === "two" ? result.critical[1] : result.critical[0]) ? y : 0,
        center: result && ((tail === "two" && x > result.critical[0] && x < result.critical[1]) || (tail === "left" && x > result.critical[0]) || (tail === "right" && x < result.critical[0])) ? y : 0,
      };
    });
    return { curve: data, limit: lim };
  }, [result, tail, df]);

  const tickStep = limit <= 5 ? 1 : limit <= 10 ? 2 : 5;
  const ticks = Array.from({ length: Math.floor(limit / tickStep) * 2 + 1 }, (_, i) => (i - Math.floor(limit / tickStep)) * tickStep);

  const marks: ZMark[] = result && !isT(result)
    ? [{ z: result.z, kind: "observed", label: "Calculated Z" },
       ...result.critical.map((v, i): ZMark => ({ z: v, kind: "critical", label: result.critical.length > 1 ? (i === 0 ? "Lower critical Z" : "Upper critical Z") : "Critical Z" }))]
    : [];
  const interp = result
    ? (isT(result) ? interpretTTest(result, usedHyp.h0, usedHyp.h1, usedTest) : interpretZTest(result, usedHyp.h0, usedHyp.h1, usedTest))
    : null;
  const rejected = result?.decision === "Reject H₀";
  const tooltipStyle = { background: c.tooltipBg, color: c.tooltipText, border: `1px solid ${c.grid}`, borderRadius: 10 };

  const fields = (obj: Record<string, string>, set: (fn: (old: any) => any) => void, labels: Record<string, string>) =>
    Object.keys(obj).filter(key => !(test === "one" && key === "mu")).map(key => (
      <label className="field-label" key={key}>{labels[key]}
        <input type="number" inputMode="decimal" value={obj[key]} onChange={e => { const v = e.target.value; set(old => ({ ...old, [key]: v })); }} />
      </label>
    ));

  const dataText = family === "z"
    ? (test === "one" ? "Enter the sample mean, known population standard deviation, and sample size. The hypothesized mean is set in step 1." : "Enter the two sample means, variance values, and sample sizes.")
    : (test === "one" ? "Enter the sample mean, the sample standard deviation (or variance), and the sample size. The hypothesized mean is set in step 1. Degrees of freedom: df = n − 1." : "Enter the two sample means, sample standard deviations (or variances), and sample sizes. Degrees of freedom: df = min(n₁ − 1, n₂ − 1).");

  return (
    <>
      <PageHeader title="Hypothesis Testing" description="Follow the Module 9 procedure: state hypotheses, set α, calculate the test statistic (Z or t), find the critical region, and conclude." />

      <section className="panel">
        <div className="panel-heading">
          <div><h2>1. Hypothesis setup</h2><p>Choose the test and α, then pick the signs for H₀ and H₁. Choosing H₁ also sets the matching H₀.</p></div>
          <span className="module-tag violet-tag">Module 9</span>
        </div>
        <div className="form-grid">
          <label className="field-label">Test type
            <select value={family} onChange={e => { setFamily(e.target.value as Family); setError(""); reset(); }}>
              <option value="z">Z-test (σ known, n ≥ 30)</option><option value="t">T-test (σ unknown, uses s)</option>
            </select>
          </label>
          <label className="field-label">Samples
            <select value={test} onChange={e => { setTest(e.target.value as TestKind); setError(""); reset(); }}>
              <option value="one">One-sample {family === "z" ? "Z" : "t"}-test</option><option value="two">Two-sample {family === "z" ? "Z" : "t"}-test</option>
            </select>
          </label>
          <label className="field-label">Significance level (α)
            <select value={alpha} onChange={e => { setAlpha(e.target.value); reset(); }}>
              <option value="0.10">0.10</option><option value="0.05">0.05</option><option value="0.01">0.01</option>
            </select>
          </label>
        </div>
        <div className="hyp-block">
          <div className="hyp-row">
            <span className="hyp-tag">H₀</span>
            <span className="hyp-term">{left}</span>
            <select aria-label="Null hypothesis sign" className="hyp-sign" value={h0Sign} onChange={e => { setH0Sign(e.target.value as H0Sign); reset(); }}>
              <option value="=">=</option><option value="≤">≤</option><option value="≥">≥</option>
            </select>
            {test === "one"
              ? <input aria-label="Hypothesized mean μ₀" className="hyp-value" type="number" inputMode="decimal" placeholder="Hypothesized mean (μ₀)" value={one.mu} onChange={e => { setOne({ ...one, mu: e.target.value }); reset(); }} />
              : <span className="hyp-term">μ₂</span>}
          </div>
          <div className="hyp-row">
            <span className="hyp-tag">H₁</span>
            <span className="hyp-term">{left}</span>
            <select aria-label="Alternative hypothesis sign" className="hyp-sign" value={h1Sign} onChange={e => changeH1(e.target.value as H1Sign)}>
              <option value="≠">≠ (not equal)</option><option value="<">&lt; (less than)</option><option value=">">&gt; (greater than)</option>
            </select>
            <span className="hyp-term">{right}</span>
          </div>
        </div>
        <p className="helper-text">The test type follows H₁: ≠ is two-tailed, &lt; is left-tailed, and &gt; is right-tailed. Confidence level = 1 − α.</p>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div><h2>2. Data input</h2><p>{dataText}</p></div>
          <button className="button subtle" onClick={loadSample}><FlaskRound size={18} /> Load sample</button>
        </div>
        <div className="form-grid">
          {family === "t" && (
            <label className="field-label">Spread is given as
              <select value={spread} onChange={e => { setSpread(e.target.value as Spread); setError(""); reset(); }}>
                <option value="sd">Standard deviation (s)</option><option value="var">Variance (s²)</option>
              </select>
            </label>
          )}
          {family === "z"
            ? (test === "one" ? fields(one, setOne, oneLabels) : fields(two, setTwo, twoLabels))
            : (test === "one" ? fields(oneT, setOneT, oneLabelsT(spread)) : fields(twoT, setTwoT, twoLabelsT(spread)))}
        </div>
        <label className="field-label">Analysis name (optional)<input placeholder="Auto-named if left blank" value={name} onChange={e => setName(e.target.value)} /></label>
        <div className="button-row">
          <button className="button subtle" onClick={clearAll}><Eraser size={18} /> Clear</button>
          <button className="button primary" onClick={calculate}>Calculate {family === "z" ? "Z" : "t"}-statistic <Activity size={18} /></button>
        </div>
        {error && <p className="error-message" role="alert"><TriangleAlert size={18} />{error}</p>}
        {!user && <p className="helper-text">Guest mode: results are not saved. <Link href="/login">Sign in</Link> to keep an analysis history.</p>}
        {savedName && <p className="success-message" role="status"><CheckCircle2 size={18} /><span>Saved to Analysis History as <b>{savedName}</b>. <Link href="/history">View history</Link></span></p>}
      </section>

      {result && interp && (
        <>
          <div className="stat-grid">
            <article className="stat-card"><span>Calculated {S}</span><strong>{stat.toFixed(4)}</strong><small>{isT(result) ? `Test statistic · df = ${result.df}` : "Test statistic"}</small></article>
            <article className="stat-card"><span>Critical {S} value(s)</span><strong>{result.critical.map(v => v.toFixed(3)).join(" / ")}</strong><small>α = {alpha}, {tailText[result.tail]}</small></article>
            <article className={`stat-card decision ${rejected ? "reject" : "keep"}`}><span>Decision</span><strong>{result.decision}</strong><small>{rejected ? `${S} is inside the rejection region` : `${S} is outside the rejection region`}</small></article>
          </div>

          <section className="panel">
            <div className="panel-heading"><div><h2>3. {isT(result) ? "Student t curve" : "Normal curve"} &amp; critical regions</h2><p>{isT(result) ? `The t curve uses df = ${result.df}. Rejection regions are shaded according to the selected tail and α.` : "Rejection regions are shaded according to the selected tail and α."}</p></div></div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={curve} margin={{ top: 22, right: 24, bottom: 12, left: 12 }}>
                  <CartesianGrid stroke={c.grid} strokeDasharray="4 4" />
                  <XAxis dataKey="x" type="number" domain={[-limit, limit]} ticks={ticks} stroke={c.axis} tick={{ fill: c.axis, fontSize: 14 }} tickFormatter={v => Number(v).toFixed(0)} />
                  <YAxis hide domain={[0, 0.42]} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => v.toFixed(4)} labelFormatter={l => `${S === "t" ? "t" : "z"} = ${Number(l).toFixed(2)}`} />
                  <Area dataKey="lower" name="Left rejection region" type="monotone" stroke="none" fill={c.reject} fillOpacity={0.45} />
                  <Area dataKey="upper" name="Right rejection region" type="monotone" stroke="none" fill={c.reject} fillOpacity={0.45} />
                  <Area dataKey="center" name="Non-rejection region" type="monotone" stroke="none" fill={c.second} fillOpacity={0.18} />
                  <Line dataKey="y" name={isT(result) ? `Student t curve (df = ${result.df})` : "Standard normal curve"} type="monotone" stroke={c.accent} strokeWidth={3} dot={false} />
                  {result.critical.map((v, i) => <ReferenceLine key={i} x={v} stroke={c.reject} strokeDasharray="5 4" label={{ value: `${S}c ${v.toFixed(2)}`, fill: c.reject, fontSize: 14, position: "top" }} />)}
                  <ReferenceLine x={Math.max(-limit, Math.min(limit, stat))} stroke={c.observed} strokeWidth={2.5} label={{ value: `${S} ${stat.toFixed(2)}`, fill: c.observed, fontSize: 14, position: "insideTopRight" }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="legend">
              <span><i className="legend-dot" style={{ background: c.reject }} /> Rejection region</span>
              <span><i className="legend-dot" style={{ background: c.second }} /> Non-rejection region</span>
              <span><i className="legend-dot" style={{ background: c.observed }} /> Calculated {S}</span>
            </div>
            <div className={`decision-panel ${rejected ? "reject" : "keep"}`}>
              <b>{interp.decision}</b>
              <p>{interp.detail}</p>
              <small>The decision uses the selected tail and the critical {S} value(s) from the {isT(result) ? "t-table" : "Z-table"} below.</small>
            </div>
          </section>

          <section className="panel">
            <div className="panel-heading"><h2>4. Computation summary</h2></div>
            <div className="computation-grid">
              <div><small>Standard error</small><b>{result.standardError.toFixed(5)}</b></div>
              <div><small>Test statistic</small><b>{S} = {stat.toFixed(5)}</b></div>
              {isT(result) && <div><small>Degrees of freedom</small><b>df = {result.df}</b></div>}
              <div><small>Critical value(s)</small><b>{result.critical.map(v => v.toFixed(5)).join(", ")}</b></div>
              <div><small>Significance level</small><b>α = {alpha}</b></div>
            </div>
            {isT(result)
              ? <p className="helper-text"><b>{result.dfNote}.</b> {usedTest === "two"
                  ? "This is the conservative rule used in class. Software such as R or SPSS uses the Welch–Satterthwaite df, which is usually larger, so its critical values and p-values can differ slightly from Statify's."
                  : "For a one-sample t-test the degrees of freedom are always n − 1."}</p>
              : <p className="helper-text">Two-sample variance inputs should be checked against your instructor's intended variance convention before final submission.</p>}
          </section>
        </>
      )}

      <section className="panel">
        {(result ? isT(result) : family === "t") ? (
          <>
            <div className="panel-heading">
              <div><h2>{result ? "5. " : ""}Student t table (critical values)</h2><p>{result ? "The row for your df and the column for your α and tail are highlighted." : "Reference table. Calculate a test to highlight your df row and critical value."}</p></div>
            </div>
            {result && isT(result)
              ? <TTable df={result.df} t={result.t} critical={result.critical} tail={result.tail} alpha={result.alpha} reject={rejected} />
              : <TTable />}
          </>
        ) : (
          <>
            <div className="panel-heading">
              <div><h2>{result ? "5. " : ""}Standard normal (Z) table</h2><p>{result ? "Your calculated and critical Z values are highlighted." : "Reference table. Calculate a test to highlight your Z values."}</p></div>
            </div>
            <ZTable marks={marks} />
          </>
        )}
      </section>
    </>
  );
}