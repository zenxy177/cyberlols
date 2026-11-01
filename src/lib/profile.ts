export type CardBorderEffect =
  | "none"
  | "lunar_aurora"
  | "neon_pulse"
  | "rgb_flow"
  | "cyber_glow";

export type NameEffect =
  | "none"
  | "lunar_shimmer"
  | "rgb_wave"
  | "neon_pulse"
  | "cyber_glitch"
  | "sparkle";

export type CursorStyle =
  | "neon_dot"
  | "crosshair"
  | "lunar_crescent"
  | "default";

export type CursorTrail =
  | "none"
  | "stardust"
  | "ghost";

export type ProfileLink = {
  id: string;
  label: string;
  url: string;
};

export type Profile = {
  id: string;
  display_name: string;
  headline: string;
  bio: string;
  location: string;
  avatar_url: string | null;
  background_url: string | null;
  background_video_url: string | null;
  background_video_opacity: number;
  card_opacity: number;
  discord_user_id: string | null;
  discord_username: string | null;
  discord_global_name: string | null;
  discord_avatar_url: string | null;
  accent_color: string;
  surface_color: string;
  audio_url: string | null;
  audio_title: string;
  audio_artist: string;
  default_volume: number;
  click_to_enter_text: string;
  typewriter_lines: string[];
  enable_custom_cursor: boolean;
  enable_tilt: boolean;
  enable_moon_badge: boolean;
  moon_badge_title: string;
  enable_lunar_effects: boolean;
  card_border_effect: CardBorderEffect;
  name_effect: NameEffect;
  cursor_style: CursorStyle;
  cursor_trail: CursorTrail;
  enable_click_ripple: boolean;
  views_count: number;
  links: ProfileLink[];
  is_published: boolean;
};

export const EMPTY_PROFILE: Profile = {
  id: "main",
  display_name: "",
  headline: "",
  bio: "",
  location: "",
  avatar_url: null,
  background_url: null,
  background_video_url: null,
  background_video_opacity: 70,
  card_opacity: 75,
  audio_url: null,
  audio_title: "Arka Plan Müziği",
  audio_artist: "",
  default_volume: 50,
  click_to_enter_text: "click to enter",
  typewriter_lines: ["Welcome to my profile.", "Moon Knight aesthetic."],
  enable_custom_cursor: true,
  enable_tilt: true,
  enable_moon_badge: true,
  moon_badge_title: "Moon Knight",
  enable_lunar_effects: true,
  card_border_effect: "lunar_aurora",
  name_effect: "lunar_shimmer",
  cursor_style: "neon_dot",
  cursor_trail: "stardust",
  enable_click_ripple: true,
  views_count: 0,
  discord_user_id: null,
  discord_username: null,
  discord_global_name: null,
  discord_avatar_url: null,
  accent_color: "#78a7ff",
  surface_color: "#11131a",
  links: [],
  is_published: true,
};

export function clampNumber(
  val: unknown,
  fallback: number,
  min = 0,
  max = 100,
): number {
  if (val === null || val === undefined || val === "") return fallback;
  const num = Number(val);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, Math.round(num)));
}

export function normalizeProfile(value: unknown): Profile {
  if (!value || typeof value !== "object") return EMPTY_PROFILE;

  const row = value as Partial<Profile>;
  const links = Array.isArray(row.links)
    ? row.links
        .filter(
          (link): link is ProfileLink =>
            !!link &&
            typeof link === "object" &&
            typeof link.id === "string" &&
            typeof link.label === "string" &&
            typeof link.url === "string",
        )
        .slice(0, 12)
    : [];

  const typewriter_lines = Array.isArray(row.typewriter_lines)
    ? row.typewriter_lines
        .filter((line): line is string => typeof line === "string" && line.trim().length > 0)
        .slice(0, 10)
    : EMPTY_PROFILE.typewriter_lines;

  const default_volume = clampNumber(
    row.default_volume,
    EMPTY_PROFILE.default_volume,
    0,
    100,
  );

  const views_count = clampNumber(
    row.views_count,
    0,
    0,
    Number.MAX_SAFE_INTEGER,
  );

  const background_video_opacity = clampNumber(
    row.background_video_opacity,
    EMPTY_PROFILE.background_video_opacity,
    0,
    100,
  );

  const card_opacity = clampNumber(
    row.card_opacity,
    EMPTY_PROFILE.card_opacity,
    10,
    100,
  );

  return {
    ...EMPTY_PROFILE,
    ...row,
    id: "main",
    display_name: typeof row.display_name === "string" ? row.display_name : "",
    headline: typeof row.headline === "string" ? row.headline : "",
    bio: typeof row.bio === "string" ? row.bio : "",
    location: typeof row.location === "string" ? row.location : "",
    avatar_url: typeof row.avatar_url === "string" ? row.avatar_url : null,
    background_url:
      typeof row.background_url === "string" ? row.background_url : null,
    background_video_url:
      typeof row.background_video_url === "string"
        ? row.background_video_url
        : null,
    background_video_opacity,
    card_opacity,
    audio_url: typeof row.audio_url === "string" ? row.audio_url : null,
    audio_title:
      typeof row.audio_title === "string" && row.audio_title.trim()
        ? row.audio_title
        : EMPTY_PROFILE.audio_title,
    audio_artist: typeof row.audio_artist === "string" ? row.audio_artist : "",
    default_volume,
    click_to_enter_text:
      typeof row.click_to_enter_text === "string" && row.click_to_enter_text.trim()
        ? row.click_to_enter_text
        : EMPTY_PROFILE.click_to_enter_text,
    typewriter_lines:
      typewriter_lines.length > 0 ? typewriter_lines : EMPTY_PROFILE.typewriter_lines,
    enable_custom_cursor:
      typeof row.enable_custom_cursor === "boolean"
        ? row.enable_custom_cursor
        : EMPTY_PROFILE.enable_custom_cursor,
    enable_tilt:
      typeof row.enable_tilt === "boolean"
        ? row.enable_tilt
        : EMPTY_PROFILE.enable_tilt,
    enable_moon_badge:
      typeof row.enable_moon_badge === "boolean"
        ? row.enable_moon_badge
        : EMPTY_PROFILE.enable_moon_badge,
    moon_badge_title:
      typeof row.moon_badge_title === "string" && row.moon_badge_title.trim()
        ? row.moon_badge_title
        : EMPTY_PROFILE.moon_badge_title,
    enable_lunar_effects:
      typeof row.enable_lunar_effects === "boolean"
        ? row.enable_lunar_effects
        : EMPTY_PROFILE.enable_lunar_effects,
    card_border_effect:
      typeof row.card_border_effect === "string" &&
      ["none", "lunar_aurora", "neon_pulse", "rgb_flow", "cyber_glow"].includes(row.card_border_effect)
        ? (row.card_border_effect as CardBorderEffect)
        : EMPTY_PROFILE.card_border_effect,
    name_effect:
      typeof row.name_effect === "string" &&
      ["none", "lunar_shimmer", "rgb_wave", "neon_pulse", "cyber_glitch", "sparkle"].includes(row.name_effect)
        ? (row.name_effect as NameEffect)
        : EMPTY_PROFILE.name_effect,
    cursor_style:
      typeof row.cursor_style === "string" &&
      ["neon_dot", "crosshair", "lunar_crescent", "default"].includes(row.cursor_style)
        ? (row.cursor_style as CursorStyle)
        : EMPTY_PROFILE.cursor_style,
    cursor_trail:
      typeof row.cursor_trail === "string" &&
      ["none", "stardust", "ghost"].includes(row.cursor_trail)
        ? (row.cursor_trail as CursorTrail)
        : EMPTY_PROFILE.cursor_trail,
    enable_click_ripple:
      typeof row.enable_click_ripple === "boolean"
        ? row.enable_click_ripple
        : EMPTY_PROFILE.enable_click_ripple,
    views_count,
    discord_user_id:
      typeof row.discord_user_id === "string" &&
      /^\d{17,20}$/.test(row.discord_user_id)
        ? row.discord_user_id
        : null,
    discord_username:
      typeof row.discord_username === "string" ? row.discord_username : null,
    discord_global_name:
      typeof row.discord_global_name === "string"
        ? row.discord_global_name
        : null,
    discord_avatar_url:
      typeof row.discord_avatar_url === "string"
        ? row.discord_avatar_url
        : null,
    accent_color: isHexColor(row.accent_color)
      ? row.accent_color
      : EMPTY_PROFILE.accent_color,
    surface_color: isHexColor(row.surface_color)
      ? row.surface_color
      : EMPTY_PROFILE.surface_color,
    links,
    is_published: row.is_published !== false,
  };
}

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[\da-f]{6}$/i.test(value);
}

export function readableInk(backgroundColor: string): string {
  const channels = backgroundColor
    .slice(1)
    .match(/.{2}/g)
    ?.map((channel) => Number.parseInt(channel, 16) / 255);

  if (!channels || channels.length !== 3) return "#17213a";

  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  return luminance > 0.179 ? "#101113" : "#ffffff";
}

export function safeExternalUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") {
      return url.toString();
    }
  } catch {
    return null;
  }

  return null;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function hexToRgba(hex: string, alpha: number): string {
  const safeAlpha = Math.max(0, Math.min(1, Number.isFinite(alpha) ? alpha : 0.75));
  if (!hex || typeof hex !== "string") return `rgba(14, 16, 24, ${safeAlpha})`;
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (clean.length === 6 || clean.length === 8) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
      return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
    }
  }
  return `rgba(14, 16, 24, ${safeAlpha})`;
}

