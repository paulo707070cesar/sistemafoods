import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  Table, 
  Comanda, 
  Transaction, 
  OrderItem, 
  ActiveScreen, 
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

export const FoodSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('pdv');
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
  const [digitalOrders, setDigitalOrders] = useState<DigitalOrder[]>(() => {
    const saved = localStorage.getItem('sistema_food_digital_orders');
    return saved ? JSON.parse(saved) : INITIAL_DIGITAL_ORDERS;
  });

  const [pendingDigitalOrderToReview, setPendingDigitalOrderToReview] = useState<DigitalOrder | null>(null);

  // QR Code generator modal
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState<boolean>(false);
  const [qrCodeModalTable, setQrCodeModalTable] = useState<string>('Mesa 05');

  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem('sistema_food_tables');
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [comandas, setComandas] = useState<Comanda[]>(() => {
    const saved = localStorage.getItem('sistema_food_comandas');
    return saved ? JSON.parse(saved) : INITIAL_COMANDAS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('sistema_food_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('sistema_food_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

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
      setProducts(prev => prev.map(p => {
        if (p.id === product.id) {
          return { ...p, currentStock: Math.max(0, p.currentStock - qty) };
        }
        return p;
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
  };

  const removeItemFromActiveOrder = (itemId: string) => {
    playFeedbackSound('alert');
    if (activeMode === 'mesas') {
      setTables(prev => prev.map(t => {
        if (t.id !== selectedTableId) return t;
        const itemToRemove = t.items.find(i => i.id === itemId);
        if (itemToRemove) {
          setProducts(prods => prods.map(p => p.id === itemToRemove.productId ? { ...p, currentStock: p.currentStock + itemToRemove.qty } : p));
        }
        return {
          ...t,
          items: t.items.filter(i => i.id !== itemId)
        };
      }));
      addToast('info', 'Item Cancelado', 'Item removido da comanda atual.');
    } else {
      setComandas(prev => prev.map(c => {
        if (c.id !== selectedComandaId) return c;
        return { ...c, items: c.items.filter(i => i.id !== itemId) };
      }));
    }
  };

  const updateItemQty = (itemId: string, delta: number) => {
    playFeedbackSound('click');
    if (activeMode === 'mesas') {
      setTables(prev => prev.map(t => {
        if (t.id !== selectedTableId) return t;
        const target = t.items.find(i => i.id === itemId);
        if (!target) return t;

        const nextQty = target.qty + delta;
        if (nextQty <= 0) {
          return {
            ...t,
            items: t.items.filter(i => i.id !== itemId)
          };
        }

        return {
          ...t,
          items: t.items.map(item => {
            if (item.id === itemId) {
              return {
                ...item,
                qty: nextQty,
                total: Number((nextQty * item.price).toFixed(2))
              };
            }
            return item;
          })
        };
      }));
    } else {
      setComandas(prev => prev.map(c => {
        if (c.id !== selectedComandaId) return c;
        return {
          ...c,
          items: c.items.map(i => {
            if (i.id === itemId) {
              const nq = Math.max(1, i.qty + delta);
              return { ...i, qty: nq, total: Number((nq * i.price).toFixed(2)) };
            }
            return i;
          })
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
    if (activeMode === 'mesas') {
      setTables(prev => prev.map(t => t.id === selectedTableId ? { ...t, discount } : t));
    } else {
      setComandas(prev => prev.map(c => c.id === selectedComandaId ? { ...c, discount } : c));
    }
  };

  const sendOrderToKitchen = () => {
    playFeedbackSound('success');
    const sourceLabel = activeMode === 'mesas' ? activeTable.number : (activeComanda?.number || 'Comanda');
    const itemCount = activeMode === 'mesas' ? activeTable.items.length : (activeComanda?.items.length || 0);

    triggerWifiFlyAnimation(`Pedido ${sourceLabel} transmitido via Wi-Fi Local para o KDS da Cozinha (2ms)! 🍳`, 'Tablet Garçom', 'KDS Cozinha');

    if (activeMode === 'mesas') {
      setTables(prev => prev.map(t => {
        if (t.id !== selectedTableId) return t;
        return {
          ...t,
          items: t.items.map(i => ({ ...i, status: 'enviado' }))
        };
      }));
      addToast('success', 'Pedido Enviado via Wi-Fi', `Itens da ${activeTable.number} transmitidos à Cozinha e Bar via rede local!`);
    } else {
      addToast('success', 'Pedido Enviado via Wi-Fi', `Itens da ${activeComanda?.number} transmitidos à Cozinha via rede local!`);
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
