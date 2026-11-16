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

    const restUrl = new URL("/presence", baseUrl);
    const wsUrl = new URL("/ws", baseUrl);
    wsUrl.protocol = baseUrl.protocol === "https:" ? "wss:" : "ws:";
    wsUrl.searchParams.set("key", key);

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
