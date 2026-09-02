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
| `startDate` / `endDate` | The season's start and end date, written as `02/07/2026` (month/day/year). |

Example:
```
spring-2026 | Spring 2026 | season | TRUE | 02/07/2026 | 04/11/2026
```

---

## Schedule tab

Row 1 needs these column names, spelled exactly like this:

```
season_id | date | venue | fieldMapUrl | venueNotes | division | time | arrival | home | away | field | gameNotes
```

The columns are ordered so the ones you usually only type once per block
(season, date, venue, its picture link, its note, division) come first,
then the columns that are different on every row (time, teams, field,
that game's own note). The order doesn't actually matter to the
website — it reads columns by name, not position — this order is just
easier to fill in.

| Column | What to put there |
|---|---|
| `season_id` | Which season this game belongs to — must match a `season_id` from the Seasons tab exactly (e.g. `spring-2026`). |
| `date` | The game date, written as `02/07/2026` (month/day/year). |
| `venue` | Which park/school this game is at — see "Getting names right," below, for the exact names to use. |
| `fieldMapUrl` | Optional — a link to a picture of where the fields are at that venue. Leave empty if there's nothing to add. If that venue already has a field-map picture built into the site, this **replaces** it for games in this block — see "Adding a field-layout picture," below. |
| `venueNotes` | Optional — a note about the *park itself*, like "No dogs allowed" — not about one particular game. Leave empty if there's nothing to add. See "Adding a venue note," below. |
| `division` | The age division — `8U`, `10U`, `12U`, or `14U`. |
| `time` | The game's start time — e.g. `9:30 AM`. |
| `arrival` | When teams should arrive/warm up — e.g. `9:00 AM`. Leave the cell empty if you don't need this. |
| `home` / `away` | The two teams playing — type the team name exactly as it appears on the website (see "Getting names right," below). |
| `field` | Whichever specific field it's on, in whatever words that venue actually uses — `Field 1`, `Field 3`, `Chuparosa Field`. There's no fixed list for this one — type whatever the venue calls it. |
| `gameNotes` | Anything worth flagging about this **one game** — `Senior night`, `Picture day — arrive 30 min early`. Leave empty if there's nothing to add. Different from `venueNotes` — that one's about the park, this one's about a single game. |

Example:
```
spring-2026 | 02/07/2026 | mesquite | | | 8U | 8:00 AM | 7:30 AM | Diamonds | Vipers | Field 2 | Opening day
```

---

## Save yourself the retyping

You don't need to retype the season, date, venue, picture link, venue
note, or division on every single row — if a cell is left blank, it just
uses whatever was in the row above it. So a whole Saturday's worth of
games at one park only needs that park (and its date, season, picture
link, and note) typed once, at the very top:

```
season_id   | date       | venue    | fieldMapUrl                          | venueNotes       | division | time     | home            | away         | field   | gameNotes
spring-2026 | 02/07/2026 | mesquite | https://drive.google.com/file/d/.../view?usp=sharing | No dogs allowed. | 8U       | 8:00 AM  | Diamonds        | Vipers       | Field 2 | Opening day
            |            |          |                                       |                  |          | 8:45 AM  | Hawks           | Hotshots     | Field 2 |
            |            |          |                                       |                  | 10U      | 9:30 AM  | Sol Sisters     | Oro Valley   | Field 1 |
            |            |          |                                       |                  |          | 10:15 AM | Tukee Lightning | Chandler Lax | Field 1 |
```

That's four games where the venue, date, season, picture link, and note
only had to be typed once. This works exactly the same if you'd rather
select those cells and merge them in the sheet for a tidier look — either
way is fine.

The only row that needs every column filled in is the very first row of
the whole tab — there's nothing above that one to copy from.

One thing to watch for: `division`, `fieldMapUrl`, and `venueNotes`
follow the venue and date, not just "whatever's above." The moment a
row types its own `venue` or `date` instead of leaving them blank —
starting a new block — those three reset too, even if you meant to
carry the same division forward. So if a new week's first row gives its
own `date` but leaves `division` blank expecting it to carry over from
last week's last game, it won't — that row needs its own `division`
too. Give a new block's first row a `division` (and, if it applies, a
`fieldMapUrl`/`venueNotes`) any time it also gives its own `venue` or
`date`.

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
**[/valid-values.json](/valid-values.json)** — it's a plain list of every
team name, division, and venue currently recognized by the site. Copy
the spelling straight from there if you're not sure.

---

## Adding a field-layout picture

If a park has multiple fields and it'd help to show people a picture of
where each one is, add the link in the `fieldMapUrl` column on the
Schedule tab, on the same row where you first type that venue for a
block — it'll fill down with the rest of that block automatically (see
"Save yourself the retyping," above). If that venue already shows a
field-map picture on the website, this one **replaces** it for that
block. Most venues won't need one — leave the cell empty and whatever's
already there (or nothing, if there's nothing) keeps showing.

### Getting a picture link from Google Drive

1. Upload the picture to Google Drive (any folder is fine).
2. Right-click it → **Share** → change "General access" from
   "Restricted" to **"Anyone with the link"** → set it to **Viewer**.
   (This step matters — skip it and the picture won't load for anyone.)
3. Click **Copy link**, and paste exactly what it gives you — something
   like `https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view?usp=sharing` —
   straight into the `fieldMapUrl` cell. That's it — the website figures
   out the rest on its own.

Don't use Google Photos or Dropbox links for this — they don't work the
same way and the picture won't show up.

---

## Adding a venue note

Some parks already have a note on the website (things like "No dogs
allowed"). If you need to add one, change one, or a park doesn't have one
yet, put it in the `venueNotes` column on the Schedule tab, on the same
row where you first type that venue for a block — it fills down with the
rest of that block automatically (see "Save yourself the retyping,"
above). If you leave it empty, whatever's already on the website for
that venue keeps showing — nothing breaks.

This is different from the `gameNotes` column further down the row —
`venueNotes` is about the park itself and shows once for the whole
group of games there that day; `gameNotes` is about one specific game and
shows just for that one.

---

## Standings tab

Update this after each game day. Row 1 needs these column names, spelled
exactly like this:

```
season_id | division | team | wins | losses | ties | goalsFor | goalsAgainst
```

| Column | What to put there |
|---|---|
| `season_id` | Which season these standings are for — must match a `season_id` from the Seasons tab exactly, same as on the Schedule tab. |
| `division` | The age division — `8U`, `10U`, `12U`, or `14U`. |
| `team` | The team name — type it exactly as it appears on the website (see "Getting names right," above). |
| `wins` / `losses` / `ties` | Whole numbers. |
| `goalsFor` / `goalsAgainst` | Goals your team scored / goals scored against your team — whole numbers. |

Example:
```
spring-2026 | 8U | Diamonds | 3 | 1 | 0 | 20 | 10
```

One row per team, per division, per season — update the numbers as
results come in. You never need to sort this yourself; the website
always shows the current standings order (points, then goal
differential) automatically, however the rows are ordered in the sheet.

You don't need to retype `season_id` or `division` on every row either —
same as on the Schedule tab, leave either blank and it picks up whatever
was in the row above, so a block of teams in one season/division only
needs those two typed once:

```
season_id   | division | team        | wins | losses | ties | goalsFor | goalsAgainst
spring-2026 | 8U       | Diamonds    | 3    | 1      | 0    | 20       | 10
            |          | Vipers      | 2    | 1      | 1    | 18       | 12
            | 10U      | Sol Sisters | 4    | 0      | 0    | 22       | 6
```

One exception: if you're starting a new season's rows, give that first
row its own `season_id` **and** its own `division` — don't leave the
division blank there, or it'll try to inherit whatever division the
previous season's last row happened to have.

---

## It's fine to set up a season before it has games or standings

You don't have to enter everything at once. If you add a season on the
Seasons tab and mark it active before you've added any games for it, the
website won't look broken — it'll just say **"No games scheduled yet"**
in the schedule area, so people know that part's coming rather than
wondering if something's wrong.

Standings work a little differently: if there's no standings data yet
for a season, that section just **doesn't show up at all** — no message,
nothing. That's on purpose, not a bug — before anyone's played a game,
there's nothing to summarize, so the cleanest thing is for that part of
the page to simply not exist yet. It'll appear on its own as soon as you
add rows for that season to the Standings tab.

Either way, nothing you do here can show visitors a broken page — worst
case, a part of it just isn't there yet.

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

---

## Questions, or something looks wrong that isn't covered here

Reach out to whoever manages the site (the site's admin — the email
that any error notification comes from). This guide covers the normal
week-to-week workflow; anything that looks like it needs a real change
to the sheet's setup (a new column, a new venue, a new tab) is a
question for them, not something to work around here.
