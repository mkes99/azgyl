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

// Desktop nav (top-level links + dropdown groups)
export const primaryNav = [
  { label: 'Parents',    href: '/parents'   },
  { label: 'League',     href: '/league'    },
  { label: 'Leadership', href: '/leadership'},
  { label: 'Resources',  href: '/resources' },
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
  { label: 'Boundaries',        href: '/boundaries'           },
  { label: 'Age chart',         href: '/resources#age-chart'  },
  { label: 'Code of conduct',   href: '/resources#code-of-conduct' },
];
