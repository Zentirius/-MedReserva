const jwt = require('jsonwebtoken');

const accessExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const secret = process.env.JWT_SECRET;

function signAccessToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: accessExpiresIn });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: refreshExpiresIn });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, secret);
  } catch (e) {
    return null;
  }
}

function requireAuth(req, res, next) {
  const header = req.headers && req.headers.authorization;
  let token = null;
  if (header && header.startsWith('Bearer ')) {
    token = header.slice(7);
  } else if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }
  if (!token) {
    return res.status(401).json({ error: 'auth_required' });
  }
  const data = verifyToken(token);
  if (!data) {
    return res.status(401).json({ error: 'invalid_token' });
  }
  req.user = data;
  return next();
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  requireAuth
};
