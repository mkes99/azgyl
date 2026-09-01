// ─────────────────────────────────────────────────────────────────────────
// VENUES DATA  ·  src/data/venues.ts
// Source: https://azgl.leagueapps.com/locations
// ─────────────────────────────────────────────────────────────────────────
//
// One entry per physical location — not per field. Which specific field a
// game is on (e.g. "Field 1", "Field 3", "Chuparosa Field") is just plain
// text on the game itself, in src/data/schedule.ts — there's no fixed list
// to keep in sync here, since different venues label their fields
// differently and it only needs to be entered once per game, same as the
// venue only needs to be identified once per game day. This file just
// needs to know the venue: what to call it, where it is, and anything
// venue-wide (address, map link, notes, field map).
//
// `fieldMapUrl` is optional — a diagram/image showing where each field is
// within the venue, if one exists. Leave it unset until you have one; the
// "Field map" button on the site just won't show up. Two ways to set it:
//
//   1. Drop the image in `public/assets/field-maps/` and set this to that
//      path (e.g. '/assets/field-maps/mesquite.png') — reliable, doesn't
//      depend on anything outside the repo, but needs a code change.
//   2. Add a `fieldMapUrl` on the game rows in the Schedule sheet, same
//      row where `venue` is first typed for that block (see fillDown()
//      in src/data/schedule.ts) — lets someone add or swap a link without
//      touching code. If both exist, the sheet's value wins for any game
//      that has one; a game with no `fieldMapUrl` cell falls back to
//      whatever's hardcoded here. A Google Drive share link pasted as-is
//      (whatever "Copy link" gives you) gets rewritten into a direct
//      image URL at build time — see normalizeFieldMapUrl() in
//      src/lib/driveLink.ts and GOOGLE_SHEETS_SETUP.md.
// ─────────────────────────────────────────────────────────────────────────

export interface Venue {
  id:           string;    // used in schedule.ts
  name:         string;    // 'Mesquite High School'
  address:      string;
  city:         string;
  mapUrl:       string;
  notes?:       string;    // venue-wide note, shown once per day (not per game) behind a
                            // click-to-open "Notes" disclosure — plain text
  fieldMapUrl?: string;    // optional — see note above; may be overridden per-game from the sheet
}

export const venues: Venue[] = [

  {
    id:      'mesquite',
    name:    'Mesquite High School',
    address: '500 S McQueen Rd, Gilbert, AZ 85233',
    city:    'Gilbert',
    mapUrl:  'https://maps.google.com/?q=500+S+McQueen+Rd+Gilbert+AZ+85233',
    notes:   'No dogs allowed. Field 3 has a busted pipe near the edge — wet area, avoid that section (field shifted to compensate).',
    fieldMapUrl: '/assets/field-maps/mesquite.png',
  },

  {
    id:      'naranja-park',
    name:    'Naranja Park',
    address: '1100 N Naranja Dr, Oro Valley, AZ 85737',
    city:    'Oro Valley',
    mapUrl:  'https://maps.google.com/?q=1100+N+Naranja+Dr+Oro+Valley+AZ+85737',
    notes:   'Field 4 for 10U–14U. Chuparosa Park used for 8U.',
  },

  {
    id:      'chuparosa',
    name:    'Chuparosa Park',
    address: '2400 S Dobson Rd, Chandler, AZ 85286',
    city:    'Chandler',
    mapUrl:  'https://maps.google.com/?q=2400+S+Dobson+Rd+Chandler+AZ+85286',
    notes:   'Used for 8U games on Oro Valley host weekends.',
  },

  {
    id:      'ssc',
    name:    'Surprise Soccer Complex (SSC)',
    address: '14450 W Sweetwater Ave, Surprise, AZ 85379',
    city:    'Surprise',
    mapUrl:  'https://maps.google.com/?q=14450+W+Sweetwater+Ave+Surprise+AZ+85379',
    notes:   '4 fields available. Hosted by Robinhood/East Valley.',
  },

  {
    id:      'mohave',
    name:    'Mohave Middle School',
    address: '8425 W Mohave St, Tolleson, AZ 85353',
    city:    'Tolleson',
    mapUrl:  'https://maps.google.com/?q=8425+W+Mohave+St+Tolleson+AZ+85353',
    notes:   '3–4 fields. AZGL-hosted games.',
  },

  {
    id:      'anthem-community',
    name:    'Anthem Community Park',
    address: '41703 N Gavilan Peak Pkwy, Anthem, AZ 85086',
    city:    'Anthem',
    mapUrl:  'https://maps.google.com/?q=41703+N+Gavilan+Peak+Pkwy+Anthem+AZ+85086',
    notes:   '4 fields. Hosted by North Phoenix.',
  },

];

// ── HELPERS ────────────────────────────────────────────────────────────────
export function getVenueById(id: string) {
  return venues.find(v => v.id === id);
}
