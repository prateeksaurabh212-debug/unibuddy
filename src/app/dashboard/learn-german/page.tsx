"use client";

import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const LEVELS = ["A1", "A2", "B1", "B2"] as const;
const CREDITS: Record<(typeof LEVELS)[number], number> = {
  A1: 2,
  A2: 2,
  B1: 3,
  B2: 3,
};

export default function LearnGermanPage() {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("learnGerman.title")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t("learnGerman.practiceVocabulary")}
        </p>
      </div>
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
