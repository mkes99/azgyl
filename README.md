# Arizona Girls Youth Lacrosse — AZGYL Website

**Stack:** Astro 5.6 · Cloudflare Pages · Outfit font · Resend email

---

## Quick Start

```bash
npm install
npm run dev      # localhost:4321
npm run build    # ./dist
```

**Deploy:** Cloudflare Pages — build command `npm run build`, output directory `dist`

---

## Pages (all flat — no subfolders)

| URL | File | Purpose |
|-----|------|---------|
| `/` | `src/pages/index.astro` | Homepage |
| `/teams` | `src/pages/teams.astro` | Team finder + directory |
| `/league` | `src/pages/league.astro` | Schedule + standings |
| `/parents` | `src/pages/parents.astro` | Parent guide (includes age groups, equipment, FAQ, parent role) |
| `/rules` | `src/pages/rules.astro` | Full bylaws + rules FAQ |
| `/resources` | `src/pages/resources.astro` | Age chart + code of conduct + resource links |
| `/leadership` | `src/pages/leadership.astro` | Board + committees |
| `/boundaries` | `src/pages/boundaries.astro` | Boundary map |
| `/contact` | `src/pages/contact.astro` | Contact form (Resend) |
| `/play` | `src/pages/play.astro` | How AZGYL works |
| `/404` | `src/pages/404.astro` | 404 page |

---

## Data Files — one-to-one naming, edit only these

| File | What it controls | Edit when |
|------|-----------------|-----------|
| `src/data/schedule.ts` | Game schedule (all seasons + tournaments) | Adding/updating games |
| `src/data/standings.ts` | Division standings | After each game day |
| `src/data/fields.ts` | Field locations + map links | Venues change |
| `src/data/teams.ts` | Member club directory | Clubs change |
| `src/data/board.ts` | Board member names + roles | Annual election |
| `src/data/committees.ts` | Standing committees | Governance changes |
| `src/data/bylaws.ts` | AZGYL Rules & Regulations | Bylaws update |
| `src/data/parent-faqs.ts` | Parent FAQ answers | Content update |
| `src/data/rule-faqs.ts` | Rules FAQ answers | Rules update |
| `src/data/rules-summary.ts` | Rules summary cards | Rules update |
| `src/data/code-of-conduct.ts` | Code of conduct items | Annual review |
| `src/data/season-highlights.ts` | Homepage highlight cards | Season start |
| `src/data/resource-cards.ts` | Resources page quick links | Nav changes |
| `src/data/expansion-areas.ts` | Growth market chips | Market changes |
| `src/data/official-links.ts` | USA Lacrosse external links | Rarely |
| `src/data/site-meta.ts` | Site name, nav structure | Rarely |

---

## Schedule — how to add and update games

Open `src/data/schedule.ts`. Each **event** is a season or tournament:

```ts
{
  id:        'spring-2026',          // unique slug
  name:      'Spring 2026',          // shown on the site
  type:      'season',               // 'season' or 'tournament'
  active:    true,                   // true = shown on homepage + league page
  startDate: '2026-02-07',
  endDate:   '2026-04-11',
  games: [
    {
      id:       'sp26-g1',
      date:     '2026-02-07',        // YYYY-MM-DD
      time:     '9:00 AM',
      home:     'Diamonds',          // must match a name in teams.ts
      away:     'Tukee Lightning',
      division: '12U',
      field:    'mesquite',          // must match an id in fields.ts
      result:   'upcoming',          // 'upcoming' | 'W' | 'L' | 'T' | 'cancelled'
      score:    '8-5',               // home score first, omit if upcoming
      notes:    'Senior night',      // optional
    },
  ],
}
```

**To add a new season or tournament:** copy the whole event block, change the `id`, set `active: true`.

**To add a tournament alongside a regular season:** add a second event with `type: 'tournament'`. Both appear on the league page if `active: true`.

**The homepage shows the first active event's upcoming games (limit 5).** The league page shows all active events with their full schedule and standings.

---

## Standings — how to update

Open `src/data/standings.ts`. Find the matching `eventId` and division, update the numbers:

```ts
{ team:'Diamonds', W:4, L:1, T:0, GF:38, GA:22 },
```

Standings are sorted automatically by points (W=3, T=1), then goal differential.

---

## Fields

Open `src/data/fields.ts`. Each field has an `id` that matches the `field` value in `schedule.ts`:

```ts
{
  id:      'mesquite',
  name:    'Mesquite Athletic Complex',
  address: '6100 S. 80th St, Chandler, AZ 85249',
  city:    'Chandler',
  mapUrl:  'https://maps.google.com/?q=...',
  notes:   'Fields 4–5 for AZGYL games.',
}
```

Fields listed on the schedule are automatically linked to Google Maps.

---

## Contact Form (Resend + Cloudflare Pages)

The contact form sends email via Resend through a Cloudflare Pages Function at `/api/contact`.

### Environment variables (set in Cloudflare Pages Dashboard → Settings → Environment variables)

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Your Resend API key — starts with `re_` |
| `EMAIL_FROM` | Sender address: `AZGYL Website <noreply@azgyl.com>` |
| `EMAIL_TO` | **Single address:** `info@azgyl.com` — OR — **JSON object for per-department routing:** `{"General Questions":"info@azgyl.com","Officials":"officials@azgyl.com"}` |
| `RECAPTCHA_SECRET` | Google reCAPTCHA v3 secret key (optional but recommended) |
| `RECAPTCHA_MIN_SCORE` | Minimum score 0.0–1.0 (default `0.5`) |

### reCAPTCHA v3 setup
1. Get a site key + secret key from [google.com/recaptcha](https://www.google.com/recaptcha)
2. Add `RECAPTCHA_SECRET` to Cloudflare env vars
3. Pass `recaptchaSiteKey="YOUR_SITE_KEY"` to `<BaseLayout>` on the contact page

### Per-department email routing
Set `EMAIL_TO` to a JSON string in Cloudflare:
```json
{
  "General Questions": "info@azgyl.com",
  "Registration & Team Signup": "info@azgyl.com",
  "Player Placement & Boundaries": "info@azgyl.com",
  "Rules & Eligibility": "rules@azgyl.com",
  "Scheduling & Operations": "schedule@azgyl.com",
  "Coaching & Volunteers": "info@azgyl.com",
  "Officials": "officials@azgyl.com",
  "Website & Communications": "web@azgyl.com"
}
```
Any department not found in the JSON falls back to the first value.

---

## Logo

The transparent logo used in the header and footer is at:
`public/assets/brand/logo-transparent.png`

To swap it: replace that file. No code changes needed.

---

## Key Bylaws enforced in site content

- §2 USA Lacrosse membership required. Forfeit if unregistered.
- §3 Code of Conduct must be **signed** (not just clicked) before game 1.
- §7 Grades K–8 only. School/home domicile placement rules.
- §9 Dues: February 1st. Unregistered player = forfeit.
- §10 Flex: max 4 double-rostered. 5+ needed = forfeit.
- §15 Home team: lined field, water+ice, scorer table, H&S sheet.
- §17 Red card = ejected + miss next game. 2/season = out for year.
- §18 75%+ elapsed in a tie → may resume from suspension point.
