import React, { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Flame, 
  Beer, 
  Utensils, 
  Filter, 
  Volume2, 
  RefreshCw,
  BellRing
} from 'lucide-react';
import { useFoodSystem } from '../context/FoodSystemContext';
import { DigitalOrder, DigitalOrderStatus } from '../types';

export const KDSScreen: React.FC = () => {
  const { 
    digitalOrders, 
    updateDigitalOrderStatus, 
    acceptDigitalOrder, 
    openReceiptModal, 
    playFeedbackSound,
    addToast 
  } = useFoodSystem();

  // Tick every second for live timers
  const [now, setNow] = useState(Date.now());
  const [activeFilter, setActiveFilter] = useState<'todos' | 'cozinha' | 'bar'>('todos');

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter orders
  const filteredOrders = digitalOrders.filter(order => {
    if (order.status === 'recusado') return false;
    if (activeFilter === 'todos') return true;
    if (activeFilter === 'bar') {
      return order.items.some(i => i.name.toLowerCase().includes('chopp') || i.name.toLowerCase().includes('cerveja') || i.name.toLowerCase().includes('refrigerante') || i.name.toLowerCase().includes('suco') || i.name.toLowerCase().includes('água') || i.name.toLowerCase().includes('drink') || i.name.toLowerCase().includes('vinho') || i.name.toLowerCase().includes('gin'));
    }
    if (activeFilter === 'cozinha') {
      return order.items.some(i => !i.name.toLowerCase().includes('chopp') && !i.name.toLowerCase().includes('cerveja') && !i.name.toLowerCase().includes('refrigerante') && !i.name.toLowerCase().includes('água'));
    }
    return true;
  });

  const recebidos = filteredOrders.filter(o => o.status === 'aguardando');
  const emPreparo = filteredOrders.filter(o => o.status === 'preparo');
  const prontos = filteredOrders.filter(o => o.status === 'pronto');

  // Calculates elapsed time & if overdue
  const getTimerInfo = (order: DigitalOrder) => {
    const start = order.createdAtTimestamp || (Date.now() - 5 * 60 * 1000);
    const elapsedSeconds = Math.max(0, Math.floor((now - start) / 1000));
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    const maxMins = order.maxPreparationMinutes || 15;
    const isOverdue = mins >= maxMins;

    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return { mins, secs, isOverdue, formatted, maxMins };
  };

  const overdueCount = emPreparo.filter(o => getTimerInfo(o).isOverdue).length;

  const handleMarkPronto = (orderId: string, tableNumber: string) => {
    playFeedbackSound('bell');
    updateDigitalOrderStatus(orderId, 'pronto');
    addToast('success', 'Prato Pronto!', `Pedido da ${tableNumber} pronto para servir na mesa.`);
  };

  const handlePrint = (order: DigitalOrder) => {
    playFeedbackSound('click');
    openReceiptModal(undefined, {
      source: `${order.tableNumber} (KDS COZINHA)`,
      items: order.items,
      subtotal: order.total,
      serviceTax: 0,
      discount: 0,
      total: order.total,
      waiter: order.customerName,
      openedAt: order.createdAt
    });
  };

  const renderOrderCard = (order: DigitalOrder, stage: DigitalOrderStatus) => {
    const { mins, isOverdue, formatted, maxMins } = getTimerInfo(order);

    // Styling logic: if overdue, turns intense red!
    let cardStyle = 'border-slate-800 bg-[#121929]';
    let timerBadgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';

    if (isOverdue && stage === 'preparo') {
      cardStyle = 'border-rose-500/90 bg-gradient-to-b from-[#2b111a] via-[#1a0f16] to-[#121929] ring-2 ring-rose-500 shadow-2xl shadow-rose-500/30 animate-pulse';
      timerBadgeStyle = 'bg-rose-500 text-white font-black border-rose-400 shadow-md shadow-rose-500/50';
    } else if (stage === 'aguardando') {
      cardStyle = 'border-orange-500/50 bg-gradient-to-b from-[#1f1624] to-[#121929] ring-1 ring-orange-500/20';
      timerBadgeStyle = 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    } else if (stage === 'preparo') {
      cardStyle = 'border-amber-500/40 bg-[#141c2e]';
      timerBadgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold';
    } else if (stage === 'pronto') {
      cardStyle = 'border-emerald-500/50 bg-[#111f24]';
      timerBadgeStyle = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }

    return (
      <div
        key={order.id}
        className={`rounded-2xl p-4 border flex flex-col justify-between transition-all relative shadow-xl min-h-[220px] ${cardStyle}`}
      >
        {/* Header with Table & Live Timer */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg text-white tracking-tight">
                {order.tableNumber}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-orange-400 font-bold border border-slate-700">
                {order.orderNumber}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">
              Cliente: {order.customerName}
            </span>
          </div>

          {/* Chronometer Timer */}
          <div className="text-right">
            <div className={`px-2.5 py-1 rounded-xl text-xs font-mono font-black flex items-center gap-1.5 border tabular-nums ${timerBadgeStyle}`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{formatted}</span>
            </div>
            {isOverdue && stage === 'preparo' && (
              <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest mt-1 block flex items-center justify-end gap-0.5">
                <AlertTriangle className="w-3 h-3" /> ATRASADO (&gt;{maxMins}m)
              </span>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="py-3 space-y-2.5 flex-1">
          {order.items.map((it) => (
            <div key={it.id} className="text-xs">
              <div className="flex items-baseline justify-between font-bold text-white">
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 font-black flex items-center justify-center text-xs shrink-0 border border-orange-500/30">
                    {it.qty}x
                  </span>
                  <span className="text-sm">{it.name}</span>
                </span>
              </div>
              {it.observation && (
                <div className="text-[11px] text-amber-300 italic pl-8 mt-1 font-medium bg-amber-950/20 py-0.5 px-1.5 rounded border border-amber-900/30">
                  Obs: {it.observation}
                </div>
              )}
            </div>
          ))}

          {order.observation && (
            <div className="mt-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-amber-200">
              <strong className="text-orange-400">Instruções gerais:</strong> {order.observation}
            </div>
          )}
        </div>

        {/* Action Buttons for Kitchen Staff */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <button
            onClick={() => handlePrint(order)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
            title="Imprimir Comanda da Bancada"
          >
            <Printer className="w-4 h-4" />
          </button>

          {stage === 'aguardando' && (
            <button
              onClick={() => acceptDigitalOrder(order.id)}
              className="flex-1 py-3 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 pos-btn-press"
            >
              <ChefHat className="w-4 h-4" />
              <span>Aceitar e Iniciar</span>
            </button>
          )}

          {stage === 'preparo' && (
            <button
              onClick={() => handleMarkPronto(order.id, order.tableNumber)}
              className="flex-1 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 pos-btn-press"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Pronto (Finalizar)</span>
            </button>
          )}

          {stage === 'pronto' && (
            <button
              onClick={() => updateDigitalOrderStatus(order.id, 'servido')}
              className="flex-1 py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 pos-btn-press"
            >
              <Utensils className="w-4 h-4" />
              <span>Servir na Mesa</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#0b101c] overflow-hidden select-none">
      {/* Top Bar KDS Header */}
      <div className="bg-[#121929] border-b border-slate-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base md:text-lg text-white tracking-tight">
                KDS — Monitor da Cozinha
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30">
                CRONÔMETRO ATIVO
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Controle de preparo com alerta vermelho para pedidos atrasados (&gt;15 min)
            </span>
          </div>
        </div>

        {/* Filter Station & Status Counters */}
        <div className="flex items-center gap-2.5">
          {/* Station filter */}
          <div className="flex items-center p-0.5 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveFilter('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFilter === 'todos' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({filteredOrders.length})
            </button>
            <button
              onClick={() => setActiveFilter('cozinha')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeFilter === 'cozinha' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Cozinha</span>
            </button>
            <button
              onClick={() => setActiveFilter('bar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeFilter === 'bar' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Beer className="w-3.5 h-3.5" />
              <span>Bar & Bebidas</span>
            </button>
          </div>

          {/* Overdue alert badge */}
          {overdueCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-rose-500/40 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              <span>{overdueCount} ATRASADO{overdueCount > 1 ? 'S' : ''}!</span>
            </div>
          )}
        </div>
      </div>

      {/* 3 Columns Kanban Board */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-3 p-3 overflow-hidden">
        {/* Column 1: Recebidos / Pendentes */}
        <div className="min-h-0 flex flex-col bg-[#0e1526] rounded-2xl border border-slate-800/90 shadow-xl overflow-hidden">
          <div className="p-3.5 bg-[#162035] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
              <span className="font-extrabold text-xs uppercase tracking-wider text-white">
                1. Recebidos ({recebidos.length})
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Aguardando aceite</span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
            {recebidos.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-xs text-slate-500 text-center">
                <ChefHat className="w-8 h-8 text-slate-700 mb-2" />
                <span>Nenhum pedido pendente de aceite.</span>
              </div>
            ) : (
              recebidos.map(o => renderOrderCard(o, 'aguardando'))
            )}
          </div>
        </div>

        {/* Column 2: Em Preparo (com cronômetro e alerta vermelho de estouro) */}
        <div className="flex flex-col bg-[#0e1526] rounded-2xl border border-slate-800/90 shadow-xl overflow-hidden">
          <div className="p-3.5 bg-[#162035] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="font-extrabold text-xs uppercase tracking-wider text-white">
                2. Em Preparo ({emPreparo.length})
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-400">
              Limite: 15 min
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
            {emPreparo.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-xs text-slate-500 text-center">
                <Clock className="w-8 h-8 text-slate-700 mb-2" />
                <span>Nenhum pedido na grelha ou bancada.</span>
              </div>
            ) : (
              emPreparo.map(o => renderOrderCard(o, 'preparo'))
            )}
          </div>
        </div>

        {/* Column 3: Pronto para Servir */}
        <div className="flex flex-col bg-[#0e1526] rounded-2xl border border-slate-800/90 shadow-xl overflow-hidden">
          <div className="p-3.5 bg-[#162035] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="font-extrabold text-xs uppercase tracking-wider text-white">
                3. Prontos na Bancada ({prontos.length})
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold">
              Avisar garçom
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
            {prontos.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-xs text-slate-500 text-center">
                <CheckCircle2 className="w-8 h-8 text-slate-700 mb-2" />
                <span>Nenhum prato aguardando garçom.</span>
              </div>
            ) : (
              prontos.map(o => renderOrderCard(o, 'pronto'))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
