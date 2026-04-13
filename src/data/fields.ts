// ─────────────────────────────────────────────────────────────────────────
// FIELDS DATA  ·  src/data/fields.ts
// Source: https://azgl.leagueapps.com/locations
// ─────────────────────────────────────────────────────────────────────────
//
// The field id must match the field value used in schedule.ts.
// For venues with multiple numbered fields, use the pattern:
//   'mesquite-f1', 'mesquite-f2', 'mesquite-f3'
// ─────────────────────────────────────────────────────────────────────────

export interface Field {
  id:      string;    // used in schedule.ts
  name:    string;    // full display name
  label:   string;    // short label for schedule table (keep under ~18 chars)
  venue:   string;    // venue name
  address: string;
  city:    string;
  mapUrl:  string;
  notes?:  string;
}

export const fields: Field[] = [

  // ── MESQUITE HIGH SCHOOL — Gilbert ────────────────────────────────────
  // ⚠️  NO DOGS ALLOWED at Mesquite HS
  // Note: edge of Field 3 has a busted pipe / wet area — avoid
  {
    id:      'mesquite-f1',
    name:    'Mesquite HS — Field 1',
    label:   'Field 1',
    venue:   'Mesquite High School',
    address: '500 S McQueen Rd, Gilbert, AZ 85233',
    city:    'Gilbert',
    mapUrl:  'https://maps.google.com/?q=500+S+McQueen+Rd+Gilbert+AZ+85233',
    notes:   '⚠️ NO DOGS ALLOWED. Main competition field.',
  },
  {
    id:      'mesquite-f2',
    name:    'Mesquite HS — Field 2',
    label:   'Field 2',
    venue:   'Mesquite High School',
    address: '500 S McQueen Rd, Gilbert, AZ 85233',
    city:    'Gilbert',
    mapUrl:  'https://maps.google.com/?q=500+S+McQueen+Rd+Gilbert+AZ+85233',
    notes:   '⚠️ NO DOGS ALLOWED.',
  },
  {
    id:      'mesquite-f3',
    name:    'Mesquite HS — Field 3',
    label:   'Field 3',
    venue:   'Mesquite High School',
    address: '500 S McQueen Rd, Gilbert, AZ 85233',
    city:    'Gilbert',
    mapUrl:  'https://maps.google.com/?q=500+S+McQueen+Rd+Gilbert+AZ+85233',
    notes:   '⚠️ NO DOGS ALLOWED. Busted pipe near edge — wet area, avoid that section. Field shifted to compensate.',
  },

  // ── NARANJA PARK — Oro Valley ──────────────────────────────────────────
  {
    id:      'naranja-park',
    name:    'Naranja Park',
    label:   'Naranja Park',
    venue:   'Naranja Park',
    address: '1100 N Naranja Dr, Oro Valley, AZ 85737',
    city:    'Oro Valley',
    mapUrl:  'https://maps.google.com/?q=1100+N+Naranja+Dr+Oro+Valley+AZ+85737',
    notes:   'Field 4 for 10U–14U. Chuparosa Park used for 8U.',
  },
  {
    id:      'chuparosa',
    name:    'Chuparosa Park',
    label:   'Chuparosa Park',
    venue:   'Chuparosa Park',
    address: '11175 N Chuparosa Dr, Oro Valley, AZ 85737',
    city:    'Oro Valley',
    mapUrl:  'https://maps.google.com/?q=11175+N+Chuparosa+Dr+Oro+Valley+AZ+85737',
    notes:   'Used for 8U games on Oro Valley host weekends.',
  },

  // ── SURPRISE SOCCER COMPLEX (SSC) ─────────────────────────────────────
  {
    id:      'ssc',
    name:    'Surprise Soccer Complex',
    label:   'Surprise SC',
    venue:   'Surprise Soccer Complex (SSC)',
    address: '14450 W Sweetwater Ave, Surprise, AZ 85379',
    city:    'Surprise',
    mapUrl:  'https://maps.google.com/?q=14450+W+Sweetwater+Ave+Surprise+AZ+85379',
    notes:   '4 fields available. Hosted by Robinhood/East Valley.',
  },

  // ── MOHAVE MIDDLE SCHOOL ───────────────────────────────────────────────
  {
    id:      'mohave',
    name:    'Mohave Middle School',
    label:   'Mohave MS',
    venue:   'Mohave Middle School',
    address: '8425 W Mohave St, Tolleson, AZ 85353',
    city:    'Tolleson',
    mapUrl:  'https://maps.google.com/?q=8425+W+Mohave+St+Tolleson+AZ+85353',
    notes:   '3–4 fields. AZGL-hosted games.',
  },

  // ── ANTHEM COMMUNITY PARK ─────────────────────────────────────────────
  {
    id:      'anthem-community',
    name:    'Anthem Community Park',
    label:   'Anthem Park',
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

// Returns a short display name: just the field number for multi-field venues
export function fieldDisplayName(id: string) {
  const f = getFieldById(id);
  if (!f) return id;
  return f.name;
}
