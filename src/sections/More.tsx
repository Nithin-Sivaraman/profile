import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Award, Briefcase, ChevronLeft, ChevronRight, GraduationCap, Mail, Quote, Target } from "lucide-react";
import { useEffect, useState } from "react";
import type { ProfileData } from "../lib/schema";
import { projectHref } from "../lib/schema";
import { formatDate } from "../lib/xp";
import { contactIcon } from "../lib/icons";
import { Chip, Cover, Modal, Reveal } from "../components/ui";

/* ------------------------------- Projects ------------------------------- */

export function Projects({ data }: { data: ProfileData }) {
  const sorted = [...data.projects].sort((a, b) => Number(b.featured) - Number(a.featured));
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {sorted.map((p, i) => (
        <Reveal key={p.title} delay={i * 0.05}>
          <motion.a
            whileHover={{ y: -6 }}
            href={projectHref(p)}
            className={`glass group flex h-full w-full flex-col overflow-hidden rounded-3xl text-left ${p.featured ? "glow-border" : ""}`}
          >
            <div className="h-44 overflow-hidden">
              <Cover color="var(--accent)" emoji={p.emoji ?? "🚀"} image={p.image} />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h3 className="font-display text-xl font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted">{p.summary}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                {p.tags.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                View details <ArrowUpRight size={16} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </div>
          </motion.a>
        </Reveal>
      ))}
    </div>
  );
}

/* ---------------------------- Certifications ---------------------------- */

export function Certifications({ data }: { data: ProfileData }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {data.certifications.map((c, i) => {
        const Tag = c.url ? "a" : "div";
        return (
          <Reveal key={c.title} delay={i * 0.05}>
            <Tag
              {...(c.url ? { href: c.url, target: "_blank", rel: "noreferrer" } : {})}
              className="glass group flex h-full items-start gap-4 rounded-2xl p-5 transition hover:-translate-y-1"
            >
              <div className="bg-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white">
                <Award size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display font-semibold leading-snug">{c.title}</div>
                <div className="mt-1 text-sm text-muted">
                  {c.issuer} · {formatDate(c.date)}
                </div>
                {c.credentialId && <div className="mt-2 font-mono text-[13px] text-muted">ID: {c.credentialId}</div>}
              </div>
              {c.url && <ArrowUpRight size={16} className="shrink-0 text-muted group-hover:text-accent" />}
            </Tag>
          </Reveal>
        );
      })}
    </div>
  );
}

/* -------------------------------- Journey ------------------------------- */

export function Journey({ data }: { data: ProfileData }) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h3 className="mb-6 flex items-center gap-3 font-display text-2xl font-bold sm:text-3xl">
          <GraduationCap size={30} className="shrink-0 text-accent" /> Education
        </h3>
        <div className="space-y-4">
          {data.education.map((e, i) => (
            <Reveal key={e.program + e.period} delay={i * 0.05} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="font-display text-xl font-semibold leading-snug">{e.program}</div>
                {e.score && <span className="bg-gradient rounded-full px-2.5 py-0.5 text-xs font-bold text-white">{e.score}</span>}
              </div>
              <div className="mt-1 text-sm text-muted">
                {e.url ? (
                  <a href={e.url} target="_blank" rel="noreferrer" className="underline-offset-4 hover:text-accent hover:underline">
                    {e.institution}
                  </a>
                ) : (
                  e.institution
                )}{" "}
                · {e.period}
              </div>
              {e.highlights.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm">
                  {e.highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <span className="text-accent">▹</span> {h}
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-6 flex items-center gap-3 font-display text-2xl font-bold sm:text-3xl">
          <Briefcase size={30} className="shrink-0 text-accent" /> Leadership & service
        </h3>
        <div className="relative space-y-4 border-l border-line pl-6">
          {data.activities.map((a, i) => (
            <Reveal key={a.role + a.organization} delay={i * 0.05} className="relative">
              <span className="bg-gradient absolute -left-[31px] top-2 h-3 w-3 rounded-full ring-4 ring-bg" />
              <div className="text-xs uppercase tracking-wider text-accent">
                {a.type} · {a.period}
              </div>
              <div className="mt-1 font-display text-xl font-semibold leading-snug">{a.role}</div>
              <div className="text-sm text-muted">{a.organization}</div>
              {a.description && <p className="mt-2 text-sm">{a.description}</p>}
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Goals -------------------------------- */

export function Goals({ data }: { data: ProfileData }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {data.goals.map((g, i) => (
        <Reveal key={g.title} delay={i * 0.05} className="glass rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Target size={18} className="mt-0.5 shrink-0 text-accent" />
              <div>
                <div className="font-display font-semibold leading-snug">{g.title}</div>
                {(g.target || g.note) && <div className="mt-1 text-xs text-muted">{[g.target && `Target: ${g.target}`, g.note].filter(Boolean).join(" · ")}</div>}
              </div>
            </div>
            <span className="font-display text-2xl font-bold">{g.progress}%</span>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-line">
            <motion.div
              className="bg-gradient h-full rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: `${g.progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/* ------------------------------ Testimonials ---------------------------- */

export function Testimonials({ data }: { data: ProfileData }) {
  const [i, setI] = useState(0);
  const list = data.testimonials;
  useEffect(() => {
    if (list.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % list.length), 7000);
    return () => clearInterval(t);
  }, [list.length]);
  const t = list[i];
  if (!t) return null;
  return (
    <Reveal className="glass relative overflow-hidden rounded-3xl p-8 sm:p-14">
      <Quote size={80} className="absolute -right-2 -top-2 text-accent opacity-10" />
      <AnimatePresence mode="wait">
        <motion.figure key={i} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }}>
          <blockquote className="font-display text-xl leading-relaxed sm:text-3xl">“{t.quote}”</blockquote>
          <figcaption className="mt-8 flex items-center gap-3">
            <div className="bg-gradient flex h-11 w-11 items-center justify-center rounded-full font-bold text-white">{t.author[0]}</div>
            <div>
              <div className="font-semibold">{t.author}</div>
              <div className="text-sm text-muted">{t.role}</div>
            </div>
          </figcaption>
        </motion.figure>
      </AnimatePresence>
      {list.length > 1 && (
        <div className="mt-8 flex items-center gap-3">
          <button aria-label="Previous" onClick={() => setI((i - 1 + list.length) % list.length)} className="rounded-full border border-line p-2 hover:bg-line">
            <ChevronLeft size={16} />
          </button>
          <button aria-label="Next" onClick={() => setI((i + 1) % list.length)} className="rounded-full border border-line p-2 hover:bg-line">
            <ChevronRight size={16} />
          </button>
          <div className="ml-2 flex gap-1.5">
            {list.map((_, k) => (
              <span key={k} className={`h-1.5 rounded-full transition-all ${k === i ? "bg-gradient w-6" : "w-1.5 bg-line"}`} />
            ))}
          </div>
        </div>
      )}
    </Reveal>
  );
}

/* -------------------------------- Gallery ------------------------------- */

export function Gallery({ data }: { data: ProfileData }) {
  const [open, setOpen] = useState<number | null>(null);
  const item = open !== null ? data.gallery[open] : null;
  return (
    <>
      <div className="columns-2 gap-4 md:columns-3">
        {data.gallery.map((g, i) => (
          <Reveal key={g.src} delay={(i % 3) * 0.05} className="mb-4 break-inside-avoid">
            <button onClick={() => setOpen(i)} className="group relative block w-full overflow-hidden rounded-2xl">
              <img src={g.src} alt={g.caption} loading="lazy" className={`w-full object-cover transition duration-500 group-hover:scale-105 ${i % 3 === 1 ? "aspect-[3/4]" : "aspect-[4/3]"}`} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                {g.caption}
              </div>
            </button>
          </Reveal>
        ))}
      </div>
      <Modal open={!!item} onClose={() => setOpen(null)}>
        {item && (
          <figure>
            <img src={item.src} alt={item.caption} className="w-full" />
            <figcaption className="p-5 text-sm text-muted">{item.caption}</figcaption>
          </figure>
        )}
      </Modal>
    </>
  );
}

/* -------------------------------- Contact ------------------------------- */

export function Contact({ data }: { data: ProfileData }) {
  const p = data.profile;
  return (
    <Reveal className="glass relative overflow-hidden rounded-3xl p-8 text-center sm:p-16">
      <div className="bg-gradient absolute -left-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl" />
      <div className="bg-gradient absolute -bottom-20 -right-20 h-64 w-64 rounded-full opacity-20 blur-3xl" />
      <div className="relative">
        <p className="mx-auto max-w-xl text-lg text-muted">{p.availability ?? "Always happy to talk about ideas, competitions and collaborations."}</p>
        {p.email && (
          <a href={`mailto:${p.email}`} className="mt-8 inline-flex items-center gap-2 font-display text-2xl font-bold break-all hover:underline sm:text-4xl">
            <Mail className="shrink-0 text-accent" /> <span className="text-gradient">{p.email}</span>
          </a>
        )}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {p.contacts.map((c) => {
            const Icon = contactIcon(c.type);
            return (
              <a key={c.url + c.label} href={c.url} target="_blank" rel="noreferrer" className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition hover:-translate-y-0.5 hover:text-accent">
                <Icon size={16} /> {c.label}
              </a>
            );
          })}
        </div>
      </div>
    </Reveal>
  );
}
