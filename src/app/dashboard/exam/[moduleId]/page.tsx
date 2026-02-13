"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChevronLeft, ChevronRight, Flag, Check } from "lucide-react";
import { useModulesStore } from "@/lib/store";
import { useExamStore } from "@/lib/store";
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

const MCQ_EXAM_DURATION_SEC = 10 * 60; // 10 minutes

function ExamCountdown({
  startTime,
  onTimeUp,
}: {
  startTime: number;
  onTimeUp: () => void;
}) {
  const [remaining, setRemaining] = useState(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return Math.max(0, MCQ_EXAM_DURATION_SEC - elapsed);
  });
  useEffect(() => {
    if (remaining <= 0) {
      onTimeUp();
      return;
    }
    const t = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const r = Math.max(0, MCQ_EXAM_DURATION_SEC - elapsed);
      setRemaining(r);
      if (r <= 0) onTimeUp();
    }, 1000);
    return () => clearInterval(t);
  }, [startTime, remaining, onTimeUp]);
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  return (
    <span className="font-mono text-lg tabular-nums">
      {m}:{s.toString().padStart(2, "0")}
    </span>
  );
}

export default function ExamPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const moduleId = params.moduleId as string;
  const strictMode = searchParams.get("strict") !== "false";
  const getModule = useModulesStore((s) => s.getModule);
  const moduleData = getModule(moduleId);
  const { t } = useLocale();
  const { update: updateSession } = useSession();

  const {
    questions,
    currentIndex,
    answers,
    flagged,
    startTime,
    isComplete,
    setAnswer,
    toggleFlag,
    next,
    prev,
    goTo,
    submit,
    startExam,
    reset,
  } = useExamStore();

  const [initialized, setInitialized] = useState(false);
  const savedToPastRef = useRef(false);

  useEffect(() => {
    if (!moduleData || initialized) return;
    startExam(moduleId, moduleData.questions, strictMode);
    setInitialized(true);
  }, [moduleData, moduleId, strictMode, startExam, initialized]);

  useEffect(() => {
    if (!isComplete || !startTime || !moduleData || savedToPastRef.current || questions.length === 0) return;
    savedToPastRef.current = true;
    fetch("/api/past-tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        moduleId,
        moduleName: moduleData.name,
        testType: "mcq",
        resultData: JSON.stringify({ questions, answers }),
      }),
    }).catch(() => {});
  }, [isComplete, startTime, moduleData, moduleId, questions, answers]);

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

  if (!moduleData || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">{t("exam.noQuestions")}</p>
        <Button asChild variant="link" className="mt-2">
          <Link href={`/dashboard/modules/${moduleId}`}>{t("exam.backToModule")}</Link>
        </Button>
      </div>
    );
  }

  // Results view after submit
  if (isComplete && startTime) {
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

    const handleTakeTestAgain = async () => {
      if (!confirm(t("exam.takeTestAgainConfirm"))) return;
      try {
        const res = await fetch("/api/use-credit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "retry" }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert(data?.error ?? t("exam.takeTestAgainError"));
          return;
        }
        await updateSession?.();
        reset();
        startExam(moduleId, questions, strictMode);
        setInitialized(true);
      } catch {
        alert(t("exam.takeTestAgainError"));
      }
    };

    return (
      <div className="mx-auto max-w-2xl space-y-6 py-8">
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
                <Link href={`/dashboard/modules/${moduleId}`}>{t("exam.backToModuleButton")}</Link>
              </Button>
              <Button
                variant="outline"
                onClick={handleTakeTestAgain}
                className="animate-blink-brand border-primary bg-primary text-primary-foreground"
              >
                {t("exam.takeTestAgain")}
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
                          isCorrect ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                        )}
                      >
                        {isCorrect ? "✓" : "✗"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">
                          {i + 1}. {q.question}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {q.type === "multiple" ? t("exam.kAusNMultiple") : t("exam.singleChoice")}
                        </p>
                        <ul className="mt-3 space-y-1.5">
                          {q.options.map((opt) => {
                            const isCorrectOption = q.correctIndices.includes(opt.index);
                            const isUserSelected = selected.includes(opt.index);
                            const isWrongSelection = isUserSelected && !isCorrectOption;
                            return (
                              <li
                                key={opt.index}
                                className={cn(
                                  "rounded-md border px-3 py-2 text-sm",
                                  isCorrectOption && isUserSelected &&
                                    "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700",
                                  isCorrectOption && !isUserSelected &&
                                    "border-green-500/70 bg-green-50/70 dark:bg-green-900/10 dark:border-green-700/70",
                                  isWrongSelection &&
                                    "border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-700"
                                )}
                              >
                                <span className="flex items-center gap-2">
                                  {isCorrectOption && (
                                    <span className="text-green-600 dark:text-green-400" aria-label="Correct answer">●</span>
                                  )}
                                  {isWrongSelection && (
                                    <span className="text-red-600 dark:text-red-400" aria-label="Your wrong selection">●</span>
                                  )}
                                  {!isCorrectOption && !isWrongSelection && (
                                    <span className="text-muted-foreground">○</span>
                                  )}
                                  {opt.text}
                                  {isUserSelected && (
                                    <span className="ml-1 text-xs font-medium text-muted-foreground">{t("exam.yourAnswer")}</span>
                                  )}
                                  {isCorrectOption && !isUserSelected && (
                                    <span className="ml-1 text-xs font-medium text-green-600 dark:text-green-400">{t("exam.correctLabel")}</span>
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

  const q = questions[currentIndex] as McqQuestion;
  const selected = answers[q.id] ?? [];

  function handleOptionClick(optionIndex: number) {
    if (q.type === "single") {
      setAnswer(q.id, [optionIndex]);
    } else {
      const next = selected.includes(optionIndex)
        ? selected.filter((i) => i !== optionIndex)
        : [...selected, optionIndex];
      setAnswer(q.id, next);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      {/* Only questions and options visible during the test */}
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {startTime && (
              <ExamCountdown
                startTime={startTime}
                onTimeUp={submit}
              />
            )}
            <span className="text-sm text-muted-foreground">
              {t("exam.questionOf")} {currentIndex + 1} {t("exam.questionOfLabel")} {questions.length}
            </span>
          </div>
          <Button
            variant={flagged.has(q.id) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFlag(q.id)}
          >
            <Flag className="mr-1 h-3 w-3" />
            {flagged.has(q.id) ? t("exam.flagged") : t("exam.flag")}
          </Button>
        </div>

        <Card className="flex flex-1 flex-col overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">{q.question}</CardTitle>
            {q.correctIndices.length > 1 && (
              <p className="text-muted-foreground text-xs font-normal">
                {t("exam.chooseAllCorrect")}
              </p>
            )}
            {q.correctIndices.length === 1 && (
              <CardDescription>{t("exam.selectOne")}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-2 overflow-auto">
            {q.options.map((opt) => {
              const isSelected = selected.includes(opt.index);
              const isMultiple = q.correctIndices.length > 1;
              return (
                <button
                  key={opt.index}
                  type="button"
                  onClick={() => handleOptionClick(opt.index)}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "hover:bg-muted/50"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center border text-xs",
                      isMultiple ? "rounded" : "rounded-full",
                      isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
                    )}
                  >
                    {isSelected ? <Check className="h-3 w-3" /> : null}
                  </span>
                  <span className="text-sm">{opt.text}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" onClick={prev} disabled={currentIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
            {t("exam.previous")}
          </Button>
          <div className="flex flex-wrap gap-1">
            {questions.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded text-xs transition-colors",
                  i === currentIndex
                    ? "bg-primary text-primary-foreground"
                    : flagged.has(questions[i].id)
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
          {currentIndex < questions.length - 1 ? (
            <Button onClick={next}>
              {t("exam.next")}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submit}>{t("exam.submit")}</Button>
          )}
        </div>
      </div>
    </div>
  );
}
