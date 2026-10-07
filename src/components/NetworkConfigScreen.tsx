import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Server, 
  RefreshCw, 
  Smartphone, 
  Tablet, 
  ChefHat, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Sliders, 
  Activity, 
  Cpu, 
  Database, 
  HardDrive, 
  Lock, 
  Radio, 
  Layers,
  Terminal,
  Zap
} from 'lucide-react';
import { useFoodSystem } from '../context/FoodSystemContext';

export const NetworkConfigScreen: React.FC = () => {
  const {
    localServerStatus,
    internetStatus,
    wifiSSID,
    localServerIP,
    connectedDevices,
    isRestartingServer,
    restartLocalServer,
    toggleLocalServerStatus,
    toggleInternetStatus,
    triggerSyncNow,
    setActiveScreen,
    syncQueue,
    playFeedbackSound,
    addToast
  } = useFoodSystem();

  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('todos');

  const isLocalOnline = localServerStatus === 'online';
  const isInternetOnline = internetStatus === 'online';
  const pendingSync = syncQueue.filter(i => i.status === 'pendente').length;

  const filteredDevices = connectedDevices.filter(dev => {
    if (selectedDeviceType === 'todos') return true;
    return dev.type === selectedDeviceType;
  });

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] bg-[#0b101c] overflow-y-auto select-none p-3 md:p-4 space-y-4">
      {/* Top Header */}
      <div className="bg-[#121929] border border-slate-800/80 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base md:text-lg text-white tracking-tight">
                Infraestrutura de Rede & Servidor Local
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30">
                OFFLINE-FIRST HYBRID
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Gerenciamento da rede Wi-Fi local ({wifiSSID}), nós conectados e sincronização em nuvem
            </span>
          </div>
        </div>

        {/* Quick Restart Server Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={restartLocalServer}
            disabled={isRestartingServer}
            className="py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/25 pos-btn-press disabled:opacity-40 transition-all"
          >
            <RotateCcw className={`w-4 h-4 ${isRestartingServer ? 'animate-spin' : ''}`} />
            <span>{isRestartingServer ? 'Reiniciando Servidor...' : 'Reiniciar Servidor Local'}</span>
          </button>
        </div>
      </div>

      {/* 3 Main Status Cards (Servidor Local, Rede Wi-Fi, Nuvem Híbrida) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: Status do Servidor Local */}
        <div className={`border rounded-2xl p-4 shadow-xl flex flex-col justify-between transition-all ${
          isLocalOnline 
            ? 'bg-[#121929] border-emerald-500/40' 
            : 'bg-[#1e1117] border-rose-500/50'
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
              <span>Status do Servidor Local</span>
              <Server className={`w-4 h-4 ${isLocalOnline ? 'text-emerald-400' : 'text-rose-400'}`} />
            </div>

            <div className="flex items-center gap-2.5 my-1">
              <span className={`w-3.5 h-3.5 rounded-full ${
                isLocalOnline ? 'bg-emerald-400 shadow-md shadow-emerald-400/50 animate-pulse' : 'bg-rose-500'
              }`}></span>
              <span className={`font-mono font-black text-2xl tracking-tight ${
                isLocalOnline ? 'text-white' : 'text-rose-300'
              }`}>
                {isLocalOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            <div className="text-xs text-slate-400 mt-2 space-y-1 font-mono">
              <div>IP Local: <strong className="text-slate-200">{localServerIP}</strong></div>
              <div>Latência Local: <strong className="text-emerald-400 font-bold">0.8 ms (ultra-rápido)</strong></div>
              <div>Banco Local: <strong className="text-slate-300">SQLite + Cache em Memória</strong></div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Contingência:</span>
            <button
              onClick={toggleLocalServerStatus}
              className={`text-[11px] font-bold underline ${isLocalOnline ? 'text-rose-400' : 'text-emerald-400'}`}
            >
              {isLocalOnline ? 'Desligar Servidor' : 'Reconectar Servidor'}
            </button>
          </div>
        </div>

        {/* Card 2: Rede Wi-Fi do Restaurante */}
        <div className="bg-[#121929] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
              <span>Rede Wi-Fi Interna</span>
              <Wifi className="w-4 h-4 text-orange-400" />
            </div>

            <div className="flex items-center gap-2 my-1">
              <span className="font-mono font-black text-xl text-white tracking-tight">
                {wifiSSID}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                5GHz
              </span>
            </div>

            <div className="text-xs text-slate-400 mt-2 space-y-1">
              <div>Segurança: <strong className="text-slate-300">WPA3 Enterprise Privada</strong></div>
              <div>Roteador: <strong className="text-slate-300">Wi-Fi 6 Mesh Industrial</strong></div>
              <div>Cobertura: <strong className="text-emerald-400">100% (Salão, Cozinha, Bar, Deck)</strong></div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">Dispositivos conectados:</span>
            <span className="font-mono font-bold text-orange-400">{connectedDevices.length} ativos</span>
          </div>
        </div>

        {/* Card 3: Nuvem & Internet */}
        <div className={`border rounded-2xl p-4 shadow-xl flex flex-col justify-between transition-all ${
          isInternetOnline 
            ? 'bg-[#121929] border-blue-500/40' 
            : 'bg-[#1c1611] border-amber-500/50'
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
              <span>Conexão Nuvem (Acesso Remoto)</span>
              <Zap className={`w-4 h-4 ${isInternetOnline ? 'text-blue-400' : 'text-amber-400'}`} />
            </div>

            <div className="flex items-center gap-2.5 my-1">
              <span className={`w-3.5 h-3.5 rounded-full ${
                isInternetOnline ? 'bg-blue-400 shadow-md shadow-blue-400/50 animate-pulse' : 'bg-amber-400'
              }`}></span>
              <span className={`font-mono font-black text-2xl tracking-tight ${
                isInternetOnline ? 'text-white' : 'text-amber-300'
              }`}>
                {isInternetOnline ? 'INTERNET OK' : 'MODO OFFLINE'}
              </span>
            </div>

            <div className="text-xs text-slate-400 mt-2 space-y-1 font-mono">
              <div>Servidor Nuvem: <strong className="text-slate-300">Google Cloud / Firestore</strong></div>
              <div>Fila de Envio: <strong className="text-amber-400 font-bold">{pendingSync} pacotes pendentes</strong></div>
              <div>Acesso Remoto Dono: <strong className="text-slate-300">Ativo via Web / Celular</strong></div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between">
            <button
              onClick={() => setActiveScreen('sync_queue')}
              className="text-[11px] font-bold text-orange-400 hover:underline"
            >
              Ver Fila de Sincronização
            </button>
            <button
              onClick={toggleInternetStatus}
              className="text-[11px] font-bold text-slate-300 hover:text-white"
            >
              {isInternetOnline ? 'Simular Queda' : 'Restaurar'}
            </button>
          </div>
        </div>
      </div>

      {/* Connected Devices Table (Tablets, Celulares dos Clientes, KDS da Cozinha, Caixa) */}
      <div className="bg-[#121929] border border-slate-800/90 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Table Header Controls */}
        <div className="p-3.5 bg-[#162035] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-400" />
            <h2 className="font-bold text-sm md:text-base text-white">
              Dispositivos Conectados na Rede Local Wi-Fi ({connectedDevices.length})
            </h2>
          </div>

          {/* Type filters */}
          <div className="flex items-center p-0.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'tablet_garcom', label: 'Tablets' },
              { id: 'kds_cozinha', label: 'KDS Cozinha' },
              { id: 'mobile_cliente', label: 'Celulares Clientes' },
              { id: 'terminal_caixa', label: 'Caixa' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedDeviceType(tab.id)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  selectedDeviceType === tab.id
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Device Rows */}
        <div className="divide-y divide-slate-800/60 text-xs">
          {filteredDevices.map(device => {
            const getIcon = () => {
              switch (device.type) {
                case 'tablet_garcom': return <Tablet className="w-4 h-4 text-orange-400" />;
                case 'kds_cozinha': return <ChefHat className="w-4 h-4 text-amber-400" />;
                case 'mobile_cliente': return <Smartphone className="w-4 h-4 text-blue-400" />;
                case 'servidor_local': return <Server className="w-4 h-4 text-purple-400" />;
                case 'terminal_caixa': return <Cpu className="w-4 h-4 text-emerald-400" />;
                default: return <Radio className="w-4 h-4 text-slate-400" />;
              }
            };

            return (
              <div key={device.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                    {getIcon()}
                  </div>

                  <div className="min-w-0">
                    <div className="font-bold text-white text-xs md:text-sm truncate">
                      {device.name}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                      <span>IP: {device.ip}</span>
                      <span>·</span>
                      <span>Último Ping: {device.lastSeen}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div>
                    <span className="font-mono font-bold text-emerald-400 text-xs block">
                      {device.pingMs} ms
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Latência</span>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Conectado</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
