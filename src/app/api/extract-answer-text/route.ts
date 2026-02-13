import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    if (mime.startsWith("image/")) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "OPENAI_API_KEY is not configured" },
          { status: 500 }
        );
      }
      const base64 = buffer.toString("base64");
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a document OCR assistant. Extract ALL text from the image exactly as it appears. Preserve line breaks and structure. Return only the raw extracted text, no commentary or JSON.",
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${mime};base64,${base64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 4096,
      });
      const text = completion.choices[0]?.message?.content?.trim() ?? "";
      return NextResponse.json({ text });
    }

    if (mime === "application/pdf") {
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const textResult = await parser.getText();
      await parser.destroy();
      const text = textResult?.text?.trim() ?? "";
      return NextResponse.json({ text });
    }

    if (
      mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name?.toLowerCase().endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value.trim();
      return NextResponse.json({ text });
    }

    return NextResponse.json(
      {
        error:
          "Unsupported file type. Use an image (photo), PDF, or Word document (.docx).",
      },
      { status: 400 }
    );
  } catch (e) {
    console.error("extract-answer-text error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to extract text" },
      { status: 500 }
    );
  }
}
