type PresenceApiConfig = {
  restUrl: string;
  wsUrl: string;
  key: string;
};

export function getPresenceApiConfig(): PresenceApiConfig | null {
  const base = process.env.PRESENCE_API_URL?.trim();
  const key = process.env.PRESENCE_API_KEY?.trim();
  if (!base || !key) return null;

  try {
    const baseUrl = new URL(base);
    if (baseUrl.protocol !== "http:" && baseUrl.protocol !== "https:") {
      return null;
    }
    const isLocalhost =
      baseUrl.hostname === "localhost" ||
      baseUrl.hostname === "127.0.0.1" ||
      baseUrl.hostname === "::1";
    if (process.env.NODE_ENV === "production" && baseUrl.protocol !== "https:" && !isLocalhost) {
      return null;
    }

    const restUrl = new URL("/presence", baseUrl);
    const wsUrl = new URL("/ws", baseUrl);
    wsUrl.protocol = baseUrl.protocol === "https:" ? "wss:" : "ws:";

    // Botun kök yolu özel bir prefix içeriyorsa (ör. /warxy) koru.
    if (baseUrl.pathname && baseUrl.pathname !== "/") {
      restUrl.pathname = `${baseUrl.pathname.replace(/\/$/, "")}/presence`;
      wsUrl.pathname = `${baseUrl.pathname.replace(/\/$/, "")}/ws`;
    }

    return { restUrl: restUrl.toString(), wsUrl: wsUrl.toString(), key };
  } catch {
    return null;
  }
}
