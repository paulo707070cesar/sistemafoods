// Verifica sincronização entre dois terminais independentes (sessões distintas).
// Uso: BASE_URL=... SMOKE_EMAIL=... SMOKE_PASSWORD=... node scripts/smoke-sync.mjs
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3001';
const email = process.env.SMOKE_EMAIL;
const password = process.env.SMOKE_PASSWORD;

const results = [];
function check(name, condition, detail = '') {
  results.push({ name, ok: Boolean(condition) });
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

async function login() {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) throw new Error(`Falha no login: ${response.status}`);
  return (response.headers.get('set-cookie') || '').split(';')[0];
}

const request = (path, cookie, options = {}) => fetch(`${baseUrl}${path}`, {
  ...options,
  headers: {
    Cookie: cookie,
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {})
  }
});

if (!email || !password) {
  console.error('Defina SMOKE_EMAIL e SMOKE_PASSWORD para executar o teste.');
  process.exit(2);
}

// Sessão anônima não pode ler nem acompanhar o estado.
const anonymousState = await fetch(`${baseUrl}/api/state`);
check('estado exige autenticação', anonymousState.status === 401, `status=${anonymousState.status}`);
const anonymousEvents = await fetch(`${baseUrl}/api/state/events`);
check('canal de eventos exige autenticação', anonymousEvents.status === 401, `status=${anonymousEvents.status}`);

// Dois terminais: garçom (A) e caixa (B).
const cookieA = await login();
const cookieB = await login();
check('dois terminais obtêm sessões distintas', cookieA !== cookieB);

const stateBefore = (await (await request('/api/state', cookieA)).json()).state;
const product = stateBefore.products[0];
const stockBefore = product.currentStock;

// Terminal B abre o canal de eventos e aguarda mudanças.
const controller = new AbortController();
const eventsResponse = await request('/api/state/events', cookieB, { signal: controller.signal });
check('canal de eventos aceita sessão autenticada', eventsResponse.status === 200, `status=${eventsResponse.status}`);

let sseEvent = null;
const sseWait = (async () => {
  const reader = eventsResponse.body.getReader();
  const decoder = new TextDecoder();
  const deadline = Date.now() + 8000;
  let buffer = '';
  while (Date.now() < deadline) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const match = buffer.match(/^data: (.+)$/m);
    if (match) {
      sseEvent = match[1];
      break;
    }
  }
  reader.cancel().catch(() => {});
})();

await new Promise(resolve => setTimeout(resolve, 300));

// Terminal A lança um item; o terminal B deve ser notificado e ver a mesma alteração.
const actionResponse = await request('/api/state/actions', cookieA, {
  method: 'POST',
  body: JSON.stringify({ action: { type: 'addItem', payload: { mode: 'mesas', targetId: 1, productId: product.id, qty: 1 } } })
});
check('terminal A consegue lançar item', actionResponse.status === 200, `status=${actionResponse.status}`);

await Promise.race([sseWait, new Promise(resolve => setTimeout(resolve, 8500))]);
check('terminal B recebe evento em tempo real', Boolean(sseEvent), sseEvent ? `evento=${sseEvent}` : 'nenhum evento recebido');
controller.abort();

const stateForB = (await (await request('/api/state', cookieB)).json()).state;
const tableForB = stateForB.tables.find(t => t.id === 1);
check('terminal B enxerga o item lançado por A', tableForB.items.length === 1, `itens=${tableForB.items.length}`);
check('terminal B enxerga o estoque atualizado',
  stateForB.products.find(p => p.id === product.id).currentStock === stockBefore - 1,
  `${stockBefore} -> ${stateForB.products.find(p => p.id === product.id).currentStock}`);

// Persistência: a revisão avança e o estado sobrevive a novas leituras.
const firstRead = await (await request('/api/state', cookieA)).json();
const secondRead = await (await request('/api/state', cookieA)).json();
check('revisão avança após alterações', firstRead.revision > 1, `revision=${firstRead.revision}`);
check('leitura do estado é estável entre requisições', firstRead.revision === secondRead.revision);

const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} verificações aprovadas.`);
process.exit(failed.length === 0 ? 0 : 1);
