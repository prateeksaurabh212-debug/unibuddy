import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

function normalizeErrorRedirect(res: Response, reqUrl?: string): Response {
  if (res.status < 302 || res.status > 303) return res;
  const loc = res.headers.get("location") ?? "";
  if (!loc.includes("error=google") && !loc.includes("error=Callback")) return res;
  if (reqUrl) console.error("[NextAuth] OAuth failed – request was:", reqUrl, "→ redirect:", loc);
  const fixed = loc
    .replace(/error=google/g, "error=OAuthCallback")
    .replace(/([?&])error=Callback(&|$)/g, "$1error=OAuthCallback$2");
  const headers = new Headers(res.headers);
  headers.set("location", fixed);
  return new Response(null, { status: res.status, headers });
}

export async function GET(
  req: Request,
  context: { params: Promise<{ nextauth?: string[] }> }
) {
  const res = await handler(req, context);
  return normalizeErrorRedirect(res, req.url);
}
export async function POST(
  req: Request,
  context: { params: Promise<{ nextauth?: string[] }> }
) {
  const res = await handler(req, context);
  return normalizeErrorRedirect(res, req.url);
}
