"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useModulesStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/contexts/LocaleContext";

const SHORT_DURATION_SEC = 5 * 60;
const LONG_DURATION_SEC = 30 * 60;
const SHORT_MAX_WORDS = 50;
const LONG_MAX_WORDS = 750;

function countWords(s: string): number {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}

function WrittenCountdown({
  startTime,
  durationSec,
  onTimeUp,
}: {
  startTime: number;
  durationSec: number;
  onTimeUp: () => void;
}) {
  const [remaining, setRemaining] = useState(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return Math.max(0, durationSec - elapsed);
  });
  useEffect(() => {
    if (remaining <= 0) {
      onTimeUp();
      return;
    }
    const t = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const r = Math.max(0, durationSec - elapsed);
      setRemaining(r);
      if (r <= 0) onTimeUp();
    }, 1000);
    return () => clearInterval(t);
  }, [startTime, durationSec, remaining, onTimeUp]);
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  return (
    <span className="font-mono text-lg tabular-nums">
      {m}:{s.toString().padStart(2, "0")}
    </span>
  );
}

export default function WrittenExamPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const moduleId = params.moduleId as string;
  const formType = (searchParams.get("type") === "long" ? "long" : "short") as "short" | "long";
  const getModule = useModulesStore((s) => s.getModule);
  const moduleData = getModule(moduleId);
  const { t } = useLocale();
  const { update: updateSession } = useSession();

  const [question, setQuestion] = useState<string | null>(null);
  const [questionLoading, setQuestionLoading] = useState(true);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [startTime] = useState(() => Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState<{ score: number; maxScore: number; feedback: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!moduleData?.pdfText?.trim()) {
      setQuestionLoading(false);
      return;
    }
    setQuestionLoading(true);
    setQuestionError(null);
    fetch("/api/generate-written-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdfText: moduleData.pdfText, formType }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.question) setQuestion(data.question);
        else setQuestionError(data?.error ?? "Could not load question");
      })
      .catch(() => setQuestionError("Could not load question"))
      .finally(() => setQuestionLoading(false));
  }, [moduleData, formType]);

  const durationSec = formType === "short" ? SHORT_DURATION_SEC : LONG_DURATION_SEC;
  const maxWords = formType === "short" ? SHORT_MAX_WORDS : LONG_MAX_WORDS;
  const words = countWords(answerText);
  const overLimit = words > maxWords;

  const doSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    const text = answerText.trim();
    if (!text) {
      setError(t("writtenExam.errorNoAnswer"));
      return;
    }
    if (!moduleData?.pdfText?.trim()) {
      setError("Module material not found.");
      return;
    }
    submittedRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/evaluate-written", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfText: moduleData.pdfText,
          answerText: text,
          formType,
          question: question ?? undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? t("writtenExam.errorNoCredits"));
        submittedRef.current = false;
        return;
      }
      const resultPayload = {
        score: data.score ?? 0,
        maxScore: data.maxScore ?? (formType === "short" ? 5 : 25),
        feedback: data.feedback ?? "",
      };
      setResult(resultPayload);
      setSubmitted(true);
      await updateSession?.();
      fetch("/api/past-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          moduleName: moduleData.name,
          testType: formType === "short" ? "short_form" : "long_form",
          resultData: JSON.stringify(resultPayload),
        }),
      }).catch(() => {});
    } catch {
      setError(t("writtenExam.errorNoCredits"));
      submittedRef.current = false;
    } finally {
      setLoading(false);
    }
  }, [answerText, moduleData, moduleId, formType, question, t, updateSession]);

  function handleTimeUp() {
    if (submittedRef.current) return;
    if (answerText.trim()) doSubmit();
    else setSubmitted(true);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/extract-answer-text", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Failed to extract text");
        return;
      }
      setAnswerText((prev) => (prev ? prev + "\n\n" + (data.text ?? "") : (data.text ?? "")));
    } catch {
      setError("Failed to extract text");
    } finally {
      setExtracting(false);
      e.target.value = "";
    }
  }

  if (!moduleData) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">{t("exam.moduleNotFound")}</p>
        <Button asChild variant="link" className="mt-2">
          <Link href="/dashboard/modules">{t("exam.backToModules")}</Link>
        </Button>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-8">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              {t("writtenExam.score")}: {result.score} / {result.maxScore}
            </CardTitle>
            <CardDescription className="text-center">
              {formType === "short" ? t("writtenExam.shortTitle") : t("writtenExam.longTitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <h3 className="mb-2 font-medium">{t("writtenExam.feedback")}</h3>
              <div className="whitespace-pre-wrap text-sm">{result.feedback}</div>
            </div>
            <div className="flex justify-center">
              <Button asChild>
                <Link href={`/dashboard/modules/${moduleId}`}>{t("writtenExam.backToModule")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted && !result) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">{t("writtenExam.errorNoAnswer")}</p>
        <Button variant="outline" className="mt-2" onClick={() => { setSubmitted(false); submittedRef.current = false; }}>
          Try again
        </Button>
        <Button asChild variant="link" className="mt-2">
          <Link href={`/dashboard/modules/${moduleId}`}>{t("writtenExam.backToModule")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {formType === "short" ? t("writtenExam.shortTitle") : t("writtenExam.longTitle")} — {moduleData.name}
            </CardTitle>
            <WrittenCountdown
              startTime={startTime}
              durationSec={durationSec}
              onTimeUp={handleTimeUp}
            />
          </div>
          <CardDescription>
            {formType === "short" ? t("writtenExam.instructionShort") : t("writtenExam.instructionLong")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-1 text-sm font-medium text-muted-foreground">{t("writtenExam.questionLabel")}</h3>
            {questionLoading ? (
              <p className="text-sm italic text-muted-foreground">{t("writtenExam.generatingQuestion")}</p>
            ) : questionError ? (
              <p className="text-destructive text-sm">{questionError}</p>
            ) : question ? (
              <p className="rounded-md border bg-muted/30 p-3 text-sm font-medium">{question}</p>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">{t("writtenExam.typeOrUpload")}</p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf,image/*,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={extracting || loading || questionLoading}
              onClick={() => fileInputRef.current?.click()}
            >
              {extracting ? t("writtenExam.extracting") : t("writtenExam.uploadAnswer")}
            </Button>
            <span className="text-muted-foreground text-xs">{t("writtenExam.uploadHint")}</span>
          </div>
          <div>
            <textarea
              className="min-h-[200px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Type your answer here..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              disabled={loading}
              maxLength={formType === "long" ? 50000 : 2000}
            />
            <p className={overLimit ? "text-destructive text-sm" : "text-muted-foreground text-sm"}>
              {t("writtenExam.wordCount")}: {words}
              {formType === "short" ? ` (${t("writtenExam.wordLimitShort")})` : ` (${t("writtenExam.wordLimitLong")})`}
            </p>
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button
            onClick={doSubmit}
            disabled={loading || questionLoading || !question || !answerText.trim() || overLimit}
          >
            {loading ? t("writtenExam.evaluating") : t("writtenExam.submit")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
