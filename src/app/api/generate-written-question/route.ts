import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { pdfText?: string; formType?: "short" | "long" };
    const { pdfText, formType } = body;
    if (!pdfText?.trim() || !formType) {
      return NextResponse.json(
        { error: "pdfText and formType (short|long) are required" },
        { status: 400 }
      );
    }
    if (formType !== "short" && formType !== "long") {
      return NextResponse.json(
        { error: "formType must be 'short' or 'long'" },
        { status: 400 }
      );
    }

    const materialSnippet =
      pdfText.length > 12000 ? pdfText.slice(0, 12000) + "..." : pdfText;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const prompt =
      formType === "short"
        ? `Based on the following module material, generate exactly ONE short-answer question that a student can answer in at most 50 words. The question should test understanding of a key concept from the material. Output only the question text, no numbering, no explanation.`
        : `Based on the following module material, generate exactly ONE essay question or prompt that a student can answer in a detailed response (up to about 3 pages). The question should invite analysis, comparison, or explanation of concepts from the material. Output only the question/prompt text, no numbering, no explanation.`;

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `${prompt}\n\nModule material:\n\n${materialSnippet}`,
        },
      ],
      max_tokens: 300,
    });

    const question = completion.choices[0]?.message?.content?.trim();
    if (!question) {
      return NextResponse.json(
        { error: "Could not generate question" },
        { status: 500 }
      );
    }

    return NextResponse.json({ question });
  } catch (e) {
    console.error("generate-written-question error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to generate question" },
      { status: 500 }
    );
  }
}
