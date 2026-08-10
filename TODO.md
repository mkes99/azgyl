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

Contrast figures in 3.6 were measured against **the six hero photographs
currently in `public/assets/heroes/`**, by compositing the overlay over actual
image pixels. **Replacing any hero image invalidates the numbers for that page**
— a brighter photo can push the white headline back under AA.

`--hero-scrim` in `global.css` is the compensating control. After swapping a
hero, re-check the headline and lead paragraph against the new image.

---

## Content and configuration

- [ ] **Verify `EMAIL_TO` in the Cloudflare Pages environment.** 3.7 changed the
      contact form's fallback recipient to `azgirlsyouthlax@gmail.com`, but that
      fallback only applies when `EMAIL_TO` is unset. If it is already
      configured, it wins and the code change has no effect.
- [ ] **`EMAIL_FROM` is still `noreply@azgyl.com`.** Resend requires a verified
      sending domain, so this cannot simply become a Gmail address. Either
      verify `azgyl.com` with Resend or set up a sender that is verified.
- [ ] **Board role addresses** — `president@`, `vicepresident@`, `treasurer@`
      and `secretary@` on `azgyl.com` are shown on `/leadership` as `mailto:`
      links. If those mailboxes do not exist, anyone contacting a board member
      is emailing into a void. Decide whether to point them at the league inbox
      or stand up real addresses.
- [ ] **Board members are all `name: 'TBD'`** in `src/data/board.ts`.
- [ ] **Marana Reapers in historical results.** The club is commented out of the
      directory but still appears in `schedule.ts` (4 games) and `standings.ts`
      (one 12U row). Left intact deliberately — removing them rewrites completed
      results and leaves the 12U standings not adding up. Decide which matters
      more: an accurate record, or a team never appearing after removal.
- [ ] **Dead per-club `contact` addresses** in `src/data/teams.ts` (9 remaining,
      e.g. `solsisters@azgyl.com`). Nothing renders this field — it is unused
      data. Either wire it into the team cards or drop it.
- [ ] **Hero photography.** The home hero contains prominent purple opposition
      banners that clash with the rose/olive palette. A neutral overlay does not
      fix this; it is a photo-selection question.
