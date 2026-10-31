import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getDiscordOAuthConfig } from "@/lib/discord";
import { createServerSupabase } from "@/lib/supabase/server";

const STATE_COOKIE = "discord-oauth-state";
const DISCORD_API = "https://discord.com/api/v10";

type DiscordTokenResponse = {
  access_token?: unknown;
};

type DiscordUser = {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
};

function adminRedirect(request: NextRequest, status: string) {
  return NextResponse.redirect(
    new URL(`/admin?discord=${encodeURIComponent(status)}`, request.url),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function validDiscordUser(value: unknown): DiscordUser | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== "string" ||
    !/^\d{17,20}$/.test(value.id) ||
    typeof value.username !== "string" ||
    !value.username
  ) {
    return null;
  }

  return {
    id: value.id,
    username: value.username,
    global_name:
      typeof value.global_name === "string" ? value.global_name : null,
    avatar: typeof value.avatar === "string" ? value.avatar : null,
  };
}

function stateMatches(expected: string, received: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.set(STATE_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/api/discord",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  const receivedState = request.nextUrl.searchParams.get("state") ?? "";
  if (!expectedState || !stateMatches(expectedState, receivedState)) {
    return adminRedirect(request, "authorization");
  }

  const providerError = request.nextUrl.searchParams.get("error");
  if (providerError === "access_denied") {
    return adminRedirect(request, "cancelled");
  }
  if (providerError) return adminRedirect(request, "authorization");

  const code = request.nextUrl.searchParams.get("code");
  const config = getDiscordOAuthConfig();
  if (!config) return adminRedirect(request, "configuration");
  if (!code) return adminRedirect(request, "authorization");

  let supabase;
  try {
    supabase = await createServerSupabase();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const {
    data: { user: owner },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !owner) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const { data: isOwner, error: roleError } =
    await supabase.rpc("is_site_admin");
  if (roleError || !isOwner) return adminRedirect(request, "authorization");

  try {
    const tokenResponse = await fetch(`${DISCORD_API}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: config.redirectUri,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!tokenResponse.ok) {
      console.error("Discord OAuth token exchange failed:", tokenResponse.status);
      return adminRedirect(request, "authorization");
    }

    const tokenPayload: unknown = await tokenResponse.json();
    const accessToken =
      isRecord(tokenPayload) &&
      typeof (tokenPayload as DiscordTokenResponse).access_token === "string"
        ? (tokenPayload as DiscordTokenResponse).access_token
        : null;
    if (!accessToken) return adminRedirect(request, "authorization");

    const userResponse = await fetch(`${DISCORD_API}/users/@me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!userResponse.ok) {
      console.error("Discord identity lookup failed:", userResponse.status);
      return adminRedirect(request, "authorization");
    }

    const discordUser = validDiscordUser(await userResponse.json());
    if (!discordUser) return adminRedirect(request, "authorization");

    const discordAvatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${discordUser.avatar.startsWith("a_") ? "gif" : "png"}?size=128`
      : null;
    const identity = {
      discord_user_id: discordUser.id,
      discord_username: discordUser.username,
      discord_global_name: discordUser.global_name,
      discord_avatar_url: discordAvatarUrl,
    };

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", "main")
      .maybeSingle();
    if (profileError) {
      console.error("Discord profile lookup failed:", profileError.message);
      return adminRedirect(request, "profile");
    }

    const { error: saveError } = profile
      ? await supabase.from("profiles").update(identity).eq("id", "main")
      : await supabase.from("profiles").insert({ id: "main", ...identity });
    if (saveError) {
      console.error("Discord identity save failed:", saveError.message);
      return adminRedirect(request, "profile");
    }

    return adminRedirect(request, "connected");
  } catch (error) {
    console.error("Discord account connection failed:", error);
    return adminRedirect(request, "authorization");
  }
}
