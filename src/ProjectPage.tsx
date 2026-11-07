import { ArrowLeft, ArrowUpRight, Camera, Download, ListChecks, Moon, Presentation, Sun } from "lucide-react";
import { useEffect } from "react";
import type { ProfileData } from "./lib/schema";
import { projectSlug } from "./lib/schema";
import { formatDate } from "./lib/xp";
import { Aurora } from "./components/Chrome";
import { Chip, Cover, Reveal } from "./components/ui";

/** Placeholder tile for content that hasn't been added to the JSON yet. */
function Placeholder({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line p-6 text-center text-sm text-muted">
      {icon}
      {text}
    </div>
  );
}

export function ProjectPage({ data, slug, theme, onToggleTheme }: { data: ProfileData; slug: string; theme: "dark" | "light"; onToggleTheme: () => void }) {
  const project = data.projects.find((p) => projectSlug(p) === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = project ? `${project.title} · ${data.profile.name}` : data.site.title ?? data.profile.name;
  }, [project, data]);

  return (
    <div className="grain min-h-screen overflow-x-clip">
      <Aurora />
      <nav className="fixed inset-x-0 top-0 z-40 px-4 pt-4">
        <div className="glass mx-auto flex max-w-4xl items-center justify-between rounded-full px-4 py-2.5">
          <a href="#projects" className="inline-flex items-center gap-1.5 text-sm font-semibold hover:text-accent">
            <ArrowLeft size={16} /> Back to Research &amp; engineering
          </a>
          <button onClick={onToggleTheme} aria-label="Toggle theme" className="rounded-full p-2 text-muted hover:bg-line hover:text-fg">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-6">
        {!project ? (
          <div className="glass rounded-3xl p-8 text-center">
            <h1 className="font-display text-2xl font-bold">Project not found</h1>
            <a href="#projects" className="mt-4 inline-block text-accent">Back to all projects</a>
          </div>
        ) : (
          <>
            <Reveal>
              <div className="glass overflow-hidden rounded-3xl">
                <div className="h-56 sm:h-72">
                  <Cover color="var(--accent)" emoji={project.emoji ?? "🚀"} image={project.image} />
                </div>
                <div className="p-6 sm:p-8">
                  {project.date && <p className="text-xs uppercase tracking-wider text-muted">{formatDate(project.date)}</p>}
                  <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">{project.title}</h1>
                  <p className="mt-2 text-lg text-muted">{project.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map((t) => (
                      <Chip key={t}>{t}</Chip>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {project.presentations.map((d) => (
              <Reveal key={d.pdf}>
                <section className="glow-border mt-8 grid gap-6 rounded-3xl p-6 sm:grid-cols-[1fr_1.2fr] sm:items-center sm:p-8">
                  {d.cover && (
                    <a href={d.pdf} target="_blank" rel="noreferrer" title="View slides">
                      <img src={d.cover} alt={`${d.title} title slide`} loading="lazy" className="w-full rounded-2xl shadow-lg transition duration-500 hover:scale-[1.02]" />
                    </a>
                  )}
                  <div>
                    <span className="bg-gradient inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white">
                      <Presentation size={14} /> Featured presentation
                    </span>
                    <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">{d.title}</h2>
                    {d.description && <p className="mt-2 text-sm text-muted">{d.description}</p>}
                    <div className="mt-5 flex flex-wrap gap-3">
                      <a href={d.pdf} target="_blank" rel="noreferrer" className="bg-gradient inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white">
                        View slides <ArrowUpRight size={14} />
                      </a>
                      {d.pptx && (
                        <a href={d.pptx} download className="glass inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold hover:text-accent">
                          <Download size={14} /> Download PowerPoint
                        </a>
                      )}
                    </div>
                  </div>
                </section>
              </Reveal>
            ))}

            {project.description && (
              <Reveal>
                <section className="mt-12">
                  <h2 className="font-display text-2xl font-semibold">Overview</h2>
                  <p className="mt-3 leading-relaxed">{project.description}</p>
                </section>
              </Reveal>
            )}

            <Reveal>
              <section className="mt-12">
                <h2 className="font-display text-2xl font-semibold">What I did</h2>
                {project.contributions.length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {project.contributions.map((c) => (
                      <li key={c} className="glass flex gap-3 rounded-2xl p-4">
                        <span className="bg-gradient mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                        <span className="leading-relaxed">{c}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-4">
                    <Placeholder icon={<ListChecks size={22} />} text="Project work and contributions coming soon." />
                  </div>
                )}
              </section>
            </Reveal>

            <Reveal>
              <section className="mt-12">
                <h2 className="font-display text-2xl font-semibold">Project photos</h2>
                {project.photos.length > 0 ? (
                  // Masonry columns keep each photo's own shape, so portrait shots aren't cropped.
                  <div className="mt-4 columns-1 gap-4 sm:columns-2">
                    {project.photos.map((ph) => (
                      <figure key={ph.src} className="glass mb-4 break-inside-avoid overflow-hidden rounded-2xl">
                        <a href={ph.src} target="_blank" rel="noreferrer" title="Open full size">
                          <img src={ph.src} alt={ph.caption} loading="lazy" className="w-full transition duration-500 hover:scale-[1.02]" />
                        </a>
                        {ph.caption && <figcaption className="p-3 text-sm text-muted">{ph.caption}</figcaption>}
                      </figure>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Placeholder icon={<Camera size={22} />} text="Photos coming soon." />
                    <Placeholder icon={<Camera size={22} />} text="Photos coming soon." />
                  </div>
                )}
              </section>
            </Reveal>

            {project.videos.length > 0 && (
              <Reveal>
                <section className="mt-12">
                  <h2 className="font-display text-2xl font-semibold">Project videos</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {project.videos.map((v) => (
                      <figure key={v.src} className="glass overflow-hidden rounded-2xl">
                        <video src={v.src} poster={v.poster} controls muted loop playsInline preload="metadata" className="w-full" />
                        {v.caption && <figcaption className="p-3 text-sm text-muted">{v.caption}</figcaption>}
                      </figure>
                    ))}
                  </div>
                </section>
              </Reveal>
            )}

            {project.links.length > 0 && (
              <div className="mt-12 flex flex-wrap gap-3">
                {project.links.map((l) => (
                  <a key={l.url + l.label} href={l.url} target="_blank" rel="noreferrer" className="bg-gradient inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white">
                    {l.label} <ArrowUpRight size={14} />
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
