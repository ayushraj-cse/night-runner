"use client";

const VARIANT_STYLES = {
  success: "border-received/30 bg-white text-received",
  error: "border-sleeping/30 bg-white text-sleeping",
  info: "border-line bg-white text-ink",
};

export default function Toast({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`rounded-sm border shadow-sm px-4 py-3 text-sm flex items-start justify-between gap-3 animate-fadeIn ${
            VARIANT_STYLES[t.variant] || VARIANT_STYLES.info
          }`}
        >
          <span className="leading-snug text-ink">{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            className="shrink-0 text-sub hover:text-ink leading-none text-base"
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
