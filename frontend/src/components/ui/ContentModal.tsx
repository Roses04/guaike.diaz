import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export type ContentModalItem = {
  title: string;
  image: string;
  description: string;
  category?: string;
  meta?: string;
};

type ContentModalProps = {
  item: ContentModalItem;
  onClose: () => void;
};

const ContentModal = ({ item, onClose }: ContentModalProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.documentElement.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="content-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90dvh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 h-64 sm:h-80 md:h-auto md:min-h-[320px] shrink-0">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 md:w-1/2 flex flex-col">
            {item.category && (
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-md mb-2 inline-block w-fit">
                {item.category}
              </span>
            )}
            <h3
              id="content-modal-title"
              className="text-2xl font-bold mb-2 text-slate-800 dark:text-white pr-8"
            >
              {item.title}
            </h3>
            {item.meta && (
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">
                {item.meta}
              </p>
            )}
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed flex-grow">
              {item.description}
            </p>
            <div className="mt-6">
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="municipal-cta"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ContentModal;
