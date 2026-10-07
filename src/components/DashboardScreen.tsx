import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CircleDollarSign, 
  Receipt, 
  Users, 
  AlertTriangle, 
  Award, 
  Calendar, 
  ArrowUpRight, 
  Package, 
  Sparkles, 
  PieChart as PieChartIcon,
  ChevronRight,
  Clock
} from 'lucide-react';
import { useFoodSystem } from '../context/FoodSystemContext';

type TimeFilter = 'hoje' | 'semana' | 'mes';

export const DashboardScreen: React.FC = () => {
  const { 
    transactions, 
    products, 
    tables, 
    setActiveScreen, 
    playFeedbackSound 
  } = useFoodSystem();

  const [period, setPeriod] = useState<TimeFilter>('hoje');

  // Filter multiplier based on selected period
  const multiplier = period === 'hoje' ? 1 : period === 'semana' ? 6.4 : 26.8;

  // Real data calculations
  const totalBaseTransactions = transactions.reduce((acc, t) => acc + t.total, 0);
  const totalRevenue = totalBaseTransactions * multiplier;
  const totalCount = Math.max(1, Math.round(transactions.length * multiplier));
  const ticketMedio = totalRevenue / totalCount;

  // Critical stock items
  const criticalStock = products.filter(p => p.currentStock <= p.minStock);

  // Top 5 Pratos / Itens Mais Vendidos (Mocked / Derived with real names)
  const topDishes = [
    { rank: 1, name: 'Picanha na Chapa c/ Mandioca', category: 'Pratos Principais', qty: Math.round(38 * multiplier), revenue: 89.90 * Math.round(38 * multiplier), percent: 100 },
    { rank: 2, name: 'Chopp Artesanal IPA 500ml', category: 'Bebidas', qty: Math.round(142 * multiplier), revenue: 14.00 * Math.round(142 * multiplier), percent: 82 },
    { rank: 3, name: 'Batata Frita Especial Bacon', category: 'Petiscos', qty: Math.round(54 * multiplier), revenue: 34.90 * Math.round(54 * multiplier), percent: 68 },
    { rank: 4, name: 'Dadinho de Tapioca c/ Geléia', category: 'Petiscos', qty: Math.round(41 * multiplier), revenue: 32.00 * Math.round(41 * multiplier), percent: 55 },
    { rank: 5, name: 'Filé de Salmão c/ Alcaparras', category: 'Pratos Principais', qty: Math.round(23 * multiplier), revenue: 79.00 * Math.round(23 * multiplier), percent: 46 },
  ];

  // Sales by Category for Donut Chart
  const categorySales = [
    { name: 'Pratos Principais', value: 42, color: '#f97316' }, // orange-500
    { name: 'Bebidas & Chopp', value: 31, color: '#3b82f6' },   // blue-500
    { name: 'Petiscos', value: 18, color: '#10b981' },          // emerald-500
    { name: 'Sobremesas', value: 9, color: '#ec4899' },         // pink-500
  ];

  // Hourly / Day sales for Bar Chart
  const barData = period === 'hoje' ? [
    { label: '11h-13h (Almoço)', value: 1420 * multiplier, height: 60 },
    { label: '13h-15h (Tarde)', value: 890 * multiplier, height: 38 },
    { label: '17h-19h (Happy Hour)', value: 2150 * multiplier, height: 85 },
    { label: '19h-21h (Pico Jantar)', value: 2840 * multiplier, height: 100 },
    { label: '21h-23h (Noite)', value: 1980 * multiplier, height: 72 },
    { label: '23h-01h (Bar/Fechamento)', value: 960 * multiplier, height: 42 },
  ] : period === 'semana' ? [
    { label: 'Seg', value: 2400, height: 35 },
    { label: 'Ter', value: 2900, height: 42 },
    { label: 'Qua', value: 3800, height: 55 },
    { label: 'Qui', value: 4600, height: 66 },
    { label: 'Sex', value: 7800, height: 95 },
    { label: 'Sáb', value: 8900, height: 100 },
    { label: 'Dom', value: 6200, height: 78 },
  ] : [
    { label: 'Semana 1', value: 22400, height: 72 },
    { label: 'Semana 2', value: 25900, height: 84 },
    { label: 'Semana 3', value: 29800, height: 96 },
    { label: 'Semana 4', value: 31200, height: 100 },
  ];

  const handlePeriodChange = (p: TimeFilter) => {
    playFeedbackSound('click');
    setPeriod(p);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] bg-[#0b101c] overflow-y-auto select-none p-3 md:p-4 space-y-4">
      {/* Top Header with Period Filter Tabs */}
      <div className="bg-[#121929] border border-slate-800/80 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base md:text-lg text-white tracking-tight">
                Dashboard Executivo do Dono
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30">
                VISÃO GERENCIAL
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Métricas financeiras consolidadas, ranking de pratos e desempenho da operação
            </span>
          </div>
        </div>

        {/* Filter Period Tabs */}
        <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800">
          {(['hoje', 'semana', 'mes'] as TimeFilter[]).map((tab) => {
            const isActive = period === tab;
            const label = tab === 'hoje' ? 'Hoje' : tab === 'semana' ? 'Esta Semana' : 'Este Mês';
            return (
              <button
                key={tab}
                onClick={() => handlePeriodChange(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Highlight Cards (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Faturamento do Dia */}
        <div className="bg-[#121929] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
              <span>{period === 'hoje' ? 'Faturamento do Dia' : period === 'semana' ? 'Faturamento da Semana' : 'Faturamento do Mês'}</span>
              <CircleDollarSign className="w-4 h-4 text-orange-400" />
            </div>
            <div className="font-mono font-black text-2xl md:text-3xl text-white tracking-tight tabular-nums mt-1">
              R$ {totalRevenue.toFixed(2)}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mt-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4%</span>
            <span className="text-slate-500 font-normal">vs período anterior</span>
          </div>
        </div>

        {/* Card 2: Ticket Médio */}
        <div className="bg-[#121929] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
              <span>Ticket Médio por Mesa</span>
              <Receipt className="w-4 h-4 text-blue-400" />
            </div>
            <div className="font-mono font-black text-2xl md:text-3xl text-white tracking-tight tabular-nums mt-1">
              R$ {ticketMedio.toFixed(2)}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mt-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+7.2%</span>
            <span className="text-slate-500 font-normal">consumo por comanda</span>
          </div>
        </div>

        {/* Card 3: Total Pedidos & Mesas Atendidas */}
        <div className="bg-[#121929] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
              <span>Atendimentos Concluídos</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-mono font-black text-2xl md:text-3xl text-white tracking-tight tabular-nums mt-1">
              {totalCount}
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-3 flex items-center justify-between">
            <span>Mesas e Comandas</span>
            <span className="font-bold text-slate-300">100% liquidadas</span>
          </div>
        </div>

        {/* Card 4: Alertas de Estoque Crítico */}
        <div className="bg-[#121929] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
              <span>Estoque Crítico / Baixo</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="font-mono font-black text-2xl md:text-3xl text-amber-400 tracking-tight tabular-nums mt-1 flex items-baseline gap-2">
              <span>{criticalStock.length}</span>
              <span className="text-xs font-normal text-slate-400">itens requerem reposição</span>
            </div>
          </div>
          <button
            onClick={() => setActiveScreen('estoque')}
            className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 mt-3"
          >
            <span>Ver no Almoxarifado</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Charts & Rankings Row (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left Column (7 colunas): Gráfico de Barras por Período */}
        <div className="lg:col-span-7 bg-[#121929] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="font-bold text-sm md:text-base text-white">
                {period === 'hoje' ? 'Faturamento por Faixa Horária' : period === 'semana' ? 'Faturamento Diário da Semana' : 'Evolução Semanal do Mês'}
              </h2>
              <span className="text-[11px] text-slate-400">Volume de vendas em Reais (R$)</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <span>Receita</span>
            </div>
          </div>

          {/* Bar Chart Visualization (Pure SVG / CSS) */}
          <div className="pt-6 pb-2 flex-1 flex flex-col justify-end">
            <div className="h-52 flex items-end justify-between gap-2 md:gap-4 px-2">
              {barData.map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="font-mono text-[10px] font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                    R$ {bar.value >= 1000 ? `${(bar.value / 1000).toFixed(1)}k` : bar.value.toFixed(0)}
                  </span>
                  <div
                    style={{ height: `${bar.height}%` }}
                    className="w-full max-w-[42px] bg-gradient-to-t from-orange-600 to-amber-500 group-hover:from-orange-500 group-hover:to-amber-400 rounded-t-lg transition-all duration-300 relative shadow-md shadow-orange-500/20"
                  ></div>
                  <span className="text-[10px] md:text-[11px] text-slate-400 text-center font-medium truncate max-w-[65px] md:max-w-none">
                    {bar.label.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 colunas): Gráfico de Rosca - Mix de Vendas por Categoria */}
        <div className="lg:col-span-5 bg-[#121929] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="font-bold text-sm md:text-base text-white">
              Mix de Vendas por Categoria
            </h2>
            <span className="text-[11px] text-slate-400">Distribuição percentual do faturamento</span>
          </div>

          {/* Donut Chart SVG */}
          <div className="my-auto py-4 flex items-center justify-around gap-4">
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {/* Background Ring */}
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#1e293b" strokeWidth="4" />
                {/* Pratos Principais 42% */}
                <circle
                  cx="18" cy="18" r="15.9155" fill="none"
                  stroke="#f97316" strokeWidth="4.2"
                  strokeDasharray="42 58" strokeDashoffset="0"
                />
                {/* Bebidas 31% */}
                <circle
                  cx="18" cy="18" r="15.9155" fill="none"
                  stroke="#3b82f6" strokeWidth="4.2"
                  strokeDasharray="31 69" strokeDashoffset="-42"
                />
                {/* Petiscos 18% */}
                <circle
                  cx="18" cy="18" r="15.9155" fill="none"
                  stroke="#10b981" strokeWidth="4.2"
                  strokeDasharray="18 82" strokeDashoffset="-73"
                />
                {/* Sobremesas 9% */}
                <circle
                  cx="18" cy="18" r="15.9155" fill="none"
                  stroke="#ec4899" strokeWidth="4.2"
                  strokeDasharray="9 91" strokeDashoffset="-91"
                />
              </svg>
              {/* Inner Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Líder</span>
                <span className="font-black text-sm text-white">Pratos</span>
                <span className="text-[10px] text-orange-400 font-mono">42%</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="space-y-2 text-xs flex-1">
              {categorySales.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-slate-300 font-medium">{cat.name}</span>
                  </div>
                  <span className="font-mono font-bold text-white tabular-nums">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 text-center">
            Pratos Principais e Chopps representam 73% da receita líquida.
          </div>
        </div>
      </div>

      {/* Bottom Row: Top 5 Pratos Mais Vendidos & Alertas Críticos (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pb-6">
        {/* Top 5 Pratos (8 Colunas) */}
        <div className="lg:col-span-8 bg-[#121929] border border-slate-800/90 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-400" />
              <h2 className="font-bold text-sm md:text-base text-white">
                Top 5 Pratos Mais Vendidos ({period === 'hoje' ? 'Hoje' : period === 'semana' ? 'Na Semana' : 'No Mês'})
              </h2>
            </div>
            <span className="text-xs text-slate-400">Classificação por volume</span>
          </div>

          <div className="divide-y divide-slate-800/60 pt-1">
            {topDishes.map((dish) => (
              <div key={dish.rank} className="py-2.5 flex items-center gap-3">
                {/* Ranking Medal */}
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                  dish.rank === 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  dish.rank === 2 ? 'bg-slate-700/60 text-slate-200 border border-slate-600' :
                  dish.rank === 3 ? 'bg-orange-800/40 text-orange-300 border border-orange-700/50' :
                  'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {dish.rank}º
                </div>

                {/* Dish Info & Bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs md:text-sm font-bold text-white mb-1">
                    <span className="truncate pr-2">{dish.name}</span>
                    <span className="font-mono text-orange-400 shrink-0 tabular-nums">
                      R$ {dish.revenue.toFixed(2)}
                    </span>
                  </div>

                  {/* Volume Bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${dish.percent}%` }}
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                      />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 tabular-nums shrink-0">
                      {dish.qty} pedidos
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas de Estoque Crítico (4 Colunas) */}
        <div className="lg:col-span-4 bg-[#121929] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h2 className="font-bold text-sm md:text-base text-white">
                  Estoque Crítico ({criticalStock.length})
                </h2>
              </div>
              <span className="text-[10px] text-amber-400 font-bold uppercase">Reposição Imediata</span>
            </div>

            <div className="space-y-2 pt-2 max-h-56 overflow-y-auto">
              {criticalStock.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-2.5 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-white block truncate">{p.name}</span>
                    <span className="text-[10px] text-slate-400">Mínimo: {p.minStock} {p.unit}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-black text-xs text-rose-400 tabular-nums block">
                      {p.currentStock} {p.unit}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-rose-400/80">
                      {p.currentStock === 0 ? 'Zerado' : 'Crítico'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveScreen('estoque')}
            className="w-full mt-3 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 flex items-center justify-center gap-1.5 pos-btn-press"
          >
            <Package className="w-4 h-4" />
            <span>Gerenciar Estoque Completo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
