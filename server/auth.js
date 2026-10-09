import crypto from 'node:crypto';
import { hashPassword } from './database.js';

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const COOKIE_NAME = 'sf_session';
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const loginAttempts = new Map();

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function verifyPassword(password, encodedHash) {
  const [saltBase64, hashBase64] = String(encodedHash || '').split('.');
  if (!saltBase64 || !hashBase64) return false;

  try {
    const salt = Buffer.from(saltBase64, 'base64');
    const expected = Buffer.from(hashBase64, 'base64');
    const actual = crypto.scryptSync(String(password || ''), salt, expected.length);
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

function parseCookies(header) {
  return String(header || '').split(';').reduce((cookies, pair) => {
    const separator = pair.indexOf('=');
    if (separator < 0) return cookies;
    const key = pair.slice(0, separator).trim();
    const value = pair.slice(separator + 1).trim();
    try {
      cookies[key] = decodeURIComponent(value);
    } catch {
      cookies[key] = value;
    }
    return cookies;
  }, {});
}

function setSessionCookie(res, token, secure) {
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`
  ];
  if (secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function clearSessionCookie(res, secure) {
  const parts = [`${COOKIE_NAME}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function isRateLimited(key) {
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record || now - record.startedAt > LOGIN_WINDOW_MS) {
    loginAttempts.set(key, { startedAt: now, failures: 0 });
    return false;
  }
  return record.failures >= MAX_LOGIN_ATTEMPTS;
}

function registerFailure(key) {
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record || now - record.startedAt > LOGIN_WINDOW_MS) {
    loginAttempts.set(key, { startedAt: now, failures: 1 });
  } else {
    record.failures += 1;
  }
}

function clearFailures(key) {
  loginAttempts.delete(key);
}

function publicUser(user) {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export function login(db, { email, password }, rateLimitKey) {
  const key = String(rateLimitKey || 'unknown');
  if (isRateLimited(key)) return { ok: false, status: 429, error: 'Muitas tentativas. Aguarde alguns minutos.' };

  const normalizedEmail = normalizeEmail(email);
  const user = db.prepare(`
    SELECT id, email, name, role, password_hash
    FROM users
    WHERE email = ?
  `).get(normalizedEmail);

  if (!user || !verifyPassword(password, user.password_hash)) {
    registerFailure(key);
    return { ok: false, status: 401, error: 'E-mail ou senha inválidos.' };
  }

  clearFailures(key);
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());

  const token = crypto.randomBytes(32).toString('base64url');
  const now = Date.now();
  db.prepare(`
    INSERT INTO sessions (token_hash, user_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `).run(hashToken(token), user.id, now + SESSION_TTL_MS, now);
  db.prepare(`
    INSERT INTO audit_logs (user_id, action, metadata, created_at)
    VALUES (?, 'login', ?, ?)
  `).run(user.id, JSON.stringify({ email: user.email }), now);

  return { ok: true, token, user: publicUser(user) };
}

export function requireAuth(db) {
  return (req, res, next) => {
    const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: 'Autenticação necessária.' });

    const session = db.prepare(`
      SELECT s.token_hash, s.expires_at, u.id, u.email, u.name, u.role
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > ?
    `).get(hashToken(token), Date.now());

    if (!session) {
      clearSessionCookie(res, sessionCookieIsSecure(req));
      return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    }

    req.user = publicUser(session);
    req.sessionTokenHash = session.token_hash;
    return next();
  };
}

export function logout(db, req) {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  if (!token) return;
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
  if (req.user?.id) {
    db.prepare(`
      INSERT INTO audit_logs (user_id, action, metadata, created_at)
      VALUES (?, 'logout', NULL, ?)
    `).run(req.user.id, Date.now());
  }
}

export function sessionCookieIsSecure(req) {
  // Configuração explícita sempre vence, para evitar cookies Secure em HTTP na rede local.
  if (process.env.SESSION_COOKIE_SECURE === 'true') return true;
  if (process.env.SESSION_COOKIE_SECURE === 'false') return false;
  return Boolean(req.secure) || req.get('x-forwarded-proto') === 'https';
}

export { setSessionCookie, publicUser };
