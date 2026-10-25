import type { Achievement, ProfileData, Tier } from "./schema";

/**
 * Gamification: every achievement earns XP based on how far it reached
 * (school → international) and the placing. XP rolls up into a level and a
 * set of auto-unlocked badges. Nothing here is stored in the JSON — it's all
 * derived, so the student only records facts and the app does the bragging.
 */

export const DEFAULT_TIER_POINTS: Record<Tier, number> = {
  school: 10,
  district: 20,
  state: 40,
  national: 80,
  international: 150,
};

export const TIER_LABEL: Record<Tier, string> = {
  school: "School",
  district: "District",
  state: "State",
  national: "National",
  international: "International",
};

export function placingMultiplier(position = ""): number {
  const p = position.toLowerCase();
  if (/(2nd|second)[ -]runner/.test(p)) return 1.15;
  if (/(1st|first)[ -]runner/.test(p)) return 1.3;
  if (/(1st|first|gold|winner|champion|rank 1\b)/.test(p)) return 1.5;
  if (/(2nd|second|silver|runner)/.test(p)) return 1.3;
  if (/(3rd|third|bronze)/.test(p)) return 1.15;
  return 1;
}

export function medalFor(position = ""): "gold" | "silver" | "bronze" | null {
  const m = placingMultiplier(position);
  return m === 1.5 ? "gold" : m === 1.3 ? "silver" : m === 1.15 ? "bronze" : null;
}

export function achievementXp(a: Achievement, data: ProfileData): number {
  const pts = { ...DEFAULT_TIER_POINTS, ...data.site.gamification.tierPoints };
  return Math.round(pts[a.tier] * placingMultiplier(a.position));
}

const RANKS = ["Explorer", "Rising Star", "Achiever", "Trailblazer", "Luminary", "Legend"];

/** Level n needs 50·n² total XP — early levels come quickly, later ones take real work. */
export function levelFromXp(xp: number) {
  const level = Math.floor(Math.sqrt(xp / 50)) + 1;
  const floor = 50 * (level - 1) ** 2;
  const next = 50 * level ** 2;
  return {
    level,
    rank: RANKS[Math.min(RANKS.length - 1, Math.floor((level - 1) / 2))],
    progress: (xp - floor) / (next - floor),
    toNext: next - xp,
  };
}

export type Badge = { id: string; emoji: string; name: string; hint: string; unlocked: boolean };

export function computeBadges(data: ProfileData): Badge[] {
  const a = data.achievements;
  const medals = a.map((x) => medalFor(x.position));
  const tiers = new Set(a.map((x) => x.tier));
  const cats = new Set(a.map((x) => x.category));
  const years = new Set(a.map((x) => x.date.slice(0, 4)));
  return [
    { id: "first", emoji: "🌱", name: "First Step", hint: "Record your first achievement", unlocked: a.length >= 1 },
    { id: "gold", emoji: "🥇", name: "Golden Moment", hint: "Win a 1st place / gold", unlocked: medals.includes("gold") },
    { id: "podium", emoji: "🏅", name: "Podium Collector", hint: "Earn 5 podium finishes", unlocked: medals.filter(Boolean).length >= 5 },
    { id: "state", emoji: "🗺️", name: "State Contender", hint: "Compete at state level or higher", unlocked: ["state", "national", "international"].some((t) => tiers.has(t as Tier)) },
    { id: "national", emoji: "🏟️", name: "National Stage", hint: "Reach a national competition", unlocked: tiers.has("national") || tiers.has("international") },
    { id: "global", emoji: "🌍", name: "Global Citizen", hint: "Compete internationally", unlocked: tiers.has("international") },
    { id: "polymath", emoji: "🎭", name: "Polymath", hint: "Achieve in 4+ different fields", unlocked: cats.size >= 4 },
    { id: "streak", emoji: "🔥", name: "Consistency", hint: "Achievements in 3+ different years", unlocked: years.size >= 3 },
    { id: "builder", emoji: "🛠️", name: "Builder", hint: "Ship 3+ projects", unlocked: data.projects.length >= 3 },
    { id: "certified", emoji: "📜", name: "Lifelong Learner", hint: "Earn 3+ certifications", unlocked: data.certifications.length >= 3 },
    { id: "leader", emoji: "🧭", name: "Leader", hint: "Hold 2+ leadership / service roles", unlocked: data.activities.length >= 2 },
    { id: "loved", emoji: "💬", name: "Well Regarded", hint: "Receive 2+ testimonials", unlocked: data.testimonials.length >= 2 },
  ];
}

export function categoryMeta(data: ProfileData, key: string) {
  const c = data.site.categories[key];
  return c ?? { label: key.charAt(0).toUpperCase() + key.slice(1), emoji: "⭐", color: "#8b5cf6" };
}

export function formatDate(d?: string) {
  if (!d) return "";
  const parts = d.split("-");
  if (parts.length === 1) return d;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2] ?? 1));
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}
