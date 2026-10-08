import React from 'react';
import { Tablet, Maximize2, Sparkles } from 'lucide-react';
import { useFoodSystem } from '../context/FoodSystemContext';

export const TabletFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tabletFrameMode, toggleTabletFrameMode } = useFoodSystem();

  if (!tabletFrameMode) {
    return <div className="w-full h-full flex flex-col">{children}</div>;
  }

  return (
    <div className="w-full h-screen bg-[#070a12] p-2 sm:p-4 lg:p-6 flex flex-col items-center justify-center overflow-hidden">
      {/* Simulator Control Bar */}
      <div className="w-full max-w-[1360px] flex items-center justify-between pb-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-slate-300">Simulador de Tablet 12.9" (Modo Paisagem)</span>
          <span className="text-slate-600">·</span>
          <span className="text-[11px] text-slate-500">Resolução Nativa Otimizada: 2048 x 1536</span>
        </div>
        <button
          onClick={toggleTabletFrameMode}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 font-bold hover:bg-orange-500/25 transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Tela Cheia / Kiosk</span>
        </button>
      </div>

      {/* Realistic Hardware Tablet Bezel */}
      <div className="w-full max-w-[1360px] h-[calc(100vh-4rem)] bg-[#1a1f2c] rounded-[36px] p-3.5 sm:p-4 border-[3px] border-[#2d3748] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.05)] relative flex flex-col">
        {/* Front-Facing Camera & Ambient Sensor */}
        <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 flex flex-col items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0d1117] border border-slate-700/60 shadow-inner flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-blue-950/80"></div>
          </div>
        </div>

        {/* Display Screen */}
        <div className="w-full h-full bg-[#0b101c] rounded-[24px] overflow-hidden flex flex-col shadow-inner relative border border-slate-800/80">
          {children}
        </div>
      </div>
    </div>
  );
};
