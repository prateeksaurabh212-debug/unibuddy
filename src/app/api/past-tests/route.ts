import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const attempts = await prisma.testAttempt.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: "desc" },
      select: {
        id: true,
        moduleId: true,
        moduleName: true,
        testType: true,
        completedAt: true,
      },
    });
    return NextResponse.json(attempts);
  } catch (e) {
    console.error("past-tests GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to list past tests" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const body = (await req.json()) as {
      moduleId: string;
      moduleName: string;
      testType: "mcq" | "short_form" | "long_form" | "vocabulary";
      resultData: string;
    };
    const { moduleId, moduleName, testType, resultData } = body;
    if (!moduleId || !moduleName || !testType || resultData === undefined) {
      return NextResponse.json(
        { error: "moduleId, moduleName, testType, and resultData are required" },
        { status: 400 }
      );
    }
    if (!["mcq", "short_form", "long_form", "vocabulary"].includes(testType)) {
      return NextResponse.json(
        { error: "testType must be mcq, short_form, long_form, or vocabulary" },
        { status: 400 }
      );
    }
    const attempt = await prisma.testAttempt.create({
      data: {
        userId: user.id,
        moduleId,
        moduleName,
        testType,
        resultData: typeof resultData === "string" ? resultData : JSON.stringify(resultData),
      },
    });
    return NextResponse.json({ id: attempt.id });
  } catch (e) {
    console.error("past-tests POST error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to save past test" },
      { status: 500 }
    );
  }
}
