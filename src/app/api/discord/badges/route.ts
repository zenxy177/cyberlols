import { NextResponse, type NextRequest } from "next/server";
import { resolveDiscordBadges } from "@/lib/discord-badges";
import {
  checkRateLimit,
  getClientIp,
  logThrottledWarn,
} from "@/lib/rate-limit";

export const runtime = "nodejs";
export const revalidate = 600;

interface DiscordUserResponse {
  id?: string;
  username?: string;
  public_flags?: number;
  flags?: number;
  [key: string]: unknown;
}

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

const SUCCESS_CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
};

export async function GET(req: NextRequest) {
  // 1. Sliding window IP Rate Limiting (60 requests per minute per IP)
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`discord-badges:${clientIp}`, 60, 60_000);
  if (!rateLimit.allowed) {
    logThrottledWarn(
      `rate_limit_badges_${clientIp}`,
      `Rate limit exceeded for IP: ${clientIp}`,
    );
    return NextResponse.json([], {
      status: 200,
      headers: {
        ...NO_CACHE_HEADERS,
        "Retry-After": String(rateLimit.retryAfterSeconds),
      },
    });
  }

  // 2. Resolve Environment Configuration
  const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
  const envUserId = process.env.DISCORD_USER_ID?.trim();

  // Allow optional user_id query param if valid Discord snowflake, otherwise fallback to env
  const { searchParams } = new URL(req.url);
  const queryUserId = searchParams.get("user_id")?.trim();
  const targetUserId =
    queryUserId && /^\d{17,20}$/.test(queryUserId) ? queryUserId : envUserId;

  if (!botToken || !targetUserId) {
    logThrottledWarn(
      "discord_badges_missing_env",
      "Discord bot token or user ID is missing; returning empty badges list.",
    );
    return NextResponse.json([], {
      status: 200,
      headers: NO_CACHE_HEADERS,
    });
  }

  // 3. Fetch user data from Discord REST API v10
  try {
    const discordRes = await fetch(
      `https://discord.com/api/v10/users/${encodeURIComponent(targetUserId)}`,
      {
        headers: {
          Authorization: `Bot ${botToken}`,
          "User-Agent": "BiositeDiscordBadges/1.0",
        },
        next: { revalidate: 600 },
        signal: AbortSignal.timeout(5000),
      },
    );

    if (!discordRes.ok) {
      const status = discordRes.status;
      logThrottledWarn(
        `discord_api_error_${status}`,
        `Discord API responded with status ${status} for user ${targetUserId}`,
      );
      return NextResponse.json([], {
        status: 200,
        headers: NO_CACHE_HEADERS,
      });
    }

    const data = (await discordRes.json()) as DiscordUserResponse;
    const rawFlags =
      typeof data.public_flags === "number"
        ? data.public_flags
        : typeof data.flags === "number"
          ? data.flags
          : 0;

    const resolved = resolveDiscordBadges(rawFlags);
    const badges = resolved.map((b) => ({
      key: b.key,
      label: b.label,
      description: b.description,
    }));

    return NextResponse.json(badges, {
      status: 200,
      headers: SUCCESS_CACHE_HEADERS,
    });
  } catch (err: unknown) {
    logThrottledWarn(
      "discord_badges_fetch_exception",
      `Failed to fetch Discord user badges: ${err instanceof Error ? err.message : String(err)}`,
    );
    return NextResponse.json([], {
      status: 200,
      headers: NO_CACHE_HEADERS,
    });
  }
}
