import assert from "node:assert";
import {
  resolveActivityAssetUrl,
  getKnownGame,
  findPrimaryGameActivity,
  formatElapsed,
  formatElapsedHuman,
  type LanyardActivity,
} from "../src/app/discord-presence";

console.log("Starting discord-presence test suite...");

// 1. Test resolveActivityAssetUrl
console.log("1. Testing resolveActivityAssetUrl...");
assert.strictEqual(resolveActivityAssetUrl(), null);
assert.strictEqual(resolveActivityAssetUrl(undefined, null), null);
assert.strictEqual(resolveActivityAssetUrl("123", ""), null);

// Direct URLs
assert.strictEqual(
  resolveActivityAssetUrl(undefined, "https://example.com/art.png"),
  "https://example.com/art.png",
);
assert.strictEqual(
  resolveActivityAssetUrl(undefined, "http://example.com/art.jpg"),
  "http://example.com/art.jpg",
);

// Discord Media Proxy mp:external
assert.strictEqual(
  resolveActivityAssetUrl(undefined, "mp:external/abc/https/image.png"),
  "https://media.discordapp.net/external/abc/https/image.png",
);

// Discord Media Proxy mp:attachments
assert.strictEqual(
  resolveActivityAssetUrl(undefined, "mp:attachments/999/cover.png"),
  "https://media.discordapp.net/attachments/999/cover.png",
);

// Discord Media Proxy external/
assert.strictEqual(
  resolveActivityAssetUrl(undefined, "external/xyz/http/site.com/pic.webp"),
  "https://media.discordapp.net/external/xyz/http/site.com/pic.webp",
);

// Spotify proxy
assert.strictEqual(
  resolveActivityAssetUrl(undefined, "spotify:ab67616d0000b273abc"),
  "https://i.scdn.co/image/ab67616d0000b273abc",
);

// Application asset without extension
assert.strictEqual(
  resolveActivityAssetUrl("700136079562375218", "ascent_splash", 256),
  "https://cdn.discordapp.com/app-assets/700136079562375218/ascent_splash.webp?size=256",
);

// Application asset with extension already
assert.strictEqual(
  resolveActivityAssetUrl("700136079562375218", "icon.png", 64),
  "https://cdn.discordapp.com/app-assets/700136079562375218/icon.png?size=64",
);

// 2. Test getKnownGame
console.log("2. Testing getKnownGame...");
// VALORANT by name
const valByName = getKnownGame("VALORANT");
assert.ok(valByName, "VALORANT should be recognized by name");
assert.strictEqual(valByName?.id, "valorant");
assert.strictEqual(valByName?.brandColor, "#ff4655");
assert.strictEqual(valByName?.shortName, "VALORANT");
assert.strictEqual(valByName?.cardLabel, "PLAYING VALORANT");

// VALORANT by lowercase
const valLower = getKnownGame("valorant");
assert.strictEqual(valLower?.id, "valorant");

// VALORANT by application id
const valById = getKnownGame(undefined, "700136079562375218");
assert.strictEqual(valById?.id, "valorant");

// League of Legends
const lol = getKnownGame("League of Legends");
assert.strictEqual(lol?.id, "league-of-legends");
assert.strictEqual(lol?.brandColor, "#c28f2c");

// CS2
const cs = getKnownGame("Counter-Strike 2");
assert.strictEqual(cs?.id, "counter-strike");
assert.strictEqual(cs?.brandColor, "#de9b35");

const csgo = getKnownGame("CS:GO");
assert.strictEqual(csgo?.id, "counter-strike");

// Minecraft
const mc = getKnownGame("Minecraft");
assert.strictEqual(mc?.id, "minecraft");
assert.strictEqual(mc?.brandColor, "#22c55e");

// GTA V / FiveM
const gta = getKnownGame("Grand Theft Auto V");
assert.strictEqual(gta?.id, "gta");

const fivem = getKnownGame("FiveM");
assert.strictEqual(fivem?.id, "gta");

// Fortnite
const fn = getKnownGame("Fortnite");
assert.strictEqual(fn?.id, "fortnite");

// Roblox
const rbx = getKnownGame("Roblox");
assert.strictEqual(rbx?.id, "roblox");

// Apex Legends
const apex = getKnownGame("Apex Legends");
assert.strictEqual(apex?.id, "apex");

// Steam
const steam = getKnownGame("Steam");
assert.strictEqual(steam?.id, "steam");

// Unknown game
const unknown = getKnownGame("Random Indie Game 2026");
assert.strictEqual(unknown, null);

// 3. Test findPrimaryGameActivity
console.log("3. Testing findPrimaryGameActivity...");
assert.strictEqual(findPrimaryGameActivity(), null);
assert.strictEqual(findPrimaryGameActivity([]), null);

// Skips custom status (type 4) and spotify (type 2)
const nonGames: LanyardActivity[] = [
  { id: "custom", name: "Custom Status", type: 4, state: "Chilling" },
  { id: "spotify:1", name: "Spotify", type: 2 },
];
assert.strictEqual(findPrimaryGameActivity(nonGames), null);

// Single game
const valActivity: LanyardActivity = {
  id: "game1",
  name: "VALORANT",
  type: 0,
  details: "In Match - Competitive",
  state: "Score: 11 - 9",
  timestamps: { start: Date.now() - 60000 },
};
assert.strictEqual(findPrimaryGameActivity([valActivity]), valActivity);

// Prioritizes recognized game over generic RPC utility
const vsCodeActivity: LanyardActivity = {
  id: "rpc1",
  name: "Visual Studio Code",
  type: 0,
  details: "Editing file.tsx",
};
const mixedActivities: LanyardActivity[] = [
  nonGames[0],
  vsCodeActivity,
  valActivity,
];
const chosen = findPrimaryGameActivity(mixedActivities);
assert.strictEqual(chosen?.name, "VALORANT", "Should prioritize recognized game VALORANT");

// Competing activity (type 5)
const compActivity: LanyardActivity = {
  id: "comp1",
  name: "VALORANT",
  type: 5,
};
assert.strictEqual(findPrimaryGameActivity([compActivity])?.type, 5);

// 4. Test formatElapsed
console.log("4. Testing formatElapsed...");
assert.strictEqual(formatElapsed(0), "00:00");
assert.strictEqual(formatElapsed(-1000), "00:00");
assert.strictEqual(formatElapsed(5000), "00:05");
assert.strictEqual(formatElapsed(45000), "00:45");
assert.strictEqual(formatElapsed(125000), "02:05");
assert.strictEqual(formatElapsed(3600000), "01:00:00");
assert.strictEqual(formatElapsed(3665000), "01:01:05");
assert.strictEqual(formatElapsed(36000000), "10:00:00");

// 5. Test formatElapsedHuman
console.log("5. Testing formatElapsedHuman...");
assert.strictEqual(formatElapsedHuman(0), "0 sn");
assert.strictEqual(formatElapsedHuman(-500), "0 sn");
assert.strictEqual(formatElapsedHuman(15000), "15 sn");
assert.strictEqual(formatElapsedHuman(60000), "1 dk");
assert.strictEqual(formatElapsedHuman(120000), "2 dk");
assert.strictEqual(formatElapsedHuman(3600000), "1 sa");
assert.strictEqual(formatElapsedHuman(3660000), "1 sa 1 dk");
assert.strictEqual(formatElapsedHuman(6120000), "1 sa 42 dk");
assert.strictEqual(formatElapsedHuman(7200000), "2 sa");

console.log("All tests passed successfully!");
