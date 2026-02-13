"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, FileEdit, ArrowLeft, Clock, BookOpen } from "lucide-react";
import { useModulesStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";

const TEST_OPTIONS = [
  {
    key: "mcqTimed" as const,
    icon: Clock,
    getTitle: (t: (k: string) => string) => t("moduleDetail.cardMcqTimed"),
    getButtonLabel: (t: (k: string) => string) => t("moduleDetail.startStrict"),
    credits: 1,
    action: "exam" as const,
    strict: true,
  },
  {
    key: "mcqPractice" as const,
    icon: BookOpen,
    getTitle: (t: (k: string) => string) => t("moduleDetail.cardMcqPractice"),
    getButtonLabel: (t: (k: string) => string) => t("moduleDetail.practiceMode"),
    credits: 1,
    action: "exam" as const,
    strict: false,
  },
  {
    key: "shortForm" as const,
    icon: FileText,
    getTitle: (t: (k: string) => string) => t("moduleDetail.cardShortForm"),
    getButtonLabel: (t: (k: string) => string) => t("moduleDetail.cardStart"),
    credits: 2,
    action: "written" as const,
    formType: "short" as const,
  },
  {
    key: "longForm" as const,
    icon: FileEdit,
    getTitle: (t: (k: string) => string) => t("moduleDetail.cardLongForm"),
    getButtonLabel: (t: (k: string) => string) => t("moduleDetail.cardStart"),
    credits: 3,
    action: "written" as const,
    formType: "long" as const,
  },
] as const;

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const getModule = useModulesStore((s) => s.getModule);
  const moduleData = getModule(id);
  const { t } = useLocale();

  if (!moduleData) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{t("moduleDetail.moduleNotFound")}</p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/dashboard/modules">{t("moduleDetail.backToModules")}</Link>
        </Button>
      </div>
    );
  }

  function startExam(strictMode: boolean) {
    router.push(`/dashboard/exam/${id}?strict=${strictMode}`);
  }

  function startWritten(type: "short" | "long") {
    router.push(`/dashboard/exam/written/${id}?type=${type}`);
  }

  function creditLabel(n: number) {
    return n === 1 ? t("moduleDetail.credit") : t("moduleDetail.credits").replace("{{n}}", String(n));
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/dashboard/modules">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {moduleData.name}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{moduleData.pdfFileName}</p>
          </div>
        </div>
      </div>

      {/* 4 test option cards - glass morphism grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TEST_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isMcq = option.action === "exam";
          return (
            <div
              key={option.key}
              className={cn(
                "group relative overflow-hidden rounded-2xl",
                "border border-white/10 bg-white/5 backdrop-blur-xl",
                "shadow-[0_8px_32px_rgba(0,0,0,0.24)]",
                "transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]",
                "dark:border-white/10 dark:bg-white/[0.06] dark:backdrop-blur-xl"
              )}
            >
              {/* Subtle gradient overlay for premium feel */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-30"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--primary) / 0.15), transparent)",
                }}
              />
              <div className="relative flex flex-col p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  {option.getTitle(t)}
                </h2>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {creditLabel(option.credits)}
                </p>
                <div className="mt-6 flex-1" />
                <Button
                  onClick={() =>
                    isMcq ? startExam(option.strict!) : startWritten(option.formType!)
                  }
                  className={cn(
                    "w-full rounded-xl font-medium transition-all duration-200",
                    "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                  )}
                >
                  {option.getButtonLabel(t)}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
