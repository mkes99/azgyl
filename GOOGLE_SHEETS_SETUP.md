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
managed from **one Google Sheet** — not from code, and not from separate
spreadsheets. Update the sheet → the site validates it → if it's clean,
the site rebuilds automatically within a couple of minutes. If it's not
clean, nothing goes live and whoever made the edit gets an email
explaining why.

One sheet, four tabs:

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
2. Name it **AZGYL Season Data**.
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
| `startDate` / `endDate` | `YYYY-MM-DD`. |

Example row:
```
spring-2026 | Spring 2026 | season | TRUE | 2026-02-07 | 2026-04-11
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
| `date` | `YYYY-MM-DD`. Can be left blank. |
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
spring-2026 | 2026-02-07 | mesquite | | | 8U | 8:00 AM | 7:30 AM | Diamonds | Vipers | Field 2 | Opening day
```

### Leave repeated cells blank

`season_id`, `date`, `venue`, `fieldMapUrl`, `venueNotes`, and `division`
don't need to be retyped on every row. Leave any of those cells blank and
it picks up whatever was in the row above it — so a Saturday's worth of
games at one venue only needs that venue (and its date, season,
field-map link, and venue notes) typed once, at the top of the block:

```
season_id   | date       | venue    | fieldMapUrl                          | venueNotes       | division | time     | home            | away         | field    | gameNotes
spring-2026 | 2026-02-07 | mesquite | https://drive.google.com/file/d/.../view?usp=sharing | No dogs allowed. | 8U       | 8:00 AM  | Diamonds        | Vipers       | Field 2  | Opening day
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
`https://azgyl.com/valid-values.json` any time — it lists every currently
valid team name, division, and venue id. This is the same list the
validator checks against, so if a name isn't in that file, the sheet will
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

Open `src/data/schedule.ts` and fill in:

```ts
const SEASONS_CSV_URL  = 'https://docs.google.com/spreadsheets/d/.../pub?gid=...&single=true&output=csv';
const SCHEDULE_CSV_URL = 'https://docs.google.com/spreadsheets/d/.../pub?gid=...&single=true&output=csv';
```

If you're using the `Standings` tab, also open `src/data/standings.ts`
and fill in:

```ts
export const STANDINGS_CSV_URL = 'https://docs.google.com/spreadsheets/d/.../pub?gid=...&single=true&output=csv';
```

Leave it as `''` to keep editing `localStandings` in that file directly
instead — same optional, code-only fallback pattern as everything else
here.

Commit and push. This is a one-time step — after this, the sheet is the only
thing that needs updating.

---

## Step 7 — Set up the Cloudflare deploy hook(s)

A deploy hook only rebuilds the one branch it's created for — if more
than one branch should respond to sheet edits (`develop` now, `main`
once this is merged there too), each one needs its own hook. Repeat
this per branch:

1. Cloudflare Pages → your project → Settings → Builds & deployments → Deploy hooks → Add deploy hook
2. Name it `sheets-sync-<branch>` (e.g. `sheets-sync-develop`,
   `sheets-sync-main`) — names the trigger (this Sheet's Apps Script)
   and the target together, so the purpose is obvious from the name
   alone later, not just which branch it points at
3. Point it at that specific branch
4. Copy the webhook URL — it goes in `DEPLOY_HOOK_URLS` in the Apps
   Script below, one entry per hook

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
// One entry per branch that should rebuild when this sheet changes — each
// Cloudflare Pages branch needs its own deploy hook (a hook only rebuilds
// the one branch it was created for). Name each hook sheets-sync-<branch>
// in the Cloudflare dashboard — names the trigger (this Sheet) and the
// target together, so what each hook is for is obvious from the name
// alone, not just which branch it points at. google-sheets-schedule was
// merged into `develop` and deleted (as planned) — develop is the
// active branch now. main is commented out below as a placeholder —
// uncomment and fill in once main gets its own hook (Step 7), no other
// code changes needed.
const DEPLOY_HOOK_URLS  = [
  'YOUR_CLOUDFLARE_DEPLOY_HOOK_URL', // sheets-sync-develop
  // 'YOUR_MAIN_DEPLOY_HOOK_URL',    // sheets-sync-main — uncomment once main has its own hook
];
// Unlike DEPLOY_HOOK_URLS (fan out to every active branch), this stays a
// SINGLE url — it's the one source of truth for which team/division/
// venue names are currently valid, so it has to point at whichever
// deployment currently represents "live" for this repo, not several
// possibly-disagreeing ones at once. There's no way to make this
// permanently stable until the azgyl.com custom domain is actually
// attached in Cloudflare Pages — which happens at real launch, a
// separate, later, deliberate step, NOT automatically at "merged to
// main." Until launch, azgyl.com resolves nowhere, so this has to
// track whichever Cloudflare Pages deployment is currently relevant by
// hand, checked fresh every time that changes — a branch merge, a
// branch deletion, or launch itself:
//   - NOW (google-sheets-schedule merged + deleted, develop active):
//     https://develop.azgyl.pages.dev/valid-values.json — confirmed live
//   - Once merged into `main`, before launch: main's own Cloudflare
//     Pages URL (still not azgyl.com — that's not attached yet)
//   - At actual launch (azgyl.com attached as the custom domain):
//     https://azgyl.com/valid-values.json, permanently
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
  // Fire every configured hook — one deploy per branch. muteHttpExceptions
  // so one hook failing (a stale/deleted one, say) doesn't stop the rest
  // from firing.
  DEPLOY_HOOK_URLS.forEach(function (url) {
    UrlFetchApp.fetch(url, { method: 'post', muteHttpExceptions: true });
  });
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
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
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

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

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
    if (!DATE_RE.test(row.startDate)) errors.push('Seasons row ' + row.__row + ' (' + seasonId + '): startDate "' + row.startDate + '" is not YYYY-MM-DD');
    if (!DATE_RE.test(row.endDate))   errors.push('Seasons row ' + row.__row + ' (' + seasonId + '): endDate "' + row.endDate + '" is not YYYY-MM-DD');
  });

  gameRows.forEach(row => {
    const seasonId = row.season_id;
    if (!seasonId) { errors.push('Schedule row ' + row.__row + ': missing season_id'); return; }
    if (!seasonIds.has(seasonId)) { errors.push('Schedule row ' + row.__row + ': season_id "' + seasonId + '" doesn\'t match any Seasons row'); return; }
    if (!DATE_RE.test(row.date)) errors.push('Schedule row ' + row.__row + ': date "' + row.date + '" is not YYYY-MM-DD');
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
