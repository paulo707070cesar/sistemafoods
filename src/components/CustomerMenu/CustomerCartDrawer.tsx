import React from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Send, 
  MessageSquare, 
  UtensilsCrossed, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { useFoodSystem } from '../../context/FoodSystemContext';

export const CustomerCartDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { 
    customerCart, 
    customerSelectedTable, 
    customerName,
    setCustomerName,
    customerObservation, 
    setCustomerObservation, 
    updateCustomerCartQty, 
    removeFromCustomerCart, 
    clearCustomerCart, 
    submitCustomerOrder,
    playFeedbackSound 
  } = useFoodSystem();

  if (!isOpen) return null;

  const total = customerCart.reduce((acc, item) => acc + item.total, 0);

  const handleSubmit = () => {
    if (customerCart.length === 0) return;
    submitCustomerOrder();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-150 select-none">
      <div className="bg-[#121929] border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 bg-[#182238] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-base text-white">Revisar Pedido</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                {customerSelectedTable}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Confirme os itens antes de enviar para a cozinha
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-800/60">
          {customerCart.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
              <UtensilsCrossed className="w-8 h-8 text-slate-600 mb-2" />
              <span>Seu carrinho está vazio.</span>
            </div>
          ) : (
            customerCart.map((item) => (
              <div key={item.id} className="py-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-white truncate">
                    {item.name}
                  </div>
                  <div className="font-mono text-xs text-orange-400 mt-0.5 tabular-nums">
                    R$ {item.price.toFixed(2)} un · Total: R$ {item.total.toFixed(2)}
                  </div>
                  {item.observation && (
                    <div className="text-[11px] text-amber-400/90 italic mt-0.5 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 shrink-0" />
                      <span>{item.observation}</span>
                    </div>
                  )}
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
                    <button
                      onClick={() => updateCustomerCartQty(item.id, -1)}
                      className="w-7 h-7 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center hover:bg-slate-700 text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center font-mono font-bold text-xs text-white">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateCustomerCartQty(item.id, 1)}
                      className="w-7 h-7 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center hover:bg-slate-700 text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCustomerCart(item.id)}
                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="Remover item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Global Observation & Customer Name */}
        {customerCart.length > 0 && (
          <div className="p-4 bg-[#0e1628] border-t border-slate-800 space-y-3 shrink-0">
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                Observações gerais do pedido:
              </label>
              <textarea
                rows={2}
                value={customerObservation}
                onChange={(e) => setCustomerObservation(e.target.value)}
                placeholder="Ex: Trazer pratos e talheres adicionais, caprichar no gelo, etc..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Total Summary */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total a Lançar:</span>
              <span className="font-mono text-2xl font-black text-white tabular-nums">
                R$ {total.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Drawer Actions */}
        <div className="p-4 bg-[#141d30] border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={clearCustomerCart}
            disabled={customerCart.length === 0}
            className="px-3 py-3 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 disabled:opacity-40"
          >
            Limpar
          </button>

          <button
            onClick={handleSubmit}
            disabled={customerCart.length === 0}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 active:scale-[0.98] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-orange-500/30 disabled:opacity-40 disabled:cursor-not-allowed pos-btn-press"
          >
            <Send className="w-4 h-4" />
            <span>Enviar Pedido para a Cozinha</span>
          </button>
        </div>
      </div>
    </div>
  );
};
