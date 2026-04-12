// ─────────────────────────────────────────────────────────────────────────
// STANDINGS DATA
// ─────────────────────────────────────────────────────────────────────────
// Kept separate from schedule so you can update standings independently.
// One StandingsTable per event + division.
//
// HOW TO UPDATE STANDINGS:
//   Find the matching event id, find the division array,
//   update W / L / T / GF / GA for each team row.
//
// HOW TO ADD A NEW EVENT'S STANDINGS:
//   Copy the entire object below and change the eventId to match
//   the id from schedule.ts.
//
// TEAM NAMES must match teams.ts exactly.
// ─────────────────────────────────────────────────────────────────────────

export interface StandingRow {
  team:  string;   // must match name in teams.ts
  W:     number;
  L:     number;
  T:     number;
  GF:    number;   // goals for
  GA:    number;   // goals against
}

export interface DivisionStandings {
  division: string;          // '8U' | '10U' | '12U' | '14U'
  rows:     StandingRow[];
}

export interface EventStandings {
  eventId:   string;         // must match an id in schedule.ts
  eventName: string;         // display label
  divisions: DivisionStandings[];
}

// ── STANDINGS ─────────────────────────────────────────────────────────────

export const allStandings: EventStandings[] = [

  // ── SPRING 2026 ────────────────────────────────────────────────────────
  {
    eventId:   'spring-2026',
    eventName: 'Spring 2026',
    divisions: [

      {
        division: '8U',
        rows: [
          { team:'Vipers',        W:0, L:0, T:0, GF:0, GA:0 },
          { team:'Diamonds',      W:0, L:0, T:0, GF:0, GA:0 },
          { team:'Tukee Lightning',W:0,L:0, T:0, GF:0, GA:0 },
          { team:'Hotshots',      W:0, L:0, T:0, GF:0, GA:0 },
          { team:'Chandler Lax',  W:0, L:0, T:0, GF:0, GA:0 },
        ],
      },

      {
        division: '10U',
        rows: [
          { team:'Vipers',        W:0, L:0, T:0, GF:0, GA:0 },
          { team:'Diamonds',      W:0, L:0, T:0, GF:0, GA:0 },
          { team:'Tukee Lightning',W:0,L:0, T:0, GF:0, GA:0 },
          { team:'Hotshots',      W:0, L:0, T:0, GF:0, GA:0 },
          { team:'Chandler Lax',  W:0, L:0, T:0, GF:0, GA:0 },
          { team:'Sol Sisters',   W:0, L:0, T:0, GF:0, GA:0 },
        ],
      },

      {
        division: '12U',
        rows: [
          { team:'Vipers',             W:0, L:0, T:0, GF:0, GA:0 },
          { team:'Diamonds',           W:0, L:0, T:0, GF:0, GA:0 },
          { team:'Tukee Lightning',    W:0, L:0, T:0, GF:0, GA:0 },
          { team:'Marana Reapers',     W:0, L:0, T:0, GF:0, GA:0 },
          { team:'Oro Valley',         W:0, L:0, T:0, GF:0, GA:0 },
          { team:'Hawks',              W:0, L:0, T:0, GF:0, GA:0 },
          { team:'East Valley Bullets',W:0, L:0, T:0, GF:0, GA:0 },
        ],
      },

      {
        division: '14U',
        rows: [
          { team:'Vipers',             W:0, L:0, T:0, GF:0, GA:0 },
          { team:'Diamonds',           W:0, L:0, T:0, GF:0, GA:0 },
          { team:'Tukee Lightning',    W:0, L:0, T:0, GF:0, GA:0 },
          { team:'Hawks',              W:0, L:0, T:0, GF:0, GA:0 },
          { team:'Hotshots',           W:0, L:0, T:0, GF:0, GA:0 },
          { team:'Oro Valley',         W:0, L:0, T:0, GF:0, GA:0 },
          { team:'East Valley Bullets',W:0, L:0, T:0, GF:0, GA:0 },
          { team:'Chandler Lax',       W:0, L:0, T:0, GF:0, GA:0 },
        ],
      },

    ],
  },

];

// ── HELPERS (used by components — don't edit) ─────────────────────────────
export function getStandingsForEvent(eventId: string) {
  return allStandings.find(s => s.eventId === eventId);
}
export function sortedRows(rows: StandingRow[]) {
  return [...rows].sort((a, b) => {
    const pa = a.W * 3 + a.T;
    const pb = b.W * 3 + b.T;
    return pb !== pa ? pb - pa : (b.GF - b.GA) - (a.GF - a.GA);
  });
}
