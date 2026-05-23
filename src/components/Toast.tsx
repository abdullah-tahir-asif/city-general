import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icon = (type: ToastType) => {
    if (type === 'success') return <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />;
    if (type === 'error') return <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />;
    return <Info className="w-4 h-4 text-cyan-600 shrink-0" />;
  };

  const styles = (type: ToastType) => {
    if (type === 'success') return 'border-emerald-200 bg-emerald-50/95 text-emerald-950';
    if (type === 'error') return 'border-red-200 bg-red-50/95 text-red-950';
    return 'border-cyan-200 bg-white/95 text-slate-900';
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0 sm:w-auto"
        role="region"
        aria-live="polite"
        aria-label="Notifications"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className={`toast-enter pointer-events-auto flex items-start gap-2.5 p-3.5 rounded-2xl border shadow-lg backdrop-blur-sm ${styles(toast.type)}`}
            >
              {icon(toast.type)}
              <p className="text-xs font-semibold leading-snug flex-1 pt-0.5">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="p-1 rounded-lg hover:bg-black/5 text-slate-500 shrink-0 cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
