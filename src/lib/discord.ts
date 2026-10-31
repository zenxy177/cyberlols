export type DiscordOAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export function getDiscordOAuthConfig(): DiscordOAuthConfig | null {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) return null;

  try {
    const url = new URL(redirectUri);
    const isLocalHttp =
      url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1");

    if (
      (url.protocol !== "https:" && !isLocalHttp) ||
      url.pathname !== "/api/discord/callback" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      return null;
    }

    return { clientId, clientSecret, redirectUri: url.toString() };
  } catch {
    return null;
  }
}
