/**
 * Pure TypeScript Discord Badges Registry & Resolver
 * Zero JSX / DOM dependencies - safe for Edge / Node.js runtime and client bundle.
 */

export type DiscordBadgeMode = "auto" | "custom" | "both";

export interface DiscordBadge {
  id: string;
  key: string;
  name: string;
  label: string;
  description: string;
  brandColor: string;
  glowColor: string;
  bitmask?: number;
  category: "staff" | "hypesquad" | "developer" | "community" | "subscriber";
}

export interface ManualBadge {
  id: string;
  key: string;
  label: string;
  description: string;
  icon_url: string;
  sort: number;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export type DiscordBadgePayload =
  | string
  | { id?: string | null; badge_id?: string | null };

export interface ResolveBadgesOptions {
  publicFlags?: number | null;
  avatar?: string | null;
  premiumType?: number | null;
  boosting?: boolean | null;
  badgeIds?: DiscordBadgePayload[] | null;
  customBadges?: string[] | null;
  badgeMode?: DiscordBadgeMode;
}

/**
 * Official Discord User Public Flags Bitmask
 * https://discord.com/developers/docs/resources/user#user-object-user-flags
 */
export const DISCORD_FLAGS = {
  STAFF: 1 << 0, // 1
  PARTNER: 1 << 1, // 2
  HYPESQUAD_EVENTS: 1 << 2, // 4
  BUG_HUNTER_1: 1 << 3, // 8
  BRAVERY: 1 << 6, // 64
  BRILLIANCE: 1 << 7, // 128
  BALANCE: 1 << 8, // 256
  EARLY_SUPPORTER: 1 << 9, // 512
  BUG_HUNTER_2: 1 << 14, // 16384
  EARLY_BOT_DEVELOPER: 1 << 17, // 131072
  MODERATOR_PROGRAMS_ALUMNI: 1 << 18, // 262144
  ACTIVE_DEVELOPER: 1 << 22, // 4194304
} as const;

/**
 * Canonical registry of Discord badges.
 * Easily extensible with a single object entry.
 */
export const ALL_DISCORD_BADGES: DiscordBadge[] = [
  {
    id: "active_developer",
    key: "active_developer",
    name: "Active Developer",
    label: "Active Developer",
    description: "Discord Aktif Geliştirici Rozeti",
    brandColor: "#57f287",
    glowColor: "rgba(87, 242, 135, 0.5)",
    bitmask: DISCORD_FLAGS.ACTIVE_DEVELOPER,
    category: "developer",
  },
  {
    id: "nitro",
    key: "nitro",
    name: "Discord Nitro",
    label: "Discord Nitro",
    description: "Discord Nitro Abonesi",
    brandColor: "#ff73fa",
    glowColor: "rgba(255, 115, 250, 0.5)",
    category: "subscriber",
  },
  {
    id: "booster",
    key: "booster",
    name: "Server Booster",
    label: "Server Booster",
    description: "Discord Sunucu Takviyecisi",
    brandColor: "#f47fff",
    glowColor: "rgba(244, 127, 255, 0.5)",
    category: "subscriber",
  },
  {
    id: "early_supporter",
    key: "early_supporter",
    name: "Early Supporter",
    label: "Early Supporter",
    description: "Erken Dönem Discord Destekçisi",
    brandColor: "#f47b67",
    glowColor: "rgba(244, 123, 103, 0.5)",
    bitmask: DISCORD_FLAGS.EARLY_SUPPORTER,
    category: "community",
  },
  {
    id: "bravery",
    key: "bravery",
    name: "HypeSquad Bravery",
    label: "HypeSquad Bravery",
    description: "HypeSquad Cesaret Evi (Bravery)",
    brandColor: "#9c84ef",
    glowColor: "rgba(156, 132, 239, 0.5)",
    bitmask: DISCORD_FLAGS.BRAVERY,
    category: "hypesquad",
  },
  {
    id: "brilliance",
    key: "brilliance",
    name: "HypeSquad Brilliance",
    label: "HypeSquad Brilliance",
    description: "HypeSquad Zeka Evi (Brilliance)",
    brandColor: "#f47b67",
    glowColor: "rgba(244, 123, 103, 0.5)",
    bitmask: DISCORD_FLAGS.BRILLIANCE,
    category: "hypesquad",
  },
  {
    id: "balance",
    key: "balance",
    name: "HypeSquad Balance",
    label: "HypeSquad Balance",
    description: "HypeSquad Denge Evi (Balance)",
    brandColor: "#45ddc0",
    glowColor: "rgba(69, 221, 192, 0.5)",
    bitmask: DISCORD_FLAGS.BALANCE,
    category: "hypesquad",
  },
  {
    id: "early_bot_developer",
    key: "early_bot_developer",
    name: "Early Verified Bot Developer",
    label: "Early Verified Bot Developer",
    description: "Erken Dönem Doğrulanmış Bot Geliştiricisi",
    brandColor: "#5865f2",
    glowColor: "rgba(88, 101, 242, 0.5)",
    bitmask: DISCORD_FLAGS.EARLY_BOT_DEVELOPER,
    category: "developer",
  },
  {
    id: "staff",
    key: "staff",
    name: "Discord Staff",
    label: "Discord Staff",
    description: "Discord Çalışanı / Personeli",
    brandColor: "#5865f2",
    glowColor: "rgba(88, 101, 242, 0.5)",
    bitmask: DISCORD_FLAGS.STAFF,
    category: "staff",
  },
  {
    id: "partner",
    key: "partner",
    name: "Partnered Server Owner",
    label: "Partnered Server Owner",
    description: "Discord Partner Sunucu Sahibi",
    brandColor: "#5865f2",
    glowColor: "rgba(88, 101, 242, 0.5)",
    bitmask: DISCORD_FLAGS.PARTNER,
    category: "community",
  },
  {
    id: "hypesquad_events",
    key: "hypesquad_events",
    name: "HypeSquad Events",
    label: "HypeSquad Events",
    description: "HypeSquad Etkinlik Koordinatörü",
    brandColor: "#faa61a",
    glowColor: "rgba(250, 166, 26, 0.5)",
    bitmask: DISCORD_FLAGS.HYPESQUAD_EVENTS,
    category: "hypesquad",
  },
  {
    id: "bug_hunter_1",
    key: "bug_hunter_1",
    name: "Bug Hunter Level 1",
    label: "Bug Hunter Level 1",
    description: "Discord Hata Avcısı Kademe 1",
    brandColor: "#3ba55d",
    glowColor: "rgba(59, 165, 93, 0.5)",
    bitmask: DISCORD_FLAGS.BUG_HUNTER_1,
    category: "community",
  },
  {
    id: "bug_hunter_2",
    key: "bug_hunter_2",
    name: "Bug Hunter Level 2",
    label: "Bug Hunter Level 2",
    description: "Discord Altın Hata Avcısı Kademe 2",
    brandColor: "#f1c40f",
    glowColor: "rgba(241, 196, 15, 0.5)",
    bitmask: DISCORD_FLAGS.BUG_HUNTER_2,
    category: "community",
  },
  {
    id: "moderator_programs_alumni",
    key: "moderator_programs_alumni",
    name: "Moderator Programs Alumni",
    label: "Moderator Programs Alumni",
    description: "Discord Mezun Moderatör Rozeti",
    brandColor: "#5865f2",
    glowColor: "rgba(88, 101, 242, 0.5)",
    bitmask: DISCORD_FLAGS.MODERATOR_PROGRAMS_ALUMNI,
    category: "community",
  },
  {
    id: "quest",
    key: "quest",
    name: "Completed a Quest",
    label: "Completed a Quest",
    description: "Discord Görevi Tamamlandı",
    brandColor: "#8a5cf6",
    glowColor: "rgba(138, 92, 246, 0.5)",
    category: "community",
  },
];

export const CANONICAL_DISCORD_FLAGS = ALL_DISCORD_BADGES.filter(
  (b): b is DiscordBadge & { bitmask: number } => typeof b.bitmask === "number",
);

export const BADGE_MAP = new Map<string, DiscordBadge>(
  ALL_DISCORD_BADGES.map((b) => [b.key, b]),
);

export function getDiscordBadge(keyOrId: string): DiscordBadge | null {
  return BADGE_MAP.get(keyOrId) || null;
}

/**
 * Sorts badges adhering to the canonical ALL_DISCORD_BADGES definition order.
 */
export function sortBadges(badges: DiscordBadge[]): DiscordBadge[] {
  const orderMap = new Map<string, number>(
    ALL_DISCORD_BADGES.map((b, idx) => [b.key, idx]),
  );

  return [...badges].sort((a, b) => {
    const orderA = orderMap.get(a.key) ?? 999;
    const orderB = orderMap.get(b.key) ?? 999;
    return orderA - orderB;
  });
}

/**
 * Flag resolver function supporting both direct bitmask number or rich options object.
 */
export function resolveDiscordBadges(flags: number): DiscordBadge[];
export function resolveDiscordBadges(options: ResolveBadgesOptions): DiscordBadge[];
export function resolveDiscordBadges(
  arg?: number | ResolveBadgesOptions | null,
): DiscordBadge[] {
  if (typeof arg === "number") {
    const flags = Number.isFinite(arg) ? Math.floor(arg) : 0;
    if (flags <= 0) return [];
    const matched: DiscordBadge[] = [];
    for (const badge of CANONICAL_DISCORD_FLAGS) {
      if ((flags & badge.bitmask) === badge.bitmask) {
        matched.push(badge);
      }
    }
    return sortBadges(matched);
  }

  const opts = arg ?? {};
  const publicFlags = opts.publicFlags;
  const flags =
    typeof publicFlags === "number" && Number.isFinite(publicFlags)
      ? Math.floor(publicFlags)
      : 0;
  const autoBadges: DiscordBadge[] = [];

  // Check bitmask flags
  for (const badge of CANONICAL_DISCORD_FLAGS) {
    if ((flags & badge.bitmask) === badge.bitmask) {
      autoBadges.push(badge);
    }
  }

  // Detect Discord Nitro automatically via animated avatar (starts with "a_") or premium_type
  const hasAnimatedAvatar =
    typeof opts.avatar === "string" && opts.avatar.startsWith("a_");
  const hasPremiumType =
    typeof opts.premiumType === "number" && opts.premiumType > 0;
  if (hasAnimatedAvatar || hasPremiumType) {
    const nitroBadge = BADGE_MAP.get("nitro");
    if (nitroBadge && !autoBadges.some((b) => b.key === "nitro")) {
      autoBadges.push(nitroBadge);
    }
  }

  if (opts.boosting) {
    const boosterBadge = BADGE_MAP.get("booster");
    if (boosterBadge && !autoBadges.some((b) => b.key === "booster")) {
      autoBadges.push(boosterBadge);
    }
  }

  if (Array.isArray(opts.badgeIds)) {
    for (const entry of opts.badgeIds) {
      const id =
        typeof entry === "string" ? entry : entry?.id ?? entry?.badge_id;
      const detected = typeof id === "string" ? BADGE_MAP.get(id) : null;
      if (detected && !autoBadges.some((b) => b.key === detected.key)) {
        autoBadges.push(detected);
      }
    }
  }

  // Sanitize custom badges
  const cleanCustom: DiscordBadge[] = [];
  if (Array.isArray(opts.customBadges)) {
    for (const id of opts.customBadges) {
      if (typeof id === "string") {
        const found = BADGE_MAP.get(id);
        if (found && !cleanCustom.some((b) => b.key === found.key)) {
          cleanCustom.push(found);
        }
      }
    }
  }

  if (opts.badgeMode === "custom") {
    return cleanCustom;
  }

  if (opts.badgeMode === "both") {
    const combined: DiscordBadge[] = [...autoBadges];
    for (const b of cleanCustom) {
      if (!combined.some((item) => item.key === b.key)) {
        combined.push(b);
      }
    }
    return sortBadges(combined);
  }

  // Default "auto": use only live Discord data
  if (autoBadges.length > 0) {
    return sortBadges(autoBadges);
  }

  return [];
}

/**
 * Sanitizes badge key ensuring only lowercase alphanumeric, underscore, or hyphen.
 */
export function sanitizeBadgeKey(key: string): string {
  if (typeof key !== "string") return "";
  return key
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
}

/**
 * Validates that an icon URL is safe against XSS and injection.
 * Rejects javascript:, data:, vbscript:, etc.
 * Only accepts https://, http://, or local relative paths beginning with /.
 */
export function isValidBadgeIconUrl(url: string): boolean {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return true; // empty allowed as fallback to local key or SVG

  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}
