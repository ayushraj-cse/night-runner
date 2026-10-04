"use client";

export default function ConfirmDialog({ open, title, body, confirmLabel, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-night/50 px-4">
      <div className="w-full max-w-sm rounded-sm bg-white shadow-lg p-5 space-y-4">
        <div>
          <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
          {body && <p className="text-sm text-sub mt-1 leading-relaxed">{body}</p>}
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="rounded-sm border border-line px-3 py-1.5 text-sm font-medium text-sub hover:bg-canvas"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-sm bg-night px-3 py-1.5 text-sm font-medium text-white hover:bg-night/90"
          >
            {confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
