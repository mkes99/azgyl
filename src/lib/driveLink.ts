// ─────────────────────────────────────────────────────────────────────────
// GOOGLE DRIVE LINK NORMALIZATION  ·  src/lib/driveLink.ts
// ─────────────────────────────────────────────────────────────────────────
//
// A field-map URL entered on the Schedule sheet is whatever Google Drive's
// "Copy link" button hands someone after they share a file — a share-page
// URL like:
//   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
// which renders a Drive viewer page, not a bare image. The site needs the
// direct-image form instead — served from lh3.googleusercontent.com,
// Google's actual image CDN (the same infrastructure behind Google Photos
// and profile pictures), not the drive.google.com/uc?export=view trick.
// Both resolve the same file, but uc?export=view is an informal, long-
// standing community workaround that isn't part of any documented Drive
// API and has been observed 503'ing under repeated requests in testing —
// lh3 is the more production-grade of the two:
//   https://lh3.googleusercontent.com/d/FILE_ID
//
// This pulls the file id out of whatever Drive link shape shows up (the
// current share-page form, the older `open?id=` form, or the uc?export=view
// form) and rebuilds the lh3 form, so nobody filling out the sheet has to
// do that translation by hand — they just paste what "Copy link" gave
// them. Anything that isn't a Drive link at all (a repo-relative path,
// some other host) passes through untouched.
// ─────────────────────────────────────────────────────────────────────────

const DRIVE_FILE_PATH_RE = /\/file\/d\/([a-zA-Z0-9_-]+)/;
const DRIVE_ID_PARAM_RE = /[?&]id=([a-zA-Z0-9_-]+)/;

export function normalizeFieldMapUrl(url: string): string {
  if (!url || !url.includes('drive.google.com')) return url;

  const id = url.match(DRIVE_FILE_PATH_RE)?.[1] || url.match(DRIVE_ID_PARAM_RE)?.[1];
  if (!id) return url;

  return `https://lh3.googleusercontent.com/d/${id}`;
}
