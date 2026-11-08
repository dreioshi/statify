"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Activity, CheckCircle2, Eraser, FlaskRound, Lightbulb, Plus, Trash2, TriangleAlert } from "lucide-react";
import { CartesianGrid, ComposedChart, Line, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from "recharts";
import PageHeader from "@/components/ui/PageHeader";
import { chartColors, useTheme } from "@/components/theme/ThemeProvider";
import { correlationStrength, regression, type Pair } from "@/lib/statistics/regression";
import { interpretRegression } from "@/lib/statistics/interpret";
import { nextAnalysisName, readHistory, saveHistory } from "@/lib/storage/history";
import { useAuth } from "@/components/auth/AuthProvider";

type Row = { x: string; y: string };
const blankRows = (n = 5): Row[] => Array.from({ length: n }, () => ({ x: "", y: "" }));
const sample: Pair[] = [{x:2,y:65},{x:3,y:75},{x:4,y:82},{x:5,y:88},{x:6,y:92},{x:7,y:98},{x:8,y:105},{x:9,y:112},{x:10,y:118},{x:11,y:122}];
const sampleRows = (): Row[] => sample.map(p => ({ x: String(p.x), y: String(p.y) }));
const equation = (a: number, b: number) => `Ŷ = ${a.toFixed(3)} ${b < 0 ? "−" : "+"} ${Math.abs(b).toFixed(3)}X`;

export default function RegressionPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const c = chartColors(theme);
  const [rows, setRows] = useState<Row[]>(blankRows());
  const [xName, setXName] = useState("");
  const [yName, setYName] = useState("");
  const [name, setName] = useState("");
  const [result, setResult] = useState<ReturnType<typeof regression> | null>(null);
  const [labels, setLabels] = useState({ x: "X", y: "Y" });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<{ name: string; duplicate: boolean } | null>(null);

  const setCell = (i: number, key: "x" | "y", value: string) =>
    setRows(old => old.map((v, j) => (j === i ? { ...v, [key]: value } : v)));

  const loadSample = () => { setRows(sampleRows()); setXName("Study hours"); setYName("Exam score"); setResult(null); setError(""); setSaved(null); };
  const clearAll = () => { setRows(blankRows()); setXName(""); setYName(""); setName(""); setResult(null); setError(""); setSaved(null); };

  const calculate = async () => {
    setSaved(null);
    try {
      const filled = rows.map((r, i) => ({ r, i })).filter(({ r }) => r.x.trim() !== "" || r.y.trim() !== "");
      const points = filled.map(({ r, i }) => {
        if (r.x.trim() === "" || r.y.trim() === "") throw new Error(`Complete both X and Y values in row ${i + 1}, or clear the row.`);
        const x = Number(r.x), y = Number(r.y);
        if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error(`Enter valid numbers in row ${i + 1}.`);
        return { x, y };
      });
      if (points.length === 0) throw new Error("Enter your data first, or press “Load sample” to try an example.");
      const res = regression(points);
      const lbl = { x: xName.trim() || "X", y: yName.trim() || "Y" };
      setResult(res); setLabels(lbl); setError("");

    // Automatically save to Analysis History (Supabase when configured)
      try {
        if (!user) return; // guests: calculate only, nothing is saved
        const history = await readHistory();
        const signature = JSON.stringify(points);
        const last = history.find(h => h.type === "Regression");
        const duplicate = !!last && JSON.stringify((last.result as { points?: Pair[] })?.points) === signature;
        const finalName = name.trim() || (await nextAnalysisName("Regression"));
        if (!duplicate) {
          const interpretation = interpretRegression(res, lbl.x, lbl.y);
          await saveHistory({
            id: crypto.randomUUID(), name: finalName, type: "Regression", createdAt: new Date().toISOString(),
            summary: `r = ${res.r.toFixed(4)} · r² = ${res.r2.toFixed(4)} · ${equation(res.a, res.b)}`,
            inputs: { rows: filled.map(f => f.r), xName: lbl.x, yName: lbl.y },
            result: { ...res, interpretation: interpretation.headline },
          });
        }
        setSaved({ name: duplicate ? (last?.name ?? finalName) : finalName, duplicate });
      } catch (saveErr) {
        setError(`Calculated, but the analysis could not be saved: ${saveErr instanceof Error ? saveErr.message : "unknown error"}`);
      } 
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to calculate regression.");
      setResult(null);
    }
  };

  const interp = useMemo(() => (result ? interpretRegression(result, labels.x, labels.y) : null), [result, labels]);
  const chartData = result ? result.points.map((p, i) => ({ x: p.x, y: p.y, fitted: result.fitted[i] })).sort((a, b) => a.x - b.x) : [];
  const tooltipStyle = { background: c.tooltipBg, color: c.tooltipText, border: `1px solid ${c.grid}`, borderRadius: 10 };

  return (
    <>
      <PageHeader title="Regression & Correlation" description="Explore the linear relationship between paired independent (X) and dependent (Y) observations." />
      <div className="analysis-layout">
        <section className="panel">
          <div className="panel-heading">
            <div><h2>Paired data</h2><p>Enter one X and Y value for each observation. Empty rows are ignored.</p></div>
            <button className="button subtle" onClick={loadSample}><FlaskRound size={18} /> Load sample</button>
          </div>
          <div className="form-grid compact">
            <label className="field-label">X variable name (optional)<input placeholder="e.g. Study hours" value={xName} onChange={e => setXName(e.target.value)} /></label>
            <label className="field-label">Y variable name (optional)<input placeholder="e.g. Exam score" value={yName} onChange={e => setYName(e.target.value)} /></label>
          </div>
          <div className="data-table">
            <div className="table-scroll">
              <div className="table-head"><span>#</span><span>{xName.trim() || "Independent X"}</span><span>{yName.trim() || "Dependent Y"}</span><span /></div>
              {rows.map((r, i) => (
                <div className="table-row" key={i}>
                  <span>{i + 1}</span>
                  <input aria-label={`X value row ${i + 1}`} type="number" inputMode="decimal" value={r.x} onChange={e => setCell(i, "x", e.target.value)} />
                  <input aria-label={`Y value row ${i + 1}`} type="number" inputMode="decimal" value={r.y} onChange={e => setCell(i, "y", e.target.value)} />
                  <button className="icon-button danger" aria-label={`Remove row ${i + 1}`} onClick={() => setRows(old => old.filter((_, j) => j !== i))}><Trash2 size={17} /></button>
                </div>
              ))}
            </div>
          </div>
          <label className="field-label">Analysis name (optional)<input placeholder="Auto-named if left blank" value={name} onChange={e => setName(e.target.value)} /></label>
          <div className="button-row">
            <div className="button-group">
              <button className="button secondary" onClick={() => setRows(old => [...old, { x: "", y: "" }])}><Plus size={18} /> Add row</button>
              <button className="button subtle" onClick={clearAll}><Eraser size={18} /> Clear</button>
            </div>
            <button className="button primary" onClick={calculate}>Calculate regression <Activity size={18} /></button>
          </div>
          {error && <p className="error-message" role="alert"><TriangleAlert size={18} />{error}</p>}
          {!user && <p className="helper-text">Guest mode: results are not saved. <Link href="/login">Sign in</Link> to keep an analysis history.</p>}
          {saved && (
            <p className="success-message" role="status">
              <CheckCircle2 size={18} />
              <span>{saved.duplicate ? <>Same data is already in <b>{saved.name}</b>, so no new record was added.</> : <>Saved to Analysis History as <b>{saved.name}</b>.</>} <Link href="/history">View history</Link></span>
            </p>
          )}
        </section>

        <section className="panel">
          <div className="panel-heading"><h2>Regression output</h2><span className="module-tag">Module 7</span></div>
          {result ? (
            <>
              <div className="equation-card"><small>Fitted regression line</small><strong>{equation(result.a, result.b)}</strong></div>
              <div className="metric-grid">
                <div className="metric-card"><small>Pearson r</small><b>{result.r.toFixed(4)}</b><span>{correlationStrength(result.r)} {result.r >= 0 ? "positive" : "negative"}</span></div>
                <div className="metric-card"><small>r² (determination)</small><b>{result.r2.toFixed(4)}</b><span>{(result.r2 * 100).toFixed(1)}% of Y explained</span></div>
                <div className="metric-card"><small>Slope (b)</small><b>{result.b.toFixed(3)}</b><span>Change in fitted Y per X unit</span></div>
                <div className="metric-card"><small>Intercept (a)</small><b>{result.a.toFixed(3)}</b><span>Fitted Y when X = 0</span></div>
              </div>
              <p className="helper-text">Based on {result.points.length} paired observations.</p>
            </>
          ) : (
          <div className="empty-state tall"><p>Enter your data and press <b>Calculate regression</b> to see the fitted equation, Pearson correlation, and interpretation. New here? Use <b>Load sample</b>.</p></div>          )}
        </section>
      </div>

      {result && interp && (
        <>
          <section className="panel interpretation">
            <div className="panel-heading"><div><h2>Interpretation of results</h2><p>What the numbers mean in plain language.</p></div><Lightbulb className="panel-icon" size={24} /></div>
            <p className="interp-headline">{interp.headline}</p>
            <div className="interp-grid">
              {interp.items.map(item => (
                <article key={item.title} className="interp-item"><h3>{item.title}</h3><p>{item.text}</p></article>
              ))}
            </div>
            <p className="caution"><TriangleAlert size={18} /><span>{interp.caution}</span></p>
          </section>

          <section className="panel chart-panel">
            <div className="panel-heading"><div><h2>Scatter diagram &amp; fitted line</h2><p>Observed values and the least-squares fitted regression line.</p></div></div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 12, right: 20, bottom: 30, left: 12 }}>
                  <CartesianGrid stroke={c.grid} strokeDasharray="4 4" />
                  <XAxis type="number" dataKey="x" name={labels.x} domain={["auto", "auto"]} stroke={c.axis} tick={{ fill: c.axis, fontSize: 14 }} label={{ value: labels.x, position: "insideBottom", offset: -16, fill: c.axis, fontSize: 14 }} />
                  <YAxis type="number" dataKey="y" name={labels.y} domain={["auto", "auto"]} stroke={c.axis} tick={{ fill: c.axis, fontSize: 14 }} label={{ value: labels.y, angle: -90, position: "insideLeft", fill: c.axis, fontSize: 14 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line dataKey="fitted" name="Fitted Y" type="linear" stroke={c.second} strokeWidth={3} dot={false} />
                  <Scatter dataKey="y" name="Observed Y" fill={c.accent} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="legend">
              <span><i className="legend-dot" style={{ background: c.accent }} /> Observed data</span>
              <span><i className="legend-dot" style={{ background: c.second }} /> Fitted regression line</span>
            </div>
          </section>

          <section className="panel">
            <div className="panel-heading"><div><h2>Fitted values &amp; residuals</h2><p>Residual = actual Y − predicted Y, as defined in Module 7.</p></div></div>
            <div className="responsive-table">
              <table>
                <thead><tr><th>#</th><th>{labels.x}</th><th>Actual {labels.y}</th><th>Fitted Ŷ</th><th>Residual</th><th>Position</th></tr></thead>
                <tbody>
                  {result.points.map((p, i) => (
                    <tr key={i}><td>{i + 1}</td><td>{p.x}</td><td>{p.y}</td><td>{result.fitted[i].toFixed(3)}</td><td>{result.residuals[i].toFixed(3)}</td><td>{result.residuals[i] > 0 ? "Above line" : result.residuals[i] < 0 ? "Below line" : "On line"}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="helper-text">Positive residuals are above the fitted line; negative residuals are below it. Small residuals are described in Module 7 as signs of a good fit.</p>
          </section>
        </>
      )}
    </>
  );
}