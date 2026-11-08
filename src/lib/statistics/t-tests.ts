import type { Tail } from "./z-tests";

export type TResult = {
  t: number; critical: number[]; decision: "Reject H₀" | "Fail to reject H₀"; tail: Tail; alpha: number;
  standardError: number; df: number; dfNote: string;
};

/** ln Γ(x) (Lanczos approximation). */
function lnGamma(x: number): number {
  const g = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x; const tmp = x + 5.5 - (x + 0.5) * Math.log(x + 5.5);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) ser += g[j] / ++y;
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

/** Continued fraction for the regularized incomplete beta function (Lentz's method). */
function betaCf(a: number, b: number, x: number): number {
  const FPMIN = 1e-300; const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d; let h = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; const del = d * c; h *= del;
    if (Math.abs(del - 1) < 1e-15) break;
  }
  return h;
}

/** Regularized incomplete beta I_x(a, b). */
function betaI(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? (bt * betaCf(a, b, x)) / a : 1 - (bt * betaCf(b, a, 1 - x)) / b;
}

/** Student t cumulative probability P(T <= t) for df degrees of freedom. */
export function tCdf(t: number, df: number): number {
  const x = df / (df + t * t);
  const tail = 0.5 * betaI(df / 2, 0.5, x); // P(T > |t|)
  return t >= 0 ? 1 - tail : tail;
}

/** Student t probability density f(x) for df degrees of freedom (used to draw the curve). */
export function tPdf(x: number, df: number): number {
  return Math.exp(lnGamma((df + 1) / 2) - lnGamma(df / 2) - 0.5 * Math.log(df * Math.PI) - ((df + 1) / 2) * Math.log(1 + (x * x) / df));
}

/** Inverse of the Student t CDF, found by bisection (exact to ~1e-12, so it matches printed t-tables). */
export function inverseT(p: number, df: number): number {
  if (!(p > 0 && p < 1)) throw new Error("Probability must be between 0 and 1.");
  if (!(df >= 1)) throw new Error("Degrees of freedom must be at least 1.");
  if (p === 0.5) return 0;
  if (p < 0.5) return -inverseT(1 - p, df);
  let lo = 0, hi = 1;
  while (tCdf(hi, df) < p && hi < 1e9) hi *= 2;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (tCdf(mid, df) < p) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

function validateAlpha(alpha: number) { if (!(alpha > 0 && alpha < 1)) throw new Error("Significance level α must be between 0 and 1."); }
function validateN(n: number, label: string) { if (!Number.isInteger(n) || n < 2) throw new Error(`${label} must be a whole number of at least 2.`); }

function makeTResult(t: number, standardError: number, df: number, dfNote: string, alpha: number, tail: Tail): TResult {
  validateAlpha(alpha);
  const critical = tail === "two" ? [-inverseT(1 - alpha / 2, df), inverseT(1 - alpha / 2, df)]
    : tail === "right" ? [inverseT(1 - alpha, df)] : [inverseT(alpha, df)];
  const reject = tail === "two" ? Math.abs(t) > critical[1] : tail === "right" ? t > critical[0] : t < critical[0];
  return { t, critical, decision: reject ? "Reject H₀" : "Fail to reject H₀", tail, alpha, standardError, df, dfNote };
}

/** One-sample t-test: t = (x̄ − μ₀) / (s/√n), df = n − 1. */
export function oneSampleT(mean: number, hypothesizedMean: number, sd: number, n: number, alpha: number, tail: Tail): TResult {
  [mean, hypothesizedMean, sd].forEach((v, i) => { if (!Number.isFinite(v)) throw new Error(["Sample mean", "Hypothesized mean", "Sample standard deviation"][i] + " must be finite."); });
  if (sd <= 0) throw new Error("Sample standard deviation s must be greater than zero.");
  validateN(n, "Sample size n");
  const se = sd / Math.sqrt(n), df = n - 1;
  return makeTResult((mean - hypothesizedMean) / se, se, df, `df = n − 1 = ${n} − 1 = ${df}`, alpha, tail);
}

/** Two-sample t-test (unpooled), conservative class rule: df = min(n₁ − 1, n₂ − 1). */
export function twoSampleT(mean1: number, mean2: number, sd1: number, sd2: number, n1: number, n2: number, alpha: number, tail: Tail): TResult {
  [mean1, mean2, sd1, sd2].forEach(v => { if (!Number.isFinite(v)) throw new Error("All sample means and standard deviations must be finite numbers."); });
  if (sd1 < 0 || sd2 < 0) throw new Error("Standard deviations cannot be negative.");
  validateN(n1, "Sample size n₁"); validateN(n2, "Sample size n₂");
  const se = Math.sqrt((sd1 * sd1) / n1 + (sd2 * sd2) / n2);
  if (se === 0) throw new Error("The standard error is zero. Check the standard deviations.");
  const df = Math.min(n1 - 1, n2 - 1);
  return makeTResult((mean1 - mean2) / se, se, df, `df = min(n₁ − 1, n₂ − 1) = min(${n1 - 1}, ${n2 - 1}) = ${df}`, alpha, tail);
}