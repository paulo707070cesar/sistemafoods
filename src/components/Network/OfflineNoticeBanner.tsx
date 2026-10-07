import React from 'react';
import { CloudOff, AlertTriangle, ArrowRight, RefreshCw, Wifi } from 'lucide-react';
import { useFoodSystem } from '../../context/FoodSystemContext';

export const OfflineNoticeBanner: React.FC = () => {
  const { internetStatus, syncQueue, setActiveScreen, playFeedbackSound, toggleInternetStatus } = useFoodSystem();

  if (internetStatus !== 'offline') return null;

  const pendingCount = syncQueue.filter(i => i.status === 'pendente').length;

  return (
    <div className="bg-gradient-to-r from-amber-950/90 via-[#261b0c] to-amber-950/90 border-b border-amber-600/50 px-3 py-1.5 flex items-center justify-between text-xs text-amber-200 select-none z-20 shrink-0 shadow-md">
      <div className="flex items-center gap-2 overflow-hidden">
        <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <CloudOff className="w-3.5 h-3.5 animate-pulse" />
        </div>
        <span className="font-semibold truncate">
          <strong className="text-amber-300 font-bold uppercase tracking-wider text-[11px] mr-1">Modo Offline:</strong>
          Restaurante funcionando via <strong className="text-white">Wi-Fi Local (Food_System_5G)</strong>. Dados protegidos localmente e sincronizados quando a internet voltar.
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0 pl-2">
        <button
          onClick={() => {
            playFeedbackSound('click');
            setActiveScreen('sync_queue');
          }}
          className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[11px] flex items-center gap-1 transition-colors"
        >
          <span>Fila ({pendingCount})</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        <button
          onClick={toggleInternetStatus}
          className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5"
          title="Clique para simular retorno da internet"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Restaurar</span>
        </button>
      </div>
    </div>
  );
};
