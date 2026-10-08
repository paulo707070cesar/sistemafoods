import React, { useState } from 'react';
import { 
  Layers, 
  RefreshCw, 
  Cloud, 
  CloudOff, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  CreditCard, 
  Package, 
  ArrowRight, 
  ShieldCheck, 
  Database,
  ArrowUpRight
} from 'lucide-react';
import { useFoodSystem } from '../context/FoodSystemContext';

export const SyncQueueScreen: React.FC = () => {
  const {
    syncQueue,
    isSyncing,
    internetStatus,
    lastSyncTime,
    syncMode,
    setSyncMode,
    retrySyncQueue,
    triggerSyncNow,
    toggleInternetStatus,
    playFeedbackSound
  } = useFoodSystem();

  const isInternetOnline = internetStatus === 'online';
  const pendingItems = syncQueue.filter(i => i.status === 'pendente');
  const syncedItems = syncQueue.filter(i => i.status === 'sincronizado');

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0b101c] overflow-y-auto select-none p-3 md:p-4 space-y-4">
      {/* Top Header */}
      <div className="bg-[#121929] border border-slate-800/80 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base md:text-lg text-white tracking-tight">
                Fila de Sincronização em Nuvem (Contingência)
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30">
                OFFLINE QUEUE
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Pedidos, recebimentos e estoque salvos localmente que aguardam upload para a nuvem
            </span>
          </div>
        </div>

        {/* Sync Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={retrySyncQueue}
            disabled={isSyncing}
            className="py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/25 pos-btn-press disabled:opacity-40 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Transmitindo para Nuvem...' : 'Tentar Sincronizar Novamente'}</span>
          </button>
        </div>
      </div>

      {/* Sync Mode & Status Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Status da Conexão */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          isInternetOnline 
            ? 'bg-[#121929] border-emerald-500/40 text-emerald-300' 
            : 'bg-amber-950/20 border-amber-600/40 text-amber-300'
        }`}>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Status Conexão Nuvem</span>
            <div className="font-mono font-black text-base text-white mt-0.5 flex items-center gap-1.5">
              {isInternetOnline ? <Cloud className="w-4 h-4 text-emerald-400" /> : <CloudOff className="w-4 h-4 text-amber-400" />}
              <span>{isInternetOnline ? 'Conexão Restaurada' : 'Modo Offline (Wi-Fi Local)'}</span>
            </div>
          </div>
          <button
            onClick={toggleInternetStatus}
            className="text-[11px] font-bold text-orange-400 underline"
          >
            {isInternetOnline ? 'Simular Queda' : 'Restaurar'}
          </button>
        </div>

        {/* Pendências na Fila */}
        <div className="bg-[#121929] border border-slate-800/90 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Pendentes de Upload</span>
            <div className="font-mono font-black text-2xl text-white mt-0.5 tabular-nums">
              {pendingItems.length} pacotes
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
            {pendingItems.length > 0 ? 'Na Fila Local' : 'Tudo em dia'}
          </span>
        </div>

        {/* Configuração de Modo de Sync */}
        <div className="bg-[#121929] border border-slate-800/90 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Modo de Envio</span>
            <div className="font-bold text-sm text-white mt-0.5">
              {syncMode === 'auto' ? 'Automático (Tempo Real)' : 'Manual pelo Gerente'}
            </div>
            <span className="text-[10px] text-slate-500">Última sync: {lastSyncTime}</span>
          </div>

          <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => { playFeedbackSound('click'); setSyncMode('auto'); }}
              className={`px-2 py-1 rounded font-bold ${syncMode === 'auto' ? 'bg-orange-500 text-white' : 'text-slate-400'}`}
            >
              Auto
            </button>
            <button
              onClick={() => { playFeedbackSound('click'); setSyncMode('manual'); }}
              className={`px-2 py-1 rounded font-bold ${syncMode === 'manual' ? 'bg-orange-500 text-white' : 'text-slate-400'}`}
            >
              Manual
            </button>
          </div>
        </div>
      </div>

      {/* Main Queue List */}
      <div className="bg-[#121929] border border-slate-800/90 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="p-3.5 bg-[#162035] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-orange-400" />
            <h2 className="font-bold text-sm md:text-base text-white">
              Itens da Fila Local ({syncQueue.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            SQLite local storage persistente
          </span>
        </div>

        <div className="divide-y divide-slate-800/60 text-xs">
          {syncQueue.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
              <span>Nenhum pacote pendente de sincronização.</span>
            </div>
          ) : (
            syncQueue.map((item) => {
              const isPending = item.status === 'pendente';

              return (
                <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      item.type === 'pedido' ? 'bg-orange-500/20 text-orange-400' :
                      item.type === 'pagamento' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {item.type === 'pedido' ? <FileText className="w-4 h-4" /> :
                       item.type === 'pagamento' ? <CreditCard className="w-4 h-4" /> :
                       <Package className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs md:text-sm truncate">
                          {item.description}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-500">
                          {item.origin}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {item.payloadSummary} · <span className="font-mono">{item.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-right">
                    {item.amount && (
                      <span className="font-mono font-bold text-orange-400 text-xs md:text-sm tabular-nums">
                        R$ {item.amount.toFixed(2)}
                      </span>
                    )}

                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                      isPending
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 animate-pulse'
                        : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    }`}>
                      {isPending ? (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>Pendente</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Sincronizado</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
