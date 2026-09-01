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
| `/boundaries` | *disabled* — `/boundaries` redirects to `/teams` | Hidden site-wide since 2026-08-31, not back on the table until spring. Source lives at `src/pages/_disabled/boundaries.astro` (see comment at the top of that file to restore it). |
| `/contact` | `src/pages/contact.astro` | Contact form (Resend) |
| `/play` | `src/pages/play.astro` | How AZGYL works |
| `/404` | `src/pages/404.astro` | 404 page |

---

## Data Files — one-to-one naming, edit only these

| File | What it controls | Edit when |
|------|-----------------|-----------|
| `src/data/schedule.ts` | Game schedule (all seasons + tournaments) | Adding/updating games |
| `src/data/standings.ts` | Division standings | After each game day |
| `src/data/venues.ts` | Venue locations + map links | Venues change |
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
| `src/data/site-meta.ts` | Site name, nav structure, social links | Rarely — see below for adding a social platform |
| `src/data/announcement.ts` | Site-wide announcement banner (copy, link, schedule) | New promo, sale, or campaign |

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
      arrival:  '8:30 AM',           // optional — arrival/warmup time, shown under the game time
      home:     'Diamonds',          // must match a name in teams.ts
      away:     'Tukee Lightning',
      division: '12U',
      venue:    'mesquite',          // must match an id in venues.ts — drives grouping, address, map, notes
      field:    'Field 2',           // plain text, whatever that venue calls it — not validated
      notes:    'Senior night',      // optional — see the note below on the two different `notes`
    },
  ],
}
```

**To add a new season or tournament:** copy the whole event block, change the `id`, set `active: true`.

**To add a tournament alongside a regular season:** add a second event with `type: 'tournament'`. Both appear on the league page if `active: true`.

**The homepage shows the first active event's upcoming games (limit 5).** The league page shows all active events with their full schedule and standings.

**There are two different `notes` fields — don't confuse them.** This
`notes` (on a `Game`, here in `schedule.ts`) is per-game and shows inline
under that one matchup, e.g. `"Senior night"`, `"Picture day — arrive 30
min early"`. It's unrelated to the `notes` on a `Venue` (in `venues.ts`) —
that one is venue-wide, shows once per venue behind the "Notes" button
next to the venue name (see "Venues" below), and is about the location
itself (`"No dogs allowed"`), not about any one game.

---

## Standings — how to update

Open `src/data/standings.ts`. Find the matching `eventId` and division, update the numbers:

```ts
{ team:'Diamonds', W:4, L:1, T:0, GF:38, GA:22 },
```

Standings are sorted automatically by points (W=3, T=1), then goal differential.

---

## Announcement banner — how to update

Open `src/data/announcement.ts`:

```ts
export const announcement = {
  enabled:     true,
  message:     'New: the AZGYL × State Forty Eight tee just dropped — $30, pre-order by 9/30.',
  linkLabel:   'Shop the Tee',
  linkHref:    'https://arizona-girls-youth-lacrosse.square.site/',
  dismissible: false,
  startDate:   null,                            // null = visible immediately
  endDate:     '2026-10-01T00:00:00-07:00',      // null = never expires
};
```

- **`startDate`/`endDate`** are evaluated in the visitor's browser, not at build time — this is a static site, so a build-time check would only be correct until the next deploy. Write them in Arizona time using an explicit `-07:00` offset (Arizona doesn't observe DST, so this is safe year-round) — e.g. `'2026-09-01T00:00:00-07:00'`.
- **`dismissible: true`** adds a close (×) button that hides the banner for the visitor's current browser session (`sessionStorage`) — it comes back on their next visit. `false` removes the button entirely.
- Set **`enabled: false`** to pull the banner down immediately without waiting on a date.
- To turn it off entirely between campaigns, either set `enabled: false` or just leave `endDate` in the past — nothing needs to be removed from `BaseLayout.astro`.

---

## Social links — how to add a platform

Currently just Instagram, but built to grow. Two steps:

1. Add an entry to `socialLinks` in `src/data/site-meta.ts`:
   ```ts
   export const socialLinks = [
     { platform: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/arizonagirlsyouthlacrosse/' },
     { platform: 'facebook',  label: 'Facebook',   href: 'https://facebook.com/...' },
   ];
   ```
2. Add a matching icon to the `icons` map in `src/components/SocialIcons.astro` (24×24 viewBox, `currentColor` stroke, keyed by the same `platform` string).

That's it — `SocialIcons.astro` (used in the footer) renders however many platforms are in the array, no markup to duplicate. The header deliberately doesn't show social icons — its action area is already tight with the "Find My Team" button and the mobile menu toggle.

---

## Teams — requirements for adding a team

Open `src/data/teams.ts` and add an entry with the following fields. The
directory and team card always need the "Yes" fields to render correctly —
omitting one of those either breaks the build or leaves a card visibly
incomplete.

**Don't add a `slug` field.** It's derived automatically from `name` —
lowercased, with anything that isn't `a-z`/`0-9` collapsed into a hyphen
(e.g. `'Sol Sisters'` → `'sol-sisters'`). See `slugify()` at the bottom of
`teams.ts`. It isn't currently read anywhere else in the code (no team
detail pages, no list keys) — same as `contact` below, reserved for future
use — but since it's computed for free, every team gets one automatically
either way.

| Field | Required | Notes |
|-------|----------|-------|
| `name` | Yes | Display name on the card, and the source of the auto-generated `slug`. |
| `divisions` | Yes | Array of divisions offered, from `['8U','10U','12U','14U']`. |
| `href` | Yes | The club's own external site/registration link — AZGYL doesn't handle registration. |
| `city` | Yes | Shown on the card; used by the team finder's text search when the filter is active. |
| `logo` | Yes | Path under `/assets/team-logos/` — add the image file first. |
| `color` | Yes | Hex color, used as the card's accent. |
| `notes` | No | One-sentence description shown on the card when present. |
| `area` | No | Neighborhood/region description (e.g. `'Ahwatukee / South Phoenix'`). Only used by the team finder, which is currently hidden — see `TODO.md`. |
| `district` | No | School district(s) served. Shown on the card when present; also used by the finder. |
| `zipcode` | No | Array of zip codes served. Only powers the finder's zip search — **required again once the filter is turned back on**, since a team with no zip codes just won't match any zip search. |
| `contact` | No | Email address for the club. Not currently rendered anywhere — flagged as unused in `TODO.md`. |

`notes`, `area`, `district`, and `zipcode` were made optional 2026-08-31 —
the fields still exist in the directory/card components and will render
correctly if present, they're just not required to add a team right now.

To remove a team without losing history (e.g. a club folds mid-season), comment the block out rather than deleting it — see the note at the top of `teams.ts` for the existing precedent (Marana Reapers, Cave Creek, Vail) and why past schedule/standings results are left untouched.

---

## Venues

Open `src/data/venues.ts`. Each venue has an `id` that matches the `venue`
value on a game in `schedule.ts` (the `field` value on that same game is
just plain text — "Field 1", "Chuparosa Field" — not looked up anywhere,
since different venues label their fields differently):

```ts
{
  id:      'mesquite',
  name:    'Mesquite High School',
  address: '500 S McQueen Rd, Gilbert, AZ 85233',
  city:    'Gilbert',
  mapUrl:  'https://maps.google.com/?q=...',
  notes:   'No dogs allowed.',              // optional, see below
  fieldMapUrl: '/assets/field-maps/mesquite.png', // optional, see below
}
```

Venues listed on the schedule are automatically linked to Google Maps.

**`notes`** (optional) shows a "Notes" button next to the venue name —
click to reveal the text (not a hover tooltip, so it works on touch
devices too). Shown once per venue per day, not once per game, even when
that venue has ten games that day. Leave it unset and the button just
doesn't appear.

**`fieldMapUrl`** (optional) shows a "Field map" button next to the venue
name that opens the image in a lightbox — a diagram of where each field
sits within the venue. Drop the image in `public/assets/field-maps/` and
reference it as `/assets/field-maps/<filename>` — **no `/public` in the
path**, Astro serves everything under `public/` from the site root, so
`public/assets/field-maps/mesquite.png` on disk becomes
`/assets/field-maps/mesquite.png` as a URL. (The `google-sheets-schedule`
branch also supports a public-link override via an optional Sheet tab —
not available here, since this branch's schedule isn't Sheet-driven.)

### How games get grouped by venue on the site

Every game that shares a `venue` value on the same date is grouped
together on `/league` under one heading — venue name, address, map link,
field map, and notes are all shown once per group, not once per game. If
some games that date use a different `venue` (e.g. some divisions at
Mesquite, others at Naranja Park), the site automatically splits that day
into one section per venue instead. Nothing special to do for either
case — the grouping follows straight from whatever `venue` each game
carries in `schedule.ts`.

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
