import { createHash } from "node:crypto";
import { createServerSupabase } from "@/lib/supabase/server";

export type ViewLogEntry = {
  id: string;
  profile_id: string;
  viewed_at: string;
  device_type: "desktop" | "mobile" | "tablet";
  browser: string;
  country_code: string;
  country_name: string;
  flag: string;
  referrer: string;
};

export type VisitDescriptor = {
  payload: {
    profile_id: string;
    device_type: "desktop" | "mobile" | "tablet";
    browser: string;
    country_code: string;
    country_name: string;
    referrer: string;
  };
  ipHash: string | null;
};

const COUNTRY_MAP: Record<string, { name: string; flag: string }> = {
  TR: { name: "Türkiye", flag: "🇹🇷" },
  DE: { name: "Almanya", flag: "🇩🇪" },
  US: { name: "Amerika Birleşik Devletleri", flag: "🇺🇸" },
  AZ: { name: "Azerbaycan", flag: "🇦🇿" },
  GB: { name: "Birleşik Krallık", flag: "🇬🇧" },
  NL: { name: "Hollanda", flag: "🇳🇱" },
  FR: { name: "Fransa", flag: "🇫🇷" },
  CY: { name: "Kıbrıs", flag: "🇨🇾" },
  RU: { name: "Rusya", flag: "🇷🇺" },
};

function getClientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return (
    headers.get("x-real-ip")?.trim() ||
    headers.get("cf-connecting-ip")?.trim() ||
    null
  );
}

function hashIp(ip: string): string {
  const salt = process.env.ANALYTICS_IP_SALT ?? "";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export function parseUserAgent(ua: string | null): {
  device: "desktop" | "mobile" | "tablet";
  browser: string;
} {
  if (!ua) return { device: "desktop", browser: "Bilinmiyor" };

  let device: "desktop" | "mobile" | "tablet" = "desktop";
  if (/mobile|iphone|ipod|android.*mobile/i.test(ua)) {
    device = "mobile";
  } else if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    device = "tablet";
  }

  let browser = "Diğer";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/chrome|crios/i.test(ua) && !/opr\//i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = "Safari";
  else if (/opr\//i.test(ua)) browser = "Opera";
  else if (/discord/i.test(ua)) browser = "Discord";

  return { device, browser };
}

export function parseReferrer(ref: string | null): string {
  if (!ref) return "Doğrudan (Direct / URL)";
  try {
    const url = new URL(ref);
    const host = url.hostname.toLowerCase();
    if (host.includes("discord")) return "Discord";
    if (host.includes("kick.com")) return "Kick";
    if (host.includes("instagram.com")) return "Instagram";
    if (host.includes("steamcommunity.com") || host.includes("steampowered.com")) return "Steam";
    if (host.includes("t.co") || host.includes("twitter.com") || host.includes("x.com")) return "X (Twitter)";
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "YouTube";
    if (host.includes("twitch.tv")) return "Twitch";
    if (host.includes("tiktok.com")) return "TikTok";
    if (host.includes("google.com")) return "Google";
    return host.replace(/^www\./, "");
  } catch {
    return "Doğrudan (Direct / URL)";
  }
}

export function describeVisit(headers: Headers): VisitDescriptor {
  const ua = headers.get("user-agent");
  const referer = headers.get("referer");
  const countryHeader =
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("x-country-code") ||
    "TR";

  const { device, browser } = parseUserAgent(ua);
  const cleanReferrer = parseReferrer(referer);

  const countryCode = countryHeader.toUpperCase();
  const countryInfo = COUNTRY_MAP[countryCode] || { name: countryCode, flag: "🌍" };

  const ip = getClientIp(headers);
  const ipHash = ip ? hashIp(ip) : null;

  return {
    payload: {
      profile_id: "main",
      device_type: device,
      browser,
      country_code: countryCode,
      country_name: countryInfo.name,
      referrer: cleanReferrer,
    },
    ipHash,
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;
const TIME_ZONE = "Europe/Istanbul";

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const dayLabelFormatter = new Intl.DateTimeFormat("tr-TR", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
});
const weekdayFormatter = new Intl.DateTimeFormat("tr-TR", {
  timeZone: TIME_ZONE,
  weekday: "short",
});
const hourFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  hour12: false,
});

export async function getRealAnalytics() {
  let logs: ViewLogEntry[] = [];
  let dbViewsCount: number | null = null;

  try {
    const supabase = await createServerSupabase();

    const { data: prof } = await supabase
      .from("profiles")
      .select("views_count")
      .eq("id", "main")
      .maybeSingle();

    if (prof) {
      const parsed = Number(prof.views_count);
      if (Number.isFinite(parsed)) {
        dbViewsCount = parsed;
      }
    }

    // Son 90 günle sınırla; tablo büyüdükçe istek süresi sabit kalsın.
    const logCutoff = new Date(Date.now() - 90 * DAY_MS).toISOString();
    const { data, error } = await supabase
      .from("profile_views_log")
      .select("*")
      .eq("profile_id", "main")
      .gte("viewed_at", logCutoff)
      .order("viewed_at", { ascending: false })
      .limit(10000);

    if (!error && data && data.length > 0) {
      logs = data.map((d) => ({
        id: String(d.id),
        profile_id: String(d.profile_id),
        viewed_at: String(d.viewed_at),
        device_type: (d.device_type as ViewLogEntry["device_type"]) || "desktop",
        browser: String(d.browser || "Chrome"),
        country_code: String(d.country_code || "TR"),
        country_name: String(d.country_name || (COUNTRY_MAP[d.country_code]?.name ?? "Türkiye")),
        flag: COUNTRY_MAP[d.country_code]?.flag ?? "🌍",
        referrer: String(d.referrer || "Doğrudan (Direct / URL)"),
      }));
    }
  } catch {
    // Supabase yoksa veya tablo henüz kurulmadıysa boş analitik döner.
  }

  const totalViews = dbViewsCount !== null ? dbViewsCount : logs.length;
  const now = new Date();
  const rpcSince = now.getTime() - 7 * DAY_MS;
  const recentLogs = logs.filter(
    (l) => new Date(l.viewed_at).getTime() >= rpcSince,
  );
  const recentTotal = recentLogs.length;

  // Son 7 gün: İstanbul takvimine göre gün grupları
  const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
    const target = new Date(now.getTime() - (6 - i) * DAY_MS);
    return {
      key: dayKeyFormatter.format(target),
      date: dayLabelFormatter.format(target),
      dayName: weekdayFormatter.format(target),
      views: 0,
    };
  });
  const trendByKey = new Map(weeklyTrend.map((item) => [item.key, item]));
  for (const log of logs) {
    const bucket = trendByKey.get(dayKeyFormatter.format(new Date(log.viewed_at)));
    if (bucket) bucket.views++;
  }

  const weeklyViews = weeklyTrend.reduce((sum, item) => sum + item.views, 0);

  // Device Breakdown (son 7 gün)
  const deviceCounts: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 };
  for (const l of recentLogs) {
    if (deviceCounts[l.device_type] !== undefined) {
      deviceCounts[l.device_type]++;
    } else {
      deviceCounts.desktop++;
    }
  }

  const deviceStats = [
    {
      type: "desktop",
      label: "Masaüstü (Desktop)",
      count: deviceCounts.desktop,
      percentage: recentTotal > 0 ? Math.round((deviceCounts.desktop / recentTotal) * 100) : 0,
    },
    {
      type: "mobile",
      label: "Mobil (Smartphone)",
      count: deviceCounts.mobile,
      percentage: recentTotal > 0 ? Math.round((deviceCounts.mobile / recentTotal) * 100) : 0,
    },
    {
      type: "tablet",
      label: "Tablet",
      count: deviceCounts.tablet,
      percentage: recentTotal > 0 ? Math.round((deviceCounts.tablet / recentTotal) * 100) : 0,
    },
  ];

  // Referrers Breakdown (son 7 gün)
  const refCounts: Record<string, number> = {};
  for (const l of recentLogs) {
    const r = l.referrer || "Doğrudan (Direct / URL)";
    refCounts[r] = (refCounts[r] || 0) + 1;
  }

  const referrerStats = Object.entries(refCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({
      name,
      count,
      percentage: recentTotal > 0 ? Math.round((count / recentTotal) * 100) : 0,
    }));

  // Countries Breakdown (son 7 gün)
  const countryCounts: Record<string, { count: number; name: string; flag: string }> = {};
  for (const l of recentLogs) {
    const code = l.country_code || "TR";
    const info = COUNTRY_MAP[code] || { name: l.country_name || code, flag: l.flag || "🌍" };
    if (!countryCounts[code]) {
      countryCounts[code] = { count: 0, name: info.name, flag: info.flag };
    }
    countryCounts[code].count++;
  }

  const countryStats = Object.entries(countryCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([code, item]) => ({
      code,
      name: item.name,
      flag: item.flag,
      count: item.count,
      percentage: recentTotal > 0 ? Math.round((item.count / recentTotal) * 100) : 0,
    }));

  // Gerçek en yoğun saat dilimi (son 7 gün)
  let peakHour = "Veri Bekleniyor";
  if (recentTotal > 0) {
    const hourCounts = new Array<number>(24).fill(0);
    for (const l of recentLogs) {
      const hour = Number(hourFormatter.format(new Date(l.viewed_at)));
      if (Number.isFinite(hour) && hour >= 0 && hour < 24) {
        hourCounts[hour]++;
      }
    }
    const peakCount = Math.max(...hourCounts);
    if (peakCount > 0) {
      const peakIndex = hourCounts.indexOf(peakCount);
      peakHour = `${String(peakIndex).padStart(2, "0")}:00 - ${String(
        (peakIndex + 1) % 24,
      ).padStart(2, "0")}:00`;
    }
  }

  return {
    ok: true,
    hasRealData: totalViews > 0 || logs.length > 0,
    totalViews,
    weeklyViews,
    weeklyTrend: weeklyTrend.map(({ date, dayName, views }) => ({
      date,
      dayName,
      views,
    })),
    deviceStats,
    referrerStats,
    countryStats,
    peakHour,
  };
}
