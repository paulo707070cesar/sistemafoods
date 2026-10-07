import React from 'react';
import { Wifi, Send, CheckCircle2, ArrowRight } from 'lucide-react';
import { useFoodSystem } from '../../context/FoodSystemContext';

export const WifiFlightToast: React.FC = () => {
  const { wifiTransmissionFeedback } = useFoodSystem();

  if (!wifiTransmissionFeedback || !wifiTransmissionFeedback.active) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="bg-[#121929] border border-orange-500/80 rounded-2xl p-3 shadow-2xl shadow-orange-500/30 flex items-center gap-3 ring-4 ring-orange-500/20 text-white min-w-[320px] max-w-md">
        <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-orange-500/40 animate-pulse">
          <Wifi className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-orange-400">
            <span>Rede Wi-Fi Local (2ms)</span>
            <span>·</span>
            <span className="font-mono text-emerald-400">Transmitido</span>
          </div>
          <div className="font-black text-xs text-white truncate">
            {wifiTransmissionFeedback.message}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
            <span>{wifiTransmissionFeedback.from}</span>
            <ArrowRight className="w-2.5 h-2.5 text-orange-400" />
            <span className="text-slate-200 font-bold">{wifiTransmissionFeedback.to}</span>
          </div>
        </div>

        <div className="shrink-0 pl-1">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
      </div>
    </div>
  );
};
