// Teste de fumaça da API de autenticação.
// Uso: BASE_URL=http://127.0.0.1:3001 SMOKE_EMAIL=... SMOKE_PASSWORD=... node scripts/smoke-api.mjs
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3001';
const email = process.env.SMOKE_EMAIL;
const password = process.env.SMOKE_PASSWORD;

const results = [];
function check(name, condition, detail = '') {
  results.push({ name, ok: Boolean(condition), detail });
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  let body = null;
  const text = await response.text();
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: response.status, body, headers: response.headers };
}

if (!email || !password) {
  console.error('Defina SMOKE_EMAIL e SMOKE_PASSWORD para executar o teste.');
  process.exit(2);
}

const health = await request('/api/health');
check('GET /api/health responde 200', health.status === 200, `status=${health.status}`);
check('health reporta banco ok', health.body?.database === 'ok');
check('health reporta autenticação configurada', health.body?.authConfigured === true);

const wrong = await request('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password: `${password}-errada` })
});
check('login com senha incorreta é rejeitado', wrong.status === 401, `status=${wrong.status}`);

const anonymous = await request('/api/auth/me');
check('rota protegida exige sessão', anonymous.status === 401, `status=${anonymous.status}`);

const login = await request('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
check('login válido responde 200', login.status === 200, `status=${login.status}`);
check('login retorna usuário sem senha', Boolean(login.body?.user?.email) && !('password_hash' in (login.body?.user || {})));

const setCookie = login.headers.get('set-cookie') || '';
const cookie = setCookie.split(';')[0];
check('cookie de sessão é HttpOnly', /HttpOnly/i.test(setCookie), setCookie ? 'presente' : 'ausente');

const me = await request('/api/auth/me', { headers: { Cookie: cookie } });
check('sessão autentica rota protegida', me.status === 200, `status=${me.status}`);
check('/api/auth/me devolve o mesmo usuário', me.body?.user?.email?.toLowerCase() === email.toLowerCase());

const logout = await request('/api/auth/logout', { method: 'POST', headers: { Cookie: cookie } });
check('logout responde 204', logout.status === 204, `status=${logout.status}`);

const afterLogout = await request('/api/auth/me', { headers: { Cookie: cookie } });
check('sessão invalidada após logout', afterLogout.status === 401, `status=${afterLogout.status}`);

const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} verificações aprovadas.`);
process.exit(failed.length === 0 ? 0 : 1);
