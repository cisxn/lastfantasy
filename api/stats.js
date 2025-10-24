// api/stats.js
// Fetch player season averages from BallDontLie API

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { player_id } = req.query;

  if (!player_id) {
    return res.status(400).json({ error: 'Player ID is required' });
  }

  try {
    // Get season averages - try 2025 first, fall back to 2024
    const season = 2025;
    
    console.log(`Fetching stats for player ${player_id}, season ${season}`);
    
    const url = `https://api.balldontlie.io/v1/season_averages?season=${season}&player_ids%5B%5D=${player_id}`;
    console.log(`Request URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': process.env.BALLDONTLIE_API_KEY
      }
    });

    console.log(`Stats API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stats API Error:', response.status, errorText);
      
      // Return empty stats if not found rather than error
      if (response.status === 404 || response.status === 400) {
        return res.status(200).json({ data: [] });
      }
      
      throw new Error(`API responded with status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Stats Response for player', player_id, ':', JSON.stringify(data));

    // Cache for 1 hour
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching stats:', error.message);
    // Return empty data instead of error to prevent app from breaking
    return res.status(200).json({ data: [] });
  }
}