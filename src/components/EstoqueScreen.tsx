import React, { useState } from 'react';
import { 
  Package, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Plus, 
  Filter, 
  History, 
  X,
  FileSpreadsheet,
  Boxes,
  Clock
} from 'lucide-react';
import { useFoodSystem } from '../context/FoodSystemContext';
import { Product, ProductCategory } from '../types';

export const EstoqueScreen: React.FC = () => {
  const {
    products,
    stockMovements,
    addStock,
    removeStock,
    addNewProduct,
    addToast,
    playFeedbackSound
  } = useFoodSystem();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'todos' | 'baixo' | 'validade'>('todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Expiry check logic (threshold 7 days)
  const getExpiryInfo = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const now = new Date('2026-10-06T12:00:00Z');
    const exp = new Date(expiryDate);
    const diffTime = exp.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return { status: 'vencido', days: 0, label: 'Vencido!', isExpiringSoon: true, color: 'rose' };
    if (diffDays <= 3) return { status: 'urgente', days: diffDays, label: `Vence em ${diffDays}d`, isExpiringSoon: true, color: 'rose' };
    if (diffDays <= 7) return { status: 'atencao', days: diffDays, label: `Vence em ${diffDays}d`, isExpiringSoon: true, color: 'amber' };
    return { status: 'ok', days: diffDays, label: `Val. ${diffDays}d`, isExpiringSoon: false, color: 'emerald' };
  };

  // Modals state
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [newProductModalOpen, setNewProductModalOpen] = useState(false);
  const [selectedProductForAction, setSelectedProductForAction] = useState<Product | null>(null);

  // Form states
  const [entryQty, setEntryQty] = useState('');
  const [entryReason, setEntryReason] = useState('Compra Fornecedor / NF-e');
  const [exitQty, setExitQty] = useState('');
  const [exitReason, setExitReason] = useState('Quebra / Avaria');

  // New product form
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<ProductCategory>('Petiscos');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCost, setNewProdCost] = useState('');
  const [newProdStock, setNewProdStock] = useState('');
  const [newProdMin, setNewProdMin] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('un');

  // Calculations & stats
  const lowStockCount = products.filter(p => p.currentStock <= p.minStock).length;
  const totalItemsCount = products.reduce((acc, p) => acc + p.currentStock, 0);
  const expiringSoonProducts = products.filter(p => {
    const info = getExpiryInfo(p.expiryDate);
    return info && info.isExpiringSoon;
  });
  const expiringSoonCount = expiringSoonProducts.length;

  const categories = ['Todas', 'Petiscos', 'Pratos Principais', 'Bebidas', 'Drinks', 'Pizzas', 'Sobremesas'];

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = 
      filterMode === 'todos' ? true :
      filterMode === 'baixo' ? p.currentStock <= p.minStock :
      filterMode === 'validade' ? (getExpiryInfo(p.expiryDate)?.isExpiringSoon ?? false) : true;
    const matchCat = selectedCategory === 'Todas' || p.category === selectedCategory;
    return matchSearch && matchFilter && matchCat;
  });

  const handleOpenEntry = (prod?: Product) => {
    playFeedbackSound('click');
    setSelectedProductForAction(prod || products[0]);
    setEntryQty('10');
    setEntryModalOpen(true);
  };

  const handleOpenExit = (prod?: Product) => {
    playFeedbackSound('click');
    setSelectedProductForAction(prod || products[0]);
    setExitQty('1');
    setExitModalOpen(true);
  };

  const handleConfirmEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForAction) return;
    const qty = parseInt(entryQty, 10);
    if (isNaN(qty) || qty <= 0) {
      addToast('warning', 'Quantidade Inválida', 'Informe um número maior que zero.');
      return;
    }
    addStock(selectedProductForAction.id, qty, entryReason);
    setEntryModalOpen(false);
  };

  const handleConfirmExit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForAction) return;
    const qty = parseInt(exitQty, 10);
    if (isNaN(qty) || qty <= 0) {
      addToast('warning', 'Quantidade Inválida', 'Informe um número maior que zero.');
      return;
    }
    removeStock(selectedProductForAction.id, qty, exitReason);
    setExitModalOpen(false);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    addNewProduct({
      name: newProdName.trim(),
      category: newProdCategory,
      price: parseFloat(newProdPrice.replace(',', '.')) || 0,
      costPrice: parseFloat(newProdCost.replace(',', '.')) || 0,
      currentStock: parseInt(newProdStock, 10) || 0,
      minStock: parseInt(newProdMin, 10) || 5,
      unit: newProdUnit,
    });

    // Reset
    setNewProdName('');
    setNewProdPrice('');
    setNewProdCost('');
    setNewProdStock('');
    setNewProdMin('');
    setNewProductModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0b101c] overflow-y-auto select-none">
      {/* Top Bar with Actions & Metrics */}
      <div className="bg-[#121929] border-b border-slate-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: Search & Filter Tabs */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar por nome do produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => setFilterMode('todos')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                filterMode === 'todos' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              onClick={() => setFilterMode('baixo')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                filterMode === 'baixo' ? 'bg-amber-500 text-slate-950 font-black' : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Estoque Baixo ({lowStockCount})</span>
            </button>
            <button
              onClick={() => setFilterMode('validade')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                filterMode === 'validade' ? 'bg-rose-500 text-white font-black' : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Validade Próxima ({expiringSoonCount})</span>
            </button>
          </div>
        </div>

        {/* Right: Action Buttons (Dar Entrada, Dar Baixa, Novo Produto) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEntry()}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 pos-btn-press"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Dar Entrada</span>
          </button>

          <button
            onClick={() => handleOpenExit()}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 pos-btn-press"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Dar Baixa</span>
          </button>

          <button
            onClick={() => setNewProductModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 pos-btn-press"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Produto</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-12 gap-3 p-3 min-h-0">
        {/* ================= TABELA DE INVENTÁRIO (8 colunas) ================= */}
        <div className="col-span-12 lg:col-span-8 min-h-0 flex flex-col bg-[#121929]/95 rounded-2xl border border-slate-800/90 shadow-xl">
          {/* Category Filter Horizontal Scroll */}
          <div className="p-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  selectedCategory === c
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Table Header */}
          <div className="bg-[#182238] px-4 py-2.5 border-b border-slate-800 text-xs font-bold text-slate-300">
            <div className="grid grid-cols-12 gap-2 items-center">
              <span className="col-span-5 uppercase tracking-wider text-[11px] text-slate-400">Nome do Produto</span>
              <span className="col-span-2 text-center uppercase tracking-wider text-[11px] text-slate-400">Qtd Atual</span>
              <span className="col-span-2 text-center uppercase tracking-wider text-[11px] text-slate-400">Qtd Mínima</span>
              <span className="col-span-3 text-right uppercase tracking-wider text-[11px] text-slate-400">Status</span>
            </div>
          </div>

          {/* Table Rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50 p-1">
            {filteredProducts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs p-6 text-center">
                Nenhum produto encontrado com os filtros atuais.
              </div>
            ) : (
              filteredProducts.map((p) => {
                const isLow = p.currentStock <= p.minStock;
                const isCritical = p.currentStock === 0;
                const expiry = getExpiryInfo(p.expiryDate);

                return (
                  <div
                    key={p.id}
                    className="grid grid-cols-12 gap-2 items-center px-4 py-3 rounded-xl hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Produto */}
                    <div className="col-span-5 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs md:text-sm text-slate-100 truncate group-hover:text-orange-400 transition-colors">
                          {p.name}
                        </span>
                        {expiry && expiry.isExpiringSoon && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border shrink-0 ${
                            expiry.status === 'urgente' || expiry.status === 'vencido'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}>
                            <Clock className="w-2.5 h-2.5" />
                            <span>{expiry.label}</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>{p.category}</span>
                        <span>·</span>
                        <span className="font-mono text-slate-400">Venda: R$ {p.price.toFixed(2)}</span>
                        {p.expiryDate && (
                          <>
                            <span>·</span>
                            <span className="text-[10px] text-slate-400 font-mono">Val: {p.expiryDate.split('-').reverse().join('/')}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Quantidade Atual */}
                    <div className="col-span-2 text-center">
                      <span className={`font-mono font-extrabold text-sm md:text-base tabular-nums ${
                        isCritical ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-slate-100'
                      }`}>
                        {p.currentStock}
                      </span>
                      <span className="text-[10px] text-slate-500 block">{p.unit}</span>
                    </div>

                    {/* Quantidade Mínima */}
                    <div className="col-span-2 text-center font-mono text-xs md:text-sm text-slate-400 tabular-nums">
                      {p.minStock} {p.unit}
                    </div>

                    {/* Status & Quick Action Buttons */}
                    <div className="col-span-3 flex items-center justify-end gap-2">
                      {isCritical ? (
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          Esgotado
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Estoque Baixo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Normal
                        </span>
                      )}

                      {/* Row Action Buttons */}
                      <button
                        onClick={() => handleOpenEntry(p)}
                        className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-800/40 transition-colors"
                        title="Entrada neste item"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenExit(p)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-800 text-rose-300 border border-rose-800/40 transition-colors"
                        title="Baixa neste item"
                      >
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= HISTÓRICO DE MOVIMENTAÇÕES & RESUMO (4 colunas) ================= */}
        <div className="col-span-12 lg:col-span-4 min-h-0 flex flex-col gap-3">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#121929]/95 rounded-2xl border border-slate-800/90 p-3.5 shadow-xl">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Total em Unidades</span>
              <span className="font-mono text-2xl font-black text-slate-100 tabular-nums block mt-1">
                {totalItemsCount}
              </span>
              <span className="text-[10px] text-slate-500">Unidades estocadas</span>
            </div>

            <div className="bg-[#121929]/95 rounded-2xl border border-slate-800/90 p-3.5 shadow-xl">
              <span className="text-[11px] text-amber-400 uppercase tracking-wider block flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Alerta Reposição
              </span>
              <span className="font-mono text-2xl font-black text-amber-400 tabular-nums block mt-1">
                {lowStockCount}
              </span>
              <span className="text-[10px] text-slate-500">Itens abaixo do mínimo</span>
            </div>
          </div>

          {/* Card de Controle de Validade */}
          {expiringSoonCount > 0 && (
            <div className="bg-[#121929]/95 rounded-2xl border border-rose-500/30 p-3 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-rose-400" />
                  Validade Próxima ({expiringSoonCount} itens)
                </span>
                <button
                  onClick={() => setFilterMode('validade')}
                  className="text-[10px] text-orange-400 font-bold hover:underline"
                >
                  Filtrar Tabela
                </button>
              </div>

              <div className="space-y-1.5 pt-2 max-h-36 overflow-y-auto pr-1">
                {expiringSoonProducts.map((ep) => {
                  const expInfo = getExpiryInfo(ep.expiryDate);
                  return (
                    <div key={ep.id} className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-1">
                        <span className="font-semibold text-white block truncate">{ep.name}</span>
                        <span className="text-[10px] text-slate-400">Estoque: {ep.currentStock} {ep.unit}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0 ${
                        expInfo?.status === 'urgente' || expInfo?.status === 'vencido'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {expInfo?.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* History of Stock Movements */}
          <div className="flex-1 bg-[#121929]/95 rounded-2xl border border-slate-800/90 shadow-xl p-3.5 flex flex-col">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <History className="w-4 h-4 text-orange-400" />
                Histórico de Entradas & Baixas
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {stockMovements.length} logs
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 pr-1 mt-1">
              {stockMovements.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                  <Boxes className="w-8 h-8 text-slate-600 mb-2" />
                  <span>Nenhuma movimentação manual registrada hoje.</span>
                </div>
              ) : (
                stockMovements.map((mov) => (
                  <div key={mov.id} className="py-2.5 px-2 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-200">{mov.productName}</div>
                      <div className="text-[11px] text-slate-400">
                        {mov.reason} · {mov.timestamp}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`font-mono font-bold text-xs ${
                        mov.type === 'entrada' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {mov.type === 'entrada' ? `+${mov.qty}` : `-${mov.qty}`}
                      </span>
                      <span className="text-[10px] text-slate-500 block uppercase">{mov.type}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Dar Entrada */}
      {entryModalOpen && selectedProductForAction && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleConfirmEntry} className="bg-[#141b2d] border border-slate-700 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                Dar Entrada no Estoque
              </h3>
              <button type="button" onClick={() => setEntryModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Produto:</label>
                <select
                  value={selectedProductForAction.id}
                  onChange={(e) => {
                    const found = products.find(p => p.id === e.target.value);
                    if (found) setSelectedProductForAction(found);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500 font-semibold"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Atual: {p.currentStock})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Quantidade a Adicionar ({selectedProductForAction.unit}):</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={entryQty}
                  onChange={(e) => setEntryQty(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-orange-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Motivo / Documento:</label>
                <select
                  value={entryReason}
                  onChange={(e) => setEntryReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="Compra Fornecedor / NF-e">Compra Fornecedor / NF-e</option>
                  <option value="Ajuste de Inventário / Sobra">Ajuste de Inventário / Sobra</option>
                  <option value="Devolução de Mesa">Devolução de Mesa</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEntryModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
              >
                Confirmar Entrada
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Dar Baixa */}
      {exitModalOpen && selectedProductForAction && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleConfirmExit} className="bg-[#141b2d] border border-slate-700 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
                Dar Baixa de Estoque
              </h3>
              <button type="button" onClick={() => setExitModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Produto:</label>
                <select
                  value={selectedProductForAction.id}
                  onChange={(e) => {
                    const found = products.find(p => p.id === e.target.value);
                    if (found) setSelectedProductForAction(found);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500 font-semibold"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Atual: {p.currentStock})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Quantidade a Remover ({selectedProductForAction.unit}):</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProductForAction.currentStock}
                  required
                  value={exitQty}
                  onChange={(e) => setExitQty(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-orange-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Motivo da Baixa:</label>
                <select
                  value={exitReason}
                  onChange={(e) => setExitReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="Quebra / Avaria">Quebra / Avaria</option>
                  <option value="Vencimento / Validade">Vencimento / Validade</option>
                  <option value="Consumo Interno / Refeição">Consumo Interno / Refeição</option>
                  <option value="Degustação / Cortesia">Degustação / Cortesia</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setExitModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20"
              >
                Confirmar Baixa
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Cadastrar Produto */}
      {newProductModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateProduct} className="bg-[#141b2d] border border-slate-700 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-orange-400" />
                Cadastrar Novo Produto
              </h3>
              <button type="button" onClick={() => setNewProductModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nome do Item:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Porção de Camarão Empanado"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Categoria:</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as ProductCategory)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Petiscos">Petiscos</option>
                    <option value="Pratos Principais">Pratos Principais</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Pizzas">Pizzas</option>
                    <option value="Sobremesas">Sobremesas</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Unidade de Medida:</label>
                  <select
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="porção">porção</option>
                    <option value="un">un (unidade)</option>
                    <option value="lata">lata</option>
                    <option value="garrafa">garrafa</option>
                    <option value="copo">copo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Preço de Venda (R$):</label>
                  <input
                    type="number"
                    step="0.10"
                    required
                    placeholder="45.00"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm font-mono text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Preço de Custo (R$):</label>
                  <input
                    type="number"
                    step="0.10"
                    placeholder="18.00"
                    value={newProdCost}
                    onChange={(e) => setNewProdCost(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm font-mono text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Estoque Inicial:</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="20"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm font-mono text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Estoque Mínimo (Alerta):</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="8"
                    value={newProdMin}
                    onChange={(e) => setNewProdMin(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm font-mono text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setNewProductModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20"
              >
                Cadastrar no Cardápio
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
