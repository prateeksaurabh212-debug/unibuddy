import { NextResponse } from "next/server";
import OpenAI from "openai";
import { PDFParse } from "pdf-parse";
import type { LetterScanResult } from "@/types";

const SYSTEM_PROMPT = `You are a helpful assistant for international students in Germany. You analyze German official letters (from University, Ausländerbehörde, etc.) written in formal "Beamtendeutsch".

For the given letter text (or description of an image of the letter), respond in JSON with:
- summary: 2-3 sentence plain English summary of what the letter says.
- actionRequired: If the student must do something (pay, submit documents, appear in person, renew visa by date), state it clearly in one sentence in English. If no action needed, set to null.
- toneCheck: One reassuring sentence (e.g. "This is standard notification, no need to panic" or "You need to act by the deadline") to reduce anxiety.
- dueDate: If a deadline is mentioned, ISO date string (YYYY-MM-DD) or null.
- amount: If a payment amount is mentioned (e.g. "312,50 EUR"), the string or null.`;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "file is required" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = file.type;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }
    const openai = new OpenAI({ apiKey });

    if (mime.startsWith("image/")) {
      // Use GPT-4o vision for images
      const base64 = buffer.toString("base64");
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image of a German official letter. Extract all text and meaning, then respond with the JSON fields: summary, actionRequired, toneCheck, dueDate, amount.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mime};base64,${base64}`,
                },
              },
            ],
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
      const result = JSON.parse(raw) as LetterScanResult;
      return NextResponse.json(result);
    }

    if (mime === "application/pdf") {
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const textResult = await parser.getText();
      await parser.destroy();
      const textToAnalyze = textResult?.text || "(No text extracted from PDF)";
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Letter text (extracted from PDF):\n\n${textToAnalyze}`,
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
      const result = JSON.parse(raw) as LetterScanResult;
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Unsupported file type. Use PDF or image." },
      { status: 400 }
    );
  } catch (e) {
    console.error("scan-letter error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to scan letter" },
      { status: 500 }
    );
  }
}
