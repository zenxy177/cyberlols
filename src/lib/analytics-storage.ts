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

    const { data, error } = await supabase
      .from("profile_views_log")
      .select("*")
      .eq("profile_id", "main")
      .order("viewed_at", { ascending: false });

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
  const logTotal = logs.length;

  // Day names in Turkish
  const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
  const monthNames = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  const now = new Date();

  // Last 7 days calendar
  const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - (6 - i));
    const dayStr = targetDate.toISOString().slice(0, 10);
    const dayName = dayNames[targetDate.getDay()];
    const dateFormatted = `${targetDate.getDate()} ${monthNames[targetDate.getMonth()]}`;

    const matchCount = logs.filter((l) => l.viewed_at.startsWith(dayStr)).length;

    return {
      date: dateFormatted,
      dayName,
      views: matchCount,
    };
  });

  const weeklyViews = weeklyTrend.reduce((sum, item) => sum + item.views, 0);

  // Device Breakdown (REAL)
  const deviceCounts: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 };
  for (const l of logs) {
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
      percentage: logTotal > 0 ? Math.round((deviceCounts.desktop / logTotal) * 100) : 0,
    },
    {
      type: "mobile",
      label: "Mobil (Smartphone)",
      count: deviceCounts.mobile,
      percentage: logTotal > 0 ? Math.round((deviceCounts.mobile / logTotal) * 100) : 0,
    },
    {
      type: "tablet",
      label: "Tablet",
      count: deviceCounts.tablet,
      percentage: logTotal > 0 ? Math.round((deviceCounts.tablet / logTotal) * 100) : 0,
    },
  ];

  // Referrers Breakdown (REAL)
  const refCounts: Record<string, number> = {};
  for (const l of logs) {
    const r = l.referrer || "Doğrudan (Direct / URL)";
    refCounts[r] = (refCounts[r] || 0) + 1;
  }

  const referrerStats = Object.entries(refCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({
      name,
      count,
      percentage: logTotal > 0 ? Math.round((count / logTotal) * 100) : 0,
    }));

  // Countries Breakdown (REAL)
  const countryCounts: Record<string, { count: number; name: string; flag: string }> = {};
  for (const l of logs) {
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
      percentage: logTotal > 0 ? Math.round((item.count / logTotal) * 100) : 0,
    }));

  return {
    ok: true,
    hasRealData: totalViews > 0 || logTotal > 0,
    totalViews,
    weeklyViews,
    weeklyTrend,
    deviceStats,
    referrerStats,
    countryStats,
    peakHour: totalViews > 0 ? "Akşam Trafiği" : "Veri Bekleniyor",
    avgDuration: totalViews > 0 ? "Gerçek Ziyaretçi" : "-",
  };
}
