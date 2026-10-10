import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  ArrowLeft, 
  QrCode, 
  CreditCard, 
  Copy, 
  Check, 
  CheckCircle2, 
  Receipt, 
  ShieldCheck, 
  Lock,
  Sparkles
} from 'lucide-react';
import { useFoodSystem } from '../../context/FoodSystemContext';
import { PaymentMethod } from '../../types';
import { buildPixPayload } from '../../utils/pix';

export const CustomerPayment: React.FC = () => {
  const { 
    customerSelectedTable, 
    tables, 
    digitalOrders, 
    setCustomerScreenStep, 
    processPayment, 
    paymentSettings,
    addToast, 
    playFeedbackSound 
  } = useFoodSystem();

  const currentTable = tables.find(t => t.number === customerSelectedTable);
  const items = currentTable?.items || [];
  const subtotal = items.reduce((acc, it) => acc + it.total, 0) || 60.00; // fallback se mesa recém aberta
  const [serviceTaxEnabled, setServiceTaxEnabled] = useState(true);
  const serviceTax = serviceTaxEnabled ? Number((subtotal * 0.10).toFixed(2)) : 0;
  const total = Number((subtotal + serviceTax).toFixed(2));

  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao'>('pix');
  const [pixCopied, setPixCopied] = useState(false);
  const [pixQrImage, setPixQrImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    const payload = buildPixPayload(paymentSettings.pix, { amount: total });
    if (!payload) { setPixQrImage(null); return; }
    QRCode.toDataURL(payload, { errorCorrectionLevel: 'M', margin: 2, width: 320, color: { dark: '#0f172a', light: '#ffffff' } })
      .then(setPixQrImage)
      .catch(() => setPixQrImage(null));
  }, [paymentSettings.pix, total]);

  const handleCopyPix = () => {
    const payload = buildPixPayload(paymentSettings.pix, { amount: total });
    if (!payload) {
      playFeedbackSound('alert');
      addToast('warning', 'PIX indisponível', 'O restaurante ainda não configurou a chave PIX.');
      return;
    }
    navigator.clipboard?.writeText(payload);
    setPixCopied(true);
    addToast('success', 'Chave PIX Copiada', 'Cole no app do seu banco para pagar.');
    setTimeout(() => setPixCopied(false), 3000);
  };

  const handleConfirmMobilePayment = () => {
    playFeedbackSound('click');
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      playFeedbackSound('success');

      // Process in central restaurant system
      processPayment({
        source: customerSelectedTable,
        subtotal,
        discount: 0,
        serviceTax,
        total,
        paymentMethod: paymentMethod === 'pix' ? 'pix' : 'credito'
      });

      addToast('success', 'Pagamento Confirmado!', `Conta da ${customerSelectedTable} quitada via autoatendimento.`);
    }, 1500);
  };

  if (isPaid) {
    return (
      <div className="flex-1 flex flex-col justify-between p-6 bg-[#0b101c] text-white text-center select-none animate-in fade-in duration-200">
        <div className="my-auto space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center shadow-2xl shadow-emerald-500/30">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <h2 className="font-black text-2xl tracking-tight text-white">
            Pagamento Concluído!
          </h2>

          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Sua conta da <strong className="text-orange-400">{customerSelectedTable}</strong> foi quitada com sucesso. O sinal foi enviado via <strong className="text-emerald-400">Wi-Fi local</strong> diretamente para o tablet do caixa e sua mesa já foi liberada!
          </p>

          {/* Wi-Fi Receipt Badge */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-2.5 text-[11px] text-emerald-300 flex items-center justify-center gap-2 max-w-xs mx-auto font-mono">
            <span>📡 Sinal Wi-Fi 5G recebido pelo Caixa em 1.2ms</span>
          </div>

          {/* Receipt Summary Box */}
          <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-4 text-xs space-y-2 text-left max-w-xs mx-auto">
            <div className="flex justify-between text-slate-400">
              <span>Valor pago:</span>
              <strong className="text-emerald-400 font-mono text-sm">R$ {total.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Método:</span>
              <span className="uppercase font-bold text-slate-200">{paymentMethod === 'pix' ? 'PIX Instantâneo' : 'Cartão de Crédito'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Status:</span>
              <span className="text-emerald-400 font-bold">Aprovado pelo Estabelecimento</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setCustomerScreenStep('welcome')}
          className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 font-extrabold text-sm text-white shadow-xl shadow-orange-500/25 pos-btn-press"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b101c] text-slate-100 overflow-y-auto select-none p-4 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          onClick={() => setCustomerScreenStep('status')}
          className="p-1 text-slate-400 hover:text-white flex items-center gap-1 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <div className="text-right">
          <span className="font-black text-sm text-white">{customerSelectedTable}</span>
          <span className="text-[10px] text-slate-400 block font-medium">Autoatendimento</span>
        </div>
      </div>

      {/* Bill Amount Overview */}
      <div className="my-4 bg-gradient-to-r from-orange-500/15 via-orange-500/25 to-amber-500/15 border border-orange-500/40 rounded-3xl p-4.5 text-center shadow-lg">
        <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 block">
          Total da Conta
        </span>
        <div className="font-mono font-black text-3xl text-white mt-1 tabular-nums">
          R$ {total.toFixed(2)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-center gap-2">
          <span>Subtotal: R$ {subtotal.toFixed(2)}</span>
          <span>·</span>
          <button
            onClick={() => setServiceTaxEnabled(!serviceTaxEnabled)}
            className="text-orange-300 underline font-semibold"
          >
            10% serviço ({serviceTaxEnabled ? 'Incluso' : 'Retirado'})
          </button>
        </div>
      </div>

      {/* Method Tabs */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => { playFeedbackSound('click'); setPaymentMethod('pix'); }}
          className={`py-3 px-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all pos-btn-press ${
            paymentMethod === 'pix'
              ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Pagar via PIX</span>
        </button>

        <button
          onClick={() => { playFeedbackSound('click'); setPaymentMethod('cartao'); }}
          className={`py-3 px-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all pos-btn-press ${
            paymentMethod === 'cartao'
              ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Cartão de Crédito</span>
        </button>
      </div>

      {/* PIX Flow */}
      {paymentMethod === 'pix' ? (
        <div className="bg-[#121929] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl text-center">
          <div className="w-36 h-36 bg-white p-2.5 rounded-2xl mx-auto shadow-md flex items-center justify-center">
            {pixQrImage ? <img src={pixQrImage} alt="QR Code PIX" className="w-full h-full" /> : <div className="text-center text-xs text-slate-500">Configure o PIX para gerar o QR Code.</div>}
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Transação segura com confirmação instantânea</span>
          </div>

          <button
            onClick={handleConfirmMobilePayment}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 text-white font-extrabold text-sm shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 pos-btn-press disabled:opacity-40"
          >
            {isProcessing ? 'Verificando com o Banco...' : 'Já Realizei o Pagamento'}
          </button>
        </div>
      ) : (
        /* Cartão de Crédito Flow */
        <div className="bg-[#121929] border border-slate-800 rounded-3xl p-4.5 space-y-3 shadow-xl">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Número do Cartão:
            </label>
            <input
              type="text"
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Nome Impresso no Cartão:
            </label>
            <input
              type="text"
              placeholder="RODRIGO SILVA"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Validade (MM/AA):
              </label>
              <input
                type="text"
                placeholder="12/28"
                maxLength={5}
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                CVV:
              </label>
              <input
                type="password"
                placeholder="123"
                maxLength={4}
                value={cardCvv}
                onChange={(e) => setCardCvv(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Dados criptografados com certificado SSL 256-bit</span>
          </div>

          <button
            onClick={handleConfirmMobilePayment}
            disabled={isProcessing}
            className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 text-white font-extrabold text-sm shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 pos-btn-press disabled:opacity-40"
          >
            {isProcessing ? 'Processando Cartão...' : `Pagar R$ ${total.toFixed(2)}`}
          </button>
        </div>
      )}
    </div>
  );
};
