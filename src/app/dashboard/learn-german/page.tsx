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

type SyncResultItem = { level: string; count: number; error?: string; translated?: number };

export default function LearnGermanPage() {
  const { t } = useLocale();
  const [syncing, setSyncing] = useState(false);
  const [translateMissingLoading, setTranslateMissingLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<{ results?: SyncResultItem[]; error?: string } | null>(null);
  const [translateResult, setTranslateResult] = useState<{ translated?: number; failed?: number; total?: number; error?: string } | null>(null);

  async function handleSyncFromPdfs() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/vocabulary/sync-from-pdfs", {
        method: "POST",
        credentials: "include",
      });
      const text = await res.text();
      let data: { results?: { level: string; count: number; error?: string }[]; error?: string };
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        setSyncResult({
          error: res.ok ? "Invalid response" : `Sync failed (${res.status}). ${text.slice(0, 200)}`,
        });
        return;
      }
      if (!res.ok) {
        setSyncResult({
          error: data?.error ?? `Sync failed (${res.status}). ${text.slice(0, 200)}`,
        });
        return;
      }
      setSyncResult(data);
    } catch {
      setSyncResult({
        error: "Request failed. Check your connection.",
      });
    } finally {
      setSyncing(false);
    }
  }

  async function handleTranslateMissing() {
    setTranslateMissingLoading(true);
    setTranslateResult(null);
    setSyncResult(null);
    try {
      const res = await fetch("/api/vocabulary/translate-missing", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setTranslateResult({ error: data?.error ?? "Translate failed" });
        return;
      }
      setTranslateResult({
        translated: data.translated,
        failed: data.failed,
        total: data.total,
      });
    } catch {
      setTranslateResult({ error: "Request failed. Check your connection." });
    } finally {
      setTranslateMissingLoading(false);
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
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncFromPdfs}
            disabled={syncing || translateMissingLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "Sync from PDFs"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTranslateMissing}
            disabled={syncing || translateMissingLoading}
          >
            {translateMissingLoading ? "Translating…" : "Translate missing"}
          </Button>
        </div>
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
                    {r.level}: {r.error ?? `${r.count} words synced${r.translated != null ? `, ${r.translated} translated` : ""}`}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
      {translateResult && (
        <Card className="border-primary/30">
          <CardContent className="pt-4">
            {translateResult.error ? (
              <p className="text-sm text-destructive">{translateResult.error}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {translateResult.translated != null
                  ? `Translated ${translateResult.translated} words.${translateResult.failed ? ` ${translateResult.failed} failed.` : ""}`
                  : translateResult.total === 0
                    ? "No words need translation."
                    : ""}
              </p>
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
