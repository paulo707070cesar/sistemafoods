// Regras de negócio do Sistema Food, puras e compartilhadas entre servidor e cliente.
// Nenhuma função aqui acessa rede, disco ou React: recebe estado + ação e devolve novo estado.
// O servidor é a autoridade: valores monetários enviados pelo cliente nunca são aceitos.
import {
  INITIAL_PRODUCTS,
  INITIAL_TABLES,
  INITIAL_COMANDAS,
  INITIAL_TRANSACTIONS,
  INITIAL_DIGITAL_ORDERS,
  INITIAL_SYNC_QUEUE
} from './seed.js';

export const PAYMENT_METHODS = ['dinheiro', 'credito', 'debito', 'pix', 'vale_refeicao'];
export const TABLE_STATUSES = ['livre', 'ocupada', 'reservada'];
export const DIGITAL_ORDER_STATUSES = ['aguardando', 'preparo', 'pronto', 'servido', 'recusado'];
export const SERVICE_TAX_RATE = 0.1;

const MAX_TEXT = 300;

export function round2(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.round((number + Number.EPSILON) * 100) / 100;
}

export function nowTime(date = new Date()) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function cleanText(value, max = MAX_TEXT) {
  return String(value ?? '').slice(0, max);
}

function isPositiveInt(value) {
  return Number.isInteger(value) && value > 0;
}

export function createInitialState() {
  return structuredClone({
    products: INITIAL_PRODUCTS,
    tables: INITIAL_TABLES,
    comandas: INITIAL_COMANDAS,
    transactions: INITIAL_TRANSACTIONS,
    digitalOrders: INITIAL_DIGITAL_ORDERS,
    stockMovements: [],
    syncQueue: INITIAL_SYNC_QUEUE
  });
}

/** Normaliza um estado carregado do banco, garantindo todas as coleções. */
export function normalizeState(raw) {
  const base = raw && typeof raw === 'object' ? raw : {};
  const asArray = value => (Array.isArray(value) ? value : []);
  return {
    products: asArray(base.products),
    tables: asArray(base.tables),
    comandas: asArray(base.comandas),
    transactions: asArray(base.transactions),
    digitalOrders: asArray(base.digitalOrders),
    stockMovements: asArray(base.stockMovements),
    syncQueue: asArray(base.syncQueue)
  };
}

/** Totais recalculados sempre a partir dos itens reais do pedido. */
export function orderTotals(order) {
  const subtotal = round2((order?.items || []).reduce((sum, item) => sum + Number(item.total || 0), 0));
  const discount = Math.min(Math.max(0, round2(order?.discount || 0)), subtotal);
  const taxable = round2(subtotal - discount);
  const serviceTax = order?.hasServiceTax ? round2(taxable * SERVICE_TAX_RATE) : 0;
  return { subtotal, discount, serviceTax, total: round2(taxable + serviceTax) };
}

function findProduct(state, productId) {
  return state.products.find(product => product.id === productId);
}

/** Localiza o pedido alvo (mesa ou comanda) e devolve referências seguras. */
function resolveOrder(state, mode, targetId) {
  if (mode === 'comandas') {
    const index = state.comandas.findIndex(comanda => comanda.id === targetId);
    return index < 0 ? null : { kind: 'comandas', index, order: state.comandas[index] };
  }
  const id = Number(targetId);
  const index = state.tables.findIndex(table => table.id === id);
  return index < 0 ? null : { kind: 'tables', index, order: state.tables[index] };
}

function replaceOrder(state, resolved, order) {
  state[resolved.kind][resolved.index] = order;
  return state;
}

function applyStockDelta(state, productId, delta) {
  const product = findProduct(state, productId);
  if (!product) return;
  product.currentStock = Math.max(0, product.currentStock + delta);
}

function addStockMovement(state, product, type, qty, reason, operator) {
  state.stockMovements.unshift({
    id: newId('mov'),
    productId: product.id,
    productName: product.name,
    type,
    qty,
    reason: cleanText(reason, 120),
    timestamp: nowTime(),
    operator: cleanText(operator, 80) || 'Sistema'
  });
}

function fail(error) {
  return { ok: false, error };
}

function done(state, result) {
  return { ok: true, state, result };
}

// ---------------------------------------------------------------------------
// Ações
// ---------------------------------------------------------------------------

function addItem(state, payload) {
  const { mode, targetId } = payload;
  const qty = Number(payload.qty ?? 1);
  if (!isPositiveInt(qty)) return fail('Quantidade inválida.');

  const product = findProduct(state, payload.productId);
  if (!product) return fail('Produto não encontrado.');
  if (product.currentStock < qty) {
    return fail(`Estoque insuficiente: ${product.name} possui ${product.currentStock} ${product.unit}.`);
  }

  const resolved = resolveOrder(state, mode, targetId);
  if (!resolved) return fail('Mesa ou comanda não encontrada.');

  const observation = payload.observation ? cleanText(payload.observation) : undefined;
  const order = resolved.order;
  const time = nowTime();
  const existing = observation
    ? -1
    : order.items.findIndex(item => item.productId === product.id);

  if (existing >= 0) {
    const item = order.items[existing];
    item.qty += qty;
    item.total = round2(item.qty * item.price);
  } else {
    order.items.push({
      id: newId('item'),
      productId: product.id,
      name: product.name,
      qty,
      price: round2(product.price),
      total: round2(product.price * qty),
      observation,
      timestamp: time,
      status: 'pendente'
    });
  }

  if (resolved.kind === 'tables') {
    order.status = 'ocupada';
    order.openedAt = order.openedAt || time;
    order.waiter = order.waiter || payload.actor || 'Atendimento';
    order.customersCount = order.customersCount || 2;
  } else {
    order.status = 'aberta';
  }

  applyStockDelta(state, product.id, -qty);
  replaceOrder(state, resolved, order);
  return done(state, { order });
}

function removeItem(state, payload) {
  const resolved = resolveOrder(state, payload.mode, payload.targetId);
  if (!resolved) return fail('Mesa ou comanda não encontrada.');

  const order = resolved.order;
  const index = order.items.findIndex(item => item.id === payload.itemId);
  if (index < 0) return fail('Item não encontrado.');

  const [removed] = order.items.splice(index, 1);
  applyStockDelta(state, removed.productId, removed.qty);
  replaceOrder(state, resolved, order);
  return done(state, { order, removed });
}

function updateItemQty(state, payload) {
  const delta = Number(payload.delta);
  if (!Number.isInteger(delta) || delta === 0) return fail('Ajuste de quantidade inválido.');

  const resolved = resolveOrder(state, payload.mode, payload.targetId);
  if (!resolved) return fail('Mesa ou comanda não encontrada.');

  const order = resolved.order;
  const item = order.items.find(entry => entry.id === payload.itemId);
  if (!item) return fail('Item não encontrado.');

  const nextQty = item.qty + delta;
  const effectiveDelta = nextQty <= 0 ? -item.qty : delta;

  if (effectiveDelta > 0) {
    const product = findProduct(state, item.productId);
    if (!product || product.currentStock < effectiveDelta) {
      return fail(`Estoque insuficiente para aumentar ${item.name}.`);
    }
  }

  if (nextQty <= 0) {
    order.items = order.items.filter(entry => entry.id !== item.id);
  } else {
    item.qty = nextQty;
    item.total = round2(nextQty * item.price);
  }

  applyStockDelta(state, item.productId, -effectiveDelta);
  replaceOrder(state, resolved, order);
  return done(state, { order });
}

function setItemObservation(state, payload) {
  const resolved = resolveOrder(state, payload.mode, payload.targetId);
  if (!resolved) return fail('Mesa ou comanda não encontrada.');

  const order = resolved.order;
  const item = order.items.find(entry => entry.id === payload.itemId);
  if (!item) return fail('Item não encontrado.');

  item.observation = payload.observation ? cleanText(payload.observation) : undefined;
  replaceOrder(state, resolved, order);
  return done(state, { order });
}

function clearOrder(state, payload) {
  const resolved = resolveOrder(state, payload.mode, payload.targetId);
  if (!resolved) return fail('Mesa ou comanda não encontrada.');

  const order = resolved.order;
  // Devolve ao estoque tudo que havia sido lançado, evitando perda silenciosa de inventário.
  order.items.forEach(item => applyStockDelta(state, item.productId, item.qty));

  order.items = [];
  order.discount = 0;
  if (resolved.kind === 'tables') {
    order.status = 'livre';
    order.waiter = undefined;
    order.customersCount = undefined;
    order.openedAt = undefined;
  } else {
    order.status = 'fechada';
  }

  replaceOrder(state, resolved, order);
  return done(state, { order });
}

function toggleServiceTax(state, payload) {
  const resolved = resolveOrder(state, payload.mode, payload.targetId);
  if (!resolved) return fail('Mesa ou comanda não encontrada.');
  resolved.order.hasServiceTax = !resolved.order.hasServiceTax;
  replaceOrder(state, resolved, resolved.order);
  return done(state, { order: resolved.order });
}

function setDiscount(state, payload) {
  const resolved = resolveOrder(state, payload.mode, payload.targetId);
  if (!resolved) return fail('Mesa ou comanda não encontrada.');

  const order = resolved.order;
  const subtotal = round2(order.items.reduce((sum, item) => sum + item.total, 0));
  const requested = Number(payload.discount);
  if (!Number.isFinite(requested) || requested < 0) return fail('Desconto inválido.');

  order.discount = Math.min(round2(requested), subtotal);
  replaceOrder(state, resolved, order);
  return done(state, { order, discount: order.discount });
}

function updateTableStatus(state, payload) {
  const table = state.tables.find(entry => entry.id === Number(payload.tableId));
  if (!table) return fail('Mesa não encontrada.');
  if (!TABLE_STATUSES.includes(payload.status)) return fail('Status de mesa inválido.');

  table.status = payload.status;
  if (payload.seats) table.seats = Number(payload.seats);

  if (payload.status === 'ocupada') {
    table.waiter = payload.waiter || table.waiter || 'Atendimento';
    table.openedAt = table.openedAt || nowTime();
  } else {
    table.waiter = undefined;
    table.openedAt = undefined;
    if (payload.status === 'livre') {
      // Liberar mesa devolve os itens pendentes ao estoque.
      table.items.forEach(item => applyStockDelta(state, item.productId, item.qty));
      table.items = [];
      table.discount = 0;
      table.customersCount = undefined;
    }
  }

  return done(state, { table });
}

function transferTable(state, payload) {
  const from = state.tables.find(table => table.id === Number(payload.fromId));
  const to = state.tables.find(table => table.id === Number(payload.toId));
  if (!from || !to) return fail('Mesa de origem ou destino não encontrada.');
  if (from.id === to.id) return fail('Selecione uma mesa de destino diferente.');
  if (to.status === 'ocupada' && to.items.length > 0) return fail('A mesa de destino já está ocupada.');

  to.items = [...to.items, ...from.items];
  to.status = 'ocupada';
  to.waiter = from.waiter || to.waiter;
  to.customersCount = from.customersCount || to.customersCount;
  to.openedAt = from.openedAt || to.openedAt;
  to.discount = from.discount || 0;

  from.items = [];
  from.status = 'livre';
  from.waiter = undefined;
  from.customersCount = undefined;
  from.openedAt = undefined;
  from.discount = 0;

  return done(state, { from, to });
}

function openComanda(state, payload) {
  const name = cleanText(payload.name, 120);
  if (!name) return fail('Informe o nome do cliente.');

  const comanda = {
    id: newId('cmd'),
    number: `Comanda #${state.comandas.length + 101}`,
    customerName: name,
    waiter: cleanText(payload.waiter, 80) || 'Atendimento',
    status: 'aberta',
    openedAt: nowTime(),
    items: [],
    discount: 0,
    hasServiceTax: true
  };

  state.comandas = [comanda, ...state.comandas];
  return done(state, { comanda });
}

function addStock(state, payload) {
  const product = findProduct(state, payload.productId);
  if (!product) return fail('Produto não encontrado.');

  const qty = Number(payload.qty);
  if (!isPositiveInt(qty)) return fail('Quantidade de entrada inválida.');

  product.currentStock += qty;
  addStockMovement(state, product, 'entrada', qty, payload.reason, payload.actor);
  return done(state, { product });
}

function removeStock(state, payload) {
  const product = findProduct(state, payload.productId);
  if (!product) return fail('Produto não encontrado.');

  const qty = Number(payload.qty);
  if (!isPositiveInt(qty)) return fail('Quantidade de saída inválida.');
  if (product.currentStock < qty) return fail(`Estoque insuficiente: disponível ${product.currentStock}.`);

  product.currentStock -= qty;
  addStockMovement(state, product, 'baixa', qty, payload.reason, payload.actor);
  return done(state, { product });
}

function addProduct(state, payload) {
  const data = payload.product || {};
  const name = cleanText(data.name, 120);
  if (!name) return fail('Informe o nome do produto.');

  const price = round2(data.price);
  if (price < 0) return fail('Preço inválido.');

  const state_ = state.products.find(product => product.name.toLowerCase() === name.toLowerCase());
  if (state_) return fail('Já existe um produto com esse nome.');

  const product = {
    id: newId('prod'),
    name,
    category: cleanText(data.category, 60) || 'Petiscos',
    price,
    costPrice: round2(data.costPrice),
    currentStock: Number.isFinite(Number(data.currentStock)) ? Number(data.currentStock) : 0,
    minStock: Number.isFinite(Number(data.minStock)) ? Number(data.minStock) : 0,
    unit: cleanText(data.unit, 20) || 'un',
    description: data.description ? cleanText(data.description, 400) : undefined,
    expiryDate: data.expiryDate ? cleanText(data.expiryDate, 10) : undefined
  };

  state.products = [product, ...state.products];
  return done(state, { product });
}

function updateProductPrice(state, payload) {
  const product = findProduct(state, payload.productId);
  if (!product) return fail('Produto não encontrado.');

  const price = Number(payload.price);
  if (!Number.isFinite(price) || price < 0) return fail('Preço inválido.');

  const previousPrice = product.price;
  product.price = round2(price);
  return done(state, { product, previousPrice });
}

function submitDigitalOrder(state, payload) {
  const items = Array.isArray(payload.items) ? payload.items : [];
  if (items.length === 0) return fail('Pedido sem itens.');

  const prepared = [];
  for (const raw of items) {
    const product = findProduct(state, raw.productId);
    if (!product) return fail('Produto do pedido não encontrado.');
    const qty = Number(raw.qty ?? 1);
    if (!isPositiveInt(qty)) return fail('Quantidade inválida no pedido.');
    if (product.currentStock < qty) {
      return fail(`Estoque insuficiente: ${product.name} possui ${product.currentStock} ${product.unit}.`);
    }
    prepared.push({
      id: newId('d-item'),
      productId: product.id,
      name: product.name,
      qty,
      price: round2(product.price),
      total: round2(product.price * qty),
      observation: raw.observation ? cleanText(raw.observation, 200) : undefined,
      timestamp: nowTime(),
      status: 'pendente'
    });
  }

  const order = {
    id: newId('d-ord'),
    orderNumber: `#DIG-${Math.floor(100 + Math.random() * 900)}`,
    tableNumber: cleanText(payload.tableNumber, 40) || 'Mesa',
    customerName: cleanText(payload.customerName, 120) || 'Cliente na Mesa',
    items: prepared,
    observation: payload.observation ? cleanText(payload.observation) : undefined,
    status: 'aguardando',
    createdAt: nowTime(),
    createdAtTimestamp: Date.now(),
    maxPreparationMinutes: 15,
    total: round2(prepared.reduce((sum, item) => sum + item.total, 0)),
    origin: 'cardapio'
  };

  state.digitalOrders = [order, ...state.digitalOrders];
  return done(state, { order });
}

function acceptDigitalOrder(state, payload) {
  const order = state.digitalOrders.find(entry => entry.id === payload.orderId);
  if (!order) return fail('Pedido não encontrado.');
  if (order.status !== 'aguardando') return fail('Este pedido não está aguardando aceite.');

  const requested = new Map();
  order.items.forEach(item => requested.set(item.productId, (requested.get(item.productId) || 0) + item.qty));

  for (const [productId, qty] of requested) {
    const product = findProduct(state, productId);
    if (!product || product.currentStock < qty) {
      order.status = 'recusado';
      order.rejectionReason = `Estoque insuficiente: ${product?.name || 'produto indisponível'}`;
      return done(state, { order, rejected: true });
    }
  }

  for (const [productId, qty] of requested) applyStockDelta(state, productId, -qty);

  order.status = 'preparo';

  const table = state.tables.find(entry => entry.number === order.tableNumber);
  if (table) {
    table.status = 'ocupada';
    table.openedAt = table.openedAt || order.createdAt;
    table.waiter = table.waiter || 'Atendimento';
    table.customersCount = table.customersCount || 2;
    table.items = [
      ...table.items,
      ...order.items.map(item => ({
        ...item,
        id: newId('item'),
        status: 'enviado',
        observation: item.observation
          ? `${item.observation} [via Cardápio Digital]`
          : (order.observation ? `[Cardápio Digital: ${order.observation}]` : '[via Cardápio Digital]')
      }))
    ];
  }

  return done(state, { order, table });
}

function rejectDigitalOrder(state, payload) {
  const order = state.digitalOrders.find(entry => entry.id === payload.orderId);
  if (!order) return fail('Pedido não encontrado.');
  if (order.status !== 'aguardando') return fail('Este pedido não está aguardando aceite.');

  order.status = 'recusado';
  order.rejectionReason = cleanText(payload.reason, 200) || 'Item indisponível no momento';
  return done(state, { order });
}

function updateDigitalOrderStatus(state, payload) {
  const order = state.digitalOrders.find(entry => entry.id === payload.orderId);
  if (!order) return fail('Pedido não encontrado.');
  if (!DIGITAL_ORDER_STATUSES.includes(payload.status)) return fail('Status de pedido inválido.');
  if (order.status === 'recusado') return fail('Pedido recusado não pode mudar de status.');

  order.status = payload.status;
  return done(state, { order });
}

function sendOrderToKitchen(state, payload) {
  const resolved = resolveOrder(state, payload.mode, payload.targetId);
  if (!resolved) return fail('Mesa ou comanda não encontrada.');

  const order = resolved.order;
  const pending = order.items.filter(item => item.status === 'pendente');
  if (pending.length === 0) return fail('Não há itens novos para enviar à cozinha.');

  const sourceLabel = resolved.kind === 'tables' ? order.number : order.number;
  const kitchenOrder = {
    id: newId('pdv-ord'),
    orderNumber: `#PDV-${Math.floor(100 + Math.random() * 900)}`,
    tableNumber: sourceLabel,
    customerName: resolved.kind === 'tables'
      ? (order.waiter || 'Atendimento')
      : (order.customerName || order.waiter || 'Comanda'),
    items: pending.map(item => ({ ...item, status: 'enviado' })),
    status: 'aguardando',
    createdAt: nowTime(),
    createdAtTimestamp: Date.now(),
    maxPreparationMinutes: 15,
    total: round2(pending.reduce((sum, item) => sum + item.total, 0)),
    origin: 'pdv'
  };

  const sentIds = new Set(pending.map(item => item.id));
  order.items = order.items.map(item => (sentIds.has(item.id) ? { ...item, status: 'enviado' } : item));

  state.digitalOrders = [kitchenOrder, ...state.digitalOrders];
  replaceOrder(state, resolved, order);
  return done(state, { order, kitchenOrder });
}

function processPayment(state, payload) {
  const source = cleanText(payload.source, 60);
  if (!source) return fail('Informe a origem do pagamento.');
  if (!PAYMENT_METHODS.includes(payload.paymentMethod)) return fail('Forma de pagamento inválida.');

  const isTable = source.startsWith('Mesa');
  const order = isTable
    ? state.tables.find(table => table.number === source)
    : state.comandas.find(comanda => comanda.number === source);

  if (!order) return fail('Mesa ou comanda não encontrada.');
  if (!order.items || order.items.length === 0) return fail('Não há itens para pagar nesta conta.');

  // Totais sempre recalculados no servidor a partir dos itens persistidos.
  const totals = orderTotals(order);
  if (totals.total <= 0) return fail('Valor total inválido para pagamento.');

  let cashReceived;
  let change;
  if (payload.paymentMethod === 'dinheiro') {
    cashReceived = round2(payload.cashReceived);
    if (!Number.isFinite(cashReceived) || cashReceived < totals.total) {
      return fail('Valor recebido em dinheiro é menor que o total.');
    }
    change = round2(cashReceived - totals.total);
  }

  const installments = payload.paymentMethod === 'credito' ? Math.max(1, Math.min(12, Number(payload.installments) || 1)) : undefined;
  const splitPersons = Number(payload.splitPersons) > 1 ? Math.floor(Number(payload.splitPersons)) : undefined;

  const transaction = {
    id: newId('tx'),
    timestamp: nowTime(),
    source,
    waiter: order.waiter || payload.actor || 'Atendimento',
    operator: cleanText(payload.operator, 80) || 'Caixa 01',
    subtotal: totals.subtotal,
    discount: totals.discount,
    serviceTax: totals.serviceTax,
    total: totals.total,
    paymentMethod: payload.paymentMethod,
    installments,
    splitPersons,
    cashReceived,
    change,
    status: 'aprovado',
    itemsSummary: order.items.map(item => `${item.qty}x ${item.name}`).slice(0, 3).join(', ')
  };

  state.transactions = [transaction, ...state.transactions];

  if (isTable) {
    order.status = 'livre';
    order.items = [];
    order.waiter = undefined;
    order.customersCount = undefined;
    order.openedAt = undefined;
    order.discount = 0;
  } else {
    order.status = 'fechada';
    order.items = [];
    order.discount = 0;
  }

  return done(state, { transaction });
}

const HANDLERS = {
  addItem,
  removeItem,
  updateItemQty,
  setItemObservation,
  clearOrder,
  toggleServiceTax,
  setDiscount,
  updateTableStatus,
  transferTable,
  openComanda,
  addStock,
  removeStock,
  addProduct,
  updateProductPrice,
  submitDigitalOrder,
  acceptDigitalOrder,
  rejectDigitalOrder,
  updateDigitalOrderStatus,
  sendOrderToKitchen,
  processPayment
};

export const ACTION_TYPES = Object.keys(HANDLERS);

/** Ações que exigem registro de auditoria por afetarem dinheiro ou inventário. */
export const AUDITED_ACTIONS = new Set([
  'processPayment',
  'setDiscount',
  'removeItem',
  'clearOrder',
  'updateProductPrice',
  'removeStock',
  'rejectDigitalOrder',
  'updateTableStatus'
]);

/**
 * Aplica uma ação ao estado e devolve um novo estado.
 * Nunca lança exceção por dados inválidos: devolve { ok: false, error }.
 */
export function applyAction(currentState, action) {
  const state = normalizeState(structuredClone(currentState));
  const type = action?.type;
  const handler = HANDLERS[type];
  if (!handler) return fail(`Ação desconhecida: ${type}`);

  try {
    return handler(state, action.payload || {});
  } catch (error) {
    return fail(`Falha ao processar ${type}: ${error.message}`);
  }
}
