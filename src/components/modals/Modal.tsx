import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-gray-900 rounded-xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto border border-white/10"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-white/10 px-5 py-3 flex items-center justify-between z-10">
          <h2 id="modal-title" className="brand-font text-lg font-bold text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-white/60 hover:text-white" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
