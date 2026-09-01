# Seed data — Schedule & Standings sheets

Copy-paste-ready sample data for populating the two Google Sheets by hand
(no automation required — see `GOOGLE_SHEETS_SETUP.md` for that later).
Every team name, division, and field id below is checked against what's
actually valid on the site today (`/valid-values.json`), so it'll pass
validation once the automation is wired up too.

**Not real fixtures** — a plausible, made-up 2-week sample so there's
something real to look at on the site. Replace with the actual schedule
whenever it's available; delete this file once the real data's in and you
don't need a reference anymore.

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
season_id	date	time	arrival	home	away	division	field	notes
spring-2026	2026-02-07	9:00 AM	8:30 AM	Diamonds	Vipers	8U	mesquite-f2	Opening day
spring-2026	2026-02-07	9:00 AM	8:30 AM	Hawks	Hotshots	8U	mesquite-f1	
spring-2026	2026-02-07	9:45 AM	9:15 AM	Sol Sisters	Oro Valley	10U	mesquite-f2	
spring-2026	2026-02-07	9:45 AM	9:15 AM	Tukee Lightning	Chandler Lax	10U	mesquite-f3	
spring-2026	2026-02-07	10:30 AM	10:00 AM	Diamonds	Hawks	12U	mesquite-f1	
spring-2026	2026-02-07	10:30 AM	10:00 AM	East Valley Bullets	Vipers	12U	mesquite-f2	
spring-2026	2026-02-07	11:15 AM	10:45 AM	Hotshots	Tukee Lightning	14U	mesquite-f3	
spring-2026	2026-02-07	11:15 AM	10:45 AM	Chandler Lax	Sol Sisters	14U	mesquite-f1	
spring-2026	2026-02-14	9:00 AM	8:30 AM	Hawks	Diamonds	8U	mesquite-f2	
spring-2026	2026-02-14	9:00 AM	8:30 AM	Hotshots	Vipers	8U	mesquite-f1	
spring-2026	2026-02-14	9:45 AM	9:15 AM	Oro Valley	Tukee Lightning	10U	mesquite-f2	
spring-2026	2026-02-14	9:45 AM	9:15 AM	Chandler Lax	Sol Sisters	10U	mesquite-f3	
spring-2026	2026-02-14	10:30 AM	10:00 AM	Hawks	East Valley Bullets	12U	mesquite-f1	
spring-2026	2026-02-14	10:30 AM	10:00 AM	Vipers	Diamonds	12U	mesquite-f2	
spring-2026	2026-02-14	11:15 AM	10:45 AM	Tukee Lightning	Chandler Lax	14U	mesquite-f3	
spring-2026	2026-02-14	11:15 AM	10:45 AM	Sol Sisters	Hotshots	14U	mesquite-f1	
```

16 games, 2 weeks, all 4 divisions, all 9 current teams appear at least
once. `field` uses `mesquite-f1`/`f2`/`f3` (the three Mesquite HS fields) —
swap in other valid ids from `/valid-values.json` if games are actually
elsewhere.

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
8U	Diamonds	2	0	0	14	6
8U	Hawks	1	1	0	9	8
8U	Vipers	1	1	0	7	9
8U	Hotshots	0	2	0	4	11
10U	Sol Sisters	2	0	0	12	5
10U	Oro Valley	1	0	1	8	6
10U	Tukee Lightning	0	1	1	6	8
10U	Chandler Lax	0	2	0	5	12
12U	Hawks	2	0	0	15	7
12U	Diamonds	1	1	0	10	9
12U	Vipers	1	1	0	9	10
12U	East Valley Bullets	0	2	0	6	14
14U	Tukee Lightning	2	0	0	11	6
14U	Chandler Lax	1	1	0	9	9
14U	Sol Sisters	1	1	0	8	8
14U	Hotshots	0	2	0	5	10
```

These numbers are consistent with the schedule above (each team's W/L/T
reflects its 2 games there) — not that it matters for validation, just
so it doesn't look obviously fake if someone cross-checks.
