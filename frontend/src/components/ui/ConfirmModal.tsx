import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  username?: string | null;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
};

const ConfirmModal = ({ open, title = "Confirmar", username = null, description, confirmLabel = "Sí, cerrar sesión", cancelLabel = "Cancelar", onConfirm, onClose }: ConfirmModalProps) => {
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    confirmRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.documentElement.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden w-full max-w-md shadow-2xl p-6 border border-transparent dark:border-white/5">
        <button 
          type="button" 
          onClick={onClose} 
          className="absolute top-3 right-3 p-2 rounded-full bg-black/5 hover:bg-black/10 text-slate-500 hover:text-slate-800 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-400 dark:hover:text-white transition-colors" 
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{username ? `${title} de ${username}` : title}</h3>
        {description && <p className="text-sm text-slate-650 dark:text-slate-400 mb-4">{description}</p>}
        <div className="flex gap-3 justify-end">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-semibold cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button 
            ref={confirmRef} 
            onClick={onConfirm} 
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors text-xs font-semibold cursor-pointer shadow-md shadow-red-650/10"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
