// Publishes the current valid team names, divisions, and field ids as JSON.
// The Google Sheet's Apps Script validator (see GOOGLE_SHEETS_SETUP.md)
// fetches this before allowing a deploy, so the sheet's validation always
// matches what teams.ts/fields.ts actually contain — no second list to
// keep in sync by hand.
import { teams } from '@/data/teams';
import { fields } from '@/data/fields';

export async function GET() {
  const teamNames = teams.map(t => t.name).sort();
  const divisions = [...new Set(teams.flatMap(t => t.divisions))].sort();
  const fieldIds = fields.map(f => f.id).sort();

  return new Response(JSON.stringify({ teamNames, divisions, fieldIds }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
}
