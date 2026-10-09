import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  Product, 
  Table, 
  Comanda, 
  Transaction, 
  OrderItem, 
  ActiveScreen, 
  UserRole,
  UserRoleConfig,
  PaymentMethod,
  StockMovement,
  TableStatus,
  DigitalOrder,
  DigitalOrderStatus,
  AppInterfaceMode,
  CustomerScreenStep,
  LocalServerStatus,
  InternetStatus,
  SyncMode,
  DeviceConnected,
  SyncQueueItem
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_TABLES, 
  INITIAL_COMANDAS, 
  INITIAL_TRANSACTIONS,
  INITIAL_DIGITAL_ORDERS,
  INITIAL_CONNECTED_DEVICES,
  INITIAL_SYNC_QUEUE
} from '../data/mockData';

export const USER_ROLES_CONFIG: Record<UserRole, UserRoleConfig> = {
  gerente: {
    id: 'gerente',
    label: 'Gerente / Admin',
    shortLabel: 'Gerente',
    description: 'Acesso completo a todas as rotas, relatórios e configurações',
    allowedScreens: ['pdv', 'mesas', 'caixa', 'estoque', 'kds', 'fichas', 'dashboard', 'rede', 'sync_queue', 'instrucoes'],
    color: 'from-amber-500 to-orange-600'
  },
  garcom: {
    id: 'garcom',
    label: 'Garçom / Atendimento',
    shortLabel: 'Garçom',
    description: 'Lançar pedidos e acompanhar mesas e comandas',
    allowedScreens: ['pdv', 'mesas'],
    color: 'from-blue-500 to-indigo-600'
  },
  cozinha: {
    id: 'cozinha',
    label: 'Cozinha & Bar',
    shortLabel: 'Cozinha',
    description: 'Apenas o monitor KDS com os pedidos para preparar',
    allowedScreens: ['kds'],
    color: 'from-red-500 to-amber-600'
  },
  caixa: {
    id: 'caixa',
    label: 'Operador de Caixa',
    shortLabel: 'Caixa',
    description: 'Cobrança, pagamento e visão das mesas',
    allowedScreens: ['caixa', 'mesas'],
    color: 'from-emerald-500 to-teal-600'
  }
};

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface FoodSystemContextType {
  // Screens & Navigation
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  userRoleConfig: UserRoleConfig;
  tabletFrameMode: boolean;
  setTabletFrameMode: (enabled: boolean) => void;
  toggleTabletFrameMode: () => void;

  // Dual Interface View: Tablet vs Mobile Customer
  interfaceMode: AppInterfaceMode;
  setInterfaceMode: (mode: AppInterfaceMode) => void;

  // Selected Target (Table or Comanda)
  activeMode: 'mesas' | 'comandas';
  setActiveMode: (mode: 'mesas' | 'comandas') => void;
  selectedTableId: number;
  setSelectedTableId: (id: number) => void;
  selectedComandaId: string;
  setSelectedComandaId: (id: string) => void;
  activeTable: Table;
  activeComanda: Comanda | undefined;

  // Entities state
  tables: Table[];
  comandas: Comanda[];
  products: Product[];
  transactions: Transaction[];
  stockMovements: StockMovement[];

  // POS / Order actions
  addItemToActiveOrder: (product: Product, qty?: number, observation?: string) => void;
  removeItemFromActiveOrder: (itemId: string) => void;
  updateItemQty: (itemId: string, delta: number) => void;
  setItemObservation: (itemId: string, obs: string) => void;
  clearActiveOrder: () => void;
  toggleActiveServiceTax: () => void;
  setActiveDiscount: (discount: number) => void;
  sendOrderToKitchen: () => void;
  updateTableStatus: (tableId: number, status: TableStatus, seats?: number, waiter?: string) => void;
  transferTable: (fromId: number, toId: number) => void;

  // Comanda actions
  openNewComanda: (name: string, waiter: string) => void;

  // Payment & Checkout
  processPayment: (params: {
    source: string;
    subtotal: number;
    discount: number;
    serviceTax: number;
    total: number;
    paymentMethod: PaymentMethod;
    installments?: number;
    splitPersons?: number;
    cashReceived?: number;
    change?: number;
  }) => Transaction;

  // Stock operations
  addStock: (productId: string, qty: number, reason: string) => void;
  removeStock: (productId: string, qty: number, reason: string) => void;
  addNewProduct: (productData: Omit<Product, 'id'>) => void;
  updateProductPrice: (productId: string, price: number) => void;

  // Digital Menu & Customer Mobile Flow
  customerScreenStep: CustomerScreenStep;
  setCustomerScreenStep: (step: CustomerScreenStep) => void;
  customerSelectedTable: string;
  setCustomerSelectedTable: (tableNum: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerObservation: string;
  setCustomerObservation: (obs: string) => void;
  customerCart: OrderItem[];
  addToCustomerCart: (product: Product, qty?: number, obs?: string) => void;
  removeFromCustomerCart: (itemId: string) => void;
  updateCustomerCartQty: (itemId: string, delta: number) => void;
  clearCustomerCart: () => void;
  submitCustomerOrder: () => DigitalOrder;
  lastCustomerOrderId: string | null;

  // Digital Orders Management (Restaurant Tablet)
  digitalOrders: DigitalOrder[];
  pendingDigitalOrderToReview: DigitalOrder | null;
  setPendingDigitalOrderToReview: (order: DigitalOrder | null) => void;
  acceptDigitalOrder: (orderId: string) => void;
  rejectDigitalOrder: (orderId: string, reason?: string) => void;
  updateDigitalOrderStatus: (orderId: string, status: DigitalOrderStatus) => void;

  // QR Code Modal for Tables
  qrCodeModalOpen: boolean;
  qrCodeModalTable: string;
  openQRCodeModal: (tableNumber?: string) => void;
  closeQRCodeModal: () => void;

  // Receipt Modal
  receiptModalData: {
    isOpen: boolean;
    transaction?: Transaction;
    tableSummary?: {
      source: string;
      items: OrderItem[];
      subtotal: number;
      serviceTax: number;
      discount: number;
      total: number;
      waiter: string;
      openedAt: string;
    };
  };
  openReceiptModal: (transaction?: Transaction, tableSummary?: any) => void;
  closeReceiptModal: () => void;

  // Toast / Feedback
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
  playFeedbackSound: (type?: 'click' | 'success' | 'alert' | 'bell') => void;

  // Network & Cloud Infrastructure
  localServerStatus: LocalServerStatus;
  internetStatus: InternetStatus;
  wifiSSID: string;
  localServerIP: string;
  syncMode: SyncMode;
  setSyncMode: (mode: SyncMode) => void;
  lastSyncTime: string;
  connectedDevices: DeviceConnected[];
  syncQueue: SyncQueueItem[];
  isSyncing: boolean;
  isRestartingServer: boolean;
  wifiTransmissionFeedback: { active: boolean; message: string; from: string; to: string } | null;
  cloudUser: { email: string; name: string } | null;
  /** Revisão do estado confirmada pelo servidor; 0 indica operação apenas local. */
  serverRevision: number;
  toggleLocalServerStatus: () => void;
  toggleInternetStatus: () => void;
  restartLocalServer: () => void;
  triggerSyncNow: () => void;
  retrySyncQueue: () => void;
  cloudLogin: (email: string, pass: string) => Promise<boolean>;
  cloudLogout: () => Promise<void>;
  triggerWifiFlyAnimation: (message: string, from: string, to: string) => void;
}

const FoodSystemContext = createContext<FoodSystemContextType | undefined>(undefined);

const readStored = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
};

export const FoodSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User Role & Screen Access Control
  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('sistema_food_user_role') as UserRole | null;
    return saved && USER_ROLES_CONFIG[saved] ? saved : 'gerente';
  });

  // Tela inicial = primeira tela permitida para o cargo salvo
  const [activeScreen, setActiveScreenRaw] = useState<ActiveScreen>(() => {
    const saved = localStorage.getItem('sistema_food_user_role') as UserRole | null;
    const cfg = (saved && USER_ROLES_CONFIG[saved]) || USER_ROLES_CONFIG.gerente;
    return cfg.allowedScreens.includes('pdv') ? 'pdv' : cfg.allowedScreens[0];
  });

  // Só navega para telas permitidas ao cargo atual
  const setActiveScreen = (screen: ActiveScreen) => {
    const cfg = USER_ROLES_CONFIG[userRole] || USER_ROLES_CONFIG.gerente;
    if (!cfg.allowedScreens.includes(screen)) {
      addToast('warning', 'Acesso restrito', `Essa tela não está disponível para o cargo ${cfg.shortLabel}.`);
      return;
    }
    setActiveScreenRaw(screen);
  };

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    localStorage.setItem('sistema_food_user_role', role);
    const config = USER_ROLES_CONFIG[role];
    if (config && !config.allowedScreens.includes(activeScreen)) {
      setActiveScreenRaw(config.allowedScreens[0]);
    }
  };

  const userRoleConfig = USER_ROLES_CONFIG[userRole] || USER_ROLES_CONFIG.gerente;

  const [tabletFrameMode, setTabletFrameMode] = useState<boolean>(false);
  const [interfaceMode, setInterfaceMode] = useState<AppInterfaceMode>('tablet');
  const [activeMode, setActiveMode] = useState<'mesas' | 'comandas'>('mesas');

  // Network Infrastructure State
  const [localServerStatus, setLocalServerStatus] = useState<LocalServerStatus>('online');
  const [internetStatus, setInternetStatus] = useState<InternetStatus>('online');
  const [wifiSSID] = useState<string>('Food_System_5G');
  const [localServerIP] = useState<string>('192.168.1.100:3000');
  const [syncMode, setSyncMode] = useState<SyncMode>('auto');
  const [lastSyncTime, setLastSyncTime] = useState<string>('14:32');
  const [connectedDevices, setConnectedDevices] = useState<DeviceConnected[]>(INITIAL_CONNECTED_DEVICES);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>(INITIAL_SYNC_QUEUE);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isRestartingServer, setIsRestartingServer] = useState<boolean>(false);
  const [wifiTransmissionFeedback, setWifiTransmissionFeedback] = useState<{
    active: boolean;
    message: string;
    from: string;
    to: string;
  } | null>(null);
  const [cloudUser, setCloudUser] = useState<{ email: string; name: string } | null>(null);
  
  // Default selected Table 5 as shown in reference
  const [selectedTableId, setSelectedTableId] = useState<number>(5);
  const [selectedComandaId, setSelectedComandaId] = useState<string>('cmd-101');

  // Customer Mobile State
  const [customerScreenStep, setCustomerScreenStep] = useState<CustomerScreenStep>('welcome');
  const [customerSelectedTable, setCustomerSelectedTable] = useState<string>('Mesa 05');
  const [customerName, setCustomerName] = useState<string>('Rodrigo Santos');
  const [customerObservation, setCustomerObservation] = useState<string>('');
  const [customerCart, setCustomerCart] = useState<OrderItem[]>([]);
  const [lastCustomerOrderId, setLastCustomerOrderId] = useState<string | null>('d-ord-101');

  // Digital Orders state
  const [digitalOrders, setDigitalOrders] = useState<DigitalOrder[]>(() =>
    readStored('sistema_food_digital_orders', INITIAL_DIGITAL_ORDERS)
  );

  const [pendingDigitalOrderToReview, setPendingDigitalOrderToReview] = useState<DigitalOrder | null>(null);

  // QR Code generator modal
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState<boolean>(false);
  const [qrCodeModalTable, setQrCodeModalTable] = useState<string>('Mesa 05');

  const [tables, setTables] = useState<Table[]>(() =>
    readStored('sistema_food_tables', INITIAL_TABLES)
  );

  const [comandas, setComandas] = useState<Comanda[]>(() =>
    readStored('sistema_food_comandas', INITIAL_COMANDAS)
  );

  const [products, setProducts] = useState<Product[]>(() =>
    readStored('sistema_food_products', INITIAL_PRODUCTS)
  );

  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    readStored('sistema_food_transactions', INITIAL_TRANSACTIONS)
  );

  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [receiptModalData, setReceiptModalData] = useState<{
    isOpen: boolean;
    transaction?: Transaction;
    tableSummary?: any;
  }>({ isOpen: false });

  // Persistence
  useEffect(() => {
    localStorage.setItem('sistema_food_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('sistema_food_comandas', JSON.stringify(comandas));
  }, [comandas]);

  useEffect(() => {
    localStorage.setItem('sistema_food_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sistema_food_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('sistema_food_digital_orders', JSON.stringify(digitalOrders));
  }, [digitalOrders]);

  // Restaura a sessão do servidor ao recarregar a página.
  // Ignorado no Electron (file://), onde a API não está disponível.
  useEffect(() => {
    if (!window.location.protocol.startsWith('http')) return;

    let cancelled = false;
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then(response => (response.ok ? response.json() : null))
      .then(payload => {
        if (!cancelled && payload?.user) setCloudUser(payload.user);
      })
      .catch(() => {
        // Servidor indisponível: mantém o usuário deslogado sem interromper a operação local.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Sincronização com o servidor.
  // O servidor é a fonte de verdade das regras de negócio (estoque, totais e
  // auditoria). A interface aplica a alteração localmente para resposta imediata
  // e depois adota o estado devolvido pelo servidor, que corrige divergências.
  // Sem servidor acessível (por exemplo no Electron via file://), o sistema
  // continua operando apenas com o estado local.
  // ---------------------------------------------------------------------------
  const serverModeRef = useRef(false);
  const serverRevisionRef = useRef(0);
  const [serverRevision, setServerRevision] = useState(0);

  const applyServerState = (payload: { revision?: number; state?: Record<string, unknown> } | null) => {
    if (!payload?.state) return;

    const revision = Number(payload.revision) || 0;
    // Ignora respostas atrasadas para não reverter o estado já mais recente.
    if (revision < serverRevisionRef.current) return;
    serverRevisionRef.current = revision;
    setServerRevision(revision);

    const next = payload.state as Record<string, unknown>;
    if (Array.isArray(next.tables)) setTables(next.tables as Table[]);
    if (Array.isArray(next.comandas)) setComandas(next.comandas as Comanda[]);
    if (Array.isArray(next.products)) setProducts(next.products as Product[]);
    if (Array.isArray(next.transactions)) setTransactions(next.transactions as Transaction[]);
    if (Array.isArray(next.digitalOrders)) setDigitalOrders(next.digitalOrders as DigitalOrder[]);
    if (Array.isArray(next.stockMovements)) setStockMovements(next.stockMovements as StockMovement[]);
    if (Array.isArray(next.syncQueue)) setSyncQueue(next.syncQueue as SyncQueueItem[]);
  };

  const refreshFromServer = async () => {
    try {
      const response = await fetch('/api/state', { credentials: 'same-origin' });
      if (!response.ok) return;
      applyServerState(await response.json());
    } catch {
      // Mantém o estado atual até a conexão voltar.
    }
  };

  /** Envia uma ação ao servidor; sem servidor, a alteração local já foi aplicada. */
  const syncAction = (type: string, payload: Record<string, unknown>) => {
    if (!serverModeRef.current) return;

    void fetch('/api/state/actions', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: { type, payload } })
    })
      .then(async response => {
        const body = await response.json().catch(() => null);
        if (body?.state) applyServerState(body);
        if (!response.ok) {
          addToast('error', 'Ação recusada pelo servidor', body?.error || 'A operação não pôde ser concluída.');
        }
      })
      .catch(() => {
        addToast('warning', 'Sem conexão com o servidor', 'A alteração ficou registrada apenas neste terminal.');
      });
  };

  // Carrega o estado compartilhado e passa a acompanhar mudanças de outros terminais.
  useEffect(() => {
    if (!window.location.protocol.startsWith('http')) return;

    let cancelled = false;
    let source: EventSource | null = null;

    const bootstrap = async () => {
      try {
        const response = await fetch('/api/state', { credentials: 'same-origin' });
        if (!response.ok || cancelled) return;

        const payload = await response.json().catch(() => null);
        // Exige estado real: hospedagem estática devolve HTML e não deve ativar o modo servidor.
        if (cancelled || !payload?.state) return;

        applyServerState(payload);
        serverModeRef.current = true;
        source = new EventSource('/api/state/events');
        source.onmessage = () => {
          void refreshFromServer();
        };
        source.onerror = () => {
          // O navegador reconecta automaticamente; nenhuma ação é necessária aqui.
        };
      } catch {
        // Servidor indisponível: segue em modo local.
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
      source?.close();
    };
  }, []);

  // Audio feedback synthesis using Web Audio API
  const playFeedbackSound = (type: 'click' | 'success' | 'alert' | 'bell' = 'click') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'alert') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(330, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'bell') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime);
        osc.frequency.setValueAtTime(1567.98, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch {
      // Audio fallback
    }
  };

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev.slice(-3), { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleTabletFrameMode = () => {
    setTabletFrameMode(prev => !prev);
  };

  // Active table retrieval with fallback
  const activeTable = tables.find(t => t.id === selectedTableId) || tables[0];
  const activeComanda = comandas.find(c => c.id === selectedComandaId);

  // Customer Cart operations
  const addToCustomerCart = (product: Product, qty: number = 1, obs?: string) => {
    playFeedbackSound('click');
    if (!Number.isInteger(qty) || qty <= 0) {
      addToast('warning', 'Quantidade inválida', 'Informe uma quantidade inteira maior que zero.');
      return;
    }

    const alreadyInCart = customerCart
      .filter(item => item.productId === product.id)
      .reduce((sum, item) => sum + item.qty, 0);
    if (alreadyInCart + qty > product.currentStock) {
      addToast('warning', 'Estoque insuficiente', `${product.name} possui apenas ${product.currentStock} ${product.unit} disponíveis.`);
      return;
    }

    const existing = customerCart.find(i => i.productId === product.id && (!obs || i.observation === obs));
    if (existing && !obs) {
      setCustomerCart(prev => prev.map(item => {
        if (item.productId === product.id) {
          const nq = item.qty + qty;
          return { ...item, qty: nq, total: Number((nq * item.price).toFixed(2)) };
        }
        return item;
      }));
    } else {
      const newItem: OrderItem = {
        id: `c-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        name: product.name,
        qty,
        price: product.price,
        total: Number((qty * product.price).toFixed(2)),
        observation: obs,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'pendente'
      };
      setCustomerCart(prev => [...prev, newItem]);
    }
    addToast('success', `${product.name} Adicionado`, `No carrinho da ${customerSelectedTable}`);
  };

  const removeFromCustomerCart = (itemId: string) => {
    playFeedbackSound('alert');
    setCustomerCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateCustomerCartQty = (itemId: string, delta: number) => {
    playFeedbackSound('click');
    setCustomerCart(prev => {
      return prev.map(item => {
        if (item.id === itemId) {
          const nq = item.qty + delta;
          if (nq <= 0) return null;
          return { ...item, qty: nq, total: Number((nq * item.price).toFixed(2)) };
        }
        return item;
      }).filter(Boolean) as OrderItem[];
    });
  };

  const clearCustomerCart = () => {
    setCustomerCart([]);
    setCustomerObservation('');
  };

  // Customer Submits Digital Order
  const submitCustomerOrder = (): DigitalOrder => {
    playFeedbackSound('bell');
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const orderTotal = customerCart.reduce((acc, i) => acc + i.total, 0);
    const orderNum = `#DIG-${Math.floor(100 + Math.random() * 900)}`;

    const newDigitalOrder: DigitalOrder = {
      id: `d-ord-${Date.now()}`,
      orderNumber: orderNum,
      tableNumber: customerSelectedTable,
      customerName: customerName || 'Cliente na Mesa',
      items: [...customerCart],
      observation: customerObservation,
      status: 'aguardando',
      createdAt: timeStr,
      createdAtTimestamp: Date.now(),
      maxPreparationMinutes: 15,
      total: orderTotal
    };

    setDigitalOrders(prev => [newDigitalOrder, ...prev]);
    setLastCustomerOrderId(newDigitalOrder.id);
    clearCustomerCart();
    setCustomerScreenStep('status');

    // Notify Restaurant Tablet
    setPendingDigitalOrderToReview(newDigitalOrder);
    triggerWifiFlyAnimation(`Pedido ${orderNum} enviado via Wi-Fi local para a cozinha! 🍳`, customerSelectedTable, 'KDS Cozinha');
    addToast('info', '🔔 Pedido Enviado via Wi-Fi', `Seu pedido ${orderNum} foi recebido pela cozinha via rede local!`);

    if (internetStatus === 'offline') {
      const newQueueItem: SyncQueueItem = {
        id: `sq-${Date.now()}`,
        type: 'pedido',
        description: `Pedido Cliente ${orderNum} (${customerSelectedTable})`,
        origin: customerSelectedTable,
        timestamp: timeStr,
        status: 'pendente',
        amount: orderTotal,
        payloadSummary: 'Transmitido via Wi-Fi do cliente; aguardando sync nuvem'
      };
      setSyncQueue(prev => [newQueueItem, ...prev]);
    }

    syncAction('submitDigitalOrder', {
      tableNumber: customerSelectedTable,
      customerName: customerName || 'Cliente na Mesa',
      items: customerCart.map(item => ({ productId: item.productId, qty: item.qty, observation: item.observation })),
      observation: customerObservation
    });

    return newDigitalOrder;
  };


  // Restaurant Tablet Reviews & Accepts Digital Order
  const acceptDigitalOrder = (orderId: string) => {
    playFeedbackSound('success');
    const order = digitalOrders.find(o => o.id === orderId);
    if (!order) return;

    const requestedByProduct = new Map<string, number>();
    order.items.forEach(item => {
      requestedByProduct.set(item.productId, (requestedByProduct.get(item.productId) || 0) + item.qty);
    });
    const unavailable = [...requestedByProduct.entries()].find(([productId, qty]) => {
      const product = products.find(p => p.id === productId);
      return !product || product.currentStock < qty;
    });
    if (unavailable) {
      const product = products.find(p => p.id === unavailable[0]);
      setDigitalOrders(prev => prev.map(o => o.id === orderId
        ? { ...o, status: 'recusado', rejectionReason: `Estoque insuficiente: ${product?.name || 'produto indisponível'}` }
        : o
      ));
      setPendingDigitalOrderToReview(null);
      addToast('error', 'Pedido não aceito', `Estoque insuficiente para ${product?.name || 'um dos itens'}.`);
      return;
    }

    setProducts(prev => prev.map(product => {
      const qty = requestedByProduct.get(product.id) || 0;
      return qty > 0 ? { ...product, currentStock: product.currentStock - qty } : product;
    }));

    // Update status to 'preparo'
    setDigitalOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'preparo' } : o));

    // Incorporate into the target Table
    setTables(prev => prev.map(t => {
      if (t.number === order.tableNumber) {
        return {
          ...t,
          status: 'ocupada',
          openedAt: t.openedAt || order.createdAt,
          waiter: t.waiter || 'Marcos Vinicius',
          customersCount: t.customersCount || 2,
          items: [
            ...t.items,
            ...order.items.map(item => ({
              ...item,
              status: 'enviado' as const,
              observation: item.observation 
                ? `${item.observation} [via Cardápio Digital]` 
                : (order.observation ? `[Cardápio Digital: ${order.observation}]` : '[via Cardápio Digital]')
            }))
          ]
        };
      }
      return t;
    }));

    if (pendingDigitalOrderToReview?.id === orderId) {
      setPendingDigitalOrderToReview(null);
    }

    addToast('success', 'Pedido Aceito!', `${order.orderNumber} da ${order.tableNumber} integrado ao PDV e enviado à cozinha.`);
    syncAction('acceptDigitalOrder', { orderId });
  };

  const rejectDigitalOrder = (orderId: string, reason: string = 'Item indisponível no momento') => {
    playFeedbackSound('alert');
    setDigitalOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'recusado', rejectionReason: reason } : o));
    if (pendingDigitalOrderToReview?.id === orderId) {
      setPendingDigitalOrderToReview(null);
    }
    addToast('warning', 'Pedido Recusado', `Pedido marcado como recusado (${reason}).`);
    syncAction('rejectDigitalOrder', { orderId, reason });
  };

  const updateDigitalOrderStatus = (orderId: string, newStatus: DigitalOrderStatus) => {
    playFeedbackSound('click');
    setDigitalOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    addToast('info', 'Status Atualizado', `Pedido alterado para ${newStatus.toUpperCase()}`);
    syncAction('updateDigitalOrderStatus', { orderId, status: newStatus });
  };

  const openQRCodeModal = (tableNumber?: string) => {
    playFeedbackSound('click');
    setQrCodeModalTable(tableNumber || activeTable.number);
    setQrCodeModalOpen(true);
  };

  const closeQRCodeModal = () => {
    setQrCodeModalOpen(false);
  };

  // Add Item to Order
  const addItemToActiveOrder = (product: Product, qty: number = 1, observation?: string) => {
    playFeedbackSound('click');
    if (!Number.isInteger(qty) || qty <= 0) {
      addToast('warning', 'Quantidade inválida', 'Informe uma quantidade inteira maior que zero.');
      return;
    }
    if (product.currentStock < qty) {
      addToast('warning', 'Estoque insuficiente', `${product.name} possui apenas ${product.currentStock} ${product.unit} disponíveis.`);
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (activeMode === 'mesas') {
      setTables(prev => prev.map(t => {
        if (t.id !== selectedTableId) return t;

        const existingIndex = t.items.findIndex(i => i.productId === product.id && (!observation || i.observation === observation));

        let updatedItems: OrderItem[];
        if (existingIndex >= 0 && !observation) {
          updatedItems = t.items.map((item, idx) => {
            if (idx === existingIndex) {
              const newQty = item.qty + qty;
              return { ...item, qty: newQty, total: Number((newQty * item.price).toFixed(2)) };
            }
            return item;
          });
        } else {
          const newItem: OrderItem = {
            id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            productId: product.id,
            name: product.name,
            qty,
            price: product.price,
            total: Number((qty * product.price).toFixed(2)),
            observation,
            timestamp: timeStr,
            status: 'pendente'
          };
          updatedItems = [...t.items, newItem];
        }

        return {
          ...t,
          status: 'ocupada',
          openedAt: t.openedAt || timeStr,
          waiter: t.waiter || 'Marcos Vinicius',
          customersCount: t.customersCount || 2,
          items: updatedItems
        };
      }));

      addToast('success', `${product.name} Adicionado`, `Qtd: ${qty} - Total: R$ ${(product.price * qty).toFixed(2)}`);
    } else {
      // Comandas mode
      setComandas(prev => prev.map(c => {
        if (c.id !== selectedComandaId) return c;
        const newItem: OrderItem = {
          id: `cmd-item-${Date.now()}`,
          productId: product.id,
          name: product.name,
          qty,
          price: product.price,
          total: Number((qty * product.price).toFixed(2)),
          observation,
          timestamp: timeStr,
          status: 'pendente'
        };
        return {
          ...c,
          status: 'aberta',
          items: [...c.items, newItem]
        };
      }));
      addToast('success', `${product.name} Adicionado`, `Comanda ${activeComanda?.number}`);
    }

    setProducts(prev => prev.map(p => p.id === product.id
      ? { ...p, currentStock: Math.max(0, p.currentStock - qty) }
      : p
    ));

    syncAction('addItem', {
      mode: activeMode,
      targetId: activeMode === 'mesas' ? selectedTableId : selectedComandaId,
      productId: product.id,
      qty,
      observation,
      actor: activeTable.waiter
    });
  };

  const removeItemFromActiveOrder = (itemId: string) => {
    playFeedbackSound('alert');
    const activeItems = activeMode === 'mesas' ? activeTable.items : (activeComanda?.items || []);
    const itemToRemove = activeItems.find(item => item.id === itemId);
    if (!itemToRemove) return;

    setProducts(prev => prev.map(product => product.id === itemToRemove.productId
      ? { ...product, currentStock: product.currentStock + itemToRemove.qty }
      : product
    ));

    if (activeMode === 'mesas') {
      setTables(prev => prev.map(t => t.id === selectedTableId
        ? { ...t, items: t.items.filter(i => i.id !== itemId) }
        : t
      ));
    } else {
      setComandas(prev => prev.map(c => c.id === selectedComandaId
        ? { ...c, items: c.items.filter(i => i.id !== itemId) }
        : c
      ));
    }
    addToast('info', 'Item Cancelado', 'Item removido da comanda atual e devolvido ao estoque.');
    syncAction('removeItem', {
      mode: activeMode,
      targetId: activeMode === 'mesas' ? selectedTableId : selectedComandaId,
      itemId
    });
  };

  const updateItemQty = (itemId: string, delta: number) => {
    playFeedbackSound('click');
    if (!Number.isInteger(delta) || delta === 0) return;

    const activeItems = activeMode === 'mesas' ? activeTable.items : (activeComanda?.items || []);
    const target = activeItems.find(item => item.id === itemId);
    if (!target) return;

    const nextQty = target.qty + delta;
    const effectiveDelta = nextQty <= 0 ? -target.qty : delta;
    const product = products.find(item => item.id === target.productId);

    if (effectiveDelta > 0 && (!product || product.currentStock < effectiveDelta)) {
      addToast('warning', 'Estoque insuficiente', `Não há estoque suficiente para aumentar ${target.name}.`);
      return;
    }

    setProducts(prev => prev.map(item => item.id === target.productId
      ? { ...item, currentStock: Math.max(0, item.currentStock - effectiveDelta) }
      : item
    ));

    if (activeMode === 'mesas') {
      setTables(prev => prev.map(table => {
        if (table.id !== selectedTableId) return table;
        return {
          ...table,
          items: nextQty <= 0
            ? table.items.filter(item => item.id !== itemId)
            : table.items.map(item => item.id === itemId
              ? { ...item, qty: nextQty, total: Number((nextQty * item.price).toFixed(2)) }
              : item
            )
        };
      }));
    } else {
      setComandas(prev => prev.map(comanda => {
        if (comanda.id !== selectedComandaId) return comanda;
        return {
          ...comanda,
          items: nextQty <= 0
            ? comanda.items.filter(item => item.id !== itemId)
            : comanda.items.map(item => item.id === itemId
              ? { ...item, qty: nextQty, total: Number((nextQty * item.price).toFixed(2)) }
              : item
            )
        };
      }));
    }

    syncAction('updateItemQty', {
      mode: activeMode,
      targetId: activeMode === 'mesas' ? selectedTableId : selectedComandaId,
      itemId,
      delta
    });
  };

  const setItemObservation = (itemId: string, obs: string) => {
    if (activeMode === 'mesas') {
      setTables(prev => prev.map(t => {
        if (t.id !== selectedTableId) return t;
        return {
          ...t,
          items: t.items.map(i => i.id === itemId ? { ...i, observation: obs } : i)
        };
      }));
    } else {
      setComandas(prev => prev.map(c => {
        if (c.id !== selectedComandaId) return c;
        return {
          ...c,
          items: c.items.map(i => i.id === itemId ? { ...i, observation: obs } : i)
        };
      }));
    }
    addToast('info', 'Observação salva', obs || 'Observação removida.');
    syncAction('setItemObservation', {
      mode: activeMode,
      targetId: activeMode === 'mesas' ? selectedTableId : selectedComandaId,
      itemId,
      observation: obs
    });
  };

  const clearActiveOrder = () => {
    if (activeMode === 'mesas') {
      setTables(prev => prev.map(t => {
        if (t.id !== selectedTableId) return t;
        return {
          ...t,
          items: [],
          status: 'livre',
          waiter: undefined,
          customersCount: undefined,
          openedAt: undefined,
          discount: 0
        };
      }));
    }

    syncAction('clearOrder', {
      mode: activeMode,
      targetId: activeMode === 'mesas' ? selectedTableId : selectedComandaId
    });
  };

  const toggleActiveServiceTax = () => {
    playFeedbackSound('click');
    if (activeMode === 'mesas') {
      setTables(prev => prev.map(t => t.id === selectedTableId ? { ...t, hasServiceTax: !t.hasServiceTax } : t));
    } else {
      setComandas(prev => prev.map(c => c.id === selectedComandaId ? { ...c, hasServiceTax: !c.hasServiceTax } : c));
    }
    syncAction('toggleServiceTax', {
      mode: activeMode,
      targetId: activeMode === 'mesas' ? selectedTableId : selectedComandaId
    });
  };

  const setActiveDiscount = (discount: number) => {
    const subtotal = (activeMode === 'mesas' ? activeTable.items : (activeComanda?.items || []))
      .reduce((sum, item) => sum + item.total, 0);
    const safeDiscount = Number.isFinite(discount)
      ? Math.min(Math.max(0, Number(discount)), subtotal)
      : 0;

    if (activeMode === 'mesas') {
      setTables(prev => prev.map(t => t.id === selectedTableId ? { ...t, discount: safeDiscount } : t));
    } else {
      setComandas(prev => prev.map(c => c.id === selectedComandaId ? { ...c, discount: safeDiscount } : c));
    }

    syncAction('setDiscount', {
      mode: activeMode,
      targetId: activeMode === 'mesas' ? selectedTableId : selectedComandaId,
      discount: safeDiscount
    });
  };

  const sendOrderToKitchen = () => {
    const sourceLabel = activeMode === 'mesas' ? activeTable.number : (activeComanda?.number || 'Comanda');
    const sourceItems = activeMode === 'mesas' ? activeTable.items : (activeComanda?.items || []);

    // Somente itens ainda não enviados (evita duplicar no KDS ao reenviar)
    const pendingItems = sourceItems.filter(i => i.status === 'pendente');

    if (pendingItems.length === 0) {
      playFeedbackSound('alert');
      addToast('warning', 'Nada para enviar', `Não há itens novos na ${sourceLabel} para enviar à cozinha.`);
      return;
    }

    playFeedbackSound('success');
    const itemCount = pendingItems.length;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Cria o pedido que o KDS da cozinha enxerga (o KDS lê digitalOrders)
    const kitchenOrder: DigitalOrder = {
      id: `pdv-ord-${Date.now()}`,
      orderNumber: `#PDV-${Math.floor(100 + Math.random() * 900)}`,
      tableNumber: sourceLabel,
      customerName: activeMode === 'mesas'
        ? (activeTable.waiter || 'Garçom')
        : (activeComanda?.customerName || activeComanda?.waiter || 'Comanda'),
      items: pendingItems.map(i => ({ ...i, status: 'enviado' as const })),
      status: 'aguardando', // entra na coluna "Recebidos" para a cozinha aceitar antes de iniciar o preparo
      createdAt: timeStr,
      createdAtTimestamp: Date.now(),
      maxPreparationMinutes: 15,
      total: pendingItems.reduce((acc, i) => acc + i.total, 0),
      origin: 'pdv'
    };
    setDigitalOrders(prev => [kitchenOrder, ...prev]);

    triggerWifiFlyAnimation(`Pedido ${sourceLabel} transmitido via Wi-Fi Local para o KDS da Cozinha (2ms)! 🍳`, 'Tablet Garçom', 'KDS Cozinha');

    const sentIds = new Set(pendingItems.map(i => i.id));

    if (activeMode === 'mesas') {
      setTables(prev => prev.map(t => {
        if (t.id !== selectedTableId) return t;
        return {
          ...t,
          items: t.items.map(i => sentIds.has(i.id) ? { ...i, status: 'enviado' as const } : i)
        };
      }));
      addToast('success', 'Pedido Enviado via Wi-Fi', `${itemCount} item(ns) da ${sourceLabel} transmitidos à Cozinha e Bar via rede local!`);
    } else {
      setComandas(prev => prev.map(c => {
        if (c.id !== selectedComandaId) return c;
        return {
          ...c,
          items: c.items.map(i => sentIds.has(i.id) ? { ...i, status: 'enviado' as const } : i)
        };
      }));
      addToast('success', 'Pedido Enviado via Wi-Fi', `${itemCount} item(ns) da ${sourceLabel} transmitidos à Cozinha via rede local!`);
    }

    if (internetStatus === 'offline') {
      const newQueueItem: SyncQueueItem = {
        id: `sq-${Date.now()}`,
        type: 'pedido',
        description: `Pedido ${sourceLabel} (${itemCount} itens)`,
        origin: sourceLabel,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: 'pendente',
        payloadSummary: 'Salvo localmente no servidor SQLite; aguardando internet'
      };
      setSyncQueue(prev => [newQueueItem, ...prev]);
    }

    syncAction('sendOrderToKitchen', {
      mode: activeMode,
      targetId: activeMode === 'mesas' ? selectedTableId : selectedComandaId
    });
  };

  const updateTableStatus = (tableId: number, status: TableStatus, seats?: number, waiter?: string) => {
    playFeedbackSound('click');
    setTables(prev => prev.map(t => {
      if (t.id !== tableId) return t;
      return {
        ...t,
        status,
        seats: seats || t.seats,
        waiter: waiter || (status === 'ocupada' ? (t.waiter || 'Marcos Vinicius') : undefined),
        openedAt: status === 'ocupada' ? (t.openedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : undefined,
        items: status === 'livre' ? [] : t.items
      };
    }));
    addToast('info', 'Status Atualizado', `Mesa alterada para ${status.toUpperCase()}`);
    syncAction('updateTableStatus', { tableId, status, seats, waiter });
  };

  const transferTable = (fromId: number, toId: number) => {
    playFeedbackSound('success');
    const sourceTable = tables.find(t => t.id === fromId);
    if (!sourceTable) return;

    setTables(prev => prev.map(t => {
      if (t.id === toId) {
        return {
          ...t,
          status: 'ocupada',
          items: [...t.items, ...sourceTable.items],
          waiter: sourceTable.waiter || t.waiter,
          customersCount: sourceTable.customersCount || t.customersCount,
          openedAt: sourceTable.openedAt || t.openedAt
        };
      }
      if (t.id === fromId) {
        return {
          ...t,
          status: 'livre',
          items: [],
          waiter: undefined,
          customersCount: undefined,
          openedAt: undefined
        };
      }
      return t;
    }));

    setSelectedTableId(toId);
    addToast('success', 'Mesa Transferida', `Itens da Mesa ${fromId} transferidos para Mesa ${toId}`);
    syncAction('transferTable', { fromId, toId });
  };

  const openNewComanda = (name: string, waiter: string) => {
    playFeedbackSound('success');
    const num = comandas.length + 101;
    const newCmd: Comanda = {
      id: `cmd-${Date.now()}`,
      number: `Comanda #${num}`,
      customerName: name,
      waiter: waiter || 'Carlos Silveira',
      status: 'aberta',
      openedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: [],
      discount: 0,
      hasServiceTax: true
    };
    setComandas(prev => [newCmd, ...prev]);
    setSelectedComandaId(newCmd.id);
    addToast('success', 'Comanda Aberta', `${newCmd.number} para ${name}`);
    syncAction('openComanda', { name, waiter });
  };

  // Payment confirmation & freeing up table
  const processPayment = (params: {
    source: string;
    subtotal: number;
    discount: number;
    serviceTax: number;
    total: number;
    paymentMethod: PaymentMethod;
    installments?: number;
    splitPersons?: number;
    cashReceived?: number;
    change?: number;
  }): Transaction => {
    playFeedbackSound('success');
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let itemsStr = 'Consumo variado';
    if (params.source.startsWith('Mesa')) {
      const match = tables.find(t => t.number === params.source);
      if (match && match.items.length > 0) {
        itemsStr = match.items.map(i => `${i.qty}x ${i.name}`).slice(0, 3).join(', ');
      }
    }

    const newTx: Transaction = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      timestamp: timeStr,
      source: params.source,
      waiter: activeTable.waiter || 'Marcos Vinicius',
      operator: 'Caixa 01 - Ana Paula',
      subtotal: params.subtotal,
      discount: params.discount,
      serviceTax: params.serviceTax,
      total: params.total,
      paymentMethod: params.paymentMethod,
      installments: params.installments,
      splitPersons: params.splitPersons,
      cashReceived: params.cashReceived,
      change: params.change,
      status: 'aprovado',
      itemsSummary: itemsStr
    };

    setTransactions(prev => [newTx, ...prev]);

    // Free the table or close comanda
    if (params.source.startsWith('Mesa')) {
      const tblNum = params.source;
      setTables(prev => prev.map(t => {
        if (t.number === tblNum) {
          return {
            ...t,
            status: 'livre',
            items: [],
            waiter: undefined,
            customersCount: undefined,
            openedAt: undefined,
            discount: 0
          };
        }
        return t;
      }));
    } else {
      setComandas(prev => prev.map(c => {
        if (c.number === params.source) {
          return { ...c, status: 'fechada', items: [] };
        }
        return c;
      }));
    }

    addToast('success', 'Pagamento Concluído!', `Valor: R$ ${params.total.toFixed(2)} registrado com sucesso.`);
    triggerWifiFlyAnimation(`Pagamento de R$ ${params.total.toFixed(2)} liquidado via Wi-Fi local para o Caixa!`, params.source, 'Caixa Central');

    if (internetStatus === 'offline') {
      const queueTx: SyncQueueItem = {
        id: `sq-${Date.now()}`,
        type: 'pagamento',
        description: `Pagamento ${params.source} (${params.paymentMethod.toUpperCase()})`,
        origin: params.source,
        timestamp: timeStr,
        status: 'pendente',
        amount: params.total,
        payloadSummary: 'Liquidado via Wi-Fi local; aguardando upload nuvem'
      };
      setSyncQueue(prev => [queueTx, ...prev]);
    }

    // O servidor recalcula subtotal, taxa e total a partir dos itens persistidos.
    syncAction('processPayment', {
      source: params.source,
      paymentMethod: params.paymentMethod,
      installments: params.installments,
      splitPersons: params.splitPersons,
      cashReceived: params.cashReceived,
      operator: newTx.operator,
      actor: newTx.waiter
    });

    return newTx;
  };

  // Stock operations
  const addStock = (productId: string, qty: number, reason: string) => {
    playFeedbackSound('success');
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setProducts(prev => prev.map(p => p.id === productId ? { ...p, currentStock: p.currentStock + qty } : p));
    
    const mov: StockMovement = {
      id: `mov-${Date.now()}`,
      productId,
      productName: prod.name,
      type: 'entrada',
      qty,
      reason,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      operator: 'Estoquista Rafael'
    };
    setStockMovements(prev => [mov, ...prev]);
    addToast('success', 'Entrada Registrada', `+${qty} ${prod.unit} em ${prod.name}`);
    syncAction('addStock', { productId, qty, reason });
  };

  const removeStock = (productId: string, qty: number, reason: string) => {
    playFeedbackSound('alert');
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setProducts(prev => prev.map(p => p.id === productId ? { ...p, currentStock: Math.max(0, p.currentStock - qty) } : p));

    const mov: StockMovement = {
      id: `mov-${Date.now()}`,
      productId,
      productName: prod.name,
      type: 'baixa',
      qty,
      reason,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      operator: 'Estoquista Rafael'
    };
    setStockMovements(prev => [mov, ...prev]);
    addToast('warning', 'Baixa de Estoque', `-${qty} ${prod.unit} em ${prod.name}`);
    syncAction('removeStock', { productId, qty, reason });
  };

  const addNewProduct = (productData: Omit<Product, 'id'>) => {
    playFeedbackSound('success');
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => [newProd, ...prev]);
    addToast('success', 'Novo Produto Criado', `${newProd.name} disponível no cardápio!`);
    syncAction('addProduct', { product: productData });
  };

  const updateProductPrice = (productId: string, price: number) => {
    if (!Number.isFinite(price) || price < 0) {
      addToast('warning', 'Preço inválido', 'Informe um preço maior ou igual a zero.');
      return;
    }
    const safePrice = Number(price.toFixed(2));
    setProducts(prev => prev.map(product => product.id === productId
      ? { ...product, price: safePrice }
      : product
    ));
    addToast('success', 'Preço Atualizado', `Novo preço: R$ ${safePrice.toFixed(2)}.`);
    syncAction('updateProductPrice', { productId, price: safePrice });
  };

  const openReceiptModal = (transaction?: Transaction, tableSummary?: any) => {
    playFeedbackSound('click');
    setReceiptModalData({
      isOpen: true,
      transaction,
      tableSummary
    });
  };

  const closeReceiptModal = () => {
    setReceiptModalData({ isOpen: false });
  };

  // Network & Infrastructure Methods
  const toggleLocalServerStatus = () => {
    const next = localServerStatus === 'online' ? 'offline' : 'online';
    setLocalServerStatus(next);
    playFeedbackSound('click');
    if (next === 'offline') {
      addToast('warning', 'Servidor Local Desconectado', 'O servidor local está inativo. Operação pausada até reconexão.');
    } else {
      addToast('success', 'Servidor Local Ativo', `Food Node Server ativo em ${localServerIP} na rede ${wifiSSID}.`);
    }
  };

  const toggleInternetStatus = () => {
    const next = internetStatus === 'online' ? 'offline' : 'online';
    setInternetStatus(next);
    playFeedbackSound('click');
    if (next === 'offline') {
      addToast('warning', 'Modo Offline Ativado', 'Sem internet! O sistema continua funcionando localmente via Wi-Fi. Dados serão salvos na fila.');
    } else {
      addToast('success', 'Internet Reconectada', 'Conexão com a nuvem restabelecida! Pronto para sincronização.');
    }
  };

  const restartLocalServer = () => {
    setIsRestartingServer(true);
    addToast('info', 'Reiniciando Servidor Local...', `Reinicializando serviços na rede ${wifiSSID}...`);
    playFeedbackSound('click');
    setTimeout(() => {
      setIsRestartingServer(false);
      setLocalServerStatus('online');
      playFeedbackSound('success');
      addToast('success', 'Servidor Reiniciado!', 'Servidor local operacional. Todos os 8 terminais sincronizados.');
    }, 2000);
  };

  const triggerSyncNow = () => {
    if (internetStatus === 'offline') {
      addToast('error', 'Sem Conexão com a Nuvem', 'Não é possível sincronizar enquanto a internet estiver offline.');
      playFeedbackSound('alert');
      return;
    }
    setIsSyncing(true);
    playFeedbackSound('click');
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      setSyncQueue(prev => prev.map(item => ({ ...item, status: 'sincronizado' })));
      playFeedbackSound('success');
      addToast('success', 'Sincronização Concluída!', 'Todos os dados locais foram transmitidos para a Nuvem com sucesso.');
    }, 1500);
  };

  const retrySyncQueue = () => {
    if (internetStatus === 'offline') {
      addToast('warning', 'Internet Desconectada', 'Conecte a internet para descarregar a fila de sincronização.');
      playFeedbackSound('alert');
      return;
    }
    setIsSyncing(true);
    playFeedbackSound('click');
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      setSyncQueue(prev => prev.map(i => ({ ...i, status: 'sincronizado' })));
      playFeedbackSound('success');
      addToast('success', 'Fila Descarregada!', 'Todos os pedidos e pagamentos pendentes foram enviados para a nuvem.');
    }, 1500);
  };

  const cloudLogin = async (email: string, pass: string) => {
    playFeedbackSound('click');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        addToast('error', 'Não foi possível entrar', payload?.error || 'Verifique suas credenciais.');
        return false;
      }

      // Em hospedagem estática o servidor pode devolver o index.html com status 200.
      if (!payload?.user?.email) {
        addToast('error', 'API indisponível', 'Esta hospedagem não executa o servidor de autenticação do Sistema Food.');
        return false;
      }

      setCloudUser(payload.user);
      setInterfaceMode('cloud_remote');
      addToast('success', 'Acesso remoto concedido', 'Sessão autenticada pelo servidor.');
      return true;
    } catch {
      addToast('error', 'Servidor indisponível', 'Não foi possível conectar à API de autenticação.');
      return false;
    }
  };

  const cloudLogout = async () => {
    playFeedbackSound('click');
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } finally {
      setCloudUser(null);
      setInterfaceMode('tablet');
      addToast('info', 'Sessão encerrada', 'Retornando ao terminal local do restaurante.');
    }
  };

  const triggerWifiFlyAnimation = (message: string, from: string, to: string) => {
    setWifiTransmissionFeedback({ active: true, message, from, to });
    setTimeout(() => {
      setWifiTransmissionFeedback(null);
    }, 2800);
  };

  return (
    <FoodSystemContext.Provider
      value={{
        activeScreen,
        setActiveScreen,
        userRole,
        setUserRole,
        userRoleConfig,
        tabletFrameMode,
        setTabletFrameMode,
        toggleTabletFrameMode,
        interfaceMode,
        setInterfaceMode,
        activeMode,
        setActiveMode,
        selectedTableId,
        setSelectedTableId,
        selectedComandaId,
        setSelectedComandaId,
        activeTable,
        activeComanda,
        tables,
        comandas,
        products,
        transactions,
        stockMovements,
        addItemToActiveOrder,
        removeItemFromActiveOrder,
        updateItemQty,
        setItemObservation,
        clearActiveOrder,
        toggleActiveServiceTax,
        setActiveDiscount,
        sendOrderToKitchen,
        updateTableStatus,
        transferTable,
        openNewComanda,
        processPayment,
        addStock,
        removeStock,
        addNewProduct,
        updateProductPrice,
        customerScreenStep,
        setCustomerScreenStep,
        customerSelectedTable,
        setCustomerSelectedTable,
        customerName,
        setCustomerName,
        customerObservation,
        setCustomerObservation,
        customerCart,
        addToCustomerCart,
        removeFromCustomerCart,
        updateCustomerCartQty,
        clearCustomerCart,
        submitCustomerOrder,
        lastCustomerOrderId,
        digitalOrders,
        pendingDigitalOrderToReview,
        setPendingDigitalOrderToReview,
        acceptDigitalOrder,
        rejectDigitalOrder,
        updateDigitalOrderStatus,
        qrCodeModalOpen,
        qrCodeModalTable,
        openQRCodeModal,
        closeQRCodeModal,
        receiptModalData,
        openReceiptModal,
        closeReceiptModal,
        toasts,
        addToast,
        removeToast,
        playFeedbackSound,
        localServerStatus,
        internetStatus,
        wifiSSID,
        localServerIP,
        syncMode,
        setSyncMode,
        lastSyncTime,
        connectedDevices,
        syncQueue,
        isSyncing,
        isRestartingServer,
        wifiTransmissionFeedback,
        cloudUser,
        serverRevision,
        toggleLocalServerStatus,
        toggleInternetStatus,
        restartLocalServer,
        triggerSyncNow,
        retrySyncQueue,
        cloudLogin,
        cloudLogout,
        triggerWifiFlyAnimation
      }}
    >
      {children}
    </FoodSystemContext.Provider>
  );
};

export const useFoodSystem = () => {
  const context = useContext(FoodSystemContext);
  if (!context) {
    throw new Error('useFoodSystem must be used within FoodSystemProvider');
  }
  return context;
};
