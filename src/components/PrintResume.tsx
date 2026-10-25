import type { ProfileData } from "../lib/schema";
import { categoryMeta, formatDate, TIER_LABEL } from "../lib/xp";

/** Hidden on screen; becomes a clean black-on-white résumé when the page is printed / saved as PDF. */
export function PrintResume({ data }: { data: ProfileData }) {
  const p = data.profile;
  const h2 = "mt-5 mb-1.5 border-b border-neutral-300 pb-1 text-[11px] font-bold uppercase tracking-[0.15em]";
  return (
    <div className="print-only text-[11.5px] leading-snug text-neutral-900" style={{ fontFamily: "Inter, sans-serif" }}>
      <h1 className="text-3xl font-bold" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
        {p.name}
      </h1>
      <p className="mt-0.5">{[p.grade, p.school, p.location].filter(Boolean).join(" · ")}</p>
      <p className="text-neutral-600">{[p.email, ...p.contacts.map((c) => c.url)].filter(Boolean).join(" · ")}</p>
      {p.bio && <p className="mt-3">{p.bio}</p>}

      {data.achievements.length > 0 && (
        <>
          <h2 className={h2}>Achievements</h2>
          {[...data.achievements]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((a) => (
              <div key={a.title + a.date} className="flex justify-between gap-4 py-0.5">
                <span>
                  <b>{a.title}</b>
                  {a.position && ` · ${a.position}`} <span className="text-neutral-500">({TIER_LABEL[a.tier]}, {categoryMeta(data, a.category).label})</span>
                </span>
                <span className="shrink-0 text-neutral-500">{formatDate(a.date)}</span>
              </div>
            ))}
        </>
      )}

      {data.projects.length > 0 && (
        <>
          <h2 className={h2}>Projects</h2>
          {data.projects.map((pr) => (
            <div key={pr.title} className="py-0.5">
              <b>{pr.title}</b> · {pr.summary} <span className="text-neutral-500">[{pr.tags.join(", ")}]</span>
            </div>
          ))}
        </>
      )}

      {data.education.length > 0 && (
        <>
          <h2 className={h2}>Education</h2>
          {data.education.map((e) => (
            <div key={e.program + e.period} className="flex justify-between py-0.5">
              <span>
                <b>{e.program}</b>, {e.institution}
                {e.score && ` · ${e.score}`}
              </span>
              <span className="text-neutral-500">{e.period}</span>
            </div>
          ))}
        </>
      )}

      {data.activities.length > 0 && (
        <>
          <h2 className={h2}>Leadership & service</h2>
          {data.activities.map((a) => (
            <div key={a.role + a.organization} className="flex justify-between py-0.5">
              <span>
                <b>{a.role}</b>, {a.organization}
              </span>
              <span className="text-neutral-500">{a.period}</span>
            </div>
          ))}
        </>
      )}

      {data.skills.length > 0 && (
        <>
          <h2 className={h2}>Skills</h2>
          <p>{data.skills.map((s) => s.name).join(" · ")}</p>
        </>
      )}

      {data.certifications.length > 0 && (
        <>
          <h2 className={h2}>Certifications</h2>
          <p>{data.certifications.map((c) => `${c.title} (${c.issuer}, ${formatDate(c.date)})`).join(" · ")}</p>
        </>
      )}
    </div>
  );
}
