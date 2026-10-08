import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  Search, 
  MessageSquare, 
  ChevronDown, 
  Users, 
  Clock, 
  Percent, 
  Printer, 
  Sparkles,
  ArrowRight,
  Flame,
  X,
  BellRing,
  QrCode
} from 'lucide-react';
import { useFoodSystem } from '../context/FoodSystemContext';
import { ProductCategory, Product, OrderItem } from '../types';

export const PDVScreen: React.FC = () => {
  const {
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
    digitalOrders,
    setPendingDigitalOrderToReview,
    openQRCodeModal,
    addItemToActiveOrder,
    removeItemFromActiveOrder,
    updateItemQty,
    setItemObservation,
    toggleActiveServiceTax,
    setActiveDiscount,
    sendOrderToKitchen,
    setActiveScreen,
    openReceiptModal,
    addToast,
    playFeedbackSound
  } = useFoodSystem();


  const [selectedCategoryId, setSelectedCategoryId] = useState<ProductCategory>('Todos');
  const [productSearch, setProductSearch] = useState<string>('');
  const [selectedRowItemId, setSelectedRowItemId] = useState<string | null>(null);

  // Observation Modal state
  const [obsModalOpen, setObsModalOpen] = useState(false);
  const [obsText, setObsText] = useState('');

  // Discount Modal state
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [customDiscountValue, setCustomDiscountValue] = useState('');

  // Add Item Modal state
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);

  // Smart Upsell state
  const [activeUpsellProduct, setActiveUpsellProduct] = useState<Product | null>(null);

  // Quick Table switcher dropdown
  const [tableDropdownOpen, setTableDropdownOpen] = useState(false);


  // Determine current active item list and values based on mode (Mesas vs Comandas)
  const isTableMode = activeMode === 'mesas';
  const currentItems: OrderItem[] = isTableMode ? activeTable.items : (activeComanda?.items || []);
  const currentDiscount = isTableMode ? activeTable.discount : (activeComanda?.discount || 0);
  const currentHasServiceTax = isTableMode ? activeTable.hasServiceTax : (activeComanda?.hasServiceTax ?? true);

  // Financial calculations
  const subtotal = currentItems.reduce((acc, item) => acc + item.total, 0);
  const discountAmount = currentDiscount;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const serviceTaxAmount = currentHasServiceTax ? Number((taxableAmount * 0.10).toFixed(2)) : 0;
  const totalFinal = Number((taxableAmount + serviceTaxAmount).toFixed(2));

  // Category filter
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
    const matchCategory = selectedCategoryId === 'Todos' || p.category === selectedCategoryId;
    const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                        p.category.toLowerCase().includes(productSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  const popularShortcuts = products.filter(p => p.popularShortcut).slice(0, 4);

  // Handlers
  const handleAddItemWithUpsell = (prod: Product, qty: number = 1) => {
    addItemToActiveOrder(prod, qty);
    if (prod.category === 'Pratos Principais' || (prod.suggestedUpsellIds && prod.suggestedUpsellIds.length > 0)) {
      setActiveUpsellProduct(prod);
    }
  };

  const handleOpenObsModal = () => {
    if (!selectedRowItemId && currentItems.length > 0) {
      setSelectedRowItemId(currentItems[0].id);
      setObsText(currentItems[0].observation || '');
      setObsModalOpen(true);
      return;
    }

    if (selectedRowItemId) {
      const itm = currentItems.find(i => i.id === selectedRowItemId);
      setObsText(itm?.observation || '');
      setObsModalOpen(true);
    } else {
      addToast('info', 'Selecione um Item', 'Clique em uma linha da tabela para adicionar observação.');
    }
  };

  const handleSaveObservation = () => {
    if (selectedRowItemId) {
      setItemObservation(selectedRowItemId, obsText.trim());
      setObsModalOpen(false);
    }
  };

  const handleOpenDiscountModal = () => {
    setCustomDiscountValue(currentDiscount > 0 ? String(currentDiscount) : '');
    setDiscountModalOpen(true);
  };

  const handleApplyDiscount = () => {
    const val = parseFloat(customDiscountValue.replace(',', '.')) || 0;
    setActiveDiscount(val);
    setDiscountModalOpen(false);
    addToast('info', 'Desconto Atualizado', `R$ ${val.toFixed(2)} aplicado ao pedido.`);
  };

  const handleProceedToPayment = () => {
    if (currentItems.length === 0) {
      addToast('warning', 'Pedido Vazio', 'Adicione itens antes de prosseguir para o pagamento.');
      return;
    }
    playFeedbackSound('click');
    setActiveScreen('caixa');
  };

  const handlePrintPreBill = () => {
    if (currentItems.length === 0) {
      addToast('warning', 'Pedido Vazio', 'Nenhum item lançado para impressão.');
      return;
    }
    openReceiptModal(undefined, {
      source: isTableMode ? activeTable.number : activeComanda?.number || 'Comanda',
      items: currentItems,
      subtotal,
      serviceTax: serviceTaxAmount,
      discount: discountAmount,
      total: totalFinal,
      waiter: isTableMode ? (activeTable.waiter || 'Marcos Vinicius') : (activeComanda?.waiter || 'Carlos'),
      openedAt: isTableMode ? (activeTable.openedAt || '12:00') : (activeComanda?.openedAt || '12:00')
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#0b101c] overflow-y-auto select-none">
      {/* Top Context Subheader */}
      <div className="h-12 bg-[#121929] border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 gap-3">
        {/* Left: Mode switch (Mesas / Comandas) & Selected table dropdown */}
        <div className="flex items-center gap-3">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-0.5 bg-slate-900/90 rounded-lg border border-slate-800">
            <button
              onClick={() => { playFeedbackSound('click'); setActiveMode('mesas'); }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                activeMode === 'mesas'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mesas
            </button>
            <button
              onClick={() => { playFeedbackSound('click'); setActiveMode('comandas'); }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                activeMode === 'comandas'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Comandas
            </button>
          </div>

          {/* Table / Comanda Quick Picker Dropdown */}
          {activeMode === 'mesas' ? (
            <div className="relative">
              <button
                onClick={() => setTableDropdownOpen(!tableDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 font-bold text-sm hover:bg-orange-500/20 transition-colors"
              >
                <span>{activeTable.number}</span>
                <span className="text-xs text-orange-300 font-normal">· {activeTable.zone}</span>
                <ChevronDown className="w-3.5 h-3.5 ml-1" />
              </button>

              {tableDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-60 bg-[#162035] border border-slate-700/80 rounded-xl shadow-2xl z-50 p-2 max-h-72 overflow-y-auto">
                  <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">
                    Trocar Mesa no PDV
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mt-1">
                    {tables.map(tbl => (
                      <button
                        key={tbl.id}
                        onClick={() => {
                          setSelectedTableId(tbl.id);
                          setTableDropdownOpen(false);
                          playFeedbackSound('click');
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between border transition-all ${
                          tbl.id === selectedTableId
                            ? 'bg-orange-500 text-white border-orange-400'
                            : tbl.status === 'ocupada'
                            ? 'bg-orange-500/10 text-orange-300 border-orange-500/20 hover:bg-orange-500/20'
                            : tbl.status === 'reservada'
                            ? 'bg-blue-500/10 text-blue-300 border-blue-500/20 hover:bg-blue-500/20'
                            : 'bg-slate-800/60 text-slate-400 border-slate-700/50 hover:bg-slate-800'
                        }`}
                      >
                        <span>{tbl.number}</span>
                        <span className={`w-2 h-2 rounded-full ${
                          tbl.status === 'ocupada' ? 'bg-orange-500' :
                          tbl.status === 'reservada' ? 'bg-blue-400' : 'bg-slate-500'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <select
                value={selectedComandaId}
                onChange={(e) => setSelectedComandaId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-orange-400 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none"
              >
                {comandas.map(cmd => (
                  <option key={cmd.id} value={cmd.id}>
                    {cmd.number} - {cmd.customerName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Waiter & Table Info */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span>Garçom: <strong className="text-slate-200">{activeTable.waiter || 'Marcos Vinicius'}</strong></span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{activeTable.openedAt ? `${activeTable.openedAt} (${activeTable.minutesActive || 45} min)` : 'Agora'}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>{activeTable.customersCount || 3} pessoas</span>
            </span>
          </div>
        </div>

        {/* Right Info: Status badge & Digital Order alerts */}
        <div className="flex items-center gap-2">
          {(() => {
            const pendingForThis = digitalOrders.filter(o => o.tableNumber === activeTable.number && o.status === 'aguardando');
            if (pendingForThis.length === 0) return null;
            return (
              <button
                onClick={() => setPendingDigitalOrderToReview(pendingForThis[0])}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/30 animate-pulse pos-btn-press"
                title="Clique para aceitar ou recusar o pedido digital"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Novo Pedido Digital!</span>
              </button>
            );
          })()}

          <button
            onClick={() => openQRCodeModal(activeTable.number)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold"
            title="Ver / Imprimir Placa com QR Code desta Mesa"
          >
            <QrCode className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">QR Mesa</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
            {activeTable.status === 'ocupada' ? 'Mesa Ocupada' : activeTable.status}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-3 p-3 lg:grid-rows-[minmax(0,1fr)]">
        {/* ================= COLUNA ESQUERDA (7 colunas): Lista de Produtos e Ações do Pedido ================= */}
        <div className="col-span-12 lg:col-span-7 min-h-0 flex flex-col bg-[#121929]/95 rounded-2xl border border-slate-800/90 shadow-xl overflow-hidden">
          {/* Header of Table Order */}
          <div className="bg-[#182238] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
            <div className="grid grid-cols-12 w-full gap-2 items-center">
              <span className="col-span-5 uppercase tracking-wider text-[11px] text-slate-400">Produto</span>
              <span className="col-span-2 text-center uppercase tracking-wider text-[11px] text-slate-400">Qtd</span>
              <span className="col-span-2 text-right uppercase tracking-wider text-[11px] text-slate-400">Preço</span>
              <span className="col-span-3 text-right uppercase tracking-wider text-[11px] text-slate-400">Total</span>
            </div>
          </div>

          {/* Table Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-1">
            {currentItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-400 mb-3 border border-slate-700/50">
                  <FileText className="w-7 h-7" />
                </div>
                <p className="font-semibold text-slate-300 text-sm">Nenhum item lançado no pedido</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Selecione produtos na coluna direita ou utilize os atalhos rápidos abaixo para adicionar itens.
                </p>
              </div>
            ) : (
              currentItems.map((item) => {
                const isSelected = selectedRowItemId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedRowItemId(item.id)}
                    className={`grid grid-cols-12 gap-2 items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-orange-500/15 border border-orange-500/40 text-white'
                        : 'hover:bg-slate-800/40 text-slate-200 border border-transparent'
                    }`}
                  >
                    {/* Produto + Observação */}
                    <div className="col-span-5 min-w-0 pr-1">
                      <div className="font-semibold text-xs md:text-sm truncate text-slate-100 flex items-center gap-1.5">
                        {item.name}
                        {item.status === 'pendente' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="Item pendente de envio" />
                        )}
                      </div>
                      {item.observation && (
                        <div className="text-[11px] text-orange-400 italic flex items-center gap-1 mt-0.5 truncate">
                          <MessageSquare className="w-3 h-3 shrink-0" />
                          <span className="truncate">{item.observation}</span>
                        </div>
                      )}
                    </div>

                    {/* Quantidade with + / - inline stepper */}
                    <div className="col-span-2 flex items-center justify-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); updateItemQty(item.id, -1); }}
                        className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-xs font-bold transition-colors pos-btn-press"
                      >
                        -
                      </button>
                      <span className="w-7 text-center font-mono font-bold text-xs md:text-sm text-slate-100 tabular-nums">
                        {item.qty}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); updateItemQty(item.id, 1); }}
                        className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-xs font-bold transition-colors pos-btn-press"
                      >
                        +
                      </button>
                    </div>

                    {/* Preço Unitário */}
                    <div className="col-span-2 text-right font-mono text-xs md:text-sm text-slate-400 tabular-nums">
                      R$ {item.price.toFixed(2)}
                    </div>

                    {/* Total Item */}
                    <div className="col-span-3 text-right font-mono font-bold text-xs md:text-sm text-orange-400 tabular-nums">
                      R$ {item.total.toFixed(2)}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Shortcuts Bar (Chopp, Burger, Pizza, etc.) */}
          <div className="p-2.5 bg-[#0f1626] border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                Atalhos Rápidos Mais Pedidos
              </span>
              <span className="text-[10px] text-slate-500">Toque rápido para lançar</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {popularShortcuts.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => handleAddItemWithUpsell(prod, 1)}
                  className="bg-slate-800/80 hover:bg-slate-800 active:border-orange-500 border border-slate-700/60 rounded-xl p-2 text-left transition-all pos-btn-press group"
                >
                  <div className="text-[11px] font-semibold text-slate-200 truncate group-hover:text-orange-400 transition-colors">
                    {prod.name.split(' ')[0]} {prod.name.split(' ')[1] || ''}
                  </div>
                  <div className="font-mono text-xs font-bold text-orange-400 mt-0.5 tabular-nums">
                    R$ {prod.price.toFixed(2)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Table Action Buttons */}
          <div className="p-3 bg-[#141d30] border-t border-slate-800 grid grid-cols-4 gap-2">
            <button
              onClick={() => setAddItemModalOpen(true)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all pos-btn-press shadow-sm"
            >
              <Plus className="w-4 h-4 text-orange-400" />
              <span>Adicionar Item</span>
            </button>

            <button
              onClick={handleOpenObsModal}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all pos-btn-press shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Observação</span>
            </button>

            <button
              onClick={() => {
                if (selectedRowItemId) {
                  removeItemFromActiveOrder(selectedRowItemId);
                  setSelectedRowItemId(null);
                } else if (currentItems.length > 0) {
                  removeItemFromActiveOrder(currentItems[currentItems.length - 1].id);
                }
              }}
              disabled={currentItems.length === 0}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/50 font-bold text-xs transition-all pos-btn-press disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Cancelar Item</span>
            </button>

            <button
              onClick={handleProceedToPayment}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all pos-btn-press"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pagamento</span>
            </button>
          </div>
        </div>

        {/* ================= COLUNA DIREITA (5 colunas): Resumo do Pedido & Grade de Categorias/Produtos ================= */}
        <div className="col-span-12 lg:col-span-5 min-h-0 flex flex-col gap-3">
          {/* Order Summary Panel (Total, Desconto, Total Final) */}
          <div className="bg-[#121929]/95 rounded-2xl border border-slate-800/90 shadow-xl p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Resumo do Pedido ({currentItems.length} {currentItems.length === 1 ? 'item' : 'itens'})
              </span>
              <button
                onClick={handlePrintPreBill}
                className="text-orange-400 hover:text-orange-300 font-semibold text-xs flex items-center gap-1"
                title="Imprimir conferência de mesa"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Prévia da Conta</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Subtotal */}
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Subtotal</span>
                <span className="font-mono text-sm md:text-base font-bold text-slate-200 tabular-nums">
                  R$ {subtotal.toFixed(2)}
                </span>
              </div>

              {/* Taxa de Serviço 10% (interativa) */}
              <button
                onClick={toggleActiveServiceTax}
                className={`p-2 rounded-xl border text-left transition-all pos-btn-press ${
                  currentHasServiceTax
                    ? 'bg-slate-900/80 border-slate-800/80 text-slate-200'
                    : 'bg-slate-900/30 border-dashed border-slate-800 text-slate-500'
                }`}
                title="Clique para ativar/desativar taxa de serviço"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Serviço 10%</span>
                  <span className={`text-[10px] font-bold ${currentHasServiceTax ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {currentHasServiceTax ? 'SIM' : 'NÃO'}
                  </span>
                </div>
                <span className="font-mono text-sm font-bold block mt-0.5 tabular-nums">
                  R$ {serviceTaxAmount.toFixed(2)}
                </span>
              </button>

              {/* Desconto (interativo) */}
              <button
                onClick={handleOpenDiscountModal}
                className={`p-2 rounded-xl border text-left transition-all pos-btn-press ${
                  discountAmount > 0
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-slate-900/80 border-slate-800/80 text-slate-200 hover:border-slate-700'
                }`}
                title="Clique para aplicar desconto"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Desconto</span>
                  <Percent className="w-3 h-3 text-amber-400" />
                </div>
                <span className="font-mono text-sm font-bold block mt-0.5 tabular-nums">
                  - R$ {discountAmount.toFixed(2)}
                </span>
              </button>
            </div>

            {/* Total Final Prominente */}
            <div className="bg-gradient-to-r from-orange-500/15 via-orange-500/25 to-amber-500/15 border border-orange-500/40 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-inner">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 block">Total Final</span>
                <span className="text-[11px] text-slate-400">
                  {isTableMode ? activeTable.number : activeComanda?.number}
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-2xl md:text-3xl font-extrabold text-white tracking-tight tabular-nums">
                  R$ {totalFinal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Categorias & Lista de Produtos para Seleção Rápida */}
          <div className="flex-1 min-h-0 bg-[#121929]/95 rounded-2xl border border-slate-800/90 shadow-xl p-3 flex flex-col gap-2.5 overflow-hidden">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar produto por nome ou categoria..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs md:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
              {productSearch && (
                <button
                  onClick={() => setProductSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Buttons Grid */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
              {categories.map((cat) => {
                const isActive = selectedCategoryId === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => { playFeedbackSound('click'); setSelectedCategoryId(cat); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap pos-btn-press border ${
                      isActive
                        ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Product Quick-Pick List */}
            <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-800/50 pr-1">
              {filteredProducts.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center p-4 text-slate-500 text-xs">
                  Nenhum produto encontrado para "{productSearch}"
                </div>
              ) : (
                filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleAddItemWithUpsell(prod, 1)}
                    className="py-2 px-2.5 rounded-xl hover:bg-slate-800/50 flex items-center justify-between cursor-pointer transition-colors group active:bg-orange-500/10"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-xs md:text-sm text-slate-200 group-hover:text-orange-400 transition-colors truncate">
                        {prod.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>{prod.category}</span>
                        <span>·</span>
                        <span className="font-mono text-slate-400">{prod.currentStock} {prod.unit} em estoque</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-xs md:text-sm text-slate-100 group-hover:text-orange-400 tabular-nums block">
                        R$ {prod.price.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-orange-500/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 justify-end">
                        <Plus className="w-3 h-3" /> Adicionar
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Actions of Right Panel: "Fechar Conta" e "Finalizar Pedido" */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 shrink-0">
              <button
                onClick={handlePrintPreBill}
                className="py-3 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all pos-btn-press"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                <span>Fechar Conta</span>
              </button>

              <button
                onClick={sendOrderToKitchen}
                className="py-3 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all pos-btn-press"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finalizar Pedido</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Observation Modal */}
      {obsModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#141b2d] border border-slate-700 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                Observação do Item
              </h3>
              <button onClick={() => setObsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4">
              <label className="text-xs text-slate-400 block mb-1.5">
                Instruções especiais para Cozinha / Bar:
              </label>
              <textarea
                value={obsText}
                onChange={(e) => setObsText(e.target.value)}
                placeholder="Ex: Ponto da carne mal passado, sem cebola, gelo e limão..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                autoFocus
              />

              {/* Quick suggestions chips */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {['Sem cebola', 'Ponto: Mal passado', 'Ponto: Ao ponto', 'Com gelo e limão', 'Separar molho', 'Sem pimenta'].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setObsText(prev => prev ? `${prev}, ${chip}` : chip)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setObsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveObservation}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20"
              >
                Salvar Observação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {discountModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#141b2d] border border-slate-700 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Percent className="w-4 h-4 text-amber-400" />
                Aplicar Desconto no Pedido
              </h3>
              <button onClick={() => setDiscountModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Valor do Desconto (R$):</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">R$</span>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={customDiscountValue}
                    onChange={(e) => setCustomDiscountValue(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-lg font-mono font-bold text-white focus:outline-none focus:border-orange-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-4 gap-1.5">
                {[5, 10, 15, 20].map((val) => (
                  <button
                    key={val}
                    onClick={() => setCustomDiscountValue(String(val))}
                    className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700"
                  >
                    R$ {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => { setActiveDiscount(0); setDiscountModalOpen(false); }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 mr-auto"
              >
                Zerar
              </button>
              <button
                onClick={() => setDiscountModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Fechar
              </button>
              <button
                onClick={handleApplyDiscount}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {addItemModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#141b2d] border border-slate-700 rounded-2xl w-full max-w-lg p-5 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-400" />
                Lançar Item no Pedido
              </h3>
              <button onClick={() => setAddItemModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-3">
              <input
                type="text"
                placeholder="Pesquisar produto pelo nome..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800 pr-1">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="py-2.5 px-3 flex items-center justify-between hover:bg-slate-800/60 rounded-xl transition-colors"
                >
                  <div>
                    <span className="font-semibold text-sm text-slate-200 block">{p.name}</span>
                    <span className="text-xs text-slate-500">{p.category} · Estoque: {p.currentStock}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-orange-400">R$ {p.price.toFixed(2)}</span>
                    <button
                      onClick={() => {
                        addItemToActiveOrder(p, 1);
                        setAddItemModalOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setAddItemModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Upsell Modal */}
      {activeUpsellProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-[#121929] border border-orange-500/50 rounded-2xl w-full max-w-md p-5 shadow-2xl flex flex-col ring-4 ring-orange-500/20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-white text-sm">
                    Sugestão Inteligente de Upsell
                  </h3>
                  <span className="text-[10px] text-orange-400 uppercase font-bold">
                    Aumente o Ticket Médio da Mesa
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setActiveUpsellProduct(null)} 
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-3 text-xs text-slate-300">
              Prato adicionado: <strong className="text-white">{activeUpsellProduct.name}</strong>.
              <span className="block text-slate-400 mt-0.5">Harmonize oferecendo uma bebida gelada ou acompanhamento rápido:</span>
            </div>

            {/* Suggested Upsell Options */}
            <div className="space-y-2 my-1">
              {(activeUpsellProduct.suggestedUpsellIds && activeUpsellProduct.suggestedUpsellIds.length > 0
                ? products.filter(p => activeUpsellProduct.suggestedUpsellIds?.includes(p.id))
                : products.filter(p => p.category === 'Bebidas' || p.category === 'Petiscos').slice(0, 3)
              ).slice(0, 3).map((upsellItem) => (
                <div
                  key={upsellItem.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-orange-500/40 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs text-white block truncate">{upsellItem.name}</span>
                    <span className="text-[10px] text-slate-400">{upsellItem.category} · Estoque: {upsellItem.currentStock}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-xs text-orange-400 tabular-nums">
                      R$ {upsellItem.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => {
                        playFeedbackSound('bell');
                        addItemToActiveOrder(upsellItem, 1);
                        addToast('success', 'Upsell Adicionado!', `${upsellItem.name} adicionado ao pedido.`);
                        setActiveUpsellProduct(null);
                      }}
                      className="py-1.5 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-black text-xs flex items-center gap-1 shadow-md shadow-orange-500/20 pos-btn-press"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end mt-2">
              <button
                onClick={() => setActiveUpsellProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Não Oferecer / Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
