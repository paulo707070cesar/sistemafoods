import React, { createContext, useContext, useState, useEffect } from 'react';
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
  SyncQueueItem,
  PaymentSettings, Restaurant
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
import { syncWithHostinger, fetchFromHostinger } from '../services/apiSync';


export const USER_ROLES_CONFIG: Record<UserRole, UserRoleConfig> = {
  gerente: {
    id: 'gerente',
    label: 'Gerente / Admin',
    shortLabel: 'Gerente',
    description: 'Acesso completo a todas as rotas, relatórios e configurações',
    allowedScreens: ['pdv', 'mesas', 'caixa', 'estoque', 'kds', 'fichas', 'dashboard', 'rede', 'sync_queue', 'config_pagamentos', 'instrucoes'],
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

  restaurants: Restaurant[];
  activeRestaurant: Restaurant;
  createRestaurant: (name: string, city?: string) => void;
  selectRestaurant: (restaurantId: string) => void;

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

  // Configuração de recebimento (PIX e Mercado Pago)
  paymentSettings: PaymentSettings;
  updatePaymentSettings: (partial: Partial<PaymentSettings>) => void;

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
  toggleLocalServerStatus: () => void;
  toggleInternetStatus: () => void;
  restartLocalServer: () => void;
  triggerSyncNow: () => void;
  retrySyncQueue: () => void;
  cloudLogin: (email: string, pass: string) => boolean;
  cloudLogout: () => void;
  triggerWifiFlyAnimation: (message: string, from: string, to: string) => void;
}

const FoodSystemContext = createContext<FoodSystemContextType | undefined>(undefined);

/** Lê do armazenamento local sem derrubar a aplicação quando o conteúdo está corrompido. */
const readStored = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
};

/** Configuração de pagamento padrão, usada antes de o restaurante configurar. */
export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  pix: {
    enabled: false,
    keyType: 'aleatoria',
    key: '',
    merchantName: 'SISTEMA FOOD',
    merchantCity: 'SAO PAULO',
    surchargePercent: 0
  },
  mercadoPago: {
    enabled: false,
    environment: 'sandbox',
    publicKey: '',
    accessToken: '',
    maxInstallments: 12,
    surchargePercent: 0
  }
};

/** Completa configurações antigas com os campos novos, evitando campos indefinidos. */
function normalizePaymentSettings(raw: unknown): PaymentSettings {
  const stored = (raw && typeof raw === 'object' ? raw : {}) as Partial<PaymentSettings>;
  const pix = { ...DEFAULT_PAYMENT_SETTINGS.pix, ...(stored.pix ?? {}) };
  const mercadoPago = { ...DEFAULT_PAYMENT_SETTINGS.mercadoPago, ...(stored.mercadoPago ?? {}) };

  const limite = (valor: unknown, minimo: number, maximo: number, padrao: number) => {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return padrao;
    return Math.min(Math.max(numero, minimo), maximo);
  };

  return {
    pix: { ...pix, surchargePercent: limite(pix.surchargePercent, 0, 100, 0) },
    mercadoPago: {
      ...mercadoPago,
      maxInstallments: limite(mercadoPago.maxInstallments, 1, 24, 12),
      surchargePercent: limite(mercadoPago.surchargePercent, 0, 100, 0)
    },
    updatedAt: stored.updatedAt
  };
}

const DEFAULT_RESTAURANTS: Restaurant[] = [{ id: 'rest-demo', name: 'Sistema Food - Matriz', city: 'São Paulo', createdAt: new Date().toISOString(), active: true }];

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

  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => readStored('sistema_food_restaurants', DEFAULT_RESTAURANTS));
  const [activeRestaurantId, setActiveRestaurantId] = useState<string>(() => localStorage.getItem('sistema_food_active_restaurant') || 'rest-demo');
  const activeRestaurant = restaurants.find(item => item.id === activeRestaurantId) || restaurants[0];

  useEffect(() => { localStorage.setItem('sistema_food_restaurants', JSON.stringify(restaurants)); }, [restaurants]);
  useEffect(() => { localStorage.setItem('sistema_food_active_restaurant', activeRestaurant.id); }, [activeRestaurant.id]);

  const selectRestaurant = (restaurantId: string) => {
    if (!restaurants.some(item => item.id === restaurantId)) return;
    setActiveRestaurantId(restaurantId);
    setRestaurants(prev => prev.map(item => ({ ...item, active: item.id === restaurantId })));
    addToast('success', 'Restaurante selecionado', restaurants.find(item => item.id === restaurantId)?.name || 'Conta alterada');
  };

  const createRestaurant = (name: string, city = '') => {
    const trimmedName = name.trim();
    if (!trimmedName) { addToast('warning', 'Nome obrigatório', 'Informe o nome do restaurante.'); return; }
    const restaurant: Restaurant = { id: `rest-${Date.now()}`, name: trimmedName, city: city.trim(), createdAt: new Date().toISOString(), active: true };
    setRestaurants(prev => [...prev.map(item => ({ ...item, active: false })), restaurant]);
    addToast('success', 'Restaurante criado', `${trimmedName} está ativo.`);
  };

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
  const [cloudUser, setCloudUser] = useState<{ email: string; name: string } | null>({
    email: 'dono@sistemafood.com.br',
    name: 'Roberto Alencar (Dono / Administrador)'
  });
  
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

  // Configuração de recebimento (PIX e Mercado Pago)
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() =>
    normalizePaymentSettings(readStored('sistema_food_payment_settings', DEFAULT_PAYMENT_SETTINGS))
  );

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

  useEffect(() => {
    localStorage.setItem('sistema_food_payment_settings', JSON.stringify(paymentSettings));
  }, [paymentSettings]);

  // Carrega estado da nuvem Hostinger (MySQL) ao inicializar ou trocar de restaurante
  useEffect(() => {
    let isMounted = true;
    const loadCloudData = async () => {
      if (internetStatus === 'offline') return;
      const cloudData = await fetchFromHostinger(activeRestaurant.id);
      if (!isMounted || !cloudData) return;

      if (cloudData.tables && Array.isArray(cloudData.tables) && cloudData.tables.length > 0) setTables(cloudData.tables);
      if (cloudData.comandas && Array.isArray(cloudData.comandas) && cloudData.comandas.length > 0) setComandas(cloudData.comandas);
      if (cloudData.products && Array.isArray(cloudData.products) && cloudData.products.length > 0) setProducts(cloudData.products);
      if (cloudData.transactions && Array.isArray(cloudData.transactions)) setTransactions(cloudData.transactions);
      if (cloudData.digitalOrders && Array.isArray(cloudData.digitalOrders)) setDigitalOrders(cloudData.digitalOrders);
      if (cloudData.paymentSettings) setPaymentSettings(normalizePaymentSettings(cloudData.paymentSettings));
    };
    loadCloudData();
    return () => { isMounted = false; };
  }, [activeRestaurant.id, internetStatus]);

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

    return newDigitalOrder;
  };


  // Restaurant Tablet Reviews & Accepts Digital Order
  const acceptDigitalOrder = (orderId: string) => {
    playFeedbackSound('success');
    const order = digitalOrders.find(o => o.id === orderId);
    if (!order) return;

    // Confere o estoque antes de aceitar: sem isso o pedido entraria sem baixa de insumos.
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
  };

  const rejectDigitalOrder = (orderId: string, reason: string = 'Item indisponível no momento') => {
    playFeedbackSound('alert');
    setDigitalOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'recusado', rejectionReason: reason } : o));
    if (pendingDigitalOrderToReview?.id === orderId) {
      setPendingDigitalOrderToReview(null);
    }
    addToast('warning', 'Pedido Recusado', `Pedido marcado como recusado (${reason}).`);
  };

  const updateDigitalOrderStatus = (orderId: string, newStatus: DigitalOrderStatus) => {
    playFeedbackSound('click');
    setDigitalOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    addToast('info', 'Status Atualizado', `Pedido alterado para ${newStatus.toUpperCase()}`);
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

      // Update local product stock
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

    // A baixa de estoque fica fora do atualizador de estado para não ser executada duas vezes.
    setProducts(prev => prev.map(p => p.id === product.id
      ? { ...p, currentStock: Math.max(0, p.currentStock - qty) }
      : p
    ));
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
  };

  const toggleActiveServiceTax = () => {
    playFeedbackSound('click');
    if (activeMode === 'mesas') {
      setTables(prev => prev.map(t => t.id === selectedTableId ? { ...t, hasServiceTax: !t.hasServiceTax } : t));
    } else {
      setComandas(prev => prev.map(c => c.id === selectedComandaId ? { ...c, hasServiceTax: !c.hasServiceTax } : c));
    }
  };

  const setActiveDiscount = (discount: number) => {
    // O desconto nunca pode ultrapassar o subtotal do pedido.
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
  };

  const addNewProduct = (productData: Omit<Product, 'id'>) => {
    playFeedbackSound('success');
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => [newProd, ...prev]);
    addToast('success', 'Novo Produto Criado', `${newProd.name} disponível no cardápio!`);
  };

  const updateProductPrice = (productId: string, price: number) => {
    if (!Number.isFinite(price) || price < 0) {
      addToast('warning', 'Preço inválido', 'Informe um preço maior ou igual a zero.');
      return;
    }
    // Atualiza o estado global: alterar o objeto do produto direto não refletiria na tela.
    const safePrice = Number(price.toFixed(2));
    setProducts(prev => prev.map(product => product.id === productId
      ? { ...product, price: safePrice }
      : product
    ));
    addToast('success', 'Preço Atualizado', `Novo preço: R$ ${safePrice.toFixed(2)}.`);
  };

  /**
   * Salva a configuração de recebimento.
   * Aceita atualização parcial para o PIX e para o Mercado Pago separadamente.
   */
  const updatePaymentSettings = (partial: Partial<PaymentSettings>) => {
    playFeedbackSound('success');
    setPaymentSettings(prev => normalizePaymentSettings({
      ...prev,
      ...partial,
      pix: { ...prev.pix, ...(partial.pix ?? {}) },
      mercadoPago: { ...prev.mercadoPago, ...(partial.mercadoPago ?? {}) },
      updatedAt: new Date().toISOString()
    }));
    addToast('success', 'Configuração Salva', 'Os dados de recebimento foram atualizados.');
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

  const triggerSyncNow = async () => {
    if (internetStatus === 'offline') {
      addToast('error', 'Sem Conexão com a Nuvem', 'Não é possível sincronizar enquanto a internet estiver offline.');
      playFeedbackSound('alert');
      return;
    }
    setIsSyncing(true);
    playFeedbackSound('click');

    const result = await syncWithHostinger({
      restaurant_id: activeRestaurant.id,
      restaurant_name: activeRestaurant.name,
      restaurant_city: activeRestaurant.city,
      items: {
        tables,
        comandas,
        products,
        transactions,
        digitalOrders,
        paymentSettings,
        restaurants
      }
    });

    setIsSyncing(false);
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setLastSyncTime(nowTime);
    setSyncQueue(prev => prev.map(item => ({ ...item, status: 'sincronizado' })));

    if (result.success) {
      playFeedbackSound('success');
      addToast('success', 'Nuvem Hostinger Atualizada!', 'Dados sincronizados com o banco MySQL na Hostinger com sucesso.');
    } else {
      playFeedbackSound('alert');
      addToast('warning', 'Sincronizado Localmente', 'Dados mantidos localmente no navegador (modo offline-first).');
    }
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

  const cloudLogin = (email: string, pass: string) => {
    playFeedbackSound('click');
    if (email && pass) {
      setCloudUser({ email, name: 'Roberto Alencar (Dono / Administrador)' });
      setInterfaceMode('cloud_remote');
      addToast('success', 'Acesso Remoto Concedido', 'Conectado à nuvem do Sistema Food.');
      return true;
    }
    addToast('error', 'Credenciais Inválidas', 'Preencha e-mail e senha.');
    return false;
  };

  const cloudLogout = () => {
    playFeedbackSound('click');
    setInterfaceMode('tablet');
    addToast('info', 'Sessão Encerrada', 'Retornando ao terminal local do restaurante.');
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
        restaurants,
        activeRestaurant,
        createRestaurant,
        selectRestaurant,
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
        paymentSettings,
        updatePaymentSettings,
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
