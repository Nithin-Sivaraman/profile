import { z } from "zod";

/**
 * Single source of truth for the profile JSON.
 * Everything is optional except the student's name, so a brand-new student
 * can start with a tiny file and grow it over the years.
 */

const link = z.object({ label: z.string(), url: z.string() });

export const SECTION_IDS = [
  "about",
  "level",
  "skills",
  "achievements",
  "projects",
  "certifications",
  "journey",
  "goals",
  "testimonials",
  "gallery",
  "contact",
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const TIERS = ["school", "district", "state", "national", "international"] as const;
export type Tier = (typeof TIERS)[number];

const section = z.object({
  id: z.enum(SECTION_IDS),
  enabled: z.boolean().default(true),
  title: z.string().optional(),
  subtitle: z.string().optional(),
});

const category = z.object({
  label: z.string(),
  emoji: z.string().default("⭐"),
  color: z.string().default("#8b5cf6"),
});

export const profileSchema = z.object({
  site: z
    .object({
      title: z.string().optional(),
      theme: z
        .object({
          accent: z.string().default("#8b5cf6"),
          accent2: z.string().default("#22d3ee"),
          mode: z.enum(["dark", "light", "auto"]).default("auto"),
        })
        .prefault({}),
      sections: z.array(section).optional(),
      categories: z.record(z.string(), category).default({}),
      gamification: z
        .object({
          enabled: z.boolean().default(true),
          tierPoints: z.partialRecord(z.enum(TIERS), z.number()).default({}),
        })
        .prefault({}),
      auth: z
        .object({
          enabled: z.boolean().default(false),
          provider: z.string().default("google"),
          clientId: z.string().default(""),
          allowedEmails: z.array(z.string()).default([]),
        })
        .prefault({}),
      footer: z.string().optional(),
    })
    .prefault({}),

  profile: z.object({
    name: z.string().min(1),
    headline: z.string().default(""),
    roles: z.array(z.string()).default([]),
    avatar: z.string().optional(),
    photo: z.string().optional(),
    location: z.string().optional(),
    school: z.string().optional(),
    schoolUrl: z.string().optional(),
    grade: z.string().optional(),
    bio: z.string().default(""),
    funFacts: z.array(z.string()).default([]),
    interests: z.array(z.string()).default([]),
    availability: z.string().optional(),
    email: z.string().optional(),
    contacts: z.array(link.extend({ type: z.string().default("link") })).default([]),
  }),

  skills: z
    .array(
      z.object({
        name: z.string(),
        category: z.string().default("General"),
        level: z.number().min(0).max(100).default(50),
        since: z.string().optional(),
      }),
    )
    .default([]),

  achievements: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string(),
        category: z.string().default("other"),
        tier: z.enum(TIERS).default("school"),
        position: z.string().optional(),
        date: z.string(),
        organizer: z.string().optional(),
        description: z.string().default(""),
        image: z.string().optional(),
        certificateUrl: z.string().optional(),
        tags: z.array(z.string()).default([]),
        featured: z.boolean().default(false),
      }),
    )
    .default([]),

  projects: z
    .array(
      z.object({
        /** URL slug for the detail page; defaults to a slug of the title. */
        id: z.string().optional(),
        title: z.string(),
        summary: z.string().default(""),
        description: z.string().default(""),
        date: z.string().optional(),
        tags: z.array(z.string()).default([]),
        image: z.string().optional(),
        emoji: z.string().optional(),
        links: z.array(link).default([]),
        featured: z.boolean().default(false),
        /** "What I did": shown as a list on the detail page. */
        contributions: z.array(z.string()).default([]),
        photos: z.array(z.object({ src: z.string(), caption: z.string().default("") })).default([]),
      }),
    )
    .default([]),

  certifications: z
    .array(
      z.object({
        title: z.string(),
        issuer: z.string(),
        date: z.string(),
        credentialId: z.string().optional(),
        url: z.string().optional(),
      }),
    )
    .default([]),

  education: z
    .array(
      z.object({
        institution: z.string(),
        url: z.string().optional(),
        program: z.string().default(""),
        period: z.string(),
        score: z.string().optional(),
        highlights: z.array(z.string()).default([]),
      }),
    )
    .default([]),

  activities: z
    .array(
      z.object({
        role: z.string(),
        organization: z.string(),
        period: z.string(),
        type: z.string().default("Activity"),
        description: z.string().default(""),
      }),
    )
    .default([]),

  goals: z
    .array(
      z.object({
        title: z.string(),
        progress: z.number().min(0).max(100).default(0),
        target: z.string().optional(),
        note: z.string().optional(),
      }),
    )
    .default([]),

  testimonials: z
    .array(z.object({ quote: z.string(), author: z.string(), role: z.string().default("") }))
    .default([]),

  gallery: z.array(z.object({ src: z.string(), caption: z.string().default("") })).default([]),
});

export type ProfileData = z.infer<typeof profileSchema>;
export type Achievement = ProfileData["achievements"][number];
export type Project = ProfileData["projects"][number];

export function projectSlug(p: Project): string {
  return p.id ?? p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const projectHref = (p: Project) => `#/projects/${projectSlug(p)}`;

export const DEFAULT_SECTIONS: { id: SectionId; title: string; subtitle: string }[] = [
  { id: "about", title: "About me", subtitle: "The person behind the trophies" },
  { id: "level", title: "Talent level", subtitle: "Every achievement levels me up" },
  { id: "skills", title: "Skill constellation", subtitle: "Hover a star to explore" },
  { id: "achievements", title: "Trophy wall", subtitle: "Competitions, awards and honours" },
  { id: "projects", title: "Projects", subtitle: "Things I've built and made" },
  { id: "certifications", title: "Certifications", subtitle: "Verified learning" },
  { id: "journey", title: "My journey", subtitle: "Education, leadership and service" },
  { id: "goals", title: "Now & next", subtitle: "What I'm working towards" },
  { id: "testimonials", title: "Kind words", subtitle: "From mentors and teachers" },
  { id: "gallery", title: "Gallery", subtitle: "Moments worth remembering" },
  { id: "contact", title: "Say hello", subtitle: "Let's connect" },
];

/** JSON order and visibility win; with no list configured, every default section is shown. */
export function resolveSections(data: ProfileData) {
  const configured = data.site.sections ?? [];
  const byId = new Map(DEFAULT_SECTIONS.map((s) => [s.id, s]));
  const out = configured.map((s) => ({ ...byId.get(s.id)!, ...s, enabled: s.enabled ?? true }));
  if (configured.length === 0) {
    for (const s of DEFAULT_SECTIONS) out.push({ ...s, enabled: true });
  }
  return out.filter((s) => s.enabled);
}

export function formatIssues(err: z.ZodError): string[] {
  return err.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`);
}
