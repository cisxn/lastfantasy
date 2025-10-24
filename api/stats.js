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
    // Get season averages using the correct BallDontLie endpoint
    const season = 2025;
    const response = await fetch(
      `https://api.balldontlie.io/v1/season_averages?season=${season}&player_ids[]=${player_id}`,
      {
        headers: {
          'Authorization': process.env.BALLDONTLIE_API_KEY
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stats API Error:', response.status, errorText);
      
      // Return empty stats if not found rather than error
      if (response.status === 404) {
        return res.status(200).json({ data: [] });
      }
      
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Stats Response for player', player_id, ':', data);

    // Cache for 1 hour
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch player stats',
      message: error.message 
    });
  }
}