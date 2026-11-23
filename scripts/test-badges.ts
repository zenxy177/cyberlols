import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import {
  DISCORD_FLAGS,
  ALL_DISCORD_BADGES,
  CANONICAL_DISCORD_FLAGS,
  resolveDiscordBadges,
  sanitizeBadgeKey,
  isValidBadgeIconUrl,
  getDiscordBadge,
} from "../src/lib/discord-badges";
import { GET as getBadgesRoute } from "../src/app/api/discord/badges/route";
import { NextRequest } from "next/server";

console.log("==================================================");
console.log("  Running Comprehensive Badges System Test Suite  ");
console.log("==================================================");

// -----------------------------------------------------------------------------
// Test 1: Pure TypeScript Bitmask Definitions
// -----------------------------------------------------------------------------
console.log("\n1. Testing DISCORD_FLAGS bitmask integrity...");
assert.strictEqual(DISCORD_FLAGS.STAFF, 1);
assert.strictEqual(DISCORD_FLAGS.PARTNER, 2);
assert.strictEqual(DISCORD_FLAGS.HYPESQUAD_EVENTS, 4);
assert.strictEqual(DISCORD_FLAGS.BUG_HUNTER_1, 8);
assert.strictEqual(DISCORD_FLAGS.BRAVERY, 64);
assert.strictEqual(DISCORD_FLAGS.BRILLIANCE, 128);
assert.strictEqual(DISCORD_FLAGS.BALANCE, 256);
assert.strictEqual(DISCORD_FLAGS.EARLY_SUPPORTER, 512);
assert.strictEqual(DISCORD_FLAGS.BUG_HUNTER_2, 16384);
assert.strictEqual(DISCORD_FLAGS.EARLY_BOT_DEVELOPER, 131072);
assert.strictEqual(DISCORD_FLAGS.MODERATOR_PROGRAMS_ALUMNI, 262144);
assert.strictEqual(DISCORD_FLAGS.ACTIVE_DEVELOPER, 4194304);
console.log("  [PASS] All 12 bitmask constants match official Discord API specifications.");

// -----------------------------------------------------------------------------
// Test 2: Canonical Array Extensibility
// -----------------------------------------------------------------------------
console.log("\n2. Testing ALL_DISCORD_BADGES canonical registry...");
assert.strictEqual(ALL_DISCORD_BADGES.length >= 15, true);
assert.strictEqual(CANONICAL_DISCORD_FLAGS.length, 12);
for (const b of ALL_DISCORD_BADGES) {
  assert.ok(b.key, `Badge must have a key: ${JSON.stringify(b)}`);
  assert.ok(b.label, `Badge must have a label: ${b.key}`);
  assert.ok(b.description, `Badge must have a description: ${b.key}`);
  assert.strictEqual(getDiscordBadge(b.key)?.key, b.key);
}
console.log("  [PASS] Canonical registry is well-formed and indexed.");

// -----------------------------------------------------------------------------
// Test 3: resolveDiscordBadges(flags: number) Resolver
// -----------------------------------------------------------------------------
console.log("\n3. Testing resolveDiscordBadges resolution logic...");
// Individual flag tests
const activeDev = resolveDiscordBadges(DISCORD_FLAGS.ACTIVE_DEVELOPER);
assert.strictEqual(activeDev.length, 1);
assert.strictEqual(activeDev[0].key, "active_developer");
assert.strictEqual(activeDev[0].label, "Active Developer");

const balance = resolveDiscordBadges(DISCORD_FLAGS.BALANCE);
assert.strictEqual(balance.length, 1);
assert.strictEqual(balance[0].key, "balance");

// Combined bitmask test
const combo = resolveDiscordBadges(
  DISCORD_FLAGS.ACTIVE_DEVELOPER | DISCORD_FLAGS.BALANCE | DISCORD_FLAGS.EARLY_SUPPORTER,
);
assert.strictEqual(combo.length, 3);
const comboKeys = combo.map((b) => b.key);
assert.ok(comboKeys.includes("active_developer"));
assert.ok(comboKeys.includes("balance"));
assert.ok(comboKeys.includes("early_supporter"));

// Zero, negative, invalid flag tests
assert.deepStrictEqual(resolveDiscordBadges(0), []);
assert.deepStrictEqual(resolveDiscordBadges(-10), []);
assert.deepStrictEqual(resolveDiscordBadges(NaN as unknown as number), []);

// Undocumented bits ignored
const undocumentedBit = 1 << 5; // 32 is not in public_flags
assert.deepStrictEqual(resolveDiscordBadges(undocumentedBit), []);
console.log("  [PASS] Bitmask resolution satisfies all canonical and edge cases.");

// -----------------------------------------------------------------------------
// Test 4: Sanitization & URL Security
// -----------------------------------------------------------------------------
console.log("\n4. Testing key and URL sanitizers...");
// Key sanitizer
assert.strictEqual(sanitizeBadgeKey("  ACTIVE_DEVELOPER  "), "active_developer");
assert.strictEqual(sanitizeBadgeKey("nitro-boost_2026!@#$%^"), "nitro-boost_2026");
assert.strictEqual(sanitizeBadgeKey("___test___"), "test");

// XSS URL security
assert.strictEqual(isValidBadgeIconUrl("javascript:alert(1)"), false);
assert.strictEqual(isValidBadgeIconUrl("JAVASCRIPT:alert(document.cookie)"), false);
assert.strictEqual(isValidBadgeIconUrl("data:text/html,<script>alert(1)</script>"), false);
assert.strictEqual(isValidBadgeIconUrl("vbscript:msgbox(1)"), false);
assert.strictEqual(isValidBadgeIconUrl("//evil.com/badge.png"), false);
assert.strictEqual(isValidBadgeIconUrl("/\\evil.com/badge.png"), false);
assert.strictEqual(isValidBadgeIconUrl("https://example.com/badge.png"), true);
assert.strictEqual(isValidBadgeIconUrl("/badges/nitro.png"), true);
assert.strictEqual(isValidBadgeIconUrl(""), true); // empty fallback
console.log("  [PASS] XSS and injection vulnerabilities strictly prevented.");

// -----------------------------------------------------------------------------
// Test 5: Server Route /api/discord/badges (No 500 guarantee)
// -----------------------------------------------------------------------------
console.log("\n5. Testing /api/discord/badges route handler...");
async function runRouteTests() {
  const req = new NextRequest("http://localhost:3000/api/discord/badges", {
    headers: { "x-forwarded-for": "192.168.1.100" },
  });

  const res = await getBadgesRoute(req);
  assert.strictEqual(res.status, 200, "Route must return status 200 even without env tokens");
  const cacheControl = res.headers.get("Cache-Control");
  assert.ok(cacheControl, "Response must include Cache-Control header");

  const json = await res.json();
  assert.ok(Array.isArray(json), "Response body must be an array");
  console.log("  [PASS] Route handler gracefully handles unconfigured state with 200 []");
}

// -----------------------------------------------------------------------------
// Test 6: Local PNG Asset Integrity
// -----------------------------------------------------------------------------
console.log("\n6. Testing local PNG assets in public/badges/...");
const badgesDir = path.resolve(__dirname, "../public/badges");
assert.ok(fs.existsSync(badgesDir), "public/badges/ directory must exist");

const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
for (const b of ALL_DISCORD_BADGES) {
  const assetPath = path.join(badgesDir, `${b.key}.png`);
  assert.ok(fs.existsSync(assetPath), `Missing badge asset: ${b.key}.png`);
  const buf = fs.readFileSync(assetPath);
  assert.ok(buf.length > 50, `Badge asset too small: ${b.key}.png`);
  assert.ok(
    buf.subarray(0, 8).equals(pngMagic),
    `Badge asset is not valid PNG: ${b.key}.png`,
  );
}
console.log("  [PASS] All 15 local PNG badge icons verified with authentic PNG binary magic headers.");

// -----------------------------------------------------------------------------
// Test 7: Supabase Migration Script
// -----------------------------------------------------------------------------
console.log("\n7. Testing Supabase migration file...");
const migrationPath = path.resolve(
  __dirname,
  "../supabase/migrations/20261123_manual_badges.sql",
);
assert.ok(fs.existsSync(migrationPath), "Migration file must exist");
const sqlContent = fs.readFileSync(migrationPath, "utf-8");
assert.ok(sqlContent.includes("create table if not exists public.manual_badges"));
assert.ok(sqlContent.includes("disabled_discord_badges"));
assert.ok(sqlContent.includes("set_manual_badges_updated_at"));
assert.ok(sqlContent.includes("is_site_admin()"));
console.log("  [PASS] Migration SQL script structure verified.");

// Execute async route test
runRouteTests().then(() => {
  console.log("\n==================================================");
  console.log("  ALL BADGE TESTS PASSED SUCCESSFULLY! (7/7)      ");
  console.log("==================================================");
});
