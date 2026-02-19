"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw } from "lucide-react";

const LEVELS = ["A1", "A2", "B1", "B2"] as const;
const CREDITS: Record<(typeof LEVELS)[number], number> = {
  A1: 2,
  A2: 2,
  B1: 3,
  B2: 3,
};

export default function LearnGermanPage() {
  const { t } = useLocale();
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ results?: { level: string; count: number; error?: string }[]; error?: string } | null>(null);

  async function handleSyncFromPdfs() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/vocabulary/sync-from-pdfs", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const text = await res.text();
      let data: { results?: { level: string; count: number; error?: string }[]; error?: string };
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        setSyncResult({ error: res.ok ? "Invalid response" : `Sync failed (${res.status}).` });
        return;
      }
      if (!res.ok) {
        setSyncResult({ error: data?.error ?? `Sync failed (${res.status})` });
        return;
      }
      setSyncResult(data);
    } catch {
      setSyncResult({ error: "Request failed. Check your connection." });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("learnGerman.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t("learnGerman.practiceVocabulary")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSyncFromPdfs}
          disabled={syncing}
          className="shrink-0"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing…" : "Sync from PDFs"}
        </Button>
      </div>
      {syncResult && (
        <Card className="border-primary/30">
          <CardContent className="pt-4">
            {syncResult.error ? (
              <p className="text-sm text-destructive">{syncResult.error}</p>
            ) : (
              <ul className="text-sm text-muted-foreground">
                {syncResult.results?.map((r) => (
                  <li key={r.level}>
                    {r.level}: {r.error ?? `${r.count} words synced`}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        {LEVELS.map((level) => (
          <Card key={level} className="group transition-all hover:shadow-md">
            <Link href={`/dashboard/learn-german/quiz/${level}`} className="block">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {t(`learnGerman.level${level}` as "learnGerman.levelA1")}
                </CardTitle>
                <CardDescription>
                  {t("learnGerman.creditsCost").replace("{{n}}", String(CREDITS[level]))}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center text-sm font-medium text-primary group-hover:underline">
                  {t("learnGerman.startQuiz")}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
