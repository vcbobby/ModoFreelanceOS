import React from 'react';
import { createPortal } from 'react-dom'; // <--- 1. IMPORTAR ESTO
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDanger = false,
}) => {
  const canRender = typeof document !== 'undefined';
  if (!isOpen || !canRender) return null;

  // 2. ENVOLVER TODO EL RETORNO EN createPortal(..., document.body)
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* BACKDROP (FONDO OSCURO) */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* CONTENIDO DEL MODAL */}
      <div
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden scale-100 animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-full shrink-0 ${
                isDanger
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                  : 'bg-brand-100 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'
              }`}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 p-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
          {cancelText && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {cancelText}
            </button>
          )}

          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-all ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none'
                : 'bg-brand-600 hover:bg-brand-700 shadow-brand-200 dark:shadow-none'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body // <--- ESTO TELETRANSPORTA EL MODAL AL FINAL DEL HTML
  );
};
