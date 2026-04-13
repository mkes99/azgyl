// ─────────────────────────────────────────────────────────────────────────
// STANDINGS DATA  ·  src/data/standings.ts
// ─────────────────────────────────────────────────────────────────────────
//
// TWO WAYS TO UPDATE STANDINGS:
//
// OPTION A — Google Sheets (recommended, no code required):
//   See GOOGLE_SHEETS_SETUP.md for full instructions.
//   Short version: publish your standings sheet as CSV, paste the URL
//   into STANDINGS_CSV_URL below, and trigger a Cloudflare redeploy.
//   After that, just update the sheet and click "Redeploy" in Cloudflare.
//
// OPTION B — Edit this file directly:
//   Find the division rows below and update W / L / T / GF / GA numbers.
//   Then push to GitHub (Cloudflare auto-deploys on push).
//
// ─────────────────────────────────────────────────────────────────────────
//
// GOOGLE SHEETS FORMAT (if using Option A):
//   Sheet name: Standings
//   Columns:    division | team | W | L | T | GF | GA
//   Example:    12U | Diamonds | 4 | 1 | 0 | 38 | 22
//
// Leave STANDINGS_CSV_URL as empty string ('') to use the local data below.
// ─────────────────────────────────────────────────────────────────────────

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

// ── LOCAL STANDINGS — edit these numbers after each game day ──────────────
// (only used when STANDINGS_CSV_URL is empty)

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

// ── HELPERS ────────────────────────────────────────────────────────────────
export function sortedRows(rows: StandingRow[]) {
  return [...rows].sort((a, b) => {
    const pa = a.W * 3 + a.T;
    const pb = b.W * 3 + b.T;
    return pb !== pa ? pb - pa : (b.GF - b.GA) - (a.GF - a.GA);
  });
}
