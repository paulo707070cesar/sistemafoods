import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { openDatabase, seedAdmin } from './server/database.js';
import {
  clearSessionCookie,
  login,
  logout,
  requireAuth,
  sessionCookieIsSecure,
  setSessionCookie
} from './server/auth.js';
import { createStateStore } from './server/stateStore.js';
import { createEventHub } from './server/events.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = process.env.DIST_PATH
  ? path.resolve(process.env.DIST_PATH)
  : path.join(__dirname, 'dist');
const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, 'data', 'sistema-food.sqlite');
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '127.0.0.1';

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`PORT inválida: ${process.env.PORT}`);
}

const hasBuild = fs.existsSync(path.join(distPath, 'index.html'));
if (!hasBuild) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Build não encontrada em ${distPath}. Execute npm run build antes de iniciar o servidor.`);
  }
  console.warn(`Aviso: build não encontrada em ${distPath}. Somente os endpoints /api e /health estarão disponíveis.`);
}

const db = openDatabase(dbPath);
const adminSeeded = seedAdmin(db, {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD
});
if (adminSeeded) {
  console.log(`Usuário administrador inicial criado para ${process.env.ADMIN_EMAIL}.`);
} else if (!db.prepare('SELECT id FROM users LIMIT 1').get()) {
  console.warn('Nenhum usuário configurado. Defina ADMIN_EMAIL e ADMIN_PASSWORD para habilitar o login.');
}

const stateStore = createStateStore(db);
const eventHub = createEventHub();
stateStore.subscribe(event => eventHub.broadcast(event));
console.log(`Estado de negócio carregado na revisão ${stateStore.getRevision()}.`);

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === 'true');
app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; " +
      "script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; " +
      "connect-src 'self' https: wss:; object-src 'none'"
  );

  const forwardedProto = req.get('x-forwarded-proto');
  if (process.env.NODE_ENV === 'production' && (req.secure || forwardedProto === 'https')) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

const authRequired = requireAuth(db);

const healthResponse = (_req, res) => {
  try {
    db.prepare('SELECT 1 AS ok').get();
    res.set('Cache-Control', 'no-store');
    res.status(200).json({
      status: 'ok',
      service: 'sistema-food-web',
      database: 'ok',
      authConfigured: Boolean(db.prepare('SELECT id FROM users LIMIT 1').get()),
      uptime: process.uptime()
    });
  } catch {
    res.status(503).json({ status: 'error', service: 'sistema-food-web', database: 'unavailable' });
  }
};

app.get('/health', healthResponse);
app.get('/api/health', healthResponse);

app.post('/api/auth/login', (req, res) => {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const result = login(db, body, req.ip);
  if (!result.ok) return res.status(result.status).json({ error: result.error });

  setSessionCookie(res, result.token, sessionCookieIsSecure(req));
  return res.status(200).json({ user: result.user });
});

app.get('/api/auth/me', authRequired, (req, res) => {
  res.status(200).json({ user: req.user });
});

app.post('/api/auth/logout', authRequired, (req, res) => {
  logout(db, req);
  clearSessionCookie(res, sessionCookieIsSecure(req));
  res.status(204).end();
});

// ---------------------------------------------------------------------------
// Estado de negócio compartilhado (mesas, comandas, produtos, estoque, caixa)
// ---------------------------------------------------------------------------

app.get('/api/state', authRequired, (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.status(200).json({
    revision: stateStore.getRevision(),
    state: stateStore.getState(),
    summary: stateStore.getSummary()
  });
});

app.post('/api/state/actions', authRequired, (req, res) => {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const actions = Array.isArray(body.actions) ? body.actions : [body.action];

  if (actions.length === 0 || actions.some(action => !action || typeof action.type !== 'string')) {
    return res.status(400).json({ error: 'Informe ao menos uma ação válida.' });
  }
  if (actions.length > 20) {
    return res.status(400).json({ error: 'Envie no máximo 20 ações por requisição.' });
  }

  const results = [];
  for (const action of actions) {
    const outcome = stateStore.apply(action, req.user);
    if (!outcome.ok) {
      return res.status(409).json({
        error: outcome.error,
        action: action.type,
        revision: stateStore.getRevision(),
        state: stateStore.getState()
      });
    }
    results.push({ type: action.type, result: outcome.result ?? null });
  }

  res.status(200).json({
    revision: stateStore.getRevision(),
    state: stateStore.getState(),
    summary: stateStore.getSummary(),
    results
  });
});

app.get('/api/state/events', authRequired, (req, res) => {
  eventHub.handle(req, res);
});

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado.' });
});

if (hasBuild) {
  app.use(express.static(distPath, {
    index: false,
    etag: true,
    maxAge: '1 year',
    setHeaders: (res, filePath) => {
      if (path.basename(filePath) === 'index.html') {
        res.setHeader('Cache-Control', 'no-store');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));

  app.get('*', (_req, res) => {
    res.set('Cache-Control', 'no-store');
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

/**
 * Inicia o servidor HTTP e resolve com a porta efetivamente usada.
 * Permite porta 0 para o sistema operacional escolher uma porta livre.
 */
export function startServer(listenPort = port, listenHost = host) {
  return new Promise((resolve, reject) => {
    const server = app.listen(listenPort, listenHost, () => {
      const actualPort = server.address().port;
      console.log(`Sistema Food Web Server em http://${listenHost}:${actualPort}`);
      resolve({ server, port: actualPort, host: listenHost });
    });
    server.once('error', reject);
  });
}

export function closeDatabase() {
  try {
    db.close();
  } catch {
    // Banco já encerrado.
  }
}

export { app, db, stateStore, eventHub };

// Auto-inicialização apenas quando executado diretamente (npm start).
const invokedDirectly = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === __filename;

if (invokedDirectly) {
  startServer()
    .then(({ server }) => {
      const shutdown = (signal) => {
        console.log(`${signal} recebido. Encerrando servidor...`);
        server.close(() => {
          closeDatabase();
          process.exit(0);
        });
      };

      process.once('SIGINT', () => shutdown('SIGINT'));
      process.once('SIGTERM', () => shutdown('SIGTERM'));
    })
    .catch(error => {
      console.error('Falha ao iniciar o servidor:', error);
      process.exit(1);
    });
}
