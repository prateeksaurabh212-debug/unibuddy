"use client";

import Link from "next/link";
import { ClipboardList, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocale } from "@/contexts/LocaleContext";
import { useEffect, useState } from "react";

interface PastTestItem {
  id: string;
  moduleId: string;
  moduleName: string;
  testType: string;
  completedAt: string;
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
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

export default function PastTestsPage() {
  const { t } = useLocale();
  const [list, setList] = useState<PastTestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/past-tests")
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  function testTypeLabel(type: string) {
    if (type === "mcq") return t("pastTests.testTypeMcq");
    if (type === "short_form") return t("pastTests.testTypeShort");
    if (type === "long_form") return t("pastTests.testTypeLong");
    if (type === "vocabulary") return t("pastTests.testTypeVocabulary");
    return type;
    return type;
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(t("pastTests.deleteConfirm"))) return;
    const res = await fetch(`/api/past-tests/${id}`, { method: "DELETE" });
    if (res.ok) setList((prev) => prev.filter((a) => a.id !== id));
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">{t("pastTests.title")}</h1>
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("pastTests.title")}</h1>

      {list.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-lg font-medium">{t("pastTests.noTests")}</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {t("pastTests.noTestsDesc")}
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard">{t("pastTests.backToHome")}</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((item) => (
            <Link key={item.id} href={`/dashboard/past-tests/${item.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">{testDisplayName(item.completedAt)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {testTypeLabel(item.testType)} · {formatDate(item.completedAt)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={(e) => handleDelete(e, item.id)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
