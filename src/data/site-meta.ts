export const siteMeta = {
  "name": "Arizona Girls Youth Lacrosse",
  "shortName": "AZGYL",
  "domain": "azgyl.com",
  "description": "Arizona Girls Youth Lacrosse is the statewide rec league home for girls in grades K-8, built to give families a clear path into the game and a cleaner operational system for teams.",
  "tagline": "Statewide rec girls lacrosse, built for real families."
} as const;

export const nav = [
    { label: 'Home', href: '/' },
    { label: 'Parents', href: '/parents' },
    { label: 'Leadership', href: '/leadership' },
    { label: 'Resources', href: '/resources' },
    { label: 'Contact', href: '/contact' },
] as const;
