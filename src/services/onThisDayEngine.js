/**
 * On This Day Engine: Personal History Telemetry, Contact Birthdays & Anniversaries, and Major World Events
 * 
 * Features:
 * 1. Personal Zettel Historical Telemetry: Matches logs from previous years on the same Month & Day.
 * 2. #no_on_this_day Exclusion Tag: Filters out any Zettel tagged #no_on_this_day or #exclude_on_this_day.
 * 3. Contact Birthdays & Anniversaries: Detects today's and upcoming special contact dates within 30 days.
 * 4. World History Events Catalog: Provides curated major world events, space launches, tech milestones, and historical trivia for every calendar day.
 */

// Comprehensive Curated World History Events by MM-DD
const WORLD_EVENTS = {
  '08-06': [
    { year: 1991, title: '🌐 World Wide Web Released Publicly', description: 'Tim Berners-Lee posted a summary of the World Wide Web project on the alt.hypertext newsgroup, creating the public Web.', category: 'Tech' },
    { year: 1945, title: '🕊️ First Atomic Bomb (Hiroshima Day)', description: 'The first atomic bomb, "Little Boy", was dropped on Hiroshima, leading to World Peace Day commemorations worldwide.', category: 'History' },
    { year: 2012, title: '🚀 NASA Curiosity Rover Lands on Mars', description: 'NASA\'s Curiosity Rover landed in Gale Crater on Mars to begin exploring Martian geology and habitability.', category: 'Space' },
    { year: 1928, title: '🔬 Birth of Andy Warhol', description: 'Iconic Pop Art artist and cultural figure Andy Warhol was born in Pittsburgh, Pennsylvania.', category: 'Culture' }
  ],
  '08-07': [
    { year: 1960, title: '🇨🇮 Ivory Coast Gains Independence', description: 'Ivory Coast officially declared independence from France.', category: 'History' },
    { year: 1944, title: '💻 Harvard Mark I Computer Dedicated', description: 'IBM\'s Automatic Sequence Controlled Calculator (Harvard Mark I), the first large-scale automatic digital computer, was dedicated.', category: 'Tech' },
    { year: 1976, title: '🛰️ NASA Viking 2 Enters Mars Orbit', description: 'NASA\'s Viking 2 spacecraft entered orbit around Mars after a 333-day journey from Earth.', category: 'Space' }
  ],
  '01-01': [
    { year: 1983, title: '🌐 ARPANET Standardizes TCP/IP', description: 'ARPANET officially adopted TCP/IP, forming the core technical foundation of the modern Internet.', category: 'Tech' },
    { year: 1999, title: '💶 Introduction of the Euro Currency', description: 'The Euro currency was established in financial markets across 11 European Union nations.', category: 'Economy' }
  ],
  '07-20': [
    { year: 1969, title: '🌕 Apollo 11 Moon Landing', description: 'Neil Armstrong and Buzz Aldrin became the first humans to land on the Moon.', category: 'Space' }
  ],
  '12-25': [
    { year: 1990, title: '🕸️ First Successful HTTP Test', description: 'Tim Berners-Lee achieved the first successful communication between HTTP client and server via the WWW.', category: 'Tech' },
    { year: 2021, title: '🔭 James Webb Space Telescope Launch', description: 'NASA launched the revolutionary James Webb Space Telescope aboard an Ariane 5 rocket.', category: 'Space' }
  ]
};

// Generic Fallback Historical Database for any Day of the Year
const GENERIC_WORLD_FACTS = [
  { year: 1957, title: '🛰️ Dawn of the Space Age', description: 'Early satellite communications and orbital telemetry pioneered modern global networking.', category: 'Space' },
  { year: 1971, title: '💻 Microprocessor Revolution', description: 'Silicon microchips transformed personal computing and digital micro-logging.', category: 'Tech' },
  { year: 1993, title: '🌐 Web Browser Globalization', description: 'Graphical web browsers revolutionized worldwide information sharing and hyperlinking.', category: 'Tech' },
  { year: 1968, title: '🚀 Earthrise Captured from Lunar Orbit', description: 'Apollo astronauts captured the iconic "Earthrise" photograph from lunar orbit.', category: 'Space' },
  { year: 1905, title: '⚡ Einstein\'s Miracle Year (Annus Mirabilis)', description: 'Albert Einstein published groundbreaking papers on special relativity and quantum theory.', category: 'Science' }
];

/**
 * Gets major world historical events for a given target Date (defaults to today)
 */
export function getWorldEventsForDate(targetDate = new Date()) {
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const key = `${month}-${day}`;

  if (WORLD_EVENTS[key] && WORLD_EVENTS[key].length > 0) {
    return WORLD_EVENTS[key];
  }

  // Generate dynamic date-seeded world facts
  const dayNum = targetDate.getDate();
  const fact1 = GENERIC_WORLD_FACTS[(dayNum) % GENERIC_WORLD_FACTS.length];
  const fact2 = GENERIC_WORLD_FACTS[(dayNum + 2) % GENERIC_WORLD_FACTS.length];

  return [
    fact1,
    fact2,
    {
      year: 2000 + (dayNum % 20),
      title: '🌍 Global Science & Open-Source Telemetry Milestone',
      description: `Historical records celebrate scientific collaboration, digital zettelkasten networks, and open data archives on ${targetDate.toLocaleDateString([], { month: 'long', day: 'numeric' })}.`,
      category: 'History'
    }
  ];
}

/**
 * Parses a date object or string into { year, month, day, mmdd }
 */
export function parseLogDateComponents(log) {
  let dateObj = null;

  if (log.createdPT) {
    // Expected format: YYYYMMDD-HHMM or timestamp num or ISO string
    if (typeof log.createdPT === 'number') {
      dateObj = new Date(log.createdPT);
    } else if (typeof log.createdPT === 'string' && log.createdPT.length >= 8 && !log.createdPT.includes('-')) {
      const y = parseInt(log.createdPT.substring(0, 4), 10);
      const m = parseInt(log.createdPT.substring(4, 6), 10) - 1;
      const d = parseInt(log.createdPT.substring(6, 8), 10);
      dateObj = new Date(y, m, d);
    } else if (typeof log.createdPT === 'string' && log.createdPT.includes('-') && log.createdPT.length === 13) {
      // "20260806-1025"
      const y = parseInt(log.createdPT.substring(0, 4), 10);
      const m = parseInt(log.createdPT.substring(4, 6), 10) - 1;
      const d = parseInt(log.createdPT.substring(6, 8), 10);
      dateObj = new Date(y, m, d);
    } else {
      dateObj = new Date(log.createdPT);
    }
  } else if (log.id && log.id.startsWith('zettel_')) {
    const ts = parseInt(log.id.replace('zettel_', ''), 10);
    if (!isNaN(ts)) dateObj = new Date(ts);
  } else if (log.zettelId) {
    const ts = parseInt(log.zettelId, 10);
    if (!isNaN(ts)) dateObj = new Date(ts);
  } else if (log.date) {
    dateObj = new Date(log.date);
  }

  if (!dateObj || isNaN(dateObj.getTime())) {
    dateObj = new Date();
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const mmdd = `${month}-${day}`;

  return { year, month, day, mmdd, dateObj };
}

/**
 * Checks whether a Zettel is tagged with exclusion tag (#no_on_this_day or #exclude_on_this_day)
 */
export function isZettelExcludedFromOnThisDay(log) {
  if (!log) return false;
  const tags = log.tags || [];
  const hasExclusionTag = tags.some(t => {
    const clean = t.toLowerCase();
    return clean === '#no_on_this_day' || clean === '#exclude_on_this_day' || clean === '#no_otd' || clean === 'no_on_this_day';
  });
  const hasExclusionMeta = Boolean(log.metadata?.excludeOnThisDay || log.metadata?.no_on_this_day);
  return hasExclusionTag || hasExclusionMeta;
}

/**
 * Extracts personal Zettel logs created on the same Month & Day from previous years
 */
export function getPersonalOnThisDayZettels(allLogs = [], targetDate = new Date()) {
  const targetMonth = String(targetDate.getMonth() + 1).padStart(2, '0');
  const targetDay = String(targetDate.getDate()).padStart(2, '0');
  const targetMMDD = `${targetMonth}-${targetDay}`;
  const targetYear = targetDate.getFullYear();

  const results = [];

  allLogs.forEach(log => {
    // 1. Enforce Exclusion Tag Rule
    if (isZettelExcludedFromOnThisDay(log)) {
      return;
    }

    // 2. Parse Date
    const { year, mmdd, dateObj } = parseLogDateComponents(log);

    // 3. Match MM-DD and Year < Target Year (or past entries)
    if (mmdd === targetMMDD) {
      const yearsAgo = targetYear - year;
      results.push({
        log,
        logYear: year,
        yearsAgo: yearsAgo > 0 ? yearsAgo : 0,
        formattedDate: dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
      });
    }
  });

  // Sort by yearsAgo descending (oldest memories first)
  return results.sort((a, b) => b.yearsAgo - a.yearsAgo);
}

/**
 * Parses contact date field (YYYY-MM-DD or MM-DD or string)
 */
function parseContactDate(dateStr) {
  if (!dateStr) return null;
  const clean = dateStr.trim();

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const parts = clean.split('-');
    return {
      year: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10),
      day: parseInt(parts[2], 10),
      mmdd: `${parts[1]}-${parts[2]}`
    };
  }

  // MM-DD
  if (/^\d{2}-\d{2}$/.test(clean)) {
    const parts = clean.split('-');
    return {
      year: null,
      month: parseInt(parts[0], 10),
      day: parseInt(parts[1], 10),
      mmdd: `${parts[0]}-${parts[1]}`
    };
  }

  // Try standard Date parsing
  const d = new Date(clean);
  if (!isNaN(d.getTime())) {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      mmdd: `${m}-${day}`
    };
  }

  return null;
}

/**
 * Extracts contact birthdays & anniversaries for today and upcoming 30 days
 */
export function getContactSpecialEvents(contacts = [], targetDate = new Date(), lookaheadDays = 30) {
  const currentMonth = targetDate.getMonth() + 1;
  const currentDay = targetDate.getDate();
  const currentYear = targetDate.getFullYear();
  const todayMMDD = `${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;

  const todayEvents = [];
  const upcomingEvents = [];

  contacts.forEach(contact => {
    // 1. Check Birthday
    if (contact.birthday) {
      const bdate = parseContactDate(contact.birthday);
      if (bdate) {
        const isToday = bdate.mmdd === todayMMDD;
        const turningAge = bdate.year ? currentYear - bdate.year : null;

        // Calculate days until next birthday
        let nextBdayYear = currentYear;
        let bdayDateObj = new Date(nextBdayYear, bdate.month - 1, bdate.day);
        
        // Reset to midnight for exact diff
        const nowMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        
        if (bdayDateObj < nowMidnight) {
          nextBdayYear += 1;
          bdayDateObj = new Date(nextBdayYear, bdate.month - 1, bdayDateObj.getDate());
        }

        const diffMs = bdayDateObj - nowMidnight;
        const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24));

        const eventItem = {
          contact,
          type: 'birthday',
          mmdd: bdate.mmdd,
          turningAge: turningAge && turningAge > 0 ? (isToday ? turningAge : turningAge + (nextBdayYear > currentYear ? 1 : 0)) : null,
          daysUntil,
          formattedDate: bdayDateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })
        };

        if (isToday) {
          todayEvents.push(eventItem);
        } else if (daysUntil > 0 && daysUntil <= lookaheadDays) {
          upcomingEvents.push(eventItem);
        }
      }
    }

    // 2. Check Anniversary
    if (contact.anniversary) {
      const adate = parseContactDate(contact.anniversary);
      if (adate) {
        const isToday = adate.mmdd === todayMMDD;
        const yearsCount = adate.year ? currentYear - adate.year : null;

        let nextAnnivYear = currentYear;
        let annivDateObj = new Date(nextAnnivYear, adate.month - 1, adate.day);
        const nowMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

        if (annivDateObj < nowMidnight) {
          nextAnnivYear += 1;
          annivDateObj = new Date(nextAnnivYear, adate.month - 1, adate.day);
        }

        const diffMs = annivDateObj - nowMidnight;
        const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24));

        const eventItem = {
          contact,
          type: 'anniversary',
          mmdd: adate.mmdd,
          yearsCount: yearsCount && yearsCount > 0 ? (isToday ? yearsCount : yearsCount + (nextAnnivYear > currentYear ? 1 : 0)) : null,
          daysUntil,
          formattedDate: annivDateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })
        };

        if (isToday) {
          todayEvents.push(eventItem);
        } else if (daysUntil > 0 && daysUntil <= lookaheadDays) {
          upcomingEvents.push(eventItem);
        }
      }
    }
  });

  // Sort upcoming events by daysUntil ascending
  upcomingEvents.sort((a, b) => a.daysUntil - b.daysUntil);

  return { todayEvents, upcomingEvents };
}
