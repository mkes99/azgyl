# TODO

Open work on the AZGYL site. Completed work is recorded in [CHANGELOG.md](CHANGELOG.md).

---

## Accessibility — remaining WCAG 2.1 AA work

Version 3.6 brought the site to AA on **colour only** — two success criteria:
`1.4.3 Contrast (Minimum)` and `1.4.11 Non-text Contrast`. That is roughly 2 of
~50 AA criteria. The rest are unaudited and any of them could currently fail.

Ordered by impact: the first group can stop someone using the site at all, the
second makes it harder, the third is compliance housekeeping.

### Blocking — can prevent use entirely

- [ ] **Keyboard operability.** Nothing has been tested with a keyboard alone.
      Highest-risk components, all custom or semi-custom:
      - Desktop nav dropdowns — built on `<details>`/`<summary>` with a JS
        outside-click handler. Check they open, close on `Esc`, and don't trap
        focus.
      - Mobile menu toggle in `BaseLayout.astro` — check it is reachable,
        operable by `Enter`/`Space`, and returns focus sensibly on close.
      - Schedule division/week filters in `LeagueSchedule.astro` — these are
        `<button role="tab">` without arrow-key handling; verify against the
        tabs pattern or drop the `role`.
- [ ] **Focus visible on every interactive element** (2.4.7). Only form inputs
      have a deliberate focus style. Buttons, nav links, tabs, chips and cards
      currently rely on the browser default, which may be invisible against the
      cream header or a hero photo.
- [ ] **Contact form labelling and error announcement** (3.3.1, 3.3.2, 4.1.3).
      Check every field has a programmatic label, that the required-field
      convention is conveyed to assistive tech and not by the `*` glyph alone,
      and that `.form-status` success/error messages are announced — they are
      currently plain `<div>`s with no live region.

### Degrading — harder to use

- [ ] **Alt text quality** (1.1.1). Team logos, hero photographs and the age
      chart. Hero images are already correctly `alt=""` + `aria-hidden`, but
      team logos and the age chart carry real meaning and need checking.
- [ ] **Heading order** (1.3.1). Verify no skipped levels; skipped headings
      break screen-reader document navigation.
- [ ] **Reflow at 400% zoom** (1.4.10) and **text spacing** (1.4.12). The
      schedule grid uses fixed `grid-template-columns` (`64px 110px 1fr 200px`)
      and is a likely failure point.
- [ ] **Touch target size** (2.5.8, AA in 2.2). Filter chips and schedule tabs
      are around 28-32px tall against a 24px minimum — close, worth measuring.

### Housekeeping

- [ ] **Page titles** (2.4.2) and **`lang`** (3.1.1) — spot-check each route.
- [ ] **Link purpose in context** (2.4.4). Several "Contact us" / "Rules" style
      links repeat identical text pointing to different places.
- [ ] **The age chart PDF** (`azgyl-age-chart-2026.pdf`) is a separate document
      with its own conformance requirements — tagged structure, reading order.

### Standing constraint — do not lose this

Contrast figures were re-measured after the 2026 photo replacement (10 hero
files, one per page — see below), by compositing the flat `--hero-scrim`
overlay over actual image pixels. `--hero-scrim` was lightened from `0.62` to
`0.45` (mobile: `0.66` → `0.49`) per a design request once the new photos were
live. Worst case across all 10 at the new value is 7.95:1 for the headline and
6.16:1 for the lead paragraph — still comfortably clear of the 4.5:1 AA
threshold. **Replacing any hero image, or lightening the scrim further,
invalidates these numbers** — a brighter photo or a lighter wash can push the
white headline back under AA.

`--hero-scrim` in `global.css` is the compensating control. After swapping a
hero, re-check the headline and lead paragraph against the new image.

**Second constraint, discovered 2026-08-14:** the rendered hero box is
noticeably wider (~2.2:1 on typical desktop viewports) than the 2000x1150
(1.74:1) source crop, so `object-fit: cover` crops roughly another ~20% off
the image height beyond what the saved file shows. `object-position: center
15%` on `.hero-bg, .page-hero-image` biases that extra crop toward the top so
it doesn't cut through heads/faces — this is a site-wide setting, not
per-photo. When cropping a **new** hero image, verify it in an actual browser
tab at the live page, not just by opening the saved file — the file can look
fine while the live page still decapitates someone.

---

## Content and configuration

- [ ] **Verify `EMAIL_TO` in the Cloudflare Pages environment.** 3.7 changed the
      contact form's fallback recipient to `azgirlsyouthlax@gmail.com`, but that
      fallback only applies when `EMAIL_TO` is unset. If it is already
      configured, it wins and the code change has no effect.
- [ ] **`EMAIL_FROM` is still `noreply@azgyl.com`.** Resend requires a verified
      sending domain, so this cannot simply become a Gmail address. Either
      verify `azgyl.com` with Resend or set up a sender that is verified.
- [x] **Board role addresses** — resolved by pointing all four board `mailto:`
      links at the league inbox (`azgirlsyouthlax@gmail.com`) instead of
      per-role `@azgyl.com` addresses that may not exist. Subject line is
      keyed off role, not name, so it survives board turnover.
- [x] **Board members are all `name: 'TBD'`** — real names added to
      `src/data/board.ts`.
- [ ] **Marana Reapers in historical standings.** The club is commented out
      of the directory but still appears in `standings.ts` (one 12U row).
      Left intact deliberately — removing it leaves the 12U standings not
      adding up. Decide which matters more: an accurate record, or a team
      never appearing after removal. (Its historical schedule games are no
      longer a code concern — as of 2026-08-31 `schedule.ts` has no local
      game data at all, it's fetched from the Sheet; whether historical
      Marana Reapers games are represented there is now a sheet-content
      decision, not a code one.)
- [ ] **Dead per-club `contact` addresses** in `src/data/teams.ts` (9 remaining,
      e.g. `solsisters@azgyl.com`). Nothing renders this field — it is unused
      data. Either wire it into the team cards or drop it.
- [ ] **Stale duplicate CSS in `global.css` for components that now have
      their own scoped `<style>`.** Confirmed twice so far: `SiteFooter.astro`
      (found + removed in 3.12 — it's what caused the logo-stacking bug
      during that fix) and `LeagueSchedule.astro` (found 2026-08-31 while
      adding desktop game-notes rendering — global.css's "10. Schedule &
      Standings" section still duplicates `.sched-list-header`, `.sl-matchup`,
      `.game-note`, etc., with slightly different values in places). Hasn't
      caused a second visible bug yet, but it's the exact same landmine
      shape — a scoped rule that doesn't happen to redeclare every property
      the stale global rule sets will silently inherit the stale value.
      Worth an actual audit: check every component with its own `<style>`
      block against global.css for a leftover duplicate section, not just
      react to the next one that bites.
- [x] **Hero photography.** All 10 hero slots replaced with real AZGYL game
      photos (2026 photo drop) — no more purple-banner clash, and each page
      now has its own distinct photo instead of sharing one of 3 files across
      up to 3 pages. See `CHANGELOG.md` for the full list.
- [ ] **Age chart division mismatch.** `AgeChart.astro` (the on-page table at
      `/resources#age-chart`) only shows 4 grade-based rows, K–2 through 7–8
      (8U–14U) — matching the "Grades K–8 only" language stated as policy
      elsewhere on the site (README's bylaw list, homepage, `/resources`,
      `/parents`). The downloadable chart (`azgyl-age-chart-2026.pdf`/`.jpg`)
      goes further — a birth-year grid covering 6U through **18U**. Confirmed
      2026-08-31 that the graphic is correct and the league now goes past 8th
      grade; the on-page table and the K–8 bylaw text were deliberately left
      unchanged pending the real grade/age mapping for the added divisions
      (15U–18U) — grade doesn't translate to birth-year cleanly (redshirting,
      cutoffs), and a birth-year table would need updating every year, so
      don't just transcribe the PDF's rows without checking with the board
      first. Needs: the real mapping, and updated bylaw wording, before either
      is edited.
- [x] **Boundaries hidden site-wide** (2026-08-31) — not back on the table
      until spring. All links removed (nav, footer, resource cards,
      committees); `/boundaries` now redirects to `/teams`
      (`astro.config.mjs`). Page source preserved at
      `src/pages/_disabled/boundaries.astro` — see the comment at the top of
      that file for how to restore it.

---

## Gallery

- [x] **Mosaic thumbnails crop photos** — resolved. Rebuilt `GalleryGrid.astro`
      as a CSS-columns masonry layout; every thumbnail shows the full,
      native-aspect-ratio photo with zero cropping.
- [ ] **Photo order is EXIF-capture-date order**, encoded as numeric filename
      prefixes in `src/assets/gallery/`. 4 photos lack EXIF (social-media
      re-encodes) and sort to the end. To reorder, rename files — no data
      file to edit.
- [ ] **Section-alternation audit is only done for the homepage and
      `/parents`.** Other pages (play, league, rules, leadership, boundaries,
      teams, resources, contact) haven't been checked for adjacent sections
      sharing the same `section-alt`/plain background.
- [x] **Gallery videos didn't play** — resolved. Source iPhone HDR footage
      carried 10-bit color through the ffmpeg re-encode (browsers can't
      decode 10-bit H.264 at all). If adding more video clips to the gallery
      in future, the ffmpeg encode must force `-pix_fmt yuv420p` explicitly —
      don't rely on the default, since an HDR source will silently produce
      an unplayable 10-bit file otherwise. Also dropped 2 near-instant
      (<1.5s) clips that were closer to Live Photos than real video content;
      gallery is down to 53 items (52 photos, 1 video).
