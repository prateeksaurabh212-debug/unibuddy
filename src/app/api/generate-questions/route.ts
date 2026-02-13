import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { McqQuestion, QuestionType } from "@/types";

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

const SYSTEM_PROMPT = `You are an expert at creating exam questions for German university courses. Given lecture or script text, generate exactly 10 multiple-choice questions.

Rules:
- Mix of "single" (1-aus-N: exactly one correct answer) and "multiple" (K-aus-N: one or more correct answers) types. Prefer at least 3 K-aus-N style questions.
- For K-aus-N (multiple), the student must select ALL correct answers to get points; partial credit is not given.
- Questions should be in English unless the concept is standard in German (e.g. "Prüfungsordnung").
- Each question has 4 options. Options are 0-indexed.
- Output must be a single JSON object with a "questions" key whose value is an array of question objects. No markdown, no code fences, no explanation.`;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const thisMonth = startOfMonth(now);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, creditsBalance: true, lastCreditsResetAt: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = user.id;

    const { lastCreditsResetAt } = user;
    let { creditsBalance } = user;
    if (!lastCreditsResetAt || startOfMonth(lastCreditsResetAt) < thisMonth) {
      creditsBalance = 5;
      await prisma.user.update({
        where: { id: userId },
        data: { creditsBalance: 5, lastCreditsResetAt: now },
      });
    }

    if (creditsBalance < 1) {
      return NextResponse.json(
        { error: "No credits left. You get 5 credits per month." },
        { status: 403 }
      );
    }

    const { pdfText } = (await req.json()) as { pdfText: string };
    if (!pdfText?.trim()) {
      return NextResponse.json(
        { error: "pdfText is required" },
        { status: 400 }
      );
    }

    const truncated =
      pdfText.length > 12000 ? pdfText.slice(0, 12000) + "..." : pdfText;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Generate exactly 10 MCQ questions from this text. You must respond with a single JSON object containing a "questions" array. Example shape: { "questions": [ { "id": "q1", "type": "single", "question": "...", "options": [ { "text": "...", "index": 0 }, ... ], "correctIndices": [0] }, ... ] }. Each item: type is "single" (one correct) or "multiple" (K-aus-N, all correct required); 4 options per question; correctIndices 0-based. No other text or markdown.\n\nText:\n${truncated}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    let parsed: unknown;
    try {
      const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
      parsed = JSON.parse(trimmed);
    } catch {
      console.error("generate-questions: invalid JSON from AI", raw.slice(0, 500));
      return NextResponse.json(
        { error: "AI returned invalid JSON. Try again." },
        { status: 500 }
      );
    }

    const rawQuestions: unknown[] = Array.isArray(parsed)
      ? parsed
      : typeof parsed === "object" && parsed !== null
      ? Array.isArray((parsed as Record<string, unknown>).questions)
        ? (parsed as Record<string, unknown[]>).questions
        : Array.isArray((parsed as Record<string, unknown>).items)
        ? (parsed as Record<string, unknown[]>).items
        : Array.isArray((parsed as Record<string, unknown>).mcqs)
        ? (parsed as Record<string, unknown[]>).mcqs
        : []
      : [];

    if (rawQuestions.length === 0) {
      const keys = typeof parsed === "object" && parsed !== null ? Object.keys(parsed as object) : [];
      console.warn("generate-questions: 0 questions in AI response. Top-level keys:", keys);
      return NextResponse.json(
        { error: "AI generated no questions. Try again or use longer source text." },
        { status: 422 }
      );
    }

    const questions: McqQuestion[] = rawQuestions.slice(0, 10).map((q: unknown, i) => {
      const x = q as Record<string, unknown>;
      const options = (Array.isArray(x.options) ? x.options : []).map(
        (opt: unknown, j: number) => {
          const o = opt as Record<string, unknown>;
          return {
            text: String(o?.text ?? ""),
            index: Number(o?.index) ?? j,
          };
        }
      );
      return {
        id: `q${i + 1}`,
        type: (x.type === "multiple" ? "multiple" : "single") as QuestionType,
        question: String(x.question ?? ""),
        options,
        correctIndices: Array.isArray(x.correctIndices)
          ? (x.correctIndices as number[]).map(Number)
          : [0],
      };
    });

    await prisma.user.update({
      where: { id: userId },
      data: { creditsBalance: { decrement: 1 } },
    });

    return NextResponse.json({ questions });
  } catch (e) {
    console.error("generate-questions error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to generate questions" },
      { status: 500 }
    );
  }
}
