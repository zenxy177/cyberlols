"use strict";

require("dotenv").config();

const crypto = require("node:crypto");
const http = require("node:http");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { WebSocketServer, WebSocket } = require("ws");

const PORT = Number(process.env.PORT || process.env.SERVER_PORT || 3001);
const HOST = process.env.HOST || "0.0.0.0";
const API_KEY = (process.env.PRESENCE_API_KEY || "").trim();
const TARGET_USER_ID = (process.env.TARGET_USER_ID || "").trim();
const GUILD_ID = (process.env.GUILD_ID || "").trim();
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

function mapActivity(activity) {
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
    assets: activity.assets
      ? {
          large_image: activity.assets.largeImage || undefined,
          large_text: activity.assets.largeText || undefined,
          small_image: activity.assets.smallImage || undefined,
          small_text: activity.assets.smallText || undefined,
        }
      : undefined,
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

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/health" && req.method === "GET") {
    sendJson(res, 200, {
      ok: true,
      mock: MOCK,
      connected: MOCK || Boolean(client && client.isReady()),
      target_user_id: TARGET_USER_ID || null,
      updated_at: new Date(lastPublishedAt || Date.now()).toISOString(),
    });
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
});

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

  client.once("ready", async () => {
    console.log(`Discord connected as ${client.user?.tag} (${client.user?.id})`);
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
    publish(true);
  });

  client.on("presenceUpdate", (_oldPresence, newPresence) => {
    if (newPresence.userId === TARGET_USER_ID) publish();
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
