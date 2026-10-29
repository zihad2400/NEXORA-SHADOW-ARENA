export default function ProgressBar({ value = 0, max = 100, className = '' }) {
  const pct = Math.max(0, Math.min(100, (value / (max || 1)) * 100));
  return (
    <div className={`w-full h-2 rounded-full bg-bg-elevated overflow-hidden ${className}`}>
      <div
        className="h-full bg-gradient-to-r from-violet to-cyan transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
