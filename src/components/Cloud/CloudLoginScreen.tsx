import React, { useState } from 'react';
import { ArrowRight, Cloud, Lock, Mail, ShieldCheck, Sparkles, Tablet, UtensilsCrossed } from 'lucide-react';
import { useFoodSystem } from '../../context/FoodSystemContext';

export const CloudLoginScreen: React.FC = () => {
  const { cloudLogin, cloudRegister, setInterfaceMode, playFeedbackSound, addToast } = useFoodSystem();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantCity, setRestaurantCity] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      if (isRegistering) {
        await cloudRegister(name, email, password, restaurantName, restaurantCity);
      } else {
        await cloudLogin(email, password);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-[#070a12] flex flex-col items-center justify-center p-4 text-slate-100 overflow-hidden relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-4 left-4 sm:left-6">
        <button onClick={() => { playFeedbackSound('click'); setInterfaceMode('tablet'); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white">
          <Tablet className="w-3.5 h-3.5 text-orange-400" /> Voltar ao Tablet do Salão
        </button>
      </div>

      <div className="w-full max-w-md bg-[#121929]/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-md">
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-orange-500/25"><UtensilsCrossed className="w-7 h-7" /></div>
          <div className="flex items-center justify-center gap-2 pt-1"><h1 className="font-black text-xl text-white">Sistema <span className="text-orange-500">Food</span></h1><span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase flex items-center gap-1"><Cloud className="w-3 h-3" /> NUVEM</span></div>
          <p className="text-xs text-slate-400">{isRegistering ? 'Crie a conta do seu restaurante' : 'Acesso seguro para dono e gerência'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && <>
            <Field label="Seu nome" value={name} onChange={setName} required />
            <Field label="Nome do restaurante" value={restaurantName} onChange={setRestaurantName} required />
            <Field label="Cidade" value={restaurantCity} onChange={setRestaurantCity} />
          </>}
          <label className="block text-xs font-semibold text-slate-300">E-mail
            <span className="relative block mt-1"><Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" /><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@restaurante.com" className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500" /></span>
          </label>
          <label className="block text-xs font-semibold text-slate-300">Senha
            <span className="relative block mt-1"><Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" /><input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo de 8 caracteres" className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500" /></span>
          </label>
          <button disabled={isLoading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl disabled:opacity-50">
            <span>{isLoading ? 'Aguarde...' : isRegistering ? 'Criar conta do restaurante' : 'Entrar no Dashboard Remoto'}</span><ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-800 text-center space-y-2">
          <button type="button" onClick={() => setIsRegistering((current) => !current)} className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold flex items-center justify-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-orange-400" />{isRegistering ? 'Já tenho uma conta' : 'Criar conta do restaurante'}</button>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Credenciais protegidas por sessão</div>
          {!isRegistering && <button type="button" onClick={() => addToast('info', 'Recuperação de senha', 'A recuperação de senha será disponibilizada na próxima etapa.')} className="text-[11px] text-orange-400 hover:underline">Esqueci minha senha</button>}
        </div>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; value: string; onChange: (value: string) => void; required?: boolean }> = ({ label, value, onChange, required }) => (
  <label className="block text-xs font-semibold text-slate-300">{label}<input type="text" required={required} value={value} onChange={(event) => onChange(event.target.value)} className="w-full mt-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500" /></label>
);
