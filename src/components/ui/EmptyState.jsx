export default function EmptyState({ title, message, action }) {
  return (
    <div className="surface p-12 text-center">
      <div className="text-4xl mb-3 opacity-60">◇</div>
      <div className="text-text-primary font-semibold mb-2">{title}</div>
      <div className="text-text-secondary text-sm mb-4">{message}</div>
      {action}
    </div>
  );
}
