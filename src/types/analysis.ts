export type AnalysisRecord = {
  id: string; name: string; type: "Regression" | "Hypothesis testing";
  createdAt: string; summary: string; inputs: unknown; result: unknown;
};
