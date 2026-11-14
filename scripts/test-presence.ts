import assert from "node:assert";
import {
  resolveActivityAssetUrl,
  getKnownGame,
  getGameMonogram,
  generateTrackWaveform,
  KNOWN_GAMES,
  findPrimaryGameActivity,
  formatElapsed,
  formatElapsedHuman,
  formatTime,
  type LanyardActivity,
} from "../src/app/discord-presence";
import {
  resolveDiscordBadges,
  getDiscordBadge,
  DISCORD_FLAGS,
  ALL_DISCORD_BADGES,
} from "../src/lib/discord-badges";
import {
  EMPTY_PROFILE,
  normalizeProfile,
} from "../src/lib/profile";

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

// Verify game library size (at least 50 popular games)
assert.strictEqual(
  KNOWN_GAMES.length >= 50,
  true,
  `Expected at least 50 known games, found ${KNOWN_GAMES.length}`,
);

// Verify structural validity of all games in KNOWN_GAMES
const knownIds = new Set<string>();
for (const g of KNOWN_GAMES) {
  assert.ok(!knownIds.has(g.id), `Duplicate game ID: ${g.id}`);
  knownIds.add(g.id);
  assert.ok(g.matchNames && g.matchNames.length > 0, `Game ${g.id} has no matchNames`);
  assert.ok(g.brandColor.startsWith("#"), `Game ${g.id} has invalid brandColor ${g.brandColor}`);
  assert.ok(g.svgPath.length >= 10, `Game ${g.id} has invalid svgPath`);
  assert.ok(g.shortName.length > 0, `Game ${g.id} has empty shortName`);
  assert.ok(g.cardLabel.length > 0, `Game ${g.id} has empty cardLabel`);
}

// Call of Duty & Warzone
const cod1 = getKnownGame("Call of Duty: Warzone");
assert.strictEqual(cod1?.id, "call-of-duty");
const cod2 = getKnownGame("cod");
assert.strictEqual(cod2?.id, "call-of-duty");
const cod3 = getKnownGame("Modern Warfare III");
assert.strictEqual(cod3?.id, "call-of-duty");
const cod4 = getKnownGame("Black Ops 6");
assert.strictEqual(cod4?.id, "call-of-duty");

// Rainbow Six Siege
const r6ByName = getKnownGame("Tom Clancy's Rainbow Six Siege");
assert.strictEqual(r6ByName?.id, "rainbow-six");
const r6Short = getKnownGame("r6");
assert.strictEqual(r6Short?.id, "rainbow-six");
const r6Siege = getKnownGame("siege");
assert.strictEqual(r6Siege?.id, "rainbow-six");
const r6Token = getKnownGame("Tom Clancy's R6 Siege");
assert.strictEqual(r6Token?.id, "rainbow-six");

// Overwatch 2
const ow2 = getKnownGame("Overwatch 2");
assert.strictEqual(ow2?.id, "overwatch");
const owShort = getKnownGame("ow2");
assert.strictEqual(owShort?.id, "overwatch");

// Rocket League
const rl = getKnownGame("Rocket League");
assert.strictEqual(rl?.id, "rocket-league");
const rlShort = getKnownGame("rl");
assert.strictEqual(rlShort?.id, "rocket-league");

// Rust
const rust = getKnownGame("Rust");
assert.strictEqual(rust?.id, "rust");
const rustDirectX = getKnownGame("Rust (DirectX 11)");
assert.strictEqual(rustDirectX?.id, "rust");

// EA SPORTS FC / FIFA
const eafc = getKnownGame("EA SPORTS FC 24");
assert.strictEqual(eafc?.id, "fc-fifa");
const fc25 = getKnownGame("FC 25");
assert.strictEqual(fc25?.id, "fc-fifa");
const fifa = getKnownGame("FIFA 23");
assert.strictEqual(fifa?.id, "fc-fifa");

// Cyberpunk 2077
const cp = getKnownGame("Cyberpunk 2077");
assert.strictEqual(cp?.id, "cyberpunk");
assert.strictEqual(cp?.brandColor, "#fcee0a");

// Elden Ring
const elden = getKnownGame("Elden Ring");
assert.strictEqual(elden?.id, "elden-ring");
const erDlc = getKnownGame("Shadow of the Erdtree");
assert.strictEqual(erDlc?.id, "elden-ring");

// Genshin Impact & Honkai: Star Rail
const genshin = getKnownGame("Genshin Impact");
assert.strictEqual(genshin?.id, "genshin");
const hsr = getKnownGame("Honkai: Star Rail");
assert.strictEqual(hsr?.id, "star-rail");
const hsrShort = getKnownGame("HSR");
assert.strictEqual(hsrShort?.id, "star-rail");

// Dead by Daylight
const dbd = getKnownGame("Dead by Daylight");
assert.strictEqual(dbd?.id, "dbd");
const dbdShort = getKnownGame("DBD");
assert.strictEqual(dbdShort?.id, "dbd");

// Brawlhalla & Terraria
const bh = getKnownGame("Brawlhalla");
assert.strictEqual(bh?.id, "brawlhalla");
const terraria = getKnownGame("Terraria");
assert.strictEqual(terraria?.id, "terraria");

// Team Fortress 2 & Dota 2
const tf2 = getKnownGame("Team Fortress 2");
assert.strictEqual(tf2?.id, "tf2");
const tf2Short = getKnownGame("TF2");
assert.strictEqual(tf2Short?.id, "tf2");
const dota = getKnownGame("Dota 2");
assert.strictEqual(dota?.id, "dota-2");

// Destiny 2 & Warframe
const d2 = getKnownGame("Destiny 2");
assert.strictEqual(d2?.id, "destiny-2");
const wf = getKnownGame("Warframe");
assert.strictEqual(wf?.id, "warframe");

// PUBG & Palworld
const pubg = getKnownGame("PUBG: BATTLEGROUNDS");
assert.strictEqual(pubg?.id, "pubg");
const palworld = getKnownGame("Palworld");
assert.strictEqual(palworld?.id, "palworld");

// Helldivers 2, Deadlock & The Finals
const hd2 = getKnownGame("Helldivers 2");
assert.strictEqual(hd2?.id, "helldivers-2");
const deadlock = getKnownGame("Deadlock");
assert.strictEqual(deadlock?.id, "deadlock");
const theFinals = getKnownGame("THE FINALS");
assert.strictEqual(theFinals?.id, "the-finals");

// osu! & Geometry Dash
const osu = getKnownGame("osu!");
assert.strictEqual(osu?.id, "osu");
const osuLazer = getKnownGame("osu! (lazer)");
assert.strictEqual(osuLazer?.id, "osu");
const gd = getKnownGame("Geometry Dash");
assert.strictEqual(gd?.id, "geometry-dash");
const gdShort = getKnownGame("GD");
assert.strictEqual(gdShort?.id, "geometry-dash");

// World of Warcraft & Diablo IV
const wow = getKnownGame("World of Warcraft");
assert.strictEqual(wow?.id, "world-of-warcraft");
const wowShort = getKnownGame("WoW");
assert.strictEqual(wowShort?.id, "world-of-warcraft");
const diablo = getKnownGame("Diablo IV");
assert.strictEqual(diablo?.id, "diablo");

// Monster Hunter & Lethal Company
const mh = getKnownGame("Monster Hunter: World");
assert.strictEqual(mh?.id, "monster-hunter");
const lethal = getKnownGame("Lethal Company");
assert.strictEqual(lethal?.id, "lethal-company");

// Among Us & Phasmophobia & Sea of Thieves
const among = getKnownGame("Among Us");
assert.strictEqual(among?.id, "among-us");
const phasmo = getKnownGame("Phasmophobia");
assert.strictEqual(phasmo?.id, "phasmophobia");
const sot = getKnownGame("Sea of Thieves");
assert.strictEqual(sot?.id, "sea-of-thieves");
const sotShort = getKnownGame("sot");
assert.strictEqual(sotShort?.id, "sea-of-thieves");

// Fallout series & Baldur's Gate 3 & Tarkov & Witcher
const fallout = getKnownGame("Fallout 4");
assert.strictEqual(fallout?.id, "fallout");
const bg3 = getKnownGame("Baldur's Gate 3");
assert.strictEqual(bg3?.id, "baldurs-gate");
const tarkov = getKnownGame("Escape from Tarkov");
assert.strictEqual(tarkov?.id, "tarkov");
const witcher = getKnownGame("The Witcher 3: Wild Hunt");
assert.strictEqual(witcher?.id, "witcher");

// Additional popular Discord games (RDR2, Hollow Knight, Stardew, GMod, ARK, Forza, ETS2, HOI4, Half-Life, Assetto Corsa)
const rdr2 = getKnownGame("Red Dead Redemption 2");
assert.strictEqual(rdr2?.id, "red-dead");
const rdrShort = getKnownGame("rdr2");
assert.strictEqual(rdrShort?.id, "red-dead");

const hk = getKnownGame("Hollow Knight");
assert.strictEqual(hk?.id, "hollow-knight");
const silksong = getKnownGame("Silksong");
assert.strictEqual(silksong?.id, "hollow-knight");

const stardew = getKnownGame("Stardew Valley");
assert.strictEqual(stardew?.id, "stardew-valley");

const gmod = getKnownGame("Garry's Mod");
assert.strictEqual(gmod?.id, "garrys-mod");
const gmodShort = getKnownGame("gmod");
assert.strictEqual(gmodShort?.id, "garrys-mod");

const ark = getKnownGame("ARK: Survival Evolved");
assert.strictEqual(ark?.id, "ark");

const forza = getKnownGame("Forza Horizon 5");
assert.strictEqual(forza?.id, "forza");

const ets2 = getKnownGame("Euro Truck Simulator 2");
assert.strictEqual(ets2?.id, "euro-truck");
const etsShort = getKnownGame("ets2");
assert.strictEqual(etsShort?.id, "euro-truck");

const hoi4 = getKnownGame("Hearts of Iron IV");
assert.strictEqual(hoi4?.id, "hearts-of-iron");
const hoiShort = getKnownGame("hoi4");
assert.strictEqual(hoiShort?.id, "hearts-of-iron");

const hl2 = getKnownGame("Half-Life 2");
assert.strictEqual(hl2?.id, "half-life");

const acc = getKnownGame("Assetto Corsa Competizione");
assert.strictEqual(acc?.id, "assetto-corsa");

// Boundary protections: must NOT false-match on subwords!
assert.strictEqual(getKnownGame("Trust"), null, "Trust should not match Rust");
assert.strictEqual(getKnownGame("Trust No One"), null, "Trust No One should not match Rust");
assert.strictEqual(getKnownGame("Steamer 3D"), null, "Steamer should not match Steam");
assert.strictEqual(getKnownGame("Robloxian"), null, "Robloxian should not match Roblox");
assert.strictEqual(getKnownGame("Dotard"), null, "Dotard should not match Dota");
assert.strictEqual(getKnownGame("Apexify"), null, "Apexify should not match Apex");
assert.strictEqual(getKnownGame("Discord"), null, "Discord should not match 'cod'");
assert.strictEqual(getKnownGame("World Editor"), null, "World Editor should not match 'rl'");
assert.strictEqual(getKnownGame("Random Indie Game 2026"), null);

// Monogram generation (including Unicode international support)
assert.strictEqual(getGameMonogram("Risk of Rain"), "RR");
assert.strictEqual(getGameMonogram("Satisfactory"), "SA");
assert.strictEqual(getGameMonogram("Hades"), "HA");
assert.strictEqual(getGameMonogram("Factorio"), "FA");
assert.strictEqual(getGameMonogram("X"), "X");
assert.strictEqual(getGameMonogram(undefined), "GM");
assert.strictEqual(getGameMonogram("Ömer'in Macerası"), "ÖM");
assert.strictEqual(getGameMonogram("7 Days to Die"), "7D");

// Soundwave Waveform Generator
const wave36 = generateTrackWaveform("Starboy - The Weeknd", 36);
assert.strictEqual(wave36.length, 36, "Waveform should produce exactly 36 bars");
wave36.forEach((h, i) => {
  assert.ok(
    h >= 0.18 && h <= 1.0,
    `Wave bar ${i} height ${h} should be in [0.18, 1.0]`,
  );
});
// Deterministic check
const wave36Dup = generateTrackWaveform("Starboy - The Weeknd", 36);
assert.deepStrictEqual(wave36, wave36Dup, "Same song seed should produce identical waveform");

// formatTime verification (01:24 / 03:45 pad specification)
assert.strictEqual(formatTime(0), "00:00");
assert.strictEqual(formatTime(5000), "00:05");
assert.strictEqual(formatTime(84000), "01:24");
assert.strictEqual(formatTime(225000), "03:45");
assert.strictEqual(formatTime(3665000), "01:01:05");

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

// 7. Testing Profile normalization & links_layout
console.log("7. Testing Profile normalization & links_layout...");
assert.strictEqual(EMPTY_PROFILE.links_layout, "dock");
assert.strictEqual(normalizeProfile(null).links_layout, "dock");
assert.strictEqual(normalizeProfile({}).links_layout, "dock");
assert.strictEqual(normalizeProfile({ links_layout: "dock" }).links_layout, "dock");
assert.strictEqual(normalizeProfile({ links_layout: "buttons" }).links_layout, "buttons");
assert.strictEqual(normalizeProfile({ links_layout: "BUTTONS" }).links_layout, "buttons");
assert.strictEqual(normalizeProfile({ links_layout: "  buttons  " }).links_layout, "buttons");
assert.strictEqual(normalizeProfile({ links_layout: "" }).links_layout, "dock");
assert.strictEqual(normalizeProfile({ links_layout: "invalid" as unknown }).links_layout, "dock");
assert.strictEqual(normalizeProfile({ links_layout: 123 as unknown }).links_layout, "dock");
assert.strictEqual(normalizeProfile({ links_layout: null as unknown }).links_layout, "dock");
assert.strictEqual(normalizeProfile({ links_layout: undefined }).links_layout, "dock");

console.log("All tests passed successfully!");
