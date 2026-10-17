import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast, language } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      className={`fixed bottom-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none ${
        language === 'ar' ? 'left-4' : 'right-4'
      }`}
    >
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />,
          info: <Info className="w-4 h-4 text-teal-600 shrink-0" />,
        };

        const borders = {
          success: 'border-emerald-200 bg-white shadow-lg',
          warning: 'border-amber-200 bg-white shadow-lg',
          error: 'border-red-200 bg-white shadow-lg',
          info: 'border-teal-200 bg-white shadow-lg',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 p-3 rounded-xl border text-xs font-medium text-slate-800 transition-all ${borders[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 leading-snug">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 -mr-1 -mt-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
