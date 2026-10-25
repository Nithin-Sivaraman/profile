import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Award, Command, FolderKanban, Hash, Lock, Menu, Moon, Pencil, Search, Sun, Trophy, X, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Achievement, ProfileData } from "../lib/schema";
import { projectHref } from "../lib/schema";
import { categoryMeta, formatDate } from "../lib/xp";

type Sec = { id: string; title: string };

/* --------------------------- Aurora background -------------------------- */

export function Aurora() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      ref.current?.style.setProperty("--mx", `${e.clientX}px`);
      ref.current?.style.setProperty("--my", `${e.clientY}px`);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return (
    <div ref={ref} aria-hidden className="screen-only pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-40 -top-40 h-[42rem] w-[42rem] animate-[float_18s_ease-in-out_infinite] rounded-full opacity-25 blur-[120px]" style={{ background: "var(--accent)" }} />
      <div className="absolute -right-40 top-1/3 h-[36rem] w-[36rem] animate-[float_22s_ease-in-out_infinite_reverse] rounded-full opacity-20 blur-[120px]" style={{ background: "var(--accent2)" }} />
      <div
        className="absolute inset-0 opacity-60 transition-opacity"
        style={{ background: "radial-gradient(500px circle at var(--mx, 50%) var(--my, 30%), color-mix(in srgb, var(--accent) 12%, transparent), transparent 60%)" }}
      />
      <div
        className="absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
        style={{ backgroundImage: "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)", backgroundSize: "56px 56px" }}
      />
      <style>{`@keyframes float{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(80px,60px) scale(1.15)}}`}</style>
    </div>
  );
}

/* ---------------------------------- Nav --------------------------------- */

export function Nav({
  data,
  sections,
  theme,
  onToggleTheme,
  onSearch,
}: {
  data: ProfileData;
  sections: Sec[];
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onSearch: () => void;
}) {
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [sections]);

  const first = data.profile.name.split(" ")[0];

  return (
    <>
      <motion.div className="bg-gradient screen-only fixed inset-x-0 top-0 z-50 h-0.5 origin-left" style={{ scaleX: progress }} />
      <nav className="screen-only fixed inset-x-0 top-3 z-40 px-3">
        <div className="glass mx-auto flex max-w-6xl items-center gap-2 rounded-full py-2 pl-5 pr-2 shadow-lg shadow-black/5">
          <a href="#top" className="font-display text-lg font-bold">
            {first}
            <span className="text-accent">.</span>
          </a>
          <div className="no-scrollbar mx-auto hidden gap-1 overflow-x-auto xl:flex">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`relative whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition ${active === s.id ? "text-fg" : "text-muted hover:text-fg"}`}
              >
                {active === s.id && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-line" />}
                {s.title}
              </a>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1 xl:ml-0">
            <button onClick={onSearch} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs text-muted hover:bg-line hover:text-fg" aria-label="Search">
              <Search size={15} /> <kbd className="hidden font-sans sm:inline">⌘K</kbd>
            </button>
            <button onClick={onToggleTheme} className="rounded-full p-2 text-muted hover:bg-line hover:text-fg" aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="#/studio" className="bg-gradient hidden items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white sm:inline-flex" title="Edit this portfolio">
              {data.site.auth.enabled ? <Lock size={13} /> : <Pencil size={13} />} Studio
            </a>
            <button onClick={() => setOpen(!open)} className="rounded-full p-2 xl:hidden" aria-label="Menu">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass mx-auto mt-2 grid max-w-6xl grid-cols-2 gap-1 rounded-3xl bg-bg-soft p-3 xl:hidden"
            >
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm hover:bg-line">
                  {s.title}
                </a>
              ))}
              <a href="#/studio" className="col-span-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-accent hover:bg-line">
                ✏️ Open Studio (edit content)
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

/* ---------------------------- Command palette --------------------------- */

type Hit = { kind: string; title: string; sub: string; icon: typeof Trophy; run: () => void };

export function CommandPalette({
  open,
  onClose,
  data,
  sections,
  onOpenAchievement,
}: {
  open: boolean;
  onClose: () => void;
  data: ProfileData;
  sections: Sec[];
  onOpenAchievement: (a: Achievement) => void;
}) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const all = useMemo<Hit[]>(() => {
    const go = (id: string) => () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    return [
      ...sections.map((s) => ({ kind: "Section", title: s.title, sub: "Jump to section", icon: Hash, run: go(s.id) })),
      ...data.achievements.map((a) => ({
        kind: "Achievement",
        title: a.title,
        sub: [a.position, categoryMeta(data, a.category).label, formatDate(a.date)].filter(Boolean).join(" · "),
        icon: Trophy,
        run: () => onOpenAchievement(a),
      })),
      ...data.projects.map((p) => ({ kind: "Project", title: p.title, sub: p.summary, icon: FolderKanban, run: () => (location.hash = projectHref(p)) })),
      ...data.skills.map((s) => ({ kind: "Skill", title: s.name, sub: `${s.category} · ${s.level}/100`, icon: Zap, run: go("skills") })),
      ...data.certifications.map((c) => ({ kind: "Certification", title: c.title, sub: c.issuer, icon: Award, run: go("certifications") })),
    ];
  }, [data, sections, onOpenAchievement]);

  const hits = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return all.filter((h) => h.kind === "Section" || h.kind === "Achievement").slice(0, 12);
    return all.filter((h) => `${h.title} ${h.sub} ${h.kind}`.toLowerCase().includes(n)).slice(0, 30);
  }, [all, q]);

  const pick = (h: Hit) => {
    onClose();
    setTimeout(h.run, 60);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            initial={{ scale: 0.96, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: -10 }}
            className="glass w-full max-w-xl overflow-hidden rounded-2xl bg-bg-soft shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search size={18} className="text-muted" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSel(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") (e.preventDefault(), setSel((s) => Math.min(s + 1, hits.length - 1)));
                  if (e.key === "ArrowUp") (e.preventDefault(), setSel((s) => Math.max(s - 1, 0)));
                  if (e.key === "Enter" && hits[sel]) pick(hits[sel]);
                  if (e.key === "Escape") onClose();
                }}
                placeholder="Search achievements, skills, projects…"
                className="h-14 flex-1 bg-transparent outline-none placeholder:text-muted"
              />
              <kbd className="rounded border border-line px-1.5 py-0.5 text-[10px] text-muted">ESC</kbd>
            </div>
            <ul className="max-h-[50vh] overflow-y-auto p-2">
              {hits.length === 0 && <li className="p-6 text-center text-sm text-muted">Nothing found for “{q}”</li>}
              {hits.map((h, i) => (
                <li key={h.kind + h.title + i}>
                  <button
                    onMouseEnter={() => setSel(i)}
                    onClick={() => pick(h)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${i === sel ? "bg-line" : ""}`}
                  >
                    <h.icon size={16} className="shrink-0 text-accent" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{h.title}</div>
                      <div className="truncate text-xs text-muted">{h.sub}</div>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-muted">{h.kind}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3 border-t border-line px-4 py-2 text-[11px] text-muted">
              <Command size={12} /> ↑↓ to move · ↵ to open
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
