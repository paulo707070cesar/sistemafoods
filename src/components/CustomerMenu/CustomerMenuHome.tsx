import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  ShoppingBag, 
  X, 
  MessageSquare, 
  Sparkles, 
  Flame, 
  UtensilsCrossed, 
  Clock, 
  Check, 
  ArrowLeft,
  BellRing,
  ReceiptText
} from 'lucide-react';
import { useFoodSystem } from '../../context/FoodSystemContext';
import { Product, ProductCategory } from '../../types';

export const CustomerMenuHome: React.FC<{ onOpenCart: () => void }> = ({ onOpenCart }) => {
  const { 
    products, 
    customerSelectedTable, 
    customerCart, 
    addToCustomerCart, 
    setCustomerScreenStep, 
    lastCustomerOrderId,
    digitalOrders,
    addToast,
    playFeedbackSound 
  } = useFoodSystem();

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [detailModalProduct, setDetailModalProduct] = useState<Product | null>(null);
  const [itemObservation, setItemObservation] = useState<string>('');
  const [itemQty, setItemQty] = useState<number>(1);

  const categories: ProductCategory[] = [
    'Todos', 
    'Petiscos', 
    'Pratos Principais', 
    'Bebidas', 
    'Drinks', 
    'Pizzas', 
    'Sobremesas'
  ];

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCat && matchSearch;
  });

  const cartTotal = customerCart.reduce((acc, item) => acc + item.total, 0);
  const cartItemsCount = customerCart.reduce((acc, item) => acc + item.qty, 0);

  // Check if there is an active order for this table
  const activeOrder = digitalOrders.find(o => o.tableNumber === customerSelectedTable && o.status !== 'servido' && o.status !== 'recusado');

  const handleOpenDetailModal = (product: Product) => {
    playFeedbackSound('click');
    setDetailModalProduct(product);
    setItemQty(1);
    setItemObservation('');
  };

  const handleConfirmAddToCart = () => {
    if (!detailModalProduct) return;
    addToCustomerCart(detailModalProduct, itemQty, itemObservation.trim() || undefined);
    setDetailModalProduct(null);
  };

  const handleCallWaiter = () => {
    playFeedbackSound('bell');
    addToast('info', '🔔 Garçom Chamado', `Um atendente já está se dirigindo à ${customerSelectedTable}!`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b101c] text-slate-100 overflow-y-auto relative select-none">
      {/* Mobile Header Bar */}
      <div className="h-14 bg-[#121929] border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0">
        <button
          onClick={() => setCustomerScreenStep('welcome')}
          className="p-1.5 -ml-1 text-slate-400 hover:text-white"
          title="Voltar para início"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="font-extrabold text-sm text-white">{customerSelectedTable}</span>
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">Cardápio Digital</span>
        </div>

        <div className="flex items-center gap-1.5">
          {activeOrder && (
            <button
              onClick={() => setCustomerScreenStep('status')}
              className="px-2 py-1 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-400 text-[11px] font-bold flex items-center gap-1"
              title="Acompanhar status do pedido"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Status</span>
            </button>
          )}

          <button
            onClick={handleCallWaiter}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Chamar Garçom"
          >
            <BellRing className="w-4 h-4 text-orange-400" />
          </button>

          <button
            onClick={() => { playFeedbackSound('click'); setCustomerScreenStep('pagamento'); }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700 transition-colors"
            title="Pedir a Conta"
          >
            <ReceiptText className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Action Strip for Customer */}
      <div className="px-4 py-2 bg-[#0e1524] grid grid-cols-2 gap-2 shrink-0 border-b border-slate-800/60">
        <button
          onClick={handleCallWaiter}
          className="py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/40 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all pos-btn-press"
        >
          <BellRing className="w-3.5 h-3.5 text-orange-400" />
          <span>Chamar Garçom</span>
        </button>

        <button
          onClick={() => { playFeedbackSound('click'); setCustomerScreenStep('pagamento'); }}
          className="py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all pos-btn-press"
        >
          <ReceiptText className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pedir a Conta</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="px-4 pt-3 pb-2 bg-[#0e1524]">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar pratos, bebidas, petiscos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="px-4 py-2 bg-[#0e1524] border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => { playFeedbackSound('click'); setSelectedCategory(cat); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap pos-btn-press border ${
                isActive
                  ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/25'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Products List (Mobile Cards) */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-24">
        {filteredProducts.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
            <UtensilsCrossed className="w-8 h-8 text-slate-600 mb-2" />
            <span>Nenhum item encontrado para "{searchTerm}"</span>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const hasStock = product.currentStock > 0;

            return (
              <div
                key={product.id}
                onClick={() => handleOpenDetailModal(product)}
                className="bg-[#131b2e] border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-3.5 flex items-start justify-between gap-3 shadow-md transition-all active:scale-[0.99] cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider">
                      {product.category}
                    </span>
                    {product.popularShortcut && (
                      <span className="text-[9px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" /> Destaque
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-white tracking-tight line-clamp-1">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="font-mono font-black text-base text-orange-400 tabular-nums">
                      R$ {product.price.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      / {product.unit}
                    </span>
                  </div>
                </div>

                {/* Quick Add Button */}
                <div className="shrink-0 self-center pl-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCustomerCart(product, 1);
                    }}
                    disabled={!hasStock}
                    className="w-10 h-10 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 font-bold transition-all disabled:opacity-40"
                    title="Adicionar ao carrinho"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {cartItemsCount > 0 && (
        <div className="absolute bottom-3 left-3 right-3 z-30">
          <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-3 shadow-2xl shadow-orange-500/40 border border-orange-400/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-white text-orange-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {cartItemsCount}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/80 block">Carrinho da {customerSelectedTable}</span>
                <span className="font-mono font-black text-lg text-white tabular-nums">
                  R$ {cartTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={onOpenCart}
              className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-orange-600 font-extrabold text-xs shadow-md active:scale-95 transition-all pos-btn-press"
            >
              Revisar Pedido
            </button>
          </div>
        </div>
      )}

      {/* Item Detail / Add Modal with Custom Notes */}
      {detailModalProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-[#141c2e] border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-5 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                {detailModalProduct.category}
              </span>
              <button
                onClick={() => setDetailModalProduct(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-3 space-y-2">
              <h2 className="font-black text-lg text-white">
                {detailModalProduct.name}
              </h2>
              {detailModalProduct.description && (
                <p className="text-xs text-slate-400 leading-relaxed">
                  {detailModalProduct.description}
                </p>
              )}
              <div className="font-mono font-black text-xl text-orange-400 pt-1">
                R$ {detailModalProduct.price.toFixed(2)}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 flex items-center justify-between my-2">
              <span className="text-xs font-semibold text-slate-300">Quantidade:</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setItemQty(Math.max(1, itemQty - 1))}
                  className="w-8 h-8 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono font-bold text-base text-white w-6 text-center">
                  {itemQty}
                </span>
                <button
                  onClick={() => setItemQty(itemQty + 1)}
                  className="w-8 h-8 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Item Specific Observation */}
            <div className="my-2">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Observação deste item (opcional):
              </label>
              <input
                type="text"
                placeholder="Ex: sem cebola, ponto da carne mal passado..."
                value={itemObservation}
                onChange={(e) => setItemObservation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center gap-2 mt-auto">
              <button
                onClick={() => setDetailModalProduct(null)}
                className="w-1/3 py-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmAddToCart}
                className="w-2/3 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/25 pos-btn-press"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar R$ {(detailModalProduct.price * itemQty).toFixed(2)}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
