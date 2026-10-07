import React, { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  LayoutGrid, 
  ReceiptText, 
  CircleDollarSign, 
  Package, 
  Tablet, 
  Maximize2, 
  Clock, 
  User, 
  BellRing,
  ChefHat,
  QrCode,
  Smartphone,
  Calculator,
  BarChart3,
  Radio,
  Layers,
  Cloud,
  BookOpen
} from 'lucide-react';
import { useFoodSystem } from '../context/FoodSystemContext';
import { ActiveScreen } from '../types';
import { ConnectionStatusBadge } from './Network/ConnectionStatusBadge';

export const Header: React.FC = () => {
  const { 
    activeScreen, 
    setActiveScreen, 
    tabletFrameMode, 
    toggleTabletFrameMode, 
    activeTable,
    transactions,
    digitalOrders,
    setPendingDigitalOrderToReview,
    openQRCodeModal,
    setInterfaceMode,
    playFeedbackSound 
  } = useFoodSystem();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalHoje = transactions.reduce((acc, tx) => acc + tx.total, 0);

  // Digital orders awaiting approval
  const pendingDigitalOrders = digitalOrders.filter(o => o.status === 'aguardando');

  const navItems: { id: ActiveScreen; label: string; icon: React.ReactNode }[] = [
    { id: 'pdv', label: '1. PDV', icon: <ReceiptText className="w-4 h-4" /> },
    { id: 'mesas', label: '2. Mesas', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'caixa', label: '3. Caixa', icon: <CircleDollarSign className="w-4 h-4" /> },
    { id: 'estoque', label: '4. Estoque', icon: <Package className="w-4 h-4" /> },
    { id: 'kds', label: '5. KDS', icon: <ChefHat className="w-4 h-4" /> },
    { id: 'fichas', label: '6. Fichas', icon: <Calculator className="w-4 h-4" /> },
    { id: 'dashboard', label: '7. Painel', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'rede', label: '8. Rede', icon: <Radio className="w-4 h-4" /> },
    { id: 'sync_queue', label: '9. Fila', icon: <Layers className="w-4 h-4" /> },
    { id: 'instrucoes', label: '10. Instruções', icon: <BookOpen className="w-4 h-4" /> },
  ];

  const handleNavClick = (screen: ActiveScreen) => {
    playFeedbackSound('click');
    setActiveScreen(screen);
  };

  const handleOpenPendingReview = () => {
    if (pendingDigitalOrders.length > 0) {
      setPendingDigitalOrderToReview(pendingDigitalOrders[0]);
    }
  };

  return (
    <header className="min-h-[3.5rem] bg-[#0e1424] border-b border-slate-800/80 px-2 sm:px-4 py-1.5 flex items-center justify-between shrink-0 select-none z-30 gap-2">
      {/* Brand & Context */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 shrink-0">
            <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm sm:text-base tracking-tight text-white flex items-center gap-1 whitespace-nowrap">
                Sistema <span className="text-orange-500">Food</span>
              </span>
              <span className="hidden 2xl:inline text-[9px] tracking-wider font-semibold uppercase px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 whitespace-nowrap">
                PRO BAR & RESTO
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-[10px] text-slate-400 whitespace-nowrap">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Caixa Aberto
              </span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-slate-300">R$ {totalHoje.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Real-Time Pending Digital Order Alert Banner in Header */}
        {pendingDigitalOrders.length > 0 && (
          <button
            onClick={handleOpenPendingReview}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500 text-white font-extrabold text-xs shadow-md shadow-orange-500/30 animate-pulse transition-all pos-btn-press shrink-0 whitespace-nowrap"
            title="Clique para revisar pedido digital"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>{pendingDigitalOrders.length} Novo{pendingDigitalOrders.length > 1 ? 's' : ''} QR</span>
          </button>
        )}

        {/* Network & Connectivity Status Capsule */}
        <div className="hidden lg:block shrink-0">
          <ConnectionStatusBadge />
        </div>
      </div>

      {/* Main Navigation tabs - Expansível com espaçamento perfeito */}
      <nav className="flex-1 min-w-0 flex items-center justify-start xl:justify-center gap-1.5 bg-[#121829] p-1.5 rounded-xl border border-slate-800/90 overflow-x-auto no-scrollbar scroll-smooth mx-1 sm:mx-2">
        {navItems.map(item => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap pos-btn-press ${
                isActive 
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30 ring-1 ring-orange-400/40' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 bg-slate-900/50 border border-slate-800/50'
              }`}
            >
              <span className={`p-1 rounded-md ${isActive ? 'bg-orange-600/60 text-white' : 'text-orange-400 bg-slate-800'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Tools & Switch to Customer / Cloud View */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Placa QR Code Generator */}
        <button
          onClick={() => openQRCodeModal(activeTable.number)}
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors shrink-0"
          title="Gerar e Imprimir QR Code da Mesa"
        >
          <QrCode className="w-3.5 h-3.5 text-orange-400" />
          <span>Placa QR Mesa</span>
        </button>

        {/* Cloud Login / Remote Dashboard Switcher */}
        <button
          onClick={() => {
            playFeedbackSound('click');
            setInterfaceMode('cloud_login');
          }}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 transition-colors shrink-0"
          title="Acessar versão Nuvem Remota (Dono)"
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>Acesso Nuvem</span>
        </button>

        {/* View Customer Mobile Menu Button */}
        <button
          onClick={() => {
            playFeedbackSound('click');
            setInterfaceMode('mobile_customer');
          }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 border border-orange-500/40 text-orange-400 transition-colors shadow-xs shrink-0 whitespace-nowrap"
          title="Ver como o cliente no celular"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Ver no Celular</span>
        </button>

        {/* Tablet Frame Mode Toggle */}
        <button
          onClick={toggleTabletFrameMode}
          title={tabletFrameMode ? "Alternar para Modo Tela Cheia" : "Alternar para Moldura de Tablet (iPad Paisagem)"}
          className={`hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors shrink-0 ${
            tabletFrameMode 
              ? 'bg-orange-500/15 border-orange-500/40 text-orange-400' 
              : 'bg-slate-800/70 border-slate-700/80 text-slate-300 hover:bg-slate-800'
          }`}
        >
          {tabletFrameMode ? <Maximize2 className="w-3.5 h-3.5" /> : <Tablet className="w-3.5 h-3.5" />}
          <span className="hidden xl:inline">{tabletFrameMode ? "Modo Tela" : "Moldura"}</span>
        </button>

        {/* Real-time Clock */}
        <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-200 font-mono shrink-0">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{currentTime || '12:00'}</span>
        </div>
      </div>
    </header>
  );
};

