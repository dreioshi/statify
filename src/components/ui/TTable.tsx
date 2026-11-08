"use client";
import { useEffect, useMemo, useRef } from "react";
import { inverseT } from "@/lib/statistics/t-tests";
import type { Tail } from "@/lib/statistics/z-tests";

/** One-tail areas shown as columns (two-tail area = 2 × one-tail area). */
const AREAS = [0.10, 0.05, 0.025, 0.01, 0.005];
const BASE_DF = [...Array.from({ length: 30 }, (_, i) => i + 1), 35, 40, 45, 50, 60, 70, 80, 90, 100, 120];

type Props = {
  /** Degrees of freedom used by the test; that row is highlighted. */
  df?: number;
  /** Calculated t statistic. */
  t?: number;
  critical?: number[];
  tail?: Tail;
  alpha?: number;
  reject?: boolean;
};

export default function TTable({ df, t, critical, tail, alpha, reject }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rows = useMemo(() => {
    const dfs = df && !BASE_DF.includes(df) ? [...BASE_DF, df].sort((a, b) => a - b) : BASE_DF;
    return dfs.map(d => ({ df: d, values: AREAS.map(a => inverseT(1 - a, d)) }));
  }, [df]);

  const active = df !== undefined && alpha !== undefined && tail !== undefined;
  const area = active ? (tail === "two" ? alpha! / 2 : alpha!) : undefined;
  const colHit = (a: number) => area !== undefined && Math.abs(a - area) < 1e-9;
  const showNotes = active && critical !== undefined && t !== undefined;

  useEffect(() => {
    const wrap = wrapRef.current;
    const row = wrap?.querySelector<HTMLElement>("tr.row-active");
    const head = wrap?.querySelector<HTMLElement>("thead");
    if (wrap && row) wrap.scrollTop = Math.max(0, row.offsetTop - (head?.offsetHeight ?? 0) - wrap.clientHeight / 2 + row.clientHeight / 2);
  }, [df, rows]);

  return (
    <div className="ztable">
      {showNotes && (
        <ul className="ztable-lookups">
          <li className="observed"><i className="swatch" /><span>Calculated t = <b>{t!.toFixed(3)}</b> with df = <b>{df}</b>. It is {reject ? "inside" : "outside"} the rejection region. (A t statistic is compared with the critical value, so it is not a table cell.)</span></li>
          <li className="critical"><i className="swatch" /><span>Critical value{critical!.length > 1 ? "s" : ""}: <b>{critical!.length > 1 ? `±${Math.abs(critical![1]).toFixed(3)}` : critical![0].toFixed(3)}</b> — row df = {df}, column {tail === "two" ? `two-tail ${alpha}` : `one-tail ${alpha}`} (area {area}). The table is rounded; Statify uses the exact value.</span></li>
        </ul>
      )}
      <div className="ztable-scroll" ref={wrapRef}>
        <table style={{ minWidth: 560 }}>
          <thead>
            <tr>
              <th className="corner">df</th>
              {AREAS.map(a => (
                <th key={a} className={colHit(a) ? "hit-col" : ""}>
                  {a}
                  <small>two-tail {Number((a * 2).toFixed(3))}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.df} className={active && r.df === df ? "row-active" : ""}>
                <th scope="row">{r.df}</th>
                {r.values.map((v, i) => (
                  <td key={AREAS[i]} className={active && r.df === df && colHit(AREAS[i]) ? "hit critical" : colHit(AREAS[i]) ? "col-active" : ""}>{v.toFixed(3)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}