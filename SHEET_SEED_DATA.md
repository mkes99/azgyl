# Seed data — Schedule & Standings sheets

Copy-paste-ready sample data for populating the two Google Sheets by hand
(no automation required — see `GOOGLE_SHEETS_SETUP.md` for that later).
Every team name, division, and venue id below is checked against what's
actually valid on the site today (`/valid-values.json`), so it'll pass
validation once the automation is wired up too. `field` is plain
descriptive text (not validated) — see "How games get grouped by venue
on the site" in `GOOGLE_SHEETS_SETUP.md` for how `venue`/`field` work.

**`season_id`, `date`, `venue`, and `division` are left blank wherever
they'd just repeat the row above** — see "Leave repeated cells blank" in
`GOOGLE_SHEETS_SETUP.md`. This is exactly the pattern to follow when
entering the real schedule: type (or paste) a value once at the top of a
block of games that share it, leave it blank for the rest of that block.

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
season_id	date	time	arrival	home	away	division	venue	field	notes	fieldMapUrl
spring-2026	2026-02-07	9:00 AM	8:30 AM	Diamonds	Vipers	8U	mesquite	Field 1	Opening day	
		9:00 AM	8:30 AM	Hawks	Hotshots			Field 1		
		9:45 AM	9:15 AM	Sol Sisters	Oro Valley	10U		Field 1		
		9:45 AM	9:15 AM	Tukee Lightning	Chandler Lax			Field 1		
		10:30 AM	10:00 AM	Diamonds	Hawks	12U		Field 1		
		10:30 AM	10:00 AM	East Valley Bullets	Vipers			Field 1		
		11:15 AM	10:45 AM	Hotshots	Tukee Lightning	14U		Field 1		
		11:15 AM	10:45 AM	Chandler Lax	Sol Sisters			Field 1		
	2026-02-14	9:00 AM	8:30 AM	Hawks	Diamonds	8U	naranja-park	Field 4		
		9:00 AM	8:30 AM	Hotshots	Vipers			Field 4		
		9:45 AM	9:15 AM	Oro Valley	Tukee Lightning	10U		Field 4		
		9:45 AM	9:15 AM	Chandler Lax	Sol Sisters			Field 4		
		10:30 AM	10:00 AM	Hawks	East Valley Bullets	12U		Field 4		
		10:30 AM	10:00 AM	Vipers	Diamonds			Field 4		
		11:15 AM	10:45 AM	Tukee Lightning	Chandler Lax	14U		Field 4		
		11:15 AM	10:45 AM	Sol Sisters	Hotshots			Field 4		
	2026-02-21	9:00 AM	8:30 AM	Vipers	Hawks	8U	mesquite	Field 3		
		9:00 AM	8:30 AM	Diamonds	Hotshots			Field 3		
		9:45 AM	9:15 AM	Sol Sisters	Tukee Lightning	10U		Field 3		
		9:45 AM	9:15 AM	Oro Valley	Chandler Lax			Field 3		
		10:30 AM	10:00 AM	Diamonds	East Valley Bullets	12U		Field 3		
		10:30 AM	10:00 AM	Hawks	Vipers			Field 3	Rescheduled from 2/14	
		11:15 AM	10:45 AM	Hotshots	Chandler Lax	14U		Field 3	Picture day — arrive 30 min early	
		11:15 AM	10:45 AM	Tukee Lightning	Sol Sisters			Field 3		
	2026-02-28	9:00 AM	8:30 AM	Hawks	Vipers	8U	chuparosa	Chuparosa Field		
		9:00 AM	8:30 AM	Hotshots	Diamonds			Chuparosa Field		
		9:45 AM	9:15 AM	Chandler Lax	Oro Valley	10U		Chuparosa Field		
		9:45 AM	9:15 AM	Tukee Lightning	Sol Sisters			Chuparosa Field	Makeup game	
		10:30 AM	10:00 AM	East Valley Bullets	Hawks	12U		Chuparosa Field		
		10:30 AM	10:00 AM	Vipers	Diamonds			Chuparosa Field		
		11:15 AM	10:45 AM	Sol Sisters	Tukee Lightning	14U		Chuparosa Field		
		11:15 AM	10:45 AM	Chandler Lax	Hotshots			Chuparosa Field	Senior night	
	2026-03-07	9:00 AM	8:30 AM	Diamonds	Hawks	8U	mohave	Mohave		
		9:00 AM	8:30 AM	Vipers	Hotshots			Mohave	Bring extra water — high heat forecast	
		9:45 AM	9:15 AM	Oro Valley	Sol Sisters	10U		Mohave		
		9:45 AM	9:15 AM	Chandler Lax	Tukee Lightning			Mohave		
		10:30 AM	10:00 AM	Hawks	Diamonds	12U		Mohave		
		10:30 AM	10:00 AM	East Valley Bullets	Vipers			Mohave		
		11:15 AM	10:45 AM	Tukee Lightning	Hotshots	14U		Mohave		
		11:15 AM	10:45 AM	Sol Sisters	Chandler Lax			Mohave	Regular season finale	
```

40 games, 5 weeks (Feb 7 – Mar 7), all 4 divisions, all 9 current teams —
each team plays 5 games in its division. 7 of the 40 rows have a `notes`
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

Every venue in `venues.ts` currently has a note — venue notes and per-game
`notes` are independent either way: venue notes sit behind a click-to-open
"Notes" button next to the venue heading (once per day, not per row); game
notes show inline under each matchup. Swap in other valid ids from
`/valid-values.json` if games are actually elsewhere.

---

## Standings sheet

The standings automation isn't built yet (`STANDINGS_CSV_URL` in
`standings.ts` is still an unused placeholder — see the note at the top of
`STANDINGS_SETUP.md`). This sheet is for reference/editing convenience
only right now; to actually show these numbers on the site, copy them into
the `localStandings` array in `src/data/standings.ts` by hand. Column
format matches what `STANDINGS_SETUP.md` already documents — no
`season_id` column, since the current standings code doesn't group by
season yet.

```
division	team	W	L	T	GF	GA
8U	Diamonds	4	1	0	32	14
8U	Hawks	3	2	0	24	20
8U	Vipers	2	3	0	19	23
8U	Hotshots	1	4	0	13	31
10U	Sol Sisters	4	1	0	28	12
10U	Oro Valley	3	1	1	22	15
10U	Tukee Lightning	2	2	1	18	19
10U	Chandler Lax	0	5	0	9	31
12U	Hawks	4	1	0	30	16
12U	Diamonds	3	2	0	26	21
12U	Vipers	2	3	0	20	25
12U	East Valley Bullets	1	4	0	15	29
14U	Tukee Lightning	4	0	1	29	13
14U	Chandler Lax	2	2	1	21	20
14U	Sol Sisters	2	3	0	18	22
14U	Hotshots	1	4	0	14	27
```

Each row's W+L+T sums to 5 — consistent with the 5-week schedule above —
not that it matters for validation, just so it doesn't look obviously fake
if someone cross-checks.
