"use client";

import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { useModulesStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function ModulesPage() {
  const { modules } = useModulesStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Modules</h1>
        <Button asChild>
          <Link href="/dashboard/modules/new">
            <Plus className="mr-2 h-4 w-4" />
            Add module
          </Link>
        </Button>
      </div>

      {modules.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center"
        >
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-lg font-medium">No modules yet</p>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            Upload a lecture PDF or script to generate practice exams and start
            studying.
          </p>
          <Button asChild>
            <Link href="/dashboard/modules/new">
              <Plus className="mr-2 h-4 w-4" />
              Add your first module
            </Link>
          </Button>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/dashboard/modules/${mod.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {mod.questions.length} questions
                      </span>
                    </div>
                    <h3 className="font-semibold">{mod.name}</h3>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {mod.pdfFileName}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
