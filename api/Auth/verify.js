import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
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

    // Get user data
    const user = await kv.get(`user:${email}`);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user: {
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}