import { Sparkles } from "lucide-react";
import type { ProfileData } from "../lib/schema";
import { Chip, Reveal } from "../components/ui";

export function About({ data }: { data: ProfileData }) {
  const p = data.profile;
  // A dedicated `photo` wins; otherwise the hero avatar is reused here.
  const photo = p.photo ?? p.avatar;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Reveal className="glass rounded-3xl p-7 sm:p-10">
        <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:gap-8">
          {photo && (
            <figure className="relative mx-auto w-52 shrink-0 sm:mx-0 sm:w-56">
              <div className="bg-gradient absolute -inset-1 rounded-[1.75rem] opacity-40 blur-lg" aria-hidden />
              <img
                src={photo}
                alt={p.name}
                loading="lazy"
                className="relative aspect-[3/4] w-full rounded-3xl object-cover shadow-xl"
              />
              {p.location && (
                <figcaption className="glass absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-medium">
                  {p.location}
                </figcaption>
              )}
            </figure>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl leading-relaxed sm:text-2xl">{p.bio}</p>
            {p.interests.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {p.interests.map((i) => (
                  <Chip key={i}>{i}</Chip>
                ))}
              </div>
            )}
          </div>
        </div>
      </Reveal>
      <div className="flex flex-col gap-4">
        {p.grade && (
          <Reveal delay={0.05} className="glass rounded-3xl p-6">
            <div className="text-xs uppercase tracking-wider text-muted">Currently</div>
            <div className="mt-2 font-display text-lg font-semibold">{p.grade}</div>
            {p.school && <div className="text-sm text-muted">{p.school}</div>}
          </Reveal>
        )}
        {p.funFacts.map((f, i) => (
          <Reveal key={f} delay={0.1 + i * 0.05} className="glass flex items-start gap-3 rounded-2xl p-5">
            <Sparkles size={18} className="mt-0.5 shrink-0 text-accent" />
            <span className="text-sm leading-relaxed">{f}</span>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
