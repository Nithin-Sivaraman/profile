import { AnimatePresence, motion } from "framer-motion";
import { Calendar, ExternalLink, LayoutGrid, List, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Achievement, ProfileData } from "../lib/schema";
import { TIERS } from "../lib/schema";
import { achievementXp, categoryMeta, formatDate, medalFor, TIER_LABEL } from "../lib/xp";
import { Chip, Cover, Modal, Reveal } from "../components/ui";

const MEDAL = { gold: "🥇", silver: "🥈", bronze: "🥉" } as const;

function Card({ a, data, onOpen }: { a: Achievement; data: ProfileData; onOpen: () => void }) {
  const c = categoryMeta(data, a.category);
  const medal = medalFor(a.position);
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -6 }}
      onClick={onOpen}
      className={`glass group flex flex-col overflow-hidden rounded-3xl text-left ${a.featured ? "glow-border" : ""}`}
    >
      <div className="relative h-36 w-full overflow-hidden">
        <Cover color={c.color} emoji={c.emoji} image={a.image} />
        {medal && <span className="absolute left-4 top-4 text-3xl drop-shadow">{MEDAL[medal]}</span>}
        <span className="absolute right-4 top-4 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
          {TIER_LABEL[a.tier]}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs" style={{ color: c.color }}>
          <span className="font-semibold">{c.label}</span>
          <span className="text-muted">· {formatDate(a.date)}</span>
        </div>
        <h3 className="mt-2 font-display text-lg font-semibold leading-snug">{a.title}</h3>
        {a.position && <p className="mt-1 text-sm font-medium text-accent">{a.position}</p>}
        <p className="mt-2 line-clamp-2 text-sm text-muted">{a.description}</p>
        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted">
          <span>{a.organizer}</span>
          {data.site.gamification.enabled && <span className="font-semibold text-fg">+{achievementXp(a, data)} XP</span>}
        </div>
      </div>
    </motion.button>
  );
}

function Timeline({ items, data, onOpen }: { items: Achievement[]; data: ProfileData; onOpen: (a: Achievement) => void }) {
  const years = useMemo(() => {
    const m = new Map<string, Achievement[]>();
    for (const a of items) m.set(a.date.slice(0, 4), [...(m.get(a.date.slice(0, 4)) ?? []), a]);
    return [...m.entries()];
  }, [items]);
  return (
    <div className="relative pl-8 sm:pl-0">
      <div className="absolute bottom-0 left-3 top-0 w-px bg-gradient-to-b from-accent via-accent2 to-transparent sm:left-1/2" />
      {years.map(([year, list]) => (
        <div key={year} className="mb-10">
          <div className="relative mb-6 sm:text-center">
            <span className="bg-gradient relative z-10 -ml-8 inline-block rounded-full px-4 py-1 font-display text-sm font-bold text-white sm:ml-0">{year}</span>
          </div>
          <div className="space-y-5">
            {list.map((a, i) => {
              const c = categoryMeta(data, a.category);
              const left = i % 2 === 0;
              return (
                <Reveal key={a.title + a.date} className={`relative sm:w-1/2 ${left ? "sm:pr-10" : "sm:ml-auto sm:pl-10"}`}>
                  <span
                    className={`absolute top-6 h-3 w-3 rounded-full ring-4 ring-bg -left-[25px] ${left ? "sm:left-auto sm:-right-1.5" : "sm:-left-1.5"}`}
                    style={{ background: c.color }}
                  />
                  <button onClick={() => onOpen(a)} className="glass w-full rounded-2xl p-5 text-left transition hover:-translate-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span className="text-base">{medalFor(a.position) ? MEDAL[medalFor(a.position)!] : c.emoji}</span>
                      {formatDate(a.date)} · {TIER_LABEL[a.tier]}
                    </div>
                    <div className="mt-2 font-display font-semibold">{a.title}</div>
                    {a.position && <div className="text-sm text-accent">{a.position}</div>}
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AchievementDetail({ a, data, onClose }: { a: Achievement | null; data: ProfileData; onClose: () => void }) {
  const c = a ? categoryMeta(data, a.category) : null;
  const medal = a ? medalFor(a.position) : null;
  return (
    <Modal open={!!a} onClose={onClose}>
      {a && c && (
        <div>
          <div className="relative h-48 sm:h-56">
            <Cover color={c.color} emoji={medal ? MEDAL[medal] : c.emoji} image={a.image} />
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              <Chip color={c.color}>
                {c.emoji} {c.label}
              </Chip>
              <Chip>{TIER_LABEL[a.tier]} level</Chip>
              <Chip>
                <Calendar size={12} /> {formatDate(a.date)}
              </Chip>
              {data.site.gamification.enabled && <Chip>+{achievementXp(a, data)} XP</Chip>}
            </div>
            <h3 className="mt-4 font-display text-2xl font-bold sm:text-3xl">{a.title}</h3>
            {a.position && <p className="mt-1 text-lg font-medium text-gradient">{a.position}</p>}
            {a.organizer && <p className="mt-1 text-sm text-muted">Organised by {a.organizer}</p>}
            <p className="mt-5 leading-relaxed">{a.description}</p>
            {a.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {a.tags.map((t) => (
                  <Chip key={t}>#{t}</Chip>
                ))}
              </div>
            )}
            {a.certificateUrl && (
              <a href={a.certificateUrl} target="_blank" rel="noreferrer" className="bg-gradient mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white">
                View certificate <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

export function Achievements({ data, onOpen }: { data: ProfileData; onOpen: (a: Achievement) => void }) {
  const [cat, setCat] = useState<string | null>(null);
  const [tier, setTier] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [view, setView] = useState<"grid" | "timeline">("grid");

  const cats = useMemo(() => [...new Set(data.achievements.map((a) => a.category))], [data]);
  const tiers = useMemo(() => TIERS.filter((t) => data.achievements.some((a) => a.tier === t)), [data]);

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return data.achievements
      .filter((a) => !cat || a.category === cat)
      .filter((a) => !tier || a.tier === tier)
      .filter((a) => !needle || [a.title, a.description, a.organizer, a.position, ...a.tags].join(" ").toLowerCase().includes(needle))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data, cat, tier, q]);

  return (
    <>
      <Reveal>
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="glass flex flex-1 items-center gap-2 rounded-full px-4 py-2.5">
              <Search size={16} className="text-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search trophies, tags, organisers…" className="w-full bg-transparent text-sm outline-none placeholder:text-muted" />
            </label>
            <div className="glass flex self-start rounded-full p-1">
              {(["grid", "timeline"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${view === v ? "bg-fg text-bg" : "text-muted"}`}
                >
                  {v === "grid" ? <LayoutGrid size={13} /> : <List size={13} />} {v}
                </button>
              ))}
            </div>
          </div>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            <Chip active={!cat} onClick={() => setCat(null)}>
              All fields
            </Chip>
            {cats.map((k) => {
              const c = categoryMeta(data, k);
              return (
                <Chip key={k} active={cat === k} onClick={() => setCat(cat === k ? null : k)}>
                  {c.emoji} {c.label}
                </Chip>
              );
            })}
            <span className="mx-1 w-px shrink-0 bg-line" />
            {tiers.map((t) => (
              <Chip key={t} active={tier === t} onClick={() => setTier(tier === t ? null : t)}>
                {TIER_LABEL[t]}
              </Chip>
            ))}
          </div>
        </div>
      </Reveal>

      {items.length === 0 ? (
        <p className="py-16 text-center text-muted">No achievements match those filters yet.</p>
      ) : view === "grid" ? (
        <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {items.map((a) => (
              <Card key={a.id ?? a.title + a.date} a={a} data={data} onOpen={() => onOpen(a)} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <Timeline items={items} data={data} onOpen={onOpen} />
      )}
    </>
  );
}
