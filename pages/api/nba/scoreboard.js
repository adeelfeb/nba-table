/**
 * NBA Scoreboard API - Fetches upcoming and recent games from ESPN's unofficial API
 * Base: https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard
 * Params: dates=YYYYMMDD (optional), limit (optional)
 */

const ESPN_SCOREBOARD_URL = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { dates, limit = 5 } = req.query;

    // Default to today's date if no dates provided
    let dateParam = dates;
    if (!dateParam) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      dateParam = `${year}${month}${day}`;
    }

    const url = `${ESPN_SCOREBOARD_URL}?dates=${dateParam}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NBA-Games-Site/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`ESPN API returned ${response.status}`);
    }

    const data = await response.json();
    let events = data.events || [];

    // Sort by date/time
    events.sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      return dateA - dateB;
    });

    const maxEvents = parseInt(limit, 10) || 20;
    events = events.slice(0, Math.min(maxEvents, events.length));

    // Transform to a simpler structure for the frontend
    const games = events.map((event) => {
      const comp = event.competitions?.[0] || {};
      const competitors = comp.competitors || [];
      const away = competitors.find((c) => c.homeAway === 'away');
      const home = competitors.find((c) => c.homeAway === 'home');

      const awayTeam = away?.team || {};
      const homeTeam = home?.team || {};

      const awayRecord = away?.records?.[0]?.summary || '0-0';
      const homeRecord = home?.records?.[0]?.summary || '0-0';

      const venue = comp.venue || {};
      const location = venue.fullName
        ? `${venue.fullName}${venue.address?.city ? `, ${venue.address.city}${venue.address.state ? ', ' + venue.address.state : ''}` : ''}`
        : null;

      const broadcasts = (comp.broadcasts || []).flatMap((b) => b.names || []).filter(Boolean);
      const broadcastChannel = broadcasts.length ? broadcasts.join(', ') : null;

      return {
        id: event.id,
        name: event.name,
        shortName: event.shortName,
        date: event.date,
        status: event.status?.type?.description || event.status?.type?.shortDetail || 'Scheduled',
        completed: event.status?.type?.completed ?? false,
        venue: location,
        broadcast: broadcastChannel,
        away: {
          id: awayTeam.id,
          name: awayTeam.displayName || awayTeam.shortDisplayName || 'TBD',
          abbreviation: awayTeam.abbreviation,
          logo: awayTeam.logo,
          score: away?.score,
          record: awayRecord,
        },
        home: {
          id: homeTeam.id,
          name: homeTeam.displayName || homeTeam.shortDisplayName || 'TBD',
          abbreviation: homeTeam.abbreviation,
          logo: homeTeam.logo,
          score: home?.score,
          record: homeRecord,
        },
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        games,
        league: data.leagues?.[0] || null,
      },
    });
  } catch (error) {
    console.error('[NBA Scoreboard API] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch NBA games',
    });
  }
}
