# Seed data — Schedule & Standings tabs

Copy-paste-ready sample data for populating the sheet's tabs by hand (no
automation required — see `GOOGLE_SHEETS_SETUP.md` for that later). One
Google Sheet, several tabs — not two separate spreadsheets. Every team
name, division, and venue id below is checked against what's actually
valid on the site today (`/valid-values.json`), so it'll pass validation
once the automation is wired up too. `field` is plain descriptive text
(not validated) — see "How games get grouped by venue on the site" in
`GOOGLE_SHEETS_SETUP.md` for how `venue`/`field` work.

**`season_id`, `date`, `venue`, `fieldMapUrl`, `venueNotes`, and
`division` are left blank wherever they'd just repeat the row above** on
the Schedule tab, and **`season_id`/`division`** the same way on the
Standings tab — see "Leave repeated cells blank" in
`GOOGLE_SHEETS_SETUP.md`. This is exactly the pattern to follow when
entering real data: type (or paste) a value once at the top of a block
that shares it, leave it blank for the rest of that block.

**Not real fixtures** — a plausible, made-up 5-week sample, enough to
actually exercise the `/league` page's division and week filters (2 weeks
wasn't enough to show the Week filter doing anything). Replace with the
actual schedule whenever it's available; delete this file once the real
data's in and you don't need a reference anymore.

**How to paste this in:** click cell A1 on the tab, then copy everything
inside the fenced code block below (the whole block, header row included)
and paste. Google Sheets splits tab-separated text into columns
automatically — just make sure you copy from a plain-text view (not a
rendered preview that might collapse the tabs into spaces).

---

## Schedule sheet — `Seasons` tab

```
season_id	name	type	active	startDate	endDate
spring-2026	Spring 2026	season	TRUE	2026-02-07	2026-04-11
```

---

## Schedule sheet — `Schedule` tab

```
season_id	date	venue	fieldMapUrl	venueNotes	division	time	arrival	home	away	field	gameNotes
spring-2026	2026-02-07	mesquite		No dogs allowed. Field 3 has a busted pipe near the edge — wet area, avoid that section (field shifted to compensate).	8U	9:00 AM	8:30 AM	Diamonds	Vipers	Field 1	Opening day
						9:00 AM	8:30 AM	Hawks	Hotshots	Field 1	
					10U	9:45 AM	9:15 AM	Sol Sisters	Oro Valley	Field 1	
						9:45 AM	9:15 AM	Tukee Lightning	Chandler Lax	Field 1	
					12U	10:30 AM	10:00 AM	Diamonds	Hawks	Field 1	
						10:30 AM	10:00 AM	East Valley Bullets	Vipers	Field 1	
					14U	11:15 AM	10:45 AM	Hotshots	Tukee Lightning	Field 1	
						11:15 AM	10:45 AM	Chandler Lax	Sol Sisters	Field 1	
	2026-02-14	naranja-park		Field 4 for 10U–14U. Chuparosa Park used for 8U.	8U	9:00 AM	8:30 AM	Hawks	Diamonds	Field 4	
						9:00 AM	8:30 AM	Hotshots	Vipers	Field 4	
					10U	9:45 AM	9:15 AM	Oro Valley	Tukee Lightning	Field 4	
						9:45 AM	9:15 AM	Chandler Lax	Sol Sisters	Field 4	
					12U	10:30 AM	10:00 AM	Hawks	East Valley Bullets	Field 4	
						10:30 AM	10:00 AM	Vipers	Diamonds	Field 4	
					14U	11:15 AM	10:45 AM	Tukee Lightning	Chandler Lax	Field 4	
						11:15 AM	10:45 AM	Sol Sisters	Hotshots	Field 4	
	2026-02-21	mesquite		No dogs allowed. Field 3 has a busted pipe near the edge — wet area, avoid that section (field shifted to compensate).	8U	9:00 AM	8:30 AM	Vipers	Hawks	Field 3	
						9:00 AM	8:30 AM	Diamonds	Hotshots	Field 3	
					10U	9:45 AM	9:15 AM	Sol Sisters	Tukee Lightning	Field 3	
						9:45 AM	9:15 AM	Oro Valley	Chandler Lax	Field 3	
					12U	10:30 AM	10:00 AM	Diamonds	East Valley Bullets	Field 3	
						10:30 AM	10:00 AM	Hawks	Vipers	Field 3	Rescheduled from 2/14
					14U	11:15 AM	10:45 AM	Hotshots	Chandler Lax	Field 3	Picture day — arrive 30 min early
						11:15 AM	10:45 AM	Tukee Lightning	Sol Sisters	Field 3	
	2026-02-28	chuparosa		Used for 8U games on Oro Valley host weekends.	8U	9:00 AM	8:30 AM	Hawks	Vipers	Chuparosa Field	
						9:00 AM	8:30 AM	Hotshots	Diamonds	Chuparosa Field	
					10U	9:45 AM	9:15 AM	Chandler Lax	Oro Valley	Chuparosa Field	
						9:45 AM	9:15 AM	Tukee Lightning	Sol Sisters	Chuparosa Field	Makeup game
					12U	10:30 AM	10:00 AM	East Valley Bullets	Hawks	Chuparosa Field	
						10:30 AM	10:00 AM	Vipers	Diamonds	Chuparosa Field	
					14U	11:15 AM	10:45 AM	Sol Sisters	Tukee Lightning	Chuparosa Field	
						11:15 AM	10:45 AM	Chandler Lax	Hotshots	Chuparosa Field	Senior night
	2026-03-07	mohave		3–4 fields. AZGL-hosted games.	8U	9:00 AM	8:30 AM	Diamonds	Hawks	Mohave	
						9:00 AM	8:30 AM	Vipers	Hotshots	Mohave	Bring extra water — high heat forecast
					10U	9:45 AM	9:15 AM	Oro Valley	Sol Sisters	Mohave	
						9:45 AM	9:15 AM	Chandler Lax	Tukee Lightning	Mohave	
					12U	10:30 AM	10:00 AM	Hawks	Diamonds	Mohave	
						10:30 AM	10:00 AM	East Valley Bullets	Vipers	Mohave	
					14U	11:15 AM	10:45 AM	Tukee Lightning	Hotshots	Mohave	
						11:15 AM	10:45 AM	Sol Sisters	Chandler Lax	Mohave	Regular season finale
```

40 games, 5 weeks (Feb 7 – Mar 7), all 4 divisions, all 9 current teams —
each team plays 5 games in its division. 7 of the 40 rows have a `gameNotes`
value (opening day, a reschedule, picture day, a makeup game, senior
night, a heat-safety reminder, the finale) — realistic density rather than
every row, so it's obvious which games are actually flagged rather than
just noise.

**One venue per week, not mixed within a date** — the whole league plays
at one place each Saturday, like a real host-site schedule, rather than
divisions scattered across different venues on the same day:

| Date | Venue | Has a venue note (click "Notes" to read)? |
|---|---|---|
| 2/7 | `mesquite` | Yes — "No dogs allowed. Field 3 has a busted pipe near the edge..." |
| 2/14 | `naranja-park` | Yes — "Field 4 for 10U–14U. Chuparosa Park used for 8U." |
| 2/21 | `mesquite` | Yes — same note as 2/7 (one note per venue, not per field) |
| 2/28 | `chuparosa` | Yes — "Used for 8U games on Oro Valley host weekends." |
| 3/7 | `mohave` | Yes — "3–4 fields. AZGL-hosted games." |

Every venue in `venues.ts` currently has a note hardcoded as its default —
the seed data's `venueNotes` cell on each block's first row happens to
repeat that same text, just to demonstrate filling the column in with a
real example; leaving it blank would show the exact same note, inherited
from `venues.ts` instead. Venue notes and per-game `gameNotes` are
independent either way: venue notes sit behind a click-to-open "Notes"
button next to the venue heading (once per day, not per row); game notes
show inline under each matchup. Swap in other valid ids from
`/valid-values.json` if games are actually elsewhere.

---

## Standings sheet

Same spreadsheet as `Seasons`/`Schedule` — a `Standings` tab, with
`season_id` linking each row to a season the same way `Schedule` rows do.
Paste this into the `Standings` tab the same way as the other two.

```
season_id	division	team	wins	losses	ties	goalsFor	goalsAgainst
spring-2026	8U	Diamonds	4	1	0	32	14
		Hawks	3	2	0	24	20
		Vipers	2	3	0	19	23
		Hotshots	1	4	0	13	31
	10U	Sol Sisters	4	1	0	28	12
		Oro Valley	3	1	1	22	15
		Tukee Lightning	2	2	1	18	19
		Chandler Lax	0	5	0	9	31
	12U	Hawks	4	1	0	30	16
		Diamonds	3	2	0	26	21
		Vipers	2	3	0	20	25
		East Valley Bullets	1	4	0	15	29
	14U	Tukee Lightning	4	0	1	29	13
		Chandler Lax	2	2	1	21	20
		Sol Sisters	2	3	0	18	22
		Hotshots	1	4	0	14	27
```

`season_id` and `division` are left blank wherever they'd just repeat
the row above, same cascading convention as the Schedule tab above —
only the first row of the whole block, and the first row of each new
division, needs them typed out.

Each row's wins+losses+ties sums to 5 — consistent with the 5-week schedule above —
not that it matters for validation, just so it doesn't look obviously fake
if someone cross-checks. If you'd rather skip the Sheet for standings
entirely: leave `STANDINGS_CSV_URL` empty in `standings.ts` and edit the
`localStandings` array there directly instead — same optional pattern as
the schedule.
