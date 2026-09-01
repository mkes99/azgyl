// Publishes the current valid team names, divisions, and venue ids as JSON.
// The Google Sheet's Apps Script validator (see GOOGLE_SHEETS_SETUP.md)
// fetches this before allowing a deploy, so the sheet's validation always
// matches what teams.ts/venues.ts actually contain — no second list to
// keep in sync by hand. `field` isn't included — it's free text, not
// validated against a fixed list.
import { teams } from '@/data/teams';
import { venues } from '@/data/venues';

export async function GET() {
  const teamNames = teams.map(t => t.name).sort();
  const divisions = [...new Set(teams.flatMap(t => t.divisions))].sort();
  const venueIds = venues.map(v => v.id).sort();

  return new Response(JSON.stringify({ teamNames, divisions, venueIds }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
}
