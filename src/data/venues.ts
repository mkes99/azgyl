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
//   2. Paste a public link (a direct image URL, not a share-page link —
//      see the note in the optional `Venues` tab section below) into the
//      optional `Venues` Sheet tab, so someone can add or swap a field
//      map without touching code. If BOTH exist, the sheet's link wins —
//      it's treated as the more current one. If the sheet has no row (or
//      a blank fieldMapUrl cell) for a venue, whatever's hardcoded below
//      keeps being used. See GOOGLE_SHEETS_SETUP.md, "Venues tab" for
//      the sheet columns and the direct-link caveat.
// ─────────────────────────────────────────────────────────────────────────

import { parseCSV } from '@/lib/csv';

export interface Venue {
  id:           string;    // used in schedule.ts
  name:         string;    // 'Mesquite High School'
  address:      string;
  city:         string;
  mapUrl:       string;
  notes?:       string;    // venue-wide note, shown once per day (not per game) behind a
                            // click-to-open "Notes" disclosure — plain text
  fieldMapUrl?: string;    // optional — see note above; may be overridden by the Venues sheet
}

export const baseVenues: Venue[] = [

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

// ── OPTIONAL: field-map links via a `Venues` Sheet tab ─────────────────────
// Entirely optional — leave VENUES_CSV_URL empty and every venue just uses
// whatever fieldMapUrl (if any) is hardcoded above, no fetch happens at all.
// See GOOGLE_SHEETS_SETUP.md, "Venues tab" for how to set this up.
const VENUES_CSV_URL = ''; // paste the published Venues-tab CSV URL here (optional)

async function loadFieldMapOverrides(): Promise<Record<string, string>> {
  if (!VENUES_CSV_URL) return {};

  let res: Response;
  try {
    res = await fetch(VENUES_CSV_URL);
  } catch (err) {
    throw new Error(`[venues.ts] Could not reach the Venues sheet: ${(err as Error).message}\nURL: ${VENUES_CSV_URL}`);
  }
  if (!res.ok) {
    throw new Error(`[venues.ts] Venues sheet fetch failed: HTTP ${res.status}. Check it's still published to web as CSV (File → Share → Publish to web).\nURL: ${VENUES_CSV_URL}`);
  }

  const rows = parseCSV(await res.text());
  const knownIds = new Set(baseVenues.map(v => v.id));
  const errors: string[] = [];
  const overrides: Record<string, string> = {};

  rows.forEach((row, i) => {
    const rowNum = i + 2; // header is row 1
    const id = row.venue_id;
    if (!id) { errors.push(`Venues row ${rowNum}: missing venue_id`); return; }
    if (!knownIds.has(id)) { errors.push(`Venues row ${rowNum}: venue_id "${id}" doesn't match an id in the venues list below`); return; }
    if (row.fieldMapUrl) overrides[id] = row.fieldMapUrl;
  });

  if (errors.length) {
    throw new Error(
      `[venues.ts] ${errors.length} problem(s) in the Venues sheet — fix these and rebuild:\n` +
      errors.map(e => ` - ${e}`).join('\n')
    );
  }

  return overrides;
}

const fieldMapOverrides = await loadFieldMapOverrides();

export const venues: Venue[] = baseVenues.map(v =>
  fieldMapOverrides[v.id] ? { ...v, fieldMapUrl: fieldMapOverrides[v.id] } : v
);

// ── HELPERS ────────────────────────────────────────────────────────────────
export function getVenueById(id: string) {
  return venues.find(v => v.id === id);
}
