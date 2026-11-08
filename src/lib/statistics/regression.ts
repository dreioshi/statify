export type Pair = { x: number; y: number };
export type RegressionResult = {
  a: number; b: number; r: number; r2: number; points: Pair[];
  fitted: number[]; residuals: number[]; sums: { n: number; sumX: number; sumY: number; sumX2: number; sumXY: number };
};

function finite(value: number, label: string) {
  if (!Number.isFinite(value)) throw new Error(`${label} must be a valid finite number.`);
}

export function regression(points: Pair[]): RegressionResult {
  if (points.length < 2) throw new Error("Enter at least two complete paired observations.");
  points.forEach((p, i) => { finite(p.x, `X in row ${i + 1}`); finite(p.y, `Y in row ${i + 1}`); });
  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumY2 = points.reduce((s, p) => s + p.y * p.y, 0);
  const denominator = n * sumX2 - sumX * sumX;
  if (Math.abs(denominator) < Number.EPSILON) throw new Error("X must contain at least two different values to calculate a regression line.");
  const b = (n * sumXY - sumX * sumY) / denominator;
  const a = (sumY - b * sumX) / n;
  const correlationDenominator = Math.sqrt(denominator * (n * sumY2 - sumY * sumY));
  if (correlationDenominator === 0) throw new Error("Y must contain variation to calculate Pearson's correlation coefficient.");
  const r = Math.max(-1, Math.min(1, (n * sumXY - sumX * sumY) / correlationDenominator));
  const fitted = points.map(p => a + b * p.x);
  const residuals = points.map((p, i) => p.y - fitted[i]);
  return { a, b, r, r2: r * r, points: [...points], fitted, residuals, sums: { n, sumX, sumY, sumX2, sumXY } };
}

/** Strength bands transcribed from the Module 7 slide; direction is reported separately. */
export function correlationStrength(r: number): string {
  const value = Math.abs(r);
  if (value >= 0.9) return "Very high";
  if (value >= 0.7) return "High";
  if (value >= 0.5) return "Moderate";
  if (value >= 0.3) return "Low";
  return "Negligible";
}
