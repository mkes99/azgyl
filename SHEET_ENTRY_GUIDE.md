# How to Fill Out the Schedule & Standings Sheet

This is everything you need to know to add or update games and
standings in the Google Sheet. It doesn't cover any of the technical
setup — someone's already done that part. This is just: open the sheet,
type things in, save.

**You can't break anything permanently.** If something you typed doesn't
match up (a team name spelled differently, a date in the wrong format),
the site simply won't update — you'll get an email a couple of minutes
later explaining exactly what to fix. Nothing broken ever shows up on the
website itself.

---

## The tabs you'll use

- **Seasons** — one row per season or tournament (e.g. "Spring 2026").
  You'll rarely touch this one — usually just once at the start of a
  season.
- **Schedule** — one row per game. You'll update this one most.
- **Standings** — one row per team, per division, per season. Update
  this after each game day.
- **Archive** (if there is one) — see "Archiving a past season" near the
  end. Nothing you need to touch week to week.

---

## Seasons tab

Row 1 (the very top row) needs these column names, spelled exactly like
this:

```
season_id | name | type | active | startDate | endDate
```

| Column | What to put there |
|---|---|
| `season_id` | A short, unique name for this season with no spaces — e.g. `spring-2026`. Every row you add to the Schedule tab will reference this exact text, so keep it short and simple. |
| `name` | The name shown on the website — e.g. `Spring 2026`. |
| `type` | Either `season` or `tournament` — lowercase, exactly. |
| `active` | `TRUE` or `FALSE`. `TRUE` means it shows up on the website. You can have more than one row marked `TRUE` at once (e.g. a season and a tournament running at the same time). |
| `startDate` / `endDate` | The season's start and end date, written as `2026-02-07` (year-month-day). |

Example:
```
spring-2026 | Spring 2026 | season | TRUE | 2026-02-07 | 2026-04-11
```

---

## Schedule tab

Row 1 needs these column names, spelled exactly like this:

```
season_id | date | time | arrival | home | away | division | venue | field | notes | fieldMapUrl
```

| Column | What to put there |
|---|---|
| `season_id` | Which season this game belongs to — must match a `season_id` from the Seasons tab exactly (e.g. `spring-2026`). |
| `date` | The game date, written as `2026-02-07` (year-month-day). |
| `time` | The game's start time — e.g. `9:30 AM`. |
| `arrival` | When teams should arrive/warm up — e.g. `9:00 AM`. Leave the cell empty if you don't need this. |
| `home` / `away` | The two teams playing — type the team name exactly as it appears on the website (see "Getting names right," below). |
| `division` | The age division — `8U`, `10U`, `12U`, or `14U`. |
| `venue` | Which park/school this game is at — see "Getting names right," below, for the exact names to use. |
| `field` | Whichever specific field it's on, in whatever words that venue actually uses — `Field 1`, `Field 3`, `Chuparosa Field`. There's no fixed list for this one — type whatever the venue calls it. |
| `notes` | Anything worth flagging about this specific game — `Senior night`, `Picture day — arrive 30 min early`. Leave empty if there's nothing to add. |
| `fieldMapUrl` | Optional — a link to a picture of where the fields are at that venue. Leave empty if there's nothing to add. See "Adding a field-layout picture," below. |

Example:
```
spring-2026 | 2026-02-07 | 8:00 AM | 7:30 AM | Diamonds | Vipers | 8U | mesquite | Field 2 | Opening day |
```

---

## Save yourself the retyping

You don't need to retype the season, date, venue, division, or
field-layout picture link on every single row — if a cell is left blank,
it just uses whatever was in the row above it. So a whole Saturday's
worth of games at one park only needs that park (and that date, season,
and picture link) typed once, at the very top:

```
season_id   | date       | time     | home        | away          | division | venue    | field   | notes       | fieldMapUrl
spring-2026 | 2026-02-07 | 8:00 AM  | Diamonds    | Vipers        | 8U       | mesquite | Field 2 | Opening day | https://drive.google.com/uc?export=view&id=...
            |            | 8:45 AM  | Hawks       | Hotshots      |          |          | Field 2 |             |
            |            | 9:30 AM  | Sol Sisters | Oro Valley    | 10U      |          | Field 1 |             |
            |            | 10:15 AM | Tukee Lightning | Chandler Lax |     |          | Field 1 |             |
```

That's four games where the venue, date, season, and picture link only
had to be typed once. This works exactly the same if you'd rather select
those cells and merge them in the sheet for a tidier look — either way is
fine.

The only row that needs every column filled in is the very first row of
the whole tab — there's nothing above that one to copy from.

---

## How games show up on the website

Every game that shares the same `venue` on the same date gets grouped
together on the website under one heading — the park's name, address,
map link, any notes about that park, and (if there's one) a field-layout
picture, all shown once, above every game happening there that day.

If some games that day are at a different venue (say, one age group is
somewhere else), the website automatically splits that day into a
separate section for each venue. You don't need to do anything special
for this — it just happens based on whatever you put in the `venue`
column.

If you need to use a venue that isn't available yet, ask whoever manages
the website to add it first.

---

## Getting names right

Team names and venue names have to match **exactly** what's already on
the website, or that row won't go through.

If you're ever unsure of the exact spelling, check
**`https://azgyl.com/valid-values.json`** — it's a plain list of every
team name, division, and venue currently recognized by the site. Copy
the spelling straight from there if you're not sure.

---

## Adding a field-layout picture

If a park has multiple fields and it'd help to show people a picture of
where each one is, add the link in the `fieldMapUrl` column on the
Schedule tab, on the same row where you first type that venue for a
block — it'll fill down with the rest of that block automatically (see
"Save yourself the retyping," above). Most venues won't need one — leave
the cell empty and no "Field map" button shows up for that venue,
nothing breaks.

### Getting a picture link from Google Drive

1. Upload the picture to Google Drive (any folder is fine).
2. Right-click it → **Share** → change "General access" from
   "Restricted" to **"Anyone with the link"** → set it to **Viewer**.
   (This step matters — skip it and the picture won't load for anyone.)
3. Click **Copy link**. It'll look something like:
   `https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view?usp=sharing`
4. Copy just the long jumble of letters/numbers between `/d/` and
   `/view` — in the example above that's `1AbCdEfGhIjKlMnOpQrStUvWxYz`.
5. Paste it into this address in place of the jumble at the end:
   `https://drive.google.com/uc?export=view&id=1AbCdEfGhIjKlMnOpQrStUvWxYz`
6. **That whole address** — not the one Drive's "Copy link" button gave
   you — is what goes in the `fieldMapUrl` cell.
7. Before you paste it into the sheet, test it: open that address in a
   new browser tab. If it shows just the picture by itself (not a Drive
   page around it), it'll work correctly on the website too.

Don't use Google Photos or Dropbox links for this — they don't work the
same way and the picture won't show up.

---

## Standings tab

Update this after each game day. Row 1 needs these column names, spelled
exactly like this:

```
season_id | division | team | W | L | T | GF | GA
```

| Column | What to put there |
|---|---|
| `season_id` | Which season these standings are for — must match a `season_id` from the Seasons tab exactly, same as on the Schedule tab. |
| `division` | The age division — `8U`, `10U`, `12U`, or `14U`. |
| `team` | The team name — type it exactly as it appears on the website (see "Getting names right," above). |
| `W` / `L` / `T` | Wins, losses, ties — whole numbers. |
| `GF` / `GA` | Goals for / goals against — whole numbers. |

Example:
```
spring-2026 | 8U | Diamonds | 3 | 1 | 0 | 20 | 10
```

One row per team, per division, per season — update the numbers as
results come in. You never need to sort this yourself; the website
always shows the current standings order (points, then goal
differential) automatically, however the rows are ordered in the sheet.

---

## Archiving a past season

Once a season is completely over, its rows can be moved out of `Schedule`
and `Standings` into the `Archive` tab (select the rows, cut, paste into
`Archive`) — that just keeps the tabs you're actively using smaller and
easier to scan. There's no particular format for `Archive`; it's not
read by the website at all, it's just a place to put things. This isn't
something you need to do often — maybe once or twice a year — and
nothing is ever really "gone" even without it, since Google Sheets keeps
its own history of every change (File → Version history) regardless.

---

## After you save

Give it a couple of minutes. If everything you typed checks out, the
website updates on its own — no further action needed. If something's
off, you'll get an email listing exactly what to fix and where. Fix it,
save again, and it'll automatically try once more.
