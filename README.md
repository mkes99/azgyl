# AZGYL Website — V7

Arizona Girls Youth Lacrosse website built with the latest Astro and plain CSS.

## What is included

### Core pages
- Home
- Parents
- Parents / Parent Role
- Leadership
- Resources
- Resources / Age Chart
- Resources / Code of Conduct
- Teams
- Rules
- Boundaries
- Contact

### Reusable components
- `SiteHeader` — dark sticky header with mobile hamburger menu
- `SiteFooter` — dark footer with grouped navigation and copyright
- `PageHero` — full-width hero used across major pages
- `SectionIntro` — section eyebrow + title + intro block
- `TeamCard` — reusable program card with logo and accent color
- `TeamFinder` — reusable finder/filter block for city, zip, and division
- `FaqAccordion` — reusable FAQ accordion with open/close indicator

### Content/features
- Parent-first onboarding flow
- Find your club links under the parent flow
- Inline team directory filtering
- Styled 2026 age chart PDF
- Girls-specific parent role content
- Girls-specific code of conduct content
- USA Lacrosse external links only for official national standards
- Draft boundaries page with map + growth-market list
- Contact form that prepares a mailto draft until a live backend is connected

## Design system
- Light-first site with dark header and footer
- Purple and aqua brand accents restored
- Section-first layouts instead of heavy box stacks
- Plain CSS only, no Tailwind
- Subtle hover/fade motion only

## Project structure

```text
src/
  components/
  data/
  layouts/
  pages/
  styles/
public/
  assets/
    brand/
    docs/
    graphics/
    heroes/
    team-logos/
    visuals/
```

## Local development

```bash
npm install
npm run dev
```

Default Astro dev server:
- `http://localhost:4321`

## Build

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## How to update content

### Update team directory
Edit `src/data/site.ts`
- `teams` controls the team cards, finder, and featured programs
- each team supports:
  - `name`
  - `area`
  - `city`
  - `district`
  - `divisions`
  - `zipcode`
  - `href`
  - `notes`
  - `logo`
  - `color`

### Update FAQs
Edit `src/data/site.ts`
- `parentFaqs` controls the parent FAQ accordion

### Update committees and leadership
Edit `src/data/site.ts`
- `committees`

### Update hero copy or page content
Edit the page files in `src/pages/`

### Replace placeholder team logos
Drop new files into `public/assets/team-logos/`
Then update the logo path in `src/data/site.ts`

### Replace the age chart PDF
Replace:
- `public/assets/docs/azgyl-age-chart-2026.pdf`

## Contact form behavior
The contact form is currently static.
On submit it builds a pre-addressed `mailto:` draft to `info@azgyl.com`.

When email routing is finalized, connect the form to:
- Cloudflare Pages Functions
- Formspree
- Basin
- or another preferred endpoint

## Boundaries
Current boundaries are placeholders.
The site includes:
- a draft boundary page
- a draft map asset
- growth-market chips

When boundaries are finalized, update:
- `src/pages/boundaries.astro`
- `public/assets/graphics/arizona-zones.svg`
- team placement notes in `src/data/site.ts`

## Notes
- This version uses stock/stylized placeholder art and placeholder logos where real assets are not yet available.
- Team logos generated for this build are placeholders and should be replaced with official marks when approved.
- Rules and conduct content are written for the girls league and do not reference the boys league.


## Notes
- Leadership cards are data-driven and can support any number of people.
- Committee cards support title, description, and link arrays.
- Age chart rows are now generated from page data, so you can add or edit rows without changing the layout.
