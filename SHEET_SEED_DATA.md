# Seed data — Schedule & Standings sheets

Copy-paste-ready sample data for populating the two Google Sheets by hand
(no automation required — see `GOOGLE_SHEETS_SETUP.md` for that later).
Every team name, division, and field id below is checked against what's
actually valid on the site today (`/valid-values.json`), so it'll pass
validation once the automation is wired up too.

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
season_id	date	time	arrival	home	away	division	field	notes
spring-2026	2026-02-07	9:00 AM	8:30 AM	Diamonds	Vipers	8U	mesquite-f1	Opening day
spring-2026	2026-02-07	9:00 AM	8:30 AM	Hawks	Hotshots	8U	mesquite-f1	
spring-2026	2026-02-07	9:45 AM	9:15 AM	Sol Sisters	Oro Valley	10U	mesquite-f1	
spring-2026	2026-02-07	9:45 AM	9:15 AM	Tukee Lightning	Chandler Lax	10U	mesquite-f1	
spring-2026	2026-02-07	10:30 AM	10:00 AM	Diamonds	Hawks	12U	mesquite-f1	
spring-2026	2026-02-07	10:30 AM	10:00 AM	East Valley Bullets	Vipers	12U	mesquite-f1	
spring-2026	2026-02-07	11:15 AM	10:45 AM	Hotshots	Tukee Lightning	14U	mesquite-f1	
spring-2026	2026-02-07	11:15 AM	10:45 AM	Chandler Lax	Sol Sisters	14U	mesquite-f1	
spring-2026	2026-02-14	9:00 AM	8:30 AM	Hawks	Diamonds	8U	naranja-park	
spring-2026	2026-02-14	9:00 AM	8:30 AM	Hotshots	Vipers	8U	naranja-park	
spring-2026	2026-02-14	9:45 AM	9:15 AM	Oro Valley	Tukee Lightning	10U	naranja-park	
spring-2026	2026-02-14	9:45 AM	9:15 AM	Chandler Lax	Sol Sisters	10U	naranja-park	
spring-2026	2026-02-14	10:30 AM	10:00 AM	Hawks	East Valley Bullets	12U	naranja-park	
spring-2026	2026-02-14	10:30 AM	10:00 AM	Vipers	Diamonds	12U	naranja-park	
spring-2026	2026-02-14	11:15 AM	10:45 AM	Tukee Lightning	Chandler Lax	14U	naranja-park	
spring-2026	2026-02-14	11:15 AM	10:45 AM	Sol Sisters	Hotshots	14U	naranja-park	
spring-2026	2026-02-21	9:00 AM	8:30 AM	Vipers	Hawks	8U	mesquite-f3	
spring-2026	2026-02-21	9:00 AM	8:30 AM	Diamonds	Hotshots	8U	mesquite-f3	
spring-2026	2026-02-21	9:45 AM	9:15 AM	Sol Sisters	Tukee Lightning	10U	mesquite-f3	
spring-2026	2026-02-21	9:45 AM	9:15 AM	Oro Valley	Chandler Lax	10U	mesquite-f3	
spring-2026	2026-02-21	10:30 AM	10:00 AM	Diamonds	East Valley Bullets	12U	mesquite-f3	
spring-2026	2026-02-21	10:30 AM	10:00 AM	Hawks	Vipers	12U	mesquite-f3	Rescheduled from 2/14
spring-2026	2026-02-21	11:15 AM	10:45 AM	Hotshots	Chandler Lax	14U	mesquite-f3	Picture day — arrive 30 min early
spring-2026	2026-02-21	11:15 AM	10:45 AM	Tukee Lightning	Sol Sisters	14U	mesquite-f3	
spring-2026	2026-02-28	9:00 AM	8:30 AM	Hawks	Vipers	8U	chuparosa	
spring-2026	2026-02-28	9:00 AM	8:30 AM	Hotshots	Diamonds	8U	chuparosa	
spring-2026	2026-02-28	9:45 AM	9:15 AM	Chandler Lax	Oro Valley	10U	chuparosa	
spring-2026	2026-02-28	9:45 AM	9:15 AM	Tukee Lightning	Sol Sisters	10U	chuparosa	Makeup game
spring-2026	2026-02-28	10:30 AM	10:00 AM	East Valley Bullets	Hawks	12U	chuparosa	
spring-2026	2026-02-28	10:30 AM	10:00 AM	Vipers	Diamonds	12U	chuparosa	
spring-2026	2026-02-28	11:15 AM	10:45 AM	Sol Sisters	Tukee Lightning	14U	chuparosa	
spring-2026	2026-02-28	11:15 AM	10:45 AM	Chandler Lax	Hotshots	14U	chuparosa	Senior night
spring-2026	2026-03-07	9:00 AM	8:30 AM	Diamonds	Hawks	8U	mohave	
spring-2026	2026-03-07	9:00 AM	8:30 AM	Vipers	Hotshots	8U	mohave	Bring extra water — high heat forecast
spring-2026	2026-03-07	9:45 AM	9:15 AM	Oro Valley	Sol Sisters	10U	mohave	
spring-2026	2026-03-07	9:45 AM	9:15 AM	Chandler Lax	Tukee Lightning	10U	mohave	
spring-2026	2026-03-07	10:30 AM	10:00 AM	Hawks	Diamonds	12U	mohave	
spring-2026	2026-03-07	10:30 AM	10:00 AM	East Valley Bullets	Vipers	12U	mohave	
spring-2026	2026-03-07	11:15 AM	10:45 AM	Tukee Lightning	Hotshots	14U	mohave	
spring-2026	2026-03-07	11:15 AM	10:45 AM	Sol Sisters	Chandler Lax	14U	mohave	Regular season finale
```

40 games, 5 weeks (Feb 7 – Mar 7), all 4 divisions, all 9 current teams —
each team plays 5 games in its division. 8 of the 40 rows have a `notes`
value (opening day, a reschedule, picture day, a makeup game, senior
night, a heat-safety reminder, the finale) — realistic density rather than
every row, so it's obvious which games are actually flagged rather than
just noise.

**One field (venue) per week, not mixed within a date** — the whole league
plays at one place each Saturday, like a real host-site schedule, rather
than divisions scattered across different venues on the same day:

| Date | Field | Has a ⚠️ field warning? |
|---|---|---|
| 2/7 | `mesquite-f1` | Yes — "NO DOGS ALLOWED" |
| 2/14 | `naranja-park` | No |
| 2/21 | `mesquite-f3` | Yes — "NO DOGS ALLOWED" + wet-area note |
| 2/28 | `chuparosa` | No |
| 3/7 | `mohave` | No |

That mix means the schedule now demonstrates both note systems as
genuinely independent: some weeks show the field-warning icon, some show
game notes, one week (2/21) shows both on the same date, and some rows
show neither. Swap in other valid ids from `/valid-values.json` if games
are actually elsewhere.

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
