"use client";
import { useEffect, useState } from "react";
import { ChevronDown, Database, FlaskConical, Save, Search, Trash2, TrendingUp, Pencil } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import AnalysisDetail from "@/components/ui/AnalysisDetail";
import { deleteRecord, readHistory, renameRecord } from "@/lib/storage/history";
import { supabase } from "@/lib/supabase";
import type { AnalysisRecord } from "@/types/analysis";

export default function HistoryPage() {
  const [items, setItems] = useState<AnalysisRecord[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { readHistory().then(setItems).catch(e => setError(e instanceof Error ? e.message : "Could not load history.")); }, []);

  const remove = async (id: string) => {
    try {
      await deleteRecord(id); setError("");
      setItems(items.filter(x => x.id !== id));
      if (openId === id) setOpenId(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not delete the analysis."); }
  };
  const rename = async (id: string) => {
    const newName = draft.trim() || items.find(x => x.id === id)?.name || "";
    try {
      await renameRecord(id, newName); setError("");
      const next = items.map(x => (x.id === id ? { ...x, name: newName } : x));
      setItems(next); setEditing(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not rename the analysis."); }
  };
  const filtered = items.filter(x => `${x.name} ${x.type} ${x.summary}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <PageHeader title="Analysis History" description="Every analysis you calculate is saved here automatically. Rename, inspect, or delete records." />
      <section className="panel">
        <div className="panel-heading">
          <div><h2>Saved analyses</h2><p>{items.length} saved record{items.length === 1 ? "" : "s"}</p></div>
          <label className="search-field"><Search size={18} /><input placeholder="Search analyses..." value={query} onChange={e => setQuery(e.target.value)} /></label>
        </div>
        {error && <p className="error-message" role="alert">{error}</p>}
        {filtered.map(item => {
          const open = openId === item.id;
          return (
            <div className={`history-entry ${open ? "is-open" : ""}`} key={item.id}>
              <article className="history-item">
                <span className={`quick-icon ${item.type === "Regression" ? "lime" : "mint"}`}>{item.type === "Regression" ? <TrendingUp /> : <FlaskConical />}</span>
                <div className="history-main">
                  {editing === item.id
                    ? <div className="rename-row"><input value={draft} onChange={e => setDraft(e.target.value)} autoFocus /><button className="icon-button" onClick={() => rename(item.id)} aria-label="Save name"><Save size={18} /></button></div>
                    : <b>{item.name}</b>}
                  <small>{item.type} · {new Date(item.createdAt).toLocaleString()}</small>
                  <p>{item.summary}</p>
                </div>
                <div className="history-actions">
                  <button className="button subtle details-btn" aria-expanded={open} aria-controls={`detail-${item.id}`} onClick={() => setOpenId(open ? null : item.id)}>
                    {open ? "Hide details" : "Details"}<ChevronDown size={18} className="chev" />
                  </button>
                  <button className="icon-button" aria-label="Rename analysis" onClick={() => { setEditing(item.id); setDraft(item.name); }}><Pencil size={18} /></button>
                  <button className="icon-button danger" aria-label="Delete analysis" onClick={() => remove(item.id)}><Trash2 size={18} /></button>
                </div>
              </article>
              {open && (
                <div className="history-detail" id={`detail-${item.id}`}>
                  <AnalysisDetail record={item} />
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="empty-state"><Database size={28} /><p>{items.length === 0 ? "No analyses yet. Every regression or Z-test you calculate is saved here automatically." : "No analyses match your search."}</p></div>
        )}
        <p className="helper-text">{supabase ? "These records are saved to your Statify account and are only visible to you." : "These records are stored locally in this browser (Supabase is not configured)."}</p>
      </section>
    </>
  );
}