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
