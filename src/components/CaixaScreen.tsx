import React, { useState } from 'react';
import { 
  CircleDollarSign, 
  CreditCard, 
  QrCode, 
  Banknote, 
  CheckCircle2, 
  Printer, 
  RotateCcw, 
  Percent, 
  Users, 
  ArrowRight, 
  Clock, 
  Copy, 
  Check,
  Receipt,
  Utensils
} from 'lucide-react';
import { useFoodSystem } from '../context/FoodSystemContext';
import { PaymentMethod, Table, Comanda, Transaction } from '../types';

export const CaixaScreen: React.FC = () => {
  const {
    tables,
    comandas,
    transactions,
    selectedTableId,
    setSelectedTableId,
    processPayment,
    openReceiptModal,
    addToast,
    playFeedbackSound
  } = useFoodSystem();

  // Pick target to pay (either selected table, or first occupied table)
  const currentTable = tables.find(t => t.id === selectedTableId) || tables.find(t => t.status === 'ocupada') || tables[0];
  const [selectedSource, setSelectedSource] = useState<string>(currentTable.number);
  
  // Find data for selected source
  const sourceTable = tables.find(t => t.number === selectedSource);
  const sourceComanda = comandas.find(c => c.number === selectedSource);

  const items = sourceTable ? sourceTable.items : (sourceComanda?.items || []);
  const initialSubtotal = items.reduce((acc, item) => acc + item.total, 0);

  // Financial state
  const [serviceTaxEnabled, setServiceTaxEnabled] = useState<boolean>(true);
  const [discountVal, setDiscountVal] = useState<number>(sourceTable?.discount || 0);
  const [splitPersons, setSplitPersons] = useState<number>(1);

  // Payment Method state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [installments, setInstallments] = useState<number>(1);
  const [pixCopied, setPixCopied] = useState<boolean>(false);

  // Totals
  const subtotal = initialSubtotal;
  const taxableAmount = Math.max(0, subtotal - discountVal);
  const serviceTax = serviceTaxEnabled ? Number((taxableAmount * 0.10).toFixed(2)) : 0;
  const totalFinal = Number((taxableAmount + serviceTax).toFixed(2));
  const valorPorPessoa = splitPersons > 0 ? Number((totalFinal / splitPersons).toFixed(2)) : totalFinal;

  // Change calculation
  const cashReceivedNumber = parseFloat(cashReceived.replace(',', '.')) || 0;
  const troco = cashReceivedNumber >= totalFinal ? Number((cashReceivedNumber - totalFinal).toFixed(2)) : 0;

  // Confirm Payment
  const handleConfirmPayment = () => {
    if (totalFinal <= 0 && items.length === 0) {
      addToast('warning', 'Valor Zerado', 'Não há itens ou valor a ser pago para esta mesa/comanda.');
      return;
    }

    if (paymentMethod === 'dinheiro' && cashReceivedNumber < totalFinal) {
      addToast('warning', 'Valor Insuficiente', 'O valor recebido em dinheiro é menor que o total final.');
      return;
    }

    const tx = processPayment({
      source: selectedSource,
      subtotal,
      discount: discountVal,
      serviceTax,
      total: totalFinal,
      paymentMethod,
      installments: paymentMethod === 'credito' ? installments : undefined,
      splitPersons: splitPersons > 1 ? splitPersons : undefined,
      cashReceived: paymentMethod === 'dinheiro' ? cashReceivedNumber : undefined,
      change: paymentMethod === 'dinheiro' ? troco : undefined
    });

    // Reset inputs
    setCashReceived('');

    // Open receipt preview
    openReceiptModal(tx);
  };

  const handleCopyPix = () => {
    navigator.clipboard?.writeText('00020126580014BR.GOV.BCB.PIX0136sistema-food-restaurante-qr9923849520400005303986540' + totalFinal.toFixed(2));
    setPixCopied(true);
    addToast('success', 'PIX Copiado', 'Chave Copia e Cola copiada para a área de transferência.');
    setTimeout(() => setPixCopied(false), 3000);
  };

  // Occupied options for quick selector
  const availableSources = [
    ...tables.filter(t => t.status === 'ocupada').map(t => ({ id: t.number, label: `${t.number} (R$ ${t.items.reduce((s, i) => s + i.total, 0).toFixed(2)})` })),
    ...comandas.filter(c => c.status === 'aberta' && c.items.length > 0).map(c => ({ id: c.number, label: `${c.number} - ${c.customerName}` }))
  ];

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#0b101c] overflow-hidden select-none">
      {/* Top Banner with Source Selector */}
      <div className="h-14 bg-[#121929] border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-slate-400">Origem do Pagamento:</span>
            <select
              value={selectedSource}
              onChange={(e) => {
                setSelectedSource(e.target.value);
                playFeedbackSound('click');
              }}
              className="bg-slate-900 border border-slate-700 text-orange-400 text-sm font-extrabold rounded-xl px-3 py-1.5 focus:outline-none focus:border-orange-500"
            >
              {availableSources.length > 0 ? (
                availableSources.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))
              ) : (
                <option value={currentTable.number}>{currentTable.number}</option>
              )}
            </select>
          </div>

          <div className="text-xs text-slate-400 hidden sm:flex items-center gap-2">
            <span>Operador: <strong className="text-slate-200">Caixa 01 (Ana Paula)</strong></span>
            <span>·</span>
            <span>Itens: <strong className="text-slate-200">{items.length}</strong></span>
          </div>
        </div>

        {/* Status of shift */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Total Faturado Hoje:</span>
          <span className="font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-lg">
            R$ {transactions.reduce((acc, t) => acc + t.total, 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Main Payment Console: 2 Columns */}
      <div className="flex-1 grid grid-cols-12 gap-3 p-3 overflow-hidden">
        {/* Left Col (7 colunas): Totais, Métodos de Pagamento e Troco */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-3 overflow-y-auto pr-1">
          {/* Amount Overview Card */}
          <div className="bg-[#121929]/95 rounded-2xl border border-slate-800/90 shadow-xl p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Subtotal</span>
                <span className="font-mono text-base font-bold text-slate-200 tabular-nums">
                  R$ {subtotal.toFixed(2)}
                </span>
              </div>

              <div 
                onClick={() => setServiceTaxEnabled(!serviceTaxEnabled)}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                  serviceTaxEnabled ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-900/30 border-dashed border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase">
                  <span>10% Serviço</span>
                  <span className={serviceTaxEnabled ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {serviceTaxEnabled ? 'SIM' : 'NÃO'}
                  </span>
                </div>
                <span className="font-mono text-base font-bold text-slate-200 tabular-nums block mt-0.5">
                  R$ {serviceTax.toFixed(2)}
                </span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Desconto</span>
                <span className="font-mono text-base font-bold text-amber-400 tabular-nums">
                  - R$ {discountVal.toFixed(2)}
                </span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Divisão</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSplitPersons(Math.max(1, splitPersons - 1))}
                      className="w-4 h-4 rounded bg-slate-800 text-xs flex items-center justify-center text-slate-300"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-xs text-orange-400">{splitPersons}p</span>
                    <button
                      onClick={() => setSplitPersons(splitPersons + 1)}
                      className="w-4 h-4 rounded bg-slate-800 text-xs flex items-center justify-center text-slate-300"
                    >
                      +
                    </button>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-slate-300 tabular-nums block mt-0.5">
                  {splitPersons > 1 ? `R$ ${valorPorPessoa.toFixed(2)}/p` : 'Conta Única'}
                </span>
              </div>
            </div>

            {/* Total Highlight */}
            <div className="bg-gradient-to-r from-orange-500/20 via-orange-500/30 to-amber-500/20 border border-orange-500/50 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Total a Pagar</span>
                <div className="text-xs text-slate-300 mt-0.5">
                  {selectedSource} {splitPersons > 1 && `(Dividido em ${splitPersons} pessoas)`}
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-3xl md:text-4xl font-black text-white tracking-tight tabular-nums">
                  R$ {totalFinal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector Grid */}
          <div className="bg-[#121929]/95 rounded-2xl border border-slate-800/90 shadow-xl p-4 flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Selecione a Forma de Pagamento
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* PIX */}
              <button
                onClick={() => { playFeedbackSound('click'); setPaymentMethod('pix'); }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all pos-btn-press ${
                  paymentMethod === 'pix'
                    ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20 font-bold'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="text-xs">PIX Instantâneo</span>
              </button>

              {/* Dinheiro */}
              <button
                onClick={() => { playFeedbackSound('click'); setPaymentMethod('dinheiro'); }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all pos-btn-press ${
                  paymentMethod === 'dinheiro'
                    ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20 font-bold'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span className="text-xs">Dinheiro (Troco)</span>
              </button>

              {/* Cartão de Crédito */}
              <button
                onClick={() => { playFeedbackSound('click'); setPaymentMethod('credito'); }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all pos-btn-press ${
                  paymentMethod === 'credito'
                    ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20 font-bold'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">Cartão Crédito</span>
              </button>

              {/* Cartão de Débito */}
              <button
                onClick={() => { playFeedbackSound('click'); setPaymentMethod('debito'); }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all pos-btn-press ${
                  paymentMethod === 'debito'
                    ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20 font-bold'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">Cartão Débito</span>
              </button>
            </div>

            {/* Sub-panel based on chosen Payment Method */}
            <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 mt-1">
              {paymentMethod === 'dinheiro' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Valor Recebido do Cliente:</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                        <input
                          type="number"
                          step="0.50"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(e.target.value)}
                          placeholder={totalFinal.toFixed(2)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-lg font-mono font-bold text-white focus:outline-none focus:border-orange-500"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Calculated Change Box */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Troco a Devolver</span>
                        <span className="font-mono text-2xl font-black text-emerald-400 tabular-nums">
                          R$ {troco.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800/40">
                        {cashReceivedNumber >= totalFinal ? 'Troco OK' : 'Aguardando'}
                      </span>
                    </div>
                  </div>

                  {/* Fast Banknote Buttons */}
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800">
                    <span className="text-[11px] text-slate-400 self-center">Cédulas rápidas:</span>
                    {[
                      { label: 'Exato', val: totalFinal },
                      { label: 'R$ 50', val: 50 },
                      { label: 'R$ 100', val: 100 },
                      { label: 'R$ 150', val: 150 },
                      { label: 'R$ 200', val: 200 },
                    ].map(btn => (
                      <button
                        key={btn.label}
                        onClick={() => setCashReceived(btn.val.toFixed(2))}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 pos-btn-press"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {paymentMethod === 'pix' && (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Visual QR Code simulation */}
                  <div className="w-24 h-24 bg-white p-2 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                    <div className="w-full h-full border-2 border-slate-900 p-1 flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div className="w-4 h-4 bg-slate-900"></div>
                        <div className="w-4 h-4 bg-slate-900"></div>
                      </div>
                      <div className="flex justify-center">
                        <div className="w-3 h-3 bg-orange-600 rounded-sm"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="w-4 h-4 bg-slate-900"></div>
                        <div className="w-2 h-2 bg-slate-900"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="text-xs text-slate-300 font-semibold">
                      Apresente o QR Code ao cliente ou envie a chave Copia e Cola
                    </div>
                    <div className="font-mono text-xs text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800 truncate max-w-sm">
                      00020126580014BR.GOV.BCB.PIX...{totalFinal.toFixed(2)}
                    </div>
                    <button
                      onClick={handleCopyPix}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-orange-400 font-bold border border-slate-700 flex items-center gap-1.5"
                    >
                      {pixCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{pixCopied ? 'Chave Copiada!' : 'Copiar Chave PIX'}</span>
                    </button>
                  </div>
                </div>
              )}

              {paymentMethod === 'credito' && (
                <div className="space-y-2">
                  <span className="text-xs text-slate-400 block">Número de Parcelas:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map(p => (
                      <button
                        key={p}
                        onClick={() => setInstallments(p)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                          installments === p
                            ? 'bg-orange-500 text-white border-orange-400'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {p}x de R$ {(totalFinal / p).toFixed(2)}
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Integração maquininha TEF: Aproxime ou insira o cartão do cliente.
                  </span>
                </div>
              )}

              {paymentMethod === 'debito' && (
                <div className="text-xs text-slate-300 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-orange-400" />
                  <span>Maquininha pronta para aproximação/senha de débito bancário.</span>
                </div>
              )}
            </div>

            {/* Confirm Payment Button */}
            <button
              onClick={handleConfirmPayment}
              disabled={totalFinal <= 0 && items.length === 0}
              className="mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-sm md:text-base flex items-center justify-center gap-2 shadow-xl shadow-orange-500/25 transition-all pos-btn-press disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Confirmar Pagamento (R$ {totalFinal.toFixed(2)})</span>
            </button>
          </div>
        </div>

        {/* Right Col (5 colunas): Histórico de Transações Recentes & Detalhes da Conta */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-3 overflow-hidden">
          {/* Recent Transactions List */}
          <div className="flex-1 bg-[#121929]/95 rounded-2xl border border-slate-800/90 shadow-xl p-3.5 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-orange-400" />
                Últimas Transações Realizadas
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {transactions.length} registros
              </span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-800/60 pr-1 mt-1">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="py-2.5 px-2 hover:bg-slate-800/40 rounded-xl transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-200">{tx.source}</span>
                      <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {tx.paymentMethod}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">{tx.timestamp}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                      {tx.itemsSummary}
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-2">
                    <div>
                      <span className="font-mono font-bold text-sm text-emerald-400 tabular-nums block">
                        R$ {tx.total.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-500">{tx.operator.split('-')[0]}</span>
                    </div>

                    <button
                      onClick={() => openReceiptModal(tx)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="Reimprimir Comprovante"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-[#121929]/95 rounded-2xl border border-slate-800/90 shadow-xl p-3.5 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Resumo do Turno Atual</span>
              <span className="font-bold text-slate-200">Operador: Ana Paula · Terminal 01</span>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-orange-400 text-sm">
                {transactions.length} pagamentos concluídos
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
