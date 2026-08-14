# Updating Standings — Two Options

## Option A: Google Sheets (no code, recommended)

Update standings from a spreadsheet. Zero code changes required after setup.

### One-time setup (10 minutes)

**1. Create the standings sheet**

In your existing AZGYL spreadsheet (or a new one), add a tab called `Standings` with these exact column headers in Row 1:

```
division | team | W | L | T | GF | GA
```

Example rows:
```
12U | Diamonds | 4 | 1 | 0 | 38 | 22
12U | Hawks | 3 | 2 | 0 | 29 | 27
12U | Vipers | 2 | 2 | 1 | 24 | 24
14U | Tukee Lightning 1 | 3 | 1 | 1 | 28 | 20
```

**2. Get the CSV publish URL**

- File → Share → Publish to web
- Change "Web page" to **CSV**
- Select the **Standings** tab
- Click Publish and copy the URL

**3. Paste the URL into the codebase**

Open `src/data/standings.ts` and paste the URL:

```ts
export const STANDINGS_CSV_URL = 'https://docs.google.com/spreadsheets/d/.../gviz/tq?tqx=out:csv&sheet=Standings';
```

Push to GitHub → Cloudflare auto-deploys → done.

**4. Weekly workflow after that**

1. Open the Google Sheet
2. Update the numbers (W, L, T, GF, GA) for each team
3. Go to Cloudflare Pages dashboard → click **Redeploy** (or set up auto-deploy via webhook — see GOOGLE_SHEETS_SETUP.md)
4. Site is live with new standings in ~2 minutes

That's it. No code, no files, just a spreadsheet.

---

## Option B: Edit the file directly

Open `src/data/standings.ts` and update the numbers inline:

```ts
{ team:'Diamonds', W:4, L:1, T:0, GF:38, GA:22 },
{ team:'Hawks',    W:3, L:2, T:0, GF:29, GA:27 },
```

Then push to GitHub → Cloudflare auto-deploys.

This is fine for whoever manages the repo. Use Option A if you want a non-developer to own standings updates.

---

## Team name matching

Team names in the standings sheet must **exactly match** the names in `src/data/teams.ts`.

| ✓ Correct | ✗ Wrong |
|-----------|---------|
| `Tukee Lightning` | `Tukee` |
| `Marana Reapers` | `Reapers` |
| `East Valley Bullets` | `Bullets` |
| `Chandler Lax` | `Chandler` |

---

## How standings are sorted

Automatically: Points (W=3, T=1) descending, then goal differential (+/-) as tiebreaker.
You never need to sort the sheet yourself.
