const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('./user');
const Token = require('./token');
const router = express.Router();

function signToken(userId) {
  const expiresInSec = 60 * 60 * 24; // 1 day
  const token = jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: expiresInSec });
  const expiresAt = new Date(Date.now() + expiresInSec * 1000);
  return { token, expiresAt };
}

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'Server misconfigured: JWT_SECRET missing' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const user = new User({ email });
    await user.setPassword(password);
    await user.save();
    const { token, expiresAt } = signToken(user._id.toString());
    await Token.create({ userId: user._id, token, expiresAt });
    res.json({ token });
  } catch (e) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'Server misconfigured: JWT_SECRET missing' });
    const user = await User.findOne({ email });
    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const { token, expiresAt } = signToken(user._id.toString());
    await Token.create({ userId: user._id, token, expiresAt });
    res.json({ token });
  } catch (e) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token) await Token.deleteOne({ token });
  res.json({ ok: true });
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });
    const stored = await Token.findOne({ token }).populate('userId');
    if (!stored) return res.status(401).json({ error: 'Invalid token' });
    const user = stored.userId;
    res.json({ email: user.email, id: user._id });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// OAuth (Google) scaffolding placeholders
router.get('/oauth/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.OAUTH_REDIRECT_URI; // e.g., http://localhost:5000/api/auth/oauth/google/callback
  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'OAuth not configured: set GOOGLE_CLIENT_ID and OAUTH_REDIRECT_URI' });
  }
  const scope = [
    'openid',
    'email',
    'profile',
  ];
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scope.join(' '),
    access_type: 'offline',
    prompt: 'consent',
  });
  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.redirect(url);
});

router.get('/oauth/google/callback', async (req, res) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.OAUTH_REDIRECT_URI) {
      return res.status(500).send('OAuth not configured: missing GOOGLE_CLIENT_ID/SECRET or OAUTH_REDIRECT_URI');
    }
    const code = req.query.code;
    if (!code) return res.status(400).send('Missing code');

    const client = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.OAUTH_REDIRECT_URI,
    });

    const { tokens } = await client.getToken(code);
    const idToken = tokens.id_token;
    if (!idToken) return res.status(400).send('Missing id_token from Google');

    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const email = payload?.email;
    if (!email) return res.status(400).send('No email in Google account');

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, provider: 'google' });
      await user.save();
    }

    const { token, expiresAt } = signToken(user._id.toString());
    await Token.create({ userId: user._id, token, expiresAt });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirect = new URL('/oauth/callback', frontendUrl);
    redirect.searchParams.set('token', token);
    res.redirect(redirect.toString());
  } catch (e) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirect = new URL('/oauth/callback', frontendUrl);
    redirect.searchParams.set('error', e?.message || 'oauth_failed');
    res.redirect(redirect.toString());
  }
});

module.exports = router;


