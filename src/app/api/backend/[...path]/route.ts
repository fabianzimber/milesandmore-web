import { NextRequest } from "next/server";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

function getBackendBaseUrl(): string {
  const baseUrl = process.env.BACKEND_PUBLIC_URL || process.env.NEXT_PUBLIC_BOT_API_URL;
  if (!baseUrl) {
    throw new Error("Missing backend URL. Set BACKEND_PUBLIC_URL or NEXT_PUBLIC_BOT_API_URL.");
  }
  return baseUrl;
}

function getInternalApiSecret(): string | undefined {
  return process.env.MILESANDMORE_INTERNAL_API_SECRET || process.env.INTERNAL_JOB_SECRET || undefined;
}

async function forward(request: NextRequest, context: RouteContext): Promise<Response> {
  const backendBaseUrl = getBackendBaseUrl().replace(/\/$/, "");
  const { path } = await context.params;
  const proxyPath = path.join("/");
  const targetUrl = new URL(`${backendBaseUrl}/${proxyPath}${request.nextUrl.search}`);

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const normalized = key.toLowerCase();
    if (["host", "content-length", "connection"].includes(normalized)) {
      return;
    }
    headers.set(key, value);
  });

  const internalSecret = getInternalApiSecret();
  if (internalSecret) {
    headers.set("x-internal-job-secret", internalSecret);
  }

  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.text();

  const upstream = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const normalized = key.toLowerCase();
    if (["content-length", "connection", "transfer-encoding", "content-encoding"].includes(normalized)) {
      return;
    }
    responseHeaders.set(key, value);
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest, context: RouteContext): Promise<Response> {
  return forward(request, context);
}

export async function POST(request: NextRequest, context: RouteContext): Promise<Response> {
  return forward(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<Response> {
  return forward(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext): Promise<Response> {
  return forward(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext): Promise<Response> {
  return forward(request, context);
}
