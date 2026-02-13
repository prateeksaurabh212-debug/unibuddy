"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Module, McqQuestion } from "@/types";

const MODULES_KEY = "unibuddy-modules";

interface ModulesState {
  modules: Module[];
  addModule: (module: Module) => void;
  updateModule: (id: string, updates: Partial<Module>) => void;
  removeModule: (id: string) => void;
  getModule: (id: string) => Module | undefined;
}

export const useModulesStore = create<ModulesState>()(
  persist(
    (set, getState) => ({
      modules: [],
      addModule: (module) => set((s) => ({ modules: [...s.modules, module] })),
      updateModule: (id, updates) =>
        set((s) => ({
          modules: s.modules.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),
      removeModule: (id) =>
        set((s) => ({ modules: s.modules.filter((m) => m.id !== id) })),
      getModule: (id) => getState().modules.find((m) => m.id === id),
    }),
    { name: MODULES_KEY }
  )
);

// Active exam state (not persisted - in-memory only)
export interface ExamState {
  moduleId: string | null;
  questions: McqQuestion[];
  currentIndex: number;
  answers: Record<string, number[]>; // questionId -> selected option indices
  flagged: Set<string>;
  startTime: number | null;
  strictMode: boolean; // true = K-aus-N (no hints), false = practice
  isComplete: boolean;
}

interface ExamStore extends ExamState {
  startExam: (moduleId: string, questions: McqQuestion[], strictMode: boolean) => void;
  setAnswer: (questionId: string, optionIndices: number[]) => void;
  toggleFlag: (questionId: string) => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  submit: () => void;
  reset: () => void;
}

const initialExamState: ExamState = {
  moduleId: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  flagged: new Set(),
  startTime: null,
  strictMode: true,
  isComplete: false,
};

export const useExamStore = create<ExamStore>((set) => ({
  ...initialExamState,
  startExam: (moduleId, questions, strictMode) =>
    set({
      moduleId,
      questions,
      currentIndex: 0,
      answers: {},
      flagged: new Set(),
      startTime: Date.now(),
      strictMode,
      isComplete: false,
    }),
  setAnswer: (questionId, optionIndices) =>
    set((s) => ({
      answers: { ...s.answers, [questionId]: optionIndices },
    })),
  toggleFlag: (questionId) =>
    set((s) => {
      const next = new Set(s.flagged);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return { flagged: next };
    }),
  next: () =>
    set((s) => ({
      currentIndex: Math.min(s.currentIndex + 1, s.questions.length - 1),
    })),
  prev: () =>
    set((s) => ({
      currentIndex: Math.max(s.currentIndex - 1, 0),
    })),
  goTo: (index) =>
    set((s) => ({
      currentIndex: Math.max(0, Math.min(index, s.questions.length - 1)),
    })),
  submit: () => set({ isComplete: true }),
  reset: () => set(initialExamState),
}));
