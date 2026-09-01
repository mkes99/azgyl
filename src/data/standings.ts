// ─────────────────────────────────────────────────────────────────────────
// STANDINGS DATA  ·  src/data/standings.ts
// ─────────────────────────────────────────────────────────────────────────
//
// Sourced from the same Google Sheet as the schedule — see
// GOOGLE_SHEETS_SETUP.md — as a `Standings` tab alongside `Seasons` and
// `Schedule`:
//
//   Standings tab: season_id | division | team | W | L | T | GF | GA
//                  One row per team per division per season. `season_id`
//                  must match a `season_id` from the `Seasons` tab — same
//                  linkage as `Schedule` rows use, so multiple seasons'
//                  standings can coexist without one overwriting another.
//                  `team` must match a name in teams.ts; `division` must
//                  be one a team actually plays in. `W`/`L`/`T`/`GF`/`GA`
//                  are whole numbers — leave a cell blank for 0.
//
// Leave STANDINGS_CSV_URL empty to use localStandings below instead (no
// Sheet needed) — same empty-by-default pattern as SEASONS_CSV_URL/
// SCHEDULE_CSV_URL in schedule.ts. Validated and fetched at build time,
// same fail-loud approach as the schedule: a bad row throws, which fails
// the build, and Cloudflare keeps serving the last good deploy rather
// than publishing bad data.
// ─────────────────────────────────────────────────────────────────────────

import { fetchCSV } from '@/lib/csv';
import { teams } from './teams';
import { scheduleEvents } from './schedule';

export const STANDINGS_CSV_URL = '';
// Example: 'https://docs.google.com/spreadsheets/d/YOUR_ID/gviz/tq?tqx=out:csv&sheet=Standings'

export interface StandingRow {
  team: string;
  W:    number;
  L:    number;
  T:    number;
  GF:   number;
  GA:   number;
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
          { team:'Vipers',                W:1, L:0, T:0, GF:8,  GA:1  },
          { team:'Diamonds',              W:1, L:0, T:0, GF:6,  GA:3  },
          { team:'Hotshots/Chandler/Oro', W:1, L:0, T:0, GF:5,  GA:2  },
          { team:'Tukee Lightning 2',     W:0, L:2, T:0, GF:5,  GA:11 },
          { team:'Tukee Lightning 1',     W:0, L:1, T:0, GF:1,  GA:8  },
        ],
      },
      {
        division: '10U',
        rows: [
          { team:'Diamonds',              W:2, L:0, T:0, GF:14, GA:4  },
          { team:'Vipers',                W:2, L:0, T:0, GF:12, GA:8  },
          { team:'Tukee Lightning 1',     W:1, L:1, T:0, GF:10, GA:8  },
          { team:'Chandler/Sol Sisters',  W:0, L:1, T:1, GF:7,  GA:10 },
          { team:'Tukee Lightning 2',     W:0, L:1, T:1, GF:6,  GA:9  },
          { team:'Hotshots',              W:0, L:2, T:0, GF:6,  GA:16 },
        ],
      },
      {
        division: '12U',
        rows: [
          { team:'Diamonds',              W:2, L:0, T:0, GF:12, GA:8  },
          { team:'Vipers',                W:1, L:0, T:1, GF:8,  GA:6  },
          { team:'Hawks',                 W:1, L:1, T:0, GF:11, GA:7  },
          { team:'Oro Valley',            W:1, L:1, T:0, GF:11, GA:9  },
          { team:'Marana Reapers',        W:0, L:1, T:1, GF:7,  GA:9  },
          { team:'Tukee Lightning',       W:0, L:2, T:0, GF:5,  GA:15 },
        ],
      },
      {
        division: '14U',
        rows: [
          { team:'Hawks',                 W:2, L:0, T:0, GF:11, GA:7  },
          { team:'Vipers/Diamonds',       W:1, L:0, T:1, GF:6,  GA:3  },
          { team:'Hotshots',              W:1, L:1, T:0, GF:10, GA:10 },
          { team:'Tukee Lightning 1',     W:1, L:1, T:0, GF:9,  GA:7  },
          { team:'Chandler Lax',          W:1, L:1, T:0, GF:7,  GA:9  },
          { team:'Tukee Lightning 2',     W:0, L:1, T:1, GF:5,  GA:7  },
          { team:'East Valley Bullets',   W:0, L:2, T:0, GF:3,  GA:8  },
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

function buildStandings(rows: Record<string, string>[]): EventStandings[] {
  const errors: string[] = [];
  const teamNames = new Set(teams.map(t => t.name));
  const validDivisions = new Set(teams.flatMap(t => t.divisions));
  const eventsById = new Map(scheduleEvents.map(e => [e.id, e]));

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

    const stats = { W: parseStat(row.W), L: parseStat(row.L), T: parseStat(row.T), GF: parseStat(row.GF), GA: parseStat(row.GA) };
    for (const [key, val] of Object.entries(stats)) {
      if (val === null) errors.push(`Standings row ${rowNum}: ${key} "${row[key as keyof typeof row]}" isn't a valid non-negative number`);
    }

    if (!byEvent.has(seasonId)) byEvent.set(seasonId, new Map());
    const divisions = byEvent.get(seasonId)!;
    if (!divisions.has(row.division)) divisions.set(row.division, []);
    divisions.get(row.division)!.push({
      team: row.team,
      W:  stats.W  ?? 0,
      L:  stats.L  ?? 0,
      T:  stats.T  ?? 0,
      GF: stats.GF ?? 0,
      GA: stats.GA ?? 0,
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
    const pa = a.W * 3 + a.T;
    const pb = b.W * 3 + b.T;
    return pb !== pa ? pb - pa : (b.GF - b.GA) - (a.GF - a.GA);
  });
}
