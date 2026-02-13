"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/contexts/LocaleContext";
import type { LetterScanResult } from "@/types";

export default function LetterScannerPage() {
  const { t } = useLocale();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<LetterScanResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
    onDrop: (accepted) => {
      if (accepted[0]) {
        setFile(accepted[0]);
        setResult(null);
        setError(null);
      }
    },
  });

  async function handleScan() {
    if (!file) return;
    setError(null);
    setStatus("loading");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/scan-letter", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || res.statusText);
      }
      const data = (await res.json()) as LetterScanResult;
      setResult(data);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("letterScanner.errorGeneric"));
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("letterScanner.title")}</h1>
        <p className="text-muted-foreground">{t("letterScanner.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("letterScanner.letter")}</CardTitle>
          <CardDescription>{t("letterScanner.letterDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            {...getRootProps()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <>
                <FileText className="mb-2 h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{t("letterScanner.dropReplace")}</p>
              </>
            ) : (
              <>
                <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{t("letterScanner.dropHint")}</p>
              </>
            )}
          </div>
          <Button
            onClick={handleScan}
            disabled={!file || status === "loading"}
            className="w-full"
          >
            {status === "loading" && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t("letterScanner.scanLetter")}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="flex items-center gap-2 pt-6 text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("letterScanner.summary")}</CardTitle>
              <CardDescription>{t("letterScanner.summaryDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{result.summary}</p>
            </CardContent>
          </Card>
          {result.actionRequired && (
            <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="text-amber-800 dark:text-amber-200">
                  {t("letterScanner.actionRequired")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{result.actionRequired}</p>
                {result.dueDate && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t("letterScanner.due")}: {result.dueDate}
                  </p>
                )}
                {result.amount && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("letterScanner.amount")}: {result.amount}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("letterScanner.toneCheck")}</CardTitle>
              <CardDescription>{t("letterScanner.toneCheckDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{result.toneCheck}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
