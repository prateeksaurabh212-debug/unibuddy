import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-semibold">404 – Page not found</h1>
      <p className="text-muted-foreground text-center text-sm">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Button asChild>
        <Link href="/">Go to ExamPal</Link>
      </Button>
    </div>
  );
}
