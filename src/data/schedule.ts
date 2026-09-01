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
//   Schedule tab: season_id | date | time | arrival | home | away | division | venue | field | notes | fieldMapUrl
//                 One row per game. `season_id` must match a Seasons row's
//                 `season_id` — same column name in both tabs on purpose,
//                 so the relationship between the two is obvious at a
//                 glance. `home`/`away` must match a team name in teams.ts
//                 exactly. `venue` must match an id in venues.ts — it's
//                 the only thing that determines which games get grouped
//                 together on the site. `field` is plain, unvalidated
//                 text — whatever that venue calls it ("Field 1",
//                 "Chuparosa Field") — since different venues label their
//                 fields differently. `arrival`/`notes`/`fieldMapUrl` are
//                 optional — leave the cell blank. `fieldMapUrl` overrides
//                 the venue's hardcoded field-map image (see venues.ts) —
//                 typed on the same row where `venue` is first set for a
//                 block, so it fills down along with it.
//
//                 `season_id`, `date`, `venue`, `division`, and
//                 `fieldMapUrl` don't need to be retyped on every row —
//                 leave any of those blank and it inherits whatever was in
//                 the row above (see fillDown() below). This matches how
//                 vertically-merged Sheet cells actually export to CSV
//                 (the value only lands in the top row of the merge, blank
//                 cells for the rest of it), so it works whether someone
//                 types a block of games with those cells left blank or
//                 actually merges the cells in the sheet. Only the very
//                 first row needs every column filled in — there's nothing
//                 to inherit from above it.
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
// valid team/division/venue values, published live at /valid-values.json
// (src/pages/valid-values.json.ts) so there's one source of truth.
// ─────────────────────────────────────────────────────────────────────────

import { fetchCSV } from '@/lib/csv';
import { teams } from './teams';
import { venues } from './venues';

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
  venue:    string;   // venue id from venues.ts — drives address/map/notes/field-map, and grouping
  field:    string;   // plain text field label at that venue — 'Field 1', 'Chuparosa Field', etc.
  notes?:   string;
  fieldMapUrl?: string; // optional — overrides the venue's hardcoded field-map image for this game
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

// A blank cell in any of `columns` inherits whatever was in the row above
// it for that column — lets a block of games at the same venue/date/
// division be typed (or pasted from a vertically-merged Sheet range)
// without repeating that value on every single row. Row order and count
// are untouched, so row-number-based error messages below still line up
// with the actual sheet.
//
// `division` and `fieldMapUrl` are block-scoped to venue/date: whenever a
// row explicitly gives its own venue or date (rather than leaving them
// blank to inherit), that's a new block starting, and neither should
// reach back into the PREVIOUS block for a value it left blank — that's
// how a mixed-venue day (new venue, same date, different games) or a
// venue that just doesn't have a field-map link ends up silently wearing
// the last block's, instead of correctly having none. `season_id`,
// `date`, and `venue` themselves keep inheriting exactly as before; only
// the two that are meant to reset at each new block are scoped.
const BLOCK_SCOPED_COLUMNS = ['division', 'fieldMapUrl'];

function fillDown(rows: Record<string, string>[], columns: string[]): Record<string, string>[] {
  const last: Record<string, string> = {};
  return rows.map(row => {
    if (row.venue || row.date) {
      for (const col of BLOCK_SCOPED_COLUMNS) delete last[col];
    }
    const filled = { ...row };
    for (const col of columns) {
      if (filled[col]) last[col] = filled[col];
      else if (last[col]) filled[col] = last[col];
    }
    return filled;
  });
}

function buildEvents(seasonRows: Record<string, string>[], gameRows: Record<string, string>[]): ScheduleEvent[] {
  const errors: string[] = [];
  const teamNames = new Set(teams.map(t => t.name));
  const validDivisions = new Set(teams.flatMap(t => t.divisions));
  const venueIds = new Set(venues.map(v => v.id));

  gameRows = fillDown(gameRows, ['season_id', 'date', 'venue', 'division', 'fieldMapUrl']);

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
    if (!venueIds.has(row.venue)) errors.push(`Schedule row ${rowNum}: venue "${row.venue}" doesn't match an id in venues.ts`);
    if (!row.field) errors.push(`Schedule row ${rowNum}: missing field`);

    target.games.push({
      id: `${seasonId}-${rowNum}`,
      date: row.date,
      time: row.time,
      arrival: row.arrival || undefined,
      home: row.home,
      away: row.away,
      division: row.division,
      venue: row.venue,
      field: row.field,
      notes: row.notes || undefined,
      fieldMapUrl: row.fieldMapUrl || undefined,
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
        await fetchCSV(SEASONS_CSV_URL, 'schedule.ts', 'Seasons'),
        await fetchCSV(SCHEDULE_CSV_URL, 'schedule.ts', 'Schedule'),
      )
    : [];

// ── HELPERS ────────────────────────────────────────────────────────────────
export function getActiveEvents() {
  return scheduleEvents.filter(e => e.active);
}
export function getEventById(id: string) {
  return scheduleEvents.find(e => e.id === id);
}
