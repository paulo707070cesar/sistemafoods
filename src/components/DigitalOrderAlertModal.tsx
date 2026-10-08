import React, { useState } from 'react';
import { 
  BellRing, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  Clock, 
  UtensilsCrossed, 
  X, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useFoodSystem } from '../context/FoodSystemContext';
import { DigitalOrder } from '../types';

export const DigitalOrderAlertModal: React.FC = () => {
  const { 
    pendingDigitalOrderToReview, 
    setPendingDigitalOrderToReview, 
    acceptDigitalOrder, 
    rejectDigitalOrder,
    openReceiptModal,
    playFeedbackSound 
  } = useFoodSystem();

  const [rejectReason, setRejectReason] = useState('Item em falta no estoque');
  const [rejecting, setRejecting] = useState(false);

  if (!pendingDigitalOrderToReview) return null;

  const order = pendingDigitalOrderToReview;

  const handleAccept = () => {
    acceptDigitalOrder(order.id);
  };

  const handleConfirmReject = () => {
    rejectDigitalOrder(order.id, rejectReason);
    setRejecting(false);
  };

  const handlePrint = () => {
    playFeedbackSound('click');
    openReceiptModal(undefined, {
      source: `${order.tableNumber} (PEDIDO DIGITAL)`,
      items: order.items,
      subtotal: order.total,
      serviceTax: order.total * 0.1,
      discount: 0,
      total: order.total * 1.1,
      waiter: 'Cardápio Digital QR',
      openedAt: order.createdAt
    });
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 select-none">
      <div className="bg-[#121929] border border-orange-500/50 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ring-4 ring-orange-500/20">
        {/* Urgent Alert Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-5 py-3.5 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white animate-bounce">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-white/80 block">
                Novo Pedido via QR Code
              </span>
              <h2 className="font-black text-lg text-white">
                {order.tableNumber} · {order.orderNumber}
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold block">{order.createdAt}</span>
            <span className="text-[10px] text-white/80">{order.customerName}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Customer & Table details */}
          <div className="bg-slate-900/90 rounded-2xl p-3.5 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Cliente solicitante:</span>
              <strong className="text-white text-sm">{order.customerName}</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Valor deste pedido:</span>
              <span className="font-mono font-black text-base text-orange-400 tabular-nums">
                R$ {order.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Items requested */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Itens Solicitados pelo Cliente</span>
              <span>{order.items.length} itens</span>
            </div>

            <div className="bg-slate-900/60 rounded-2xl p-3 border border-slate-800 divide-y divide-slate-800/80 max-h-52 overflow-y-auto">
              {order.items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-start justify-between text-xs">
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="font-bold text-white block text-sm">
                      {item.qty}x {item.name}
                    </span>
                    {item.observation && (
                      <span className="text-[11px] text-amber-400 flex items-center gap-1 mt-0.5 italic">
                        <MessageSquare className="w-3 h-3 shrink-0" />
                        {item.observation}
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-slate-200 tabular-nums shrink-0 text-sm">
                    R$ {item.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* General observation if any */}
          {order.observation && (
            <div className="bg-amber-950/30 border border-amber-800/40 rounded-2xl p-3 text-xs text-amber-200">
              <strong className="block text-amber-400 text-[11px] uppercase mb-0.5">
                Observações Gerais do Cliente:
              </strong>
              "{order.observation}"
            </div>
          )}

          {/* Rejection input box if rejecting */}
          {rejecting && (
            <div className="bg-rose-950/40 border border-rose-800/50 rounded-2xl p-3 space-y-2 animate-in fade-in duration-150">
              <span className="text-xs font-bold text-rose-300 block">
                Motivo da recusa do pedido:
              </span>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-200 focus:outline-none"
              >
                <option value="Item em falta no estoque">Item em falta no estoque</option>
                <option value="Cozinha encerrando turno">Cozinha encerrando turno</option>
                <option value="Mesa precisa confirmar presencialmente">Mesa precisa confirmar presencialmente</option>
              </select>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setRejecting(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmReject}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl"
                >
                  Confirmar Recusa
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Buttons: Aceitar Pedido, Recusar e Imprimir */}
        <div className="p-4 bg-[#182238] border-t border-slate-800 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRejecting(true)}
              disabled={rejecting}
              className="py-3 px-3.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/50 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>Recusar</span>
            </button>

            <button
              onClick={handlePrint}
              className="py-3 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Imprimir</span>
            </button>
          </div>

          <button
            onClick={handleAccept}
            className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-orange-500/30 transition-all pos-btn-press"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Aceitar e Enviar para Cozinha</span>
          </button>
        </div>
      </div>
    </div>
  );
};
