// ─────────────────────────────────────────────────────────────────────────
// ANNOUNCEMENT BANNER — site-wide bar above the header.
//
// Dates are evaluated in the visitor's browser against wall-clock time in
// Arizona (America/Phoenix, fixed UTC-7 — the state does not observe DST,
// so a hardcoded -07:00 offset is safe year-round). The site is a fully
// static build, so this check runs client-side rather than at build time —
// that's what makes `endDate` take effect at the right moment regardless of
// when the site was last deployed.
//
// - `startDate`: null/empty = visible immediately. Otherwise an ISO string
//   like '2026-09-01T00:00:00-07:00'.
// - `endDate`: null/empty = never expires. Otherwise an ISO string in the
//   same format — the banner stops showing at that instant.
// - `dismissible`: true adds a close (×) button that hides the banner for
//   the visitor's current browser session (sessionStorage) — reappears on
//   their next visit. false removes the close button entirely.
// ─────────────────────────────────────────────────────────────────────────

export const announcement = {
  enabled:     true,
  message:     'New: the AZGYL × State Forty Eight tee just dropped — $30, pre-order by 9/30.',
  linkLabel:   'Shop the Tee',
  linkHref:    'https://arizona-girls-youth-lacrosse.square.site/',
  dismissible: false,
  startDate:   null,
  endDate:     '2026-10-01T00:00:00-07:00',
};
