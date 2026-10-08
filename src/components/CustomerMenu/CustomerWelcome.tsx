import React from 'react';
import { 
  UtensilsCrossed, 
  QrCode, 
  Sparkles, 
  Users, 
  Clock, 
  ChevronRight, 
  ChevronDown,
  ChefHat
} from 'lucide-react';
import { useFoodSystem } from '../../context/FoodSystemContext';

export const CustomerWelcome: React.FC = () => {
  const { 
    customerSelectedTable, 
    setCustomerSelectedTable, 
    setCustomerScreenStep, 
    customerName,
    setCustomerName,
    tables,
    playFeedbackSound 
  } = useFoodSystem();

  const handleStart = () => {
    playFeedbackSound('click');
    setCustomerScreenStep('menu');
  };

  const currentTableObj = tables.find(t => t.number === customerSelectedTable);

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-[#0e1628] via-[#0b101c] to-[#080c16] text-slate-100 select-none">
      {/* Top Brand & Scan Indicator */}
      <div className="text-center pt-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-semibold mb-4">
          <QrCode className="w-3.5 h-3.5" />
          <span>Mesa conectada via QR Code</span>
        </div>

        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 mx-auto flex items-center justify-center text-white shadow-2xl shadow-orange-500/30 mb-3 border border-orange-400/30">
          <UtensilsCrossed className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight">
          Sistema <span className="text-orange-500">Food</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Bar & Restaurante · Cardápio Digital Interativo</p>
      </div>

      {/* Middle Card: Table Info & Diner Name */}
      <div className="bg-[#131b2e]/90 border border-slate-700/80 rounded-3xl p-5 shadow-xl space-y-4 my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">Você está na:</span>
          </div>

          {/* Table Switcher (for testing convenience) */}
          <div className="relative">
            <select
              value={customerSelectedTable}
              onChange={(e) => setCustomerSelectedTable(e.target.value)}
              className="bg-orange-500/20 border border-orange-500/40 text-orange-400 font-extrabold text-sm rounded-xl px-3 py-1 focus:outline-none cursor-pointer"
            >
              {tables.map(t => (
                <option key={t.id} value={t.number} className="bg-slate-900 text-slate-200">
                  {t.number} ({t.zone})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Users className="w-4 h-4 text-orange-400" />
            Atendimento:
          </span>
          <span className="font-semibold text-slate-200">
            {currentTableObj?.waiter || 'Marcos Vinicius'}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1.5 text-slate-400">
            <ChefHat className="w-4 h-4 text-orange-400" />
            Cozinha & Bar:
          </span>
          <span className="text-emerald-400 font-semibold">Pedidos em Tempo Real</span>
        </div>

        {/* Customer Name Input (Optional) */}
        <div className="pt-2 border-t border-slate-800/80">
          <label className="text-[11px] text-slate-400 block mb-1">
            Seu nome (para identificação do pedido):
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Ex: Rodrigo Silva"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Bottom Button: Abrir Cardápio */}
      <div className="space-y-3 pb-4">
        <button
          onClick={handleStart}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 active:scale-[0.98] text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-orange-500/30 transition-all pos-btn-press"
        >
          <span>Abrir Cardápio</span>
          <ChevronRight className="w-5 h-5" />
        </button>

        <p className="text-[11px] text-center text-slate-500">
          Faça seus pedidos sem esperar. Eles vão direto para a cozinha e bar!
        </p>
      </div>
    </div>
  );
};
