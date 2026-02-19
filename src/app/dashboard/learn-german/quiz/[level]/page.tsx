"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/contexts/LocaleContext";
import { percentageToGermanGrade, getGradeLabel } from "@/lib/german-grade";
import { cn } from "@/lib/utils";

const LEVELS = ["A1", "A2", "B1", "B2"] as const;

type VocabQuestion = {
  id: string;
  word: string;
  promptEnglish: string;
  options: { text: string; index: number }[];
  correctIndices: number[];
};

export default function VocabularyQuizPage() {
  const params = useParams();
  const level = params.level as string;
  const { t } = useLocale();
  const { update: updateSession } = useSession();

  const [questions, setQuestions] = useState<VocabQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedToPast, setSavedToPast] = useState(false);

  useEffect(() => {
    if (!LEVELS.includes(level as (typeof LEVELS)[number])) {
      setError("Invalid level");
      setLoading(false);
      return;
    }
    fetch("/api/vocabulary/start-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 403) setError(t("learnGerman.notEnoughCredits"));
          else setError(data?.error ?? "Failed to start quiz");
          return;
        }
        setQuestions(
          data.questions.map((q: { id: string; word: string; promptEnglish: string; options: { text: string; index: number }[]; correctIndices: number[] }) => ({
            id: q.id,
            word: q.word,
            promptEnglish: q.promptEnglish ?? q.word,
            options: q.options,
            correctIndices: q.correctIndices,
          }))
        );
      })
      .catch(() => setError("Failed to start quiz"))
      .finally(() => setLoading(false));
  }, [level, t]);

  useEffect(() => {
    if (!isComplete || questions.length === 0 || savedToPast) return;
    setSavedToPast(true);
    const moduleName = `Vocabulary ${level}`;
    fetch("/api/past-tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        moduleId: `vocabulary-${level}`,
        moduleName,
        testType: "vocabulary",
        resultData: JSON.stringify({ questions, answers }),
      }),
    }).catch(() => {});
    updateSession?.();
  }, [isComplete, questions, answers, level, savedToPast, updateSession]);

  const setAnswer = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">Loading quiz…</p>
      </div>
    );
  }
  if (error || questions.length === 0) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{t("learnGerman.practiceVocabulary")}</CardTitle>
            <CardDescription>{error ?? "No questions available."}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/learn-german">{t("learnGerman.backToLevels")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const q = questions[currentIndex];
  const selected = answers[q.id];

  // Results view
  if (isComplete) {
    let correct = 0;
    questions.forEach((q) => {
      const sel = answers[q.id];
      if (sel !== undefined && q.correctIndices.includes(sel)) correct += 1;
    });
    const percentage = (correct / questions.length) * 100;
    const grade = percentageToGermanGrade(percentage);
    const label = getGradeLabel(grade);

    return (
      <div className="mx-auto max-w-2xl space-y-6 py-8">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-center text-3xl">
              {label} ({grade.toFixed(1)})
            </CardTitle>
            <CardDescription className="text-center">
              {correct} / {questions.length} correct · {percentage.toFixed(0)}%
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-2">
            <Button asChild>
              <Link href="/dashboard/learn-german">{t("learnGerman.backToLevels")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/past-tests">View past tests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz view
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 md:min-h-[28rem]">
      <div className="mx-auto flex w-full max-w-2xl flex-1 min-h-0 flex-col gap-3 overflow-hidden">
        <div className="flex shrink-0 items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <Card className="flex min-h-0 flex-1 flex-shrink flex-col overflow-hidden">
          <CardHeader className="shrink-0">
            <CardTitle className="text-base">{t("learnGerman.selectWord")}</CardTitle>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto">
            <div className="rounded-lg border border-white/10 bg-muted/30 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {q.promptEnglish === q.word ? t("learnGerman.selectCorrectWord") : t("learnGerman.selectGermanFor")}
              </p>
              <p className="mt-2 text-2xl font-semibold">{q.promptEnglish}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((opt) => (
                <button
                  key={opt.index}
                  type="button"
                  onClick={() => setAnswer(q.id, opt.index)}
                  className={cn(
                    "rounded-lg border p-3 text-left text-sm font-medium transition-colors",
                    selected === opt.index
                      ? "border-primary bg-primary/10"
                      : "border-white/10 hover:bg-muted/50"
                  )}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="flex shrink-0 items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs md:h-8 md:w-8",
                  i === currentIndex ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
          {currentIndex < questions.length - 1 ? (
            <Button size="sm" onClick={() => setCurrentIndex((i) => i + 1)}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={() => setIsComplete(true)}>
              Submit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
