export default function EmptyState({ title, hint }) {
  return (
    <div className="rounded-sm border border-dashed border-line bg-white/50 py-8 px-4 text-center">
      <p className="text-sm font-medium text-sub">{title}</p>
      {hint && <p className="text-xs text-sub/70 mt-1">{hint}</p>}
    </div>
  );
}
