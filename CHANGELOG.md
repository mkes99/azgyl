# Changelog

All notable changes to the AZGYL site are recorded here, newest first.
Versions continue the `version 3.x` sequence used in the commit history up to 3.4.

Open work is tracked in [TODO.md](TODO.md).

---

## [3.13] — 2026-08-31 — Schedule & season now sourced from Google Sheets

### Added

- **Schedule and season data moved out of code and into a Google Sheet**
  (two tabs: `Seasons`, `Schedule`), fetched and validated at build time.
  Full setup and the weekly workflow are documented fresh in
  `GOOGLE_SHEETS_SETUP.md` (the previous version of that doc was written
  for an older, never-finished schema and didn't match how the site
  actually works — replaced rather than patched). Standings remains a
  separate, not-yet-automated sheet — see the note now at the top of
  `STANDINGS_SETUP.md`.
  - `src/data/schedule.ts` fetches both tabs' published CSV at build time
    (`SEASONS_CSV_URL`/`SCHEDULE_CSV_URL`), parses them (new
    `src/lib/csv.ts` — hand-rolled, quote/comma-aware, no dependency
    needed for data this size), validates every row (season shell
    integrity, date formats, orphaned `event` references, team names,
    divisions, and field ids against `teams.ts`/`fields.ts`), and throws —
    failing the build — if anything's wrong. Cloudflare Pages keeps
    serving the last successful deploy rather than a build with bad or
    partial data.
  - New `/valid-values.json` endpoint (`src/pages/valid-values.json.ts`)
    publishes the current valid team names, divisions, and field ids,
    generated live from `teams.ts`/`fields.ts`. This is the single source
    of truth both the build-time validator and the sheet-side validator
    (below) check against — add a team on the site and both validators
    know immediately, no second list to keep in sync by hand.
  - The sheet itself validates on every edit via an Apps Script
    (`GOOGLE_SHEETS_SETUP.md`, written in full — copy/paste ready): a
    debounced (2 min after the last edit, not per-keystroke) check against
    `/valid-values.json` that either triggers a Cloudflare deploy hook when
    the data's clean, or emails whoever made the edit exactly what's wrong
    and where, without ever triggering a deploy. Falls back to the shared
    board inbox if Apps Script can't determine who made the edit — a known
    limitation of its editor-detection, not a bug, documented as such.
  - Verified the whole pipeline end-to-end against a local mock CSV server
    before shipping: comma-inside-quotes parsing, a deliberately invalid
    team name correctly blocking the build with a clear row-numbered error,
    and a valid dataset correctly rendering on `/league`.

### Removed

- **`ScheduleTable.astro`** — a fully orphaned, broken component. It called
  `getResult()`, a function that was never defined anywhere in the
  codebase, and referenced a `results.ts` data file that was never
  created — leftover from an abandoned attempt at per-game result
  tracking. Confirmed via grep it was never imported by any page; deleted
  rather than fixed, since nothing on the live site tracks or displays
  per-game results (`LeagueSchedule.astro` is explicit about this: "No
  results, no status tracking — the schedule just shows games").
- **`getAllGames`/`getUpcomingGames`/`getDivisionsInEvent`** helpers in
  `schedule.ts` — same abandoned feature, same story: `getUpcomingGames`
  filtered on `game.result`, a field that didn't exist on the `Game` type.
  Confirmed unused anywhere else before removing.

---

## [3.12] — 2026-08-31 — Footer restructure, stale duplicate CSS removed

### Fixed

- **Footer still had a large dead gap under the nav columns after 3.11's
  fix.** Trimming the Resources column to match Parents' 5 links (3.11)
  only balanced those two columns *against each other* — it didn't touch
  the real mismatch, which is the nav columns vs. the brand block (logo +
  tagline + description + badge + social row), which is inherently taller
  than a short link list and always will be. Restructured the footer into
  two independent rows instead of one shared grid row: a brand band up top
  (logo beside the copy, not stacked above it — `.footer-brand-row` /
  `.footer-brand-block`) and the three nav-link columns in their own row
  below (`.footer-grid`, now `repeat(3, 1fr)` instead of the old
  `1.6fr 1fr 1fr 1fr`). Neither row has to match the other's height, so a
  short nav list no longer leaves a visible gap.
- **Found and removed a stale, fully duplicate footer stylesheet in
  `global.css`** while debugging the restructure — a "5. FOOTER" section
  (plus a stray `.footer-grid` in the Grids utilities, plus footer rules
  inside two of its own responsive breakpoints, 1080px/600px, that didn't
  even match the component's own 960px/580px ones) that pre-dated
  `SiteFooter.astro` getting its own scoped `<style>` block and was never
  cleaned up. It silently coexisted with the component's real styles this
  whole time, only visibly breaking when a scoped rule didn't happen to
  redeclare a property the stale rule also set — that's exactly what
  happened here: the stale `.footer-brand-block { flex-direction: column }`
  won because the new scoped rule set `display/gap/align-items/flex-wrap`
  but never touched `flex-direction`, so the old value applied uncontested
  and stacked the logo above the text instead of beside it. Footer styling
  now lives only in `SiteFooter.astro` — noted in a comment in `global.css`
  so it doesn't grow back.

---

## [3.11] — 2026-08-31 — Contact page redesign, footer rebalance, social links made extensible

### Changed

- **`/contact` restructured from a 2-column layout to a stacked one.**
  `.contact-layout` (`1fr 320px` grid, `align-items:start`) let the "Common
  topics" sidebar grow taller than the form with nothing forcing them to
  match — after adding a 5th topic card (Instagram) it left a large empty
  gap under the form. The form is now full-width (capped at 720px via the
  new `.contact-form-wrap`) in its own section; "Common topics" moved to a
  full-width `section-alt` below it as a responsive 3-column card grid
  (`.topics-grid`, 3 → 2 → 1 columns), matching the card-grid pattern
  already used on `/resources`. New topics now wrap to another row instead
  of stretching one narrow column taller — this scales instead of degrading.
- **Footer `Resources` column trimmed from 7 links to 5.** Age chart and
  Code of conduct were listed twice — once here, once in the `Parents`
  column right next to it — which was the main driver of the two columns'
  height mismatch (and made the brand column's Instagram icon look
  orphaned in the leftover white space below it). Both links still exist,
  in the `Parents` column and the nav dropdown; only the duplicate footer
  entry is gone.
- **`socialLinks` changed from a single-platform object to an array**
  (`src/data/site-meta.ts`), and the footer's icon markup extracted into a
  new shared `SocialIcons.astro` component with a small `icons` registry
  keyed by platform. Adding Facebook/TikTok/etc. later is now: one line in
  `socialLinks`, one SVG entry in `SocialIcons.astro`'s `icons` map — no
  markup duplication, and the row lays out however many platforms exist.
  Discussed and deliberately **did not** add an icon to the header — the
  action area there is already tight (Find My Team button + mobile menu
  toggle) and doesn't have room to grow the same way the footer does as
  more platforms get added.

---

## [3.10] — 2026-08-31 — Announcement banner, Instagram, boundaries takedown, broken links

### Added

- **Site-wide announcement banner** — a promo bar above the header, rose-deep
  background, cream text/CTA. Content and scheduling live in the new
  `src/data/announcement.ts`, rendered by the new `AnnouncementBanner.astro`
  in `BaseLayout.astro`. First use: the AZGYL × State Forty Eight tee
  pre-order ($30, closes 9/30), linking out to the Square storefront.
  - `startDate`/`endDate` are evaluated **client-side**, not at build time —
    the site is a fully static build, so a build-time check would only stay
    correct until the next deploy. Dates are written with an explicit
    `-07:00` offset (Arizona doesn't observe DST, so this is safe
    year-round) rather than resolved through the visitor's own timezone.
    This banner: no start date (visible immediately), expires 2026-10-01
    00:00 Phoenix time.
  - Supports an optional dismiss (×) button, session-scoped via
    `sessionStorage` — built but **not activated** for this campaign
    (`dismissible: false`) at the requester's preference, to keep the tee
    announcement visible for the full pre-order window.
- **Instagram** (`@arizonagirlsyouthlacrosse`) linked from the footer's brand
  column (icon, the conventional social-icon spot) and from a new "Follow
  along" card on `/contact` alongside the existing common-topics panels. The
  header's action area was deliberately left alone — it's already tight with
  the "Find My Team" CTA and the mobile menu toggle. URL centralized as
  `socialLinks.instagram` in `src/data/site-meta.ts` rather than duplicated
  across both components.

### Fixed

- **Two dead links on `/resources`.** `resource-cards.ts` linked the Age
  Chart and Code of Conduct cards to `/resources/age-chart` and
  `/resources/code-of-conduct` — routes that don't exist. Both now point to
  the real anchors, `/resources#age-chart` and `/resources#code-of-conduct`,
  where that content has lived all along. Same fix applied to the "Conduct"
  link under the Rules & Discipline committee in `committees.ts`. The nav
  dropdown links were already correct — only these two other spots were
  stale.

### Changed

- **Team directory filter hidden** on `/teams` (`display:none` via
  `.team-finder-inline` in `global.css`) — temporary, per request. The
  directory's search/results JS is untouched; only the filter UI is hidden.
- **Boundaries hidden site-wide**, not back on the table until spring. Every
  link removed — the Resources nav dropdown and footer, the `/resources`
  card grid, and the Eligibility & Boundaries committee's "Placement review"
  link. `/boundaries` itself now redirects to `/teams`
  (`redirects` in `astro.config.mjs`) rather than 404ing for anyone with an
  old link or bookmark. The page's source is preserved, unrouted, at
  `src/pages/_disabled/boundaries.astro` — Astro excludes any
  underscore-prefixed folder under `src/pages/` from routing, so nothing was
  deleted. Restore instructions are commented at the top of that file.
- **`teams.ts` slug is now auto-derived, not hand-entered.** Every team's
  `slug` used to be typed manually and wasn't read anywhere in the code — a
  free-floating field that could silently drift from `name` with no way to
  notice. `teams.ts` now exports a computed `teams` array: the raw entries
  (`teamsRaw`) no longer carry a `slug` field at all, and a `slugify(name)`
  helper (lowercase, non-alphanumeric collapsed to hyphens) derives it at
  module load — e.g. `'Sol Sisters'` → `'sol-sisters'`. Verified it produces
  the exact same value for all 9 existing teams as the hand-typed slugs it
  replaced. New team entries must not include a `slug` line.
- **`notes`, `area`, `district`, `zipcode` made optional** on team entries
  (`TeamCard.astro`, `TeamFinder.astro` prop types). The filter's zip search
  (`TeamFinder.astro`'s client script) now guards against a missing
  `zipcode` array instead of throwing; the card skips the "· district"
  segment cleanly when `district` isn't set instead of leaving a trailing
  separator; and both the card and the finder's results panel only render a
  notes paragraph when `notes` is actually present, instead of printing a
  blank `<p>` or the literal word "undefined".
- **Accordion open-state hover** (`.faq-item[open] summary:hover`) no longer
  applies the `--surface-soft` tint — it read as a brownish highlight
  sitting over an already-expanded item and looked like a stray hover state.
  Closed items keep the hover background as an affordance.

### Noted, not changed

- **Age chart division mismatch.** The downloadable chart
  (`azgyl-age-chart-2026.pdf`/`.jpg`) covers 6U–18U by birth year; the
  on-page table (`AgeChart.astro`) only covers 8U–14U by grade, matching the
  site's stated "Grades K–8 only" policy. Confirmed the graphic is correct —
  the league now goes further than K–8 — but the real grade/age mapping for
  the added divisions and the replacement bylaw wording are still needed
  before either gets edited. See `TODO.md`.

---

## [3.9] — 2026-08-14 — Gallery video fixes

### Fixed

- **Gallery videos silently failed to play.** All 3 clips were encoded as
  10-bit H.264 (High 10 Profile) — the source iPhone footage was HDR, and the
  re-encode carried that 10-bit color depth through since `-pix_fmt` was
  never forced. Browsers cannot decode 10-bit H.264 at all; the video would
  hang indefinitely in a loading state with no error. Re-encoded the
  remaining clip to standard 8-bit (`-pix_fmt yuv420p`).
- **Lightbox selection highlight.** Rapid clicks on the prev/next arrows were
  triggering the browser's native text/image selection drag on the
  surrounding content — added `user-select: none` on the lightbox and
  `preventDefault()` on nav-button `mousedown`.
- **Video tiles were hard to spot in the grid.** The play indicator was a
  full-tile 28%-opacity dark wash with a small centered icon, which dimmed
  the poster photo and didn't read clearly as "this is a video" at a glance.
  Replaced with a small dark rose-gold-rimmed corner badge — the poster photo
  now stays fully visible.

### Removed

- **`IMG_2265.mp4` and `IMG_2266.mp4`** — these were near-instant (0.7–1.5s)
  clips, closer to Live Photos than real video content, and should have been
  treated as stills rather than kept as video files. Removed both, along
  with their now-orphaned poster thumbnails. Gallery is down to 53 items (52
  photos, 1 video — the one clip worth keeping as motion, `IMG_9766.mp4`).

---

## [3.8] — 2026-08-14 — Real photos, photo gallery, board contacts

### Added

- **Photo gallery** (`/gallery`) — a new masonry-layout page built from the
  2026 photo drop. `GalleryGrid.astro` reads every file in
  `src/assets/gallery/` at build time and lays it out in filename order, so
  adding or reordering photos is a file operation, not a code change. Each
  photo keeps its native aspect ratio (CSS columns, no cropping) and opens in
  a dependency-free lightbox (keyboard nav, focus trap, prev/next) built on
  `<dialog>`. Includes 3 short video clips alongside the photos. Linked from
  the main nav, the footer, and a new homepage teaser section
  (`HomeGalleryTeaser.astro`).
- **Board of directors** now has real names and a restructured card (name →
  position → `Email {name} →` CTA) in `LeadershipGrid.astro`. All four roles
  route to the shared league inbox (`azgirlsyouthlax@gmail.com`) with a
  role-keyed `mailto:` subject line, so nothing needs updating when a board
  member changes besides the `name` field in `src/data/board.ts`.

### Changed

- **All 10 hero photos replaced** with real AZGYL game photos, one distinct
  photo per page instead of 3 files shared across up to 3 pages each (e.g.
  `play-hero.jpg` used to back `/play`, `/league`, and `/rules` — each now
  has its own). Brightness-normalized across all 10 so the overlay reads
  consistently regardless of the source photo's natural exposure.
- **Hero overlay lightened** (`--hero-scrim` 0.62 → 0.45, mobile 0.66 → 0.49)
  and **`object-position: center 15%`** added to hero images site-wide — the
  rendered hero box is proportionally wider than the source crop, so
  `object-fit: cover` was cropping further into subjects' heads than the
  saved files showed; biasing toward the top fixes it everywhere at once.
  See TODO.md's standing constraint for the full explanation.
- **Interior hero pills and dark-glass buttons** (`.hero-nav-pill`,
  `.button-dark`, `.eyebrow`/`.section-kicker` on dark backgrounds) restyled
  from a translucent-white chip to a dark warm-glass fill with a rose-gold
  rim — the old treatment depended on the (now-lighter) overlay for contrast
  and had faded out.
- **`.page-hero`/`.hero-home` given `z-index: 0`** — without it, the hero's
  own content could out-stack the sticky header's dropdown menus despite the
  header's much higher `z-index`, because the hero section never established
  its own stacking context for its children's `z-index` to be contained in.
- **Bylaw card accent bars** (`BylawsList.astro`) switched from `--olive`
  (read as near-black at 4px wide) to `--rose-deep`, matching the card's
  other accents.
- **Homepage section backgrounds** rebalanced to strictly alternate
  plain/`section-alt` after inserting the gallery teaser — required also
  flipping the backgrounds hardcoded inside `HomeSchedulePreview.astro` and
  `HomeFaqPreview.astro` (both homepage-only) to keep the whole chain
  consistent.
- **`/parents` section backgrounds** — `#age-chart-section` and `#faq` were
  both `section-alt` back to back; rebalanced the whole page to alternate
  cleanly.

### Note

Section-alternation was only audited for the homepage and `/parents` this
pass — other pages haven't been checked. See TODO.md.

---

## [3.7] — 2026-08-09 — Team roster trimmed, officials form, league inbox

### Changed

- **Three clubs removed from the directory** — Marana Reapers, Cave Creek and
  Vail. Commented out in `src/data/teams.ts` rather than deleted, so they can be
  restored by removing the comment markers. The directory, team finder and
  boundaries pages all read from this list and update automatically.
- **"Become an official"** now opens the officials interest form instead of
  looping back to `/contact`, which was a dead end. The panel already existed in
  `ContactAside.astro` under "Common topics". Opens in a new tab, with an
  `sr-only` note saying so.
- **Contact form fallback recipient** changed from `info@azgyl.com` to
  `azgirlsyouthlax@gmail.com`. The old address had no mailbox behind it, so any
  enquiry that fell through to the default was being lost.

### Deliberately not changed

- **`EMAIL_FROM`** is still `noreply@azgyl.com`. Resend only sends *from* a
  verified domain — pointing it at a Gmail address would break sending outright.
  The from-address and the to-address are separate problems.
- **Board role addresses** (`president@`, `vicepresident@`, `treasurer@`,
  `secretary@` on `azgyl.com`) are unchanged, pending real mailboxes.
- **Historical Marana Reapers results** remain in `schedule.ts` (4 games) and
  `standings.ts` (one 12U row). These are completed results from a finished
  season; removing them would rewrite the record and leave the 12U standings not
  adding up. The club is absent from the directory but still present in past
  results. See TODO.md.

### Note

The recipient change only takes effect when `EMAIL_TO` is unset in the
Cloudflare Pages environment. If `EMAIL_TO` is already configured there, it
takes precedence and the code change has no effect — verify in the dashboard.

---

## [3.6] — 2026-08-09 — Accessibility: WCAG 2.1 AA colour pass

Brought every colour pair on the site to WCAG 2.1 AA. Verified against
**1.4.3 Contrast (Minimum)** for text and **1.4.11 Non-text Contrast** for
control boundaries and focus indicators. Hero ratios were measured by
compositing the overlay over the actual photograph pixels and taking the
98th-percentile brightest background under each block of text, so the numbers
reflect near-worst-case rather than average.

### Changed — visible

- **Primary buttons** now use `--rose-deep` instead of `--rose`.
  White on `#d7657b` measured **3.48:1** against a 4.5 requirement; it is now
  **5.23:1**. Affects every "Find My Team" CTA and the active team-finder chip.
- **Hero accent** ("all of Arizona.") lightened to `#efaebb`, from **1.38:1** to
  **3.39:1**. This was the worst failure on the site. Darkening the overlay
  alone could not fix it — even at 90% black the original rose only reached
  5.05:1, by which point the photograph was gone.
- **Hero overlay** deepened from `rgba(0,0,0,.55)` to `.62` (`.66` under 760px),
  which was required to carry the hero lead paragraphs on every photo.

### Changed — no visible difference

- `--soft` `#9a8f84` → `#736b63`. Fixes meta text, table headers, placeholders,
  schedule labels and footer fine print in one token (was 2.75–3.16:1).
- `--rose-deep` `#b84d63` → `#b14a5f`. Fixes nav active state, footer link
  hovers, ghost buttons, checklist ticks and eyebrow chips (was 4.26–4.45:1).
- `.lead` opacity `.84` → `.92`, clearing `play-hero.jpg` (was 4.42:1).

### Fixed

- **Link hovers reduced readability.** Schedule, standings and home-preview
  links dropped *to* `--rose` on hover — hovering took them from compliant to
  3.48:1. They now go to `--rose-deeper` (6.38:1).
- **Rank badge** in standings used a `rose → olive` gradient; the light end
  failed white labels at 3.48:1.
- **Form input borders** were `rgba(28,26,23,.10)` — **1.23:1** against white,
  against a 3:1 requirement for control boundaries. Added `--line-strong`
  (`.50`, 3.35:1) for inputs, tabs, chips and outline buttons. Decorative card
  and table edges keep the lighter `--line`.
- **Focus rings** went from a `.12` halo in `--rose` to `.30` in `--rose-deep`.

### Palette rule

`--rose` (`#d7657b`) is now fills-only — buttons' glow, dots, pips, borders.
It is never used for text or button labels. `--rose-deep` is the text-safe
tone, `--rose-deeper` the hover. This is documented in `:root` so it survives
future edits.

### Not covered

Only the two colour criteria were assessed. Alt-text quality, heading order,
keyboard operability (nav dropdowns, mobile menu, schedule filters), form
labelling and error announcement, focus order, touch targets and 400% reflow
are **not** audited.

Contrast figures are tied to the six hero photographs currently in
`public/assets/heroes/`. Replacing a hero image invalidates them — a brighter
photo can push the white headline back under AA. `--hero-scrim` is the
compensating control.

---

## [3.5] — 2026-08-09 — Cream header and footer, larger logo, flat hero overlay

Moved the site frame from charcoal to the cream sampled out of the logo
artwork, and enlarged the mark.

### Changed

- **Header and footer** are now `#fbeed0`, taken directly from the logo file, so
  the mark sits on the same field it was drawn on. Nav ink is olive with rose
  active states.
- **Logo 88px → 144px**, switched to the transparent asset. On the old charcoal
  header the logo needed its baked-in cream background and rounded corners to
  read as deliberate, which capped how large it could go. A cream header removes
  that constraint. Header bar 108px → 164px.
- **Header shrinks on scroll** to 104px/84px past 40px of scroll, so the larger
  mark costs no viewport height. Added `[data-scrolled]` and a scroll listener
  in `BaseLayout.astro`.
- **Footer logo** dropped its `#fbeed0` tile, now redundant against a cream
  footer.
- **Hero overlays** replaced a three-stop `110deg` gradient with a single flat
  wash, exposed as `--hero-scrim`. Interior heroes previously used `.45` and now
  share the same value as the home hero.
- `theme-color` meta updated to `#fbeed0`.

---

## 3.4 and earlier

Not recorded here. See `git log` — notable prior work includes the rebrand pass
with real hero photography and the rose/olive palette (`b170f3a`).
