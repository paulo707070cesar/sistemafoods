export type ProductCategory = 
  | 'Todos'
  | 'Petiscos'
  | 'Pratos Principais'
  | 'Bebidas'
  | 'Drinks'
  | 'Pizzas'
  | 'Sobremesas';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  costPrice: number;
  currentStock: number;
  minStock: number;
  unit: string; // 'un', 'lata', 'garrafa', 'kg', 'porção'
  popularShortcut?: boolean;
  description?: string;
  expiryDate?: string; // YYYY-MM-DD para controle de validade
  ingredients?: { name: string; quantity: string; unitCost: number }[]; // Ficha técnica
  suggestedUpsellIds?: string[]; // IDs de produtos recomendados para upsell
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  qty: number;
  price: number;
  total: number;
  observation?: string;
  timestamp: string;
  status: 'enviado' | 'pendente' | 'pronto';
}

export type TableStatus = 'livre' | 'ocupada' | 'reservada';

export interface Table {
  id: number;
  number: string; // 'Mesa 01'
  seats: number;
  zone: 'Salão Principal' | 'Varanda' | 'Deck Superior' | 'Bar';
  status: TableStatus;
  waiter?: string;
  customersCount?: number;
  openedAt?: string;
  minutesActive?: number;
  items: OrderItem[];
  discount: number;
  hasServiceTax: boolean;
  notes?: string;
}

export interface Comanda {
  id: string;
  number: string; // 'Comanda #101'
  customerName: string;
  waiter: string;
  status: 'aberta' | 'fechada';
  openedAt: string;
  items: OrderItem[];
  discount: number;
  hasServiceTax: boolean;
}

export type PaymentMethod = 
  | 'dinheiro'
  | 'credito'
  | 'debito'
  | 'pix'
  | 'vale_refeicao';

export interface Transaction {
  id: string;
  timestamp: string;
  source: string; // 'Mesa 05' ou 'Comanda #104'
  waiter: string;
  operator: string;
  subtotal: number;
  discount: number;
  serviceTax: number;
  total: number;
  paymentMethod: PaymentMethod;
  installments?: number;
  splitPersons?: number;
  cashReceived?: number;
  change?: number;
  status: 'aprovado' | 'estornado';
  itemsSummary: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'entrada' | 'baixa';
  qty: number;
  reason: string;
  timestamp: string;
  operator: string;
}

export type ActiveScreen = 'pdv' | 'mesas' | 'caixa' | 'estoque' | 'kds' | 'fichas' | 'dashboard' | 'rede' | 'sync_queue' | 'instrucoes';

export type UserRole = 'gerente' | 'garcom' | 'cozinha' | 'caixa';

export interface UserRoleConfig {
  id: UserRole;
  label: string;
  shortLabel: string;
  description: string;
  allowedScreens: ActiveScreen[];
  color: string;
}

export type AppInterfaceMode = 'tablet' | 'mobile_customer' | 'cloud_login' | 'cloud_remote';

export type LocalServerStatus = 'online' | 'offline';
export type InternetStatus = 'online' | 'offline';
export type SyncMode = 'auto' | 'manual';

export interface DeviceConnected {
  id: string;
  name: string;
  type: 'tablet_garcom' | 'mobile_cliente' | 'kds_cozinha' | 'terminal_caixa' | 'servidor_local';
  ip: string;
  pingMs: number;
  lastSeen: string;
  status: 'conectado' | 'inativo';
}

export interface SyncQueueItem {
  id: string;
  type: 'pedido' | 'pagamento' | 'estoque';
  description: string;
  origin: string; // e.g. 'Mesa 05', 'Caixa 01'
  timestamp: string;
  status: 'pendente' | 'enviando' | 'sincronizado' | 'falha';
  amount?: number;
  payloadSummary: string;
}

export type DigitalOrderStatus = 'aguardando' | 'preparo' | 'pronto' | 'servido' | 'recusado';

export interface DigitalOrder {
  id: string;
  orderNumber: string; // e.g. '#DIG-204'
  tableNumber: string; // e.g. 'Mesa 05'
  customerName: string;
  items: OrderItem[];
  observation?: string;
  status: DigitalOrderStatus;
  createdAt: string;
  createdAtTimestamp: number; // Date.now() timestamp para cronômetro preciso
  maxPreparationMinutes: number; // default 15 min
  total: number;
  rejectionReason?: string;
  isPaidOnline?: boolean;
}

export type CustomerScreenStep = 'welcome' | 'menu' | 'status' | 'pagamento';

