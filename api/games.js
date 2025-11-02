// api/games.js
// Fetch player game stats from BallDontLie API

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { player_id, start_date, end_date } = req.query;

  if (!player_id || !start_date || !end_date) {
    return res.status(400).json({ error: 'player_id, start_date, and end_date are required' });
  }

  try {
    console.log(`Fetching games for player ${player_id} from ${start_date} to ${end_date}`);
    
    // Fetch games within the date range
    const url = `https://api.balldontlie.io/v1/stats?player_ids[]=${player_id}&start_date=${start_date}&end_date=${end_date}&per_page=100`;
    console.log(`Request URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': process.env.BALLDONTLIE_API_KEY
      }
    });

    console.log(`Games API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Games API Error:', response.status, errorText);
      
      if (response.status === 404 || response.status === 400) {
        return res.status(200).json({ data: [] });
      }
      
      throw new Error(`API responded with status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`Games Response for player ${player_id}:`, JSON.stringify(data));

    // Cache for 30 minutes since game stats update frequently
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching games:', error.message);
    return res.status(200).json({ data: [] });
  }
}