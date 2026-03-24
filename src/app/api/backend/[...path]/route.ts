import { NextRequest } from "next/server";
import { auth } from "@/auth";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

const adminTwitchIds = (process.env.ADMIN_TWITCH_IDS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

function getBackendBaseUrl(): string {
  let baseUrl =
    process.env.BACKEND_PUBLIC_URL || process.env.NEXT_PUBLIC_BOT_API_URL;
  if (!baseUrl) {
    throw new Error(
      "Missing backend URL. Set BACKEND_PUBLIC_URL or NEXT_PUBLIC_BOT_API_URL.",
    );
  }
  // Force HTTPS to prevent 301 redirects that downgrade POST to GET
  if (baseUrl.startsWith("http://") && baseUrl.includes(".up.railway.app")) {
    baseUrl = baseUrl.replace("http://", "https://");
  }
  return baseUrl;
}

function getInternalApiSecret(): string | undefined {
  return (
    process.env.MILESANDMORE_INTERNAL_API_SECRET ||
    process.env.INTERNAL_JOB_SECRET ||
    undefined
  );
}

async function canForwardInternalSecret(): Promise<boolean> {
  if (adminTwitchIds.length === 0) {
    return false;
  }

  const session = await auth();
  const userId = session?.user?.id;
  return typeof userId === "string" && adminTwitchIds.includes(userId);
}

async function forward(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const backendBaseUrl = getBackendBaseUrl().replace(/\/$/, "");
  const { path } = await context.params;
  const proxyPath = path.join("/");
  const targetUrl = new URL(
    `${backendBaseUrl}/${proxyPath}${request.nextUrl.search}`,
  );

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const normalized = key.toLowerCase();
    if (
      [
        "host",
        "content-length",
        "connection",
        "x-internal-job-secret",
      ].includes(normalized)
    ) {
      return;
    }
    headers.set(key, value);
  });

  const internalSecret = getInternalApiSecret();
  if (internalSecret && (await canForwardInternalSecret())) {
    headers.set("x-internal-job-secret", internalSecret);
  }

  const bodyText = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : await request.text();
  const body = bodyText ? bodyText : undefined;

  const upstream = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
    redirect: "manual",
  });

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const normalized = key.toLowerCase();
    if (
      [
        "content-length",
        "connection",
        "transfer-encoding",
        "content-encoding",
      ].includes(normalized)
    ) {
      return;
    }
    responseHeaders.set(key, value);
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  return forward(request, context);
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  return forward(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  return forward(request, context);
}

export async function PUT(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  return forward(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  return forward(request, context);
}
