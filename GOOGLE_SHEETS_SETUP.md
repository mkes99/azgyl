# Google Sheets Setup — Schedule & Standings Auto-Updates

Both the game schedule AND division standings update automatically from Google Sheets.
**Result:** Update the sheet → site rebuilds → live within ~2 minutes. Zero code editing.

---

## Step 1 — Create the Google Sheet

1. Go to sheets.google.com, create a new spreadsheet
2. Name it: **AZGYL Schedule & Standings**
3. Create two tabs: `Schedule` and `Standings`

---

## Step 2 — Schedule tab headers (Row 1, exact spelling)

| date | time | home | away | result | score | field | division | notes |

Result values: `upcoming` / `W` / `L` / `T`

---

## Step 3 — Standings tab headers (Row 1, exact spelling)

| division | team | W | L | T | GF | GA |

---

## Step 4 — Publish the sheet

File → Share → Publish to web → Entire Document → CSV → Publish

---

## Step 5 — Get your Sheet ID

From the URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`

---

## Step 6 — Add the Sheet ID

Open `src/data/sheets.ts` and replace:
```ts
const SHEET_ID = 'YOUR_SHEET_ID_HERE';
```
With your actual ID. Push to GitHub → auto-deploys.

---

## Step 7 — Set up auto-rebuild on Cloudflare

1. Cloudflare Pages → Settings → Builds → Deploy hooks → Add deploy hook
2. Copy the webhook URL

Then in your Google Sheet: Extensions → Apps Script → paste:

```javascript
const DEPLOY_HOOK = "YOUR_CLOUDFLARE_WEBHOOK_URL";
function onSheetEdit() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return;
  try { UrlFetchApp.fetch(DEPLOY_HOOK, { method: "post" }); }
  finally { lock.releaseLock(); }
}
```

Triggers → Add trigger → `onSheetEdit` → From spreadsheet → On edit

---

## Done. Your workflow:

Open sheet → update → save → site rebuilds in ~2 min → live automatically.
