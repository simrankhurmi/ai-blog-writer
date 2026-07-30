import { getBackendUrl } from "@/lib/api-config";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
]);

async function proxy(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const backend = getBackendUrl();
  const target = `${backend}/api/${path.join("/")}${req.nextUrl.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  let body: BodyInit | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.arrayBuffer();
  }

  try {
    const res = await fetch(target, {
      method: req.method,
      headers,
      body,
      signal: AbortSignal.timeout(120_000),
    });

    const resHeaders = new Headers();
    res.headers.forEach((value, key) => {
      if (!HOP_BY_HOP.has(key.toLowerCase())) {
        resHeaders.set(key, value);
      }
    });

    return new NextResponse(res.body, {
      status: res.status,
      headers: resHeaders,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Backend unavailable",
        message:
          "Deploy the server (Render/Railway) and set API_URL in Vercel to that URL, then redeploy.",
        backend,
      },
      { status: 502 }
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const PATCH = proxy;
export const OPTIONS = proxy;
