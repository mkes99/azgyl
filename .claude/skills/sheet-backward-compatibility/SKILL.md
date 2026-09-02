---
name: sheet-backward-compatibility
description: Use before changing anything the Google Sheets CMS (schedule.ts, standings.ts, the Apps Script, GOOGLE_SHEETS_SETUP.md) requires of a sheet — a column name, a required/optional field, an accepted value or format, a tab. Prevents breaking the real production sheet, which a non-technical person maintains without watching this repo.
---

# Sheet backward compatibility

AZGYL's schedule/standings data comes from Google Sheets, validated and
fetched at build time (`src/data/schedule.ts`, `src/data/standings.ts`,
`src/lib/csv.ts`). Two spreadsheets feed it — "Develop AZGYL Season
Data" (→ `develop`) and a separate production sheet (→ `main`), see
`GOOGLE_SHEETS_SETUP.md`. The production sheet is maintained by someone
who is not the developer, doesn't read this repo's commits or
CHANGELOG, and has no way to know a rule changed except by what
actually happens to their sheet. That asymmetry is the whole risk this
skill exists to manage — it already caused one real production break
(2026-09-01: tightening the date format on `develop`'s shared sheet
broke `main`'s build the moment it deployed; see CHANGELOG 3.42/3.43).

## What counts as a schema change

Anything that changes what a valid row looks like:
- A column added, renamed, or removed (`Seasons`/`Schedule`/`Standings`
  tab headers).
- A field that was optional becoming required, or vice versa.
- An accepted format changing — a date format, a regex, a value list.
- A new tab the script now expects to exist.
- A validation rule getting stricter in any way (even a "fix" — from
  the sheet owner's side, stricter is stricter).

If a change touches `DATE_RE`, `BLOCK_SCOPED_COLUMNS`, any `errors.push`
condition in `buildEvents()`/`buildStandings()`, the embedded Apps
Script in `GOOGLE_SHEETS_SETUP.md`, or the tab-header contracts
described there — this skill applies.

## The process

1. **Build and test against `develop` first**, same as any other
   change. That's the whole reason the two-sheet split exists — see
   the intro of `GOOGLE_SHEETS_SETUP.md`.

2. **Before merging to `main`, dry-run the new validation logic against
   the ACTUAL production sheet's current data** — not against
   assumptions about what it probably contains. Never assume the
   production sheet already matches whatever `develop`'s sheet looks
   like; they're edited independently by different people, and drift is
   the normal state, not the exception. Use the same mock-server /
   temporary-URL-swap method established in this repo's testing
   history: point `SEASONS_CSV_URL`/`SCHEDULE_CSV_URL`/
   `STANDINGS_CSV_URL` at the real production CSV export URLs
   temporarily, run `npm run build`, read the actual validation errors
   (if any), then revert the URLs before committing anything. Once a
   production sheet exists, its published CSV URLs live in
   `pickCsvUrl()`'s first argument in `schedule.ts`/`standings.ts` — use
   those, not `develop`'s.

3. **If the dry-run is clean** (the production sheet already satisfies
   the new rule), merging is safe — no owner coordination needed.

4. **If the dry-run fails**, do not merge yet. Pick one:
   - Make the change tolerant of both the old and new shape temporarily
     (accept both formats/values, like the MM/DD/YYYY-and-YYYY-MM-DD
     stopgap in CHANGELOG 3.43) until the sheet owner has updated —
     then remove the tolerance once confirmed.
   - Or coordinate with the sheet owner directly before merging: tell
     them plainly what's changing and why, and point them at
     `/admin/setup` (the live-rendered `SHEET_ENTRY_GUIDE.md`) rather
     than writing one-off instructions in an email — that page is
     always current, a hand-written explanation can drift from it.
     Only merge once they've confirmed the sheet is updated, or once
     you've verified it yourself against the real sheet.

5. **Update both docs in the same change**: `GOOGLE_SHEETS_SETUP.md`
   (technical reference) and `SHEET_ENTRY_GUIDE.md` (what the sheet
   owner actually reads, rendered at `/admin/setup`). A rule that only
   lives in code and a CHANGELOG entry is invisible to the person who
   actually has to follow it.

## The honest limit here

There's no infrastructure that proactively pings the sheet owner the
moment code changes — the Apps Script's trigger is `onSheetEdit`, which
only fires on an edit to that spreadsheet, never on a git push. Two
things are already automatic:
- **Reactive safety net**: if a merged change makes the production
  sheet's current data invalid, the *next* edit to that sheet fails
  validation and emails `ADMIN_EMAIL` (always) plus the editor — but
  only once someone edits it. Until then the site just keeps serving
  the last good deploy, silently.
- **Proactive notice is a manual step for the developer** — step 4
  above. There's no way around actually telling the person, in plain
  language, before the change goes live. Don't rely on the reactive
  safety net as if it were proactive notice — by the time it fires, the
  build may already be broken and no one's told until they happen to
  touch the sheet.

## Where the real contracts live

- `GOOGLE_SHEETS_SETUP.md` — tab headers, validation rules, the Apps
  Script source (must match `schedule.ts`/`standings.ts` exactly — see
  the comment above `DATE_RE` there).
- `SHEET_ENTRY_GUIDE.md` — the sheet owner's actual reference, rendered
  live at `/admin/setup`.
- `TODO.md` / `CHANGELOG.md` — history of past schema changes and how
  each was actually rolled out; check before assuming a "new" tradeoff
  hasn't already been hit.
