export default function StatsStrip({ requests }) {
  const pending = requests.filter((r) => r.status === "pending").length;
  const active = requests.filter((r) => r.status === "accepted").length;
  const completed = requests.filter((r) => r.status === "completed").length;
  const studentsServed = requests
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + r.participants.filter((p) => p.status === "received").length, 0);

  const items = [
    { label: "Pending requests", value: pending },
    { label: "Active delivery", value: active },
    { label: "Completed trips", value: completed },
    { label: "Students served", value: studentsServed },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px border border-line rounded-sm overflow-hidden bg-line">
      {items.map((it) => (
        <div key={it.label} className="bg-white px-5 py-4">
          <p className="font-display text-[26px] font-semibold text-ink tracking-tight tabular-nums">
            {it.value}
          </p>
          <p className="text-xs text-sub mt-0.5">{it.label}</p>
        </div>
      ))}
    </div>
  );
}
