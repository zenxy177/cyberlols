import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getDiscordOAuthConfig } from "@/lib/discord";
import { createServerSupabase } from "@/lib/supabase/server";

const STATE_COOKIE = "discord-oauth-state";

function adminRedirect(request: NextRequest, status: string) {
  return NextResponse.redirect(
    new URL(`/admin?discord=${encodeURIComponent(status)}`, request.url),
  );
}

export async function GET(request: NextRequest) {
  const config = getDiscordOAuthConfig();
  if (!config) return adminRedirect(request, "configuration");

  let supabase;
  try {
    supabase = await createServerSupabase();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const { data: isOwner, error: roleError } =
    await supabase.rpc("is_site_admin");
  if (roleError || !isOwner) return adminRedirect(request, "authorization");

  const state = randomBytes(32).toString("base64url");
  const authorizationUrl = new URL("https://discord.com/oauth2/authorize");
  authorizationUrl.searchParams.set("client_id", config.clientId);
  authorizationUrl.searchParams.set("redirect_uri", config.redirectUri);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", "identify");
  authorizationUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    maxAge: 600,
    path: "/api/discord",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
