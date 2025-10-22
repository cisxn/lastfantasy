export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { search } = req.query;

  if (!search || search.trim() === '') {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const response = await fetch(
      `https://api.balldontlie.io/v1/players?search=${encodeURIComponent(search)}`,
      {
        headers: {
          'Authorization': `${process.env.BALLDONTLIE_API_KEY}`
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data); // Debug log

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