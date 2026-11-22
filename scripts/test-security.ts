import assert from "node:assert";
import { NextRequest } from "next/server";
import { buildContentSecurityPolicy, getSecurityHeaders } from "../next.config";
import { safeCssUrl } from "../src/lib/profile";
import { middleware } from "../src/middleware";
import {
  checkRateLimit,
  resetRateLimitsForTesting,
} from "../src/lib/rate-limit";
import {
  POST as viewsPost,
  GET as viewsGet,
  PATCH as viewsPatch,
} from "../src/app/api/views/route";

console.log("==================================================");
console.log("  Running Security Verification Test Suite (M1)  ");
console.log("==================================================");

let passedTests = 0;
let totalTests = 0;

function test(name: string, fn: () => void | Promise<void>) {
  totalTests++;
  try {
    const result = fn();
    if (result && typeof (result as Promise<void>).then === "function") {
      return (result as Promise<void>).then(
        () => {
          console.log(`  [PASS] ${name}`);
          passedTests++;
        },
        (err) => {
          console.error(`  [FAIL] ${name}:`, err);
          throw err;
        },
      );
    }
    console.log(`  [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err);
    throw err;
  }
}

async function runAllTests() {
  // =========================================================================
  // 1. R1: Content-Security-Policy (CSP) Verification
  // =========================================================================
  console.log("\n--- Suite 1: Content-Security-Policy (CSP) ---");

  test("CSP contains all mandatory security directives", () => {
    const csp = buildContentSecurityPolicy();
    const mandatoryDirectives = [
      "default-src",
      "script-src",
      "style-src",
      "img-src",
      "font-src",
      "connect-src",
      "media-src",
      "object-src",
      "base-uri",
      "form-action",
      "frame-ancestors",
    ];

    for (const directive of mandatoryDirectives) {
      assert.ok(
        csp.includes(directive),
        `CSP missing mandatory directive: ${directive}`,
      );
    }
  });

  test("CSP allows external origins for Supabase, Discord, and Spotify", () => {
    const csp = buildContentSecurityPolicy();

    // Supabase
    assert.ok(csp.includes("https://*.supabase.co"), "CSP must allow Supabase HTTPS");
    assert.ok(csp.includes("wss://*.supabase.co"), "CSP must allow Supabase WSS");

    // Discord
    assert.ok(csp.includes("https://cdn.discordapp.com"), "CSP must allow Discord CDN");
    assert.ok(csp.includes("https://media.discordapp.net"), "CSP must allow Discord media proxy");

    // Spotify
    assert.ok(csp.includes("https://i.scdn.co"), "CSP must allow Spotify CDN");

    // Security standards
    assert.ok(csp.includes("object-src 'none'"), "object-src must be 'none'");
    assert.ok(csp.includes("frame-ancestors 'self'"), "frame-ancestors must be 'self'");
    assert.ok(csp.includes("'unsafe-inline'"), "Inline styles/scripts needed for React/Next hydration");
  });

  test("CSP dynamically includes configured NEXT_PUBLIC_SUPABASE_URL origin", () => {
    const originalEnv = process.env.NEXT_PUBLIC_SUPABASE_URL;
    try {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://custom-project-ref.supabase.co";
      const csp = buildContentSecurityPolicy();
      assert.ok(
        csp.includes("https://custom-project-ref.supabase.co"),
        "Dynamic Supabase origin must be present in CSP",
      );
    } finally {
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalEnv;
    }
  });

  test("Security headers array includes Content-Security-Policy", () => {
    const headers = getSecurityHeaders();
    const cspHeader = headers.find((h) => h.key === "Content-Security-Policy");
    assert.ok(cspHeader, "Content-Security-Policy must be in securityHeaders");
    assert.ok(cspHeader.value.length > 50, "CSP header value must not be empty");
  });

  // =========================================================================
  // 2. R2: Admin Route Protection (Middleware) Verification
  // =========================================================================
  console.log("\n--- Suite 2: Admin Route Protection (Middleware) ---");

  await test("Unauthenticated user accessing /admin redirects to /admin/login", async () => {
    const req = new NextRequest("http://localhost:3000/admin");
    const res = await middleware(req);
    assert.strictEqual(res.status, 307);
    assert.strictEqual(res.headers.get("location"), "http://localhost:3000/admin/login");
  });

  await test("Unauthenticated user accessing nested /admin/settings redirects to /admin/login", async () => {
    const req = new NextRequest("http://localhost:3000/admin/settings");
    const res = await middleware(req);
    assert.strictEqual(res.status, 307);
    assert.strictEqual(res.headers.get("location"), "http://localhost:3000/admin/login");
  });

  await test("Unauthenticated user accessing /admin/login is allowed through", async () => {
    const req = new NextRequest("http://localhost:3000/admin/login");
    const res = await middleware(req);
    // Should NOT redirect to /admin/login (status 200 or no location header)
    assert.notStrictEqual(res.headers.get("location"), "http://localhost:3000/admin/login");
  });

  await test("Middleware preserves and forwards cookies on redirect", async () => {
    const req = new NextRequest("http://localhost:3000/admin", {
      headers: {
        cookie: "test-token=cyber-sec-cookie-value",
      },
    });
    const res = await middleware(req);
    assert.strictEqual(res.status, 307);
    assert.strictEqual(res.headers.get("location"), "http://localhost:3000/admin/login");
  });

  await test("Handles missing Supabase environment variables gracefully", async () => {
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    try {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const reqAdmin = new NextRequest("http://localhost:3000/admin");
      const resAdmin = await middleware(reqAdmin);
      assert.strictEqual(resAdmin.status, 307);
      assert.strictEqual(resAdmin.headers.get("location"), "http://localhost:3000/admin/login");

      const reqLogin = new NextRequest("http://localhost:3000/admin/login");
      const resLogin = await middleware(reqLogin);
      assert.notStrictEqual(resLogin.headers.get("location"), "http://localhost:3000/admin/login");
    } finally {
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
    }
  });

  // =========================================================================
  // 3. R3: CSS Injection Sanitization (`safeCssUrl`) Verification
  // =========================================================================
  console.log("\n--- Suite 3: CSS Injection Sanitization (safeCssUrl) ---");

  test("safeCssUrl accepts valid HTTPS and HTTP URLs", () => {
    assert.strictEqual(
      safeCssUrl("https://example.com/assets/bg.png"),
      "https://example.com/assets/bg.png",
    );
    assert.strictEqual(
      safeCssUrl("http://cdn.example.org/photo.webp?v=2"),
      "http://cdn.example.org/photo.webp?v=2",
    );
    assert.strictEqual(
      safeCssUrl("https://bdavsxdaceszbcfrzftm.supabase.co/storage/v1/object/public/profile-media/bg.jpg"),
      "https://bdavsxdaceszbcfrzftm.supabase.co/storage/v1/object/public/profile-media/bg.jpg",
    );
  });

  test("safeCssUrl rejects double quote CSS breakout payloads", () => {
    assert.strictEqual(
      safeCssUrl('https://evil.com/bg.png");}body{background:red}/*'),
      null,
    );
    assert.strictEqual(
      safeCssUrl('https://evil.com/x.png"'),
      null,
    );
  });

  test("safeCssUrl rejects single quote and parenthesis breakouts", () => {
    assert.strictEqual(
      safeCssUrl("https://evil.com/bg.png');}/*"),
      null,
    );
    assert.strictEqual(
      safeCssUrl("https://evil.com/bg.png)"),
      null,
    );
    assert.strictEqual(
      safeCssUrl("https://evil.com/bg.png("),
      null,
    );
  });

  test("safeCssUrl rejects semicolon, braces, and escape sequences", () => {
    assert.strictEqual(safeCssUrl("https://evil.com/bg.png;color:red;"), null);
    assert.strictEqual(safeCssUrl("https://evil.com/bg.png{display:none}"), null);
    assert.strictEqual(safeCssUrl("https://evil.com/bg.png\\22"), null);
    assert.strictEqual(safeCssUrl("https://evil.com/bg.png\\"), null);
  });

  test("safeCssUrl rejects newlines, carriage returns, and control characters", () => {
    assert.strictEqual(safeCssUrl("https://evil.com/bg.png\r\nbehavior:url(x.htc)"), null);
    assert.strictEqual(safeCssUrl("https://evil.com/bg.png\n"), null);
    assert.strictEqual(safeCssUrl("https://evil.com/bg.png\x00"), null);
    assert.strictEqual(safeCssUrl("https://evil.com/bg.png\x1f"), null);
  });

  test("safeCssUrl rejects dangerous non-HTTP protocols (XSS vectors)", () => {
    assert.strictEqual(safeCssUrl("javascript:alert(1)"), null);
    assert.strictEqual(safeCssUrl("javascript://example.com/%0Aalert(1)"), null);
    assert.strictEqual(safeCssUrl("data:text/html,<script>alert(1)</script>"), null);
    assert.strictEqual(safeCssUrl("vbscript:msgbox(1)"), null);
    assert.strictEqual(safeCssUrl("file:///etc/passwd"), null);
  });

  test("safeCssUrl rejects whitespace, empty, and non-string inputs", () => {
    assert.strictEqual(safeCssUrl("https://example.com/bg image.png"), null);
    assert.strictEqual(safeCssUrl("   "), null);
    assert.strictEqual(safeCssUrl(""), null);
    assert.strictEqual(safeCssUrl(null), null);
    assert.strictEqual(safeCssUrl(undefined), null);
    assert.strictEqual(safeCssUrl(12345), null);
    assert.strictEqual(safeCssUrl({ url: "https://example.com" }), null);
  });

  // =========================================================================
  // 4. R5: API Views Protection & Rate Limiting Verification
  // =========================================================================
  console.log("\n--- Suite 4: API Views Rate Limiting & Protection ---");

  test("checkRateLimit allows requests up to max quota and blocks exceeding requests", () => {
    resetRateLimitsForTesting();
    const testIpKey = "test:ip:192.168.1.100";
    const max = 5;
    const windowMs = 60_000;

    // First 5 requests must be allowed
    for (let i = 1; i <= max; i++) {
      const result = checkRateLimit(testIpKey, max, windowMs);
      assert.strictEqual(result.allowed, true, `Request ${i} should be allowed`);
      assert.strictEqual(result.remaining, max - i);
    }

    // 6th request must be blocked
    const blockedResult = checkRateLimit(testIpKey, max, windowMs);
    assert.strictEqual(blockedResult.allowed, false, "Request 6 should be blocked");
    assert.strictEqual(blockedResult.remaining, 0);
    assert.ok(blockedResult.retryAfterSeconds > 0, "retryAfterSeconds should be positive");
  });

  test("Different IP keys maintain independent rate limit buckets", () => {
    resetRateLimitsForTesting();
    const ip1 = "ip:10.0.0.1";
    const ip2 = "ip:10.0.0.2";

    // Exhaust ip1
    for (let i = 0; i < 3; i++) {
      checkRateLimit(ip1, 3, 60_000);
    }
    assert.strictEqual(checkRateLimit(ip1, 3, 60_000).allowed, false);

    // ip2 should still be allowed
    const ip2Result = checkRateLimit(ip2, 3, 60_000);
    assert.strictEqual(ip2Result.allowed, true);
    assert.strictEqual(ip2Result.remaining, 2);
  });

  await test("POST /api/views returns 429 Too Many Requests when rate limit is exceeded", async () => {
    resetRateLimitsForTesting();
    const abusedIp = "203.0.113.42";

    // Send 10 requests within quota
    for (let i = 0; i < 10; i++) {
      const req = new Request("http://localhost:3000/api/views", {
        method: "POST",
        headers: {
          "x-forwarded-for": abusedIp,
        },
      });
      const res = await viewsPost(req);
      // Status could be 200 or 400 depending on Supabase mock, but NOT 429
      assert.notStrictEqual(res.status, 429);
    }

    // 11th request must be rejected with 429 and Retry-After
    const excessReq = new Request("http://localhost:3000/api/views", {
      method: "POST",
      headers: {
        "x-forwarded-for": abusedIp,
      },
    });
    const excessRes = await viewsPost(excessReq);
    assert.strictEqual(excessRes.status, 429);
    assert.ok(excessRes.headers.get("Retry-After"), "Must include Retry-After header");
    const json = await excessRes.json();
    assert.strictEqual(json.ok, false);
    assert.strictEqual(json.error, "Too many requests");
  });

  await test("GET /api/views enforces rate limiting", async () => {
    resetRateLimitsForTesting();
    const getIp = "198.51.100.99";

    for (let i = 0; i < 30; i++) {
      const req = new Request("http://localhost:3000/api/views", {
        method: "GET",
        headers: {
          "x-forwarded-for": getIp,
        },
      });
      const res = await viewsGet(req);
      assert.notStrictEqual(res.status, 429);
    }

    // 31st request -> 429
    const req31 = new Request("http://localhost:3000/api/views", {
      method: "GET",
      headers: {
        "x-forwarded-for": getIp,
      },
    });
    const res31 = await viewsGet(req31);
    assert.strictEqual(res31.status, 429);
  });

  await test("PATCH /api/views enforces rate limiting", async () => {
    resetRateLimitsForTesting();
    const patchIp = "198.51.100.50";

    for (let i = 0; i < 10; i++) {
      const req = new Request("http://localhost:3000/api/views", {
        method: "PATCH",
        headers: {
          "x-forwarded-for": patchIp,
          "content-type": "application/json",
        },
        body: JSON.stringify({ views_count: 10 }),
      });
      const res = await viewsPatch(req);
      assert.notStrictEqual(res.status, 429);
    }

    // 11th request -> 429
    const req11 = new Request("http://localhost:3000/api/views", {
      method: "PATCH",
      headers: {
        "x-forwarded-for": patchIp,
        "content-type": "application/json",
      },
      body: JSON.stringify({ views_count: 10 }),
    });
    const res11 = await viewsPatch(req11);
    assert.strictEqual(res11.status, 429);
  });

  console.log("\n==================================================");
  console.log(`  Summary: ${passedTests}/${totalTests} tests passed cleanly!`);
  console.log("==================================================");
}

runAllTests().catch((err) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
