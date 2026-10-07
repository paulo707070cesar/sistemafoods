import React, { useState } from 'react';
import { 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Sparkles, 
  Search, 
  Filter, 
  ArrowUpRight, 
  AlertCircle, 
  CheckCircle2, 
  Printer, 
  Edit3, 
  Calculator, 
  UtensilsCrossed, 
  Layers,
  X
} from 'lucide-react';
import { useFoodSystem } from '../context/FoodSystemContext';
import { Product, ProductCategory } from '../types';

export const FichasScreen: React.FC = () => {
  const { products, openReceiptModal, addToast, playFeedbackSound } = useFoodSystem();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    products.find(p => p.ingredients && p.ingredients.length > 0) || products[0]
  );

  // Price simulator state
  const [simulatedPrice, setSimulatedPrice] = useState<number>(selectedProduct?.price || 50);

  const categories = ['Todas', 'Pratos Principais', 'Petiscos', 'Pizzas', 'Sobremesas', 'Drinks', 'Bebidas'];

  // Filter products that have ingredients or are main dishes/petiscos
  const eligibleProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'Todas' || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  // Calculate stats for current selected product
  const getProductMetrics = (prod: Product, priceOverride?: number) => {
    const price = priceOverride !== undefined ? priceOverride : prod.price;
    const cost = prod.costPrice || 10;
    const profit = Math.max(0, price - cost);
    const marginPercent = price > 0 ? (profit / price) * 100 : 0;
    const markup = cost > 0 ? price / cost : 1;
    return {
      price,
      cost,
      profit,
      marginPercent,
      markup
    };
  };

  const handleSelectProduct = (prod: Product) => {
    playFeedbackSound('click');
    setSelectedProduct(prod);
    setSimulatedPrice(prod.price);
  };

  // Overall metrics
  const productsWithCost = products.filter(p => p.costPrice > 0);
  const avgMargin = productsWithCost.reduce((acc, p) => {
    const profit = p.price - p.costPrice;
    return acc + (profit / p.price) * 100;
  }, 0) / (productsWithCost.length || 1);

  const highestProfitProduct = [...productsWithCost].sort((a, b) => (b.price - b.costPrice) - (a.price - a.costPrice))[0];
  const lowestMarginProduct = [...productsWithCost].sort((a, b) => {
    const marginA = ((a.price - a.costPrice) / a.price) * 100;
    const marginB = ((b.price - b.costPrice) / b.price) * 100;
    return marginA - marginB;
  })[0];

  const currentMetrics = selectedProduct ? getProductMetrics(selectedProduct, simulatedPrice) : null;

  const handlePrintTechnicalSheet = () => {
    if (!selectedProduct) return;
    playFeedbackSound('click');
    addToast('info', 'Ficha Técnica Enviada', `Imprimindo ficha técnica de ${selectedProduct.name}...`);
  };

  const handleApplySimulatedPrice = () => {
    if (!selectedProduct) return;
    playFeedbackSound('success');
    selectedProduct.price = simulatedPrice;
    addToast('success', 'Preço Atualizado!', `Novo preço de R$ ${simulatedPrice.toFixed(2)} definido para ${selectedProduct.name}.`);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#0b101c] overflow-hidden select-none">
      {/* Header Bar with KPI Cards */}
      <div className="bg-[#121929] border-b border-slate-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base md:text-lg text-white tracking-tight">
                Gestão de Fichas Técnicas & Lucratividade
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30">
                CMV & MARGEM
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Controle de custo dos pratos baseado nos insumos do estoque e margem de lucro
            </span>
          </div>
        </div>

        {/* Global KPI Summary Pills */}
        <div className="flex items-center gap-2 text-xs">
          <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Margem Média Geral</span>
            <span className="font-mono font-black text-emerald-400 text-sm">
              {avgMargin.toFixed(1)}%
            </span>
          </div>

          {highestProfitProduct && (
            <div className="hidden sm:block bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Maior Lucro Bruto</span>
              <span className="font-bold text-slate-200 text-xs truncate max-w-[140px] block">
                {highestProfitProduct.name} (+R$ {(highestProfitProduct.price - highestProfitProduct.costPrice).toFixed(2)})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main 2-Column Split: Left Catalog / Right Technical Sheet Details */}
      <div className="flex-1 grid grid-cols-12 gap-3 p-3 overflow-hidden">
        {/* Left Column: Lista de Pratos e Margens (7 colunas) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col bg-[#121929]/95 rounded-2xl border border-slate-800/90 shadow-xl overflow-hidden">
          {/* Search & Categories */}
          <div className="p-3 bg-slate-900/70 border-b border-slate-800 flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar prato por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {categories.slice(0, 4).map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    selectedCategory === c
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Table Header */}
          <div className="bg-[#182238] px-4 py-2 border-b border-slate-800 text-xs font-bold text-slate-300">
            <div className="grid grid-cols-12 gap-2 items-center">
              <span className="col-span-4 uppercase tracking-wider text-[11px] text-slate-400">Prato / Item</span>
              <span className="col-span-2 text-right uppercase tracking-wider text-[11px] text-slate-400">Preço Venda</span>
              <span className="col-span-2 text-right uppercase tracking-wider text-[11px] text-slate-400">Custo Insumos</span>
              <span className="col-span-2 text-right uppercase tracking-wider text-[11px] text-slate-400">Lucro Bruto</span>
              <span className="col-span-2 text-right uppercase tracking-wider text-[11px] text-slate-400">Margem (%)</span>
            </div>
          </div>

          {/* Product Items List */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-800/60 p-1">
            {eligibleProducts.map(p => {
              const metrics = getProductMetrics(p);
              const isSelected = selectedProduct?.id === p.id;
              const hasIngredients = p.ingredients && p.ingredients.length > 0;

              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectProduct(p)}
                  className={`grid grid-cols-12 gap-2 items-center px-4 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-orange-500/15 border border-orange-500/40 shadow-md'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="col-span-4 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold text-xs md:text-sm truncate ${isSelected ? 'text-orange-400' : 'text-slate-100'}`}>
                        {p.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <span>{p.category}</span>
                      {hasIngredients ? (
                        <span className="text-emerald-400 font-bold">· {p.ingredients?.length} insumos</span>
                      ) : (
                        <span className="text-slate-600">· Custo estimado</span>
                      )}
                    </div>
                  </div>

                  <div className="col-span-2 text-right font-mono font-bold text-xs md:text-sm text-slate-200 tabular-nums">
                    R$ {p.price.toFixed(2)}
                  </div>

                  <div className="col-span-2 text-right font-mono text-xs md:text-sm text-slate-400 tabular-nums">
                    R$ {p.costPrice.toFixed(2)}
                  </div>

                  <div className="col-span-2 text-right font-mono font-bold text-xs md:text-sm text-emerald-400 tabular-nums">
                    +R$ {metrics.profit.toFixed(2)}
                  </div>

                  <div className="col-span-2 text-right">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-extrabold ${
                      metrics.marginPercent >= 60 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : metrics.marginPercent >= 45 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {metrics.marginPercent.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detalhe da Ficha Técnica & Simulador de Preço (5 colunas) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col bg-[#121929]/95 rounded-2xl border border-slate-800/90 shadow-xl overflow-hidden">
          {selectedProduct && currentMetrics ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Product Header */}
              <div className="bg-[#182238] p-4 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400">
                    Ficha Técnica · {selectedProduct.category}
                  </span>
                  <button
                    onClick={handlePrintTechnicalSheet}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    title="Imprimir Ficha Técnica"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h2 className="font-black text-base md:text-lg text-white mt-1">
                  {selectedProduct.name}
                </h2>
                {selectedProduct.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {selectedProduct.description}
                  </p>
                )}
              </div>

              {/* Profit & Margin Highlights */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/60 border-b border-slate-800 text-center">
                <div className="bg-[#141b2e] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Custo (CMV)</span>
                  <span className="font-mono font-black text-sm text-rose-400 tabular-nums">
                    R$ {currentMetrics.cost.toFixed(2)}
                  </span>
                </div>

                <div className="bg-[#141b2e] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Lucro Bruto</span>
                  <span className="font-mono font-black text-sm text-emerald-400 tabular-nums">
                    R$ {currentMetrics.profit.toFixed(2)}
                  </span>
                </div>

                <div className="bg-[#141b2e] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Markup</span>
                  <span className="font-mono font-black text-sm text-orange-400 tabular-nums">
                    {currentMetrics.markup.toFixed(2)}x
                  </span>
                </div>
              </div>

              {/* Ingredients Breakdown */}
              <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 pb-1 border-b border-slate-800">
                  <span>Composição de Insumos da Porção</span>
                  <span>{selectedProduct.ingredients?.length || 0} ingredientes</span>
                </div>

                {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedProduct.ingredients.map((ing, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-white block">{ing.name}</span>
                          <span className="text-[10px] text-slate-400">Porção: {ing.quantity}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-300">
                            R$ {ing.unitCost.toFixed(2)}
                          </span>
                          <span className="text-[9px] text-slate-500 block">
                            {((ing.unitCost / currentMetrics.cost) * 100).toFixed(0)}% do custo
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-900/60 rounded-xl p-4 text-center text-xs text-slate-500">
                    <UtensilsCrossed className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                    <span>Insumos cadastrados genericamente com base no custo médio de aquisição.</span>
                  </div>
                )}

                {/* Margem Visual Bar */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Participação no Preço:</span>
                    <span className="font-mono font-bold text-white">
                      CMV {((currentMetrics.cost / currentMetrics.price) * 100).toFixed(0)}% · Margem {currentMetrics.marginPercent.toFixed(0)}%
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${Math.min(100, (currentMetrics.cost / currentMetrics.price) * 100)}%` }}
                      className="h-full bg-rose-500/80"
                      title="Custo da mercadoria"
                    />
                    <div
                      style={{ width: `${Math.max(0, currentMetrics.marginPercent)}%` }}
                      className="h-full bg-emerald-500"
                      title="Margem de lucro"
                    />
                  </div>
                </div>

                {/* Price Simulator */}
                <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/30 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-orange-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Simulador de Preço & Margem
                    </span>
                    <span className="font-mono font-black text-sm text-white">
                      R$ {simulatedPrice.toFixed(2)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={Math.ceil(currentMetrics.cost * 1.1)}
                    max={Math.ceil(currentMetrics.cost * 4)}
                    step={1}
                    value={simulatedPrice}
                    onChange={(e) => setSimulatedPrice(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Nova Margem: <strong className="text-emerald-400 font-mono">{currentMetrics.marginPercent.toFixed(1)}%</strong></span>
                    <span>Novo Lucro: <strong className="text-emerald-400 font-mono">+R$ {currentMetrics.profit.toFixed(2)}</strong></span>
                  </div>

                  {simulatedPrice !== selectedProduct.price && (
                    <button
                      onClick={handleApplySimulatedPrice}
                      className="w-full py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all pos-btn-press"
                    >
                      Salvar Novo Preço no Cardápio (R$ {simulatedPrice.toFixed(2)})
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-500 text-center text-xs">
              <Layers className="w-8 h-8 text-slate-700 mb-2" />
              <span>Selecione um prato para ver a ficha técnica.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
