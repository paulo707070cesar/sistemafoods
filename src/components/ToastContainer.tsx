import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useFoodSystem } from '../context/FoodSystemContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useFoodSystem();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none select-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
        let border = 'border-emerald-500/30';
        let bg = 'bg-[#152336]/95';

        if (toast.type === 'warning' || toast.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
          border = 'border-rose-500/30';
          bg = 'bg-[#291624]/95';
        } else if (toast.type === 'info') {
          icon = <Info className="w-4 h-4 text-orange-400 shrink-0" />;
          border = 'border-orange-500/30';
          bg = 'bg-[#1f1d2e]/95';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 p-3 rounded-xl border ${border} ${bg} shadow-2xl backdrop-blur-md text-xs animate-in fade-in slide-in-from-bottom-2 duration-200`}
          >
            {icon}
            <div className="flex-1 min-w-0 pr-1">
              <span className="font-bold text-slate-100 block truncate">{toast.title}</span>
              <span className="text-slate-400 text-[11px] block">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
