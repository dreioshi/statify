export type Tail = "two" | "left" | "right";
export type ZResult = { z: number; critical: number[]; decision: "Reject H₀" | "Fail to reject H₀"; tail: Tail; alpha: number; standardError: number };

// Acklam's inverse standard-normal approximation, used to obtain Z critical values.
export function inverseNormal(p: number): number {
  if (!(p > 0 && p < 1)) throw new Error("Probability must be between 0 and 1.");
  const a = [-39.6968302866538,220.946098424521,-275.928510446969,138.357751867269,-30.6647980661472,2.50662827745924];
  const b = [-54.4760987982241,161.585836858041,-155.698979859887,66.8013118877197,-13.2806815528857];
  const c = [-.00778489400243029,-.322396458041136,-2.40075827716184,-2.54973253934373,4.37466414146497,2.93816398269878];
  const d = [.00778469570904146,.32246712907004,2.445134137143,3.75440866190742];
  const pl = .02425, ph = 1 - pl; let q: number, r: number;
  if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  if (p > ph) { q = Math.sqrt(-2 * Math.log(1-p)); return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  q = p - .5; r = q*q;
  return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
}
function validateAlpha(alpha: number) { if (!(alpha > 0 && alpha < 1)) throw new Error("Significance level α must be between 0 and 1."); }
function validateN(n: number, label: string) { if (!Number.isInteger(n) || n < 30) throw new Error(`${label} must be an integer of at least 30 for the Z-test convention stated in Module 9.`); }
function makeResult(z: number, standardError: number, alpha: number, tail: Tail): ZResult {
  validateAlpha(alpha);
  const critical = tail === "two" ? [-inverseNormal(1-alpha/2), inverseNormal(1-alpha/2)] : tail === "right" ? [inverseNormal(1-alpha)] : [inverseNormal(alpha)];
  const reject = tail === "two" ? Math.abs(z) > critical[1] : tail === "right" ? z > critical[0] : z < critical[0];
  return { z, critical, decision: reject ? "Reject H₀" : "Fail to reject H₀", tail, alpha, standardError };
}
export function oneSampleZ(mean: number, hypothesizedMean: number, populationSd: number, n: number, alpha: number, tail: Tail): ZResult {
  [mean,hypothesizedMean,populationSd].forEach((v,i) => { if (!Number.isFinite(v)) throw new Error(["Sample mean","Hypothesized mean","Population standard deviation"][i] + " must be finite."); });
  if (populationSd <= 0) throw new Error("Known population standard deviation σ must be greater than zero.");
  validateN(n,"Sample size n");
  const se = populationSd / Math.sqrt(n);
  return makeResult((mean-hypothesizedMean)/se,se,alpha,tail);
}
export function twoSampleZ(mean1: number, mean2: number, variance1: number, variance2: number, n1: number, n2: number, alpha: number, tail: Tail): ZResult {
  [mean1,mean2,variance1,variance2].forEach(v => { if (!Number.isFinite(v)) throw new Error("All sample means and variance inputs must be finite numbers."); });
  if (variance1 < 0 || variance2 < 0) throw new Error("Variance inputs cannot be negative.");
  validateN(n1,"Sample size n₁"); validateN(n2,"Sample size n₂");
  const se = Math.sqrt(variance1/n1 + variance2/n2);
  if (se === 0) throw new Error("The standard error is zero. Check the variance inputs.");
  return makeResult((mean1-mean2)/se,se,alpha,tail);
}

/** Standard normal cumulative probability P(Z <= z), accurate to about 1e-7 (used to build the Z-table). */
export function normalCdf(z: number): number {
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.5 * x);
  const erfc = t * Math.exp(-x * x - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  const p = 1 - 0.5 * erfc;
  return z >= 0 ? p : 1 - p;
}
