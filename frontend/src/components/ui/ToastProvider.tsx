import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  title?: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, options?: { title?: string; variant?: ToastVariant }) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, options?: { title?: string; variant?: ToastVariant }) => {
      const id = Date.now();
      const toast: Toast = {
        id,
        message,
        title: options?.title,
        variant: options?.variant ?? 'info',
      };
      setToasts((current) => [...current, toast]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, 4000);
    },
    [],
  );

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const variantStyles =
            toast.variant === 'success'
              ? 'border-purple-200 bg-[#f6ebff] text-[#6204b4]'
              : toast.variant === 'error'
                ? 'border-red-200 bg-red-50 text-red-900'
                : 'border-purple-100 bg-white text-slate-900';
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-soft ${variantStyles}`}
            >
              <div className="mt-0.5 h-2 w-2 rounded-full bg-[linear-gradient(90deg,var(--purple--dark),#6204b4)]" />
              <div className="flex-1 text-sm">
                {toast.title && <p className="font-medium">{toast.title}</p>}
                <p className={toast.title ? 'mt-0.5' : ''}>{toast.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

