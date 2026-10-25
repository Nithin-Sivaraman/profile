import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Achievement, ProfileData, SectionId } from "./lib/schema";
import { resolveSections } from "./lib/schema";
import { Aurora, CommandPalette, Nav } from "./components/Chrome";
import { Section } from "./components/ui";
import { PrintResume } from "./components/PrintResume";
import { Hero } from "./sections/Hero";
import { About } from "./sections/About";
import { Level } from "./sections/Level";
import { Skills } from "./sections/Skills";
import { AchievementDetail, Achievements } from "./sections/Achievements";
import { Certifications, Contact, Gallery, Goals, Journey, Projects, Testimonials } from "./sections/More";

/** Hide sections that have nothing to show, so an empty array in the JSON never renders an empty block. */
function hasContent(id: SectionId, d: ProfileData): boolean {
  switch (id) {
    case "about": return !!d.profile.bio;
    case "level": return d.site.gamification.enabled && d.achievements.length > 0;
    case "skills": return d.skills.length > 0;
    case "achievements": return d.achievements.length > 0 || d.certifications.length > 0;
    case "projects": return d.projects.length > 0;
    case "certifications": return d.certifications.length > 0;
    case "journey": return d.education.length + d.activities.length > 0;
    case "goals": return d.goals.length > 0;
    case "testimonials": return d.testimonials.length > 0;
    case "gallery": return d.gallery.length > 0;
    case "contact": return !!d.profile.email || d.profile.contacts.length > 0;
  }
}

export function Portfolio({ data, theme, onToggleTheme, banner }: { data: ProfileData; theme: "dark" | "light"; onToggleTheme: () => void; banner?: ReactNode }) {
  const [palette, setPalette] = useState(false);
  const [detail, setDetail] = useState<Achievement | null>(null);
  const sections = useMemo(() => resolveSections(data).filter((s) => hasContent(s.id, data)), [data]);
  const openAchievement = useCallback((a: Achievement) => setDetail(a), []);

  // Coming back from a detail page with "#section": the section only exists after this render, so scroll to it here.
  useEffect(() => {
    const id = location.hash.slice(1);
    if (id && !id.startsWith("/")) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
  }, []);

  useEffect(() => {
    document.title = data.site.title ?? `${data.profile.name} · Portfolio`;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data]);

  const render = (id: SectionId): ReactNode => {
    switch (id) {
      case "about": return <About data={data} />;
      case "level": return <Level data={data} />;
      case "skills": return <Skills data={data} />;
      case "achievements": return (
        <>
          {data.achievements.length > 0 && <Achievements data={data} onOpen={openAchievement} />}
          {data.certifications.length > 0 && !sections.some((s) => s.id === "certifications") && (
            <div className={data.achievements.length > 0 ? "mt-10" : undefined}>
              <h3 className="mb-5 font-display text-lg font-semibold">Program completion</h3>
              <Certifications data={data} />
            </div>
          )}
        </>
      );
      case "projects": return <Projects data={data} />;
      case "certifications": return <Certifications data={data} />;
      case "journey": return <Journey data={data} />;
      case "goals": return <Goals data={data} />;
      case "testimonials": return <Testimonials data={data} />;
      case "gallery": return <Gallery data={data} />;
      case "contact": return <Contact data={data} />;
    }
  };

  return (
    <>
      <div className="screen-only grain min-h-screen overflow-x-clip">
        <Aurora />
        {banner}
        <Nav data={data} sections={sections} theme={theme} onToggleTheme={onToggleTheme} onSearch={() => setPalette(true)} />
        <main>
          <Hero data={data} onOpenAchievement={openAchievement} onSearch={() => setPalette(true)} />
          {sections.map((s) => (
            <Section key={s.id} id={s.id} title={s.title} subtitle={s.subtitle}>
              {render(s.id)}
            </Section>
          ))}
        </main>
        <footer className="mx-auto max-w-6xl px-6 pb-12 pt-8 text-center text-xs text-muted">
          © {new Date().getFullYear()} {data.profile.name} · {data.site.footer ?? "Portfolio"}
        </footer>
        <CommandPalette open={palette} onClose={() => setPalette(false)} data={data} sections={sections} onOpenAchievement={openAchievement} />
        <AchievementDetail a={detail} data={data} onClose={() => setDetail(null)} />
      </div>
      <PrintResume data={data} />
    </>
  );
}
