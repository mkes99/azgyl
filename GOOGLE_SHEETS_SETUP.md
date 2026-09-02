# Google Sheets Setup — Schedule, Season & Standings

This is the technical reference — the full picture, including the parts
that only matter for wiring the integration up or debugging it (the build
pipeline, exact validation rules, the Apps Script source). If you just
need to know how to actually fill in games and standings week to week,
**`SHEET_ENTRY_GUIDE.md`** covers the same tabs and columns in plain
language, no technical background assumed — that's also what's rendered
live at `/admin/setup` on the site. This doc and that one describe the
same sheet; keep them in sync if the column headers or validation rules
ever change.

The game schedule, the season/tournament shell it belongs to (name,
dates, which one is currently live), *and* division standings are all
managed from a Google Sheet — not from code. Update the sheet → the
site validates it → if it's clean, the site rebuilds automatically
within a couple of minutes. If it's not clean, nothing goes live and
whoever made the edit gets an email explaining why.

**There are two separate spreadsheets, one per environment — not one
sheet shared across branches.** "Develop AZGYL Season Data" feeds
`develop` only; a separate production spreadsheet feeds `main` only.
Each has its own Apps Script (Step 8) with its own single deploy hook
(Step 7), pointed at exactly one branch. This is deliberate: `develop`
existing separately from `main` is supposed to let a risky change (a
new validation rule, a column format change) get tested in isolation
before it can affect real production data — that isolation doesn't
actually exist if both branches validate against the *same* live sheet,
since any edit then has to satisfy both branches' code at once,
regardless of which one is actually ready. (This happened for real:
2026-09-01's date-format change broke `main`'s build the moment the
shared sheet was updated for `develop`, and had to be walked back.)
Whichever spreadsheet you're setting up, every step below is identical
— tabs, columns, validation rules, Apps Script. Only `DEPLOY_HOOK_URL`
and `VALID_VALUES_URL` in Step 8 differ, since each sheet's script only
ever talks to its own one branch.

One spreadsheet, four tabs:

- **`Seasons`** — one row per season/tournament.
- **`Schedule`** — one row per game.
- **`Standings`** — one row per team per division per season.
- **`Archive`** (optional) — nowhere the site reads from; just a place to
  move a completed season's `Schedule`/`Standings` rows once it's over,
  so the tabs the site actually fetches stay small. No fixed format —
  see "Archiving a completed season" near the end.

---

## How it fits together

```
 Google Sheet                     Your site (Cloudflare Pages)
 ┌────────────────────┐           ┌─────────────────────────────┐
 │ Seasons tab         │           │ /valid-values.json           │
 │ Schedule tab        │──edit──▶  │  (current team/division/     │
 │ Standings tab       │           │   venue names, always live)  │
 └─────────┬───────────┘           └───────────────┬───────────────┘
           │                                       │
           │ Apps Script                            │ fetched by
           │ validates against ──────────────────────┘ the script
           │ /valid-values.json
           │
     ┌─────┴─────┐         clean            ┌────────────────────┐
     │  valid?    ├───────────────────────▶ │ Cloudflare deploy    │
     └─────┬─────┘                          │ hook → site rebuilds │
           │ not clean                      │ from the sheet's CSV │
           ▼                                └────────────────────┘
   Email to admin + editor
   (nothing goes live)
```

The site's build also re-validates independently when it fetches the sheet
(`src/data/schedule.ts`, `src/data/standings.ts`) — if something slips past
the sheet's own check, the build fails loudly rather than publishing bad
data, and Cloudflare keeps serving the last good deploy. The sheet-side
check is the fast path; the build-side check is the backstop. Both share
one `fetchCSV()` helper (`src/lib/csv.ts`) so that behavior can't drift
between the two data files.

---

## Step 1 — Create the sheet

1. Go to sheets.google.com, create a new spreadsheet.
2. Name it **Develop AZGYL Season Data** if this is the develop-branch
   sheet, or **AZGYL Season Data** (no prefix) if this is the real
   production sheet feeding `main` — the name is just a label so two
   spreadsheets aren't confused for each other; the site never reads it.
3. Rename the first tab to `Seasons`. Add tabs named `Schedule` and
   `Standings`. Add an `Archive` tab too if you want one now — it can
   also wait until you actually have a season to archive.

---

## Step 2 — `Seasons` tab headers (Row 1, exact spelling)

```
season_id | name | type | active | startDate | endDate
```

| Column | Notes |
|---|---|
| `season_id` | Unique slug, e.g. `spring-2026`. This is what rows in the `Schedule` tab reference — same column name in both tabs on purpose, so the link between them is obvious at a glance. |
| `name` | Display name shown on the site, e.g. `Spring 2026`. |
| `type` | `season` or `tournament` — exactly, lowercase. |
| `active` | `TRUE` or `FALSE` — checkbox column recommended. `TRUE` = shown on the homepage and `/league`. More than one row can be `TRUE` at once (e.g. a season plus a tournament running alongside it). |
| `startDate` / `endDate` | `MM/DD/YYYY` only — single or double-digit month/day both fine (`9/19/2026` and `09/19/2026` both work). |

Example row:
```
spring-2026 | Spring 2026 | season | TRUE | 02/07/2026 | 04/11/2026
```

---

## Step 3 — `Schedule` tab headers (Row 1, exact spelling)

```
season_id | date | venue | fieldMapUrl | venueNotes | division | time | arrival | home | away | field | gameNotes
```

Column order groups the "cascading" fields first — the ones that fill
down a block (`season_id`, `date`, `venue`, `fieldMapUrl`, `venueNotes`,
`division`) — then the per-game specifics (`time`, `arrival`, `home`,
`away`, `field`, `gameNotes`). This order is purely cosmetic: every column is
read by its header name, not its position, so the sheet would work
identically in any column order — this one's just easier to scan.

| Column | Notes |
|---|---|
| `season_id` | Must exactly match a `season_id` from the `Seasons` tab. This is how a game gets grouped into a season — one row here is one game, fully described by its own columns. Can be left blank — see "Leave repeated cells blank" below. |
| `date` | `MM/DD/YYYY` only — single or double-digit month/day both fine. Can be left blank. |
| `venue` | Must match a venue id from `src/data/venues.ts` (e.g. `mesquite`, `naranja-park`) — ask whoever manages the site for the current list if you're not sure. This is what the site uses to group games together, show the venue name/address/map link/notes, and so on (see below). Can be left blank. |
| `fieldMapUrl` | Optional — a link to a field-layout picture for this venue. Can be left blank. Overrides whatever's hardcoded for that venue in `venues.ts`, if anything. See "Adding a field-map picture" below. |
| `venueNotes` | Optional — a note about the *venue* (e.g. "No dogs allowed"), not about one specific game. Can be left blank. See "Overriding a venue's notes" below — don't confuse this with `gameNotes`, further down, which is about one game. |
| `division` | Must be a division one of the current teams actually plays in (8U/10U/12U/14U, etc.). Can be left blank. |
| `time` | Game time, e.g. `9:30 AM`. |
| `arrival` | Optional — arrival/warmup time, e.g. `9:00 AM`. Leave blank if not needed. |
| `home` / `away` | Team name — must exactly match a team name on the site (see "Team name matching" below). |
| `field` | Plain text — whatever that venue actually calls it, e.g. `Field 1`, `Field 3`, `Chuparosa Field`. Not validated against any list, since different venues label their fields differently. |
| `gameNotes` | Optional — about this one game specifically, e.g. `Senior night`. Leave blank if not needed. Not the same column as `venueNotes`, above. |

Example row:
```
spring-2026 | 02/07/2026 | mesquite | | | 8U | 8:00 AM | 7:30 AM | Diamonds | Vipers | Field 2 | Opening day
```

### Formatting the date columns

`startDate`/`endDate` (Seasons) and `date` (Schedule) all need their
column set to a real Date format, displayed as `m/dd/yyyy` specifically
— select the column → **Format → Number → Custom date and time** →
type `m/dd/yyyy`. Don't use the plain **Format → Number → Date**
preset — it applies whatever Sheets' locale default is, which isn't
guaranteed to be `m/dd/yyyy`.

**A date cell is a real Sheets Date object, not text — that's normal and
fine.** Typing a date into a cell formatted this way makes Sheets store
it as an actual Date value, displayed as `m/dd/yyyy`. That's expected
and doesn't need to be avoided — see `formatCell()` in the Apps Script
below for how it's read.

### Leave repeated cells blank

`season_id`, `date`, `venue`, `fieldMapUrl`, `venueNotes`, and `division`
don't need to be retyped on every row. Leave any of those cells blank and
it picks up whatever was in the row above it — so a Saturday's worth of
games at one venue only needs that venue (and its date, season,
field-map link, and venue notes) typed once, at the top of the block:

```
season_id   | date       | venue    | fieldMapUrl                          | venueNotes       | division | time     | home            | away         | field    | gameNotes
spring-2026 | 02/07/2026 | mesquite | https://drive.google.com/file/d/.../view?usp=sharing | No dogs allowed. | 8U       | 8:00 AM  | Diamonds        | Vipers       | Field 2  | Opening day
            |            |          |                                       |                  |          | 8:45 AM  | Hawks           | Hotshots     | Field 2  |
            |            |          |                                       |                  | 10U      | 9:30 AM  | Sol Sisters     | Oro Valley   | Field 1  |
            |            |          |                                       |                  |          | 10:15 AM | Tukee Lightning | Chandler Lax | Field 1  |
```

That's 4 games with the venue, date, season, field-map link, and venue
notes typed once instead of four times each. This also matches how a
vertically-merged range of cells actually exports to CSV (Sheets puts the
value in the top cell of the merge and leaves the rest blank), so it
works equally well if you'd rather select those cells and merge them for
a cleaner look in the sheet itself. Only the very first row of the whole
tab needs every column filled in — there's nothing above it to inherit
from.

`division`, `fieldMapUrl`, and `venueNotes` specifically only fill down
**within** a block — the moment a row gives its own `venue` or `date`
(starting a new block), all three reset, so a venue with no field-map
link or no note never accidentally shows the previous block's. `season_id`,
`date`, and `venue` themselves aren't scoped this way — they keep
inheriting across as many rows as you leave blank, same as always.

### How games get grouped by venue on the site

Every game that shares a `venue` value on the same date is grouped
together on `/league` under one heading — venue name, address, map link,
field map, and notes are all shown once per group, not once per game. If
some games that date use a different `venue` (e.g. some divisions at
Mesquite, others at Naranja Park), the site automatically splits that day
into one section per venue instead. Nothing special to enter for either
case — just put the correct `venue` on each game and the grouping follows
from that alone.

If a venue you need isn't in `src/data/venues.ts` yet (new host site, or a
park not already listed), ask whoever manages the site to add it before
you reference it in the sheet — an unrecognized `venue` id fails
validation. `field` never fails validation — it's just descriptive text.

### Team name matching

Team and venue names must match **exactly** what's on the site. Check
`/valid-values.json` on whichever deployment this sheet feeds
(`develop.azgyl.pages.dev/valid-values.json` for the develop sheet;
the real production domain once it's live, for the production sheet)
any time — it lists every currently valid team name, division, and
venue id. This is the same list the validator checks against, so if a
name isn't in that file, the sheet will
reject it.

### Overriding a venue's notes

`src/data/venues.ts` can already have a note hardcoded for a venue (e.g.
"No dogs allowed") — that's the reliable, permanent default, shown once
per venue behind the "Notes" button on `/league`. `venueNotes` on a
Schedule row is a narrow override, same pattern as `fieldMapUrl`: it lets
someone add or change a note for that block without a code change. If a
game has both, **the sheet's note wins**. If it has neither, no "Notes"
button shows up for that venue — nothing breaks. This is a *different*
column from `gameNotes` (further down the row) — that one's about a single
game ("Senior night"), this one's about the location itself.

### Adding a field-map picture

`src/data/venues.ts` can already have a field-map picture hardcoded for a
venue — that's the reliable, permanent default. `fieldMapUrl` on a
Schedule row is a narrow override, same pattern as `venueNotes`: it lets
someone add or swap a picture for that block without a code change. **If
a game has both, the sheet's link always wins over the venues.ts
default** for that block — not merged, not "whichever loads first," a
straight override. If it has neither, no "Field map" button shows up for
that venue — nothing breaks.

**Use Google Drive for the link** — everyone editing the sheet already
has a Google account for it, and Drive supports a link format that
actually works as a direct image URL (Google Photos and Dropbox share
links don't — they open a viewer page instead of serving the raw image).

1. Upload the field-map image to Drive (any folder).
2. Right-click it → **Share** → under "General access," change it from
   "Restricted" to **"Anyone with the link"** → set the role to
   **Viewer**. This step is easy to skip and the image just won't load if
   you do — a "Restricted" file returns an error page instead of the
   image no matter what URL format you use.
3. Click **Copy link** and paste exactly what it gives you — something
   like `https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view?usp=sharing` —
   straight into the `fieldMapUrl` cell.

That's it — no extracting an id or hand-building a different URL. The
site normalizes whatever shape of Drive link shows up
(`normalizeFieldMapUrl()` in `src/lib/driveLink.ts`) into the direct-image
form it actually needs at build time, so the "Copy link" output works
as-is. (It only recognizes `drive.google.com` links — anything else
passes through unchanged, so a non-Drive image URL still has to already
be a direct link to the image itself, not a viewer page.)

If you'd rather skip the link workflow entirely for a given venue:
upload the image straight into `public/assets/field-maps/` in the
codebase instead, and set it on that venue in `venues.ts`. No link-format
steps, and it can't go stale — the tradeoff is it needs a developer to do
that part.

---

## Step 4 — `Standings` tab headers (Row 1, exact spelling)

```
season_id | division | team | wins | losses | ties | goalsFor | goalsAgainst
```

| Column | Notes |
|---|---|
| `season_id` | Must exactly match a `season_id` from the `Seasons` tab — same linkage as `Schedule` rows. This is what lets more than one season's standings live in this tab at once without one overwriting another. Can be left blank — see "Leave repeated cells blank" below. |
| `division` | Must be a division one of the current teams actually plays in. Can be left blank — see below. |
| `team` | Must exactly match a team name on the site (see "Team name matching" above). |
| `wins` / `losses` / `ties` / `goalsFor` / `goalsAgainst` | Whole numbers. Leave a cell blank for `0` (a team that hasn't played yet) — anything else has to actually be a number, or the row fails validation. |

Example row:
```
spring-2026 | 8U | Diamonds | 3 | 1 | 0 | 20 | 10
```

One row per team per division per season — there's no `game_id` or
anything tying a row to an individual `Schedule` game; it's a running
total you update as results come in, the same way it always has been.
Standings are sorted automatically on the site (points, then goal
differential) — never sort the sheet yourself.

### Leave repeated cells blank

`season_id` and `division` cascade the same way they do on `Schedule`:
leave either blank and it picks up whatever was in the row above, so a
block of teams in the same season/division only needs those two typed
once, at the top:

```
season_id   | division | team              | wins | losses | ties | goalsFor | goalsAgainst
spring-2026 | 8U       | Diamonds          | 3    | 1      | 0    | 20       | 10
            |          | Vipers            | 2    | 1      | 1    | 18       | 12
            | 10U      | Sol Sisters       | 4    | 0      | 0    | 22       | 6
            |          | Oro Valley        | 1    | 3      | 0    | 9        | 20
```

`division` is scoped to the `season_id` block — the moment a row gives
its own explicit `season_id` (a new season's rows starting), the cached
division resets, so the new season's first row can't silently inherit
whatever division the previous season's last row happened to be. Give
that first row of a new season block its own explicit `division` too.
Only the very first row of the whole tab needs every column filled in.

---

## What an empty tab looks like on the site

`Schedule` and `Standings` are independent — one having no rows for a
season doesn't hide or affect the other. Deliberately *not* symmetric:

| State | What shows on `/league` |
|---|---|
| No `Seasons` row is `active` at all | The whole schedule area shows "Schedule coming soon" (a site-wide state, not per-season). |
| An active season, but `Schedule` has no rows for it | That season's schedule area shows **"No games scheduled yet"** — a real, visible notice, not a blank space. |
| An active season, but `Standings` has no rows for it | The standings section for that season **doesn't appear at all** — no heading, no empty table, no message. Silent, not broken. |
| Both have rows | Both sections render normally, independently of each other. |

The difference is deliberate: a season with no games entered yet is
worth actively saying so (something's expected there and isn't there
yet); a season with no standings yet just isn't a section that exists
on the page — before anyone's played a game, there's nothing to
summarize, so nothing showing is the correct, unremarkable state.

This also means it's completely fine to create the `Seasons` row and mark
it `active` before `Schedule`/`Standings` have any data — the site won't
show anything broken, just the "not scheduled yet" notice (or, for
standings, nothing) until rows exist.

---

## Step 5 — Publish all three tabs to the web as CSV

For **each** tab (`Seasons`, `Schedule`, then `Standings`):

1. File → Share → Publish to web
2. Under "Link", choose the specific sheet tab (not "Entire document")
3. Choose **Comma-separated values (.csv)**
4. Click **Publish**, copy the URL

You'll get three different URLs, one per tab. Skip `Standings` for now if
you'd rather keep editing standings straight in `standings.ts` — see Step
6, `STANDINGS_CSV_URL`.

---

## Step 6 — Add the CSV URLs to the codebase

`schedule.ts`/`standings.ts` pick their CSV URLs based on `DEPLOY_ENV`
(a Cloudflare Pages build-time environment variable — `'production'`
on `main`, `'preview'` everywhere else), via `pickCsvUrl()` in
`src/lib/csv.ts`. This means **the exact same committed code runs on
every branch** — no hardcoding one branch's sheet URLs directly and
hoping every other branch stays in sync by hand (that went wrong for
real once already — see CHANGELOG 3.42–3.44).

Open `src/data/schedule.ts` and fill in the pair that matches which
spreadsheet you're setting up — the *production* argument if this is
the real production sheet feeding `main`, the *preview* argument if
this is "Develop AZGYL Season Data" feeding `develop`:

```ts
const SEASONS_CSV_URL = pickCsvUrl(
  'https://docs.google.com/spreadsheets/d/.../pub?gid=...&single=true&output=csv', // production
  'https://docs.google.com/spreadsheets/d/.../pub?gid=...&single=true&output=csv', // preview
);
const SCHEDULE_CSV_URL = pickCsvUrl(
  'https://docs.google.com/spreadsheets/d/.../pub?gid=...&single=true&output=csv', // production
  'https://docs.google.com/spreadsheets/d/.../pub?gid=...&single=true&output=csv', // preview
);
```

Leave the *other* environment's argument as `''` if that sheet doesn't
exist yet — the site runs with zero events (its normal "no active
events" state) for whichever environment has an empty URL, rather than
throwing. Don't fill in a URL for an environment you're not actually
setting up right now.

If you're using the `Standings` tab, also open `src/data/standings.ts`
and fill in the same pair:

```ts
export const STANDINGS_CSV_URL = pickCsvUrl(
  'https://docs.google.com/spreadsheets/d/.../pub?gid=...&single=true&output=csv', // production
  'https://docs.google.com/spreadsheets/d/.../pub?gid=...&single=true&output=csv', // preview
);
```

Leave both empty to keep editing `localStandings` in that file directly
instead — same optional, code-only fallback pattern as everything else
here.

Commit and push. This is a one-time step per environment — after both
production and preview URLs are filled in, the sheets are the only
thing that needs updating, and the same commit keeps working correctly
on both branches regardless of which one is ahead.

---

## Step 7 — Set up the Cloudflare deploy hook

A deploy hook only rebuilds the one branch it's created for. This
sheet ("Develop AZGYL Season Data") only ever talks to `develop` — one
hook, one branch, on purpose (see the note above `DEPLOY_HOOK_URL`
below for why: two branches sharing one sheet meant a schema change
couldn't be tested in isolation, which was the whole point of having a
separate branch). The real production sheet (feeding `main`) is a
separate spreadsheet with its own copy of this entire setup, including
its own single hook pointed at `main`.

1. Cloudflare Pages → your project → Settings → Builds & deployments → Deploy hooks → Add deploy hook
2. Name it `sheets-sync-develop` — names the trigger (this Sheet's
   Apps Script) and the target together, so the purpose is obvious
   from the name alone later
3. Point it at the `develop` branch
4. Copy the webhook URL — it goes in `DEPLOY_HOOK_URL` in the Apps
   Script below

---

## Step 8 — Add the Apps Script (validation + notify + deploy)

**All three tabs (`Seasons`, `Schedule`, `Standings`) need to exist before
this script runs** — even an empty `Standings` tab is fine (zero rows
just means zero standings errors), but the script reads all three every
time and throws if any of them is missing entirely. If you skipped
creating one back in Step 1, add it now before installing the trigger
below.

**Where this lives:** Apps Script is built into Google Sheets itself — not a
separate tool you need to install or sign up for. With the spreadsheet open
in your browser, the menu bar across the top has File, Edit, View, Insert,
Format, Data, Tools, **Extensions**, Help. Click **Extensions → Apps
Script** and it opens a code editor in a new tab (at script.google.com),
automatically tied to this specific spreadsheet. That's where the script
below goes. It's free, and uses your existing Google account — nothing else
to set up.

In that editor, delete whatever's in `Code.gs` and paste this in full:

```javascript
// ── CONFIG — fill these in ────────────────────────────────────────────────
// This spreadsheet ("Develop AZGYL Season Data") is the TESTING sheet —
// it only ever talks to `develop`, on purpose, so a schema/format
// change can actually be isolated there instead of also hitting
// whatever real production data `main` is serving. There's a separate
// production sheet feeding `main`'s own Apps Script + deploy hook (not
// this one) — don't add a second hook here to "cover" main; that's
// exactly the coupling this split was meant to remove. Each sheet talks
// to exactly one branch, so this is a single url, same as
// VALID_VALUES_URL below. Name the hook sheets-sync-<branch> in the
// Cloudflare dashboard — names the trigger (this Sheet) and the target
// together.
const DEPLOY_HOOK_URL   = 'YOUR_DEVELOP_DEPLOY_HOOK_URL'; // sheets-sync-develop
// This is the one source of truth for which team/division/venue names
// are currently valid, and has to match whichever deployment THIS sheet
// actually feeds. Since this sheet only talks to develop, that's
// develop's own Cloudflare Pages URL — NOT the bare <project>.pages.dev
// domain, which tracks the Production branch (main) and reflects the
// OTHER sheet's data, not this one's.
const VALID_VALUES_URL  = 'https://develop.azgyl.pages.dev/valid-values.json';
const ADMIN_EMAIL       = 'mike@formativewebsolutions.com'; // always notified on any validation error, regardless of who made the edit
const DEBOUNCE_MINUTES  = 2; // wait this long after the last edit before validating + deploying

// ── ENTRY POINTS ─────────────────────────────────────────────────────────
// Install as: Triggers → Add trigger → onSheetEdit → From spreadsheet → On edit
function onSheetEdit(e) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('pendingEditor', (e.user && e.user.getEmail()) || '');
  props.setProperty('pendingSince', String(Date.now()));
  ensureDebounceTrigger();
}

// Install as: Triggers → Add trigger → processPendingEdit → Time-driven → Minutes timer → Every minute
// (This is what actually validates + deploys — it runs a couple of minutes
// after the LAST edit, not on every single keystroke, so a multi-cell edit
// doesn't trigger several rebuilds or get validated mid-edit.)
function processPendingEdit() {
  const props = PropertiesService.getScriptProperties();
  const pendingSince = Number(props.getProperty('pendingSince') || 0);
  if (!pendingSince) return;

  const elapsedMinutes = (Date.now() - pendingSince) / 60000;
  if (elapsedMinutes < DEBOUNCE_MINUTES) return; // more edits may still be coming

  const editorEmail = props.getProperty('pendingEditor') || '';
  props.deleteProperty('pendingSince');
  props.deleteProperty('pendingEditor');
  removeDebounceTrigger();

  validateAndDeploy(editorEmail);
}

// ── CORE LOGIC ───────────────────────────────────────────────────────────
function validateAndDeploy(editorEmail) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const seasonRows    = readTab(ss, 'Seasons');
  const gameRows      = fillDown(readTab(ss, 'Schedule'), ['season_id', 'date', 'venue', 'division', 'fieldMapUrl', 'venueNotes']);
  const standingsRows = fillDownStandings(readTab(ss, 'Standings'));
  const valid         = fetchValidValues();
  const errors        = validateData(seasonRows, gameRows, standingsRows, valid);

  if (errors.length) {
    notifyError(editorEmail, errors);
    return;
  }
  // muteHttpExceptions so a stale/deleted hook fails quietly instead of
  // throwing out of validateAndDeploy — a broken deploy hook isn't a
  // validation error, and shouldn't be reported to the editor as one.
  UrlFetchApp.fetch(DEPLOY_HOOK_URL, { method: 'post', muteHttpExceptions: true });
}

function readTab(ss, tabName) {
  const sheet = ss.getSheetByName(tabName);
  if (!sheet) throw new Error('Tab "' + tabName + '" not found');
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(h => String(h).trim());
  return values.slice(1)
    .filter(row => row.some(cell => cell !== ''))
    .map((row, i) => {
      const obj = { __row: i + 2 }; // row 1 is the header
      headers.forEach((h, idx) => { obj[h] = formatCell(row[idx]); });
      return obj;
    });
}

function formatCell(value) {
  // A date column is a genuine Sheets Date-typed cell (normal — that's
  // what lets it display as m/dd/yyyy in the grid), so getValues() hands
  // back a real JS Date here, not the text you see on screen. Must
  // format to M/d/yyyy, matching DATE_RE and src/data/schedule.ts's
  // toISO() exactly — this used to format to yyyy-MM-dd, back when
  // DATE_RE accepted ISO too (see the note above DATE_RE below); once
  // DATE_RE went MM/DD/YYYY-only, this was left stringifying every real
  // Date cell into a format the regex immediately rejects, regardless of
  // whatever display format was set on the cell (this function never
  // looks at display format — only at whether the value is a Date
  // instance at all). Confirmed for real, 2026-09-01.
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'M/d/yyyy');
  }
  return String(value === null || value === undefined ? '' : value).trim();
}

function fetchValidValues() {
  const res = UrlFetchApp.fetch(VALID_VALUES_URL, { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) {
    throw new Error('Could not fetch ' + VALID_VALUES_URL + ' (HTTP ' + res.getResponseCode() + ')');
  }
  return JSON.parse(res.getContentText());
}

// MM/DD/YYYY only — must match src/data/schedule.ts's DATE_RE exactly.
// (An earlier version of this also accepted ISO YYYY-MM-DD, as a
// stopgap for when one sheet fed both develop's and main's deploy
// hooks and a format change on one branch could break the other before
// it caught up. Now that each branch has its own separate spreadsheet
// — see the note at the top of this doc — that coordination problem
// doesn't exist, so back to one format.)
const DATE_RE = /^\d{1,2}\/\d{1,2}\/\d{4}$/;

// A blank cell in any of `columns` inherits whatever was in the row above
// it for that column — must match src/data/schedule.ts's fillDown()
// exactly, since this is what lets someone leave season_id/date/venue/
// division/fieldMapUrl/venueNotes blank on a block of rows instead of
// retyping them every time. `division`/`fieldMapUrl`/`venueNotes` are
// block-scoped: a row that explicitly gives its own venue or date starts
// a new block, and none of the three should reach back into the
// PREVIOUS block for a value it left blank — otherwise a mixed-venue
// day, or a venue with no field-map link or note, can silently inherit
// the wrong block's value.
var BLOCK_SCOPED_COLUMNS = ['division', 'fieldMapUrl', 'venueNotes'];

function fillDown(rows, columns) {
  const last = {};
  return rows.map(row => {
    if (row.venue || row.date) {
      BLOCK_SCOPED_COLUMNS.forEach(function (col) { delete last[col]; });
    }
    const filled = Object.assign({}, row);
    columns.forEach(col => {
      if (filled[col]) last[col] = filled[col];
      else if (last[col]) filled[col] = last[col];
    });
    return filled;
  });
}

// A blank `season_id` or `division` cell on Standings inherits from the
// row above, same convenience as Schedule — must match
// src/data/standings.ts's fillDown() exactly. `division` is scoped to
// the season block: a row with its own explicit season_id resets it, so
// a new season's rows can't silently inherit the previous season's
// division.
function fillDownStandings(rows) {
  let lastSeasonId = '';
  let lastDivision = '';
  return rows.map(row => {
    const filled = Object.assign({}, row);
    if (filled.season_id) {
      lastSeasonId = filled.season_id;
      lastDivision = '';
    } else if (lastSeasonId) {
      filled.season_id = lastSeasonId;
    }
    if (filled.division) lastDivision = filled.division;
    else if (lastDivision) filled.division = lastDivision;
    return filled;
  });
}

function validateData(seasonRows, gameRows, standingsRows, valid) {
  const errors = [];
  const teamNames  = new Set(valid.teamNames);
  const divisions  = new Set(valid.divisions);
  const venueIds   = new Set(valid.venueIds);
  const seasonIds  = new Set();

  seasonRows.forEach(row => {
    const seasonId = row.season_id;
    if (!seasonId) { errors.push('Seasons row ' + row.__row + ': missing season_id'); return; }
    if (seasonIds.has(seasonId)) { errors.push('Seasons row ' + row.__row + ': duplicate season_id "' + seasonId + '"'); return; }
    seasonIds.add(seasonId);
    if (!row.name) errors.push('Seasons row ' + row.__row + ' (' + seasonId + '): missing name');
    if (row.type !== 'season' && row.type !== 'tournament') {
      errors.push('Seasons row ' + row.__row + ' (' + seasonId + '): type must be "season" or "tournament", got "' + row.type + '"');
    }
    if (!DATE_RE.test(row.startDate)) errors.push('Seasons row ' + row.__row + ' (' + seasonId + '): startDate "' + row.startDate + '" is not MM/DD/YYYY');
    if (!DATE_RE.test(row.endDate))   errors.push('Seasons row ' + row.__row + ' (' + seasonId + '): endDate "' + row.endDate + '" is not MM/DD/YYYY');
  });

  gameRows.forEach(row => {
    const seasonId = row.season_id;
    if (!seasonId) { errors.push('Schedule row ' + row.__row + ': missing season_id'); return; }
    if (!seasonIds.has(seasonId)) { errors.push('Schedule row ' + row.__row + ': season_id "' + seasonId + '" doesn\'t match any Seasons row'); return; }
    if (!DATE_RE.test(row.date)) errors.push('Schedule row ' + row.__row + ': date "' + row.date + '" is not MM/DD/YYYY');
    if (!row.time) errors.push('Schedule row ' + row.__row + ': missing time');
    if (!row.home) errors.push('Schedule row ' + row.__row + ': missing home team');
    if (!row.away) errors.push('Schedule row ' + row.__row + ': missing away team');
    if (row.home && row.away && row.home === row.away) errors.push('Schedule row ' + row.__row + ': home and away are both "' + row.home + '"');
    if (row.home && !teamNames.has(row.home)) errors.push('Schedule row ' + row.__row + ': home team "' + row.home + '" not recognized — check /valid-values.json');
    if (row.away && !teamNames.has(row.away)) errors.push('Schedule row ' + row.__row + ': away team "' + row.away + '" not recognized — check /valid-values.json');
    if (!divisions.has(row.division)) errors.push('Schedule row ' + row.__row + ': division "' + row.division + '" not recognized');
    if (!venueIds.has(row.venue)) errors.push('Schedule row ' + row.__row + ': venue "' + row.venue + '" not recognized — check /valid-values.json');
    if (!row.field) errors.push('Schedule row ' + row.__row + ': missing field');
  });

  standingsRows.forEach(row => {
    const seasonId = row.season_id;
    if (!seasonId) { errors.push('Standings row ' + row.__row + ': missing season_id'); return; }
    if (!seasonIds.has(seasonId)) { errors.push('Standings row ' + row.__row + ': season_id "' + seasonId + '" doesn\'t match any Seasons row'); return; }
    if (!row.division) errors.push('Standings row ' + row.__row + ': missing division');
    else if (!divisions.has(row.division)) errors.push('Standings row ' + row.__row + ': division "' + row.division + '" not recognized');
    if (!row.team) errors.push('Standings row ' + row.__row + ': missing team');
    else if (!teamNames.has(row.team)) errors.push('Standings row ' + row.__row + ': team "' + row.team + '" not recognized — check /valid-values.json');
    ['wins', 'losses', 'ties', 'goalsFor', 'goalsAgainst'].forEach(function (key) {
      const raw = row[key];
      if (raw === '') return; // blank means 0, always fine
      const n = Number(raw);
      if (!isFinite(n) || n < 0) errors.push('Standings row ' + row.__row + ': ' + key + ' "' + raw + '" isn\'t a valid non-negative number');
    });
  });

  return errors;
}

function notifyError(editorEmail, errors) {
  // ADMIN_EMAIL always gets notified — the editor (if known) is added on
  // top of that, not instead of it, so they get direct actionable
  // feedback on their own mistake without the admin missing an error.
  const recipients = [ADMIN_EMAIL];
  if (editorEmail && editorEmail !== ADMIN_EMAIL) recipients.push(editorEmail);

  const subject = 'AZGYL sheet: ' + errors.length + ' problem(s) found — not published';
  let body =
    'The sheet has ' + errors.length + ' problem(s), so the site was NOT updated:\n\n' +
    errors.map(function (e) { return '- ' + e; }).join('\n') +
    '\n\nFix these in the sheet — it will automatically try again after your next edit.';
  if (!editorEmail) {
    body += '\n\n(Could not tell who made this edit.)';
  }
  MailApp.sendEmail(recipients.join(','), subject, body);
}

// ── DEBOUNCE TRIGGER MANAGEMENT ──────────────────────────────────────────
function ensureDebounceTrigger() {
  const exists = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === 'processPendingEdit';
  });
  if (!exists) {
    ScriptApp.newTrigger('processPendingEdit').timeBased().everyMinutes(1).create();
  }
}
function removeDebounceTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(function (t) { return t.getHandlerFunction() === 'processPendingEdit'; })
    .forEach(function (t) { ScriptApp.deleteTrigger(t); });
}
```

Then wire up the one **installable** trigger this needs to bootstrap itself:

- Triggers (clock icon, left sidebar) → Add trigger
- Function: `onSheetEdit` · Event source: **From spreadsheet** · Event type: **On edit**
- Save — it'll ask you to authorize the script (needs permission to send email and make external requests)

The `processPendingEdit` time-driven trigger is created and removed
automatically by the script itself — you don't need to add it by hand.

---

## A note on error notifications

`ADMIN_EMAIL` gets every validation error, no exceptions — that's the
one guaranteed recipient. The script also tries to email whichever
Google account actually made the edit (`e.user.getEmail()`), added on
top of the admin notification, so whoever made the mistake gets direct
feedback too. That part is **best-effort** — depending on how the sheet
is shared and Google's own privacy rules, it can come back empty, in
which case only `ADMIN_EMAIL` gets notified. If the editor's own
notification seems to be missing sometimes, that's why — it's a known
limitation of Apps Script's editor detection, not a bug in this script.

---

## Archiving a completed season

The site only ever renders `active` seasons — once a season's `active`
cell in the `Seasons` tab is `FALSE`, its `Schedule` and `Standings` rows
are still fetched, parsed, and validated on every single edit and every
build, for zero display benefit. As a season's row count adds up across
a year or several, that's pure downside: a slower-to-scan sheet, and more
surface for a fill-down mistake (leaving a cell blank near a boundary
between two different seasons) to silently pull in the wrong value —
this is exactly what `fillDown()`'s block-scoping (see "Leave repeated
cells blank" above) protects against, but less data in the live tabs is
still the simplest way to keep that risk low.

Once a season's over: select its rows in `Schedule` and `Standings`, cut,
paste into `Archive` (create the tab first if you skipped it in Step 1).
`Archive` has no fixed format, isn't fetched by anything, and isn't part
of the validate/deploy flow — it's just off to the side. Nothing is ever
actually at risk of being lost even without this: Google Sheets keeps
its own version history regardless (File → Version history), so
archiving is about keeping the *live* tabs lean, not about preventing
data loss.

There's no automation for this — it's a manual step, realistically a
couple of times a year.

---

## Done. Weekly workflow:

1. Open the sheet, update `Seasons`, `Schedule`, and/or `Standings`.
2. Wait ~2 minutes after your last edit.
3. If everything checks out, the site rebuilds automatically — no email, no action needed.
4. If something's off, you'll get an email listing exactly what's wrong and where. Fix it, save, and it tries again automatically.
