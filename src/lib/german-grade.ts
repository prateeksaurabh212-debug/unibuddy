import { GERMAN_GRADE_LABELS } from "@/types";

// Map percentage (0-100) to German grade 1.0 - 5.0
// Standard conversion used in many German universities
export function percentageToGermanGrade(percentage: number): number {
  if (percentage >= 97) return 1.0;
  if (percentage >= 94) return 1.3;
  if (percentage >= 90) return 1.7;
  if (percentage >= 85) return 2.0;
  if (percentage >= 80) return 2.3;
  if (percentage >= 75) return 2.7;
  if (percentage >= 70) return 3.0;
  if (percentage >= 65) return 3.3;
  if (percentage >= 60) return 3.7;
  if (percentage >= 55) return 4.0;
  return 5.0;
}

export function getGradeLabel(grade: number): string {
  return GERMAN_GRADE_LABELS[grade] ?? "Nicht bestanden";
}

// Score K-aus-N: full points only if all correct answers selected and no wrong ones
export function scoreMultipleSelect(
  correctIndices: number[],
  selectedIndices: number[]
): number {
  const correctSet = new Set(correctIndices);
  const selectedSet = new Set(selectedIndices);
  if (correctSet.size !== selectedSet.size) return 0;
  for (const i of correctIndices) {
    if (!selectedSet.has(i)) return 0;
  }
  return 1;
}
