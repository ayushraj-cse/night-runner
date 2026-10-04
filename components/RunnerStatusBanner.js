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

export default function RunnerStatusBanner({ activeRequest }) {
  if (!activeRequest) {
    return (
      <div className="rounded-sm border border-line bg-white px-5 py-4 flex items-center gap-3">
        <span className="h-2.5 w-2.5 rounded-full bg-received shrink-0" />
        <div>
          <p className="font-display text-sm font-semibold text-ink">Runner available</p>
          <p className="text-xs text-sub mt-0.5">No active delivery. Ready for the next request.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm bg-night text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="h-2.5 w-2.5 rounded-full bg-lamp shrink-0 shadow-[0_0_0_4px_rgba(200,134,46,0.25)]" />
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold">Runner on delivery</p>
          <p className="text-xs text-night-soft mt-0.5 truncate">
            {activeRequest.hostelBlock}, Room {activeRequest.roomNumber} · filed by {activeRequest.requester.name}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-x-6 sm:ml-auto sm:border-l sm:border-white/10 sm:pl-6">
        <div>
          <p className="text-[10.5px] text-night-soft">Time</p>
          <p className="text-sm font-medium">{fmt(activeRequest.deliveryTime)}</p>
        </div>
        <div>
          <p className="text-[10.5px] text-night-soft">People</p>
          <p className="text-sm font-medium">{activeRequest.participants.length}</p>
        </div>
        <div>
          <p className="text-[10.5px] text-night-soft">Received</p>
          <p className="text-sm font-medium">
            {activeRequest.participants.filter((p) => p.status === "received").length}
          </p>
        </div>
        <div>
          <p className="text-[10.5px] text-night-soft">Pending</p>
          <p className="text-sm font-medium">
            {activeRequest.participants.filter((p) => p.status === "pending").length}
          </p>
        </div>
      </div>
    </div>
  );
}
