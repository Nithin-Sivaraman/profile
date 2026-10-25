import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { ProfileData } from "../lib/schema";
import { Chip, Reveal } from "../components/ui";

const TWINKLE = "@keyframes twinkle{0%,100%{transform:scale(.8)}50%{transform:scale(1.15)}}";
const PALETTE = ["#8b5cf6", "#22d3ee", "#f472b6", "#f59e0b", "#34d399", "#60a5fa", "#fb7185"];
const W = 800;
const H = 520;

type Star = { name: string; level: number; since?: string; cat: string; color: string; x: number; y: number; cx: number; cy: number };

/**
 * Skills rendered as a constellation: each category is a cluster, each skill
 * a star. Brighter, bigger stars = stronger skills.
 */
export function Skills({ data }: { data: ProfileData }) {
  const [focus, setFocus] = useState<string | null>(null);
  const [hover, setHover] = useState<Star | null>(null);

  const { stars, cats } = useMemo(() => {
    const groups = new Map<string, ProfileData["skills"]>();
    for (const s of data.skills) groups.set(s.category, [...(groups.get(s.category) ?? []), s]);
    const cats = [...groups.keys()].map((c, i) => ({ name: c, color: PALETTE[i % PALETTE.length] }));
    const n = cats.length;
    const stars: Star[] = [];
    cats.forEach((c, ci) => {
      const a = (ci / n) * Math.PI * 2 - Math.PI / 2;
      const cx = W / 2 + (n > 1 ? Math.cos(a) * 250 : 0);
      const cy = H / 2 + (n > 1 ? Math.sin(a) * 160 : 0);
      const items = groups.get(c.name)!;
      items.forEach((s, si) => {
        const b = (si / items.length) * Math.PI * 2 + ci;
        const d = 55 + (100 - s.level) * 1.1;
        stars.push({ name: s.name, level: s.level, since: s.since, cat: c.name, color: c.color, cx, cy, x: cx + Math.cos(b) * d, y: cy + Math.sin(b) * d * 0.85 });
      });
    });
    return { stars, cats };
  }, [data.skills]);

  const dim = (cat: string) => (focus && focus !== cat ? 0.12 : 1);

  return (
    <Reveal>
      <div className="mb-5 flex flex-wrap gap-2">
        <Chip active={!focus} onClick={() => setFocus(null)}>
          All
        </Chip>
        {cats.map((c) => (
          <Chip key={c.name} active={focus === c.name} onClick={() => setFocus(focus === c.name ? null : c.name)}>
            <span className="h-2 w-2 rounded-full" style={{ background: c.color }} /> {c.name}
          </Chip>
        ))}
      </div>

      <div className="glass relative overflow-hidden rounded-3xl" style={{ background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--accent) 10%, var(--card)), var(--card))" }}>
        {/* Constellation (tablet and up) */}
        <svg viewBox={`0 0 ${W} ${H}`} className="hidden w-full sm:block" role="img" aria-label="Skill constellation">
          <style>{TWINKLE}</style>
          {/* background dust */}
          {Array.from({ length: 70 }, (_, i) => (
            <circle key={i} cx={(i * 137.5) % W} cy={(i * 91.3) % H} r={((i * 7) % 3) * 0.4 + 0.3} fill="var(--fg)" opacity={0.15} />
          ))}
          {stars.map((s) => (
            <motion.line
              key={`l-${s.name}`}
              x1={s.cx}
              y1={s.cy}
              x2={s.x}
              y2={s.y}
              stroke={s.color}
              strokeWidth={1}
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.35 * dim(s.cat) }}
              animate={{ opacity: 0.35 * dim(s.cat) }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
            />
          ))}
          {cats.map((c) => {
            const s = stars.find((x) => x.cat === c.name)!;
            return (
              <g key={c.name} opacity={dim(c.name)} style={{ transition: "opacity .3s" }}>
                <circle cx={s.cx} cy={s.cy} r={9} fill="none" stroke={c.color} strokeOpacity={0.5} />
                <circle cx={s.cx} cy={s.cy} r={3.5} fill={c.color} />
              </g>
            );
          })}
          {stars.map((s, i) => {
            const r = 3 + s.level / 16;
            return (
              <g
                key={s.name}
                opacity={dim(s.cat)}
                style={{ transition: "opacity .3s", cursor: "pointer" }}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(null)}
              >
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={r * 2.8}
                  fill={s.color}
                  opacity={0.18}
                  style={{ transformBox: "fill-box", transformOrigin: "center", animation: `twinkle ${3 + (i % 4)}s ease-in-out infinite` }}
                />
                <circle cx={s.x} cy={s.y} r={r} fill={s.color} />
                <circle cx={s.x} cy={s.y} r={r * 0.45} fill="#fff" />
                <text x={s.x} y={s.y + r + 14} textAnchor="middle" fontSize="12" fontWeight={500} fill="var(--fg)">
                  {s.name}
                </text>
              </g>
            );
          })}
        </svg>

        {hover && (
          <div
            className="glass pointer-events-none absolute z-10 hidden -translate-x-1/2 -translate-y-full rounded-xl px-3 py-2 text-xs shadow-xl sm:block"
            style={{ left: `${(hover.x / W) * 100}%`, top: `calc(${(hover.y / H) * 100}% - 18px)` }}
          >
            <div className="font-semibold">{hover.name}</div>
            <div className="text-muted">
              {hover.level}/100{hover.since ? ` · since ${hover.since}` : ""}
            </div>
          </div>
        )}

        {/* Bars (mobile) */}
        <div className="grid gap-3 p-5 sm:hidden">
          {stars
            .filter((s) => !focus || s.cat === focus)
            .map((s) => (
              <div key={s.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{s.name}</span>
                  <span className="text-muted">{s.level}</span>
                </div>
                <div className="h-1.5 rounded-full bg-line">
                  <div className="h-full rounded-full" style={{ width: `${s.level}%`, background: s.color }} />
                </div>
              </div>
            ))}
        </div>
      </div>
    </Reveal>
  );
}
