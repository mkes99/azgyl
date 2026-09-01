# Changelog

All notable changes to the AZGYL site are recorded here, newest first.
Versions continue the `version 3.x` sequence used in the commit history up to 3.4.

Open work is tracked in [TODO.md](TODO.md).

---

## [3.21] — 2026-09-01 — Venue/field data model split; field-map lightbox; filter and resize fixes

### Changed

- **`field` is no longer a compound venue-prefixed id (`mesquite-f2`) — it's
  now plain per-game text (`'Field 2'`), and `venue` is a separate, new
  property on `Game` (`src/data/schedule.ts`) that references a venue
  directly.** Previously the only way the site knew which venue a game
  was at was by looking up a field id like `mesquite-f2` in `fields.ts`,
  which doubled as both "which venue" and "which specific field," forcing
  every venue's fields into their own uniquely-prefixed ids. That's
  backwards from how the data actually works: a venue only needs to be
  identified once per game (same as `season_id` only needs to be defined
  once per season, in the `Seasons` tab, and simply referenced by every
  row in `Schedule`) — the specific field within that venue is just a
  plain, unvalidated label ("Field 1", "Chuparosa Field," whatever that
  venue's signage actually says), same as it already was free-form.
  `src/data/fields.ts` is replaced by `src/data/venues.ts` (one entry per
  physical location: name, address, map link, notes, field map — no more
  one entry per field with the venue info repeated on each). All 47 games
  in `schedule.ts` migrated. `LeagueSchedule.astro` and
  `HomeSchedulePreview.astro` updated to group by `g.venue` directly
  (no lookup needed to know which games share a venue) and display
  `g.field` as-is (no lookup needed for the per-row label either).
- Removed `src/components/ScheduleTable.astro` — confirmed unused
  anywhere in the site (not imported by any page), already referencing a
  `.name` property removed back in 3.15, and would have broken on this
  migration regardless.

### Fixed

- **A venue group with every game filtered out by the Division filter
  still showed its full heading (venue name, address, Field map, Notes)
  above an empty table** — the filter only ever toggled `display:none` on
  individual `[data-division]` rows, never on the `.sched-venue-group`
  wrapping them. Now `applyFilters()` also hides any venue group with zero
  matching rows for the active division.
- **The notes popover's overflow correction only ran on open/close, not on
  a live window resize** — a box left open while the window was dragged
  narrower kept whatever horizontal shift (or lack of one) was correct for
  the old width, so it could still run off the right edge. Added a
  debounced `resize` listener that recomputes the shift for any
  currently-open popover.
- **The field-map lightbox rendered open on every single page load,
  covering the whole site** — its CSS set `display:flex` unconditionally
  on `.fieldmap-lightbox`, which as an author rule overrides the browser's
  default `[hidden] { display:none }`, so the `hidden` attribute the
  script relies on to show/hide it was silently doing nothing. Scoped the
  layout rule to `:not([hidden])`.

### Added

- **"Field map" opens in an in-page lightbox** instead of a new tab —
  dimmed backdrop, centered image, closes on the × button, backdrop
  click, or Escape.
- **"Field map" restyled as a filled rose pill with a small map icon**,
  distinct from the outlined "Notes" toggle next to it — the two read as
  different kinds of controls now (one opens an image, the other reveals
  text inline) instead of two visually-identical buttons.

---

## [3.20] — 2026-09-01 — Notes popover no longer overflows the viewport on narrow screens

### Fixed

- **The notes popover could run off the right edge of the screen on
  mobile**, pushing the whole page into horizontal scroll — the box was
  anchored to the "Notes" button's left edge, but a button positioned
  anywhere past the box's own width from the right edge (common on narrow
  viewports, since the button's horizontal position varies with venue
  name length) meant the box just kept extending off-screen. Fixed with a
  `toggle` listener that measures the box on open and, if it would
  overflow, shifts it left by exactly the overflow amount via
  `transform: translateX()` — this is provably safe (the shifted box's
  left edge always lands at `viewport width − box width`, which can't go
  negative since the box's `max-width` is already capped below the
  viewport width) and needed no change to the desktop behavior, where the
  box already fits. The caret shifts the same amount in the opposite
  direction so it still points at the button.

### Added

- **Mesquite High School field map** — first field-map image added,
  wired up to all three Mesquite fields via `fieldMapUrl` in
  `src/data/fields.ts`. Image lives at
  `public/assets/field-maps/mesquite.png`.

### Changed

- **Chuparosa Park's address corrected** to `2400 S Dobson Rd, Chandler,
  AZ 85286` (was previously listed under an Oro Valley address, which was
  wrong).

---

## [3.19] — 2026-08-31 — Notes popover no longer relocates the button; venue address added

Ported from the `google-sheets-schedule` branch (there: 3.17).

### Fixed

- **The "Notes" button visibly moved to a new line when clicked.** The
  previous disclosure used `flex-basis: 100%` on the `<details>` element
  itself to push the revealed text onto a full-width line — but that meant
  the whole element, summary/button included, jumped position when opened
  (from sitting inline next to the venue name, to alone on its own row
  below it). Redesigned as a floating popover instead: `position: relative`
  on the `<details>`, `position: absolute` on the revealed `<p>`, small
  caret pointing back at the button. The button's position is now
  completely independent of open/closed state — only a small card with a
  shadow appears near it. Added a chevron that flips on open for a clearer
  affordance. Verified live: clicked "Notes" repeatedly, button never
  moved, popover appeared/disappeared cleanly without shifting anything
  else on the page.

### Added

- **Venue address shown as plain text under the venue name/link** — `Field`
  already had `address`, it just wasn't displayed anywhere on `/league`.
  New `fieldAddress()` helper, rendered once per venue group alongside the
  existing venue link/notes/field-map row.

---

## [3.18] — 2026-08-31 — Group games by venue; venue notes redesigned as a click-to-open disclosure

Ported from the `google-sheets-schedule` branch (there: 3.16).

### Changed

- **Mixed-venue days now render as one section per venue, not a flat list
  with a "Multiple locations" caveat.** 3.17's fallback (single flat list,
  per-row "Venue — Field" links, "Multiple locations today — see each game
  below") technically worked but still repeated the venue name on every
  row for a mixed day. Restructured so a day's games are grouped by venue
  first — almost always one group, occasionally more — and *every* group
  gets its own venue heading (map link + notes) shown exactly once,
  however many games are in it. A day with 8U at Naranja Park and
  10U/12U/14U at Mesquite now renders as two clearly separated sections,
  each internally identical to the simple single-venue case. This
  eliminated the `singleVenueField`/"Location" vs. "Field" header
  special-casing entirely — every row's field cell is now always just the
  plain short label, full stop.
- **Venue notes redesigned from a hover-tooltip ⚠️ icon to a click-to-open
  "Notes" disclosure** (`<details>`/`<summary>`, the same accordion
  pattern already used for the site's FAQ sections). Three real problems
  with the icon: it was the same visual weight (a bright warning triangle)
  regardless of whether the note was actually a safety warning or routine
  logistics info; the native `title` tooltip has a slow hover delay and
  doesn't work on touch at all; and a note only ever showed if someone had
  manually prefixed it with "⚠️" in the data, so purely informational notes
  (e.g. "Field 4 for 10U–14U, Chuparosa Park used for 8U") were invisible
  everywhere on the site, always, with no way to see them. Now: the
  "Notes" button shows for **any** venue note, click reveals the full text
  inline (no delay, works on touch), and `fields.ts` notes are plain text —
  no emoji convention to remember or get wrong.
- **`fields.ts` notes stripped of the `⚠️` prefix** — kept as plain
  descriptive text ("No dogs allowed. Main competition field.") now that
  visibility isn't gated on the emoji being present.

---

## [3.17] — 2026-08-31 — Venue moved to the day heading, short field labels, field-map slot

Ported from the `google-sheets-schedule` branch (there: 3.15).

### Data

- **Week 2's 8U games moved to `naranja-park`**, while the rest of that
  day stays at Mesquite HS — a real, deliberate mixed-venue date in the
  live schedule data (not a mock), demonstrating the "Multiple locations
  today" fallback above with actual production data (superseded by 3.18's
  venue grouping, below): 8U showed "Naranja Park — Field 4" with no
  warning icon, while 10U/12U/14U that same day showed "Mesquite HS —
  Field 2/3" with the ⚠️.

### Changed

- **Venue name, map link, and ⚠️ warning moved from every game row to one
  place per day.** Previously each game repeated the full venue name as
  its own "Get directions" link (e.g. "Mesquite HS — Field 1" eight times
  on a day with 8 games, each an identical map link to the same address).
  When every game on a date resolves to the same venue, the day heading
  now shows that venue once as the map link
  (`.sched-day-venue`/`.hsp-venue`), with the ⚠️ warning next to it, and
  each game row shows just its short field label as plain text (`Field 1`,
  not linked, not repeated).
- **Divisions at different venues the same day is a real, supported case —
  not an error.** Considered adding a build-time validation rule requiring
  one venue per date, but different divisions genuinely can be hosted at
  different parks the same Saturday. Instead the day heading detects
  whether every game that date actually shares one venue: if so, the
  single combined link described above; if not, the heading says
  "Multiple locations today — see each game below" and each row falls
  back to its own full venue + field link and warning icon, so nothing is
  ever silently wrong for a division at a different location. Verified
  both paths live: a single-venue day and a deliberately mixed-venue day
  (8U at Mesquite, 12U at Naranja Park) on the same date.
- **`fields.ts`: `label` is now genuinely short** ("Field 1", not
  "Mesquite HS — Field 1") **and free-form** — there's no fixed
  numbering/lettering scheme enforced, since different venues label their
  fields differently in real life. Whoever edits the data sets it to
  whatever matches that venue's actual signage. Removed the redundant
  `name` property (identical to `label` on every entry) and the
  `fieldDisplayName()` helper, which was unused anywhere and, had it been
  used, wouldn't have actually returned a short name despite its own
  comment claiming otherwise — another instance of styled/written-but-
  never-wired-up code, same shape as 3.16's `.game-note` finding.
- **Added an optional `fieldMapUrl` slot** on `Field` (a diagram/image of
  where each field sits within a venue) — renders a "Field map" link next
  to the venue heading when set, nothing when it isn't. No real images
  exist yet; this just makes room for them. Shared across all field
  entries at one venue, same as `venue`/`address`/`mapUrl` already are.
- Applied the same simplification to `HomeSchedulePreview.astro` (the
  homepage's next-game-day preview), which had the identical per-game
  link duplication.

---

## [3.16] — 2026-08-31 — Fix desktop schedule table never showing game notes

### Fixed

- **Per-game `notes` never rendered on the desktop schedule table**, only
  on mobile cards. The styling (`.game-note`) already existed in
  `LeagueSchedule.astro` — it was written but never wired into the desktop
  row markup, so a game's notes column was silently invisible to anyone
  not on mobile. Added `{g.notes && <span class="game-note">{g.notes}</span>}`
  inside `.sl-matchup`, with `flex-basis: 100%` so it drops to its own
  line under the matchup within the existing wrapping flex row — no new
  grid column needed. Distinct from, and independent of, the ⚠️
  field-warning icon (a `fields.ts` venue note, not a per-game one).
  Currently latent on `develop` — the local schedule data has no games
  with `notes` set yet — but the same defect was live on the
  `google-sheets-schedule` branch, which is what surfaced it. Found a
  second confirmed instance of 3.12's stale-duplicate-CSS pattern while
  investigating (`global.css`'s "10. Schedule & Standings" section still
  duplicates several of this component's scoped rules) — logged in
  `TODO.md` rather than cleaned up now, since it isn't causing a second
  bug yet.

---

## [3.15] — 2026-08-31 — Fix mobile header actions sitting 32px off the right edge

### Fixed

- **The mobile header's CTA + hamburger sat noticeably left of the true
  right edge** (32px short — one full grid gap). Cause: `.header-inner`
  uses `grid-template-columns: auto 1fr auto` (brand, nav, actions) sized
  for 3 grid items, but `.desktop-nav` is `display:none` below 960px,
  which removes it from the grid entirely — down to 2 real items. With no
  explicit position set, CSS Grid auto-placement then puts
  `.header-actions` into the *middle* (nav's) track instead of the
  intended 3rd one, leaving the real 3rd track — and the gap before it —
  empty but still reserved, shifting everything left by one gap-width.
  Fixed with an explicit `grid-column: 3` on `.header-actions`, which also
  matches what auto-placement already does on desktop (all 3 items
  present), so there's no desktop behavior change. Verified via
  `getBoundingClientRect()` before/after at a real 500px viewport: gap
  from the container's right edge went from 32px to 0px.

---

## [3.14] — 2026-08-31 — Fix mobile menu "Find My Team" button styling

### Fixed

- **The mobile menu's "Find My Team" button had dark olive text with no
  horizontal padding**, instead of the white, comfortably-padded pill
  every other primary button on the site uses. Cause: CSS specificity, not
  a missing style — `.mobile-menu a` (specificity 0,1,1, since it combines
  a class with the `a` element) was beating `.button-primary` (0,1,0) on
  `color`, `padding`, and `display` for this one link, since it's both a
  plain mobile-nav `<a>` and a `.button.button-primary`. Fixed by scoping
  the generic mobile-nav-link rules to `.mobile-menu a:not(.button)`
  (base and `:hover`) so they no longer touch anything that's also a
  button. Verified live in a real ~500px viewport, menu open.

---

## [3.13] — 2026-08-31 — Footer merged back to a single 4-column row

### Changed

- **Footer brand block merged back into the same row as the Parents/
  Resources/Official nav columns**, per request — one `.footer-grid`
  instead of 3.12's two independently-sized rows.
  `grid-template-columns: minmax(440px, 1.6fr) .5fr .5fr .5fr` — the
  minmax floor keeps the brand column wide enough that the logo sits
  beside the copy (not stacked above it), and the `.5fr` nav columns stay
  proportionally narrow next to it. Note: this reintroduces some of the
  height mismatch 3.12 fixed — the brand block is still taller than the
  short nav lists — just less pronounced now that the columns sit closer
  together.
- **≤960px breakpoint**: brand block spans the full row
  (`grid-column: 1 / -1`, still logo-beside-copy since it now has the
  whole row's width to work with) and the three nav columns drop to their
  own row below as `repeat(3, 1fr)`, rather than the previous 2-column
  collapse.
- **≤580px breakpoint**: logo and copy now explicitly stack
  (`.footer-brand-block { flex-direction: column }`), instead of relying
  on `flex-wrap`'s own width math to decide when to wrap — deterministic
  on narrow phones rather than contingent on exact content widths.
  Verified both breakpoints against the real rendered viewport (not just
  simulated) once the browser automation's window-resize started taking
  effect on a fresh tab in this environment — 579px showed logo above
  copy as expected.

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
