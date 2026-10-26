# Nithin Sivaraman · Profile

Live site: https://nithin-sivaraman.github.io/profile/

A student showcase that is driven entirely by JSON. You record the facts (awards, projects, skills) and the app builds the portfolio around them: a trophy wall, XP and levels, badges, a skill constellation and a printable résumé.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · Zod (schema validation) · Lucide icons. The build is fully static and deploys to Netlify, Vercel, GitHub Pages or any file host.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/
```

## Where the content lives

| File | What it is |
| --- | --- |
| `public/data/profile.json` | The default profile. Edit this file. |
| `public/data/<name>.json` | Extra profiles, opened with `?profile=<name>` (try `?profile=starter`) |
| `public/images/` | Photos and certificate images, referenced as `images/foo.jpg` |

The only required field is `profile.name`. Every other field is optional, and a section with no data is hidden automatically.

### Main keys

- **`site.theme`**: `accent` and `accent2` colours, and `mode` (`dark`, `light` or `auto`)
- **`site.sections`**: sets the order and visibility of sections. For example, `{ "id": "gallery", "enabled": false }` hides the gallery, and `title` and `subtitle` override the section headings. Section ids: `about, level, skills, achievements, projects, certifications, journey, goals, testimonials, gallery, contact`
- **`site.categories`**: your own achievement fields, each with a label, emoji and colour
- **`site.gamification`**: `enabled`, plus `tierPoints` to change how much XP each level of competition is worth
- **`profile`**: name, headline, rotating `roles`, bio, avatar, school, grade, fun facts, interests, email and `contacts`
- **`achievements[]`**: title, category, `tier` (`school`, `district`, `state`, `national` or `international`), position, date (`YYYY-MM-DD`), organizer, description, image, certificateUrl, tags, `featured`
- **`skills[]`, `projects[]`, `certifications[]`, `education[]`, `activities[]`, `goals[]`, `testimonials[]`, `gallery[]`**

The full schema, with its defaults, is in `src/lib/schema.ts`.

### How XP works

XP for an achievement = points for its tier (10, 20, 40, 80 or 150, from school up to international) × a placing bonus. The bonus is ×1.5 for 1st/gold/winner, ×1.3 for 2nd/silver/1st runner-up and ×1.15 for 3rd/bronze/2nd runner-up. Reaching level *n* takes 50·n² XP in total. The 12 badges unlock on their own from the data.

## Other features

- `⌘K` / `Ctrl+K` command palette that searches every achievement, skill, project and certification
- A grid or timeline view of achievements, with filters for field and level and a text search
- A **Résumé** button that prints a clean one-page CV, or saves it as a PDF
- Light and dark themes, scroll progress bar, reduced-motion support and a mobile layout
