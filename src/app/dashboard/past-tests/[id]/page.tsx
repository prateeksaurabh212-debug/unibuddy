"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";
import {
  percentageToGermanGrade,
  getGradeLabel,
  scoreMultipleSelect,
} from "@/lib/german-grade";
import type { McqQuestion } from "@/types";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

interface Attempt {
  id: string;
  moduleId: string;
  moduleName: string;
  testType: string;
  completedAt: string;
  resultData: string;
}

function testDisplayName(completedAt: string): string {
  try {
    const d = new Date(completedAt);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    return `Test-${y}-${m}-${day}-${h}-${min}-${s}`;
  } catch {
    return "Test";
  }
}

export default function PastTestResultPage() {
  const params = useParams();
  const id = params.id as string;
  const { t } = useLocale();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/past-tests/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setAttempt)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }
  if (error || !attempt) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Past test not found.</p>
        <Button asChild variant="link" className="mt-2">
          <Link href="/dashboard/past-tests">{t("pastTests.backToPastTests")}</Link>
        </Button>
      </div>
    );
  }

  const isMcq = attempt.testType === "mcq";
  const isVocabulary = attempt.testType === "vocabulary";

  if (isVocabulary) {
    type VocabQuestion = { id: string; word: string; correctIndices: number[] };
    let vData: { questions?: VocabQuestion[]; answers?: Record<string, number> };
    try {
      vData = JSON.parse(attempt.resultData) as typeof vData;
    } catch {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground">Invalid result data.</p>
          <Button asChild variant="link" className="mt-2">
            <Link href="/dashboard/past-tests">{t("pastTests.backToPastTests")}</Link>
          </Button>
        </div>
      );
    }
    const rawQuestions = vData.questions;
    const vQuestions: VocabQuestion[] = Array.isArray(rawQuestions) ? rawQuestions : [];
    const vAnswers = vData.answers ?? {};
    if (vQuestions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground">No questions in this attempt.</p>
          <Button asChild variant="link" className="mt-2">
            <Link href="/dashboard/past-tests">{t("pastTests.backToPastTests")}</Link>
          </Button>
        </div>
      );
    }
    let vCorrect = 0;
    vQuestions.forEach((q) => {
      const sel = vAnswers[q.id];
      if (sel !== undefined && q.correctIndices.includes(sel)) vCorrect += 1;
    });
    const vPercentage = (vCorrect / vQuestions.length) * 100;
    const vGrade = percentageToGermanGrade(vPercentage);
    const vLabel = getGradeLabel(vGrade);

    return (
      <div className="mx-auto max-w-2xl space-y-6 py-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link href="/dashboard/past-tests">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-lg font-medium text-muted-foreground truncate">
            {testDisplayName(attempt.completedAt)} · {t("pastTests.testTypeVocabulary")}
          </h1>
        </div>
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-center text-3xl">
              {vLabel} ({vGrade.toFixed(1)})
            </CardTitle>
            <CardDescription className="text-center">
              {vCorrect} / {vQuestions.length} correct · {vPercentage.toFixed(0)}%
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-2">
            <Button asChild>
              <Link href="/dashboard/learn-german">{t("pastTests.backToPastTests")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isMcq) {
    let data: { questions?: McqQuestion[]; answers?: Record<string, number[]> };
    try {
      data = JSON.parse(attempt.resultData) as typeof data;
    } catch {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground">Invalid result data.</p>
          <Button asChild variant="link" className="mt-2">
            <Link href="/dashboard/past-tests">{t("pastTests.backToPastTests")}</Link>
          </Button>
        </div>
      );
    }
    const questions = data.questions ?? [];
    const answers = data.answers ?? {};
    if (questions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground">No questions in this attempt.</p>
          <Button asChild variant="link" className="mt-2">
            <Link href="/dashboard/past-tests">{t("pastTests.backToPastTests")}</Link>
          </Button>
        </div>
      );
    }
    let correct = 0;
    const wrongQuestions: { question: string }[] = [];
    questions.forEach((q) => {
      const selected = answers[q.id] ?? [];
      const isCorrect =
        q.type === "single"
          ? selected.length === 1 && q.correctIndices.includes(selected[0])
          : scoreMultipleSelect(q.correctIndices, selected) === 1;
      if (isCorrect) correct += 1;
      else wrongQuestions.push({ question: q.question });
    });
    const percentage = (correct / questions.length) * 100;
    const grade = percentageToGermanGrade(percentage);
    const label = getGradeLabel(grade);

    return (
      <div className="mx-auto max-w-2xl space-y-6 py-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link href="/dashboard/past-tests">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-lg font-medium text-muted-foreground truncate">
            {testDisplayName(attempt.completedAt)} · {t("pastTests.testTypeMcq")}
          </h1>
        </div>
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-center text-3xl">
              {label} ({grade.toFixed(1)})
            </CardTitle>
            <CardDescription className="text-center">
              {correct} / {questions.length} {t("exam.correct")} · {percentage.toFixed(0)}%
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              {t("exam.gradingScale")}
            </p>
            <div className="flex justify-center gap-2">
              <Button asChild>
                <Link href={`/dashboard/modules/${attempt.moduleId}`}>
                  {t("exam.backToModuleButton")}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/past-tests">{t("pastTests.backToPastTests")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        {wrongQuestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("exam.weakAreas")}</CardTitle>
              <CardDescription>{t("exam.weakAreasDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc space-y-2 text-sm">
                {wrongQuestions.map((w, i) => (
                  <li key={i} className="text-muted-foreground">
                    {w.question}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>{t("exam.review")}</CardTitle>
            <CardDescription>{t("exam.reviewDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-6">
              {questions.map((q, i) => {
                const selected = answers[q.id] ?? [];
                const isCorrect =
                  q.type === "single"
                    ? selected.length === 1 && q.correctIndices.includes(selected[0])
                    : scoreMultipleSelect(q.correctIndices, selected) === 1;
                return (
                  <li key={q.id} className="rounded-lg border p-4">
                    <div className="flex items-start gap-2">
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                          isCorrect
                            ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                        )}
                      >
                        {isCorrect ? "✓" : "✗"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">
                          {i + 1}. {q.question}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {q.type === "multiple"
                            ? t("exam.kAusNMultiple")
                            : t("exam.singleChoice")}
                        </p>
                        <ul className="mt-3 space-y-1.5">
                          {q.options.map((opt) => {
                            const isCorrectOption = q.correctIndices.includes(opt.index);
                            const isUserSelected = selected.includes(opt.index);
                            const isWrongSelection =
                              isUserSelected && !isCorrectOption;
                            return (
                              <li
                                key={opt.index}
                                className={cn(
                                  "rounded-md border px-3 py-2 text-sm",
                                  isCorrectOption &&
                                    isUserSelected &&
                                    "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700",
                                  isCorrectOption &&
                                    !isUserSelected &&
                                    "border-green-500/70 bg-green-50/70 dark:bg-green-900/10 dark:border-green-700/70",
                                  isWrongSelection &&
                                    "border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-700"
                                )}
                              >
                                <span className="flex items-center gap-2">
                                  {isCorrectOption && (
                                    <span className="text-green-600 dark:text-green-400">
                                      ●
                                    </span>
                                  )}
                                  {isWrongSelection && (
                                    <span className="text-red-600 dark:text-red-400">
                                      ●
                                    </span>
                                  )}
                                  {!isCorrectOption && !isWrongSelection && (
                                    <span className="text-muted-foreground">○</span>
                                  )}
                                  {opt.text}
                                  {isUserSelected && (
                                    <span className="ml-1 text-xs font-medium text-muted-foreground">
                                      {t("exam.yourAnswer")}
                                    </span>
                                  )}
                                  {isCorrectOption && !isUserSelected && (
                                    <span className="ml-1 text-xs font-medium text-green-600 dark:text-green-400">
                                      {t("exam.correctLabel")}
                                    </span>
                                  )}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Written result
  let data: { score?: number; maxScore?: number; feedback?: string };
  try {
    data = JSON.parse(attempt.resultData) as typeof data;
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Invalid result data.</p>
        <Button asChild variant="link" className="mt-2">
          <Link href="/dashboard/past-tests">{t("pastTests.backToPastTests")}</Link>
        </Button>
      </div>
    );
  }
  const score = data.score ?? 0;
  const maxScore = data.maxScore ?? (attempt.testType === "short_form" ? 5 : 25);
  const feedback = data.feedback ?? "";
  const typeLabel =
    attempt.testType === "short_form"
      ? t("pastTests.testTypeShort")
      : t("pastTests.testTypeLong");

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="shrink-0" asChild>
          <Link href="/dashboard/past-tests">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-lg font-medium text-muted-foreground truncate">
          {testDisplayName(attempt.completedAt)} · {typeLabel}
        </h1>
      </div>
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {t("writtenExam.score")}: {score} / {maxScore}
          </CardTitle>
          <CardDescription className="text-center">
            {typeLabel}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4">
            <h3 className="mb-2 font-medium">{t("writtenExam.feedback")}</h3>
            <div className="whitespace-pre-wrap text-sm">{feedback}</div>
          </div>
          <div className="flex justify-center gap-2">
            <Button asChild>
              <Link href={`/dashboard/modules/${attempt.moduleId}`}>
                {t("writtenExam.backToModule")}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/past-tests">{t("pastTests.backToPastTests")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
