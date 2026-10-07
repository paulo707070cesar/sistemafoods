import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  BellRing, 
  UtensilsCrossed, 
  ArrowLeft, 
  Plus, 
  ReceiptText,
  AlertCircle,
  Wifi,
  Cloud
} from 'lucide-react';
import { useFoodSystem } from '../../context/FoodSystemContext';
import { DigitalOrderStatus } from '../../types';

export const CustomerOrderStatus: React.FC = () => {
  const { 
    digitalOrders, 
    lastCustomerOrderId, 
    customerSelectedTable, 
    setCustomerScreenStep, 
    wifiSSID,
    internetStatus,
    addToast, 
    playFeedbackSound 
  } = useFoodSystem();

  // Find the customer's last order or any active order on this table
  const currentOrder = digitalOrders.find(o => o.id === lastCustomerOrderId) ||
                       digitalOrders.find(o => o.tableNumber === customerSelectedTable);

  const handleCallWaiter = () => {
    playFeedbackSound('bell');
    addToast('info', '🔔 Garçom Notificado', `O garçom já foi avisado e virá até a ${customerSelectedTable}!`);
  };

  const handleRequestBill = () => {
    playFeedbackSound('click');
    setCustomerScreenStep('pagamento');
  };


  if (!currentOrder) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-[#0b101c]">
        <UtensilsCrossed className="w-12 h-12 text-slate-600 mb-3" />
        <h2 className="font-bold text-white text-base">Nenhum pedido ativo</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Você ainda não enviou nenhum pedido digital para a {customerSelectedTable}.
        </p>
        <button
          onClick={() => setCustomerScreenStep('menu')}
          className="mt-4 px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs"
        >
          Explorar Cardápio
        </button>
      </div>
    );
  }

  // Define step index
  const statusSteps: { key: DigitalOrderStatus; label: string; desc: string }[] = [
    { key: 'aguardando', label: '1. Pedido Recebido', desc: 'Aguardando aprovação do restaurante' },
    { key: 'preparo', label: '2. Em Preparo', desc: 'Cozinha e Bar preparando seus itens' },
    { key: 'pronto', label: '3. Pronto para Servir', desc: 'Garçom a caminho da mesa' },
    { key: 'servido', label: '4. Servido', desc: 'Bom apetite!' },
  ];

  const getStepIndex = (status: DigitalOrderStatus) => {
    switch (status) {
      case 'aguardando': return 0;
      case 'preparo': return 1;
      case 'pronto': return 2;
      case 'servido': return 3;
      default: return 0;
    }
  };

  const activeStepIdx = getStepIndex(currentOrder.status);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b101c] text-slate-100 overflow-y-auto select-none p-4 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          onClick={() => setCustomerScreenStep('menu')}
          className="p-1 text-slate-400 hover:text-white flex items-center gap-1 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cardápio</span>
        </button>

        <div className="text-right">
          <span className="font-black text-sm text-white">{customerSelectedTable}</span>
          <span className="text-[10px] text-orange-400 font-mono block">{currentOrder.orderNumber}</span>
        </div>
      </div>

      {/* Wi-Fi Local Confirmation Banner */}
      <div className="my-3 bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-500/30 rounded-2xl p-3 flex items-center gap-3 text-xs">
        <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
          <Wifi className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-black text-white text-xs block">
            Pedido enviado via Wi-Fi para a cozinha! 🍳
          </span>
          <span className="text-[10px] text-slate-400">
            Conectado à rede <strong className="text-slate-300 font-mono">{wifiSSID}</strong> · Latência 1.8ms
          </span>
        </div>
      </div>

      {/* Hero Status Badge */}
      <div className="my-5 text-center">
        <div className="w-16 h-16 rounded-3xl bg-orange-500/15 border border-orange-500/30 text-orange-400 mx-auto flex items-center justify-center shadow-lg shadow-orange-500/20 mb-3 animate-pulse">
          {currentOrder.status === 'preparo' ? (
            <ChefHat className="w-8 h-8 text-orange-400" />
          ) : currentOrder.status === 'pronto' ? (
            <BellRing className="w-8 h-8 text-emerald-400" />
          ) : (
            <Clock className="w-8 h-8 text-orange-400" />
          )}
        </div>

        <h2 className="font-black text-xl text-white">
          {currentOrder.status === 'aguardando' && 'Pedido em Aprovação'}
          {currentOrder.status === 'preparo' && 'Em Preparo na Cozinha'}
          {currentOrder.status === 'pronto' && 'Pronto para Servir!'}
          {currentOrder.status === 'servido' && 'Pedido Concluído'}
          {currentOrder.status === 'recusado' && 'Pedido Recusado'}
        </h2>

        <p className="text-xs text-slate-400 mt-1">
          Enviado às <strong className="text-slate-200">{currentOrder.createdAt}</strong> · Total: <strong className="text-orange-400 font-mono">R$ {currentOrder.total.toFixed(2)}</strong>
        </p>
      </div>

      {/* Progress Timeline */}
      <div className="bg-[#121929] border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-4 mb-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-800">
          Acompanhamento do Pedido
        </div>

        <div className="space-y-4 relative">
          {/* Vertical connecting line */}
          <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-800 -z-0"></div>

          {statusSteps.map((step, idx) => {
            const isCompleted = activeStepIdx > idx;
            const isCurrent = activeStepIdx === idx;

            return (
              <div key={step.key} className="flex items-start gap-3 relative z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border transition-all ${
                  isCurrent
                    ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/40 ring-4 ring-orange-500/20'
                    : isCompleted
                    ? 'bg-emerald-500 border-emerald-400 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-bold ${isCurrent ? 'text-orange-400' : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                    {step.label}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {step.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items list in this order */}
      <div className="bg-[#121929] border border-slate-800/80 rounded-3xl p-4 shadow-xl space-y-2 mb-4">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400 pb-2 border-b border-slate-800">
          <span>Itens Solicitados</span>
          <span>{currentOrder.items.length} itens</span>
        </div>

        <div className="divide-y divide-slate-800/60 text-xs">
          {currentOrder.items.map(item => (
            <div key={item.id} className="py-2 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">{item.qty}x {item.name}</span>
                {item.observation && (
                  <span className="text-[11px] text-amber-400 block italic">({item.observation})</span>
                )}
              </div>
              <span className="font-mono text-slate-300 tabular-nums">R$ {item.total.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {currentOrder.observation && (
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            <strong>Observações do cliente:</strong> {currentOrder.observation}
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={() => setCustomerScreenStep('menu')}
          className="w-full py-3.5 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 pos-btn-press"
        >
          <Plus className="w-4 h-4" />
          <span>Fazer Novo Pedido / Mais Bebidas</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCallWaiter}
            className="py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700"
          >
            <BellRing className="w-3.5 h-3.5 text-orange-400" />
            <span>Chamar Garçom</span>
          </button>

          <button
            onClick={handleRequestBill}
            className="py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700"
          >
            <ReceiptText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pedir a Conta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
