const STYLES = {
  pending: "bg-[#F1EFE7] text-sub",
  accepted: "bg-[#EEEEF2] text-night",
  clash: "bg-sleeping-bg text-sleeping",
  completed: "bg-received-bg text-received",
};

const LABELS = {
  pending: "Pending",
  accepted: "Accepted",
  clash: "Clash",
  completed: "Completed",
};

export default function StatusPill({ status, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
        STYLES[status] || "bg-[#F1EFE7] text-sub"
      } ${className}`}
    >
      {LABELS[status] || status}
    </span>
  );
}
