import React, { createContext, useContext, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null); // { message, type: 'info' | 'success' | 'warning' | 'error', title }

  const showToast = (message, type = 'info', title = null) => {
    setToast({ message, type, title });
    // Auto dismiss toast after 4 seconds
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const closeToast = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast, closeToast }}>
      {children}
      {/* GLOBAL LUXURY UI POPUP NOTIFICATION */}
      {toast && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-onyx-950 text-beige-50 border-2 border-gold-500/60 p-6 rounded-lg max-w-md w-full shadow-2xl space-y-4 relative">
            <button
              onClick={closeToast}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="mt-0.5 shrink-0">
                {toast.type === 'success' && <CheckCircle2 className="w-7 h-7 text-green-500" />}
                {toast.type === 'error' && <XCircle className="w-7 h-7 text-red-500" />}
                {toast.type === 'warning' && <AlertCircle className="w-7 h-7 text-gold-500" />}
                {toast.type === 'info' && <Info className="w-7 h-7 text-gold-400" />}
              </div>

              <div className="space-y-1 pr-4">
                <h4 className="font-serif font-bold text-base text-gold-500 tracking-wide uppercase">
                  {toast.title || (toast.type === 'error' ? 'Notice' : toast.type === 'warning' ? 'Authentication Required' : 'Aurelia Notification')}
                </h4>
                <p className="text-xs text-gray-200 leading-relaxed">{toast.message}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={closeToast}
                className="bg-gold-500 text-onyx-950 font-semibold px-5 py-2 rounded text-xs uppercase tracking-wider hover:bg-gold-400 transition-colors shadow"
              >
                Understand & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
