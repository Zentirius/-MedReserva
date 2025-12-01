const express = require('express');
const { signAccessToken, signRefreshToken, verifyToken } = require('../auth');

const router = express.Router();

router.post('/login', (req, res) => {
  return res.status(501).json({ error: 'login_not_implemented' });
});

router.post('/refresh', (req, res) => {
  const token = req.cookies && req.cookies.refresh_token;
  if (!token) {
    return res.status(401).json({ error: 'refresh_token_required' });
  }
  const data = verifyToken(token);
  if (!data || !data.userId) {
    return res.status(401).json({ error: 'invalid_refresh_token' });
  }
  const accessToken = signAccessToken({ userId: data.userId });
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000
  });
  return res.json({ ok: true });
});

module.exports = router;
