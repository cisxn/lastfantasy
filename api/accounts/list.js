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
    // Get account count and user list
    const accountCount = await kv.get('account:count') || 0;
    const userList = await kv.get('user:list') || [];

    // Get basic info for each user
    const accounts = await Promise.all(
      userList.map(async (email) => {
        const user = await kv.get(`user:${email}`);
        return user ? {
          email: user.email,
          username: user.username,
          createdAt: user.createdAt
        } : null;
      })
    );

    return res.status(200).json({
      success: true,
      count: accountCount,
      maxAccounts: 10,
      accounts: accounts.filter(Boolean)
    });
  } catch (error) {
    console.error('List accounts error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
