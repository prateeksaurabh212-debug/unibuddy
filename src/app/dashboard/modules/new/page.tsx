"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, FileText, Upload } from "lucide-react";
import { useModulesStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/contexts/LocaleContext";
import { extractTextFromPdfFile } from "@/lib/pdf-client";
import type { Module, McqQuestion } from "@/types";

export default function NewModulePage() {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const addModule = useModulesStore((s) => s.addModule);
  const { t } = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "extracting" | "generating" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function getModuleTimestamp(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    return `Module-${y}-${m}-${day}-${h}${min}${s}`;
  }

  const isImage = (f: File) => f.type.startsWith("image/");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];
    if (chosen) {
      setFile(chosen);
      setError(null);
    }
  };

  const openFileDialog = () => {
    if (!confirm(t("newModule.uploadConfirm"))) return;
    fileInputRef.current?.click();
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError(t("newModule.errorPdfName"));
      return;
    }
    setError(null);
    setStatus("extracting");
    try {
      let pdfText: string;
      if (isImage(file)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/extract-document-text", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || res.statusText);
        }
        const data = (await res.json()) as { text: string };
        pdfText = data.text ?? "";
      } else {
        pdfText = await extractTextFromPdfFile(file);
      }
      if (!pdfText.trim()) {
        setError(t("newModule.errorNoText"));
        setStatus("idle");
        return;
      }
      setStatus("generating");
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfText }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || res.statusText);
      }
      const { questions } = (await res.json()) as { questions: McqQuestion[] };
      const newModule: Module = {
        id: crypto.randomUUID(),
        name: getModuleTimestamp(),
        pdfText,
        pdfFileName: file.name,
        questions,
        createdAt: Date.now(),
      };
      addModule(newModule);
      setStatus("done");
      await updateSession();
      router.push(`/dashboard/modules/${newModule.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("newModule.errorGeneric"));
      setStatus("idle");
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("newModule.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("newModule.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("newModule.uploadTitle")}</CardTitle>
            <CardDescription>{t("newModule.uploadDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                {t("newModule.usesCredit")}
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf,image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileChange}
              className="hidden"
              aria-label={t("newModule.selectFile")}
            />
            <button
              type="button"
              onClick={openFileDialog}
              className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 py-12 transition-colors hover:border-primary/50 hover:bg-muted/50"
            >
              {file ? (
                <>
                  <FileText className="mb-3 h-12 w-12 text-primary" />
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t("newModule.chooseAnother")}</p>
                </>
              ) : (
                <>
                  <Upload className="mb-3 h-12 w-12 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">{t("newModule.selectFile")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t("newModule.uploadHint")}</p>
                </>
              )}
            </button>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          disabled={status === "extracting" || status === "generating" || !file}
          className="w-full"
        >
          {(status === "extracting" || status === "generating") && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {status === "extracting"
            ? t("newModule.readingPdf")
            : status === "generating"
            ? t("newModule.generating")
            : t("newModule.createQuiz")}
        </Button>
      </form>
    </div>
  );
}
