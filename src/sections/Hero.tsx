import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Command, GraduationCap, MapPin, Printer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Achievement, ProfileData } from "../lib/schema";
import { achievementXp, categoryMeta, formatDate, levelFromXp, medalFor, TIER_LABEL } from "../lib/xp";
import { Avatar } from "../components/ui";

function useRotatingText(words: string[], ms = 2600) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (words.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % words.length), ms);
    return () => clearInterval(t);
  }, [words.length, ms]);
  return words[i] ?? "";
}

function Counter({ value }: { value: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1200);
      setN(Math.round(value * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{n}</>;
}

/** Fanned stack of featured trophies that tilts toward the cursor. */
function TrophyStack({ items, data, onOpen }: { items: Achievement[]; data: ProfileData; onOpen: (a: Achievement) => void }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 120, damping: 14 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), { stiffness: 120, damping: 14 });

  return (
    <motion.div
      className="relative mx-auto h-[360px] w-full max-w-sm [perspective:1200px]"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }} className="relative h-full w-full">
        {items.slice(0, 3).map((a, i) => {
          const c = categoryMeta(data, a.category);
          const medal = medalFor(a.position);
          return (
            <motion.button
              key={a.title}
              onClick={() => onOpen(a)}
              initial={{ opacity: 0, y: 40, rotate: 0 }}
              animate={{ opacity: 1, y: i * 26, rotate: (i - 1) * 5, x: (i - 1) * 18 }}
              transition={{ delay: 0.4 + i * 0.12, type: "spring", damping: 16 }}
              whileHover={{ y: i * 26 - 12, scale: 1.03 }}
              style={{ zIndex: 3 - i, z: (3 - i) * 30 }}
              className="glass absolute inset-x-6 top-6 overflow-hidden rounded-3xl p-5 text-left shadow-2xl shadow-black/20"
            >
              <div className="absolute inset-x-0 top-0 h-1" style={{ background: c.color }} />
              <div className="flex items-start justify-between">
                <span className="text-4xl">{medal === "gold" ? "🥇" : medal === "silver" ? "🥈" : medal === "bronze" ? "🥉" : c.emoji}</span>
                <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: `${c.color}22`, color: c.color }}>
                  {TIER_LABEL[a.tier]}
                </span>
              </div>
              <p className="mt-4 font-display text-lg font-semibold leading-snug">{a.title}</p>
              <p className="mt-1 text-sm text-muted">{a.position}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted">
                <span>{formatDate(a.date)}</span>
                {data.site.gamification.enabled && <span className="font-semibold text-accent">+{achievementXp(a, data)} XP</span>}
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

export function Hero({ data, onOpenAchievement, onSearch }: { data: ProfileData; onOpenAchievement: (a: Achievement) => void; onSearch: () => void }) {
  const p = data.profile;
  const role = useRotatingText(p.roles);

  const stats = useMemo(() => {
    const xp = data.achievements.reduce((s, a) => s + achievementXp(a, data), 0);
    return [
      { label: "Achievements", value: data.achievements.length },
      { label: "Podium finishes", value: data.achievements.filter((a) => medalFor(a.position)).length },
      { label: "Projects", value: data.projects.length },
      ...(data.site.gamification.enabled ? [{ label: "Talent level", value: levelFromXp(xp).level }] : [{ label: "Activities", value: data.activities.length }]),
    ];
  }, [data]);

  const featured = useMemo(() => {
    const f = data.achievements.filter((a) => a.featured);
    return (f.length ? f : data.achievements).slice().sort((a, b) => b.date.localeCompare(a.date));
  }, [data]);

  return (
    <header id="top" className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-4 pb-16 pt-28 sm:px-6">
      <div className="grid items-center gap-14 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
            <Avatar name={p.name} src={p.avatar} size={72} />
            {p.availability && (
              <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {p.availability}
              </span>
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="mt-8 font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl"
          >
            Hi, I'm <br />
            <span className="text-gradient">{p.name.split(" ")[0]}</span>
            <span className="text-accent">.</span>
          </motion.h1>

          {p.roles.length > 0 && (
            <div className="mt-6 h-8 overflow-hidden font-display text-xl text-muted sm:text-2xl">
              <motion.div key={role} initial={{ y: 32, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.45 }}>
                <span className="text-fg">{role}</span>
              </motion.div>
            </div>
          )}

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {p.headline}
          </motion.p>

          <div className="mt-6 flex flex-wrap gap-2 text-sm text-muted">
            {p.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={15} /> {p.location}
              </span>
            )}
            {p.school && (
              <span className="inline-flex items-center gap-1.5 sm:ml-4">
                <GraduationCap size={15} /> {p.school}
              </span>
            )}
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#achievements" className="bg-gradient inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition hover:scale-[1.03]">
              See my trophies <ArrowUpRight size={16} />
            </a>
            <button onClick={() => window.print()} className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition hover:scale-[1.03]">
              <Printer size={16} /> Résumé
            </button>
            <button onClick={onSearch} className="glass hidden items-center gap-2 rounded-full px-5 py-3 text-sm text-muted transition hover:text-fg sm:inline-flex">
              <Command size={14} /> K to search
            </button>
          </div>
        </div>

        {featured.length > 0 && <TrophyStack items={featured} data={data} onOpen={onOpenAchievement} />}
      </div>

      <div className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.08 }}
            className="glass rounded-2xl px-5 py-4"
          >
            <div className="font-display text-3xl font-bold sm:text-4xl">
              <Counter value={s.value} />
            </div>
            <div className="mt-1 text-xs uppercase tracking-wider text-muted">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </header>
  );
}
