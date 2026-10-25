import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useMemo } from "react";
import type { ProfileData } from "../lib/schema";
import { TIERS } from "../lib/schema";
import { achievementXp, computeBadges, levelFromXp, TIER_LABEL } from "../lib/xp";
import { Reveal } from "../components/ui";

export function Level({ data }: { data: ProfileData }) {
  const { xp, lvl, badges, byTier } = useMemo(() => {
    const xp = data.achievements.reduce((s, a) => s + achievementXp(a, data), 0);
    const byTier = TIERS.map((t) => ({ tier: t, count: data.achievements.filter((a) => a.tier === t).length }));
    return { xp, lvl: levelFromXp(xp), badges: computeBadges(data), byTier };
  }, [data]);
  const unlocked = badges.filter((b) => b.unlocked).length;
  const maxTier = Math.max(1, ...byTier.map((t) => t.count));

  // Progress ring geometry
  const R = 78;
  const C = 2 * Math.PI * R;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
      <Reveal className="glass glow-border flex flex-col items-center rounded-3xl p-8 text-center">
        <div className="relative h-48 w-48">
          <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
            <defs>
              <linearGradient id="ring" x1="0" x2="1">
                <stop offset="0" stopColor="var(--accent)" />
                <stop offset="1" stopColor="var(--accent2)" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r={R} fill="none" stroke="var(--line)" strokeWidth="12" />
            <motion.circle
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke="url(#ring)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              whileInView={{ strokeDashoffset: C * (1 - lvl.progress) }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs uppercase tracking-widest text-muted">Level</span>
            <span className="font-display text-6xl font-bold">{lvl.level}</span>
          </div>
        </div>
        <div className="mt-4 font-display text-2xl font-bold text-gradient">{lvl.rank}</div>
        <div className="mt-1 text-sm text-muted">
          {xp.toLocaleString()} XP · {lvl.toNext} XP to level {lvl.level + 1}
        </div>

        <div className="mt-8 w-full space-y-2.5 text-left">
          {byTier.map((t, i) => (
            <div key={t.tier} className="flex items-center gap-3 text-xs">
              <span className="w-24 shrink-0 text-muted">{TIER_LABEL[t.tier]}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                <motion.div
                  className="bg-gradient h-full rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(t.count / maxTier) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.8 }}
                />
              </div>
              <span className="w-5 text-right font-semibold">{t.count}</span>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.1} className="glass rounded-3xl p-6 sm:p-8">
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-xl font-semibold">Badges</h3>
          <span className="text-sm text-muted">
            {unlocked}/{badges.length} unlocked
          </span>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {badges.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              whileHover={b.unlocked ? { y: -4, rotate: -2 } : undefined}
              title={b.hint}
              className={`group relative flex flex-col items-center rounded-2xl border p-4 text-center transition ${
                b.unlocked ? "border-line bg-bg-soft" : "border-dashed border-line opacity-50"
              }`}
            >
              <span className={`text-3xl ${b.unlocked ? "" : "grayscale"}`}>{b.emoji}</span>
              <span className="mt-2 text-xs font-semibold">{b.name}</span>
              <span className="mt-1 text-[10px] leading-tight text-muted">{b.hint}</span>
              {!b.unlocked && <Lock size={12} className="absolute right-2 top-2 text-muted" />}
            </motion.div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
