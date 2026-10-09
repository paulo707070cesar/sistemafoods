// Armazenamento do estado de negócio no SQLite, com revisão e notificação de mudanças.
// O servidor é a única fonte de verdade: o cliente envia ações, nunca o estado final.
import { applyAction, createInitialState, normalizeState, AUDITED_ACTIONS, orderTotals } from '../shared/businessLogic.js';

const STATE_KEY = 'business';
const MAX_AUDIT_METADATA = 500;

export function createStateStore(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      revision INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL
    );
  `);

  const listeners = new Set();

  const selectState = db.prepare('SELECT payload, revision FROM app_state WHERE key = ?');
  const insertState = db.prepare(`
    INSERT INTO app_state (key, payload, revision, updated_at)
    VALUES (?, ?, ?, ?)
  `);
  const updateState = db.prepare(`
    UPDATE app_state SET payload = ?, revision = ?, updated_at = ? WHERE key = ?
  `);
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (user_id, action, metadata, created_at)
    VALUES (?, ?, ?, ?)
  `);

  function seed() {
    const initial = createInitialState();
    const now = Date.now();
    insertState.run(STATE_KEY, JSON.stringify(initial), 1, now);
    return { state: initial, revision: 1 };
  }

  function load() {
    const row = selectState.get(STATE_KEY);
    if (!row) return seed();
    try {
      return { state: normalizeState(JSON.parse(row.payload)), revision: Number(row.revision) || 1 };
    } catch {
      // Estado corrompido: recomeça do conjunto inicial em vez de derrubar o servidor.
      const initial = createInitialState();
      updateState.run(JSON.stringify(initial), 1, Date.now(), STATE_KEY);
      return { state: initial, revision: 1 };
    }
  }

  let current = load();

  function persist() {
    updateState.run(JSON.stringify(current.state), current.revision, Date.now(), STATE_KEY);
  }

  function emit(event) {
    for (const listener of listeners) {
      try {
        listener(event);
      } catch {
        // Um assinante com problema não pode interromper os demais.
      }
    }
  }

  return {
    getState() {
      return current.state;
    },

    getRevision() {
      return current.revision;
    },

    /** Resumo calculado no servidor, usado por dashboards e conferência. */
    getSummary() {
      const { state } = current;
      const revenue = state.transactions
        .filter(transaction => transaction.status === 'aprovado')
        .reduce((sum, transaction) => sum + Number(transaction.total || 0), 0);
      const occupied = state.tables.filter(table => table.status === 'ocupada');
      return {
        revenue: Number(revenue.toFixed(2)),
        transactions: state.transactions.length,
        occupiedTables: occupied.length,
        totalTables: state.tables.length,
        criticalStock: state.products.filter(product => product.currentStock <= product.minStock).length,
        openOrders: state.digitalOrders.filter(order => ['aguardando', 'preparo'].includes(order.status)).length
      };
    },

    /**
     * Aplica uma ação de negócio de forma atômica e persistente.
     * Retorna { ok, error?, state?, revision?, result? }.
     */
    apply(action, user) {
      const outcome = applyAction(current.state, action);
      if (!outcome.ok) return outcome;

      current = { state: outcome.state, revision: current.revision + 1 };
      persist();

      if (AUDITED_ACTIONS.has(action?.type)) {
        let metadata = JSON.stringify({ action: action.type, payload: action.payload ?? null });
        if (metadata.length > MAX_AUDIT_METADATA) metadata = metadata.slice(0, MAX_AUDIT_METADATA);
        insertAudit.run(user?.id ?? null, action.type, metadata, Date.now());
      }

      emit({ revision: current.revision, action: action?.type ?? null, user: user?.email ?? null });
      return { ...outcome, revision: current.revision };
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    /** Totais oficiais de um pedido específico, para conferência pelo cliente. */
    totalsFor(source) {
      const { state } = current;
      const order = source?.startsWith('Mesa')
        ? state.tables.find(table => table.number === source)
        : state.comandas.find(comanda => comanda.number === source);
      return order ? orderTotals(order) : null;
    }
  };
}
