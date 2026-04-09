export const site = {
  name: 'Arizona Girls Youth Lacrosse',
  shortName: 'AZGYL',
  domain: 'azgyl.com',
  description:
    'Arizona Girls Youth Lacrosse is the statewide rec league home for girls in grades K-8, built to give families a clear path into the game and a cleaner operational system for teams.',
  tagline: 'Statewide rec girls lacrosse, built for real families.',
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Parents', href: '/parents' },
    { label: 'Leadership', href: '/leadership' },
    { label: 'Resources', href: '/resources' },
    { label: 'Contact', href: '/contact' },
  ],
  quickStats: ['Statewide Rec', 'Grades K-8', '1-4 Practices / Week', 'USA Lacrosse Required'],
  seasonHighlights: [
    {
      title: 'Rec-first structure',
      body: 'AZGYL coordinates scheduling, officials, fields, and league standards so local teams can focus on players and families.',
    },
    {
      title: 'Four divisions',
      body: '8U, 10U, 12U, and 14U divisions keep development age-appropriate and easier for parents to understand.',
    },
    {
      title: 'Clear placement path',
      body: 'Players are expected to play for their school-affiliated team or the closest eligible team to home when no affiliated team exists.',
    },
  ],
  teams: [
    {
      slug: 'marana-reapers',
      name: 'Marana Reapers', area: 'Marana', city: 'Marana', district: 'Marana USD', divisions: ['8U','10U','12U','14U'], zipcode: ['85653','85658'], contact: 'marana@azgyl.com', href: 'https://www.reaperslc.com/', notes: 'Northwest Tucson-area rec entry point with room for younger and returning players.', logo: '/assets/team-logos/marana-reapers.png', color: '#8B5CF6'
    },
    {
      slug: 'sol-sisters',
      name: 'Sol Sisters', area: 'Tucson', city: 'Tucson', district: 'Tucson USD', divisions: ['8U','10U','12U','14U'], zipcode: ['85710','85711','85712','85730','85749'], contact: 'solsisters@azgyl.com', href: 'https://www.aztecgirlslacrosse.com/sol-sisters', notes: 'East and central Tucson program with a strong beginner-friendly lane.', logo: '/assets/team-logos/sol-sisters.png', color: '#F59E0B'
    },
    {
      slug: 'tukee-lightning',
      name: 'Tukee Lightning', area: 'Ahwatukee / South Phoenix', city: 'Phoenix', district: 'Kyrene / Tempe Union', divisions: ['8U','10U','12U','14U'], zipcode: ['85044','85045','85048'], contact: 'tukee@azgyl.com', href: 'https://www.ahwatukeelightningladieslacrosse.com/', notes: 'South Valley option serving Ahwatukee-area players and nearby schools.', logo: '/assets/team-logos/tukee-lightning.png', color: '#38BDF8'
    },
    {
      slug: 'oro-valley',
      name: 'Oro Valley', area: 'Oro Valley / Catalina Foothills', city: 'Oro Valley', district: 'Amphitheater / Catalina Foothills', divisions: ['8U','10U','12U','14U'], zipcode: ['85737','85742','85755'], contact: 'orovalley@azgyl.com', href: 'https://www.orovalleylacrosse.org/', notes: 'North Tucson program with established game-day operations and family support.', logo: '/assets/team-logos/oro-valley.png', color: '#F59E0B'
    },
    {
      slug: 'diamonds',
      name: 'Diamonds', area: 'Central Phoenix / Scottsdale', city: 'Phoenix', district: 'Phoenix Union / Scottsdale USD', divisions: ['8U','10U','12U','14U'], zipcode: ['85016','85018','85251','85254'], contact: 'diamonds@azgyl.com', href: 'https://dstix.leagueapps.com/', notes: 'Central Desert Stix group serving Arcadia, Biltmore, and South Scottsdale families.', logo: '/assets/team-logos/desert-stix-diamonds.png', color: '#60A5FA'
    },
    {
      slug: 'vipers',
      name: 'Vipers', area: 'North Phoenix', city: 'Phoenix', district: 'Paradise Valley USD', divisions: ['8U','10U','12U','14U'], zipcode: ['85022','85024','85028','85032','85050'], contact: 'vipers@azgyl.com', href: 'https://dstix.leagueapps.com/', notes: 'North Desert Stix group for North Valley families.', logo: '/assets/team-logos/desert-stix-vipers.png', color: '#22D3EE'
    },
    {
      slug: 'hotshots',
      name: 'Hotshots', area: 'South Valley / Southeast Phoenix', city: 'Phoenix', district: 'Tempe / South Mountain', divisions: ['8U','10U','12U','14U'], zipcode: ['85040','85041','85283','85284'], contact: 'hotshots@azgyl.com', href: 'https://dstix.leagueapps.com/', notes: 'South Desert Stix group supporting new-player development and local placement.', logo: '/assets/team-logos/desert-stix-hotshots.png', color: '#F97316'
    },
    {
      slug: 'hawks',
      name: 'Hawks', area: 'North Phoenix', city: 'Phoenix', district: 'Deer Valley USD', divisions: ['8U','10U','12U','14U'], zipcode: ['85027','85029','85053','85085','85086'], contact: 'hawks@azgyl.com', href: 'https://www.northphoenixlacrosse.org/', notes: 'North Phoenix option with beginner and returning-player pathways.', logo: '/assets/team-logos/hawks.png', color: '#14B8A6'
    },
    {
      slug: 'cave-creek',
      name: 'Cave Creek', area: 'Cave Creek / Carefree / North Scottsdale', city: 'Cave Creek', district: 'Cave Creek USD', divisions: ['8U','10U','12U','14U'], zipcode: ['85331','85262','85266'], contact: 'cavecreek@azgyl.com', href: 'https://tshq.bluesombrero.com/Default.aspx?tabid=2666156', notes: 'Foothills option for families north of Scottsdale and east of North Phoenix.', logo: '/assets/team-logos/cave-creek.png', color: '#EC4899'
    },
    {
      slug: 'chandler-lax',
      name: 'Chandler Lax', area: 'Chandler / Gilbert / South East Valley', city: 'Chandler', district: 'Chandler Unified', divisions: ['8U','10U','12U','14U'], zipcode: ['85224','85225','85226','85248','85249'], contact: 'chandler@azgyl.com', href: 'https://chandlerlacrosse.org/', notes: 'Strong East Valley anchor for families in Chandler, Gilbert, and nearby school communities.', logo: '/assets/team-logos/chandler-lax.png', color: '#EF4444'
    },
    {
      slug: 'east-valley-bullets',
      name: 'East Valley Bullets', area: 'Mesa / Queen Creek / East Valley', city: 'Mesa', district: 'Mesa Public Schools', divisions: ['8U','10U','12U','14U'], zipcode: ['85201','85203','85204','85206','85142'], contact: 'eastvalley@azgyl.com', href: 'https://www.eastvalleybulls.com/', notes: 'East Valley lane for Mesa, Queen Creek, and nearby growth areas.', logo: '/assets/team-logos/east-valley-bullets.png', color: '#F97316'
    },
    {
      slug: 'vail',
      name: 'Vail', area: 'Vail / Southeast Tucson', city: 'Vail', district: 'Vail Unified', divisions: ['8U','10U','12U','14U'], zipcode: ['85641','85747'], contact: 'vail@azgyl.com', href: '#', notes: 'Southeast Tucson growth-area team listing awaiting finalized public club link and official assets.', logo: '/assets/team-logos/vail-placeholder.png', color: '#7C3AED'
    },
  ],
  expansionAreas: [
    { name: 'Flagstaff / Northern Arizona', note: 'Track family demand, field access, and coach leads before launch.' },
    { name: 'Prescott / Quad Cities', note: 'Use this as a draft market until a local team path is approved.' },
    { name: 'Yuma / Western Arizona', note: 'Future region once player density and field support are in place.' },
    { name: 'Sierra Vista / Cochise County', note: 'Growth area for Southeast Arizona interest and future team approval.' },
  ],
  parentFaqs: [
    { q: 'My daughter has never played. Is that okay?', a: 'Yes. Rec is the on-ramp. Most families need a clear starting point, basic equipment, and a team contact more than they need prior experience.' },
    { q: 'How often do teams practice?', a: 'Expect 1-4 practices per week depending on age group, field access, coach plan, and time of season.' },
    { q: 'Do we need USA Lacrosse membership?', a: 'Yes. Players, coaches, and officials all need current USA Lacrosse membership before participating in league play.' },
    { q: 'How are teams assigned?', a: 'The base rule is school-affiliated placement first. If no school-affiliated team exists, placement falls to the closest eligible team to the player home domicile until boundaries are finalized.' },
    { q: 'Can we choose a different team?', a: 'Not by default. Exceptions require a formal review so the league can protect fair placement, prevent recruiting, and keep rec sustainable.' },
    { q: 'What should we buy first?', a: 'Start with a stick, protective eyewear, mouthguard, and cleats. Buy reliable basics before you spend money on extras.' },
  ],
  rulesSummary: [
    { title: 'League role', body: 'AZGYL coordinates scheduling, officials, and field-facing structure. Teams remain responsible for their own team operations and finances.' },
    { title: 'Eligibility', body: 'League play is for girls in grades K-8. Placement follows school enrollment and domicile rules, with hardship and transfer review handled through league governance.' },
    { title: 'Game-day standards', body: 'Home teams provide the lined field, clock or scoreboard, water, ice, safety sheet, and timekeeper support. Both teams bring rosters, membership proof, and first-aid support.' },
  ],
  committees: [
    { name: 'Executive Board', items: ['President', 'Vice President', 'Treasurer', 'Secretary'], body: 'Sets direction, handles league governance, and resolves issues that teams cannot solve on their own.' },
    { name: 'Scheduling Committee', items: ['League calendar', 'Game changes', 'Field coordination'], body: 'Builds the season framework and keeps home/away balance, field logistics, and reschedule requests from turning into chaos.' },
    { name: 'Eligibility & Boundaries', items: ['Placement review', 'Transfers', 'Hardships'], body: 'Owns school-based placement, future boundary implementation, hardship requests, and exception workflows.' },
    { name: 'Rules & Discipline', items: ['Conduct', 'Cards', 'Appeals'], body: 'Applies the code of conduct, red/yellow card consequences, and league discipline standards consistently.' },
    { name: 'Officials & Game Operations', items: ['Officials', 'Safety', 'Reports'], body: 'Supports referee assignments, game-day standards, score reporting, and safety-sheet consistency.' },
    { name: 'Communications & Growth', items: ['Website', 'Parent support', 'Expansion'], body: 'Owns public updates, parent guidance, resource publishing, and future market growth into new Arizona communities.' },
  ],
  officialLinks: [
    { title: 'USA Lacrosse Players & Parents', href: 'https://www.usalacrosse.com/players-parents', description: 'National parent and player guidance, athlete development, and beginner resources.' },
    { title: 'USA Lacrosse Equipment', href: 'https://www.usalacrosse.com/equipment', description: 'Official equipment basics for girls field players, including required eyewear and mouthguards.' },
    { title: '2026 Girls Youth Rule Book', href: 'https://www.usalacrosse.com/sites/default/files/documents/Rules/2026-Girls-Youth-Rule-Book.pdf', description: 'Current USA Lacrosse youth girls rules and age-appropriate game standards.' },
    { title: 'Legal Women’s Sticks', href: 'https://www.usalacrosse.com/legal-womens-sticks', description: 'Updated listing of sticks legal for women’s and girls play.' },
  ],
  departments: [
    'General Questions',
    'Registration & Team Signup',
    'Player Placement & Boundaries',
    'Rules & Eligibility',
    'Scheduling & Operations',
    'Coaching & Volunteers',
    'Officials',
    'Website & Communications',
  ],
};
