// ─────────────────────────────────────────────────────────────────────────
// SCHEDULE & SEASON DATA  ·  src/data/schedule.ts
// ─────────────────────────────────────────────────────────────────────────
//
// Sourced from Google Sheets, not this file. See GOOGLE_SHEETS_SETUP.md for
// full setup instructions. One Sheet, two tabs, both published to web as
// CSV:
//
//   Seasons tab:  season_id | name | type | active | startDate | endDate
//                 One row per season/tournament. `type` is 'season' or
//                 'tournament'. `active` is TRUE/FALSE — TRUE means it
//                 shows on the homepage and /league.
//
//   Schedule tab: season_id | date | time | arrival | home | away | division | field | notes
//                 One row per game. `season_id` must match a Seasons row's
//                 `season_id` — same column name in both tabs on purpose,
//                 so the relationship between the two is obvious at a
//                 glance. `home`/`away` must match a team name in teams.ts
//                 exactly. `field` must match an id in fields.ts.
//                 `arrival`/`notes` are optional — leave the cell blank.
//
// Both tabs are edited together, in the same sitting, in the same sheet.
//
// This is a fully static site (astro.config.mjs: output: 'static') — there
// is no server to fetch from at request time, so both tabs are fetched and
// validated once, at BUILD time (top-level await below). A validation
// failure throws, which fails the build — Cloudflare Pages keeps serving
// the last successful deploy rather than publishing bad data. That's
// intentional: silently falling back to stale data would hide a broken
// sheet URL/format indefinitely instead of surfacing it.
//
// This build-time check is a backstop, not the primary defense — the sheet
// itself validates on every edit (Apps Script, see GOOGLE_SHEETS_SETUP.md)
// and blocks a bad deploy before it's even triggered. Both read the same
// valid team/division/field values, published live at /valid-values.json
// (src/pages/valid-values.json.ts) so there's one source of truth.
// ─────────────────────────────────────────────────────────────────────────

import { parseCSV } from '@/lib/csv';
import { teams } from './teams';
import { fields } from './fields';

const SEASONS_CSV_URL = '';  // paste the published Seasons-tab CSV URL here
const SCHEDULE_CSV_URL = ''; // paste the published Schedule-tab CSV URL here
// Example: 'https://docs.google.com/spreadsheets/d/YOUR_ID/gviz/tq?tqx=out:csv&sheet=Seasons'
// Leave both empty to run with zero events (site shows its normal
// "no active events" state) — useful before the sheet is set up.

export interface Game {
  id:       string;   // derived — season_id + row number, not sheet input
  date:     string;   // 'YYYY-MM-DD'
  time:     string;   // '9:30 AM'
  arrival?: string;   // '9:00 AM' — arrival/warmup time
  home:     string;   // team name (must match teams.ts)
  away:     string;   // team name (must match teams.ts)
  division: string;
  field:    string;   // field id from fields.ts
  notes?:   string;
}

export interface ScheduleEvent {
  id:        string;
  name:      string;
  type:      'season' | 'tournament';
  active:    boolean;
  startDate: string;
  endDate:   string;
  games:     Game[];
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

async function fetchCSV(url: string, label: string): Promise<Record<string, string>[]> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new Error(`[schedule.ts] Could not reach the ${label} sheet: ${(err as Error).message}\nURL: ${url}`);
  }
  if (!res.ok) {
    throw new Error(`[schedule.ts] ${label} sheet fetch failed: HTTP ${res.status}. Check it's still published to web as CSV (File → Share → Publish to web).\nURL: ${url}`);
  }
  return parseCSV(await res.text());
}

function buildEvents(seasonRows: Record<string, string>[], gameRows: Record<string, string>[]): ScheduleEvent[] {
  const errors: string[] = [];
  const teamNames = new Set(teams.map(t => t.name));
  const validDivisions = new Set(teams.flatMap(t => t.divisions));
  const fieldIds = new Set(fields.map(f => f.id));

  const events = new Map<string, ScheduleEvent>();

  seasonRows.forEach((row, i) => {
    const rowNum = i + 2; // header is row 1
    const seasonId = row.season_id;
    if (!seasonId) { errors.push(`Seasons row ${rowNum}: missing season_id`); return; }
    if (events.has(seasonId)) { errors.push(`Seasons row ${rowNum}: duplicate season_id "${seasonId}"`); return; }
    if (!row.name) errors.push(`Seasons row ${rowNum} (${seasonId}): missing name`);
    if (row.type !== 'season' && row.type !== 'tournament') {
      errors.push(`Seasons row ${rowNum} (${seasonId}): type must be "season" or "tournament", got "${row.type}"`);
    }
    if (!DATE_RE.test(row.startDate)) errors.push(`Seasons row ${rowNum} (${seasonId}): startDate "${row.startDate}" is not YYYY-MM-DD`);
    if (!DATE_RE.test(row.endDate))   errors.push(`Seasons row ${rowNum} (${seasonId}): endDate "${row.endDate}" is not YYYY-MM-DD`);

    events.set(seasonId, {
      id: seasonId,
      name: row.name,
      type: (row.type === 'tournament' ? 'tournament' : 'season'),
      active: /^true$/i.test(row.active),
      startDate: row.startDate,
      endDate: row.endDate,
      games: [],
    });
  });

  gameRows.forEach((row, i) => {
    const rowNum = i + 2;
    const seasonId = row.season_id;
    if (!seasonId) { errors.push(`Schedule row ${rowNum}: missing season_id`); return; }
    const target = events.get(seasonId);
    if (!target) { errors.push(`Schedule row ${rowNum}: season_id "${seasonId}" doesn't match any Seasons row`); return; }

    if (!DATE_RE.test(row.date)) errors.push(`Schedule row ${rowNum}: date "${row.date}" is not YYYY-MM-DD`);
    if (!row.time) errors.push(`Schedule row ${rowNum}: missing time`);
    if (!row.home) errors.push(`Schedule row ${rowNum}: missing home team`);
    if (!row.away) errors.push(`Schedule row ${rowNum}: missing away team`);
    if (row.home && row.away && row.home === row.away) errors.push(`Schedule row ${rowNum}: home and away are both "${row.home}"`);
    if (row.home && !teamNames.has(row.home)) errors.push(`Schedule row ${rowNum}: home team "${row.home}" doesn't match a name in teams.ts`);
    if (row.away && !teamNames.has(row.away)) errors.push(`Schedule row ${rowNum}: away team "${row.away}" doesn't match a name in teams.ts`);
    if (!validDivisions.has(row.division)) errors.push(`Schedule row ${rowNum}: division "${row.division}" isn't used by any team in teams.ts`);
    if (!fieldIds.has(row.field)) errors.push(`Schedule row ${rowNum}: field "${row.field}" doesn't match an id in fields.ts`);

    target.games.push({
      id: `${seasonId}-${rowNum}`,
      date: row.date,
      time: row.time,
      arrival: row.arrival || undefined,
      home: row.home,
      away: row.away,
      division: row.division,
      field: row.field,
      notes: row.notes || undefined,
    });
  });

  if (errors.length) {
    throw new Error(
      `[schedule.ts] ${errors.length} problem(s) in the schedule sheet — fix these and rebuild:\n` +
      errors.map(e => ` - ${e}`).join('\n')
    );
  }

  return [...events.values()];
}

export const scheduleEvents: ScheduleEvent[] =
  SEASONS_CSV_URL && SCHEDULE_CSV_URL
    ? buildEvents(
        await fetchCSV(SEASONS_CSV_URL, 'Seasons'),
        await fetchCSV(SCHEDULE_CSV_URL, 'Schedule'),
      )
    : [];

// ── HELPERS ────────────────────────────────────────────────────────────────
export function getActiveEvents() {
  return scheduleEvents.filter(e => e.active);
}
export function getEventById(id: string) {
  return scheduleEvents.find(e => e.id === id);
}
