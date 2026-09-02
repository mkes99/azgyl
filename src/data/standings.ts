// ─────────────────────────────────────────────────────────────────────────
// STANDINGS DATA  ·  src/data/standings.ts
// ─────────────────────────────────────────────────────────────────────────
//
// Sourced from the same Google Sheet as the schedule — see
// GOOGLE_SHEETS_SETUP.md — as a `Standings` tab alongside `Seasons` and
// `Schedule`:
//
//   Standings tab: season_id | division | team | wins | losses | ties | goalsFor | goalsAgainst
//                  One row per team per division per season. `season_id`
//                  must match a `season_id` from the `Seasons` tab — same
//                  linkage as `Schedule` rows use, so multiple seasons'
//                  standings can coexist without one overwriting another.
//                  `team` must match a name in teams.ts; `division` must
//                  be one a team actually plays in. `wins`, `losses`,
//                  `ties`, `goalsFor`, and `goalsAgainst` are whole
//                  numbers — leave a cell blank for 0.
//
//                  `season_id` and `division` cascade the same way as on
//                  the Schedule tab (see fillDown() below) — a block of
//                  teams in the same season/division only needs those two
//                  typed once, at the top. `division` is scoped to the
//                  season block: a row with its own explicit `season_id`
//                  starts a new block and resets the cached division, so
//                  a new season's first row can't silently inherit the
//                  previous season's division.
//
// Leave STANDINGS_CSV_URL empty to use localStandings below instead (no
// Sheet needed) — same empty-by-default pattern as SEASONS_CSV_URL/
// SCHEDULE_CSV_URL in schedule.ts. Validated and fetched at build time,
// same fail-loud approach as the schedule: a bad row throws, which fails
// the build, and Cloudflare keeps serving the last good deploy rather
// than publishing bad data.
// ─────────────────────────────────────────────────────────────────────────

import { fetchCSV, pickCsvUrl } from '@/lib/csv';
import { teams } from './teams';
import { scheduleEvents } from './schedule';

// See the comment on SEASONS_CSV_URL in schedule.ts — same DEPLOY_ENV
// selection, same reason.
export const STANDINGS_CSV_URL = pickCsvUrl(
  '', // production — set once the real production sheet exists
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRlfvb_sVH8F0Uu0QgD5u19TSi5PAhid4y_TQzPY0qbV58CitwRfj4vzrBwBSOZUFO4TqJW9zc5CDV_/pub?gid=616344644&single=true&output=csv', // preview
);

export interface StandingRow {
  team:         string;
  wins:         number;
  losses:       number;
  ties:         number;
  goalsFor:     number;
  goalsAgainst: number;
}

export interface DivisionStandings {
  division: string;
  rows:     StandingRow[];
}

export interface EventStandings {
  eventId:   string;  // must match an id in schedule.ts
  eventName: string;
  divisions: DivisionStandings[];
}

// ── LOCAL STANDINGS — used only when STANDINGS_CSV_URL is empty ───────────

export const localStandings: EventStandings[] = [
  {
    eventId:   'spring-2026',
    eventName: 'Spring 2026',
    divisions: [
      {
        division: '8U',
        rows: [
          { team:'Vipers',                wins:1, losses:0, ties:0, goalsFor:8,  goalsAgainst:1  },
          { team:'Diamonds',              wins:1, losses:0, ties:0, goalsFor:6,  goalsAgainst:3  },
          { team:'Hotshots/Chandler/Oro', wins:1, losses:0, ties:0, goalsFor:5,  goalsAgainst:2  },
          { team:'Tukee Lightning 2',     wins:0, losses:2, ties:0, goalsFor:5,  goalsAgainst:11 },
          { team:'Tukee Lightning 1',     wins:0, losses:1, ties:0, goalsFor:1,  goalsAgainst:8  },
        ],
      },
      {
        division: '10U',
        rows: [
          { team:'Diamonds',              wins:2, losses:0, ties:0, goalsFor:14, goalsAgainst:4  },
          { team:'Vipers',                wins:2, losses:0, ties:0, goalsFor:12, goalsAgainst:8  },
          { team:'Tukee Lightning 1',     wins:1, losses:1, ties:0, goalsFor:10, goalsAgainst:8  },
          { team:'Chandler/Sol Sisters',  wins:0, losses:1, ties:1, goalsFor:7,  goalsAgainst:10 },
          { team:'Tukee Lightning 2',     wins:0, losses:1, ties:1, goalsFor:6,  goalsAgainst:9  },
          { team:'Hotshots',              wins:0, losses:2, ties:0, goalsFor:6,  goalsAgainst:16 },
        ],
      },
      {
        division: '12U',
        rows: [
          { team:'Diamonds',              wins:2, losses:0, ties:0, goalsFor:12, goalsAgainst:8  },
          { team:'Vipers',                wins:1, losses:0, ties:1, goalsFor:8,  goalsAgainst:6  },
          { team:'Hawks',                 wins:1, losses:1, ties:0, goalsFor:11, goalsAgainst:7  },
          { team:'Oro Valley',            wins:1, losses:1, ties:0, goalsFor:11, goalsAgainst:9  },
          { team:'Marana Reapers',        wins:0, losses:1, ties:1, goalsFor:7,  goalsAgainst:9  },
          { team:'Tukee Lightning',       wins:0, losses:2, ties:0, goalsFor:5,  goalsAgainst:15 },
        ],
      },
      {
        division: '14U',
        rows: [
          { team:'Hawks',                 wins:2, losses:0, ties:0, goalsFor:11, goalsAgainst:7  },
          { team:'Vipers/Diamonds',       wins:1, losses:0, ties:1, goalsFor:6,  goalsAgainst:3  },
          { team:'Hotshots',              wins:1, losses:1, ties:0, goalsFor:10, goalsAgainst:10 },
          { team:'Tukee Lightning 1',     wins:1, losses:1, ties:0, goalsFor:9,  goalsAgainst:7  },
          { team:'Chandler Lax',          wins:1, losses:1, ties:0, goalsFor:7,  goalsAgainst:9  },
          { team:'Tukee Lightning 2',     wins:0, losses:1, ties:1, goalsFor:5,  goalsAgainst:7  },
          { team:'East Valley Bullets',   wins:0, losses:2, ties:0, goalsFor:3,  goalsAgainst:8  },
        ],
      },
    ],
  },
];

// ── SHEET PARSING ──────────────────────────────────────────────────────────

// Blank means 0 (a team that hasn't played yet) — anything else has to be
// a real non-negative number, or it's a validation error.
function parseStat(raw: string): number | null {
  if (raw === '') return 0;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

// A blank `season_id` or `division` cell inherits whatever was in the row
// above it, same fill-down convenience as the Schedule tab — lets a block
// of teams in one season/division be typed without repeating those two
// values on every row. `division` is block-scoped to `season_id`: the
// moment a row gives its own explicit `season_id` (a new season's block
// starting), the cached division resets, so it can't reach back into the
// PREVIOUS season's block for a division it left blank.
function fillDown(rows: Record<string, string>[]): Record<string, string>[] {
  let lastSeasonId = '';
  let lastDivision = '';
  return rows.map(row => {
    const filled = { ...row };
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

function buildStandings(rows: Record<string, string>[]): EventStandings[] {
  const errors: string[] = [];
  const teamNames = new Set(teams.map(t => t.name));
  const validDivisions = new Set(teams.flatMap(t => t.divisions));
  const eventsById = new Map(scheduleEvents.map(e => [e.id, e]));

  rows = fillDown(rows);

  // eventId -> division -> rows
  const byEvent = new Map<string, Map<string, StandingRow[]>>();

  rows.forEach((row, i) => {
    const rowNum = i + 2; // header is row 1
    const seasonId = row.season_id;
    if (!seasonId) { errors.push(`Standings row ${rowNum}: missing season_id`); return; }
    if (!eventsById.has(seasonId)) { errors.push(`Standings row ${rowNum}: season_id "${seasonId}" doesn't match any Seasons row`); return; }

    if (!row.division) errors.push(`Standings row ${rowNum}: missing division`);
    else if (!validDivisions.has(row.division)) errors.push(`Standings row ${rowNum}: division "${row.division}" isn't used by any team in teams.ts`);

    if (!row.team) errors.push(`Standings row ${rowNum}: missing team`);
    else if (!teamNames.has(row.team)) errors.push(`Standings row ${rowNum}: team "${row.team}" doesn't match a name in teams.ts`);

    const stats = { wins: parseStat(row.wins), losses: parseStat(row.losses), ties: parseStat(row.ties), goalsFor: parseStat(row.goalsFor), goalsAgainst: parseStat(row.goalsAgainst) };
    for (const [key, val] of Object.entries(stats)) {
      if (val === null) errors.push(`Standings row ${rowNum}: ${key} "${row[key as keyof typeof row]}" isn't a valid non-negative number`);
    }

    if (!byEvent.has(seasonId)) byEvent.set(seasonId, new Map());
    const divisions = byEvent.get(seasonId)!;
    if (!divisions.has(row.division)) divisions.set(row.division, []);
    divisions.get(row.division)!.push({
      team:         row.team,
      wins:         stats.wins ?? 0,
      losses:       stats.losses ?? 0,
      ties:         stats.ties ?? 0,
      goalsFor:     stats.goalsFor ?? 0,
      goalsAgainst: stats.goalsAgainst ?? 0,
    });
  });

  if (errors.length) {
    throw new Error(
      `[standings.ts] ${errors.length} problem(s) in the standings sheet — fix these and rebuild:\n` +
      errors.map(e => ` - ${e}`).join('\n')
    );
  }

  return [...byEvent.entries()].map(([eventId, divisions]) => ({
    eventId,
    eventName: eventsById.get(eventId)?.name ?? eventId,
    divisions: [...divisions.entries()].map(([division, rows]) => ({ division, rows })),
  }));
}

export const standings: EventStandings[] = STANDINGS_CSV_URL
  ? buildStandings(await fetchCSV(STANDINGS_CSV_URL, 'standings.ts', 'Standings'))
  : localStandings;

// ── HELPERS ────────────────────────────────────────────────────────────────
export function sortedRows(rows: StandingRow[]) {
  return [...rows].sort((a, b) => {
    const pa = a.wins * 3 + a.ties;
    const pb = b.wins * 3 + b.ties;
    return pb !== pa ? pb - pa : (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst);
  });
}
