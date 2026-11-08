"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { normalCdf } from "@/lib/statistics/z-tests";

export type ZMark = { z: number; kind: "observed" | "critical"; label: string };

const COLS = Array.from({ length: 10 }, (_, i) => i);
const ROWS = Array.from({ length: 35 }, (_, i) => i); // 0.0 … 3.4

/** Locate a z-score in the table. Returns null when |z| is beyond the 3.49 limit of the printed table. */
function locate(z: number) {
  const cents = Math.round(Math.abs(z) * 100);
  if (cents > 349) return null;
  return { row: Math.floor(cents / 10), col: cents % 10, sign: z < 0 ? "neg" as const : "pos" as const };
}
const area = (z: number) => normalCdf(z).toFixed(4);
const fmtZ = (z: number) => (z < 0 ? "−" : "") + Math.abs(z).toFixed(2);

export default function ZTable({ marks = [] }: { marks?: ZMark[] }) {
  const observed = marks.find(m => m.kind === "observed");
  const [sign, setSign] = useState<"neg" | "pos">(observed && observed.z < 0 ? "neg" : "pos");
  const wrapRef = useRef<HTMLDivElement>(null);

  // Jump to the table half that holds the observed Z when a new result arrives.
  const observedZ = observed?.z;
  useEffect(() => { if (observedZ !== undefined) setSign(observedZ < 0 ? "neg" : "pos"); }, [observedZ]);

  const placed = useMemo(() => marks.map(m => ({ ...m, loc: locate(m.z) })), [marks]);
  const onThisHalf = placed.filter(m => m.loc && m.loc.sign === sign);

  // Scroll the first highlighted row into view inside the table's own scroller.
  const firstRow = onThisHalf[0]?.loc?.row;
  useEffect(() => {
    if (firstRow === undefined || !wrapRef.current) return;
    const el = wrapRef.current.querySelector<HTMLElement>(`[data-row="${firstRow}"]`);
    if (el) wrapRef.current.scrollTo({ top: Math.max(0, el.offsetTop - 120), behavior: "smooth" });
  }, [firstRow, sign]);

  const cellMark = (row: number, col: number) =>
    onThisHalf.find(m => m.loc!.row === row && m.loc!.col === col);

  return (
    <div className="ztable">
      <div className="ztable-top">
        <div className="segmented" role="tablist" aria-label="Z-table half">
          <button role="tab" aria-selected={sign === "neg"} className={sign === "neg" ? "on" : ""} onClick={() => setSign("neg")}>Negative z</button>
          <button role="tab" aria-selected={sign === "pos"} className={sign === "pos" ? "on" : ""} onClick={() => setSign("pos")}>Positive z</button>
        </div>
        <p className="ztable-hint">Each cell is the area under the standard normal curve to the <b>left</b> of z, P(Z ≤ z).</p>
      </div>

      {placed.length > 0 && (
        <ul className="ztable-lookups">
          {placed.map((m, i) => (
            <li key={i} className={m.kind}>
              <span className="swatch" />
              <span>
                <b>{m.label}: z = {fmtZ(m.z)}</b>{" "}
                {m.loc
                  ? <>→ row {m.z < 0 ? "−" : ""}{(m.loc.row / 10).toFixed(1)}, column .{String(m.loc.col).padStart(2, "0")} → area <b>{area(m.z)}</b></>
                  : <>→ beyond the table (|z| &gt; 3.49), area ≈ {area(m.z)}</>}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="ztable-scroll" ref={wrapRef}>
        <table>
          <caption className="sr-only">Standard normal distribution table, {sign === "neg" ? "negative" : "positive"} z-scores</caption>
          <thead>
            <tr>
              <th scope="col" className="corner">z</th>
              {COLS.map(c => <th scope="col" key={c}>.0{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(r => {
              const rowActive = onThisHalf.some(m => m.loc!.row === r);
              return (
                <tr key={r} data-row={r} className={rowActive ? "row-active" : ""}>
                  <th scope="row">{sign === "neg" ? "−" : ""}{(r / 10).toFixed(1)}</th>
                  {COLS.map(c => {
                    const z = sign === "neg" ? -(r * 10 + c) / 100 : (r * 10 + c) / 100;
                    const mark = cellMark(r, c);
                    return (
                      <td key={c} className={mark ? `hit ${mark.kind}` : ""} title={`z = ${fmtZ(z)}`}>
                        {normalCdf(z).toFixed(4)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="ztable-hint">
        How to read it: split z into its row (first decimal) and column (second decimal). For z = 1.96, go to row 1.9 and column .06 to find 0.9750.
      </p>
    </div>
  );
}
