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

## Studio (built-in editor)

Open **`#/studio`**, or click **Studio** in the nav, to get:

- a JSON editor that validates as you type, with errors listed by field path
- a **Quick-add achievement** form, so students don't have to write JSON by hand
- **Preview**, which shows the whole site with your draft (`?draft=1`). The draft is saved only in this browser.
- **Download JSON**. Put the downloaded file in `public/data/` and redeploy to publish it.

## Locking the Studio

`site.auth` in `profile.json` puts the Studio behind Google sign-in:

```json
"auth": {
  "enabled": true,
  "provider": "google",
  "clientId": "<your-id>.apps.googleusercontent.com",
  "allowedEmails": ["saka.admin@gmail.com"]
}
```

Only the listed addresses can open `#/studio`; everyone else sees a locked screen. The rules are always read from `data/profile.json`, so `?profile=other` cannot be used to slip past the gate. The session lasts until the browser tab is closed. Set `enabled` to `false` to turn the lock off.

### Getting a Client ID

1. In the [Google Cloud console](https://console.cloud.google.com/), create a project.
2. Configure the OAuth consent screen: type **External**, fill in the app name and your support email. While it stays in **Testing**, add each allowed address under **Test users**.
3. **Credentials → Create credentials → OAuth client ID → Web application**.
4. Under **Authorised JavaScript origins** add every origin the site runs on, e.g. `http://localhost:5173` and your deployed `https://…` address. No redirect URI is needed.
5. Copy the client ID into `site.auth.clientId`.

### What this lock is, and is not

It hides the edit screen from visitors. It is **not** a security boundary, because the whole site is static and runs in the browser:

- `profile.json` is a public file — anyone can read it, including the allowed-email list.
- The Studio only writes to that browser's `localStorage` and downloads a file. It never writes to your server.
- Publishing still means replacing `public/data/profile.json` and redeploying, which is protected by your hosting or git account.

Anyone determined can still run the code locally and edit their own copy. That copy is theirs, not your published site.

## Other features

- `⌘K` / `Ctrl+K` command palette that searches every achievement, skill, project and certification
- A grid or timeline view of achievements, with filters for field and level and a text search
- A **Résumé** button that prints a clean one-page CV, or saves it as a PDF
- Light and dark themes, scroll progress bar, reduced-motion support and a mobile layout
