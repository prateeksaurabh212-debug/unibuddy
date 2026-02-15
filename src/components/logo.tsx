export function Logo({ className }: { className?: string }) {
  return (
    <span className={`font-semibold ${className ?? ""}`}>
      <span className="text-white">Exam</span>
      <span className="text-primary">Pal</span>
    </span>
  );
}
