// MCQ question from AI (K-aus-N: multiple select, or 1-aus-N: single choice)
export type QuestionType = "single" | "multiple";

export interface McqOption {
  text: string;
  index: number;
}

export interface McqQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options: McqOption[];
  correctIndices: number[]; // 0-based indices of correct answers (K-aus-N)
}

// Module = one subject/course with uploaded PDF and generated questions
export interface Module {
  id: string;
  name: string;
  pdfText: string;
  pdfFileName: string;
  questions: McqQuestion[];
  createdAt: number;
}

// German grade 1.0 (best) to 5.0 (fail)
export type GermanGrade = 1.0 | 1.3 | 1.7 | 2.0 | 2.3 | 2.7 | 3.0 | 3.3 | 3.7 | 4.0 | 5.0;

export const GERMAN_GRADE_LABELS: Record<number, string> = {
  1.0: "Sehr gut",
  1.3: "Sehr gut",
  1.7: "Gut",
  2.0: "Gut",
  2.3: "Gut",
  2.7: "Befriedigend",
  3.0: "Befriedigend",
  3.3: "Befriedigend",
  3.7: "Ausreichend",
  4.0: "Ausreichend",
  5.0: "Nicht bestanden",
};

// Letter scan result from OpenAI
export interface LetterScanResult {
  summary: string;
  actionRequired: string | null;
  toneCheck: string;
  dueDate?: string;
  amount?: string;
}
