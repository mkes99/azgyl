// ─────────────────────────────────────────────────────────────────────────
// GOOGLE DRIVE LINK NORMALIZATION  ·  src/lib/driveLink.ts
// ─────────────────────────────────────────────────────────────────────────
//
// A field-map URL entered on the Schedule sheet is whatever Google Drive's
// "Copy link" button hands someone after they share a file — a share-page
// URL like:
//   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
// which renders a Drive viewer page, not a bare image. The site needs the
// direct-image form instead:
//   https://drive.google.com/uc?export=view&id=FILE_ID
//
// This pulls the file id out of whatever Drive link shape shows up (the
// current share-page form, the older `open?id=` form, or one that's
// already in the direct-view form) and rebuilds the direct-view URL, so
// nobody filling out the sheet has to do that translation by hand — they
// just paste what "Copy link" gave them. Anything that isn't a Drive link
// at all (a repo-relative path, some other host) passes through untouched.
// ─────────────────────────────────────────────────────────────────────────

const DRIVE_FILE_PATH_RE = /\/file\/d\/([a-zA-Z0-9_-]+)/;
const DRIVE_ID_PARAM_RE = /[?&]id=([a-zA-Z0-9_-]+)/;

export function normalizeFieldMapUrl(url: string): string {
  if (!url || !url.includes('drive.google.com')) return url;

  const id = url.match(DRIVE_FILE_PATH_RE)?.[1] || url.match(DRIVE_ID_PARAM_RE)?.[1];
  if (!id) return url;

  return `https://drive.google.com/uc?export=view&id=${id}`;
}
