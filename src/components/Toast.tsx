import React, { useEffect } from "react";
import { Check, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface ToastType {
  id: string;
  message: string;
  type?: "success" | "info" | "error";
}

interface ToastProps {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastItemProps {
  key?: string;
  toast: ToastType;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const bgColor =
    toast.type === "success"
      ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/80 dark:border-emerald-800"
      : toast.type === "error"
      ? "bg-red-50 border-red-200 dark:bg-red-950/80 dark:border-red-800"
      : "bg-blue-50 border-blue-200 dark:bg-slate-900/90 dark:border-slate-800";

  const textColor =
    toast.type === "success"
      ? "text-emerald-800 dark:text-emerald-300"
      : toast.type === "error"
      ? "text-red-800 dark:text-red-300"
      : "text-blue-800 dark:text-blue-300";

  const Icon = toast.type === "success" ? Check : Info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg ${bgColor} ${textColor} transition-all duration-300`}
    >
      <div className="mt-0.5 shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 text-sm font-medium pr-2">
        {toast.message}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
