// Teste de fumaça das regras de negócio no servidor.
// Uso: BASE_URL=http://127.0.0.1:3001 SMOKE_EMAIL=... SMOKE_PASSWORD=... node scripts/smoke-state.mjs
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3001';
const email = process.env.SMOKE_EMAIL;
const password = process.env.SMOKE_PASSWORD;

let cookie = '';
const results = [];

function check(name, condition, detail = '') {
  results.push({ name, ok: Boolean(condition) });
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (cookie) headers.Cookie = cookie;
  if (options.body) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }

  const setCookie = response.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';')[0];

  return { status: response.status, body };
}

const getState = async () => (await request('/api/state')).body.state;
const act = (type, payload) => request('/api/state/actions', {
  method: 'POST',
  body: JSON.stringify({ action: { type, payload } })
});

if (!email || !password) {
  console.error('Defina SMOKE_EMAIL e SMOKE_PASSWORD para executar o teste.');
  process.exit(2);
}

const login = await request('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
check('login para os testes de estado', login.status === 200, `status=${login.status}`);
if (login.status !== 200) process.exit(1);

const initial = await request('/api/state');
check('GET /api/state devolve estado e revisão', initial.status === 200 && typeof initial.body.revision === 'number');
check('estado contém produtos, mesas e transações',
  Array.isArray(initial.body.state?.products) &&
  Array.isArray(initial.body.state?.tables) &&
  Array.isArray(initial.body.state?.transactions));

const stockBefore = (await getState()).products.find(p => p.id === 'prod-1').currentStock;

// 1. Lançar item em mesa livre
const added = await act('addItem', { mode: 'mesas', targetId: 1, productId: 'prod-1', qty: 2 });
check('addItem em mesa livre é aceito', added.status === 200, `status=${added.status}`);

let state = await getState();
const table1 = state.tables.find(t => t.id === 1);
check('mesa passa a ocupada com o item lançado', table1.status === 'ocupada' && table1.items.length === 1);
check('estoque do produto é decrementado no servidor',
  state.products.find(p => p.id === 'prod-1').currentStock === stockBefore - 2,
  `${stockBefore} -> ${state.products.find(p => p.id === 'prod-1').currentStock}`);

// 2. Estoque insuficiente é recusado
const tooMuch = await act('addItem', { mode: 'mesas', targetId: 1, productId: 'prod-1', qty: 9999 });
check('addItem acima do estoque é recusado', tooMuch.status === 409, `status=${tooMuch.status}`);

// 3. Ajuste de quantidade
await act('updateItemQty', { mode: 'mesas', targetId: 1, itemId: (await getState()).tables.find(t => t.id === 1).items[0].id, delta: 1 });
state = await getState();
check('updateItemQty ajusta quantidade e estoque',
  state.tables.find(t => t.id === 1).items[0].qty === 3 &&
  state.products.find(p => p.id === 'prod-1').currentStock === stockBefore - 3);

// 4. Desconto maior que o subtotal é limitado
const subtotal = 3 * 89.9;
const discount = await act('setDiscount', { mode: 'mesas', targetId: 1, discount: 999999 });
check('desconto acima do subtotal é aceito com limite', discount.status === 200);
state = await getState();
check('desconto limitado ao subtotal', state.tables.find(t => t.id === 1).discount === Number(subtotal.toFixed(2)),
  `discount=${state.tables.find(t => t.id === 1).discount}`);

// 5. Pagamento ignora valores enviados pelo cliente
await act('setDiscount', { mode: 'mesas', targetId: 1, discount: 0 });
const forged = await request('/api/state/actions', {
  method: 'POST',
  body: JSON.stringify({
    action: {
      type: 'processPayment',
      payload: { source: 'Mesa 01', paymentMethod: 'pix', subtotal: 0.01, serviceTax: 0, total: 0.01, discount: 0 }
    }
  })
});
check('pagamento com valores forjados é processado', forged.status === 200, `status=${forged.status}`);

const tx = (await getState()).transactions[0];
check('servidor recalcula subtotal real', tx.subtotal === Number(subtotal.toFixed(2)), `subtotal=${tx.subtotal}`);
check('servidor recalcula taxa de serviço de 10%', tx.serviceTax === Number((subtotal * 0.1).toFixed(2)), `serviceTax=${tx.serviceTax}`);
check('servidor ignora total enviado pelo cliente', tx.total === Number((subtotal * 1.1).toFixed(2)), `total=${tx.total}`);

state = await getState();
const freed = state.tables.find(t => t.id === 1);
check('mesa é liberada após o pagamento', freed.status === 'livre' && freed.items.length === 0);

// 6. Pagamento de conta vazia é recusado
const emptyPayment = await act('processPayment', { source: 'Mesa 01', paymentMethod: 'pix' });
check('pagamento de conta vazia é recusado', emptyPayment.status === 409, `status=${emptyPayment.status}`);

// 7. Fluxo de pedido digital com validação de estoque
const stock23Before = (await getState()).products.find(p => p.id === 'prod-23').currentStock;
const digital = await act('submitDigitalOrder', {
  tableNumber: 'Mesa 09',
  customerName: 'Teste Automatizado',
  items: [{ productId: 'prod-23', qty: 1 }]
});
check('pedido digital é criado', digital.status === 200, `status=${digital.status}`);

const orderId = (await getState()).digitalOrders[0].id;
const accepted = await act('acceptDigitalOrder', { orderId });
check('pedido digital é aceito', accepted.status === 200, `status=${accepted.status}`);
check('estoque baixa no aceite do pedido digital',
  (await getState()).products.find(p => p.id === 'prod-23').currentStock === stock23Before - 1);

// 8. Cancelar item devolve ao estoque
state = await getState();
const table9 = state.tables.find(t => t.number === 'Mesa 09');
const removed = await act('removeItem', { mode: 'mesas', targetId: 9, itemId: table9.items[table9.items.length - 1].id });
check('remoção de item é aceita', removed.status === 200, `status=${removed.status}`);
check('cancelar item devolve estoque',
  (await getState()).products.find(p => p.id === 'prod-23').currentStock === stock23Before);

// 9. Saída de estoque acima do disponível é recusada
const excessive = await act('removeStock', { productId: 'prod-23', qty: 99999, reason: 'teste' });
check('saída de estoque acima do disponível é recusada', excessive.status === 409, `status=${excessive.status}`);

// 10. Ação desconhecida é rejeitada
const unknown = await act('acaoInexistente', {});
check('ação desconhecida é rejeitada', unknown.status === 409, `status=${unknown.status}`);

const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} verificações aprovadas.`);
process.exit(failed.length === 0 ? 0 : 1);
