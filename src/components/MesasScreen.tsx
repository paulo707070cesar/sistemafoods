import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  ReceiptText, 
  CreditCard, 
  ArrowRightLeft, 
  Printer, 
  Plus, 
  X, 
  CheckCircle, 
  Sparkles, 
  AlertCircle,
  Search,
  Filter,
  UserPlus,
  BellRing,
  QrCode,
  Wifi,
  Send
} from 'lucide-react';
import { useFoodSystem } from '../context/FoodSystemContext';
import { Table, TableStatus, Comanda } from '../types';

export const MesasScreen: React.FC = () => {
  const {
    tables,
    comandas,
    digitalOrders,
    setPendingDigitalOrderToReview,
    openQRCodeModal,
    setSelectedTableId,
    setActiveScreen,
    setActiveMode,
    setSelectedComandaId,
    updateTableStatus,
    transferTable,
    openNewComanda,
    openReceiptModal,
    addToast,
    playFeedbackSound,
    triggerWifiFlyAnimation
  } = useFoodSystem();


  const [activeTab, setActiveTab] = useState<'mesas' | 'comandas'>('mesas');
  const [selectedZone, setSelectedZone] = useState<string>('Todas');
  const [statusFilter, setStatusFilter] = useState<'todas' | TableStatus>('todas');
  const [selectedTable, setSelectedTable] = useState<Table | null>(tables[4] || tables[0]); // Defaults to Mesa 05
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [targetTransferId, setTargetTransferId] = useState<number>(1);
  const [newComandaModalOpen, setNewComandaModalOpen] = useState(false);
  const [newComandaName, setNewComandaName] = useState('');
  const [newComandaWaiter, setNewComandaWaiter] = useState('Carlos Silveira');

  // Stats
  const ocupadasCount = tables.filter(t => t.status === 'ocupada').length;
  const livresCount = tables.filter(t => t.status === 'livre').length;
  const reservadasCount = tables.filter(t => t.status === 'reservada').length;
  const totalParcialSalão = tables.reduce((acc, t) => {
    return acc + t.items.reduce((sum, item) => sum + item.total, 0);
  }, 0);

  // Filtered tables
  const filteredTables = tables.filter(t => {
    const matchZone = selectedZone === 'Todas' || t.zone === selectedZone;
    const matchStatus = statusFilter === 'todas' || t.status === statusFilter;
    return matchZone && matchStatus;
  });

  const zones = ['Todas', 'Salão Principal', 'Varanda', 'Deck Superior', 'Bar'];

  const handleTableClick = (table: Table) => {
    playFeedbackSound('click');
    setSelectedTable(table);
  };

  const handleOpenInPDV = (table: Table) => {
    playFeedbackSound('click');
    setSelectedTableId(table.id);
    setActiveMode('mesas');
    setActiveScreen('pdv');
  };

  const handleOpenCaixa = (table: Table) => {
    playFeedbackSound('click');
    setSelectedTableId(table.id);
    setActiveMode('mesas');
    setActiveScreen('caixa');
  };

  const handleExecuteTransfer = () => {
    if (selectedTable && targetTransferId) {
      transferTable(selectedTable.id, targetTransferId);
      setTransferModalOpen(false);
      const updated = tables.find(t => t.id === targetTransferId);
      if (updated) setSelectedTable(updated);
    }
  };

  const handleCreateComanda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComandaName.trim()) return;
    openNewComanda(newComandaName.trim(), newComandaWaiter);
    setNewComandaName('');
    setNewComandaModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#0b101c] overflow-hidden select-none">
      {/* Top Controls Bar */}
      <div className="bg-[#121929] border-b border-slate-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: View selector & Zone pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => { playFeedbackSound('click'); setActiveTab('mesas'); }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                activeTab === 'mesas' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mapa de Mesas ({tables.length})
            </button>
            <button
              onClick={() => { playFeedbackSound('click'); setActiveTab('comandas'); }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                activeTab === 'comandas' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Comandas Avulsas ({comandas.length})
            </button>
          </div>

          {/* Zones */}
          {activeTab === 'mesas' && (
            <div className="hidden md:flex items-center gap-1">
              {zones.map(z => (
                <button
                  key={z}
                  onClick={() => setSelectedZone(z)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    selectedZone === z
                      ? 'bg-slate-800 text-orange-400 border border-orange-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Legend & Quick Stats */}
        <div className="flex items-center gap-3 text-xs">
          {/* Status indicators */}
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setStatusFilter(statusFilter === 'ocupada' ? 'todas' : 'ocupada')}
              className={`flex items-center gap-1.5 transition-opacity ${statusFilter === 'ocupada' ? 'font-bold' : ''}`}
            >
              <span className="w-3 h-3 rounded-md bg-orange-500 shadow-xs shadow-orange-500/50"></span>
              <span className="text-slate-300">Ocupada ({ocupadasCount})</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => setStatusFilter(statusFilter === 'livre' ? 'todas' : 'livre')}
              className={`flex items-center gap-1.5 transition-opacity ${statusFilter === 'livre' ? 'font-bold' : ''}`}
            >
              <span className="w-3 h-3 rounded-md bg-slate-700"></span>
              <span className="text-slate-400">Livre ({livresCount})</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => setStatusFilter(statusFilter === 'reservada' ? 'todas' : 'reservada')}
              className={`flex items-center gap-1.5 transition-opacity ${statusFilter === 'reservada' ? 'font-bold' : ''}`}
            >
              <span className="w-3 h-3 rounded-md bg-blue-500 shadow-xs shadow-blue-500/50"></span>
              <span className="text-blue-300">Reservada ({reservadasCount})</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-slate-400 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span>Consumo em Aberto:</span>
            <span className="font-mono font-bold text-orange-400 tabular-nums">R$ {totalParcialSalão.toFixed(2)}</span>
          </div>

          {/* Wi-Fi Sync Indicator */}
          <button
            onClick={() => {
              playFeedbackSound('click');
              triggerWifiFlyAnimation('Sincronização Wi-Fi Local (2ms): Mapa de mesas transmitido em tempo real para os 8 terminais!', 'Tablet Garçom', 'Rede Local');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-colors pos-btn-press"
            title="Sincronização instantânea via Wi-Fi com a Cozinha e Caixa"
          >
            <Wifi className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sync Wi-Fi (2ms)</span>
          </button>

          {activeTab === 'comandas' && (
            <button
              onClick={() => setNewComandaModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center gap-1.5 text-xs shadow-md shadow-orange-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Comanda</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Body: Grid on Left/Center + Interactive Detail Panel on Right */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-3 p-3 overflow-hidden">
        {/* ================= AREA PRINCIPAL (GRID DE MESAS OU COMANDAS) ================= */}
        <div className="col-span-12 lg:col-span-8 min-h-0 overflow-y-auto pr-1">
          {activeTab === 'mesas' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-3">
              {filteredTables.map((table) => {
                const isSelected = selectedTable?.id === table.id;
                const partialTotal = table.items.reduce((s, i) => s + i.total, 0);
                const pendingOrders = digitalOrders.filter(o => o.tableNumber === table.number && o.status === 'aguardando');
                const hasPendingOrder = pendingOrders.length > 0;

                // Styling based on status
                let borderStyle = 'border-slate-800/80 bg-[#131b2e]';
                let badgeColor = 'bg-slate-700 text-slate-300';
                let glowStyle = '';

                if (hasPendingOrder) {
                  borderStyle = 'border-orange-500 bg-gradient-to-b from-[#241a2e] to-[#1a1524]';
                  glowStyle = 'ring-2 ring-orange-500 shadow-lg shadow-orange-500/20';
                } else if (table.status === 'ocupada') {
                  borderStyle = 'border-orange-500/40 bg-gradient-to-b from-[#1c2438] to-[#161d30]';
                  badgeColor = 'bg-orange-500 text-white font-bold shadow-sm shadow-orange-500/30';
                  glowStyle = 'ring-1 ring-orange-500/20';
                } else if (table.status === 'reservada') {
                  borderStyle = 'border-blue-500/40 bg-gradient-to-b from-[#14233c] to-[#121c2e]';
                  badgeColor = 'bg-blue-500 text-white font-bold shadow-sm shadow-blue-500/30';
                  glowStyle = 'ring-1 ring-blue-500/20';
                }

                if (isSelected) {
                  borderStyle = 'border-orange-400 bg-slate-800/90 ring-2 ring-orange-500 shadow-xl';
                }

                return (
                  <div
                    key={table.id}
                    onClick={() => handleTableClick(table)}
                    className={`rounded-2xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between min-h-[150px] pos-btn-press relative overflow-hidden ${borderStyle} ${glowStyle}`}
                  >
                    {/* Top row: Table Number & Status badge / Pending alert */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base md:text-lg text-white tracking-tight">
                          {table.number}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          ({table.seats}L)
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {hasPendingOrder && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-orange-500 text-white flex items-center gap-1 shadow-md shadow-orange-500/50 animate-pulse">
                            <BellRing className="w-2.5 h-2.5 animate-bounce" />
                            <span>NOVO PEDIDO</span>
                          </span>
                        )}
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md ${badgeColor}`}>
                          {table.status}
                        </span>
                      </div>
                    </div>

                    {/* Middle info */}
                    <div className="space-y-1 my-1">
                      <div className="text-[11px] text-slate-400 truncate flex items-center justify-between">
                        <span>{table.zone}</span>
                        {table.status === 'ocupada' && (
                          <span className="flex items-center gap-1 text-slate-300 font-mono text-[10px]">
                            <Clock className="w-3 h-3 text-orange-400" />
                            {table.minutesActive || 45}m
                          </span>
                        )}
                      </div>

                      {table.status === 'ocupada' && table.waiter && (
                        <div className="text-[11px] text-slate-300 truncate">
                          Garçom: <strong className="text-slate-100">{table.waiter.split(' ')[0]}</strong>
                        </div>
                      )}

                      {table.status === 'reservada' && table.notes && (
                        <div className="text-[11px] text-blue-300 italic truncate">
                          {table.notes}
                        </div>
                      )}
                    </div>

                    {/* Bottom Row: Consumo Parcial */}
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between mt-auto">
                      {table.status === 'ocupada' ? (
                        <>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                            {table.items.length} {table.items.length === 1 ? 'item' : 'itens'}
                          </span>
                          <span className="font-mono font-bold text-sm text-orange-400 tabular-nums">
                            R$ {partialTotal.toFixed(2)}
                          </span>
                        </>
                      ) : table.status === 'reservada' ? (
                        <span className="text-[10px] text-blue-400 font-medium">Reservado</span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-medium">Mesa Disponível</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Comandas Tab View */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {comandas.map(cmd => {
                const cmdTotal = cmd.items.reduce((s, i) => s + i.total, 0);
                const isSelected = selectedTable?.id === 999 && selectedTable.number === cmd.number;

                return (
                  <div
                    key={cmd.id}
                    onClick={() => {
                      playFeedbackSound('click');
                      setSelectedComandaId(cmd.id);
                      setActiveMode('comandas');
                    }}
                    className="rounded-2xl p-4 border border-slate-800 bg-[#131b2e] hover:border-orange-500/40 transition-all cursor-pointer flex flex-col justify-between min-h-[150px]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-base text-white">{cmd.number}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        {cmd.status}
                      </span>
                    </div>

                    <div className="space-y-1 mb-2">
                      <div className="font-bold text-sm text-slate-200 truncate">{cmd.customerName}</div>
                      <div className="text-xs text-slate-400">Atendido por: {cmd.waiter}</div>
                      <div className="text-xs text-slate-400">Aberta às: {cmd.openedAt}</div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">{cmd.items.length} itens</span>
                      <span className="font-mono font-bold text-base text-orange-400 tabular-nums">
                        R$ {cmdTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= PAINEL LATERAL (4 colunas): Detalhes da Mesa Selecionada ================= */}
        <div className="col-span-12 lg:col-span-4 min-h-0 bg-[#121929]/95 rounded-2xl border border-slate-800/90 shadow-xl flex flex-col overflow-hidden">
          {selectedTable ? (
            <>
              {/* Header do Detalhe */}
              <div className="bg-[#182238] p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-lg text-white">{selectedTable.number}</h2>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      selectedTable.status === 'ocupada' ? 'bg-orange-500 text-white' :
                      selectedTable.status === 'reservada' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {selectedTable.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {selectedTable.zone} · Capacidade: {selectedTable.seats} pessoas
                  </div>
                </div>

                {/* Status Switcher pill */}
                <div className="flex items-center gap-1">
                  <select
                    value={selectedTable.status}
                    onChange={(e) => updateTableStatus(selectedTable.id, e.target.value as TableStatus)}
                    className="bg-slate-900 border border-slate-700 text-xs font-bold rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
                  >
                    <option value="ocupada">Ocupada</option>
                    <option value="livre">Livre</option>
                    <option value="reservada">Reservada</option>
                  </select>
                </div>
              </div>

              {/* Pending Digital Order Alert Banner in Side Panel */}
              {(() => {
                const pendingForThis = digitalOrders.filter(o => o.tableNumber === selectedTable.number && o.status === 'aguardando');
                if (pendingForThis.length === 0) return null;
                const ord = pendingForThis[0];

                return (
                  <div className="m-3 p-3 bg-gradient-to-r from-orange-500/20 via-orange-500/30 to-amber-500/20 border border-orange-500/50 rounded-2xl flex items-center justify-between shadow-lg ring-1 ring-orange-500/30 animate-pulse">
                    <div>
                      <span className="text-[10px] font-black uppercase text-orange-400 flex items-center gap-1">
                        <BellRing className="w-3.5 h-3.5 animate-bounce" />
                        Novo Pedido Digital Recebido!
                      </span>
                      <span className="text-xs text-white block mt-0.5 font-bold">
                        {ord.orderNumber} · {ord.items.length} itens (R$ {ord.total.toFixed(2)})
                      </span>
                    </div>

                    <button
                      onClick={() => setPendingDigitalOrderToReview(ord)}
                      className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/30 pos-btn-press"
                    >
                      Revisar
                    </button>
                  </div>
                );
              })()}


              {/* Status & Timing Metrics */}
              {selectedTable.status === 'ocupada' && (
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/60 border-b border-slate-800/80 text-center">
                  <div className="p-1.5 rounded-lg bg-slate-800/40">
                    <span className="text-[10px] text-slate-400 uppercase block">Permanência</span>
                    <span className="font-mono font-bold text-xs text-orange-400">
                      {selectedTable.minutesActive || 45} min
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-800/40">
                    <span className="text-[10px] text-slate-400 uppercase block">Abertura</span>
                    <span className="font-mono font-bold text-xs text-slate-200">
                      {selectedTable.openedAt || '12:00'}
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-800/40">
                    <span className="text-[10px] text-slate-400 uppercase block">Garçom</span>
                    <span className="font-semibold text-xs text-slate-200 truncate block">
                      {selectedTable.waiter ? selectedTable.waiter.split(' ')[0] : 'Geral'}
                    </span>
                  </div>
                </div>
              )}

              {/* Items List in Table */}
              <div className="flex-1 min-h-0 overflow-y-auto p-3 divide-y divide-slate-800/50">
                <div className="flex items-center justify-between pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Itens Consumidos</span>
                  <span>{selectedTable.items.length} itens</span>
                </div>

                {selectedTable.items.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                    <ReceiptText className="w-8 h-8 text-slate-600 mb-2" />
                    <span>Nenhum consumo registrado nesta mesa.</span>
                    <button
                      onClick={() => handleOpenInPDV(selectedTable)}
                      className="mt-3 text-orange-400 hover:underline font-bold text-xs"
                    >
                      + Abrir comanda e lançar pedido
                    </button>
                  </div>
                ) : (
                  selectedTable.items.map((item) => (
                    <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-200">{item.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {item.qty}x R$ {item.price.toFixed(2)}
                          {item.observation && <span className="text-orange-400 ml-1.5">({item.observation})</span>}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-slate-100 tabular-nums">
                        R$ {item.total.toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Parcial Totals Summary */}
              {selectedTable.items.length > 0 && (
                <div className="p-3 bg-[#0e1524] border-t border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-mono text-slate-300">
                      R$ {selectedTable.items.reduce((s, i) => s + i.total, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Taxa Serviço (10%)</span>
                    <span className="font-mono text-slate-300">
                      R$ {(selectedTable.items.reduce((s, i) => s + i.total, 0) * 0.1).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-white pt-1 border-t border-slate-800">
                    <span className="text-orange-400">Total Parcial</span>
                    <span className="font-mono text-base text-orange-400">
                      R$ {(selectedTable.items.reduce((s, i) => s + i.total, 0) * 1.1).toFixed(2)}
                    </span>
                  </div>

                  {/* Wi-Fi Flight Action for Waiter */}
                  <button
                    onClick={() => {
                      triggerWifiFlyAnimation(`Pedido da ${selectedTable.number} transmitido via Wi-Fi local para a Cozinha! 🍳`, 'Tablet Garçom', 'KDS Cozinha');
                      playFeedbackSound('success');
                      addToast('success', 'Pedido Transmitido!', `Itens da ${selectedTable.number} enviados instantaneamente ao KDS.`);
                    }}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 font-bold text-xs flex items-center justify-center gap-1.5 pos-btn-press transition-colors"
                  >
                    <Wifi className="w-3.5 h-3.5" />
                    <span>Transmitir para Cozinha via Wi-Fi (2ms)</span>
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="p-3 bg-[#141d30] border-t border-slate-800 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleOpenInPDV(selectedTable)}
                  className="py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 pos-btn-press"
                >
                  <ReceiptText className="w-4 h-4" />
                  <span>Abrir no PDV</span>
                </button>

                <button
                  onClick={() => handleOpenCaixa(selectedTable)}
                  disabled={selectedTable.items.length === 0}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed pos-btn-press"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Fechar / Caixa</span>
                </button>

                <button
                  onClick={() => setTransferModalOpen(true)}
                  disabled={selectedTable.items.length === 0}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 pos-btn-press"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Transferir</span>
                </button>

                <button
                  onClick={() => openQRCodeModal(selectedTable.number)}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-400 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 pos-btn-press"
                  title="Gerar e imprimir QR Code desta mesa"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Placa QR</span>
                </button>

                <button
                  onClick={() => {
                    const st = selectedTable.items.reduce((s, i) => s + i.total, 0);
                    openReceiptModal(undefined, {
                      source: selectedTable.number,
                      items: selectedTable.items,
                      subtotal: st,
                      serviceTax: st * 0.1,
                      discount: 0,
                      total: st * 1.1,
                      waiter: selectedTable.waiter || 'Geral',
                      openedAt: selectedTable.openedAt || '12:00'
                    });
                  }}
                  disabled={selectedTable.items.length === 0}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 pos-btn-press"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Prévia Conta</span>
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs p-6 text-center">
              Selecione uma mesa no mapa para exibir detalhes.
            </div>
          )}
        </div>
      </div>

      {/* Transfer Table Modal */}
      {transferModalOpen && selectedTable && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#141b2d] border border-slate-700 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-orange-400" />
                Transferir {selectedTable.number}
              </h3>
              <button onClick={() => setTransferModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4">
              <label className="text-xs text-slate-400 block mb-1.5">Mesa de Destino:</label>
              <select
                value={targetTransferId}
                onChange={(e) => setTargetTransferId(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              >
                {tables.filter(t => t.id !== selectedTable.id).map(t => (
                  <option key={t.id} value={t.id}>
                    {t.number} ({t.status}) - {t.zone}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setTransferModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteTransfer}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white"
              >
                Confirmar Transferência
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Comanda Modal */}
      {newComandaModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateComanda} className="bg-[#141b2d] border border-slate-700 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-orange-400" />
                Abrir Nova Comanda
              </h3>
              <button type="button" onClick={() => setNewComandaModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nome do Cliente:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rafael Castro (Balcão)"
                  value={newComandaName}
                  onChange={(e) => setNewComandaName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Garçom / Atendente:</label>
                <select
                  value={newComandaWaiter}
                  onChange={(e) => setNewComandaWaiter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                >
                  <option value="Carlos Silveira">Carlos Silveira</option>
                  <option value="Marcos Vinicius">Marcos Vinicius</option>
                  <option value="Camila Rocha">Camila Rocha</option>
                  <option value="Barman Rafael">Barman Rafael</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setNewComandaModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white"
              >
                Criar Comanda
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
