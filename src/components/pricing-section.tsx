"use client";

import { useEffect, useState } from "react";
import { BookOpen, Zap, Crown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/contexts/LocaleContext";

type PlanId = "free" | "premium" | "pro";

export function PricingSection() {
  const { t } = useLocale();
  const [interestedPremium, setInterestedPremium] = useState(false);
  const [interestedPro, setInterestedPro] = useState(false);
  const [loading, setLoading] = useState<PlanId | null>(null);

  useEffect(() => {
    fetch("/api/interest-plan")
      .then((r) => r.json())
      .then((data) => {
        if (data.interestedInPremium) setInterestedPremium(true);
        if (data.interestedInPro) setInterestedPro(true);
      })
      .catch(() => {});
  }, []);

  async function handleInterest(plan: "premium" | "pro") {
    setLoading(plan);
    try {
      const res = await fetch("/api/interest-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (res.ok) {
        if (plan === "premium") setInterestedPremium(true);
        else setInterestedPro(true);
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("dashboard.pricingTitle")}</h2>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {/* Basic (free tier) */}
        <Card className="relative flex flex-col">
          <CardHeader className="space-y-3 pb-2">
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <CardTitle>{t("dashboard.planFree")}</CardTitle>
            <CardDescription>{t("dashboard.planFreeFor")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col pt-2">
            <p className="text-2xl font-bold">{t("dashboard.planFreePrice")}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t("dashboard.planFreeCredits")}</p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                {t("dashboard.pricingFeatureMcq")}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                {t("dashboard.pricingFeatureWritten")}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                {t("dashboard.pricingFeatureRenewal")}
              </li>
            </ul>
            <div className="mt-8 flex-1" />
            <Button variant="default" className="w-full" disabled>
              {t("dashboard.currentPlan")}
            </Button>
          </CardContent>
        </Card>

        {/* Premium - Coming soon */}
        <Card className="relative flex flex-col overflow-visible">
          <div className="absolute -top-3 left-6 z-10">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-gradient-to-r from-primary to-primary/80 px-4 py-1 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20">
              {t("dashboard.comingSoon")}
            </span>
          </div>
          <CardHeader className="space-y-3 pb-2">
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
              <Zap className="h-5 w-5" />
            </div>
            <CardTitle>{t("dashboard.planPremium")}</CardTitle>
            <CardDescription>{t("dashboard.planPremiumFor")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col pt-2">
            <p className="text-2xl font-bold">{t("dashboard.planPremiumPrice")}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t("dashboard.planPremiumTokens")}</p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                {t("dashboard.pricingFeatureMcq")}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                {t("dashboard.pricingFeatureWritten")}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                {t("dashboard.pricingFeatureRenewal")}
              </li>
            </ul>
            <div className="mt-8 flex-1" />
            {interestedPremium ? (
              <p className="text-center text-sm text-muted-foreground">
                {t("dashboard.interestRecorded")}
              </p>
            ) : (
              <Button
                variant="default"
                className="w-full"
                disabled={loading !== null}
                onClick={() => handleInterest("premium")}
              >
                {loading === "premium" ? "…" : t("dashboard.imInterested")}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Pro - Coming soon */}
        <Card className="relative flex flex-col overflow-visible">
          <div className="absolute -top-3 left-6 z-10">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-gradient-to-r from-primary to-primary/80 px-4 py-1 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20">
              {t("dashboard.comingSoon")}
            </span>
          </div>
          <CardHeader className="space-y-3 pb-2">
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
              <Crown className="h-5 w-5" />
            </div>
            <CardTitle>{t("dashboard.planPro")}</CardTitle>
            <CardDescription>{t("dashboard.planProFor")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col pt-2">
            <p className="text-2xl font-bold">{t("dashboard.planProPrice")}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t("dashboard.planProTokens")}</p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                {t("dashboard.pricingFeatureMcq")}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                {t("dashboard.pricingFeatureWritten")}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                {t("dashboard.pricingFeatureRenewal")}
              </li>
            </ul>
            <div className="mt-8 flex-1" />
            {interestedPro ? (
              <p className="text-center text-sm text-muted-foreground">
                {t("dashboard.interestRecorded")}
              </p>
            ) : (
              <Button
                variant="default"
                className="w-full"
                disabled={loading !== null}
                onClick={() => handleInterest("pro")}
              >
                {loading === "pro" ? "…" : t("dashboard.imInterested")}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
