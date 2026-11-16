import { NextResponse } from "next/server";
import { getPresenceApiConfig } from "@/lib/presence-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" } as const;

export async function GET() {
  const config = getPresenceApiConfig();
  if (!config) {
    return NextResponse.json(
      { success: false, error: "not_configured" },
      { status: 503, headers: NO_STORE },
    );
  }

  try {
    const response = await fetch(config.restUrl, {
      headers: { "x-api-key": config.key },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "upstream_unavailable" },
        { status: 502, headers: NO_STORE },
      );
    }

    const payload = (await response.json()) as unknown;
    return NextResponse.json(payload, { headers: NO_STORE });
  } catch {
    return NextResponse.json(
      { success: false, error: "unreachable" },
      { status: 502, headers: NO_STORE },
    );
  }
}
