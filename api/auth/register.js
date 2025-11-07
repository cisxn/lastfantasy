import { kv } from '@vercel/kv';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, username } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await kv.get(`user:${email}`);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Check total number of accounts (limit to 10)
    const accountCount = await kv.get('account:count') || 0;
    if (accountCount >= 10) {
      return res.status(400).json({ error: 'Maximum number of accounts (10) reached' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    const user = {
      email,
      username: username || email.split('@')[0],
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    // Store user
    await kv.set(`user:${email}`, user);

    // Increment account count
    await kv.set('account:count', accountCount + 1);

    // Add to user list
    const userList = await kv.get('user:list') || [];
    userList.push(email);
    await kv.set('user:list', userList);

    // Create session token (simple implementation)
    const sessionToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    await kv.set(`session:${sessionToken}`, email, { ex: 86400 }); // 24 hours

    return res.status(201).json({
      success: true,
      user: {
        email: user.email,
        username: user.username
      },
      sessionToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
