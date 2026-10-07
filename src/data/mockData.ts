import { Product, Table, Comanda, Transaction } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  // Pratos Principais
  {
    id: 'prod-1',
    name: 'Picanha na Chapa c/ Mandioca',
    category: 'Pratos Principais',
    price: 89.90,
    costPrice: 42.00,
    currentStock: 24,
    minStock: 10,
    unit: 'porção',
    popularShortcut: true,
    description: 'Picanha fatiada grelhada na chapa com mandioca na manteiga de garrafa e farofa.',
    expiryDate: '2026-10-18',
    suggestedUpsellIds: ['prod-9', 'prod-5', 'prod-11'],
    ingredients: [
      { name: 'Picanha Bovina Angus', quantity: '450g', unitCost: 33.75 },
      { name: 'Mandioca Cozida na Manteiga', quantity: '300g', unitCost: 4.50 },
      { name: 'Farofa da Casa & Especiarias', quantity: '100g', unitCost: 2.25 },
      { name: 'Alho e Manteiga de Garrafa', quantity: '50ml', unitCost: 1.50 }
    ]
  },
  {
    id: 'prod-2',
    name: 'Frango Grelhado c/ Fritas',
    category: 'Pratos Principais',
    price: 38.00,
    costPrice: 16.50,
    currentStock: 18,
    minStock: 8,
    unit: 'porção',
    description: 'Filé de peito grelhado acompanhado de fritas crocantes e vinagrete.',
    expiryDate: '2026-10-14',
    suggestedUpsellIds: ['prod-13', 'prod-12', 'prod-22'],
    ingredients: [
      { name: 'Filé de Peito de Frango', quantity: '350g', unitCost: 8.50 },
      { name: 'Batata Palito Congelada', quantity: '250g', unitCost: 3.80 },
      { name: 'Vinagrete & Ervas Frescas', quantity: '100g', unitCost: 2.20 },
      { name: 'Óleo e Condimentos', quantity: '1 porção', unitCost: 2.00 }
    ]
  },
  {
    id: 'prod-3',
    name: 'Salmão ao Molho de Alcaparras',
    category: 'Pratos Principais',
    price: 79.00,
    costPrice: 38.00,
    currentStock: 12,
    minStock: 6,
    unit: 'porção',
    description: 'Filé de salmão grelhado com legumes salteados e purê de batatas.',
    expiryDate: '2026-10-08', // Próximo do vencimento!
    suggestedUpsellIds: ['prod-18', 'prod-14', 'prod-23'],
    ingredients: [
      { name: 'Filé de Salmão Fresco', quantity: '280g', unitCost: 31.00 },
      { name: 'Alcaparras em Conserva', quantity: '40g', unitCost: 3.50 },
      { name: 'Legumes Salteados na Manteiga', quantity: '200g', unitCost: 3.50 }
    ]
  },
  {
    id: 'prod-4',
    name: 'Arroz Branco Especial',
    category: 'Pratos Principais',
    price: 14.00,
    costPrice: 3.50,
    currentStock: 40,
    minStock: 15,
    unit: 'porção',
    description: 'Arroz branco soltinho preparado na hora com alho crocante.',
    expiryDate: '2026-11-20',
    ingredients: [
      { name: 'Arroz Agulhinha Tipo 1', quantity: '200g', unitCost: 1.80 },
      { name: 'Alho, Cebola e Óleo', quantity: '1 porção', unitCost: 1.70 }
    ]
  },

  // Petiscos
  {
    id: 'prod-5',
    name: 'Batata Frita Especial Bacon & Cheddar',
    category: 'Petiscos',
    price: 34.90,
    costPrice: 12.00,
    currentStock: 35,
    minStock: 15,
    unit: 'porção',
    popularShortcut: true,
    description: 'Porção generosa de fritas sequinhas cobertas com molho cheddar e crispy de bacon.',
    expiryDate: '2026-10-25',
    suggestedUpsellIds: ['prod-9', 'prod-12', 'prod-10'],
    ingredients: [
      { name: 'Batata Palito Importada', quantity: '400g', unitCost: 4.80 },
      { name: 'Cheddar Cremoso Especial', quantity: '100g', unitCost: 4.20 },
      { name: 'Bacon Defumado em Cubos', quantity: '80g', unitCost: 3.00 }
    ]
  },
  {
    id: 'prod-6',
    name: 'Isca de Peixe Crocante',
    category: 'Petiscos',
    price: 52.00,
    costPrice: 22.00,
    currentStock: 14,
    minStock: 10,
    unit: 'porção',
    description: 'Iscas de tilápia empanadas com farinha panko, servidas com molho tártaro caseiro.',
    expiryDate: '2026-10-09', // Próximo do vencimento!
    suggestedUpsellIds: ['prod-10', 'prod-9', 'prod-14'],
    ingredients: [
      { name: 'Filé de Tilápia Fresca', quantity: '400g', unitCost: 16.00 },
      { name: 'Farinha Panko & Ovos', quantity: '100g', unitCost: 3.50 },
      { name: 'Molho Tártaro Artesanal', quantity: '80ml', unitCost: 2.50 }
    ]
  },
  {
    id: 'prod-7',
    name: 'Pastel Misto (6 unidades)',
    category: 'Petiscos',
    price: 29.90,
    costPrice: 9.00,
    currentStock: 28,
    minStock: 12,
    unit: 'porção',
    description: '3 pasteis de queijo coalho e 3 de carne moída bem temperada.',
    expiryDate: '2026-10-10', // Próximo do vencimento!
    suggestedUpsellIds: ['prod-9', 'prod-16', 'prod-12'],
    ingredients: [
      { name: 'Massa Artesanal de Pastel', quantity: '6 un', unitCost: 3.00 },
      { name: 'Carne Bovina Moída Temperada', quantity: '150g', unitCost: 3.50 },
      { name: 'Queijo Coalho Fresco', quantity: '120g', unitCost: 2.50 }
    ]
  },
  {
    id: 'prod-8',
    name: 'Dadinho de Tapioca c/ Geléia',
    category: 'Petiscos',
    price: 32.00,
    costPrice: 11.00,
    currentStock: 20,
    minStock: 8,
    unit: 'porção',
    description: 'Dadinhos crocantes com queijo coalho e geléia agridoce de pimenta.',
    expiryDate: '2026-10-12',
    suggestedUpsellIds: ['prod-16', 'prod-9'],
    ingredients: [
      { name: 'Farinha de Tapioca Granulada', quantity: '200g', unitCost: 3.00 },
      { name: 'Queijo Coalho Ralado', quantity: '200g', unitCost: 5.50 },
      { name: 'Geléia de Pimenta Defumada', quantity: '60g', unitCost: 2.50 }
    ]
  },

  // Bebidas & Cervejas
  {
    id: 'prod-9',
    name: 'Chopp Artesanal IPA 500ml',
    category: 'Bebidas',
    price: 14.00,
    costPrice: 5.50,
    currentStock: 85,
    minStock: 30,
    unit: 'caneco',
    popularShortcut: true,
    description: 'Chopp artesanal fresco servido em caneco ultracongelado.',
    expiryDate: '2026-10-11', // Próximo do vencimento no barril!
    ingredients: [
      { name: 'Chopp IPA em Barril Inox', quantity: '500ml', unitCost: 5.00 },
      { name: 'Gás CO2 & Espuma', quantity: '1 porção', unitCost: 0.50 }
    ]
  },
  {
    id: 'prod-10',
    name: 'Cerveja Heineken Long Neck',
    category: 'Bebidas',
    price: 14.00,
    costPrice: 6.80,
    currentStock: 92,
    minStock: 40,
    unit: 'garrafa',
    popularShortcut: true,
    description: 'Long neck 330ml bem gelada.',
    expiryDate: '2027-01-15'
  },
  {
    id: 'prod-11',
    name: 'Cerveja Original 600ml',
    category: 'Bebidas',
    price: 17.00,
    costPrice: 8.50,
    currentStock: 48,
    minStock: 24,
    unit: 'garrafa',
    description: 'Garrafa 600ml servida no balde com gelo.',
    expiryDate: '2027-02-10'
  },
  {
    id: 'prod-12',
    name: 'Refrigerante Lata 350ml',
    category: 'Bebidas',
    price: 7.00,
    costPrice: 2.80,
    currentStock: 110,
    minStock: 36,
    unit: 'lata',
    popularShortcut: true,
    description: 'Coca-Cola, Guaraná Antarctica ou Sprite.',
    expiryDate: '2027-06-30'
  },
  {
    id: 'prod-13',
    name: 'Suco Natural Laranja 400ml',
    category: 'Bebidas',
    price: 9.50,
    costPrice: 3.20,
    currentStock: 45,
    minStock: 15,
    unit: 'copo',
    description: 'Suco da fruta espremido na hora, com ou sem açúcar.',
    expiryDate: '2026-10-09'
  },
  {
    id: 'prod-14',
    name: 'Água Mineral com Gás 500ml',
    category: 'Bebidas',
    price: 5.00,
    costPrice: 1.40,
    currentStock: 64,
    minStock: 24,
    unit: 'garrafa',
    description: 'Servida com rodela de limão e gelo.',
    expiryDate: '2027-10-01'
  },
  {
    id: 'prod-15',
    name: 'Água Mineral sem Gás 500ml',
    category: 'Bebidas',
    price: 4.50,
    costPrice: 1.20,
    currentStock: 58,
    minStock: 20,
    unit: 'garrafa',
    description: 'Água mineral natural fresca.',
    expiryDate: '2027-10-01'
  },

  // Drinks
  {
    id: 'prod-16',
    name: 'Caipirinha Tradicional Limão',
    category: 'Drinks',
    price: 22.00,
    costPrice: 6.00,
    currentStock: 30,
    minStock: 10,
    unit: 'copo',
    popularShortcut: true,
    description: 'Cachaça artesanal envelhecida, limão taiti fresco e açúcar refinado.',
    expiryDate: '2026-10-13'
  },
  {
    id: 'prod-17',
    name: 'Gin Tônica com Especiarias',
    category: 'Drinks',
    price: 32.00,
    costPrice: 9.50,
    currentStock: 25,
    minStock: 10,
    unit: 'taça',
    description: 'Gin premium, água tônica botânica, zimbro e fatia de toranja desidratada.',
    expiryDate: '2026-12-15'
  },
  {
    id: 'prod-18',
    name: 'Taça de Vinho Tinto Malbec',
    category: 'Drinks',
    price: 28.00,
    costPrice: 10.00,
    currentStock: 18,
    minStock: 6,
    unit: 'taça',
    description: 'Vinho tinto argentino encorpado 150ml.',
    expiryDate: '2026-10-20'
  },

  // Lanches & Pizzas
  {
    id: 'prod-19',
    name: 'Burger Gourmet da Casa 200g',
    category: 'Petiscos',
    price: 36.90,
    costPrice: 14.00,
    currentStock: 26,
    minStock: 10,
    unit: 'un',
    popularShortcut: true,
    description: 'Blend de costela 200g, queijo estepe derretido, cebola caramelizada e maionese defumada.',
    expiryDate: '2026-10-15',
    suggestedUpsellIds: ['prod-5', 'prod-12', 'prod-9'],
    ingredients: [
      { name: 'Blend Costela Bovina 200g', quantity: '1 un', unitCost: 7.50 },
      { name: 'Pão de Brioche Selado na Manteiga', quantity: '1 un', unitCost: 2.50 },
      { name: 'Queijo Estepe Artesanal', quantity: '60g', unitCost: 2.20 },
      { name: 'Maionese Defumada da Casa & Cebola', quantity: '1 porção', unitCost: 1.80 }
    ]
  },
  {
    id: 'prod-20',
    name: 'Pizza Calabresa Artesanal',
    category: 'Pizzas',
    price: 49.00,
    costPrice: 18.00,
    currentStock: 16,
    minStock: 8,
    unit: 'un',
    popularShortcut: true,
    description: 'Massa de fermentação natural, calabresa defumada fatiada, cebola roxa e azeitonas pretas.',
    expiryDate: '2026-10-16',
    suggestedUpsellIds: ['prod-9', 'prod-12'],
    ingredients: [
      { name: 'Massa Fermentação Natural 48h', quantity: '1 un', unitCost: 4.50 },
      { name: 'Molho de Tomate Pelati Italiano', quantity: '120g', unitCost: 3.00 },
      { name: 'Calabresa Defumada Especial', quantity: '200g', unitCost: 6.50 },
      { name: 'Muçarela & Azeitonas Chilenas', quantity: '150g', unitCost: 4.00 }
    ]
  },
  {
    id: 'prod-21',
    name: 'Pizza Quatro Queijos Nobres',
    category: 'Pizzas',
    price: 56.00,
    costPrice: 21.00,
    currentStock: 14,
    minStock: 8,
    unit: 'un',
    description: 'Muçarela curada, gorgonzola importado, parmesão ralado e catupiry legítimo.',
    expiryDate: '2026-10-14',
    suggestedUpsellIds: ['prod-18', 'prod-9']
  },

  // Sobremesas
  {
    id: 'prod-22',
    name: 'Pudim de Leite Condensado',
    category: 'Sobremesas',
    price: 14.00,
    costPrice: 4.00,
    currentStock: 15,
    minStock: 6,
    unit: 'fatia',
    description: 'Clássico pudim sem furinhos com calda de caramelo dourado.',
    expiryDate: '2026-10-11' // Próximo do vencimento!
  },
  {
    id: 'prod-23',
    name: 'Petit Gâteau com Sorvete Creme',
    category: 'Sobremesas',
    price: 24.00,
    costPrice: 7.50,
    currentStock: 9,
    minStock: 6,
    unit: 'porção',
    description: 'Bolinho quente de chocolate belga recheado, servido com sorvete de baunilha.',
    expiryDate: '2026-10-22'
  }
];


export const INITIAL_TABLES: Table[] = [
  {
    id: 1,
    number: 'Mesa 01',
    seats: 4,
    zone: 'Salão Principal',
    status: 'livre',
    items: [],
    discount: 0,
    hasServiceTax: true,
  },
  {
    id: 2,
    number: 'Mesa 02',
    seats: 2,
    zone: 'Salão Principal',
    status: 'ocupada',
    waiter: 'Carlos Silveira',
    customersCount: 2,
    openedAt: '12:45',
    minutesActive: 32,
    hasServiceTax: true,
    discount: 0,
    items: [
      { id: 'item-2-1', productId: 'prod-9', name: 'Chopp Artesanal IPA 500ml', qty: 2, price: 14.00, total: 28.00, timestamp: '12:46', status: 'enviado' },
      { id: 'item-2-2', productId: 'prod-7', name: 'Pastel Misto (6 unidades)', qty: 1, price: 29.90, total: 29.90, observation: 'Bem frito', timestamp: '12:50', status: 'enviado' }
    ]
  },
  {
    id: 3,
    number: 'Mesa 03',
    seats: 6,
    zone: 'Salão Principal',
    status: 'reservada',
    items: [],
    discount: 0,
    hasServiceTax: true,
    notes: 'Reserva para Família Souza às 19:30 (Aniversário)'
  },
  {
    id: 4,
    number: 'Mesa 04',
    seats: 4,
    zone: 'Salão Principal',
    status: 'livre',
    items: [],
    discount: 0,
    hasServiceTax: true,
  },
  {
    id: 5,
    number: 'Mesa 05',
    seats: 4,
    zone: 'Salão Principal',
    status: 'ocupada',
    waiter: 'Marcos Vinicius',
    customersCount: 3,
    openedAt: '12:15',
    minutesActive: 54,
    hasServiceTax: true,
    discount: 0,
    items: [
      { id: 'item-5-1', productId: 'prod-1', name: 'Picanha na Chapa c/ Mandioca', qty: 1, price: 89.90, total: 89.90, observation: 'Ponto da carne: ao ponto p/ mal', timestamp: '12:18', status: 'enviado' },
      { id: 'item-5-2', productId: 'prod-4', name: 'Arroz Branco Especial', qty: 1, price: 14.00, total: 14.00, timestamp: '12:18', status: 'enviado' },
      { id: 'item-5-3', productId: 'prod-5', name: 'Batata Frita Bacon & Cheddar', qty: 1, price: 28.00, total: 28.00, observation: 'Bacon bem crocante', timestamp: '12:20', status: 'enviado' },
      { id: 'item-5-4', productId: 'prod-12', name: 'Refrigerante Lata 350ml', qty: 2, price: 7.00, total: 14.00, observation: '1 Coca Zero + 1 Guaraná', timestamp: '12:16', status: 'enviado' },
      { id: 'item-5-5', productId: 'prod-14', name: 'Água Mineral com Gás', qty: 1, price: 5.00, total: 5.00, observation: 'Gelo e limão', timestamp: '12:16', status: 'enviado' }
    ]
  },
  {
    id: 6,
    number: 'Mesa 06',
    seats: 2,
    zone: 'Varanda',
    status: 'ocupada',
    waiter: 'Camila Rocha',
    customersCount: 2,
    openedAt: '12:30',
    minutesActive: 46,
    hasServiceTax: true,
    discount: 5.00,
    items: [
      { id: 'item-6-1', productId: 'prod-19', name: 'Burger Gourmet da Casa 200g', qty: 2, price: 36.90, total: 73.80, timestamp: '12:32', status: 'enviado' },
      { id: 'item-6-2', productId: 'prod-10', name: 'Cerveja Heineken Long Neck', qty: 3, price: 14.00, total: 42.00, timestamp: '12:35', status: 'enviado' }
    ]
  },
  {
    id: 7,
    number: 'Mesa 07',
    seats: 8,
    zone: 'Varanda',
    status: 'ocupada',
    waiter: 'Carlos Silveira',
    customersCount: 6,
    openedAt: '11:50',
    minutesActive: 86,
    hasServiceTax: true,
    discount: 0,
    items: [
      { id: 'item-7-1', productId: 'prod-20', name: 'Pizza Calabresa Artesanal', qty: 2, price: 49.00, total: 98.00, timestamp: '12:00', status: 'enviado' },
      { id: 'item-7-2', productId: 'prod-11', name: 'Cerveja Original 600ml', qty: 4, price: 17.00, total: 68.00, timestamp: '12:02', status: 'enviado' },
      { id: 'item-7-3', productId: 'prod-6', name: 'Isca de Peixe Crocante', qty: 1, price: 52.00, total: 52.00, timestamp: '12:10', status: 'enviado' }
    ]
  },
  {
    id: 8,
    number: 'Mesa 08',
    seats: 4,
    zone: 'Varanda',
    status: 'livre',
    items: [],
    discount: 0,
    hasServiceTax: true,
  },
  {
    id: 9,
    number: 'Mesa 09',
    seats: 4,
    zone: 'Deck Superior',
    status: 'livre',
    items: [],
    discount: 0,
    hasServiceTax: true,
  },
  {
    id: 10,
    number: 'Mesa 10',
    seats: 6,
    zone: 'Deck Superior',
    status: 'ocupada',
    waiter: 'Marcos Vinicius',
    customersCount: 4,
    openedAt: '12:05',
    minutesActive: 71,
    hasServiceTax: true,
    discount: 0,
    items: [
      { id: 'item-10-1', productId: 'prod-3', name: 'Salmão ao Molho de Alcaparras', qty: 2, price: 79.00, total: 158.00, timestamp: '12:12', status: 'enviado' },
      { id: 'item-10-2', productId: 'prod-18', name: 'Taça de Vinho Tinto Malbec', qty: 3, price: 28.00, total: 84.00, timestamp: '12:14', status: 'enviado' },
      { id: 'item-10-3', productId: 'prod-15', name: 'Água Mineral sem Gás 500ml', qty: 2, price: 4.50, total: 9.00, timestamp: '12:14', status: 'enviado' }
    ]
  },
  {
    id: 11,
    number: 'Mesa 11',
    seats: 2,
    zone: 'Deck Superior',
    status: 'reservada',
    items: [],
    discount: 0,
    hasServiceTax: true,
    notes: 'Reserva Casal Romântico - Janela Deck'
  },
  {
    id: 12,
    number: 'Mesa 12',
    seats: 4,
    zone: 'Deck Superior',
    status: 'livre',
    items: [],
    discount: 0,
    hasServiceTax: true,
  },
  {
    id: 13,
    number: 'Mesa 13',
    seats: 2,
    zone: 'Bar',
    status: 'ocupada',
    waiter: 'Barman Rafael',
    customersCount: 2,
    openedAt: '12:40',
    minutesActive: 36,
    hasServiceTax: true,
    discount: 0,
    items: [
      { id: 'item-13-1', productId: 'prod-16', name: 'Caipirinha Tradicional Limão', qty: 2, price: 22.00, total: 44.00, timestamp: '12:42', status: 'enviado' },
      { id: 'item-13-2', productId: 'prod-8', name: 'Dadinho de Tapioca c/ Geléia', qty: 1, price: 32.00, total: 32.00, timestamp: '12:44', status: 'enviado' }
    ]
  },
  {
    id: 14,
    number: 'Mesa 14',
    seats: 2,
    zone: 'Bar',
    status: 'livre',
    items: [],
    discount: 0,
    hasServiceTax: true,
  },
  {
    id: 15,
    number: 'Mesa 15',
    seats: 4,
    zone: 'Bar',
    status: 'livre',
    items: [],
    discount: 0,
    hasServiceTax: true,
  },
  {
    id: 16,
    number: 'Mesa 16',
    seats: 6,
    zone: 'Salão Principal',
    status: 'ocupada',
    waiter: 'Camila Rocha',
    customersCount: 5,
    openedAt: '12:20',
    minutesActive: 56,
    hasServiceTax: true,
    discount: 0,
    items: [
      { id: 'item-16-1', productId: 'prod-21', name: 'Pizza Quatro Queijos Nobres', qty: 1, price: 56.00, total: 56.00, timestamp: '12:25', status: 'enviado' },
      { id: 'item-16-2', productId: 'prod-10', name: 'Cerveja Heineken Long Neck', qty: 5, price: 14.00, total: 70.00, timestamp: '12:26', status: 'enviado' },
      { id: 'item-16-3', productId: 'prod-22', name: 'Pudim de Leite Condensado', qty: 2, price: 14.00, total: 28.00, timestamp: '12:55', status: 'enviado' }
    ]
  }
];

export const INITIAL_COMANDAS: Comanda[] = [
  {
    id: 'cmd-101',
    number: 'Comanda #101',
    customerName: 'Lucas Lima (Balcão)',
    waiter: 'Barman Rafael',
    status: 'aberta',
    openedAt: '12:35',
    discount: 0,
    hasServiceTax: true,
    items: [
      { id: 'cmd-i-1', productId: 'prod-9', name: 'Chopp Artesanal IPA 500ml', qty: 2, price: 14.00, total: 28.00, timestamp: '12:36', status: 'enviado' },
      { id: 'cmd-i-2', productId: 'prod-19', name: 'Burger Gourmet da Casa 200g', qty: 1, price: 36.90, total: 36.90, timestamp: '12:40', status: 'enviado' }
    ]
  },
  {
    id: 'cmd-102',
    number: 'Comanda #102',
    customerName: 'Gabriel Silva',
    waiter: 'Marcos Vinicius',
    status: 'aberta',
    openedAt: '12:10',
    discount: 0,
    hasServiceTax: true,
    items: [
      { id: 'cmd-i-3', productId: 'prod-17', name: 'Gin Tônica com Especiarias', qty: 1, price: 32.00, total: 32.00, timestamp: '12:12', status: 'enviado' },
      { id: 'cmd-i-4', productId: 'prod-7', name: 'Pastel Misto (6 unidades)', qty: 1, price: 29.90, total: 29.90, timestamp: '12:15', status: 'enviado' }
    ]
  },
  {
    id: 'cmd-103',
    number: 'Comanda #103',
    customerName: 'Juliana Mendes',
    waiter: 'Camila Rocha',
    status: 'aberta',
    openedAt: '12:50',
    discount: 0,
    hasServiceTax: true,
    items: [
      { id: 'cmd-i-5', productId: 'prod-13', name: 'Suco Natural Laranja 400ml', qty: 1, price: 9.50, total: 9.50, timestamp: '12:51', status: 'enviado' }
    ]
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-8941',
    timestamp: '12:58',
    source: 'Mesa 14',
    waiter: 'Carlos Silveira',
    operator: 'Caixa 01 - Ana Paula',
    subtotal: 184.00,
    discount: 0,
    serviceTax: 18.40,
    total: 202.40,
    paymentMethod: 'pix',
    status: 'aprovado',
    itemsSummary: '2x Picanha, 4x Heineken, 1x Água'
  },
  {
    id: 'tx-8940',
    timestamp: '12:44',
    source: 'Mesa 08',
    waiter: 'Camila Rocha',
    operator: 'Caixa 01 - Ana Paula',
    subtotal: 96.50,
    discount: 10.00,
    serviceTax: 8.65,
    total: 95.15,
    paymentMethod: 'credito',
    installments: 1,
    status: 'aprovado',
    itemsSummary: '1x Salmão, 1x Suco Natural, 1x Pudim'
  },
  {
    id: 'tx-8939',
    timestamp: '12:28',
    source: 'Comanda #098',
    waiter: 'Barman Rafael',
    operator: 'Caixa 01 - Ana Paula',
    subtotal: 54.00,
    discount: 0,
    serviceTax: 5.40,
    total: 59.40,
    paymentMethod: 'dinheiro',
    cashReceived: 100.00,
    change: 40.60,
    status: 'aprovado',
    itemsSummary: '2x Chopp Artesanal, 1x Fritas Bacon'
  },
  {
    id: 'tx-8938',
    timestamp: '12:12',
    source: 'Mesa 01',
    waiter: 'Marcos Vinicius',
    operator: 'Caixa 01 - Ana Paula',
    subtotal: 142.00,
    discount: 0,
    serviceTax: 14.20,
    total: 156.20,
    paymentMethod: 'debito',
    status: 'aprovado',
    itemsSummary: '1x Picanha na Chapa, 2x Chopp IPA'
  }
];

export const INITIAL_DIGITAL_ORDERS: import('../types').DigitalOrder[] = [
  {
    id: 'd-ord-101',
    orderNumber: '#DIG-204',
    tableNumber: 'Mesa 05',
    customerName: 'Rodrigo & Amigos',
    status: 'preparo',
    createdAt: '12:42',
    createdAtTimestamp: Date.now() - 17 * 60 * 1000, // 17 minutos atrás (Estourou o limite de 15 min! Alerta vermelho no KDS)
    maxPreparationMinutes: 15,
    observation: 'Sem pimenta no dadinho, trazer chopps bem gelados com colarinho.',
    total: 60.00,
    items: [
      {
        id: 'd-item-1',
        productId: 'prod-8',
        name: 'Dadinho de Tapioca c/ Geléia',
        qty: 1,
        price: 32.00,
        total: 32.00,
        observation: 'Sem pimenta',
        timestamp: '12:42',
        status: 'enviado'
      },
      {
        id: 'd-item-2',
        productId: 'prod-9',
        name: 'Chopp Artesanal IPA 500ml',
        qty: 2,
        price: 14.00,
        total: 28.00,
        observation: 'Caneco congelado',
        timestamp: '12:42',
        status: 'enviado'
      }
    ]
  },
  {
    id: 'd-ord-102',
    orderNumber: '#DIG-203',
    tableNumber: 'Mesa 02',
    customerName: 'Carla Silveira',
    status: 'preparo',
    createdAt: '12:54',
    createdAtTimestamp: Date.now() - 5 * 60 * 1000, // 5 minutos atrás (Tempo regular / dentro do prazo)
    maxPreparationMinutes: 15,
    observation: 'Ponto da carne ao ponto.',
    total: 89.90,
    items: [
      {
        id: 'd-item-3',
        productId: 'prod-1',
        name: 'Picanha na Chapa c/ Mandioca',
        qty: 1,
        price: 89.90,
        total: 89.90,
        timestamp: '12:54',
        status: 'enviado'
      }
    ]
  },
  {
    id: 'd-ord-103',
    orderNumber: '#DIG-205',
    tableNumber: 'Mesa 06',
    customerName: 'Lucas Lima & Família',
    status: 'aguardando',
    createdAt: '12:58',
    createdAtTimestamp: Date.now() - 1 * 60 * 1000, // 1 minuto atrás (Aguardando aprovação)
    maxPreparationMinutes: 15,
    observation: 'Bacon bem crocante nas fritas.',
    total: 108.70,
    items: [
      {
        id: 'd-item-4',
        productId: 'prod-19',
        name: 'Burger Gourmet da Casa 200g',
        qty: 2,
        price: 36.90,
        total: 73.80,
        timestamp: '12:58',
        status: 'pendente'
      },
      {
        id: 'd-item-5',
        productId: 'prod-5',
        name: 'Batata Frita Especial Bacon & Cheddar',
        qty: 1,
        price: 34.90,
        total: 34.90,
        timestamp: '12:58',
        status: 'pendente'
      }
    ]
  }
];

export const INITIAL_CONNECTED_DEVICES: import('../types').DeviceConnected[] = [
  {
    id: 'dev-srv',
    name: 'Servidor Food Node (Local Host)',
    type: 'servidor_local',
    ip: '192.168.1.100:3000',
    pingMs: 0.8,
    lastSeen: 'Agora (0s)',
    status: 'conectado'
  },
  {
    id: 'dev-tab1',
    name: 'iPad Pro 11" — Salão Principal (Garçom Carlos)',
    type: 'tablet_garcom',
    ip: '192.168.1.105',
    pingMs: 2.1,
    lastSeen: 'Agora (2s)',
    status: 'conectado'
  },
  {
    id: 'dev-tab2',
    name: 'Galaxy Tab S8 — Varanda & Deck (Garçom Marcos)',
    type: 'tablet_garcom',
    ip: '192.168.1.106',
    pingMs: 2.4,
    lastSeen: 'Agora (5s)',
    status: 'conectado'
  },
  {
    id: 'dev-kds1',
    name: 'Monitor KDS 24" — Cozinha Quente & Grelha',
    type: 'kds_cozinha',
    ip: '192.168.1.120',
    pingMs: 1.2,
    lastSeen: 'Agora (1s)',
    status: 'conectado'
  },
  {
    id: 'dev-kds2',
    name: 'Monitor KDS 19" — Bar de Drinks & Chopp',
    type: 'kds_cozinha',
    ip: '192.168.1.121',
    pingMs: 1.5,
    lastSeen: 'Agora (3s)',
    status: 'conectado'
  },
  {
    id: 'dev-pos1',
    name: 'Terminal Caixa 01 — Ana Paula (Frente de Loja)',
    type: 'terminal_caixa',
    ip: '192.168.1.110',
    pingMs: 1.1,
    lastSeen: 'Agora (0s)',
    status: 'conectado'
  },
  {
    id: 'dev-cli1',
    name: 'iPhone 15 — Cliente Mesa 05 (Autoatendimento QR)',
    type: 'mobile_cliente',
    ip: '192.168.1.144',
    pingMs: 4.8,
    lastSeen: 'Há 12s',
    status: 'conectado'
  },
  {
    id: 'dev-cli2',
    name: 'Galaxy S23 — Cliente Mesa 12 (Cardápio Digital)',
    type: 'mobile_cliente',
    ip: '192.168.1.148',
    pingMs: 5.2,
    lastSeen: 'Há 35s',
    status: 'conectado'
  }
];

export const INITIAL_SYNC_QUEUE: import('../types').SyncQueueItem[] = [
  {
    id: 'sq-101',
    type: 'pedido',
    description: 'Pedido #DIG-204 Mesa 05 (Picanha + Chopp)',
    origin: 'Mesa 05 (QR Wi-Fi)',
    timestamp: '12:45',
    status: 'pendente',
    amount: 57.00,
    payloadSummary: '2 itens enviados localmente para KDS'
  },
  {
    id: 'sq-102',
    type: 'pagamento',
    description: 'Pagamento PIX Mesa 14 (Comprovante tx-8941)',
    origin: 'Caixa 01',
    timestamp: '12:58',
    status: 'pendente',
    amount: 184.00,
    payloadSummary: 'Liquidado via Wi-Fi local; aguardando upload nuvem'
  },
  {
    id: 'sq-103',
    type: 'estoque',
    description: 'Baixa de Insumos: Picanha 450g e 2 Chopps IPA',
    origin: 'Servidor Local',
    timestamp: '12:59',
    status: 'pendente',
    payloadSummary: 'CMV atualizado no banco local SQLite'
  }
];


