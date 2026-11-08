import { correlationStrength, type RegressionResult } from "./regression";
import type { ZResult } from "./z-tests";
import type { TResult } from "./t-tests";

export type InterpretationItem = { title: string; text: string };
export type RegressionInterpretation = { headline: string; items: InterpretationItem[]; caution: string };

const fmt = (v: number, d = 3) => Number(v.toFixed(d)).toString();

/** Short, plain-language reading of a simple linear regression result (Module 7). */
export function interpretRegression(res: RegressionResult, xName = "X", yName = "Y"): RegressionInterpretation {
  const x = xName.trim() || "X";
  const y = yName.trim() || "Y";
  const { a, b, r, r2, points } = res;
  const strength = correlationStrength(r).toLowerCase();
  const positive = r >= 0;
  const xs = points.map(p => p.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const zeroInRange = minX <= 0 && maxX >= 0;

  const headline = Math.abs(r) < 0.3
    ? `${x} and ${y} have almost no linear relationship (r = ${fmt(r, 3)}).`
    : `${x} and ${y} have a ${strength} ${positive ? "positive" : "negative"} linear relationship (r = ${fmt(r, 3)}). When ${x} goes up, ${y} tends to go ${positive ? "up" : "down"}.`;

  const items: InterpretationItem[] = [
    {
      title: "Slope (b)",
      text: b === 0
        ? `Changing ${x} does not change the fitted ${y}.`
        : `Each 1-unit increase in ${x} ${b > 0 ? "raises" : "lowers"} the fitted ${y} by about ${fmt(Math.abs(b))}.`,
    },
    {
      title: "Intercept (a)",
      text: `The fitted ${y} is ${fmt(a)} when ${x} is 0.${zeroInRange ? "" : ` Since ${x} = 0 is outside your data, don't rely on this value.`}`,
    },
    {
      title: "Correlation (r)",
      text: `${correlationStrength(r)} and ${positive ? "positive" : "negative"}: the points slope ${positive ? "upward" : "downward"}.`,
    },
    {
      title: "r²",
      text: `${fmt(r2 * 100, 1)}% of the changes in ${y} are explained by ${x}.`,
    },
  ];

  const caution = `Only predict ${y} for ${x} values from ${fmt(minX)} to ${fmt(maxX)}, the range of your data. Predictions outside that range are unreliable. Also, correlation does not prove that ${x} causes ${y} to change.`;
  return { headline, items, caution };
}

export function interpretZTest(res: ZResult, h0: string, h1: string, _test: "one" | "two"): { decision: string; detail: string } {
  const rejected = res.decision === "Reject H₀";
  const z = fmt(res.z, 4);
  const crit = res.critical.map(v => fmt(v, 3));
  const where =
    res.tail === "two" ? `beyond ±${crit[1]}`
    : res.tail === "right" ? `above ${crit[0]}`
    : `below ${crit[0]}`;
  const h1t = h1.trim() ? `H₁ (${h1.trim()})` : "H₁";
  return rejected
    ? {
        decision: "Reject H₀.",
        detail: `Z = ${z} is ${where}, so it falls in the rejection region at α = ${res.alpha}. There is enough evidence to support ${h1t}.`,
      }
    : {
        decision: "Fail to reject H₀.",
        detail: `Z = ${z} is not ${where}, so it stays in the non-rejection region at α = ${res.alpha}. There is not enough evidence to support ${h1t}.`,
      };
}

export function interpretTTest(res: TResult, h0: string, h1: string, _test: "one" | "two"): { decision: string; detail: string } {
  const rejected = res.decision === "Reject H₀";
  const t = fmt(res.t, 4);
  const crit = res.critical.map(v => fmt(v, 3));
  const where =
    res.tail === "two" ? `beyond ±${crit[1]}`
    : res.tail === "right" ? `above ${crit[0]}`
    : `below ${crit[0]}`;
  const h1t = h1.trim() ? `H₁ (${h1.trim()})` : "H₁";
  return rejected
    ? {
        decision: "Reject H₀.",
        detail: `t = ${t} (df = ${res.df}) is ${where}, so it falls in the rejection region at α = ${res.alpha}. There is enough evidence to support ${h1t}.`,
      }
    : {
        decision: "Fail to reject H₀.",
        detail: `t = ${t} (df = ${res.df}) is not ${where}, so it stays in the non-rejection region at α = ${res.alpha}. There is not enough evidence to support ${h1t}.`,
      };
}