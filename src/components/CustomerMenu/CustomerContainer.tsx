import React, { useState } from 'react';
import { Tablet, Smartphone, Sparkles, ArrowLeft, QrCode, BookOpen } from 'lucide-react';
import { useFoodSystem } from '../../context/FoodSystemContext';
import { CustomerWelcome } from './CustomerWelcome';
import { CustomerMenuHome } from './CustomerMenuHome';
import { CustomerCartDrawer } from './CustomerCartDrawer';
import { CustomerOrderStatus } from './CustomerOrderStatus';
import { CustomerPayment } from './CustomerPayment';
import { ConnectionStatusBadge } from '../Network/ConnectionStatusBadge';

export const CustomerContainer: React.FC = () => {
  const { 
    customerScreenStep, 
    setInterfaceMode, 
    setActiveScreen,
    customerSelectedTable,
    playFeedbackSound 
  } = useFoodSystem();

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  return (
    <div className="w-full h-screen bg-[#070a12] flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
      {/* Top Bar for Switcher */}
      <div className="w-full max-w-[390px] flex items-center justify-between pb-2 text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { playFeedbackSound('click'); setInterfaceMode('tablet'); }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 font-bold hover:bg-orange-500/25 transition-colors shrink-0"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Salão</span>
          </button>

          <button
            onClick={() => { 
              playFeedbackSound('click'); 
              setInterfaceMode('tablet'); 
              setActiveScreen('instrucoes');
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 font-bold hover:bg-slate-700 transition-colors shrink-0"
            title="Ver Manual de Instruções"
          >
            <BookOpen className="w-3.5 h-3.5 text-orange-400" />
            <span>Manual</span>
          </button>
        </div>

        <ConnectionStatusBadge />
      </div>

      {/* Realistic Mobile Device Frame (iPhone / Android) */}
      <div className="w-full max-w-[390px] h-[calc(100vh-3.5rem)] max-h-[820px] bg-[#1a1f2c] rounded-[44px] p-3 border-[3px] border-[#2d3748] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.05)] relative flex flex-col overflow-hidden">
        {/* Dynamic Island / Camera Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#0a0d14] rounded-full z-40 flex items-center justify-end px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/60 shadow-inner flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-blue-900/80"></div>
          </div>
        </div>

        {/* Screen Content Wrapper */}
        <div className="w-full h-full bg-[#0b101c] rounded-[34px] overflow-hidden flex flex-col relative pt-6 shadow-inner">
          {customerScreenStep === 'welcome' && <CustomerWelcome />}
          {customerScreenStep === 'menu' && (
            <CustomerMenuHome onOpenCart={() => setCartDrawerOpen(true)} />
          )}
          {customerScreenStep === 'status' && <CustomerOrderStatus />}
          {customerScreenStep === 'pagamento' && <CustomerPayment />}

          {/* Cart Drawer */}
          <CustomerCartDrawer
            isOpen={cartDrawerOpen}
            onClose={() => setCartDrawerOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};

