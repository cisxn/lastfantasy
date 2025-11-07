# Backend Setup Guide

This document explains how to set up the backend for storing up to 10 user accounts with their fantasy basketball teams.

## Architecture

The backend uses:
- **Vercel KV** (Redis-based storage) for data persistence
- **Serverless API Routes** in `/api` directory
- **Session-based authentication** with 24-hour token expiry
- **bcryptjs** for password hashing

## Prerequisites

1. A Vercel account
2. Vercel CLI installed (optional, for local development)
3. Vercel KV database created

## Setup Instructions

### 1. Create a Vercel KV Database

1. Go to your Vercel dashboard
2. Navigate to Storage → Create Database
3. Select **KV** (Redis-compatible key-value store)
4. Create a new KV store
5. Name it (e.g., "lastfantasy-accounts")

### 2. Connect KV to Your Project

1. In your Vercel project dashboard, go to Settings → Environment Variables
2. Add the KV environment variables (these will be automatically provided when you create the KV store):
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

These variables are automatically set when you link your KV store to your project.

### 3. Local Development Setup (Optional)

For local development:

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Link your project:
   ```bash
   vercel link
   ```

3. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new user account (max 10 accounts).

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "optional_username"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "email": "user@example.com",
    "username": "user"
  },
  "sessionToken": "base64_encoded_token"
}
```

**Errors:**
- 400: Email/password missing, password too short, user exists, or max accounts reached
- 500: Internal server error

#### POST `/api/auth/login`
Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "email": "user@example.com",
    "username": "user"
  },
  "sessionToken": "base64_encoded_token"
}
```

**Errors:**
- 401: Invalid credentials
- 500: Internal server error

#### POST `/api/auth/logout`
Logout and invalidate session token.

**Headers:**
```
Authorization: Bearer <sessionToken>
```

**Response:**
```json
{
  "success": true
}
```

#### GET `/api/auth/verify`
Verify if a session token is valid.

**Headers:**
```
Authorization: Bearer <sessionToken>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "email": "user@example.com",
    "username": "user"
  }
}
```

**Errors:**
- 401: Invalid or expired token
- 500: Internal server error

### Teams Management

#### POST `/api/teams/save`
Save user's fantasy teams.

**Headers:**
```
Authorization: Bearer <sessionToken>
```

**Request Body:**
```json
{
  "teams": [
    {
      "id": 1234567890,
      "name": "Team Name",
      "players": [...],
      "record": { "wins": 0, "losses": 0 }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Teams saved successfully"
}
```

#### GET `/api/teams/load`
Load user's fantasy teams.

**Headers:**
```
Authorization: Bearer <sessionToken>
```

**Response:**
```json
{
  "success": true,
  "teams": [...]
}
```

### Account Management

#### GET `/api/accounts/list`
List all registered accounts (no authentication required).

**Response:**
```json
{
  "success": true,
  "count": 5,
  "maxAccounts": 10,
  "accounts": [
    {
      "email": "user@example.com",
      "username": "user",
      "createdAt": "2025-11-07T00:00:00.000Z"
    }
  ]
}
```

## Data Storage Structure

### KV Keys

- `user:{email}` - User object with email, username, hashed password, createdAt
- `session:{token}` - Session token mapping to email (24-hour expiry)
- `teams:{email}` - Array of fantasy teams for user
- `account:count` - Total number of registered accounts
- `user:list` - Array of all registered user emails

## Security Features

1. **Password Hashing**: All passwords are hashed using bcryptjs with salt rounds of 10
2. **Session Tokens**: Base64-encoded tokens with 24-hour expiry
3. **Account Limit**: Maximum of 10 accounts can be registered
4. **CORS**: Configured to allow cross-origin requests
5. **Authentication Required**: Teams API requires valid session token

## Frontend Integration

The frontend automatically:
1. Checks for existing session on page load
2. Restores user session if valid token exists in localStorage
3. Loads teams from backend for logged-in users
4. Auto-saves teams to backend whenever they change
5. Falls back to localStorage for non-authenticated users

## Troubleshooting

### Issue: "Maximum number of accounts reached"
- The system is limited to 10 accounts
- Contact admin to reset or remove accounts

### Issue: Session expired
- Sessions expire after 24 hours
- User needs to login again

### Issue: Cannot connect to backend
- Verify Vercel KV is properly set up
- Check environment variables are configured
- Ensure API routes are deployed

### Issue: CORS errors
- Backend includes CORS headers
- Ensure requests are made from the deployed domain

## Production Deployment

When deploying to Vercel:

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Link the KV database to your project
4. Vercel will automatically set up the environment variables
5. Deploy!

The backend will automatically scale with Vercel's serverless infrastructure.

## Local Testing

To test locally without Vercel:

```bash
# Install dependencies
npm install

# Create .env.local with KV credentials
# (get these from Vercel dashboard)

# Run dev server
npm run dev
```

## Cost Considerations

Vercel KV pricing (as of 2025):
- Free tier: 30 MB storage, 3000 commands/day
- Pro tier: 256 MB storage, unlimited commands

For 10 accounts with team data, the free tier should be sufficient for development and small-scale use.
