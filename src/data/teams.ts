// ─────────────────────────────────────────────────────────────────────────
// TEAMS
//
// Three clubs are commented out below rather than deleted, so they can be
// restored by removing the comment markers:
//   Marana Reapers · Cave Creek · Vail
// Commented out 2026-08-09.
//
// Note: the schedule and standings still contain historical Marana Reapers
// games (src/data/schedule.ts, src/data/standings.ts). Those are past results
// and were left intact — see CHANGELOG.
// ─────────────────────────────────────────────────────────────────────────

export const teams = [
  // {
  //   slug: 'marana-reapers',
  //   name: 'Marana Reapers',
  //   area: 'Marana',
  //   city: 'Marana',
  //   district: 'Marana USD',
  //   divisions: ['8U','10U','12U','14U'],
  //   zipcode: ['85653','85658'],
  //   contact: 'marana@azgyl.com',
  //   href: 'https://www.reaperslc.com/',
  //   notes: 'Northwest Tucson-area rec entry point with room for younger and returning players.',
  //   logo: '/assets/team-logos/marana-reapers.png',
  //   color: '#8B5CF6'
  // },
  {
    slug: 'sol-sisters',
    name: 'Sol Sisters',
    area: 'Tucson',
    city: 'Tucson',
    district: 'Tucson USD',
    divisions: ['8U','10U','12U','14U'],
    zipcode: ['85710','85711','85712','85730','85749'],
    contact: 'solsisters@azgyl.com',
    href: 'https://www.aztecgirlslacrosse.com/sol-sisters',
    notes: 'East and central Tucson program with a strong beginner-friendly lane.',
    logo: '/assets/team-logos/sol-sisters.png',
    color: '#F59E0B'
  },
  {
    slug: 'tukee-lightning',
    name: 'Tukee Lightning',
    area: 'Ahwatukee / South Phoenix',
    city: 'Phoenix',
    district: 'Kyrene / Tempe Union',
    divisions: ['8U','10U','12U','14U'],
    zipcode: ['85044','85045','85048'],
    contact: 'tukee@azgyl.com',
    href: 'https://www.ahwatukeelightningladieslacrosse.com/',
    notes: 'South Valley option serving Ahwatukee-area players and nearby schools.',
    logo: '/assets/team-logos/tukee-lightning.png',
    color: '#38BDF8'
  },
  {
    slug: 'oro-valley',
    name: 'Oro Valley',
    area: 'Oro Valley / Catalina Foothills',
    city: 'Oro Valley',
    district: 'Amphitheater / Catalina Foothills',
    divisions: ['8U','10U','12U','14U'],
    zipcode: ['85737','85742','85755'],
    contact: 'orovalley@azgyl.com',
    href: 'https://www.orovalleylacrosse.org/',
    notes: 'North Tucson program with established game-day operations and family support.',
    logo: '/assets/team-logos/oro-valley.png',
    color: '#F59E0B'
  },
  {
    slug: 'diamonds',
    name: 'Diamonds',
    area: 'Central Phoenix / Scottsdale',
    city: 'Phoenix',
    district: 'Phoenix Union / Scottsdale USD',
    divisions: ['8U','10U','12U','14U'],
    zipcode: ['85016','85018','85251','85254'],
    contact: 'diamonds@azgyl.com',
    href: 'https://dstix.leagueapps.com/',
    notes: 'Central Desert Stix group serving Arcadia, Biltmore, and South Scottsdale families.',
    logo: '/assets/team-logos/desert-stix-diamonds.png',
    color: '#60A5FA'
  },
  {
    slug: 'vipers',
    name: 'Vipers',
    area: 'North Phoenix',
    city: 'Phoenix',
    district: 'Paradise Valley USD',
    divisions: ['8U','10U','12U','14U'],
    zipcode: ['85022','85024','85028','85032','85050'],
    contact: 'vipers@azgyl.com',
    href: 'https://dstix.leagueapps.com/',
    notes: 'North Desert Stix group for North Valley families.',
    logo: '/assets/team-logos/desert-stix-vipers.png',
    color: '#22D3EE'
  },
  {
    slug: 'hotshots',
    name: 'Hotshots',
    area: 'South Valley / Southeast Phoenix',
    city: 'Phoenix',
    district: 'Tempe / South Mountain',
    divisions: ['8U','10U','12U','14U'],
    zipcode: ['85040','85041','85283','85284'],
    contact: 'hotshots@azgyl.com',
    href: 'https://dstix.leagueapps.com/',
    notes: 'South Desert Stix group supporting new-player development and local placement.',
    logo: '/assets/team-logos/desert-stix-hotshots.png',
    color: '#F97316'
  },
  {
    slug: 'hawks',
    name: 'Hawks',
    area: 'North Phoenix',
    city: 'Phoenix',
    district: 'Deer Valley USD',
    divisions: ['8U','10U','12U','14U'],
    zipcode: ['85027','85029','85053','85085','85086'],
    contact: 'hawks@azgyl.com',
    href: 'https://www.northphoenixlacrosse.org/',
    notes: 'North Phoenix option with beginner and returning-player pathways.',
    logo: '/assets/team-logos/hawks.png',
    color: '#14B8A6'
  },
  // {
  //   slug: 'cave-creek',
  //   name: 'Cave Creek',
  //   area: 'Cave Creek / Carefree / North Scottsdale',
  //   city: 'Cave Creek',
  //   district: 'Cave Creek USD',
  //   divisions: ['8U','10U','12U','14U'],
  //   zipcode: ['85331','85262','85266'],
  //   contact: 'cavecreek@azgyl.com',
  //   href: 'https://tshq.bluesombrero.com/Default.aspx?tabid=2666156',
  //   notes: 'Foothills option for families north of Scottsdale and east of North Phoenix.',
  //   logo: '/assets/team-logos/cave-creek.png',
  //   color: '#EC4899'
  // },
  {
    slug: 'chandler-lax',
    name: 'Chandler Lax',
    area: 'Chandler / Gilbert / South East Valley',
    city: 'Chandler',
    district: 'Chandler Unified',
    divisions: ['8U','10U','12U','14U'],
    zipcode: ['85224','85225','85226','85248','85249'],
    contact: 'chandler@azgyl.com',
    href: 'https://chandlerlacrosse.org/',
    notes: 'Strong East Valley anchor for families in Chandler, Gilbert, and nearby school communities.',
    logo: '/assets/team-logos/chandler-lax.png',
    color: '#EF4444'
  },
  {
    slug: 'east-valley-bullets',
    name: 'East Valley Bullets',
    area: 'Mesa / Queen Creek / East Valley',
    city: 'Mesa',
    district: 'Mesa Public Schools',
    divisions: ['8U','10U','12U','14U'],
    zipcode: ['85201','85203','85204','85206','85142'],
    contact: 'eastvalley@azgyl.com',
    href: 'https://www.eastvalleybulls.com/',
    notes: 'East Valley lane for Mesa, Queen Creek, and nearby growth areas.',
    logo: '/assets/team-logos/east-valley-bullets.png',
    color: '#F97316'
  },
  // {
  //   slug: 'vail',
  //   name: 'Vail',
  //   area: 'Vail / Southeast Tucson',
  //   city: 'Vail',
  //   district: 'Vail Unified',
  //   divisions: ['8U','10U','12U','14U'],
  //   zipcode: ['85641','85747'],
  //   contact: 'vail@azgyl.com',
  //   href: '#',
  //   notes: 'Southeast Tucson growth-area team listing awaiting finalized public club link and official assets.',
  //   logo: '/assets/team-logos/vail-placeholder.png',
  //   color: '#7C3AED'
  // },
];
