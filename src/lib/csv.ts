// Minimal CSV parser — handles quoted fields (commas/newlines inside
// quotes, "" as an escaped quote). No external dependency: the data this
// parses is small, well-controlled Google Sheets "Publish to web → CSV"
// output, not arbitrary user-uploaded CSV.
//
// Returns one object per data row, keyed by the header row's column names.
export function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  const pushField = () => { row.push(field); field = ''; };
  const pushRow = () => { pushField(); rows.push(row); row = []; };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      pushField();
    } else if (c === '\n') {
      pushRow();
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field.length || row.length) pushRow();

  const dataRows = rows.filter(r => r.some(cell => cell !== ''));
  if (dataRows.length === 0) return [];

  const headers = dataRows[0].map(h => h.trim());
  return dataRows.slice(1).map(r => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => { obj[h] = (r[idx] ?? '').trim(); });
    return obj;
  });
}

// Shared by every Sheet-driven data file (schedule.ts, standings.ts) so
// the fetch-and-fail-loud behavior — and its error messages — stay
// identical across all of them rather than drifting per-file copies.
// `source` identifies which file this fetch is for (e.g. 'schedule.ts'),
// `label` which tab (e.g. 'Seasons') — together they make the thrown
// error unambiguous about where to go fix things.
export async function fetchCSV(url: string, source: string, label: string): Promise<Record<string, string>[]> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new Error(`[${source}] Could not reach the ${label} sheet: ${(err as Error).message}\nURL: ${url}`);
  }
  if (!res.ok) {
    throw new Error(`[${source}] ${label} sheet fetch failed: HTTP ${res.status}. Check it's still published to web as CSV (File → Share → Publish to web).\nURL: ${url}`);
  }
  return parseCSV(await res.text());
}
