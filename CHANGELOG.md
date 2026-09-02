# Changelog

All notable changes to the AZGYL site are recorded here, newest first.
Versions continue the `version 3.x` sequence used in the commit history up to 3.4.

Open work is tracked in [TODO.md](TODO.md).

---

## [3.46] — 2026-09-01 — Season switcher on /league; date-format gotcha documented

### Changed

- **`/league`'s Schedule and Standings both switch to a per-season
  selector instead of stacking every active season's content one after
  another.** With two active seasons (Spring 2026 + Fall 2026 test
  data), Schedule was rendering two complete, *unlabeled* Division/
  Week/Team filter bars back to back — no heading distinguished them.
  Standings had the opposite problem: each season already had its own
  label, but stacking full sections (heading, intro copy, legend, and
  tables, repeated per season) produced a large dead gap and duplicated
  copy. Both are now: one shared heading/intro/legend, a season
  switcher when there's a real choice to make (no switcher, just a
  plain label, when only one season is active), and exactly one
  season's content visible at a time.
- **Season is a switcher, not a filter** — deliberately never gets an
  "All" option, unlike Division/Week/Team. Division/Week/Team subtract
  from one shared list of games; a season *is* the list, so "All"
  would mean showing multiple unrelated datasets in the same space at
  once — the exact stacking problem this replaces. Default selection
  uses the same "soonest upcoming game wins" rule as
  `HomeSchedulePreview.astro`, computed independently in Schedule and
  Standings (Standings only offers seasons that actually have data,
  which can differ from Schedule's own selection).
- `StandingsTable.astro` no longer renders its own W/L/T/Pts/GF/GA
  legend — moved up to `LeagueStandings.astro` so it renders once per
  page, not once per season.
- Fixed a stray `.sched-day` divider line — a leftover from an earlier
  fix that let all weeks show at once under Week: All. It sat in the
  middle of a large empty gap between weeks, not attached to either
  panel; removed in favor of whitespace only, since each week already
  has its own heading rule.

### Documented

- **Real incident, 2026-09-01**: pasting a new block of dated rows into
  the live sheet made Google Sheets silently re-apply its own default
  date format to the whole column, overriding the `m/dd/yyyy` format
  already set — even though the cells still looked correct in the
  Sheets UI. The published CSV then emitted ISO `YYYY-MM-DD`, which
  failed validation for every row in the column, old ones included (52
  errors). The pipeline caught it correctly (error email, deploy
  skipped, nothing bad went live) — the only real gap was that this
  wasn't a known, documented risk. Added a "Formatting the date
  columns" section to `GOOGLE_SHEETS_SETUP.md` and a plain-language
  version to `SHEET_ENTRY_GUIDE.md`: use **Format → Number → Custom
  date and time** → `m/dd/yyyy` specifically (not the plain **Date**
  preset, which follows Sheets' locale default instead), and reapply it
  after pasting in a new season's worth of rows.
- Fixed a dead link: `SHEET_ENTRY_GUIDE.md`'s "Getting names right"
  pointed at `https://azgyl.com/valid-values.json`, a domain that isn't
  live yet — switched to a relative `/valid-values.json` link, which
  resolves correctly on whichever deployment is actually showing the
  page. Same fix applied to the equivalent reference in
  `GOOGLE_SHEETS_SETUP.md`.

---

## [3.45] — 2026-09-01 — Date validation back to MM/DD/YYYY only; single deploy hook, not an array

### Changed

- **`DATE_RE` (in `schedule.ts`, `standings.ts`'s error messages stay
  shared, and the Apps Script's copy in `GOOGLE_SHEETS_SETUP.md`) is
  back to `MM/DD/YYYY`-only**, reverting the dual-format tolerance added
  in 3.43. That tolerance was a stopgap for when one shared sheet fed
  both `develop`'s and `main`'s deploy hooks (3.42's incident); 3.44's
  two-sheet-per-environment split already removed that coordination
  problem, so the extra format made the validation looser than it needs
  to be going forward. Verified against the live "Develop AZGYL Season
  Data" sheet (already fully MM/DD/YYYY) — clean build, no data changes
  needed.
- **`standings.ts` now uses `pickCsvUrl()`**, same `DEPLOY_ENV`
  selection as `schedule.ts` — it had been overlooked when `pickCsvUrl`
  was introduced in 3.44 and was still hardcoded permanently to the
  Develop sheet, which would have silently served develop's standings
  data on `main` in production.
- **`DEPLOY_HOOK_URLS` (an array) simplified to `DEPLOY_HOOK_URL` (a
  single string)** in the Apps Script — it was an array from an earlier
  design where one sheet could feed multiple branches at once; since
  the two-sheet split means a sheet only ever talks to exactly one
  branch, the array was dead flexibility. Matches `VALID_VALUES_URL`,
  which was already a single value.
- `GOOGLE_SHEETS_SETUP.md` Step 1 now says to name the sheet "Develop
  AZGYL Season Data" (vs. plain "AZGYL Season Data" for the eventual
  production sheet) instead of one generic name for both.

---

## [3.44] — 2026-09-01 — Documented: separate develop/main sheets, not one shared sheet

### Changed

- **`GOOGLE_SHEETS_SETUP.md` updated for a real architecture change**:
  a single sheet feeding both `develop` and `main`'s deploy hooks
  removed the isolation `develop` existing separately from `main` is
  supposed to provide — any sheet edit had to satisfy both branches'
  code simultaneously, which is exactly what broke on 2026-09-01 (see
  3.42/3.43). Going forward: two separate spreadsheets, one per
  environment — "Develop AZGYL Season Data" feeds `develop` only; a
  separate production sheet feeds `main` only. Corrected a now-false
  claim in the doc's own intro ("managed from one Google Sheet... not
  from separate spreadsheets") and added an explicit explanation up
  top plus updated Step 7/8's config example to a single deploy hook
  (`DEPLOY_HOOK_URLS` down to one entry) and `VALID_VALUES_URL` pointed
  at `develop.azgyl.pages.dev` specifically, not the bare
  `azgyl.pages.dev` production domain. The backward-compatible date
  validation from 3.43 stays regardless — cheap insurance, and it means
  a future schema change doesn't force coordinating a sheet-format
  update with whoever's editing it.

---

## [3.43] — 2026-09-01 — Date validation accepts both formats (multi-branch deploy hooks need it)

### Fixed

- **3.42's switch to requiring `MM/DD/YYYY` broke `main`'s build for
  real** — `develop` and `main` both have a live deploy hook (see
  `GOOGLE_SHEETS_SETUP.md`, Step 7/8), and there's only one sheet, so
  the moment the sheet was converted to the new format, `main`'s
  still-ISO-only code failed validation on every edit until it was
  manually merged to catch up. That defeats having two branches at all
  — the whole point of `develop` is testing changes in isolation before
  they can affect `main`, but a sheet-schema change can't be isolated
  when both branches validate the same live sheet simultaneously.
  `DATE_RE` (both `schedule.ts` and the Apps Script) now accepts EITHER
  `MM/DD/YYYY` or `YYYY-MM-DD` — doesn't matter which branch is ahead,
  since both formats validate against either branch's code. Tracked in
  `TODO.md` to simplify back to one format once every hooked branch is
  confirmed on the same code. Verified: a build with both an
  ISO-dated and an MM/DD/YYYY-dated season active simultaneously
  renders both correctly.

---

## [3.42] — 2026-09-01 — Sheet dates switched from YYYY-MM-DD to MM/DD/YYYY

### Changed

- **`Seasons`/`Schedule` date columns now expect `MM/DD/YYYY`** (single
  or double-digit month/day both fine — `9/19/2026` and `09/19/2026`
  both work), not ISO `YYYY-MM-DD` — more natural for a US audience
  typing dates by hand. `DATE_RE` updated in both `schedule.ts` and the
  Apps Script; a new `toISO()` converts right after validating, so
  every date-driven comparison elsewhere in the site (fillDown, "is this
  game in the past," week/day sorting) still operates on ISO strings
  internally and never sees the new format — those all depend on
  ISO-format strings sorting correctly as plain strings, which
  MM/DD/YYYY strings don't. All four docs' examples updated to match.
  **Breaking for the real sheet**: every existing date cell (Seasons
  `startDate`/`endDate`, every non-blank `Schedule` `date` cell) needs
  converting by hand before the next successful deploy — the old format
  now fails validation (intentionally, as a live test of the fail-loud
  pipeline: a bad sheet state should never publish, and this proves it
  doesn't).

---

## [3.41] — 2026-09-01 — Homepage picks the active season by date, not sheet row order

### Fixed

- **`HomeSchedulePreview.astro` used `scheduleEvents.find(e => e.active)`
  — whichever active season happened to be listed first in the sheet.**
  More than one season/tournament can be active at once, and new
  seasons get added as new rows at the *bottom* of the `Seasons` tab —
  same as any spreadsheet, nobody's inserting rows above older ones. So
  once a second season went active, the homepage would keep showing the
  older one forever unless someone remembered to reorder sheet rows (or
  deactivate the old season, losing its "active" status/visibility on
  `/league` for no real reason). Replaced with the same principle
  `/league`'s week filter already uses: let the date decide. The
  homepage now picks whichever active season has the soonest upcoming
  game, independent of row order; falls back to the first active event
  only if none of them have an upcoming game at all (the old behavior,
  for that edge case). Verified: real data (Spring 2026 complete) still
  shows correctly, and a mock with Spring 2026 (complete, listed first)
  plus Fall 2026 (upcoming, listed second) correctly shows Fall 2026.

---

## [3.40] — 2026-09-01 — Homepage widget: "Schedule coming soon" state added

### Added

- **`HomeSchedulePreview.astro` had no state at all for "no active
  season"** — it just rendered nothing (a bare `if (!event) return;`),
  unlike `/league`'s explicit "Schedule coming soon" panel for the same
  scenario. Added a matching `noActiveSeason` state with plain,
  visitor-facing copy (not `/league`'s current dev-facing "see
  GOOGLE_SHEETS_SETUP.md" text). All three states (`noActiveSeason`,
  `noGamesYet`, `seasonComplete`) are now mutually exclusive and
  verified against mocks for each scenario, plus the real season data
  unaffected.

### Fixed

- **Introducing `noActiveSeason` initially left `seasonComplete`
  computed wrong** — it excluded `noGamesYet` but not `noActiveSeason`,
  so with no active season at all `seasonComplete` would still evaluate
  `true` (both states rendering at once, and `event.name` throwing since
  `event` is undefined in that branch). Caught during testing, before
  committing.

---

## [3.39] — 2026-09-01 — Notes popover rebuilt on manual JS toggle, not native `<details>`

### Fixed

- **3.38's `[open]`-driven CSS fix wasn't enough — confirmed live on a
  real iPhone that the popover still wouldn't close.** The CSS was
  correctly deployed (verified in the live bundle), so the actual
  problem wasn't the display rule at all — it's that `<summary>` tap-to-
  toggle itself is unreliable in this context on iOS Safari, not just
  the rendering of its content. Converted `.sched-venue-notes` from a
  native `<details>`/`<summary>` disclosure to a plain
  `<div>`/`<button>` with the `<p>` shown/hidden via the `hidden`
  attribute, toggled entirely in JS on click — the same pattern already
  used successfully for the field-map lightbox elsewhere in this file.
  No native disclosure behavior involved at all now, so there's nothing
  for a browser-specific `<details>` quirk to break. Also: opening one
  venue's Notes now closes any other one already open, so a day with
  several venue groups can't show two overlapping popovers. Verified
  through a full open→close cycle via real `.click()` calls (aria-
  expanded, `hidden`, and rendered height all correct at each step).

---

## [3.38] — 2026-09-01 — Fix mobile: Team filter matched nothing, Notes popover wouldn't close

### Fixed

- **Team filter matched zero games on mobile, regardless of which team
  was selected** — the mobile card layout (`.sched-card`) never got the
  `data-home`/`data-away` attributes the Team filter's `rowMatches()`
  reads; the desktop table row (`.sched-row`) had them, mobile's
  parallel markup was missed when the filter was added. Both now carry
  identical `data-division`/`data-home`/`data-away`.
- **Venue "Notes" popover's chevron flipped closed but the content
  stayed visually painted** — confirmed via testing that the native
  `<details>` closed-state hiding works correctly in Chrome (even for a
  fresh, unstyled `<details>`), so this is specifically a WebKit/Safari
  gap: a known class of bug where an absolutely-positioned child of a
  closed `<details>` can stay rendered even though the browser correctly
  considers it closed/not-visible. Fixed by no longer relying on native
  `<details>` hiding for this element at all — `.sched-venue-notes p`
  now gets explicit `display: none` / `.sched-venue-notes[open] p {
  display: block }`, driven off the `[open]` attribute directly. Works
  identically on every browser, sidesteps the WebKit-specific gap
  entirely. Verified via real clicks (not just programmatic `.open`
  toggling) through a full open→close cycle.

---

## [3.37] — 2026-09-01 — Fix homepage's vacuous-truth "Season Complete" gap

### Fixed

- **`HomeSchedulePreview.astro`'s `seasonComplete = !nextDate` was
  vacuously true for an active season with zero `Schedule` rows too**,
  not just a genuinely finished one — the same class of bug
  `LeagueSchedule.astro`'s `seasonOver` had before it was fixed. Added a
  separate `noGamesYet` check (`allDates.length === 0`) with its own "No
  games scheduled yet" state; `seasonComplete` now requires
  `!noGamesYet && !nextDate`. Verified against a mock active-season-
  zero-rows sheet before and after the fix.

---

## [3.36] — 2026-09-01 — Correction: VALID_VALUES_URL doesn't settle at merge-to-main

### Fixed

- **3.31's migration note for `VALID_VALUES_URL` was wrong** — it
  assumed `azgyl.com` becomes valid the moment `google-sheets-schedule`
  merges into `main`. It doesn't: the `azgyl.com` custom domain isn't
  attached in Cloudflare Pages until actual launch, a separate, later,
  deliberate step — merging to `main` and launching are not the same
  event, and there can be a real gap between them. Corrected to
  describe the actual pattern (track whichever Cloudflare Pages
  deployment is currently live by hand, checked fresh at every branch
  merge/deletion, with `azgyl.com` only becoming correct at launch
  itself) rather than a fixed three-stage timeline.

---

---

## [3.35] — 2026-09-01 — Admin always notified; VALID_VALUES_URL migration path documented

### Changed

- **`FALLBACK_EMAIL` → `ADMIN_EMAIL`, and it's no longer just a
  fallback** — previously the shared board inbox only got emailed when
  the editor's Google account couldn't be determined; now `ADMIN_EMAIL`
  gets every validation error, unconditionally, with the actual editor
  (if known) added as an additional recipient rather than the only one.
  Set to `mike@formativewebsolutions.com`. Updated the "How it fits
  together" diagram and the notification-behavior explainer to match.

- **`VALID_VALUES_URL` documented as a moving target** — unlike
  `DEPLOY_HOOK_URLS` (fans out to every active branch), this has to stay
  a single URL, since it's the one source of truth for valid team/
  division/venue names. Added an explicit migration note: branch preview
  now (`azgyl.com` isn't live yet) → `develop`'s preview once merged
  (and `google-sheets-schedule` deleted) → `azgyl.com` permanently once
  merged to `main`. Found via a real DNS error hitting the live script.

---

---

## [3.34] — 2026-09-01 — Apps Script supports multiple deploy hooks (one per branch)

### Changed

- **`DEPLOY_HOOK_URL` → `DEPLOY_HOOK_URLS`** in the Apps Script
  (`GOOGLE_SHEETS_SETUP.md`, Step 8) — a Cloudflare deploy hook only
  rebuilds the one branch it was created for, and this integration needs
  to follow the code across branches (currently just
  `google-sheets-schedule`, then `develop` and `main` once merged). Now
  an array; `validateAndDeploy()` fires every configured hook on a clean
  validation, one deploy per branch, `muteHttpExceptions` so one stale
  hook failing doesn't block the rest. Step 7 updated with a
  `<branch>-deploy` naming convention (`google-sheets-schedule-deploy`,
  `develop-deploy`, `main-deploy`) so the hook list stays readable as
  more branches pick this up.

---

---

## [3.33] — 2026-09-01 — Real sheet wired in; Team filter; field-map CDN switch; league page polish

### Added

- **Real Google Sheet CSV URLs wired into `schedule.ts`/`standings.ts`** —
  `SEASONS_CSV_URL`, `SCHEDULE_CSV_URL`, and `STANDINGS_CSV_URL` now
  point at the actual published sheet (Step 6 of
  `GOOGLE_SHEETS_SETUP.md`), not empty strings. Verified against both a
  fully-empty sheet and an active-season-with-zero-rows sheet — neither
  breaks the build or the site.
- **Auto-generated Team filter on `/league`**, built from that event's
  own `games` (not the full `teams.ts` roster) — not every team plays
  every season, so the filter only ever offers teams that actually
  showed up. Combines (AND) with the existing Division and Week filters.
- **"All" option added to the Week filter**, matching the existing
  Division filter's "All" pill.
- **Graceful fallback in the field-map lightbox** — a failed image load
  now shows "Couldn't load the field map image — Open it directly"
  instead of a permanently broken icon.
- **Visible legend above the standings tables** (W/L/T/Pts/GF/GA/+/−
  spelled out) — the existing `title` tooltip on desktop headers is
  effectively undiscoverable, and the mobile card view had no
  explanation at all.

### Fixed

- **Week filter: a past week that's also the default-active week never
  got the "past" styling class**, only "active" — deselecting it (e.g.
  by clicking a different week) left it bare/unstyled instead of falling
  back to the muted "past" look. `isPast` is now applied independent of
  `isCurrent`; CSS reordered so `--active` still wins the cascade when a
  button carries both classes.
- **No spacing between consecutive week panels** in the new "All" weeks
  view — only one panel was ever visible at a time before, so nothing
  separated them. Added margin/border between `.sched-day` panels.
- **Field-map links switched from `drive.google.com/uc?export=view` to
  `lh3.googleusercontent.com`** — the former is an informal, undocumented
  Drive workaround observed 503'ing under repeated requests in testing;
  the latter is Google's actual production image CDN (same
  infrastructure behind Google Photos/profile pictures). Same
  paste-a-Drive-link workflow on the sheet side, no doc changes needed.

### Changed

- **Dev-facing copy that had leaked into public-facing text, rewritten
  for the actual audience** — the `/league` hero no longer references
  `src/data/schedule.ts` or a hardcoded season name; the standings
  caption no longer says "Live from Google Sheets. Update the sheet and
  redeploy to refresh." (implies visitors need to take an action they
  can't take). Both now describe what the page shows, not how it's
  maintained.
- **Parents page now links to the USA Lacrosse resources it already
  references but didn't link to** — "USA Lacrosse membership" (Step 2)
  and the equipment/legal-sticks pages (Equipment section) now link out,
  pulled from the same `officialLinks` array already used in the
  footer rather than hardcoded a second time.
- Mohave's hardcoded venue note removed from `venues.ts` (demo request).

---

---

## [3.32] — 2026-09-01 — Clearer column names; Drive field-map links simplified; Standings cascades too

### Changed

- **Schedule tab's per-game `notes` column renamed to `gameNotes`** — now
  unambiguous alongside `venueNotes`, since the two were easy to confuse
  by name alone (one's about the location, the other's about a single
  game). Renamed end-to-end: `Game.gameNotes` in `schedule.ts`, both
  render spots in `LeagueSchedule.astro`, and every mention across
  `GOOGLE_SHEETS_SETUP.md`, `SHEET_ENTRY_GUIDE.md`, and
  `SHEET_SEED_DATA.md`. CSS class names (`game-note`, `scard-note`) and
  the unrelated `Venue.notes` field (venues.ts) are untouched.

- **Standings tab's `W`/`L`/`T`/`GF`/`GA` columns spelled out as
  `wins`/`losses`/`ties`/`goalsFor`/`goalsAgainst`** — the abbreviations
  weren't obvious to everyone filling in the sheet. Renamed end-to-end:
  `StandingRow` in `standings.ts` (interface, `localStandings`,
  sheet-parsing, `sortedRows()`), the display code in
  `StandingsTable.astro`, and every doc. The site's own compact `W`/`L`/
  `T`/`GF`/`GA` table headers are unchanged — those are just the display
  labels (with title-attribute tooltips), not the sheet's column names.

- **Adding a field-map picture no longer requires hand-building a
  URL.** Previously, someone had to copy Drive's share link, pull the
  file id out of it, and paste it into a `uc?export=view&id=...`
  template — a lot to ask for a spreadsheet task. Now the raw link
  Drive's "Copy link" button gives you goes straight into `fieldMapUrl`
  as-is; a new `normalizeFieldMapUrl()` helper (`src/lib/driveLink.ts`)
  rewrites whatever shape of Drive link shows up into the direct-image
  form at build time. Cuts the documented steps from 7 down to 3.
  `GOOGLE_SHEETS_SETUP.md`, `SHEET_ENTRY_GUIDE.md`, and `README.md`
  updated to match, and `README.md`'s `fieldMapUrl`-overrides-`venues.ts`
  behavior is now stated explicitly rather than implied.

### Added

- **Standings tab's `season_id` and `division` now cascade**, same
  fill-down convenience the Schedule tab already had — leave either
  blank on a row and it inherits from the row above, so a block of teams
  in one season/division only needs those two typed once.  `division` is
  scoped to the `season_id` block (mirrors `fieldMapUrl`/`venueNotes`'s
  scoping to venue/date on Schedule): a row with its own explicit
  `season_id` resets the cached division, so a new season's rows can't
  silently inherit the previous season's division. Implemented
  identically in `standings.ts`'s `fillDown()` and the Apps Script's new
  `fillDownStandings()` — both documented in `GOOGLE_SHEETS_SETUP.md`,
  `SHEET_ENTRY_GUIDE.md`, and `README.md`.

---

---

## [3.31] — 2026-09-01 — Document empty-tab behavior everywhere, including for the end user

### Added

- **A confirmed decision on the Schedule/Standings empty-tab asymmetry
  (3.26 fixed Schedule's case; Standings staying silent when empty was
  intentional, now explicitly documented rather than just left as
  observed behavior)** — an active season with no `Schedule` rows shows
  a real "No games scheduled yet" notice; a season with no `Standings`
  rows shows no standings section at all, no message. Different on
  purpose: a missing schedule is something to actively flag, a standings
  table with nothing to summarize yet just isn't a section that exists.
  Documented in three places, each pitched at its reader: a new
  unnumbered "What an empty tab looks like on the site" section in
  `GOOGLE_SHEETS_SETUP.md` (technical, a full state table covering "no
  active season at all" too); a new "It's fine to set up a season before
  it has games or standings" section in `SHEET_ENTRY_GUIDE.md` (plain
  language, reassures whoever's filling in the sheet that an
  in-progress season won't look like a broken page) — that one's also
  what's live at `/admin/setup`; and a short paragraph in `README.md`
  for a developer skimming, pointing at the full breakdown.
- Fixed a separate stale spot found while touching this: `README.md`'s
  "don't need to be retyped" paragraph still only listed `season_id`/
  `date`/`venue`/`division` as fill-down columns — missing `fieldMapUrl`
  and `venueNotes`, both added across 3.24/3.26.

---

---

## [3.30] — 2026-09-01 — venueNotes column; reordered Schedule tab; empty-tab edge case fixed; sheet renamed

### Added

- **`venueNotes` column on the `Schedule` tab** — same override pattern
  as `fieldMapUrl`: a venue-wide note (e.g. "No dogs allowed"), typed on
  the same row where `venue` is first given for a block, filling down
  with the rest of it, overriding whatever's hardcoded in `venues.ts`
  when present. Distinct from the existing per-game `notes` column
  (about one game — "Senior night"), which is unaffected. `Game` gained
  `venueNotes?: string`; `venueNote()` in `LeagueSchedule.astro` now
  takes the same override-then-fallback shape `venueMapImg()` already
  had for `fieldMapUrl`; `venueNotes` added to `fillDown()`'s columns
  and to `BLOCK_SCOPED_COLUMNS` (so it resets at a new venue/date block
  exactly like `fieldMapUrl`/`division` already do), mirrored in the
  Apps Script.

### Changed

- **`Schedule` tab column order** — the "cascading" fields (the ones
  that fill down a block: `season_id`, `date`, `venue`, `fieldMapUrl`,
  `venueNotes`, `division`) now come first, then the per-game specifics
  (`time`, `arrival`, `home`, `away`, `field`, `notes`). Purely cosmetic
  — every column is read by header name, not position, verified by
  building against a full round-trip of the reordered seed data with no
  code changes needed and no validation errors. Updated in
  `GOOGLE_SHEETS_SETUP.md`, `SHEET_ENTRY_GUIDE.md`, and all 40 rows of
  `SHEET_SEED_DATA.md` (which also gained real `venueNotes` values on
  each block's first row, matching `venues.ts`'s existing defaults, as a
  worked example of the column).
- **Sheet renamed** from "AZGYL Schedule" to **"AZGYL Season Data"** —
  the old name stopped fitting once `Standings` (3.25) and `Archive`
  joined `Seasons`/`Schedule` in the same spreadsheet.

### Fixed

- **An active season with zero rows in the `Schedule` tab showed a
  misleading "Season complete" banner** instead of a "not set up yet"
  state — `dates.every(d => d < todayISO)` is vacuously `true` on an
  empty array in JS, so a season with no games at all read as one where
  every game had already happened. `seasonOver` now also requires
  `dates.length > 0`. Added a dedicated "No games scheduled yet" notice
  for this case instead of leaving an empty filter bar with nothing
  beneath it. Found and verified while answering a question about what
  actually happens with a header-only `Schedule` tab — confirmed
  separately that a `Standings` row referencing a season that doesn't
  exist fails the build loudly (correct, already true), and that
  `Schedule` having data while `Standings` is empty degrades cleanly
  with no standings section rendered (also already correct) — only the
  reverse case (active season, zero schedule rows) had the bug.

---

---

## [3.29] — 2026-09-01 — Standings consolidated into the schedule sheet; real Sheet integration built

### Changed

- **Standings moved into the same Google Sheet as `Seasons`/`Schedule`**,
  as a `Standings` tab, instead of "a separate spreadsheet" as
  `STANDINGS_SETUP.md` previously framed it (that file is deleted — its
  content lives in `GOOGLE_SHEETS_SETUP.md`/`SHEET_ENTRY_GUIDE.md` now).
  One sheet, one login, one thing to remember, not two.
- **`Standings` rows now carry a `season_id`**, same linkage as
  `Schedule` — the previous format (`division | team | W | L | T | GF |
  GA`, no season column at all) could only ever represent *one* season's
  standings at a time; a new season would just silently overwrite the
  last one with no way to look back. Schema is now `season_id | division
  | team | W | L | T | GF | GA`.
- **Actually built the Sheet-fetch/validate pipeline for standings** —
  turns out this was never really implemented. `STANDINGS_CSV_URL`
  existed as a placeholder, but the only fetch code that existed at all
  was a hand-rolled, unvalidated comma-split sitting inside
  `StandingsTable.astro` (not `standings.ts`, where every other Sheet
  integration on this project lives) — no shared `parseCSV`, no
  validation of any kind, a silent try/catch that fell back to stale
  local data on any fetch error (the opposite of the fail-loud approach
  used everywhere else), and it always wrapped everything into one fake
  event using `localStandings[0]`'s id/name as a guess, regardless of
  what the sheet actually said. Rewrote `standings.ts` to mirror
  `schedule.ts`'s exact pattern: validate `season_id` against real
  `Seasons` rows, `team`/`division` against `teams.ts`, `W`/`L`/`T`/`GF`/
  `GA` as real non-negative numbers (blank = 0, anything else invalid is
  a hard error), fail loud on any problem, keep serving the last good
  deploy otherwise. `StandingsTable.astro` now just renders the already-
  resolved data — all the fetch/parse logic that didn't belong in a
  component is gone from it.
- **Fixed a real bug found while rewriting this**: `LeagueStandings.astro`
  decided which seasons to show standings for by checking
  `localStandings.some(...)` — *always*, even when a Sheet was connected
  — so a season with standings only in the Sheet (nothing matching in the
  unused local fallback) would have silently shown no standings section
  at all. Now checks the resolved `standings` export instead.
- **`fetchCSV()` extracted to `src/lib/csv.ts`**, shared by `schedule.ts`
  and `standings.ts` instead of each keeping its own copy — one fetch/
  fail-loud implementation for both to import, not two to keep in sync.
- **Apps Script now validates all three tabs together** (`Seasons`,
  `Schedule`, `Standings`) in one combined pass — one clean-or-not
  decision, one email if something's wrong, instead of `Standings`
  having no automated validation at all (previously: manual "click
  Redeploy in Cloudflare," no on-edit check, no error email).

### Added

- **Optional `Archive` tab**, documented in both `GOOGLE_SHEETS_SETUP.md`
  and `SHEET_ENTRY_GUIDE.md` — nowhere the site reads from, just a place
  to move a completed season's `Schedule`/`Standings` rows once it's
  over. Came out of a conversation about the `Schedule` tab's realistic
  growth (into the hundreds, potentially 1000+ rows, across a couple of
  years): the site only ever renders `active` seasons, so historical rows
  sitting in the live tabs do nothing but get fetched, parsed, and
  validated on every edit and every build for zero display benefit — and
  add more surface for a `fillDown()` boundary mistake (see 3.24) to go
  unnoticed. No automation for archiving; it's a manual, infrequent step,
  and Sheets' own version history is the backstop regardless of whether
  it's ever done.
- Verified end to end against a full mock CSV round-trip covering all
  three tabs together (not just standings in isolation): real seed data
  parses and validates cleanly, all 4 divisions render, a `season_id` not
  matching any `Seasons` row fails the build with a clear error.

---

---

## [3.28] — 2026-09-01 — fieldMapUrl moved onto the Schedule row; fillDown block-scoping fix

### Changed

- **`fieldMapUrl` moved off the separate `Venues` tab and onto the
  `Schedule` tab itself**, on the same row where `venue` is first given
  for a block — replacing 3.21's Venues-tab mechanism entirely.
  `src/data/venues.ts` reverted to a plain hardcoded array (no
  `VENUES_CSV_URL` fetch); `Game` in `schedule.ts` gained an optional
  `fieldMapUrl`, included in `fillDown()`'s columns; `LeagueSchedule.astro`
  now resolves the field-map link as the game's own value, falling back
  to the venue's hardcoded default. `GOOGLE_SHEETS_SETUP.md`,
  `SHEET_ENTRY_GUIDE.md`, `SHEET_SEED_DATA.md`, and `README.md` all
  updated — Step 3½ removed, its content folded into Step 3.

### Fixed

- **`fillDown()` could leak a value across a venue/date boundary it had
  no business crossing** — found live while testing the change above: a
  Naranja Park row with a blank `fieldMapUrl`, sitting right after a
  Mesquite block that had one, silently inherited Mesquite's field-map
  link. `fillDown()` tracked each column's last-seen value completely
  independently, with no idea that `venue` changing on a row means every
  *other* blank column on that row belongs to a new block too — not the
  previous one. `division` and `fieldMapUrl` are now block-scoped: any
  row that explicitly gives its own `venue` or `date` resets both, so a
  venue with no field-map link (or a division-block boundary) can no
  longer silently wear the previous block's value. `season_id`, `date`,
  and `venue` themselves are unaffected — they keep inheriting exactly as
  before. Ported identically into the Apps Script's `fillDown()`, same as
  every fill-down column so far — the two have to stay in lockstep or the
  sheet-side check accepts or rejects rows the build wouldn't agree with.
  Verified with the exact reproducing case (fixed) and a regression case
  (division still changes correctly mid-block, unaffected by the fix).
- This also directly informed the answer to a bigger question raised in
  conversation — as the `Schedule` tab grows across seasons (realistically
  into the hundreds to 1000+ rows over a couple of years), this exact
  failure shape gets harder to catch by eye. Recommended (not yet
  implemented): archive a season's rows out of the live tab once it ends,
  since the site only ever renders `active` seasons anyway — historical
  rows currently do nothing but get fetched, parsed, and validated on
  every build for zero display benefit.

---

---

## [3.27] — 2026-09-01 — Split the sheet docs by audience; sheet-swapping note

### Added

- **New `SHEET_ENTRY_GUIDE.md`** — plain-language, non-technical reference
  for whoever actually fills in the sheet week to week: the two tabs,
  column-by-column what to type, the leave-repeated-cells-blank trick,
  how venue grouping shows up on the site, getting team/venue names
  right, and the optional `Venues` tab (Google Drive walkthrough
  included). No mention of the build pipeline, validation internals, code
  file paths, or anything else that reader has no reason to see.
  `src/pages/admin/setup.astro` now renders this instead of
  `GOOGLE_SHEETS_SETUP.md` — that page is meant to be handed to a
  non-technical end user, so it should only ever show them the end-user
  doc. (An earlier pass tried removing the technical schema/validation
  detail from `GOOGLE_SHEETS_SETUP.md` and pointing it at the new guide
  instead of restating it — reverted: that doc is the technical reference
  a developer needs when debugging or maintaining the integration, and
  needed to stay complete on its own. The two docs now cover the same
  ground for two different readers, cross-referenced, kept in sync
  manually if the schema changes.)
- **`README.md`: switching to a different Google Sheet later documented**
  as what it actually is — a small, isolated change (republish the new
  sheet's tabs as CSV, swap 2–3 URL constants, commit/push) with one real
  cost: the Apps Script validator lives inside whichever spreadsheet it
  was pasted into, so a new sheet needs it re-added and its triggers
  re-set by hand — everything else (deploy hook, `/valid-values.json`,
  build-time validation) is sheet-agnostic already. Noted environment
  variables as the upgrade path if sheet-swapping becomes routine rather
  than occasional.

---

---

## [3.26] — 2026-09-01 — Live admin instructions page at /admin/setup

### Added

- **`src/pages/admin/setup.astro` renders `GOOGLE_SHEETS_SETUP.md` directly
  on the live site**, for whoever manages the schedule sheet day to day
  and doesn't have (or shouldn't need) GitHub access to read the raw
  markdown file. Imports the `.md` file straight from the repo root via
  Astro's built-in markdown-import support (`import { Content } from
  '../../../GOOGLE_SHEETS_SETUP.md'`) — one source of truth, no content
  duplicated into the page by hand, so it can't drift from the repo doc.
  Wrapped in a `prose`-styled `<article>` matching the site's existing
  colors/typography (headings, tables, code blocks, the ASCII diagram —
  code blocks get a visible scrollbar since Shiki's syntax highlighting
  wraps them in a dark theme where the site's default border color is
  invisible, and macOS hides scrollbars until touched, so a wide block
  would otherwise just look cut off).
- **`BaseLayout.astro` gained an optional `noindex` prop** — `true` on
  this page, keeps it out of search as a courtesy. Not the actual
  protection: this page has no content that couldn't already be read in
  the repo, but it's meant to be access-restricted so it doesn't show up
  for casual visitors either. Actual access control is **Cloudflare
  Access**, configured entirely in the Cloudflare dashboard against the
  `/admin/*` path — no code involved, and it covers any future page added
  under `src/pages/admin/` automatically. `README.md` documents the setup
  steps (Zero Trust → Access → add a `/admin/*` self-hosted application,
  an email-allowlist policy, done).

---

---

## [3.25] — 2026-09-01 — Optional Venues sheet tab for field-map links

### Added

- **A new optional `Venues` Sheet tab (`venue_id | fieldMapUrl`) lets
  someone add or swap a venue's "Field map" image link without a code
  change.** `src/data/venues.ts` now optionally fetches this tab
  (`VENUES_CSV_URL`, same empty-by-default pattern as the Seasons/
  Schedule URLs) and layers it on top of the hardcoded `venues` list —
  the sheet's link wins if a venue has both; a venue with no row (or a
  blank `fieldMapUrl` cell) just keeps using whatever's hardcoded, same
  as before this existed. Everything else about a venue (name, address,
  map link, notes) still only lives in code — this is deliberately
  narrow, just the field-map link. `GOOGLE_SHEETS_SETUP.md` documents the
  tab, the fallback behavior, and — the actual gotcha here — that the
  link has to be a *direct* image URL, not a share-page link (most Google
  Drive/Photos/Dropbox "share" links open a viewer page, not the raw
  image, so they silently fail to load in an `<img>` tag). This tab
  intentionally isn't wired into the Apps Script's real-time validate/
  notify flow — low-stakes, low-frequency edit, so the existing build-time
  check (fails loud, keeps serving the last good deploy) is enough.
  Verified against a local mock CSV server: overriding an existing local
  image, adding one to a venue that had none, and an unrecognized
  `venue_id` failing the build with a clear error.
- **The doc now commits to Google Drive specifically** rather than just
  naming the direct-vs-share-link problem and leaving the reader to
  figure out a source — step-by-step (upload, set sharing to "Anyone with
  the link," copy the share link, extract the file id, build the
  `uc?export=view&id=...` URL from it), why Drive over Photos/Dropbox
  (already have the account for the Sheet itself; the others don't have a
  reliable direct-link option), and a reminder to test the constructed
  URL in a browser tab before pasting it in, since the build validates
  `venue_id` but doesn't fetch the image to confirm the link itself
  actually works.

---

---

## [3.24] — 2026-09-01 — Blank cells inherit from the row above (season_id/date/venue/division)

### Added

- **`season_id`, `date`, `venue`, and `division` can now be left blank on
  any `Schedule` row — a blank cell inherits whatever was in the row
  above it for that column**, so a block of games at the same venue/date
  doesn't need those four values retyped on every single line. Matches
  how a vertically-merged range of Sheet cells actually exports to CSV
  (value in the top cell of the merge, blank for the rest), so it works
  whether someone types the block with those cells left blank or
  actually merges them in the sheet for a cleaner look. Only the very
  first row of the whole tab needs every column filled in. Implemented
  as `fillDown()` in `src/data/schedule.ts`, applied to the parsed rows
  before validation — and ported line-for-line into the Apps Script
  validator in `GOOGLE_SHEETS_SETUP.md`, since the sheet-side check has
  to accept exactly what the build accepts or it'll reject rows the site
  would otherwise build fine.
- `GOOGLE_SHEETS_SETUP.md`: new "Leave repeated cells blank" section with
  a worked multi-row example.
- `SHEET_SEED_DATA.md`: all 40 seed rows now follow this pattern — the
  season/date/venue/division cells are blank everywhere they'd just
  repeat the row above, matching the entry style the setup doc now
  recommends. Verified round-trip through the actual `fillDown()` +
  validation code (mock CSV server): same 40 games, same 5 venue groups,
  same division counts as before the seed data was rewritten.
- Fixed a stale count in `SHEET_SEED_DATA.md` ("8 of the 40 rows have a
  `notes` value") — the listed examples were always 7, not 8.

### Considered and rejected

- **A separate Sheet tab per division**, so `division` wouldn't need a
  column at all. Rejected: the league distributes a whole Saturday's
  games — every division — as one document, so splitting entry across 4
  tabs would make the common case (enter one day's full slate) more work,
  not less, and adding a division later would need a code change (a new
  CSV URL) instead of just adding it to `teams.ts`. The blank-cell
  inheritance above gets the same "don't retype it" benefit without
  either downside.

---

---

## [3.23] — 2026-08-31 — Desktop game notes, richer seed data

### Fixed

- **Per-game `notes` never rendered on the desktop schedule table**, only
  on mobile cards. The styling (`.game-note`) already existed — it was
  written but never wired into the desktop row markup, so a game's notes
  column was silently invisible to anyone not on mobile. Added
  `{g.notes && <span class="game-note">{g.notes}</span>}` inside
  `.sl-matchup` in `LeagueSchedule.astro`, with `flex-basis: 100%` so it
  drops to its own line under the matchup within the existing wrapping
  flex row — no new grid column needed. Distinct from, and independent of,
  the ⚠️ field-warning icon (that's a `fields.ts` venue note, not a
  per-game one — the spreadsheet has no control over it).
- Found (but did not yet clean up) another instance of the stale-duplicate-
  CSS pattern from 3.12's footer fix: `global.css` still has its own "10.
  Schedule & Standings" section duplicating `LeagueSchedule.astro`'s scoped
  styles (`.sched-list-header`, `.sl-matchup`, `.game-note`, etc., with
  slightly different values in places — e.g. `.game-note` font-size `.72rem`
  there vs `.7rem` in the component). Didn't bite this time since the new
  `flex-basis` property isn't contested by the stale copy, but it's the
  same landmine shape. Logged in `TODO.md`.

### Changed

- **Seed data (`SHEET_SEED_DATA.md`) expanded from 2 weeks to 5** (16 → 40
  games) — 2 weeks wasn't enough to actually exercise the `/league` page's
  Week filter. Added 8 per-game notes at a realistic density (not every
  row) and rebalanced the Standings numbers to match each team's 5 games
  played.
- **One field per week instead of mixed within a date** — the whole league
  now plays at one venue per Saturday (`mesquite-f1` → `naranja-park` →
  `mesquite-f3` → `chuparosa` → `mohave`), alternating between fields that
  carry a ⚠️ warning note in `fields.ts` and ones that don't. This means
  the seed data now demonstrates the two independent note systems clearly
  instead of the field-warning icon just appearing on every single game by
  coincidence (all 40 rows previously used Mesquite fields, which all
  happen to have warnings). Re-verified the full data against the real
  fetch/parse/validate pipeline via a local mock server, then confirmed
  live in a browser: Week 3 (Mesquite Field 3) shows both a per-game note
  and the field-warning icon on the same date; Week 5 (Mohave) shows a
  per-game note with no icon.

---

---

## [3.22] — 2026-08-31 — Schedule & season now sourced from Google Sheets

### Changed

- **Sheet columns renamed for a self-evident join.** The `Seasons` tab's
  `id` and the `Schedule` tab's `event` are now both called `season_id` —
  same column name in both tabs, so the relationship between them (one
  `Schedule` row references one `Seasons` row) is obvious without reading
  the docs. Updated everywhere: `schedule.ts`'s validation and error
  messages, `GOOGLE_SHEETS_SETUP.md`'s column tables and the Apps Script.

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
    integrity, date formats, orphaned `season_id` references, team names,
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
