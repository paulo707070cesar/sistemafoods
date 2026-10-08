import React from 'react';
import { Printer, X, CheckCircle2 } from 'lucide-react';
import { useFoodSystem } from '../context/FoodSystemContext';

export const ReceiptModal: React.FC = () => {
  const { receiptModalData, closeReceiptModal } = useFoodSystem();

  if (!receiptModalData.isOpen) return null;

  const { transaction, tableSummary } = receiptModalData;

  const handlePrint = () => {
    window.print();
  };

  const isCompletedTx = !!transaction;
  const source = transaction ? transaction.source : tableSummary?.source || 'Mesa 05';
  const waiter = transaction ? transaction.waiter : tableSummary?.waiter || 'Marcos Vinicius';
  const operator = transaction ? transaction.operator : 'Caixa 01 - Ana Paula';
  const subtotal = transaction ? transaction.subtotal : tableSummary?.subtotal || 0;
  const serviceTax = transaction ? transaction.serviceTax : tableSummary?.serviceTax || 0;
  const discount = transaction ? transaction.discount : tableSummary?.discount || 0;
  const total = transaction ? transaction.total : tableSummary?.total || 0;
  const timestamp = transaction ? transaction.timestamp : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const items = tableSummary?.items || [];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none print:p-0 print:bg-white">
      <div className="bg-[#141b2d] border border-slate-700 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[92vh] print:border-none print:shadow-none print:w-full print:max-w-none">
        {/* Header */}
        <div className="p-4 bg-[#1a233a] border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-orange-400" />
            <h3 className="font-bold text-white text-sm">
              {isCompletedTx ? 'Comprovante de Pagamento' : 'Prévia da Conta / Conferência'}
            </h3>
          </div>
          <button onClick={closeReceiptModal} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Realistic Thermal Receipt Body */}
        <div className="p-5 bg-white text-slate-900 font-mono text-xs overflow-y-auto leading-relaxed shadow-inner">
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <div className="font-extrabold text-base tracking-wider uppercase text-black">
              SISTEMA FOOD
            </div>
            <div className="text-[11px] text-slate-700">BAR & RESTAURANTE LTDA</div>
            <div className="text-[10px] text-slate-600 mt-0.5">CNPJ: 12.345.678/0001-90</div>
            <div className="text-[10px] text-slate-600">Av. Gastronômica, 1000 - Centro</div>
            <div className="text-[10px] text-slate-500 mt-1">DOCUMENTO AUXILIAR NÃO FISCAL</div>
          </div>

          <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span>ORIGEM: <strong>{source}</strong></span>
              <span>HORA: <strong>{timestamp}</strong></span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>ATENDENTE: {waiter}</span>
              <span>DATA: {new Date().toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="text-slate-600">OPERADOR: {operator}</div>
          </div>

          {/* Items Breakdown if provided */}
          {items.length > 0 && (
            <div className="py-2.5 border-b border-dashed border-slate-300">
              <div className="flex justify-between font-bold text-[10px] text-slate-500 uppercase mb-1">
                <span>ITEM / DESCRIÇÃO</span>
                <span>TOTAL</span>
              </div>
              <div className="space-y-1 text-[11px]">
                {items.map((it: any) => (
                  <div key={it.id} className="flex justify-between">
                    <span className="truncate pr-2">
                      {it.qty}x {it.name}
                    </span>
                    <span className="shrink-0 tabular-nums">R$ {it.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-xs">
            <div className="flex justify-between text-slate-700">
              <span>Subtotal:</span>
              <span className="tabular-nums">R$ {subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-amber-700">
                <span>Desconto:</span>
                <span className="tabular-nums">- R$ {discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-700">
              <span>Taxa de Serviço (10%):</span>
              <span className="tabular-nums">R$ {serviceTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-black text-sm text-black pt-1.5 border-t border-slate-200">
              <span>TOTAL A PAGAR:</span>
              <span className="tabular-nums">R$ {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Transaction Payment Method Details */}
          {transaction && (
            <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span>FORMA PGTO:</span>
                <span className="uppercase font-bold">{transaction.paymentMethod}</span>
              </div>
              {transaction.cashReceived && (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>VALOR RECEBIDO:</span>
                    <span>R$ {transaction.cashReceived.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-800">
                    <span>TROCO:</span>
                    <span>R$ {(transaction.change || 0).toFixed(2)}</span>
                  </div>
                </>
              )}
              {transaction.installments && (
                <div className="flex justify-between text-slate-600">
                  <span>PARCELAS:</span>
                  <span>{transaction.installments}x</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500 text-[10px] pt-1">
                <span>AUTORIZAÇÃO:</span>
                <span>{transaction.id}</span>
              </div>
            </div>
          )}

          <div className="text-center pt-3 text-[10px] text-slate-500">
            <div>Obrigado pela preferência! Volte sempre.</div>
            <div className="mt-1">Sistema Food - Software para Restaurantes</div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#1a233a] border-t border-slate-800 flex items-center justify-between gap-3 print:hidden">
          <button
            onClick={closeReceiptModal}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Fechar
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2 shadow-lg shadow-orange-500/20 pos-btn-press"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Recibo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
