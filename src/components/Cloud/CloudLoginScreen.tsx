import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Cloud, 
  Lock, 
  Mail, 
  ArrowRight, 
  Tablet, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { useFoodSystem } from '../../context/FoodSystemContext';

export const CloudLoginScreen: React.FC = () => {
  const { cloudLogin, setInterfaceMode, playFeedbackSound, addToast } = useFoodSystem();

  const [email, setEmail] = useState('dono@sistemafood.com.br');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      cloudLogin(email, password);
    }, 800);
  };

  const handleQuickDemoLogin = () => {
    setEmail('dono@sistemafood.com.br');
    setPassword('senha123');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      cloudLogin('dono@sistemafood.com.br', 'senha123');
    }, 600);
  };

  return (
    <div className="w-full h-screen bg-[#070a12] flex flex-col items-center justify-center p-4 text-slate-100 select-none overflow-hidden relative">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Switcher Button to go back to Tablet Mode */}
      <div className="absolute top-4 left-4 sm:left-6">
        <button
          onClick={() => { playFeedbackSound('click'); setInterfaceMode('tablet'); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
        >
          <Tablet className="w-3.5 h-3.5 text-orange-400" />
          <span>Voltar ao Tablet do Salão</span>
        </button>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#121929]/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-md">
        {/* Brand Logo & Cloud Badge */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-orange-500/25">
            <UtensilsCrossed className="w-7 h-7" />
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <h1 className="font-black text-xl text-white tracking-tight">
              Sistema <span className="text-orange-500">Food</span>
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Cloud className="w-3 h-3" />
              <span>NUVEM ONLINE</span>
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Acesso Remoto Exclusivo para Dono & Gerência
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              E-mail do Proprietário:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dono@sistemafood.com.br"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Senha de Acesso:
              </label>
              <button
                type="button"
                onClick={() => addToast('info', 'Recuperação de Senha', 'Instruções enviadas para seu e-mail cadastrado.')}
                className="text-[11px] text-orange-400 hover:underline"
              >
                Esqueci minha senha
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-orange-500/25 pos-btn-press transition-all disabled:opacity-50"
          >
            <span>{isLoading ? 'Autenticando na Nuvem...' : 'Entrar no Dashboard Remoto'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access */}
        <div className="mt-5 pt-4 border-t border-slate-800 text-center space-y-2">
          <button
            onClick={handleQuickDemoLogin}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Acesso Rápido de Demonstração (Dono)</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Criptografia ponta a ponta com o servidor local</span>
          </div>
        </div>
      </div>
    </div>
  );
};
