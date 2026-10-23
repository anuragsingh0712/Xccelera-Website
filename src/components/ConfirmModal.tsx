import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning';
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative bg-surface rounded-card shadow-modal w-full max-w-md p-6 z-10">
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              variant === 'danger' ? 'bg-danger/10' : 'bg-warning/10'
            }`}
          >
            <AlertTriangle
              size={20}
              className={variant === 'danger' ? 'text-danger' : 'text-warning'}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-ink mb-1">{title}</h3>
            <p className="text-sm text-ink-secondary leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-btn text-sm font-medium text-ink-secondary bg-canvas hover:bg-border transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-btn text-sm font-medium text-white transition-colors ${
              variant === 'danger'
                ? 'bg-danger hover:bg-red-700'
                : 'bg-warning hover:bg-amber-600'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
