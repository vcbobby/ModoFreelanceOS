import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks/storeHooks';
import { removeToast, type Toast } from '@/app/slices/uiSlice';

const ToastItem = ({ toast }: { toast: Toast }) => {
    const dispatch = useAppDispatch();
    const { id, title, message, type = 'info', duration = 8000 } = toast;

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(removeToast(id));
        }, duration);
        return () => clearTimeout(timer);
    }, [id, duration, dispatch]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
    };

    const bgStyles = {
        success: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800',
        warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800',
        error: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800',
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lg max-w-sm pointer-events-auto ${bgStyles[type]}`}
        >
            <div className="shrink-0 mt-0.5">{icons[type]}</div>
            <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {message}
                </p>
            </div>
            <button
                onClick={() => dispatch(removeToast(id))}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-slate-400"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

export const ToastProvider = () => {
    const toasts = useAppSelector((state) => state.ui.toasts);

    return (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} />
                ))}
            </AnimatePresence>
        </div>
    );
};
