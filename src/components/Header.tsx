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
  BookOpen,
  ShieldCheck,
  UserCheck,
  Flame,
  Wallet,
  ChevronDown
} from 'lucide-react';
import { useFoodSystem, USER_ROLES_CONFIG } from '../context/FoodSystemContext';
import { ActiveScreen, UserRole } from '../types';
import { ConnectionStatusBadge } from './Network/ConnectionStatusBadge';

export const Header: React.FC = () => {
  const { 
    activeScreen, 
    setActiveScreen, 
    userRole,
    setUserRole,
    userRoleConfig,
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
  const [roleMenuOpen, setRoleMenuOpen] = useState<boolean>(false);

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

  const allNavItems: { id: ActiveScreen; label: string; icon: React.ReactNode; category: 'operacao' | 'cozinha' | 'gestao' | 'sistema' }[] = [
    { id: 'pdv', label: '1. PDV', icon: <ReceiptText className="w-4 h-4" />, category: 'operacao' },
    { id: 'mesas', label: '2. Mesas', icon: <LayoutGrid className="w-4 h-4" />, category: 'operacao' },
    { id: 'caixa', label: '3. Caixa', icon: <CircleDollarSign className="w-4 h-4" />, category: 'gestao' },
    { id: 'estoque', label: '4. Estoque', icon: <Package className="w-4 h-4" />, category: 'gestao' },
    { id: 'kds', label: '5. KDS', icon: <ChefHat className="w-4 h-4" />, category: 'cozinha' },
    { id: 'fichas', label: '6. Fichas', icon: <Calculator className="w-4 h-4" />, category: 'cozinha' },
    { id: 'dashboard', label: '7. Painel', icon: <BarChart3 className="w-4 h-4" />, category: 'gestao' },
    { id: 'rede', label: '8. Rede', icon: <Radio className="w-4 h-4" />, category: 'sistema' },
    { id: 'sync_queue', label: '9. Fila Sync', icon: <Layers className="w-4 h-4" />, category: 'sistema' },
    { id: 'instrucoes', label: '10. Ajuda', icon: <BookOpen className="w-4 h-4" />, category: 'sistema' },
  ];

  // Filter items based on active role
  const allowedNavItems = allNavItems.filter(item => userRoleConfig.allowedScreens.includes(item.id));

  const roleIcons: Record<UserRole, React.ReactNode> = {
    gerente: <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />,
    garcom: <UserCheck className="w-3.5 h-3.5 text-blue-400" />,
    cozinha: <Flame className="w-3.5 h-3.5 text-orange-400" />,
    caixa: <Wallet className="w-3.5 h-3.5 text-emerald-400" />
  };

  const handleNavClick = (screen: ActiveScreen) => {
    playFeedbackSound('click');
    setActiveScreen(screen);
  };

  const handleRoleSelect = (role: UserRole) => {
    playFeedbackSound('click');
    setUserRole(role);
    setRoleMenuOpen(false);
  };

  const handleOpenPendingReview = () => {
    if (pendingDigitalOrders.length > 0) {
      setPendingDigitalOrderToReview(pendingDigitalOrders[0]);
    }
  };

  return (
    <header className="min-h-[3.75rem] bg-[#0e1424] border-b border-slate-800/80 px-2 sm:px-4 py-1.5 flex items-center justify-between shrink-0 select-none z-30 gap-2 sm:gap-3">
      {/* Left: Brand & Cargo Selector */}
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

        {/* Cargo Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-orange-500/50 text-xs font-bold text-slate-200 transition-all pos-btn-press shrink-0"
            title="Alternar Perfil / Cargo de Acesso"
          >
            <span className={`p-1 rounded-md bg-gradient-to-r ${userRoleConfig.color}`}>
              {roleIcons[userRole]}
            </span>
            <span className="hidden sm:inline text-white font-extrabold">{userRoleConfig.shortLabel}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {roleMenuOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-56 bg-[#121929] border border-slate-700/80 rounded-xl shadow-2xl py-1.5 z-50 animate-fadeIn">
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                Alternar Cargo / Perfil
              </div>
              {(Object.keys(USER_ROLES_CONFIG) as UserRole[]).map((rKey) => {
                const conf = USER_ROLES_CONFIG[rKey];
                const isCurrent = userRole === rKey;
                return (
                  <button
                    key={rKey}
                    onClick={() => handleRoleSelect(rKey)}
                    className={`w-full text-left px-3 py-2 flex items-start gap-2 text-xs transition-colors ${
                      isCurrent 
                        ? 'bg-orange-500/15 text-orange-400 font-bold' 
                        : 'text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <span className={`mt-0.5 p-1 rounded ${isCurrent ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {roleIcons[rKey]}
                    </span>
                    <div>
                      <div className="font-bold text-slate-100 flex items-center justify-between">
                        <span>{conf.label}</span>
                        {isCurrent && <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">Ativo</span>}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{conf.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
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
        <div className="hidden 2xl:block shrink-0">
          <ConnectionStatusBadge />
        </div>
      </div>

      {/* Main Navigation tabs - Clean e Filtrado por Cargo */}
      <nav className="flex-1 min-w-0 flex items-center justify-start lg:justify-center gap-1.5 bg-[#121829] p-1.5 rounded-xl border border-slate-800/90 overflow-x-auto no-scrollbar scroll-smooth mx-1 sm:mx-2">
        {allowedNavItems.map(item => {
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
          <span>Nuvem</span>
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
          <span>Celular</span>
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
