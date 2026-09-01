// ─────────────────────────────────────────────────────────────────────────
// SITE META — edit this to update league name, nav labels, and descriptions
// ─────────────────────────────────────────────────────────────────────────

export const siteMeta = {
  name:        'Arizona Girls Youth Lacrosse',
  shortName:   'AZGYL',
  domain:      'azgyl.com',
  description: 'Arizona Girls Youth Lacrosse is the statewide rec league home for girls in grades K–8 — clear on how to start, clear on where to play, and clear on how the league works.',
  tagline:     'Statewide rec girls lacrosse, built for real families.',
};

// Social links — referenced from SocialIcons.astro (footer) and the contact
// page. To add a platform: add an entry here, then add a matching icon to
// the `icons` map in SocialIcons.astro.
export const socialLinks = [
  { platform: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/arizonagirlsyouthlacrosse/' },
];

// Desktop nav (top-level links + dropdown groups)
export const primaryNav = [
  { label: 'Parents',    href: '/parents'   },
  { label: 'League',     href: '/league'    },
  { label: 'Leadership', href: '/leadership'},
  { label: 'Resources',  href: '/resources' },
  { label: 'Gallery',    href: '/gallery'   },
  { label: 'Contact',    href: '/contact'   },
];

// Dropdown under "Parents"
export const parentNav = [
  { label: 'Parent guide',      href: '/parents'              },
  { label: 'Find your club',    href: '/teams'                },
  { label: 'Age chart',         href: '/resources#age-chart'  },
  { label: 'Code of conduct',   href: '/resources#code-of-conduct' },
];

// Dropdown under "Resources"
export const resourceNav = [
  { label: 'Resources home',    href: '/resources'            },
  { label: 'Teams',             href: '/teams'                },
  { label: 'Rules',             href: '/rules'                },
  { label: 'League schedule',   href: '/league'               },
  // 'Boundaries' hidden site-wide 2026-08-31 — not back on the table until
  // spring. Restore this row (and see astro.config.mjs / src/pages/_disabled)
  // when it's ready to relaunch.
  { label: 'Age chart',         href: '/resources#age-chart'  },
  { label: 'Code of conduct',   href: '/resources#code-of-conduct' },
];
