import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalPanelProps {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
}

function ModalPanel({
  open,
  title,
  description,
  onClose,
  children,
}: ModalPanelProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[32px] border border-white/70 bg-[#fffdf9] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.28)] md:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {title}
            </h2>
            <p className="text-sm leading-6 text-slate-500">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default ModalPanel;
