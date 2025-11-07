import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const sessionToken = authHeader.substring(7);

    // Get email from session
    const email = await kv.get(`session:${sessionToken}`);
    if (!email) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { teams } = req.body;

    if (!teams || !Array.isArray(teams)) {
      return res.status(400).json({ error: 'Teams must be an array' });
    }

    // Store teams for user
    await kv.set(`teams:${email}`, teams);

    return res.status(200).json({
      success: true,
      message: 'Teams saved successfully'
    });
  } catch (error) {
    console.error('Save teams error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
