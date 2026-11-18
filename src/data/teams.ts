// ─────────────────────────────────────────────────────────────────────────
// TEAMS
//
// Replaced in full on 2026-11-16 with the six clubs from the team
// registration form responses. Previous clubs (Sol Sisters, Tukee Lightning,
// Oro Valley, Diamonds, Vipers, South Hotshots, Hawks, Chandler Lax, East Valley
// Bullets, plus the already-hidden Marana Reapers / Cave Creek / Vail) were
// removed — see git history to restore them.
//
// Note: the schedule and standings still contain historical games under the
// old team names (src/data/schedule.ts, src/data/standings.ts). Those are
// past results and were left intact — see CHANGELOG.
//
// `slug` is NOT a field you set here — it's derived automatically from
// `name` below (lowercased, spaces/punctuation collapsed to hyphens), so
// don't add a `slug:` line to a new team entry. See `slugify()` and the
// `export const teams` line at the bottom of this file. Changed 2026-08-31 —
// see CHANGELOG for why.
//
// `zipcode` is left empty for clubs that didn't supply service-area zips.
// Oro Valley Lacrosse's zips (Oro Valley, Marana, Greater Tucson) were filled
// in by us — it's the only club serving that region right now.
// ─────────────────────────────────────────────────────────────────────────

const teamsRaw = [
  {
    name: 'Ahwatukee Lightning',
    area: 'Phoenix / Ahwatukee',
    city: 'Phoenix',
    district: '',
    divisions: ['8U','10U','12U','14U'],
    zipcode: [] as string[],
    contact: ['razcon3@msn.com'],
    href: 'https://www.ahwatukeelightningladieslacrosse.com/',
    notes: 'Ahwatukee-based program serving Phoenix and Ahwatukee players across all four divisions.',
    logo: '/assets/team-logos/ahwatukee-lightning.png',
    color: '#E4679A'
  },
  {
    name: 'Arrowhead Lady Warriors',
    area: 'Glendale / Peoria / North Phoenix / West Valley',
    city: 'Glendale',
    district: 'Deer Valley / Peoria USD',
    divisions: ['8U','10U'],
    zipcode: [] as string[],
    contact: ['girlslax@arrowheadlacrosse.com'],
    href: 'https://arrowheadlacrosse.com/girls/',
    notes: 'Northwest Valley program serving Arrowhead (Glendale), parts of North Phoenix, and the West Valley.',
    logo: '/assets/team-logos/arrowhead-lady-warriors.png',
    color: '#E3006E'
  },
  {
    name: 'Oro Valley Lacrosse',
    area: 'Oro Valley / Marana / Greater Tucson',
    city: 'Oro Valley',
    district: '',
    divisions: ['10U','12U','14U'],
    zipcode: [
      // Oro Valley
      '85704','85737','85738','85742','85755',
      // Marana
      '85653','85658','85741','85743',
      // Greater Tucson
      '85701','85705','85706','85710','85711','85712','85713','85714','85715','85716','85718','85719','85730','85745','85746','85747','85748','85749','85750',
    ],
    contact: ['orovalleylax@gmail.com'],
    href: 'https://orovalleylacrosse.org/',
    notes: 'Tucson-area program serving Oro Valley, Marana, and the greater Tucson community.',
    logo: '/assets/team-logos/oro-valley-lacrosse.png',
    color: '#00225B'
  },
  {
    name: 'Central Diamonds',
    area: 'South Scottsdale / Old Town / Arcadia / Central Phoenix / Paradise Valley',
    city: 'Phoenix',
    district: 'Paradise Valley / Phoenix / Scottsdale',
    divisions: ['8U','10U','12U','14U'],
    zipcode: ['85012','85013','85014','85015','85016','85018','85250','85251','85253','85257'],
    contact: ['info@azgl.com','info@desertstix.com'],
    href: 'https://dstix.leagueapps.com/?mngr=true',
    notes: 'Desert Stix central group serving South Scottsdale, Old Town, Arcadia, Central Phoenix, and Paradise Valley.',
    logo: '/assets/team-logos/central-diamonds.png',
    color: '#282F7F'
  },
  {
    name: 'North Vipers',
    area: 'North Scottsdale / North Phoenix / Carefree / Fountain Hills / Cave Creek',
    city: 'Scottsdale',
    district: 'North Central / North East Valley',
    divisions: ['8U','10U','12U','14U'],
    zipcode: ['85022','85024','85028','85032','85050','85054','85254','85255','85260','85262','85266','85268','85331','85377'],
    contact: ['info@azgl.com','info@desertstix.com'],
    href: 'https://dstix.leagueapps.com/?mngr=true',
    notes: 'Desert Stix north group serving North Scottsdale, North Phoenix, Carefree, Fountain Hills, and Cave Creek.',
    logo: '/assets/team-logos/north-vipers.png',
    color: '#EE5196'
  },
  {
    name: 'South Hotshots',
    area: 'Gilbert / South Mesa / South Tempe / Northeast Chandler',
    city: 'Gilbert',
    district: '',
    divisions: ['8U','10U','12U','14U'],
    zipcode: ['85202','85204','85206','85209','85210','85212','85224','85225','85226','85233','85234','85249','85283','85284','85286','85295','85296','85297','85298'],
    contact: ['info@azgl.com','info@desertstix.com'],
    href: 'https://dstix.leagueapps.com/?mngr=true',
    notes: 'Desert Stix south group serving Gilbert, South Mesa, South Tempe, and Northeast Chandler.',
    logo: '/assets/team-logos/south-hotshots.png',
    color: '#00B0AD'
  },
];

// Derives a URL-safe slug from a team's name — e.g. 'Central Diamonds' -> 'central-diamonds'.
// Lowercases, then collapses anything that isn't a-z/0-9 into a single hyphen
// and trims leading/trailing hyphens.
const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const teams = teamsRaw.map(team => ({ slug: slugify(team.name), ...team }));
