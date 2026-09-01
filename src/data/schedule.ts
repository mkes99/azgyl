// ─────────────────────────────────────────────────────────────────────────
// SCHEDULE DATA  ·  src/data/schedule.ts
// ─────────────────────────────────────────────────────────────────────────
//
// This file contains the schedule ONLY — who plays who, when, and where.
// Results and scores live in src/data/results.ts (update that after games).
// The site uses today's date to determine the current week automatically.
// You never need to change anything here mid-season.
//
// HOW TO ADD A NEW WEEK — copy game lines, increment the id:
//   w3-8u-g01, w3-10u-g01, etc.
//   field: must match an id in src/data/fields.ts
//
// HOW TO ADD A NEW SEASON OR TOURNAMENT — copy the event block,
//   change id + name, set active: true on the new one.
//
// TEAM NAMES must match the name field in src/data/teams.ts exactly.
// ─────────────────────────────────────────────────────────────────────────

export interface Game {
  id:        string;   // unique — e.g. 'w1-12u-g01' — used to look up results
  date:      string;   // 'YYYY-MM-DD'
  time:      string;   // '9:30 AM'
  arrival?:  string;   // '9:00 AM' — arrival/warmup time
  home:      string;   // team name (must match teams.ts)
  away:      string;   // team name (must match teams.ts)
  division:  string;   // '8U' | '10U' | '12U' | '14U'
  field:     string;   // field id from fields.ts
  notes?:    string;   // 'Spring Break week', 'Senior night', etc.
}

export interface ScheduleEvent {
  id:        string;       // slug — 'spring-2026', 'fall-2026-tournament'
  name:      string;       // display name shown on site
  type:      'season' | 'tournament';
  active:    boolean;      // true = shown on homepage + /league
  startDate: string;       // 'YYYY-MM-DD'
  endDate:   string;       // 'YYYY-MM-DD'
  games:     Game[];
}

// ── EVENTS ────────────────────────────────────────────────────────────────

export const scheduleEvents: ScheduleEvent[] = [

  // ── SPRING 2026 REGULAR SEASON ─────────────────────────────────────────
  {
    id:        'spring-2026',
    name:      'Spring 2026',
    type:      'season',
    active:    true,
    startDate: '2026-02-07',
    endDate:   '2026-04-11',
    games: [

      // ── Week 1 · Feb 7 · Mesquite HS, 500 S McQueen Rd, Gilbert AZ 85233
      // Note: NO DOGS ALLOWED at Mesquite HS

      // 8U — Field 2
      { id:'w1-8u-g01', date:'2026-02-07', time:'8:00 AM',  arrival:'7:30 AM', division:'8U',  field:'mesquite-f2', home:'Hotshots/Chandler/Oro',  away:'Tukee Lightning 2' },
      { id:'w1-8u-g02', date:'2026-02-07', time:'8:45 AM',  arrival:'8:15 AM', division:'8U',  field:'mesquite-f2', home:'Tukee Lightning 2',       away:'Diamonds' },
      { id:'w1-8u-g03', date:'2026-02-07', time:'9:30 AM',  arrival:'9:00 AM', division:'8U',  field:'mesquite-f2', home:'Vipers',                  away:'Tukee Lightning 1' },

      // 10U — Fields 2 & 3
      { id:'w1-10u-g01', date:'2026-02-07', time:'8:00 AM',  arrival:'7:30 AM', division:'10U', field:'mesquite-f3', home:'Hotshots',                away:'Vipers' },
      { id:'w1-10u-g02', date:'2026-02-07', time:'9:30 AM',  arrival:'9:00 AM', division:'10U', field:'mesquite-f3', home:'Tukee Lightning 1',       away:'Chandler/Sol Sisters' },
      { id:'w1-10u-g03', date:'2026-02-07', time:'10:15 AM', arrival:'9:45 AM', division:'10U', field:'mesquite-f2', home:'Vipers',                  away:'Tukee Lightning 1' },
      { id:'w1-10u-g04', date:'2026-02-07', time:'11:00 AM', arrival:'10:30 AM',division:'10U', field:'mesquite-f2', home:'Diamonds',                away:'Hotshots' },
      { id:'w1-10u-g05', date:'2026-02-07', time:'11:45 AM', arrival:'11:15 AM',division:'10U', field:'mesquite-f2', home:'Chandler/Sol Sisters',    away:'Tukee Lightning 2' },
      { id:'w1-10u-g06', date:'2026-02-07', time:'12:30 PM', arrival:'12:00 PM',division:'10U', field:'mesquite-f2', home:'Tukee Lightning 2',       away:'Diamonds' },

      // 12U — Fields 1 & 2  (using revised schedule)
      { id:'w1-12u-g01', date:'2026-02-07', time:'8:45 AM',  arrival:'8:15 AM', division:'12U', field:'mesquite-f1', home:'Oro Valley',              away:'Tukee Lightning' },
      { id:'w1-12u-g02', date:'2026-02-07', time:'9:30 AM',  arrival:'9:00 AM', division:'12U', field:'mesquite-f2', home:'Hawks',                   away:'Vipers' },
      { id:'w1-12u-g03', date:'2026-02-07', time:'10:15 AM', arrival:'9:45 AM', division:'12U', field:'mesquite-f1', home:'Diamonds',                away:'Oro Valley' },
      { id:'w1-12u-g04', date:'2026-02-07', time:'11:00 AM', arrival:'10:30 AM',division:'12U', field:'mesquite-f1', home:'Hawks',                   away:'Tukee Lightning' },
      { id:'w1-12u-g05', date:'2026-02-07', time:'11:00 AM', arrival:'10:30 AM',division:'12U', field:'mesquite-f2', home:'Vipers',                  away:'Marana Reapers' },
      { id:'w1-12u-g06', date:'2026-02-07', time:'11:45 AM', arrival:'11:15 AM',division:'12U', field:'mesquite-f1', home:'Marana Reapers',           away:'Diamonds' },

      // 14U — Fields 1 & 3  (using revised schedule)
      { id:'w1-14u-g01', date:'2026-02-07', time:'8:00 AM',  arrival:'7:30 AM', division:'14U', field:'mesquite-f1', home:'Hotshots',                away:'Tukee Lightning 1' },
      { id:'w1-14u-g02', date:'2026-02-07', time:'9:30 AM',  arrival:'9:00 AM', division:'14U', field:'mesquite-f1', home:'East Valley Bullets',     away:'Hawks' },
      { id:'w1-14u-g03', date:'2026-02-07', time:'10:15 AM', arrival:'9:45 AM', division:'14U', field:'mesquite-f3', home:'Hawks',                   away:'Hotshots' },
      { id:'w1-14u-g04', date:'2026-02-07', time:'11:00 AM', arrival:'10:30 AM',division:'14U', field:'mesquite-f3', home:'Tukee Lightning 1',       away:'Chandler Lax' },
      { id:'w1-14u-g05', date:'2026-02-07', time:'11:45 AM', arrival:'11:15 AM',division:'14U', field:'mesquite-f3', home:'Tukee Lightning 2',       away:'Vipers/Diamonds' },
      { id:'w1-14u-g06', date:'2026-02-07', time:'12:30 PM', arrival:'12:00 PM',division:'14U', field:'mesquite-f1', home:'Vipers/Diamonds',         away:'East Valley Bullets' },
      { id:'w1-14u-g07', date:'2026-02-07', time:'12:30 PM', arrival:'12:00 PM',division:'14U', field:'mesquite-f3', home:'Tukee Lightning 2',       away:'Chandler Lax' },

      // ── Week 2–10 games go here as schedules are released ──────────────
      // Copy the pattern above: w3-8u-g01, w3-10u-g01, etc.
      // Add each week's games when you receive the CSV from the scheduler.
      // ── Week 2 · Feb 14 · Mesquite HS (host: Chandler)
      // 8U hosted at Naranja Park this week instead — different venue than
      // the rest of the day, to exercise the mixed-venue fallback (see
      // LeagueSchedule.astro: "Multiple locations today").
      { id:'w2-8u-g01',  date:'2026-02-14', time:'8:00 AM',  arrival:'7:30 AM',  division:'8U',  field:'naranja-park', home:'Diamonds',              away:'Tukee Lightning 1' },
      { id:'w2-8u-g02',  date:'2026-02-14', time:'8:45 AM',  arrival:'8:15 AM',  division:'8U',  field:'naranja-park', home:'Tukee Lightning 1',     away:'Hotshots/Chandler/Oro' },
      { id:'w2-8u-g03',  date:'2026-02-14', time:'9:30 AM',  arrival:'9:00 AM',  division:'8U',  field:'naranja-park', home:'Tukee Lightning 2',     away:'Vipers' },

      { id:'w2-10u-g01', date:'2026-02-14', time:'8:00 AM',  arrival:'7:30 AM',  division:'10U', field:'mesquite-f3', home:'Tukee Lightning 2',     away:'Hotshots' },
      { id:'w2-10u-g02', date:'2026-02-14', time:'8:45 AM',  arrival:'8:15 AM',  division:'10U', field:'mesquite-f3', home:'Vipers',                away:'Chandler/Sol Sisters' },
      { id:'w2-10u-g03', date:'2026-02-14', time:'9:30 AM',  arrival:'9:00 AM',  division:'10U', field:'mesquite-f2', home:'Tukee Lightning 1',     away:'Diamonds' },
      { id:'w2-10u-g04', date:'2026-02-14', time:'10:15 AM', arrival:'9:45 AM',  division:'10U', field:'mesquite-f2', home:'Hotshots',              away:'Chandler/Sol Sisters' },
      { id:'w2-10u-g05', date:'2026-02-14', time:'11:00 AM', arrival:'10:30 AM', division:'10U', field:'mesquite-f3', home:'Chandler/Sol Sisters',  away:'Tukee Lightning 2' },
      { id:'w2-10u-g06', date:'2026-02-14', time:'11:45 AM', arrival:'11:15 AM', division:'10U', field:'mesquite-f2', home:'Diamonds',              away:'Vipers' },

      { id:'w2-12u-g01', date:'2026-02-14', time:'8:45 AM',  arrival:'8:15 AM',  division:'12U', field:'mesquite-f1', home:'Tukee Lightning',       away:'Diamonds' },
      { id:'w2-12u-g02', date:'2026-02-14', time:'9:30 AM',  arrival:'9:00 AM',  division:'12U', field:'mesquite-f1', home:'Vipers',                away:'Oro Valley' },
      { id:'w2-12u-g03', date:'2026-02-14', time:'10:15 AM', arrival:'9:45 AM',  division:'12U', field:'mesquite-f2', home:'Marana Reapers',        away:'Hawks' },
      { id:'w2-12u-g04', date:'2026-02-14', time:'11:00 AM', arrival:'10:30 AM', division:'12U', field:'mesquite-f1', home:'Diamonds',              away:'Marana Reapers' },
      { id:'w2-12u-g05', date:'2026-02-14', time:'11:00 AM', arrival:'10:30 AM', division:'12U', field:'mesquite-f2', home:'Oro Valley',            away:'Tukee Lightning' },
      { id:'w2-12u-g06', date:'2026-02-14', time:'11:45 AM', arrival:'11:15 AM', division:'12U', field:'mesquite-f1', home:'Hawks',                 away:'Vipers' },

      { id:'w2-14u-g01', date:'2026-02-14', time:'8:00 AM',  arrival:'7:30 AM',  division:'14U', field:'mesquite-f1', home:'Tukee Lightning 1',     away:'Hawks' },
      { id:'w2-14u-g02', date:'2026-02-14', time:'9:30 AM',  arrival:'9:00 AM',  division:'14U', field:'mesquite-f1', home:'Chandler Lax',          away:'Vipers/Diamonds' },
      { id:'w2-14u-g03', date:'2026-02-14', time:'10:15 AM', arrival:'9:45 AM',  division:'14U', field:'mesquite-f3', home:'Hotshots',              away:'East Valley Bullets' },
      { id:'w2-14u-g04', date:'2026-02-14', time:'11:00 AM', arrival:'10:30 AM', division:'14U', field:'mesquite-f3', home:'Hawks',                 away:'Chandler Lax' },
      { id:'w2-14u-g05', date:'2026-02-14', time:'11:45 AM', arrival:'11:15 AM', division:'14U', field:'mesquite-f3', home:'Vipers/Diamonds',       away:'Tukee Lightning 2' },
      { id:'w2-14u-g06', date:'2026-02-14', time:'12:30 PM', arrival:'12:00 PM', division:'14U', field:'mesquite-f1', home:'East Valley Bullets',   away:'Hotshots' },
      { id:'w2-14u-g07', date:'2026-02-14', time:'12:30 PM', arrival:'12:00 PM', division:'14U', field:'mesquite-f3', home:'Tukee Lightning 2',     away:'Tukee Lightning 1' },



    ] },

  // ── SPRING 2026 TOURNAMENT ─────────────────────────────────────────────
  // Uncomment and fill in when tournament bracket is finalized
  /*
  {
    id:        'spring-2026-tournament',
    name:      'Spring 2026 Tournament',
    type:      'tournament',
    active:    false,
    startDate: '2026-04-18',
    endDate:   '2026-04-18',
    games: [
      { id:'t26-g01', date:'2026-04-18', time:'8:00 AM', division:'12U', field:'mesquite-f1', home:'TBD', away:'TBD' },
    ] },
  */

];

// ── HELPERS ────────────────────────────────────────────────────────────────
export function getActiveEvents() {
  return scheduleEvents.filter(e => e.active);
}
export function getEventById(id: string) {
  return scheduleEvents.find(e => e.id === id);
}
export function getAllGames(eventId?: string) {
  if (eventId) return getEventById(eventId)?.games ?? [];
  return scheduleEvents.flatMap(e => e.games);
}
export function getUpcomingGames(eventId?: string, limit?: number) {
  const games = getAllGames(eventId).filter(g => g.result === 'upcoming');
  return limit ? games.slice(0, limit) : games;
}
export function getDivisionsInEvent(eventId: string) {
  const games = getEventById(eventId)?.games ?? [];
  return [...new Set(games.map(g => g.division))].sort();
}
