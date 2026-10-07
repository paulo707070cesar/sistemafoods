import React from 'react';
import { QrCode, Printer, Smartphone, X, Sparkles, UtensilsCrossed } from 'lucide-react';
import { useFoodSystem } from '../context/FoodSystemContext';

export const QRCodeModal: React.FC = () => {
  const { 
    qrCodeModalOpen, 
    qrCodeModalTable, 
    closeQRCodeModal, 
    setInterfaceMode, 
    setCustomerSelectedTable, 
    setCustomerScreenStep,
    playFeedbackSound 
  } = useFoodSystem();

  if (!qrCodeModalOpen) return null;

  const handleTestInMobile = () => {
    playFeedbackSound('click');
    setCustomerSelectedTable(qrCodeModalTable);
    setCustomerScreenStep('welcome');
    setInterfaceMode('mobile_customer');
    closeQRCodeModal();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 select-none print:p-0 print:bg-white">
      <div className="bg-[#121929] border border-slate-700 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col print:border-none print:shadow-none print:w-full print:max-w-none">
        {/* Header */}
        <div className="p-4 bg-[#182238] border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-orange-400" />
            <h3 className="font-bold text-white text-sm">
              Placa de Mesa QR Code — {qrCodeModalTable}
            </h3>
          </div>
          <button onClick={closeQRCodeModal} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Realistic Tabletop Acrylic Stand Printout */}
        <div className="p-6 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-center flex flex-col items-center justify-center border-b border-slate-800 text-white">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 mb-2 border border-orange-400/40">
            <UtensilsCrossed className="w-6 h-6" />
          </div>

          <div className="font-black text-lg tracking-tight">
            Sistema <span className="text-orange-500">Food</span>
          </div>
          <div className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">
            Cardápio Digital Interativo
          </div>

          {/* Table Number Standout */}
          <div className="my-4 px-4 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 font-black text-sm">
            {qrCodeModalTable}
          </div>

          {/* High-Fidelity SVG QR Code */}
          <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center relative">
            {/* Detailed Simulated QR Code */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
              {/* Corner 1 */}
              <rect x="5" y="5" width="26" height="26" fill="black" rx="2" />
              <rect x="9" y="9" width="18" height="18" fill="white" rx="1" />
              <rect x="13" y="13" width="10" height="10" fill="black" rx="1" />

              {/* Corner 2 */}
              <rect x="69" y="5" width="26" height="26" fill="black" rx="2" />
              <rect x="73" y="9" width="18" height="18" fill="white" rx="1" />
              <rect x="77" y="13" width="10" height="10" fill="black" rx="1" />

              {/* Corner 3 */}
              <rect x="5" y="69" width="26" height="26" fill="black" rx="2" />
              <rect x="9" y="73" width="18" height="18" fill="white" rx="1" />
              <rect x="13" y="77" width="10" height="10" fill="black" rx="1" />

              {/* Data modules pattern */}
              <rect x="36" y="8" width="6" height="6" fill="black" />
              <rect x="46" y="8" width="6" height="6" fill="black" />
              <rect x="56" y="8" width="6" height="6" fill="black" />
              <rect x="36" y="18" width="6" height="6" fill="black" />
              <rect x="50" y="22" width="6" height="6" fill="black" />
              <rect x="8" y="36" width="6" height="6" fill="black" />
              <rect x="18" y="46" width="6" height="6" fill="black" />
              <rect x="24" y="56" width="6" height="6" fill="black" />
              <rect x="70" y="36" width="6" height="6" fill="black" />
              <rect x="80" y="44" width="6" height="6" fill="black" />
              <rect x="64" y="52" width="6" height="6" fill="black" />
              <rect x="38" y="68" width="6" height="6" fill="black" />
              <rect x="48" y="76" width="6" height="6" fill="black" />
              <rect x="58" y="84" width="6" height="6" fill="black" />
              <rect x="68" y="70" width="6" height="6" fill="black" />
              <rect x="78" y="82" width="6" height="6" fill="black" />

              {/* Center icon in QR code */}
              <rect x="40" y="40" width="20" height="20" fill="white" rx="3" />
              <circle cx="50" cy="50" r="8" fill="#f97316" />
            </svg>
          </div>

          <p className="text-xs text-slate-300 mt-4 font-semibold">
            Aponte a câmera do seu celular para fazer seu pedido
          </p>
          <span className="text-[10px] text-slate-500 mt-0.5">
            Sem baixar aplicativo · Seguro & Instantâneo
          </span>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#182238] flex flex-col gap-2 print:hidden">
          <button
            onClick={handleTestInMobile}
            className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 pos-btn-press"
          >
            <Smartphone className="w-4 h-4" />
            <span>Simular Abertura no Celular</span>
          </button>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={closeQRCodeModal}
              className="py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Fechar
            </button>

            <button
              onClick={handlePrint}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Plaquinha</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
