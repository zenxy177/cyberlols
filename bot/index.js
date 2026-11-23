"use strict";

require("dotenv").config();

const crypto = require("node:crypto");
const http = require("node:http");
const https = require("node:https");
const fs = require("node:fs");
const { Client, GatewayIntentBits, Partials, Events } = require("discord.js");
const { WebSocketServer, WebSocket } = require("ws");

const sslCertPath = (process.env.SSL_CERT_PATH || "").trim();
const sslKeyPath = (process.env.SSL_KEY_PATH || "").trim();
const isHttps = Boolean(
  sslCertPath &&
  sslKeyPath &&
  fs.existsSync(sslCertPath) &&
  fs.existsSync(sslKeyPath)
);

const PORT = Number(process.env.PORT || process.env.SERVER_PORT || 3001);
const HOST = process.env.HOST || "0.0.0.0";
const API_KEY = (process.env.PRESENCE_API_KEY || "").trim();
const TARGET_USER_ID = (process.env.TARGET_USER_ID || "").trim();
const GUILD_ID_RAW = (process.env.GUILD_ID || "").trim();
const GUILD_ID = /^\d{17,20}$/.test(GUILD_ID_RAW) ? GUILD_ID_RAW : "";
if (GUILD_ID_RAW && !GUILD_ID) {
  console.warn(
    `GUILD_ID geçersiz ("${GUILD_ID_RAW}"); yok sayılıp tüm sunucular taranacak.`,
  );
}
const DISCORD_TOKEN = (process.env.DISCORD_TOKEN || "").trim();
const MOCK = /^(1|true|yes)$/i.test(process.env.MOCK_PRESENCE || "");

if (!API_KEY) {
  console.error("PRESENCE_API_KEY tanımlı değil. Botu başlatmadan önce panelde ekleyin.");
  process.exit(1);
}

if (!MOCK && (!DISCORD_TOKEN || !TARGET_USER_ID)) {
  console.error("DISCORD_TOKEN ve TARGET_USER_ID tanımlı olmalı (veya MOCK_PRESENCE=1).");
  process.exit(1);
}

/** @type {import("discord.js").Client | null} */
let client = null;
/** @type {import("discord.js").User | null} */
let targetUser = null;
let targetRaw = null;
let latestPayloadJson = "";
let lastPublishedAt = 0;

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length === 0) return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function isAuthorized(req, url) {
  const header = req.headers["x-api-key"];
  const headerKey = Array.isArray(header) ? header[0] : header;
  return safeEqual(headerKey, API_KEY) || safeEqual(url.searchParams.get("key"), API_KEY);
}

function toNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

const appIconCache = new Map();
const appIconRequests = new Map();
const APP_ICON_TTL = 60 * 60 * 1000;

function cachedApplicationIcon(applicationId) {
  if (!applicationId) return null;
  const entry = appIconCache.get(applicationId);
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > APP_ICON_TTL) {
    appIconCache.delete(applicationId);
    return null;
  }
  return entry.iconUrl;
}

function warmApplicationIcon(applicationId) {
  if (!applicationId || !client || !client.isReady()) return Promise.resolve(false);
  const cached = appIconCache.get(applicationId);
  if (cached && Date.now() - cached.fetchedAt <= APP_ICON_TTL) return Promise.resolve(false);
  if (appIconRequests.has(applicationId)) return appIconRequests.get(applicationId);

  const request = client.rest
    .get(`/applications/${applicationId}/rpc`)
    .then((application) => {
      const icon = application?.icon;
      appIconCache.set(applicationId, {
        iconUrl: icon
          ? `https://cdn.discordapp.com/app-icons/${applicationId}/${icon}.png?size=128`
          : null,
        fetchedAt: Date.now(),
      });
      return Boolean(icon);
    })
    .catch(() => {
      appIconCache.set(applicationId, { iconUrl: null, fetchedAt: Date.now() });
      return false;
    })
    .finally(() => {
      appIconRequests.delete(applicationId);
    });

  appIconRequests.set(applicationId, request);
  return request;
}

function warmActivityIcons(activities) {
  if (!activities || activities.length === 0) return;
  for (const activity of activities) {
    if (!activity?.applicationId) continue;
    warmApplicationIcon(activity.applicationId).then((added) => {
      if (added) publish(true);
    });
  }
}

function mapActivity(activity) {
  const appIconUrl = cachedApplicationIcon(activity.applicationId);
  const assets =
    activity.assets || appIconUrl
      ? {
          large_image: activity.assets?.largeImage || undefined,
          large_text: activity.assets?.largeText || undefined,
          small_image: activity.assets?.smallImage || undefined,
          small_text: activity.assets?.smallText || undefined,
          application_icon_url: appIconUrl || undefined,
        }
      : undefined;

  return {
    id: activity.applicationId || activity.name,
    name: activity.name,
    type: activity.type,
    state: activity.state || undefined,
    details: activity.details || undefined,
    application_id: activity.applicationId || undefined,
    timestamps: activity.timestamps
      ? {
          start: toNumber(activity.timestamps.start?.getTime?.()),
          end: toNumber(activity.timestamps.end?.getTime?.()),
        }
      : undefined,
    assets,
  };
}

function mapSpotify(activity) {
  if (!activity) return null;
  const image = activity.assets?.largeImage;
  return {
    track_id: activity.syncId || null,
    timestamps: activity.timestamps
      ? {
          start: toNumber(activity.timestamps.start?.getTime?.()) || 0,
          end: toNumber(activity.timestamps.end?.getTime?.()) || 0,
        }
      : null,
    song: activity.details || "Bilinmeyen parça",
    artist: activity.state || "Bilinmeyen sanatçı",
    album: activity.assets?.largeText || "",
    album_art_url: image ? `https://i.scdn.co/image/${String(image).replace(/^spotify:/, "")}` : null,
  };
}

function findPresenceEntry() {
  if (!client) return { member: null, presence: null };
  const guilds = GUILD_ID
    ? [client.guilds.cache.get(GUILD_ID)].filter(Boolean)
    : Array.from(client.guilds.cache.values());

  for (const guild of guilds) {
    const presence = guild.presences.cache.get(TARGET_USER_ID) || null;
    const member = guild.members.cache.get(TARGET_USER_ID) || null;
    if (presence || member) return { member, presence };
  }
  return { member: null, presence: null };
}

function buildPresence() {
  if (MOCK) {
    const now = Date.now();
    return {
      discord_user: {
        id: TARGET_USER_ID || "0",
        username: "mockwarxy",
        avatar: null,
        global_name: "Mock Warxy",
        discriminator: "0",
        public_flags: 0,
        premium_type: 0,
      },
      discord_status: "online",
      activities: [
        {
          id: "mock-valorant",
          name: "Valorant",
          type: 0,
          details: "Competitive",
          state: "Ascent",
          application_id: "700136079562375218",
          timestamps: { start: now - 25 * 60 * 1000 },
          assets: { large_image: "valorant", large_text: "Valorant" },
        },
      ],
      listening_to_spotify: false,
      spotify: null,
    };
  }

  const { member, presence } = findPresenceEntry();
  warmActivityIcons(presence?.activities);
  const user = member?.user || targetUser;
  const activities = presence?.activities?.map(mapActivity) || [];
  const spotifyActivity = presence?.activities?.find(
    (activity) => activity.name === "Spotify",
  );

  return {
    discord_user: {
      id: TARGET_USER_ID,
      username: user?.username || "unknown",
      avatar: user?.avatar || null,
      global_name: user?.globalName || null,
      discriminator: user?.discriminator || "0",
      public_flags: targetRaw?.public_flags ?? user?.flags?.bitfield ?? 0,
      premium_type: targetRaw?.premium_type ?? 0,
    },
    discord_status: presence?.status || "offline",
    activities,
    listening_to_spotify: Boolean(spotifyActivity),
    spotify: mapSpotify(spotifyActivity),
  };
}

function currentPayload() {
  return {
    success: true,
    data: buildPresence(),
    updated_at: new Date().toISOString(),
    mock: MOCK,
  };
}

function publish(force = false) {
  if (!MOCK && (!client || !client.isReady())) return;
  const payload = currentPayload();
  const dataJson = JSON.stringify(payload.data);
  const now = Date.now();
  if (!force && dataJson === latestPayloadJson && now - lastPublishedAt < 30_000) {
    return;
  }
  latestPayloadJson = dataJson;
  lastPublishedAt = now;

  const json = JSON.stringify(payload);
  for (const socket of wss.clients) {
    if (socket.readyState === WebSocket.OPEN) socket.send(json);
  }
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

async function collectDiagnostics() {
  const guilds = Array.from(client?.guilds.cache.values() || []);
  const entries = [];
  let targetFound = false;

  for (const guild of guilds) {
    let member = guild.members.cache.get(TARGET_USER_ID) || null;
    if (!member) {
      try {
        member = await guild.members.fetch({ user: TARGET_USER_ID, force: true });
      } catch {
        member = null;
      }
    }
    const presence = guild.presences.cache.get(TARGET_USER_ID) || null;
    if (member) targetFound = true;
    entries.push({
      id: guild.id,
      name: guild.name,
      target_is_member: Boolean(member),
      target_status: presence?.status ?? null,
    });
  }

  return {
    ready: Boolean(client?.isReady()),
    guild_id_env: GUILD_ID || null,
    target_user_id: TARGET_USER_ID,
    guild_count: guilds.length,
    target_found: targetFound,
    presences_intent: client
      ? (client.options.intents.bitfield & GatewayIntentBits.GuildPresences) !== 0
      : false,
    guilds: entries,
  };
}

const requestHandler = async (req, res) => {
  const protocol = isHttps ? "https" : "http";
  const url = new URL(req.url || "/", `${protocol}://${req.headers.host || "localhost"}`);

  if (url.pathname === "/health" && req.method === "GET") {
    sendJson(res, 200, {
      ok: true,
      mock: MOCK,
      connected: MOCK || Boolean(client && client.isReady()),
      target_user_id: TARGET_USER_ID || null,
      guild_count: client?.guilds.cache.size ?? 0,
      updated_at: new Date(lastPublishedAt || Date.now()).toISOString(),
    });
    return;
  }

  if (url.pathname === "/debug" && req.method === "GET") {
    if (!isAuthorized(req, url)) {
      sendJson(res, 401, { success: false, error: "unauthorized" });
      return;
    }
    if (!client || !client.isReady()) {
      sendJson(res, 503, { success: false, error: "bot_not_ready" });
      return;
    }
    try {
      sendJson(res, 200, await collectDiagnostics());
    } catch (error) {
      sendJson(res, 500, { success: false, error: error.message });
    }
    return;
  }

  if (url.pathname === "/presence" && req.method === "GET") {
    if (!isAuthorized(req, url)) {
      sendJson(res, 401, { success: false, error: "unauthorized" });
      return;
    }
    if (!MOCK && (!client || !client.isReady())) {
      sendJson(res, 503, { success: false, error: "bot_not_ready" });
      return;
    }
    sendJson(res, 200, currentPayload());
    return;
  }

  sendJson(res, 404, { success: false, error: "not_found" });
};

const server = isHttps
  ? https.createServer(
      {
        cert: fs.readFileSync(sslCertPath),
        key: fs.readFileSync(sslKeyPath),
      },
      requestHandler,
    )
  : http.createServer(requestHandler);

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  if (url.pathname !== "/ws" || !isAuthorized(req, url)) {
    socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n");
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
});

wss.on("connection", (ws) => {
  ws.isAlive = true;
  ws.on("pong", () => {
    ws.isAlive = true;
  });
  ws.on("error", () => {});
  ws.send(JSON.stringify(currentPayload()));
  const timer = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(currentPayload()));
  }, 20_000);
  ws.on("close", () => clearInterval(timer));
});

const heartbeat = setInterval(() => {
  for (const socket of wss.clients) {
    if (socket.isAlive === false) {
      socket.terminate();
      continue;
    }
    socket.isAlive = false;
    socket.ping();
  }
}, 30_000);

heartbeat.unref?.();

server.listen(PORT, HOST, () => {
  console.log(`Presence API listening on ${HOST}:${PORT}${MOCK ? " (mock)" : ""}`);
});

async function startDiscord() {
  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.GuildMember, Partials.User],
  });

  client.on("error", (error) => console.error("Discord client error:", error.message));
  client.on("warn", (message) => console.warn("Discord warning:", message));

  client.once(Events.ClientReady, async () => {
    console.log(`Discord connected as ${client.user?.tag} (${client.user?.id})`);
    const guildList =
      client.guilds.cache.map((guild) => `${guild.name} (${guild.id})`).join(", ") || "yok";
    console.log(`Bot ${client.guilds.cache.size} sunucuda: ${guildList}`);
    try {
      targetUser = await client.users.fetch(TARGET_USER_ID, { force: true });
    } catch (error) {
      console.warn("Hedef kullanıcı getirilemedi:", error.message);
    }
    try {
      targetRaw = await client.rest.get(`/users/${TARGET_USER_ID}`);
    } catch (error) {
      console.warn("Ham kullanıcı verisi alınamadı:", error.message);
    }
    try {
      const diag = await collectDiagnostics();
      const summary = diag.guilds
        .map((guild) => `${guild.name}: üye=${guild.target_is_member}, durum=${guild.target_status ?? "-"}`)
        .join(" | ");
      console.log(
        `Hedef kullanıcı ${diag.target_found ? "bulundu" : "HİÇBİR SUNUCUDA BULUNAMADI"}${summary ? ` → ${summary}` : ""}`,
      );
    } catch (error) {
      console.warn("Teşhis alınamadı:", error.message);
    }
    publish(true);
  });

  client.on("presenceUpdate", (_oldPresence, newPresence) => {
    if (newPresence.userId === TARGET_USER_ID) {
      console.log(`presenceUpdate: ${newPresence.status}`);
      publish();
    }
  });

  client.on("userUpdate", (_oldUser, newUser) => {
    if (newUser.id === TARGET_USER_ID) {
      targetUser = newUser;
      publish(true);
    }
  });

  client.on("guildMemberUpdate", (_oldMember, newMember) => {
    if (newMember.id === TARGET_USER_ID) publish(true);
  });

  await client.login(DISCORD_TOKEN);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
  clearInterval(heartbeat);
  for (const socket of wss.clients) socket.close(1001, "shutting down");
  server.close();
  if (client) client.destroy();
  setTimeout(() => process.exit(0), 500).unref?.();
}

if (MOCK) {
  console.log("MOCK_PRESENCE aktif: Discord bağlantısı kurulmadı.");
  publish(true);
} else {
  startDiscord().catch((error) => {
    console.error("Bot giriş yapamadı:", error.message);
    process.exit(1);
  });
}

setInterval(() => publish(), 20_000).unref?.();
