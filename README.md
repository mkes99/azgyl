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
| `src/data/schedule.ts` | Fetches + validates the schedule from Google Sheets at build time | Rarely — see below, games are added in the Sheet, not this file |
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

## Schedule & season — how to add and update games

Games and seasons are **not edited in this codebase** — they live in a
Google Sheet (two tabs: `Seasons`, `Schedule`), fetched and validated at
build time by `src/data/schedule.ts`. Full setup and the weekly workflow are
in **`GOOGLE_SHEETS_SETUP.md`** — start there.

The short version: open the sheet, add/update rows in `Seasons` and
`Schedule`, save. A script validates the edit and either triggers a
rebuild automatically (~2 min) or emails whoever made the edit exactly
what's wrong, without publishing anything broken.

`src/data/schedule.ts` itself only needs touching to change the two CSV
URLs it fetches from (a one-time setup step), or if the validation rules
themselves need to change. It also validates independently at build time as
a backstop — if the sheet's own check somehow lets something bad through,
the build fails loudly rather than publishing it, and Cloudflare keeps
serving the last good deploy.

**`season_id`, `date`, `venue`, and `division` don't need to be retyped on
every `Schedule` row** — leave any of those cells blank and it inherits
whatever was in the row above (see "Leave repeated cells blank" in
`GOOGLE_SHEETS_SETUP.md`). Only the very first row of the tab needs every
column filled in.

**The homepage shows the next unplayed date from the first active event.** The league page shows all active events (a season and a tournament can both be `active` at once) with their full schedule.

---

## Admin instructions page — `/admin/setup`

`src/pages/admin/setup.astro` renders `GOOGLE_SHEETS_SETUP.md` directly on
the live site (imports the file straight from the repo root, so there's
one source of truth — editing the `.md` file updates the page too, nothing
to keep in sync by hand). It's for whoever manages the schedule sheet day
to day and doesn't have — or shouldn't need — GitHub access to read the
raw markdown file.

**This page is not meant to be public.** It isn't linked from anywhere on
the site and is marked `noindex` so it won't turn up in search, but that's
just a courtesy — the actual gate has to be **Cloudflare Access**, set up
once in the Cloudflare dashboard (no code involved):

1. Cloudflare dashboard → your account → **Zero Trust** → **Access** →
   **Applications** → **Add an application** → **Self-hosted**.
2. Application domain: your production domain, path `/admin/*` (covers
   this page and anything else added under `/admin/` later).
3. Add a policy — for a small group, **Allow**, rule type **Emails**,
   list the specific email addresses that should have access (board
   members, whoever manages the sheet). They'll sign in with a one-time
   code sent to that email, or "Sign in with Google" if you set that
   identity provider up — no separate password to create or share.
4. Save. `https://azgyl.com/admin/setup` now prompts for that login
   before showing anything — everything else on the site is unaffected.

If more admin-only pages get added later, they can go under
`src/pages/admin/` too and the same `/admin/*` Access rule covers them
automatically, no additional Cloudflare configuration needed.

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
  notes:   'No dogs allowed.',
  fieldMapUrl: '/assets/field-maps/mesquite.png', // optional, see below
}
```

Venues listed on the schedule are automatically linked to Google Maps.

**`fieldMapUrl`** (optional) shows a "Field map" button next to the venue
name that opens the image in a lightbox — a diagram of where each field
sits within the venue. Two ways to set it:

- **Local file (reliable, needs a code change):** drop the image in
  `public/assets/field-maps/` and reference it as
  `/assets/field-maps/<filename>` — **no `/public` in the path**, Astro
  serves everything under `public/` from the site root, so
  `public/assets/field-maps/mesquite.png` on disk becomes
  `/assets/field-maps/mesquite.png` as a URL.
- **Public link via the Sheet (no code change, needs Google Drive):**
  the optional `Venues` Sheet tab lets someone paste a link without
  touching code — it overrides whatever's hardcoded here if both exist.
  Full walkthrough (including why it has to be a Drive `uc?export=view`
  link and not a regular share link) is in `GOOGLE_SHEETS_SETUP.md`,
  "Venues tab".

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
