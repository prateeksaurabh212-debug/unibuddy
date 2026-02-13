import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

const SHORT_FORM_CREDITS = 2;
const LONG_FORM_CREDITS = 3;
const SHORT_MAX_SCORE = 5;
const LONG_MAX_SCORE = 25;

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

    const body = (await req.json()) as {
      pdfText?: string;
      answerText?: string;
      formType?: "short" | "long";
      question?: string;
    };
    const { pdfText, answerText, formType, question } = body;
    if (!pdfText?.trim() || !answerText?.trim() || !formType) {
      return NextResponse.json(
        { error: "pdfText, answerText, and formType (short|long) are required" },
        { status: 400 }
      );
    }
    if (formType !== "short" && formType !== "long") {
      return NextResponse.json(
        { error: "formType must be 'short' or 'long'" },
        { status: 400 }
      );
    }

    const creditsRequired = formType === "short" ? SHORT_FORM_CREDITS : LONG_FORM_CREDITS;
    if (creditsBalance < creditsRequired) {
      return NextResponse.json(
        {
          error: `Not enough credits. This test requires ${creditsRequired} credits. You have ${creditsBalance}.`,
        },
        { status: 403 }
      );
    }

    const maxScore = formType === "short" ? SHORT_MAX_SCORE : LONG_MAX_SCORE;
    const materialSnippet =
      pdfText.length > 14000 ? pdfText.slice(0, 14000) + "..." : pdfText;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const systemPrompt =
      formType === "short"
        ? `You are an expert academic evaluator. You grade a SHORT-FORM written answer (max 50 words) against the provided module material and your general knowledge of the topic.

- Score the answer out of ${SHORT_MAX_SCORE} based on: accuracy, relevance to the material, and clarity.
- After grading, provide a detailed critique in plain text (not JSON) with:
  1. Overall score (X/${SHORT_MAX_SCORE}) and one-line summary.
  2. Strengths: what the student did well.
  3. Weaknesses: what was missing or incorrect.
  4. Areas for improvement: specific suggestions to study or re-read from the material.

Respond with a single block of text. Start with "SCORE: X/${SHORT_MAX_SCORE}" on the first line, then a blank line, then "FEEDBACK:" and your detailed critique.`
        : `You are an expert academic evaluator. You grade a LONG-FORM written answer (essay, up to ~3 pages) against the provided module material and your general knowledge of the topic.

- Score the answer out of ${LONG_MAX_SCORE} based on: coverage of key concepts, accuracy, structure, use of the material, and clarity.
- After grading, provide a detailed critique in plain text (not JSON) with:
  1. Overall score (X/${LONG_MAX_SCORE}) and a brief summary.
  2. Strengths: what the student did well.
  3. Weaknesses: what was missing, incorrect, or underdeveloped.
  4. Areas for improvement: specific topics or sections to re-read from the material and how to improve.

Respond with a single block of text. Start with "SCORE: X/${LONG_MAX_SCORE}" on the first line, then a blank line, then "FEEDBACK:" and your detailed critique.`;

    const questionBlock = question?.trim()
      ? `Question the student was asked:\n${question.trim()}\n\n`
      : "";
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Module material (excerpt):\n\n${materialSnippet}\n\n---\n\n${questionBlock}Student's answer:\n\n${answerText.trim()}`,
        },
      ],
      max_tokens: 2048,
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) {
      return NextResponse.json(
        { error: "No response from evaluator" },
        { status: 500 }
      );
    }

    const scoreMatch = raw.match(/SCORE:\s*(\d+)\s*\/\s*(\d+)/i);
    let score = 0;
    if (scoreMatch) {
      score = Math.min(maxScore, Math.max(0, parseInt(scoreMatch[1], 10)));
    }
    let feedback = raw;
    const feedbackLabel = raw.indexOf("FEEDBACK:");
    if (feedbackLabel !== -1) {
      feedback = raw.slice(feedbackLabel + "FEEDBACK:".length).trim();
    }

    await prisma.user.update({
      where: { id: userId },
      data: { creditsBalance: { decrement: creditsRequired } },
    });

    return NextResponse.json({
      score,
      maxScore,
      feedback,
    });
  } catch (e) {
    console.error("evaluate-written error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Evaluation failed" },
      { status: 500 }
    );
  }
}
