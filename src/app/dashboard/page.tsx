"use client";

import Link from "next/link";
import { BookOpen, ArrowRight, ClipboardList, GraduationCap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PricingSection } from "@/components/pricing-section";
import { HeroStudyIllustration } from "@/components/hero-study-illustration";
import { useLocale } from "@/contexts/LocaleContext";

const PUNCHLINE_HIGHLIGHTS: Record<"en" | "de", string[]> = {
  en: ["AI", "Germany"],
  de: ["KI", "Deutschland"],
};

function Punchline({ text, locale }: { text: string; locale: "en" | "de" }) {
  const words = PUNCHLINE_HIGHLIGHTS[locale];
  const regex = new RegExp(`(${words.join("|")})`, "gi");
  const parts = text.split(regex);
  return (
    <p className="mb-8 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
      {parts.map((part, i) =>
        words.some((w) => w.toLowerCase() === part.toLowerCase()) ? (
          <span key={i} className="text-primary">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}

export default function DashboardPage() {
  const { t, locale } = useLocale();
  return (
    <div className="space-y-20">
      <section className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
        <div className="min-w-0 flex-1 space-y-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary shadow-sm md:px-5 md:py-2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {t("dashboard.freeCreditsBadge")}
          </span>
          <Punchline text={t("dashboard.punchline")} locale={locale} />
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("dashboard.heroTitle1")}
            <br />
            <span className="text-gradient-primary">{t("dashboard.heroTitle2")}</span>
            {t("dashboard.heroTitleSuffix")}
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            {t("dashboard.heroSub")}
          </p>
          <Button asChild size="lg" className="mt-4">
            <Link href="/dashboard/modules/new">
              {t("dashboard.createFirstQuiz")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-muted-foreground">
            {t("dashboard.unlockedCreditsSignupBefore")}
            <Star className="inline h-4 w-4 fill-amber-400 text-amber-400" />
            {t("dashboard.unlockedCreditsSignupAfter")}
          </p>
        </div>
        <div className="flex-shrink-0 lg:max-w-[387px] xl:max-w-[460px] lg:mr-24">
          <HeroStudyIllustration className="w-full max-w-[339px] mx-auto lg:max-w-none lg:ml-0" />
        </div>
      </section>

      <section>
        <h2 className="mb-10 text-2xl font-semibold tracking-tight sm:text-3xl">{t("dashboard.whereNext")}</h2>
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card className="group transition-all hover:shadow-md">
            <Link href="/dashboard/modules" className="block">
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{t("dashboard.myModules")}</CardTitle>
                <CardDescription>{t("dashboard.myModulesDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center text-sm font-medium text-primary group-hover:underline">
                  {t("dashboard.openMyModules")}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </CardContent>
            </Link>
          </Card>
          <Card className="group transition-all hover:shadow-md">
            <Link href="/dashboard/past-tests" className="block">
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{t("dashboard.myPastTests")}</CardTitle>
                <CardDescription>{t("dashboard.myPastTestsDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center text-sm font-medium text-primary group-hover:underline">
                  {t("dashboard.openMyPastTests")}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </CardContent>
            </Link>
          </Card>
          <Card className="group transition-all hover:shadow-md">
            <Link href="/dashboard/learn-german" className="block">
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{t("dashboard.learnGerman")}</CardTitle>
                <CardDescription>{t("dashboard.learnGermanDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center text-sm font-medium text-primary group-hover:underline">
                  {t("dashboard.openLearnGerman")}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </CardContent>
            </Link>
          </Card>
        </div>
      </section>

      <section className="border-t pt-20 pb-24">
        <PricingSection />
      </section>
    </div>
  );
}
