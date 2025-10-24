// api/player.js
// This serverless function securely calls BallDontLie API with your key

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { search } = req.query;

  // Validate search parameter
  if (!search || search.trim() === '') {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    // Call BallDontLie API with your key from environment variables
    const response = await fetch(
      `https://api.balldontlie.io/v1/players?search=${encodeURIComponent(search)}`,
      {
        headers: {
          'Authorization': process.env.BALLDONTLIE_API_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Add caching headers to reduce API calls
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching from BallDontLie API:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch player data',
      message: error.message 
    });
  }
}