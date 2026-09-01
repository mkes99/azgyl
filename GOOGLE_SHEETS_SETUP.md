# Google Sheets Setup — Schedule & Season

The game schedule *and* the season/tournament shell it belongs to (name, dates,
which one is currently live) are both managed from one Google Sheet — not
from code. Update the sheet → the site validates it → if it's clean, the
site rebuilds automatically within a couple of minutes. If it's not clean,
nothing goes live and whoever made the edit gets an email explaining why.

**Standings are a separate sheet, not covered here** — see `STANDINGS_SETUP.md`.

---

## How it fits together

```
 Google Sheet                     Your site (Cloudflare Pages)
 ┌────────────────────┐           ┌─────────────────────────────┐
 │ Seasons tab         │           │ /valid-values.json           │
 │ Schedule tab        │──edit──▶  │  (current team/division/     │
 └─────────┬───────────┘           │   venue names, always live)  │
           │                       └───────────────┬───────────────┘
           │ Apps Script                            │ fetched by
           │ validates against ──────────────────────┘ the script
           │ /valid-values.json
           │
     ┌─────┴─────┐         clean            ┌────────────────────┐
     │  valid?    ├───────────────────────▶ │ Cloudflare deploy    │
     └─────┬─────┘                          │ hook → site rebuilds │
           │ not clean                      │ from the sheet's CSV │
           ▼                                └────────────────────┘
   Email to whoever edited it
   (nothing goes live)
```

The site's build also re-validates independently when it fetches the sheet
(`src/data/schedule.ts`) — if something slips past the sheet's own check,
the build fails loudly rather than publishing bad data, and Cloudflare keeps
serving the last good deploy. The sheet-side check is the fast path; the
build-side check is the backstop.

---

## Step 1 — Create the sheet

1. Go to sheets.google.com, create a new spreadsheet.
2. Name it **AZGYL Schedule**.
3. Rename the first tab to `Seasons`. Add a second tab named `Schedule`.

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
season_id | date | time | arrival | home | away | division | venue | field | notes
```

| Column | Notes |
|---|---|
| `season_id` | Must exactly match a `season_id` from the `Seasons` tab. This is how a game gets grouped into a season — one row here is one game, fully described by its own columns. Can be left blank — see "Leave repeated cells blank" below. |
| `date` | `YYYY-MM-DD`. Can be left blank. |
| `time` | Game time, e.g. `9:30 AM`. |
| `arrival` | Optional — arrival/warmup time, e.g. `9:00 AM`. Leave blank if not needed. |
| `home` / `away` | Team name — must exactly match a team name on the site (see "Team name matching" below). |
| `division` | Must be a division one of the current teams actually plays in (8U/10U/12U/14U, etc.). Can be left blank. |
| `venue` | Must match a venue id from `src/data/venues.ts` (e.g. `mesquite`, `naranja-park`) — ask whoever manages the site for the current list if you're not sure. This is what the site uses to group games together, show the venue name/address/map link/notes, and so on (see below). Can be left blank. |
| `field` | Plain text — whatever that venue actually calls it, e.g. `Field 1`, `Field 3`, `Chuparosa Field`. Not validated against any list, since different venues label their fields differently. |
| `notes` | Optional — e.g. `Senior night`. Leave blank if not needed. |

Example row:
```
spring-2026 | 2026-02-07 | 8:00 AM | 7:30 AM | Diamonds | Vipers | 8U | mesquite | Field 2 | Opening day
```

### Leave repeated cells blank

`season_id`, `date`, `venue`, and `division` don't need to be retyped on
every row. Leave any of those cells blank and it picks up whatever was in
the row above it — so a Saturday's worth of games at one venue only needs
that venue (and that date, and that season) typed once, at the top of the
block:

```
season_id   | date       | time     | home       | away          | division | venue    | field    | notes
spring-2026 | 2026-02-07 | 8:00 AM  | Diamonds   | Vipers        | 8U       | mesquite | Field 2  | Opening day
            |            | 8:45 AM  | Hawks      | Hotshots      |          |          | Field 2  |
            |            | 9:30 AM  | Sol Sisters| Oro Valley    | 10U      |          | Field 1  |
            |            | 10:15 AM | Tukee Lightning | Chandler Lax |     |          | Field 1  |
```

That's 4 games with the venue, date, and season typed once instead of
four times each. This also matches how a vertically-merged range of cells
actually exports to CSV (Sheets puts the value in the top cell of the
merge and leaves the rest blank), so it works equally well if you'd
rather select those cells and merge them for a cleaner look in the sheet
itself. Only the very first row of the whole tab needs every column
filled in — there's nothing above it to inherit from.

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

---

## Step 4 — Publish both tabs to the web as CSV

For **each** tab (`Seasons`, then `Schedule`):

1. File → Share → Publish to web
2. Under "Link", choose the specific sheet tab (not "Entire document")
3. Choose **Comma-separated values (.csv)**
4. Click **Publish**, copy the URL

You'll get two different URLs, one per tab.

---

## Step 5 — Add both CSV URLs to the codebase

Open `src/data/schedule.ts` and fill in:

```ts
const SEASONS_CSV_URL  = 'https://docs.google.com/spreadsheets/d/.../pub?gid=...&single=true&output=csv';
const SCHEDULE_CSV_URL = 'https://docs.google.com/spreadsheets/d/.../pub?gid=...&single=true&output=csv';
```

Commit and push. This is a one-time step — after this, the sheet is the only
thing that needs updating.

---

## Step 6 — Set up the Cloudflare deploy hook

1. Cloudflare Pages → your project → Settings → Builds & deployments → Deploy hooks → Add deploy hook
2. Point it at the branch that should be rebuilt when the sheet changes (usually your production branch)
3. Copy the webhook URL

---

## Step 7 — Add the Apps Script (validation + notify + deploy)

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
const DEPLOY_HOOK_URL   = 'YOUR_CLOUDFLARE_DEPLOY_HOOK_URL';
const VALID_VALUES_URL  = 'https://azgyl.com/valid-values.json'; // point at whichever deploy this sheet should validate against
const FALLBACK_EMAIL    = 'azgirlsyouthlax@gmail.com'; // used only if we can't tell who made the edit
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
  const seasonRows = readTab(ss, 'Seasons');
  const gameRows   = fillDown(readTab(ss, 'Schedule'), ['season_id', 'date', 'venue', 'division']);
  const valid      = fetchValidValues();
  const errors     = validateData(seasonRows, gameRows, valid);

  if (errors.length) {
    notifyError(editorEmail, errors);
    return;
  }
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
// division blank on a block of rows instead of retyping them every time.
function fillDown(rows, columns) {
  const last = {};
  return rows.map(row => {
    const filled = Object.assign({}, row);
    columns.forEach(col => {
      if (filled[col]) last[col] = filled[col];
      else if (last[col]) filled[col] = last[col];
    });
    return filled;
  });
}

function validateData(seasonRows, gameRows, valid) {
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

  return errors;
}

function notifyError(editorEmail, errors) {
  const to = editorEmail || FALLBACK_EMAIL;
  const subject = 'AZGYL schedule sheet: ' + errors.length + ' problem(s) found — not published';
  let body =
    'The schedule sheet has ' + errors.length + ' problem(s), so the site was NOT updated:\n\n' +
    errors.map(function (e) { return '- ' + e; }).join('\n') +
    '\n\nFix these in the sheet — it will automatically try again after your next edit.';
  if (!editorEmail) {
    body += '\n\n(Could not tell who made this edit, so this went to the shared board inbox instead.)';
  }
  MailApp.sendEmail(to, subject, body);
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

## A note on "whoever edited it" notifications

The script tries to email whichever Google account made the edit
(`e.user.getEmail()`). This is **best-effort** — depending on how the sheet
is shared and Google's own privacy rules, it can come back empty, in which
case the email goes to the shared board inbox (`azgirlsyouthlax@gmail.com`)
instead. If notifications seem to be going to the wrong place, that's why —
it's a known limitation of Apps Script's editor detection, not a bug in this
script.

---

## Done. Weekly workflow:

1. Open the sheet, update `Seasons` and/or `Schedule`.
2. Wait ~2 minutes after your last edit.
3. If everything checks out, the site rebuilds automatically — no email, no action needed.
4. If something's off, you'll get an email listing exactly what's wrong and where. Fix it, save, and it tries again automatically.
