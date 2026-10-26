import { AlertTriangle, ArrowLeft, Check, Download, Eye, FileJson, Plus, RotateCcw, Upload, Wand2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DRAFT_KEY, parseProfile, portfolioUrl, profileSource, readDraft } from "./lib/data";
import { TIERS } from "./lib/schema";
import { achievementXp, levelFromXp, TIER_LABEL } from "./lib/xp";
import type { Session } from "./lib/auth";

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Studio: a no-install editor for the profile JSON. Students paste / edit
 * JSON (or use the quick-add form), see validation live, preview the result,
 * then download profile.json and drop it into /public/data.
 */
export function Studio({ session, onSignOut }: { session?: Session | null; onSignOut?: () => void } = {}) {
  const [text, setText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = (fromPublished: boolean) => {
    const draft = fromPublished ? null : readDraft();
    if (draft) {
      setText(JSON.stringify(draft, null, 2));
      setLoaded(true);
      return;
    }
    fetch(profileSource(), { cache: "no-cache" })
      .then((r) => r.text())
      .then((t) => {
        setText(t);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  };
  useEffect(() => load(false), []);

  const result = useMemo(() => {
    if (!text.trim()) return { kind: "empty" as const };
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch (e) {
      return { kind: "syntax" as const, message: (e as Error).message };
    }
    const r = parseProfile(raw);
    return r.ok ? { kind: "ok" as const, data: r.data, raw } : { kind: "schema" as const, errors: r.errors };
  }, [text]);

  const saveDraft = () => {
    if (result.kind !== "ok") return false;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(result.raw));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    return true;
  };

  const preview = () => {
    if (saveDraft()) location.href = portfolioUrl(true);
  };

  const download = () => {
    const blob = new Blob([text], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = profileSource().split("/").pop() ?? "profile.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const format = () => {
    try {
      setText(JSON.stringify(JSON.parse(text), null, 2));
    } catch {
      /* leave as-is; error already shown */
    }
  };

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    load(true);
  };

  /* ---- quick add ---- */
  const [qa, setQa] = useState({ title: "", category: "academic", tier: "school", position: "", date: today(), organizer: "", description: "" });
  const addAchievement = () => {
    if (result.kind !== "ok" || !qa.title.trim()) return;
    const raw = structuredClone(result.raw) as { achievements?: unknown[] };
    const entry = Object.fromEntries(Object.entries(qa).filter(([, v]) => v !== ""));
    raw.achievements = [entry, ...(raw.achievements ?? [])];
    setText(JSON.stringify(raw, null, 2));
    setQa({ ...qa, title: "", position: "", organizer: "", description: "" });
  };

  const stats = useMemo(() => {
    if (result.kind !== "ok") return null;
    const d = result.data;
    const xp = d.achievements.reduce((s, a) => s + achievementXp(a, d), 0);
    return { xp, level: levelFromXp(xp), n: d.achievements.length, cats: Object.keys(d.site.categories) };
  }, [result]);

  const input = "w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-accent";
  const lines = text.split("\n").length;

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3">
          <a href={portfolioUrl(false)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted hover:bg-line hover:text-fg">
            <ArrowLeft size={16} /> Portfolio
          </a>
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <Wand2 size={18} className="text-accent" /> Studio
          </div>
          <span className="hidden text-xs text-muted md:inline">editing {profileSource()}</span>
          {session && (
            <span className="hidden items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-muted lg:inline-flex">
              {session.picture && <img src={session.picture} alt="" className="h-5 w-5 rounded-full" />}
              {session.email}
              <button onClick={onSignOut} className="font-semibold text-accent hover:underline">
                Sign out
              </button>
            </span>
          )}
          <div className="ml-auto flex flex-wrap gap-2">
            <button onClick={format} className="rounded-full border border-line px-3 py-2 text-xs font-medium hover:bg-line">
              Format
            </button>
            <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-xs font-medium hover:bg-line">
              <Upload size={13} /> Open file
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) f.text().then(setText);
                e.target.value = "";
              }}
            />
            <button onClick={discardDraft} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-xs font-medium hover:bg-line" title="Discard draft and reload the published JSON">
              <RotateCcw size={13} /> Reset
            </button>
            <button onClick={saveDraft} disabled={result.kind !== "ok"} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-xs font-medium hover:bg-line disabled:opacity-40">
              {saved ? <Check size={13} /> : <FileJson size={13} />} {saved ? "Saved" : "Save draft"}
            </button>
            <button onClick={preview} disabled={result.kind !== "ok"} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-xs font-semibold hover:bg-line disabled:opacity-40">
              <Eye size={13} /> Preview
            </button>
            <button onClick={download} disabled={result.kind !== "ok"} className="bg-gradient inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">
              <Download size={13} /> Download JSON
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1fr_360px]">
        {/* Editor */}
        <div className="flex min-h-[70vh] overflow-hidden rounded-2xl border border-line bg-bg-soft font-mono text-[15px] leading-6">
          <div aria-hidden className="select-none border-r border-line px-3 py-4 text-right text-muted/60">
            {Array.from({ length: lines }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <textarea
            value={loaded ? text : "Loading…"}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            wrap="off"
            className="flex-1 resize-none bg-transparent px-4 py-4 outline-none"
            style={{ height: `${Math.max(lines * 24 + 32, 600)}px` }}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                e.preventDefault();
                const t = e.currentTarget;
                const s = t.selectionStart;
                setText(text.slice(0, s) + "  " + text.slice(t.selectionEnd));
                requestAnimationFrame(() => t.setSelectionRange(s + 2, s + 2));
              }
            }}
          />
        </div>

        {/* Side panel */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className={`rounded-2xl border p-4 text-sm ${result.kind === "ok" ? "border-emerald-500/40 bg-emerald-500/10" : "border-amber-500/40 bg-amber-500/10"}`}>
            {result.kind === "ok" && (
              <div className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
                <Check size={16} /> Valid profile
              </div>
            )}
            {result.kind === "empty" && <div>Paste or write your profile JSON.</div>}
            {result.kind === "syntax" && (
              <>
                <div className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={16} /> JSON syntax error
                </div>
                <p className="mt-1 font-mono text-xs">{result.message}</p>
              </>
            )}
            {result.kind === "schema" && (
              <>
                <div className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={16} /> {result.errors.length} field issue{result.errors.length > 1 ? "s" : ""}
                </div>
                <ul className="mt-2 space-y-1 font-mono text-xs">
                  {result.errors.slice(0, 8).map((e) => (
                    <li key={e}>• {e}</li>
                  ))}
                </ul>
              </>
            )}
            {stats && (
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-bg p-2">
                  <div className="font-display text-xl font-bold">{stats.n}</div>
                  <div className="text-[12px] uppercase text-muted">Trophies</div>
                </div>
                <div className="rounded-xl bg-bg p-2">
                  <div className="font-display text-xl font-bold">{stats.xp}</div>
                  <div className="text-[12px] uppercase text-muted">XP</div>
                </div>
                <div className="rounded-xl bg-bg p-2">
                  <div className="font-display text-xl font-bold">{stats.level.level}</div>
                  <div className="text-[12px] uppercase text-muted">Level</div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-bg-soft p-4">
            <h3 className="flex items-center gap-2 font-display font-semibold">
              <Plus size={16} className="text-accent" /> Quick-add achievement
            </h3>
            <p className="mt-1 text-xs text-muted">Adds an entry to the top of the achievements list.</p>
            <div className="mt-3 space-y-2">
              <input className={input} placeholder="Title *" value={qa.title} onChange={(e) => setQa({ ...qa, title: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <select className={input} value={qa.category} onChange={(e) => setQa({ ...qa, category: e.target.value })}>
                  {(stats?.cats.length ? stats.cats : ["academic", "science", "coding", "sports", "arts", "leadership"]).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <select className={input} value={qa.tier} onChange={(e) => setQa({ ...qa, tier: e.target.value })}>
                  {TIERS.map((t) => (
                    <option key={t} value={t}>
                      {TIER_LABEL[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className={input} placeholder="Position (e.g. 1st Place)" value={qa.position} onChange={(e) => setQa({ ...qa, position: e.target.value })} />
                <input className={input} type="date" value={qa.date} onChange={(e) => setQa({ ...qa, date: e.target.value })} />
              </div>
              <input className={input} placeholder="Organiser" value={qa.organizer} onChange={(e) => setQa({ ...qa, organizer: e.target.value })} />
              <textarea className={input} rows={3} placeholder="What did you do?" value={qa.description} onChange={(e) => setQa({ ...qa, description: e.target.value })} />
              <button onClick={addAchievement} disabled={result.kind !== "ok" || !qa.title.trim()} className="bg-gradient w-full rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-40">
                Add to JSON
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-bg-soft p-4 text-xs leading-relaxed text-muted">
            <b className="text-fg">How publishing works:</b> drafts live only in this browser. When you're happy, click <b>Download JSON</b> and replace{" "}
            <code className="rounded bg-line px-1">public/data/{profileSource().split("/").pop()}</code>, then redeploy.
          </div>
        </aside>
      </div>
    </div>
  );
}
