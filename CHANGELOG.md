# Changelog

All notable changes to the AZGYL site are recorded here, newest first.
Versions continue the `version 3.x` sequence used in the commit history up to 3.4.

---

## [3.6] — 2026-08-09 — Accessibility: WCAG 2.1 AA colour pass

Brought every colour pair on the site to WCAG 2.1 AA. Verified against
**1.4.3 Contrast (Minimum)** for text and **1.4.11 Non-text Contrast** for
control boundaries and focus indicators. Hero ratios were measured by
compositing the overlay over the actual photograph pixels and taking the
98th-percentile brightest background under each block of text, so the numbers
reflect near-worst-case rather than average.

### Changed — visible

- **Primary buttons** now use `--rose-deep` instead of `--rose`.
  White on `#d7657b` measured **3.48:1** against a 4.5 requirement; it is now
  **5.23:1**. Affects every "Find My Team" CTA and the active team-finder chip.
- **Hero accent** ("all of Arizona.") lightened to `#efaebb`, from **1.38:1** to
  **3.39:1**. This was the worst failure on the site. Darkening the overlay
  alone could not fix it — even at 90% black the original rose only reached
  5.05:1, by which point the photograph was gone.
- **Hero overlay** deepened from `rgba(0,0,0,.55)` to `.62` (`.66` under 760px),
  which was required to carry the hero lead paragraphs on every photo.

### Changed — no visible difference

- `--soft` `#9a8f84` → `#736b63`. Fixes meta text, table headers, placeholders,
  schedule labels and footer fine print in one token (was 2.75–3.16:1).
- `--rose-deep` `#b84d63` → `#b14a5f`. Fixes nav active state, footer link
  hovers, ghost buttons, checklist ticks and eyebrow chips (was 4.26–4.45:1).
- `.lead` opacity `.84` → `.92`, clearing `play-hero.jpg` (was 4.42:1).

### Fixed

- **Link hovers reduced readability.** Schedule, standings and home-preview
  links dropped *to* `--rose` on hover — hovering took them from compliant to
  3.48:1. They now go to `--rose-deeper` (6.38:1).
- **Rank badge** in standings used a `rose → olive` gradient; the light end
  failed white labels at 3.48:1.
- **Form input borders** were `rgba(28,26,23,.10)` — **1.23:1** against white,
  against a 3:1 requirement for control boundaries. Added `--line-strong`
  (`.50`, 3.35:1) for inputs, tabs, chips and outline buttons. Decorative card
  and table edges keep the lighter `--line`.
- **Focus rings** went from a `.12` halo in `--rose` to `.30` in `--rose-deep`.

### Palette rule

`--rose` (`#d7657b`) is now fills-only — buttons' glow, dots, pips, borders.
It is never used for text or button labels. `--rose-deep` is the text-safe
tone, `--rose-deeper` the hover. This is documented in `:root` so it survives
future edits.

### Not covered

Only the two colour criteria were assessed. Alt-text quality, heading order,
keyboard operability (nav dropdowns, mobile menu, schedule filters), form
labelling and error announcement, focus order, touch targets and 400% reflow
are **not** audited.

Contrast figures are tied to the six hero photographs currently in
`public/assets/heroes/`. Replacing a hero image invalidates them — a brighter
photo can push the white headline back under AA. `--hero-scrim` is the
compensating control.

---

## [3.5] — 2026-08-09 — Cream header and footer, larger logo, flat hero overlay

Moved the site frame from charcoal to the cream sampled out of the logo
artwork, and enlarged the mark.

### Changed

- **Header and footer** are now `#fbeed0`, taken directly from the logo file, so
  the mark sits on the same field it was drawn on. Nav ink is olive with rose
  active states.
- **Logo 88px → 144px**, switched to the transparent asset. On the old charcoal
  header the logo needed its baked-in cream background and rounded corners to
  read as deliberate, which capped how large it could go. A cream header removes
  that constraint. Header bar 108px → 164px.
- **Header shrinks on scroll** to 104px/84px past 40px of scroll, so the larger
  mark costs no viewport height. Added `[data-scrolled]` and a scroll listener
  in `BaseLayout.astro`.
- **Footer logo** dropped its `#fbeed0` tile, now redundant against a cream
  footer.
- **Hero overlays** replaced a three-stop `110deg` gradient with a single flat
  wash, exposed as `--hero-scrim`. Interior heroes previously used `.45` and now
  share the same value as the home hero.
- `theme-color` meta updated to `#fbeed0`.

---

## 3.4 and earlier

Not recorded here. See `git log` — notable prior work includes the rebrand pass
with real hero photography and the rose/olive palette (`b170f3a`).
