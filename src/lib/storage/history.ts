import { supabase } from "@/lib/supabase";
import type { AnalysisRecord } from "@/types/analysis";

/**
 * Analysis history.
 * - Supabase configured  -> rows live in public.analyses (per-user, protected by RLS).
 * - Supabase NOT configured (no .env.local) -> falls back to browser localStorage, as before.
 */
const KEY = "statscope-history-v2";

function readLocal(): AnalysisRecord[] {
  if (typeof window === "undefined") return [];
  try { const parsed = JSON.parse(window.localStorage.getItem(KEY) || "[]"); return Array.isArray(parsed) ? parsed : []; }
  catch { return []; }
}
function writeLocal(items: AnalysisRecord[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(items));
}

type Row = {
  id: string; name: string; analysis_type: AnalysisRecord["type"];
  summary: string | null; payload: { inputs?: unknown; result?: unknown } | null; created_at: string;
};
const fromRow = (r: Row): AnalysisRecord => ({
  id: r.id, name: r.name, type: r.analysis_type, createdAt: r.created_at,
  summary: r.summary ?? "", inputs: r.payload?.inputs ?? null, result: r.payload?.result ?? null,
});

export async function readHistory(): Promise<AnalysisRecord[]> {
  if (!supabase) return readLocal();
  const { data, error } = await supabase.from("analyses").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Row[]).map(fromRow);
}

export async function saveHistory(record: AnalysisRecord): Promise<void> {
  if (!supabase) { writeLocal([record, ...readLocal()]); return; }
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) throw new Error("You are signed out. Please sign in again.");
  const { error } = await supabase.from("analyses").insert({
    id: record.id, user_id: userId, name: record.name, analysis_type: record.type,
    summary: record.summary, payload: { inputs: record.inputs, result: record.result }, created_at: record.createdAt,
  });
  if (error) throw new Error(error.message);
}

export async function renameRecord(id: string, name: string): Promise<void> {
  if (!supabase) { writeLocal(readLocal().map(x => (x.id === id ? { ...x, name } : x))); return; }
  const { error } = await supabase.from("analyses").update({ name }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteRecord(id: string): Promise<void> {
  if (!supabase) { writeLocal(readLocal().filter(x => x.id !== id)); return; }
  const { error } = await supabase.from("analyses").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Next default name such as "Regression #3", based on how many of that type are already saved. */
export async function nextAnalysisName(type: AnalysisRecord["type"], prefix?: string): Promise<string> {
  let count: number;
  if (!supabase) count = readLocal().filter(x => x.type === type).length;
  else {
    const { count: c, error } = await supabase.from("analyses").select("id", { count: "exact", head: true }).eq("analysis_type", type);
    if (error) throw new Error(error.message);
    count = c ?? 0;
  }
  return `${prefix ?? (type === "Regression" ? "Regression" : "Z-test")} #${count + 1}`;
}