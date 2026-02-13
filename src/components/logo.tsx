export function Logo({ className }: { className?: string }) {
  return (
    <span className={`font-semibold ${className ?? ""}`}>
      <span className="text-white">Study</span>
      <span className="text-primary">Buddy</span>
    </span>
  );
}
