/**
 * NBA Schedule API - Fetches games for a date range
 * Uses ESPN scoreboard endpoint. Edge runtime avoids Vercel serverless source-map issues.
 */

export const config = { runtime: 'edge' };

const ESPN_SCOREBOARD_URL = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

export default async function handler(req) {
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Edge: req.url; Node fallback: build from req.query
    let start = null;
    let daysParam = '7';
    if (typeof req.url === 'string') {
      const url = new URL(req.url, 'https://localhost');
      start = url.searchParams.get('start');
      daysParam = url.searchParams.get('days') || '7';
    } else if (req.query) {
      start = req.query.start || null;
      daysParam = req.query.days || '7';
    }
    const days = Math.min(parseInt(daysParam, 10) || 7, 30);

    let startDate = new Date();
    if (start) {
      const parsed = new Date(start);
      if (!isNaN(parsed.getTime())) startDate = parsed;
    }

    const allGames = [];
    const seen = new Set();

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = formatDate(d);
      const fetchUrl = `${ESPN_SCOREBOARD_URL}?dates=${dateStr}`;
      const response = await fetch(fetchUrl, {
        headers: { Accept: 'application/json', 'User-Agent': 'NBA-Games-Site/1.0' },
      });
      if (!response.ok) continue;

      const data = await response.json();
      const events = data.events || [];

      for (const event of events) {
        if (seen.has(event.id)) continue;
        seen.add(event.id);

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

        allGames.push({
          id: event.id,
          name: event.name,
          shortName: event.shortName,
          date: event.date,
          status: event.status?.type?.description || event.status?.type?.shortDetail || 'Scheduled',
          completed: event.status?.type?.completed ?? false,
          venue: location,
          broadcast: broadcasts.length ? broadcasts.join(', ') : null,
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
        });
      }
    }

    allGames.sort((a, b) => new Date(a.date) - new Date(b.date));

    return new Response(
      JSON.stringify({ success: true, data: { games: allGames } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch NBA schedule',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
