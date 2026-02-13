"use client";

import { memo } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Button } from "@/components/ui/button";

function LanguageSwitcherInner() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center gap-1 rounded-md border border-border p-0.5 [contain:layout_paint]">
      <Button
        variant={locale === "en" ? "secondary" : "ghost"}
        size="sm"
        className="h-7 min-w-[2rem] px-2 text-xs transition-none"
        onClick={() => setLocale("en")}
      >
        EN
      </Button>
      <Button
        variant={locale === "de" ? "secondary" : "ghost"}
        size="sm"
        className="h-7 min-w-[2rem] px-2 text-xs transition-none"
        onClick={() => setLocale("de")}
      >
        DE
      </Button>
    </div>
  );
}

export const LanguageSwitcher = memo(LanguageSwitcherInner);
