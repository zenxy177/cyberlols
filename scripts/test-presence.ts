import assert from "node:assert";
import {
  resolveActivityAssetUrl,
  getKnownGame,
  findPrimaryGameActivity,
  formatElapsed,
  formatElapsedHuman,
  type LanyardActivity,
} from "../src/app/discord-presence";
import {
  resolveDiscordBadges,
  getDiscordBadge,
  DISCORD_FLAGS,
  ALL_DISCORD_BADGES,
} from "../src/lib/discord-badges";

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

// 6. Test Discord Badges Resolution
console.log("6. Testing Discord Badges Resolution...");

// Check badge registry
assert.strictEqual(ALL_DISCORD_BADGES.length >= 14, true, "Should have at least 14 official badges");
assert.strictEqual(getDiscordBadge("active_developer")?.name, "Active Developer");
assert.strictEqual(getDiscordBadge("nitro")?.name, "Discord Nitro");
assert.strictEqual(getDiscordBadge("bravery")?.name, "HypeSquad Bravery");
assert.strictEqual(getDiscordBadge("non_existent"), null);

// Bitmask individual flags
const staffBadges = resolveDiscordBadges({ publicFlags: DISCORD_FLAGS.STAFF });
assert.strictEqual(staffBadges.length, 1);
assert.strictEqual(staffBadges[0].id, "staff");

const partnerBadges = resolveDiscordBadges({ publicFlags: DISCORD_FLAGS.PARTNER });
assert.strictEqual(partnerBadges.length, 1);
assert.strictEqual(partnerBadges[0].id, "partner");

const eventsBadges = resolveDiscordBadges({ publicFlags: DISCORD_FLAGS.HYPESQUAD_EVENTS });
assert.strictEqual(eventsBadges.length, 1);
assert.strictEqual(eventsBadges[0].id, "hypesquad_events");

const bug1Badges = resolveDiscordBadges({ publicFlags: DISCORD_FLAGS.BUG_HUNTER_1 });
assert.strictEqual(bug1Badges.length, 1);
assert.strictEqual(bug1Badges[0].id, "bug_hunter_1");

const braveryBadges = resolveDiscordBadges({ publicFlags: DISCORD_FLAGS.BRAVERY });
assert.strictEqual(braveryBadges.length, 1);
assert.strictEqual(braveryBadges[0].id, "bravery");

const brillianceBadges = resolveDiscordBadges({ publicFlags: DISCORD_FLAGS.BRILLIANCE });
assert.strictEqual(brillianceBadges.length, 1);
assert.strictEqual(brillianceBadges[0].id, "brilliance");

const balanceBadges = resolveDiscordBadges({ publicFlags: DISCORD_FLAGS.BALANCE });
assert.strictEqual(balanceBadges.length, 1);
assert.strictEqual(balanceBadges[0].id, "balance");

const earlySupporterBadges = resolveDiscordBadges({ publicFlags: DISCORD_FLAGS.EARLY_SUPPORTER });
assert.strictEqual(earlySupporterBadges.length, 1);
assert.strictEqual(earlySupporterBadges[0].id, "early_supporter");

const bug2Badges = resolveDiscordBadges({ publicFlags: DISCORD_FLAGS.BUG_HUNTER_2 });
assert.strictEqual(bug2Badges.length, 1);
assert.strictEqual(bug2Badges[0].id, "bug_hunter_2");

const earlyBotDevBadges = resolveDiscordBadges({ publicFlags: DISCORD_FLAGS.EARLY_BOT_DEVELOPER });
assert.strictEqual(earlyBotDevBadges.length, 1);
assert.strictEqual(earlyBotDevBadges[0].id, "early_bot_developer");

const modAlumniBadges = resolveDiscordBadges({ publicFlags: DISCORD_FLAGS.MODERATOR_PROGRAMS_ALUMNI });
assert.strictEqual(modAlumniBadges.length, 1);
assert.strictEqual(modAlumniBadges[0].id, "moderator_programs_alumni");

const activeDevBadges = resolveDiscordBadges({ publicFlags: DISCORD_FLAGS.ACTIVE_DEVELOPER });
assert.strictEqual(activeDevBadges.length, 1);
assert.strictEqual(activeDevBadges[0].id, "active_developer");

// Combined bitmask: Active Developer (4194304) + HypeSquad Bravery (64)
const comboFlags = DISCORD_FLAGS.ACTIVE_DEVELOPER | DISCORD_FLAGS.BRAVERY;
const comboBadges = resolveDiscordBadges({ publicFlags: comboFlags });
assert.strictEqual(comboBadges.length, 2);
const comboIds = comboBadges.map((b) => b.id);
assert.strictEqual(comboIds.includes("active_developer"), true);
assert.strictEqual(comboIds.includes("bravery"), true);

// Animated avatar detection (Nitro)
const animatedAvatarBadges = resolveDiscordBadges({
  publicFlags: 0,
  avatar: "a_784930219842",
});
assert.strictEqual(animatedAvatarBadges.length, 1);
assert.strictEqual(animatedAvatarBadges[0].id, "nitro");

// Non-animated avatar does not trigger nitro
const staticAvatarBadges = resolveDiscordBadges({
  publicFlags: 0,
  avatar: "784930219842",
});
assert.strictEqual(staticAvatarBadges.length, 0);

// Premium type triggers nitro
const premiumBadges = resolveDiscordBadges({
  publicFlags: 0,
  premiumType: 2,
});
assert.strictEqual(premiumBadges.length, 1);
assert.strictEqual(premiumBadges[0].id, "nitro");

// Mode: custom
const customSelection = ["nitro", "booster", "active_developer"];
const customModeResult = resolveDiscordBadges({
  publicFlags: DISCORD_FLAGS.BRAVERY, // bravery in flags, but mode is custom
  customBadges: customSelection,
  badgeMode: "custom",
});
assert.strictEqual(customModeResult.length, 3);
assert.deepStrictEqual(customModeResult.map((b) => b.id), customSelection);

// Mode: both (union without duplicates)
const bothModeResult = resolveDiscordBadges({
  publicFlags: DISCORD_FLAGS.ACTIVE_DEVELOPER | DISCORD_FLAGS.BRAVERY,
  avatar: "a_nitro_avatar",
  customBadges: ["booster", "active_developer"], // active_developer is in both
  badgeMode: "both",
});
const bothIds = bothModeResult.map((b) => b.id);
assert.strictEqual(bothIds.includes("active_developer"), true);
assert.strictEqual(bothIds.includes("bravery"), true);
assert.strictEqual(bothIds.includes("nitro"), true);
assert.strictEqual(bothIds.includes("booster"), true);
// Verify no duplicate active_developer
assert.strictEqual(bothIds.filter((id) => id === "active_developer").length, 1);

// Mode: auto with fallback to customBadges when flags are 0
const fallbackResult = resolveDiscordBadges({
  publicFlags: 0,
  avatar: null,
  customBadges: ["active_developer", "booster"],
  badgeMode: "auto",
});
assert.strictEqual(fallbackResult.length, 2);
assert.deepStrictEqual(fallbackResult.map((b) => b.id), ["active_developer", "booster"]);

// Edge cases: null/undefined/empty
assert.deepStrictEqual(resolveDiscordBadges({}), []);
assert.deepStrictEqual(resolveDiscordBadges({ publicFlags: null, avatar: null }), []);
assert.deepStrictEqual(resolveDiscordBadges({ customBadges: ["invalid_badge_id"], badgeMode: "custom" }), []);
assert.deepStrictEqual(resolveDiscordBadges({ publicFlags: Number.NaN }), []);
assert.deepStrictEqual(resolveDiscordBadges({ publicFlags: Number.POSITIVE_INFINITY }), []);

// Test floating point flag truncation
const floatBadges = resolveDiscordBadges({ publicFlags: 4194304.99 });
assert.strictEqual(floatBadges.length, 1);
assert.strictEqual(floatBadges[0].id, "active_developer");

// Test premium_type variants (1 = Classic, 2 = Nitro, 3 = Basic)
assert.strictEqual(resolveDiscordBadges({ premiumType: 1 }).some((b) => b.id === "nitro"), true);
assert.strictEqual(resolveDiscordBadges({ premiumType: 2 }).some((b) => b.id === "nitro"), true);
assert.strictEqual(resolveDiscordBadges({ premiumType: 3 }).some((b) => b.id === "nitro"), true);
assert.strictEqual(resolveDiscordBadges({ premiumType: 0 }).some((b) => b.id === "nitro"), false);
assert.strictEqual(resolveDiscordBadges({ premiumType: -1 }).some((b) => b.id === "nitro"), false);

// Test customBadges sanitization with non-string, whitespace, and duplicate items
const dirtyCustom = ["active_developer", "", "   ", "nitro", "active_developer", "invalid_badge_xyz"];
const sanitizedResult = resolveDiscordBadges({ customBadges: dirtyCustom, badgeMode: "custom" });
assert.strictEqual(sanitizedResult.length, 2);
assert.strictEqual(sanitizedResult[0].id, "active_developer");
assert.strictEqual(sanitizedResult[1].id, "nitro");

// Verify all badges in ALL_DISCORD_BADGES have valid structure
for (const badge of ALL_DISCORD_BADGES) {
  assert.strictEqual(typeof badge.id, "string");
  assert.strictEqual(badge.id.length > 0, true);
  assert.strictEqual(typeof badge.name, "string");
  assert.strictEqual(badge.name.length > 0, true);
  assert.strictEqual(typeof badge.description, "string");
  assert.strictEqual(badge.description.length > 0, true);
  assert.strictEqual(typeof badge.brandColor, "string");
  assert.strictEqual(badge.brandColor.startsWith("#"), true);
  assert.strictEqual(typeof badge.glowColor, "string");
  assert.strictEqual(getDiscordBadge(badge.id)?.id, badge.id);
}

console.log("All tests passed successfully!");
