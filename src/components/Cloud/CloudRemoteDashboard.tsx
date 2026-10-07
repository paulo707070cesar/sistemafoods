import React, { useState } from 'react';
import { 
  Cloud, 
  RefreshCw, 
  LogOut, 
  CircleDollarSign, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  UtensilsCrossed, 
  Tablet, 
  Clock, 
  ShieldCheck, 
  Sliders, 
  CheckCircle2, 
  ChefHat, 
  Package,
  Layers,
  ArrowRightLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { useFoodSystem } from '../../context/FoodSystemContext';

export const CloudRemoteDashboard: React.FC = () => {
  const {
    transactions,
    tables,
    products,
    digitalOrders,
    cloudUser,
    cloudLogout,
    syncMode,
    setSyncMode,
    lastSyncTime,
    isSyncing,
    triggerSyncNow,
    syncQueue,
    setInterfaceMode,
    setActiveScreen,
    playFeedbackSound
  } = useFoodSystem();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'sync_settings'>('dashboard');

  // Real-time calculations from local server
  const faturamentoHoje = transactions.reduce((acc, t) => acc + t.total, 0);
  const ticketMedio = faturamentoHoje / Math.max(1, transactions.length);
  const ocupadas = tables.filter(t => t.status === 'ocupada');
  const criticalStock = products.filter(p => p.currentStock <= p.minStock);
  const emPreparoOrders = digitalOrders.filter(o => o.status === 'preparo' || o.status === 'aguardando');
  const pendingSync = syncQueue.filter(i => i.status === 'pendente').length;

  return (
    <div className="w-full h-screen bg-[#070a12] text-slate-100 flex flex-col select-none overflow-hidden">
      {/* Top Remote Header */}
      <header className="h-14 bg-[#0e1424] border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <UtensilsCrossed className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">
                Sistema <span className="text-orange-500">Food</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase flex items-center gap-1">
                <Cloud className="w-3 h-3" />
                <span>Nuvem Remota</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:block">
              {cloudUser?.email || 'dono@sistemafood.com.br'} · Servidor Matriz
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'dashboard' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Visão Geral Remota
          </button>
          <button
            onClick={() => setActiveTab('sync_settings')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'sync_settings' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Configurações de Sincronização
          </button>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          {/* Sincronizar Agora */}
          <button
            onClick={triggerSyncNow}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 pos-btn-press disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
          </button>

          {/* Manual de Instruções */}
          <button
            onClick={() => { 
              playFeedbackSound('click'); 
              setInterfaceMode('tablet'); 
              setActiveScreen('instrucoes'); 
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors"
            title="Ver Manual de Instruções de Todas as Telas"
          >
            <BookOpen className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden xl:inline">Manual de Uso</span>
          </button>

          {/* Switch back to restaurant tablet */}
          <button
            onClick={() => { playFeedbackSound('click'); setInterfaceMode('tablet'); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors"
            title="Ir para o tablet no restaurante"
          >
            <Tablet className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden lg:inline">Modo Salão</span>
          </button>

          {/* Logout */}
          <button
            onClick={cloudLogout}
            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
            title="Sair da Nuvem"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' ? (
          <>
            {/* Sync Timestamp Banner */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-300 font-medium">
                  Dados em tempo real espelhados do servidor local via Wi-Fi do restaurante
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 font-mono">
                <span>Última Sincronização: <strong className="text-orange-400">{lastSyncTime}</strong></span>
                <span>·</span>
                <span>Fila Local: <strong className="text-emerald-400">{pendingSync} pendentes</strong></span>
              </div>
            </div>

            {/* Live KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Card 1: Faturamento em Tempo Real */}
              <div className="bg-[#121929] border border-slate-800/90 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
                  <span>Faturamento Hoje (Ao Vivo)</span>
                  <CircleDollarSign className="w-4 h-4 text-orange-400" />
                </div>
                <div className="font-mono font-black text-2xl md:text-3xl text-white tracking-tight tabular-nums mt-1">
                  R$ {faturamentoHoje.toFixed(2)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mt-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Sincronizado</span>
                  <span className="text-slate-500 font-normal">com Caixa 01</span>
                </div>
              </div>

              {/* Card 2: Ticket Médio */}
              <div className="bg-[#121929] border border-slate-800/90 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
                  <span>Ticket Médio por Mesa</span>
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <div className="font-mono font-black text-2xl md:text-3xl text-white tracking-tight tabular-nums mt-1">
                  R$ {ticketMedio.toFixed(2)}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  <span>Baseado em {transactions.length} comandas pagas</span>
                </div>
              </div>

              {/* Card 3: Mesas Ocupadas */}
              <div className="bg-[#121929] border border-slate-800/90 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
                  <span>Mesas Ocupadas no Salão</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="font-mono font-black text-2xl md:text-3xl text-white tracking-tight tabular-nums mt-1">
                  {ocupadas.length} / {tables.length}
                </div>
                <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                  <span>Taxa de ocupação:</span>
                  <strong className="text-orange-400 font-mono">{((ocupadas.length / tables.length) * 100).toFixed(0)}%</strong>
                </div>
              </div>

              {/* Card 4: Alertas de Estoque Crítico */}
              <div className="bg-[#121929] border border-slate-800/90 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
                  <span>Alertas de Estoque Crítico</span>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="font-mono font-black text-2xl md:text-3xl text-amber-400 tracking-tight tabular-nums mt-1">
                  {criticalStock.length} itens
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  <span>Necessitam de compra / reposição</span>
                </div>
              </div>
            </div>

            {/* Live Sections Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              {/* Left Column (7 colunas): Mesas Ocupadas & Status dos Pedidos */}
              <div className="lg:col-span-7 bg-[#121929] border border-slate-800/90 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-400" />
                    <h2 className="font-bold text-sm md:text-base text-white">
                      Status das Mesas em Atendimento ({ocupadas.length} ativas)
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Espelho em tempo real</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {ocupadas.map(table => {
                    const totalMesa = table.items.reduce((s, i) => s + i.total, 0);
                    return (
                      <div key={table.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-white">{table.number}</span>
                          <span className="font-mono font-bold text-orange-400">R$ {totalMesa.toFixed(2)}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center justify-between">
                          <span>Garçom: {table.waiter?.split(' ')[0] || 'Atendente'}</span>
                          <span>{table.items.length} itens</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          Consumo: {table.items.map(i => i.name).slice(0, 2).join(', ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column (5 colunas): Pedidos no KDS Cozinha & Estoque */}
              <div className="lg:col-span-5 bg-[#121929] border border-slate-800/90 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-amber-400" />
                    <h2 className="font-bold text-sm md:text-base text-white">
                      Pedidos na Cozinha & Bar ({emPreparoOrders.length})
                    </h2>
                  </div>
                  <span className="text-xs text-amber-400 font-mono">Em preparo</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {emPreparoOrders.map(order => (
                    <div key={order.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-xs flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{order.tableNumber}</span>
                          <span className="text-[10px] font-mono text-orange-400">{order.orderNumber}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{order.items.length} itens · Cliente: {order.customerName}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* ================= TELA DE CONFIGURAÇÕES DE SINCRONIZAÇÃO ================= */
          <div className="bg-[#121929] border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-6 max-w-3xl mx-auto">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="font-black text-lg text-white">
                Configurações de Sincronização em Nuvem
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Defina como e quando os dados do servidor local do restaurante são transmitidos para a Nuvem Central.
              </p>
            </div>

            {/* Sync Mode Radio Options */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Frequência de Envio de Dados:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setSyncMode('auto')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    syncMode === 'auto'
                      ? 'bg-orange-500/15 border-orange-500 text-white shadow-lg shadow-orange-500/20'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">Sincronizar Automaticamente</span>
                    <span className={`w-3 h-3 rounded-full border ${syncMode === 'auto' ? 'bg-orange-500 border-white' : 'border-slate-600'}`}></span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Transmite cada pedido, recebimento e baixa de estoque instantaneamente via internet em segundo plano.
                  </p>
                </div>

                <div
                  onClick={() => setSyncMode('manual')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    syncMode === 'manual'
                      ? 'bg-orange-500/15 border-orange-500 text-white shadow-lg shadow-orange-500/20'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">Sincronização Manual</span>
                    <span className={`w-3 h-3 rounded-full border ${syncMode === 'manual' ? 'bg-orange-500 border-white' : 'border-slate-600'}`}></span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Armazena os pacotes localmente e aguarda o clique manual do gerente no botão "Sincronizar Agora".
                  </p>
                </div>
              </div>
            </div>

            {/* Sync Logs Table */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 pb-1 border-b border-slate-800">
                <span>Histórico de Pacotes e Logs de Sincronização</span>
                <span className="text-orange-400 font-mono">Última Sincronização: {lastSyncTime}</span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl divide-y divide-slate-800/80 text-xs">
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white block">Pacote #SYNC-8891 (38 transações)</span>
                    <span className="text-[11px] text-slate-400">Fechamentos de caixa e comandas salão</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold block">100% Sucesso</span>
                    <span className="text-[10px] text-slate-500 font-mono">Hoje às {lastSyncTime}</span>
                  </div>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white block">Pacote #SYNC-8890 (14 pedidos)</span>
                    <span className="text-[11px] text-slate-400">Baixas de insumos e fichas técnicas</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold block">100% Sucesso</span>
                    <span className="text-[10px] text-slate-500 font-mono">Hoje às 13:50</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Force Sync Action */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Pressione para sincronizar todos os registros pendentes neste instante.
              </span>

              <button
                onClick={triggerSyncNow}
                disabled={isSyncing}
                className="py-2.5 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/25 pos-btn-press disabled:opacity-40"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
