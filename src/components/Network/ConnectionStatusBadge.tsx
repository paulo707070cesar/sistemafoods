import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  Server, 
  Smartphone, 
  Tablet, 
  ChefHat, 
  Settings, 
  Layers, 
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useFoodSystem } from '../../context/FoodSystemContext';

export const ConnectionStatusBadge: React.FC = () => {
  const {
    localServerStatus,
    internetStatus,
    wifiSSID,
    localServerIP,
    syncMode,
    lastSyncTime,
    connectedDevices,
    syncQueue,
    isSyncing,
    toggleLocalServerStatus,
    toggleInternetStatus,
    triggerSyncNow,
    setActiveScreen,
    setInterfaceMode,
    playFeedbackSound
  } = useFoodSystem();

  const [modalOpen, setModalOpen] = useState(false);

  const pendingSyncCount = syncQueue.filter(i => i.status === 'pendente').length;
  const isLocalOnline = localServerStatus === 'online';
  const isInternetOnline = internetStatus === 'online';

  const handleOpenModal = () => {
    playFeedbackSound('click');
    setModalOpen(true);
  };

  return (
    <>
      {/* Quick Clickable Connection Capsule Badge */}
      <button
        onClick={handleOpenModal}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold transition-all pos-btn-press select-none ${
          !isLocalOnline
            ? 'bg-rose-950/40 border-rose-800/60 text-rose-300 ring-1 ring-rose-500/30 animate-pulse'
            : !isInternetOnline
            ? 'bg-amber-950/30 border-amber-700/50 text-amber-300 ring-1 ring-amber-500/20'
            : 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:border-slate-600'
        }`}
        title="Clique para ver o status da rede e servidor local"
      >
        {/* Local Wi-Fi Icon: Green if connected, Gray/Red if offline */}
        <div className="flex items-center gap-1">
          {isLocalOnline ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-rose-400" />
          )}
          <span className="text-[11px] font-mono hidden sm:inline">
            {isLocalOnline ? 'Wi-Fi 5G' : 'Wi-Fi Off'}
          </span>
        </div>

        <span className="text-slate-600">|</span>

        {/* Cloud Sync Icon: Blue if online, Amber if offline with pending queue */}
        <div className="flex items-center gap-1">
          {isInternetOnline ? (
            <Cloud className={`w-3.5 h-3.5 text-blue-400 ${isSyncing ? 'animate-bounce' : ''}`} />
          ) : (
            <CloudOff className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="text-[11px] font-mono hidden md:inline">
            {isInternetOnline ? 'Nuvem OK' : `Offline (${pendingSyncCount})`}
          </span>
        </div>
      </button>

      {/* Network & Connectivity Diagnostics Popover / Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 select-none">
          <div className="bg-[#121929] border border-slate-700/90 rounded-3xl w-full max-w-lg p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">
                    Arquitetura de Rede & Conectividade
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Operação Híbrida: Servidor Local (Wi-Fi) + Nuvem Remota
                  </span>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="my-4 space-y-3.5 overflow-y-auto pr-1 flex-1">
              {/* Server & Wi-Fi Status Card */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Local Wi-Fi */}
                <div className={`p-3 rounded-2xl border ${
                  isLocalOnline 
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200' 
                    : 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Servidor Local (Wi-Fi)</span>
                    {isLocalOnline ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    )}
                  </div>
                  <div className="font-mono font-bold text-sm text-white">
                    {isLocalOnline ? 'ONLINE (1.2 ms)' : 'DESCONECTADO'}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                    {wifiSSID} · {localServerIP}
                  </span>
                </div>

                {/* Cloud Sync */}
                <div className={`p-3 rounded-2xl border ${
                  isInternetOnline 
                    ? 'bg-blue-950/20 border-blue-800/40 text-blue-200' 
                    : 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Conexão Nuvem</span>
                    {isInternetOnline ? (
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    )}
                  </div>
                  <div className="font-mono font-bold text-sm text-white">
                    {isInternetOnline ? 'SINCRONIZADO (42 ms)' : 'MODO OFFLINE'}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {pendingSyncCount > 0 ? `${pendingSyncCount} itens na fila local` : `Último sync: ${lastSyncTime}`}
                  </span>
                </div>
              </div>

              {/* Contingency Simulation Toggles */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-orange-400" />
                    Simular Cenários de Contingência (Teste Real)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Ambiente Demo</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={toggleInternetStatus}
                    className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all pos-btn-press ${
                      isInternetOnline
                        ? 'bg-slate-800/90 hover:bg-slate-800 border-slate-700 text-slate-300'
                        : 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-black'
                    }`}
                  >
                    {isInternetOnline ? <CloudOff className="w-3.5 h-3.5 text-amber-400" /> : <Cloud className="w-3.5 h-3.5" />}
                    <span>{isInternetOnline ? 'Simular Queda Internet' : 'Restaurar Internet'}</span>
                  </button>

                  <button
                    onClick={toggleLocalServerStatus}
                    className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all pos-btn-press ${
                      isLocalOnline
                        ? 'bg-slate-800/90 hover:bg-slate-800 border-slate-700 text-slate-300'
                        : 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-500/20 font-black'
                    }`}
                  >
                    {isLocalOnline ? <WifiOff className="w-3.5 h-3.5 text-rose-400" /> : <Wifi className="w-3.5 h-3.5" />}
                    <span>{isLocalOnline ? 'Desligar Servidor' : 'Ligar Servidor Local'}</span>
                  </button>
                </div>
              </div>

              {/* Connected Terminals Summary */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 pb-1 border-b border-slate-800">
                  <span>Dispositivos Conectados na Rede ({connectedDevices.length})</span>
                  <span className="font-mono text-emerald-400">100% via Wi-Fi</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center">
                  <div className="bg-[#141b2e] p-2 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Tablets</span>
                    <strong className="text-sm text-white font-mono">2 ativos</strong>
                  </div>
                  <div className="bg-[#141b2e] p-2 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">KDS Cozinha</span>
                    <strong className="text-sm text-white font-mono">2 telas</strong>
                  </div>
                  <div className="bg-[#141b2e] p-2 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Móvel Clientes</span>
                    <strong className="text-sm text-white font-mono">2 celulares</strong>
                  </div>
                  <div className="bg-[#141b2e] p-2 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Frente Caixa</span>
                    <strong className="text-sm text-white font-mono">1 terminal</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setActiveScreen('rede');
                }}
                className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-orange-400" />
                <span>Configurar Servidor & Wi-Fi</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setActiveScreen('sync_queue');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Fila ({pendingSyncCount})</span>
                </button>

                <button
                  onClick={triggerSyncNow}
                  disabled={isSyncing || !isInternetOnline}
                  className="py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-orange-500/20 pos-btn-press disabled:opacity-40"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Nuvem'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
