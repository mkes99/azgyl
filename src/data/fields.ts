// ─────────────────────────────────────────────────────────────────────────
// FIELDS DATA  ·  src/data/fields.ts
// Source: https://azgl.leagueapps.com/locations
// ─────────────────────────────────────────────────────────────────────────
//
// The field id must match the field value used in schedule.ts.
// For venues with multiple numbered fields, use the pattern:
//   'mesquite-f1', 'mesquite-f2', 'mesquite-f3'
//
// `label` is shown per-game on the schedule (e.g. "Field 1") — the venue
// name, address, and map link are shown once per day instead, at the top
// of that day's schedule (see LeagueSchedule.astro), not repeated per row.
// There's no fixed format for `label` — different venues label their
// fields differently (numbers, letters, names). Set it to whatever
// actually matches the signage/scorer's-table naming at that venue.
//
// `fieldMapUrl` is optional — a diagram/image showing where each field is
// within the venue, if one exists. Leave it unset until you have one; nothing
// breaks either way, the "Field map" link on the site just won't show up.
// To add one: drop the image in `public/assets/field-maps/` and set this to
// that path (e.g. '/assets/field-maps/mesquite.jpg'). Multi-field venues
// share one field-map image across all their field entries (same as venue/
// address/mapUrl below), since it's one diagram of the whole site.
// ─────────────────────────────────────────────────────────────────────────

export interface Field {
  id:           string;    // used in schedule.ts
  label:        string;    // short, per-game label — e.g. 'Field 1'. Free-form, see note above.
  venue:        string;    // venue name, shown once per day
  address:      string;
  city:         string;
  mapUrl:       string;
  notes?:       string;    // venue-level note, shown once per day (not per game) behind a
                            // click-to-open "Notes" disclosure — plain text, no emoji prefix
                            // needed or wanted; shows for any note, not just safety warnings
  fieldMapUrl?: string;    // optional — see note above
}

export const fields: Field[] = [

  // ── MESQUITE HIGH SCHOOL — Gilbert ────────────────────────────────────
  // No dogs allowed at Mesquite HS
  // Note: edge of Field 3 has a busted pipe / wet area — avoid
  {
    id:      'mesquite-f1',
    label:   'Field 1',
    venue:   'Mesquite High School',
    address: '500 S McQueen Rd, Gilbert, AZ 85233',
    city:    'Gilbert',
    mapUrl:  'https://maps.google.com/?q=500+S+McQueen+Rd+Gilbert+AZ+85233',
    notes:   'No dogs allowed. Main competition field.',
    fieldMapUrl: '/assets/field-maps/mesquite.png',
  },
  {
    id:      'mesquite-f2',
    label:   'Field 2',
    venue:   'Mesquite High School',
    address: '500 S McQueen Rd, Gilbert, AZ 85233',
    city:    'Gilbert',
    mapUrl:  'https://maps.google.com/?q=500+S+McQueen+Rd+Gilbert+AZ+85233',
    notes:   'No dogs allowed.',
    fieldMapUrl: '/assets/field-maps/mesquite.png',
  },
  {
    id:      'mesquite-f3',
    label:   'Field 3',
    venue:   'Mesquite High School',
    address: '500 S McQueen Rd, Gilbert, AZ 85233',
    city:    'Gilbert',
    mapUrl:  'https://maps.google.com/?q=500+S+McQueen+Rd+Gilbert+AZ+85233',
    notes:   'No dogs allowed. Busted pipe near edge — wet area, avoid that section. Field shifted to compensate.',
    fieldMapUrl: '/assets/field-maps/mesquite.png',
  },

  // ── NARANJA PARK — Oro Valley ──────────────────────────────────────────
  {
    id:      'naranja-park',
    label:   'Field 4',
    venue:   'Naranja Park',
    address: '1100 N Naranja Dr, Oro Valley, AZ 85737',
    city:    'Oro Valley',
    mapUrl:  'https://maps.google.com/?q=1100+N+Naranja+Dr+Oro+Valley+AZ+85737',
    notes:   'Field 4 for 10U–14U. Chuparosa Park used for 8U.',
  },
  {
    id:      'chuparosa',
    label:   'Chuparosa Field',
    venue:   'Chuparosa Park',
    address: '2400 S Dobson Rd, Chandler, AZ 85286',
    city:    'Chandler',
    mapUrl:  'https://maps.google.com/?q=2400+S+Dobson+Rd+Chandler+AZ+85286',
    notes:   'Used for 8U games on Oro Valley host weekends.',
  },

  // ── SURPRISE SOCCER COMPLEX (SSC) ─────────────────────────────────────
  {
    id:      'ssc',
    label:   'SSC',
    venue:   'Surprise Soccer Complex (SSC)',
    address: '14450 W Sweetwater Ave, Surprise, AZ 85379',
    city:    'Surprise',
    mapUrl:  'https://maps.google.com/?q=14450+W+Sweetwater+Ave+Surprise+AZ+85379',
    notes:   '4 fields available. Hosted by Robinhood/East Valley.',
  },

  // ── MOHAVE MIDDLE SCHOOL ───────────────────────────────────────────────
  {
    id:      'mohave',
    label:   'Mohave',
    venue:   'Mohave Middle School',
    address: '8425 W Mohave St, Tolleson, AZ 85353',
    city:    'Tolleson',
    mapUrl:  'https://maps.google.com/?q=8425+W+Mohave+St+Tolleson+AZ+85353',
    notes:   '3–4 fields. AZGL-hosted games.',
  },

  // ── ANTHEM COMMUNITY PARK ─────────────────────────────────────────────
  {
    id:      'anthem-community',
    label:   'Anthem',
    venue:   'Anthem Community Park',
    address: '41703 N Gavilan Peak Pkwy, Anthem, AZ 85086',
    city:    'Anthem',
    mapUrl:  'https://maps.google.com/?q=41703+N+Gavilan+Peak+Pkwy+Anthem+AZ+85086',
    notes:   '4 fields. Hosted by North Phoenix.',
  },

];

// ── HELPERS ────────────────────────────────────────────────────────────────
export function getFieldById(id: string) {
  return fields.find(f => f.id === id);
}
