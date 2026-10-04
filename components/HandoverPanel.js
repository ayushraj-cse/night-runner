"use client";

function fmt(dt) {
  const d = new Date(dt);
  return d.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function HandoverPanel({ request, onMark, onCompleteClick, marking, completing }) {
  const pending = request.participants.filter((p) => p.status === "pending");
  const received = request.participants.filter((p) => p.status === "received").length;
  const sleeping = request.participants.filter((p) => p.status === "sleeping").length;
  const canComplete = pending.length === 0;

  return (
    <div className="bg-white border border-line rounded-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-line flex items-center justify-between gap-2">
        <div>
          <p className="font-display text-sm font-semibold text-ink">
            {request.hostelBlock} · Room {request.roomNumber}
          </p>
          <p className="text-xs text-sub mt-0.5">
            {fmt(request.deliveryTime)} · filed by {request.requester.name}
          </p>
        </div>
        <div className="text-right text-xs shrink-0">
          <p className="font-medium text-received">{received} received</p>
          {sleeping > 0 && <p className="font-medium text-sleeping">{sleeping} sleeping</p>}
        </div>
      </div>

      <div className="divide-y divide-line">
        {request.participants.map((p) => (
          <div key={p.name} className="flex items-center justify-between gap-3 px-5 py-3.5">
            <span className="text-sm text-ink truncate">{p.name}</span>
            <div className="flex gap-1.5 shrink-0">
              <button
                onClick={() => onMark(p.name, "received")}
                disabled={marking === p.name}
                className={`px-3 py-1.5 rounded-sm text-xs font-semibold border transition disabled:opacity-50 ${
                  p.status === "received"
                    ? "bg-received text-white border-received"
                    : "border-received/40 text-received hover:bg-received-bg"
                }`}
              >
                Received
              </button>
              <button
                onClick={() => onMark(p.name, "sleeping")}
                disabled={marking === p.name}
                className={`px-3 py-1.5 rounded-sm text-xs font-semibold border transition disabled:opacity-50 ${
                  p.status === "sleeping"
                    ? "bg-sleeping text-white border-sleeping"
                    : "border-sleeping/40 text-sleeping hover:bg-sleeping-bg"
                }`}
              >
                Sleeping
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-4 border-t border-line bg-canvas/60 space-y-2">
        {!canComplete && (
          <p className="text-xs text-sub">
            Mark everyone before completing — still waiting on{" "}
            <span className="font-medium text-ink">{pending.map((p) => p.name).join(", ")}</span>.
          </p>
        )}
        <button
          onClick={onCompleteClick}
          disabled={!canComplete || completing}
          className="w-full rounded-sm bg-lamp text-white py-2.5 text-sm font-semibold hover:bg-lamp-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {completing ? "Completing..." : "Complete delivery"}
        </button>
      </div>
    </div>
  );
}
