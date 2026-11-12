"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Clock, Gamepad2, Headphones, Timer } from "lucide-react";
import {
  DiscordBadgeItem,
  type DiscordBadgeMode,
  resolveDiscordBadges,
} from "@/lib/discord-badges";

type DiscordPresenceProps = {
  discordUserId: string;
  fallbackUsername?: string | null;
  fallbackGlobalName?: string | null;
  fallbackAvatarUrl?: string | null;
  customBadges?: string[] | null;
  badgeMode?: DiscordBadgeMode;
};

export type LanyardSpotify = {
  track_id?: string | null;
  timestamps?: {
    start: number;
    end: number;
  } | null;
  song: string;
  artist: string;
  album: string;
  album_art_url?: string | null;
};

export type LanyardActivity = {
  id: string;
  name: string;
  type: number;
  state?: string;
  details?: string;
  application_id?: string;
  timestamps?: {
    start?: number;
    end?: number;
  };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
};

export type LanyardData = {
  discord_user: {
    id: string;
    username: string;
    avatar: string | null;
    global_name: string | null;
    discriminator?: string;
    public_flags?: number;
    flags?: number;
    premium_type?: number;
  };
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities: LanyardActivity[];
  listening_to_spotify: boolean;
  spotify: LanyardSpotify | null;
};

export type KnownGame = {
  id: string;
  matchNames: string[];
  applicationIds?: string[];
  brandColor: string;
  accentColor?: string;
  glowColor: string;
  borderRgba: string;
  pillBg: string;
  artBg: string;
  shortName: string;
  cardLabel: string;
  defaultDetails?: string;
  viewBox?: string;
  svgPath: string;
};

export const KNOWN_GAMES: KnownGame[] = [
  {
    id: "valorant",
    matchNames: ["valorant"],
    applicationIds: ["700136079562375218"],
    brandColor: "#ff4655",
    accentColor: "#00f2fe",
    glowColor: "rgba(255, 70, 85, 0.45)",
    borderRgba: "rgba(255, 70, 85, 0.45)",
    pillBg: "rgba(255, 70, 85, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(255, 70, 85, 0.35) 0%, rgba(15, 25, 35, 0.98) 75%)",
    shortName: "VALORANT",
    cardLabel: "PLAYING VALORANT",
    defaultDetails: "Riot Games",
    viewBox: "0 0 24 24",
    svgPath:
      "M23.792 2.152a.252.252 0 0 0-.098.083c-3.384 4.23-6.769 8.46-10.15 12.69-.107.093-.025.288.119.265 2.439.003 4.877 0 7.316.001a.66.66 0 0 0 .552-.25c.774-.967 1.55-1.934 2.324-2.903a.72.72 0 0 0 .144-.49c-.002-3.077 0-6.153-.003-9.23.016-.11-.1-.206-.204-.167zM.077 2.166c-.077.038-.074.132-.076.205.002 3.074.001 6.15.001 9.225a.679.679 0 0 0 .158.463l7.64 9.55c.12.152.308.25.505.247 2.455 0 4.91.003 7.365 0 .142.02.222-.174.116-.265C10.661 15.176 5.526 8.766.4 2.35c-.08-.094-.174-.272-.322-.184z",
  },
  {
    id: "league-of-legends",
    matchNames: ["league of legends", "league", "lol", "wild rift"],
    applicationIds: ["401518687463571456", "356860088107958273"],
    brandColor: "#c28f2c",
    accentColor: "#0ac8b9",
    glowColor: "rgba(194, 143, 44, 0.45)",
    borderRgba: "rgba(194, 143, 44, 0.45)",
    pillBg: "rgba(194, 143, 44, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(194, 143, 44, 0.35) 0%, rgba(10, 20, 40, 0.98) 75%)",
    shortName: "LEAGUE",
    cardLabel: "PLAYING LEAGUE OF LEGENDS",
    defaultDetails: "Riot Games",
    viewBox: "0 0 24 24",
    svgPath:
      "M1.912 0l1.212 2.474v19.053L1.912 24h14.73l1.337-4.682H8.33V0ZM12 1.516c-.913 0-1.798.112-2.648.312v1.74a9.738 9.738 0 0 1 2.648-.368c5.267 0 9.536 4.184 9.536 9.348a9.203 9.203 0 0 1-2.3 6.086l-.273.954-.602 2.112c2.952-1.993 4.89-5.335 4.89-9.122C23.25 6.468 18.213 1.516 12 1.516Zm0 2.673c-2.88 0-5.367 1.765-6.425 4.305l.006-.002v8.038l4.82-1.127V10.15a3.473 3.473 0 0 1 3.407-3.475c1.884 0 3.42 1.524 3.42 3.407 0 1.884-1.536 3.42-3.42 3.42h-.372v2.748h.372c3.393 0 6.168-2.763 6.168-6.168s-2.775-6.168-6.168-6.168Z",
  },
  {
    id: "counter-strike",
    matchNames: ["counter-strike", "counter strike", "cs:go", "csgo", "cs2", "cs 2"],
    applicationIds: ["738947347900727337", "401899760773070858"],
    brandColor: "#de9b35",
    accentColor: "#ffa000",
    glowColor: "rgba(222, 155, 53, 0.45)",
    borderRgba: "rgba(222, 155, 53, 0.45)",
    pillBg: "rgba(222, 155, 53, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(222, 155, 53, 0.35) 0%, rgba(20, 20, 25, 0.98) 75%)",
    shortName: "CS2",
    cardLabel: "PLAYING COUNTER-STRIKE 2",
    defaultDetails: "Valve",
    viewBox: "0 0 24 24",
    svgPath:
      "M21.71 3.234a.022.022 0 0 1-.022-.022c.001-.081.003-.37.004-.424 0-.129-.143-.183-.212-.083-.011.016-.146.212-.229.332a.024.024 0 0 1-.02.01h-6.55a.047.047 0 0 1-.047-.046l-.013-.177a.048.048 0 0 1 .056-.048l.335.032a.059.059 0 0 0 .062-.045l.244-.99a.048.048 0 0 0-.03-.054l-.227-.085a.043.043 0 0 1-.026-.03c-.041-.172-.377-1.323-1.993-1.581-.787-.125-1.302.21-1.577.478a1.594.1594 0 0 0-.302.41l-.096.212c-.008.016-.046.216-.046.234l.051.981a.109.109 0 0 0 .042.086l.355.153-.196.324a.055.055 0 0 1-.053.04s-.417.011-.623.019c-.385.016-1.244.486-1.877 1.839-.622 1.328-.724 1.55-.724 1.55a.074.074 0 0 1-.068.04l-.578.002c-.035 0-.074.028-.088.06l-.9 2.544c-.015.032-.006.081.017.108l.627.392a.059.059 0 0 1 .02.059l-.328.966c-.008.022-.016.042-.023.062l-.434.382a.106.106 0 0 0-.036.06l-.598 1.53a.063.063 0 0 1-.06.046l-.336.002a.163.163 0 0 0-.162.148l-.2 2.288a1.72 1.72 0 0 1-.016.121l-.158.908a.128.128 0 0 1-.033.055l-.558.426c-.256.244-.599.69-.767 1.002l-1.86 3.923c-.045.083-.081.227-.079.322l.132.235c.002.084-.032.456-.071.53l-.973 1.905a.098.098 0 0 0-.003.086l.031.07.093.186 1.891.003c.117.01.247-.14.25-.3l.103-1.297-.027-.195 3.606-4.232c.094-.115.222-.317.286-.45l1.719-3.79a.171.171 0 0 1 .1-.088l.108-.035a.17.17 0 0 1 .183.053c.15.18.504.781.676 1.031.143.208.85 1.23 1.158 1.568.085.092.348.198.466.27a.083.083 0 0 1 .029.112l-1.03 1.808-.455 2.136a.954.954 0 0 0-.035.152l-.412 1.483c.003.187-.141.286-.153.506l-.15 1.084a.058.058 0 0 0 .048.065l1.821.258c.071.011.14-.029.167-.095l1.248-3.045c.032-.078.026-.167-.016-.24l-.459-.792c-.043-.075-.039-.168.01-.239l1.411-2.057c.07-.102.193-.159.317-.147l2.128.216c.07.007.135-.027.167-.09l1.109-2.222c.045-.09.034-.199-.028-.278l-.872-1.121a.208.208 0 0 1-.044-.153l.115-1.579c.009-.126.082-.238.192-.294l1.637-.831c.078-.04.127-.12.132-.208l.061-1.105c.005-.094-.047-.182-.132-.221l-1.597-.738a.294.294 0 0 1-.163-.223l-.15-1.142c-.014-.11.036-.221.13-.272l1.638-.89a.213.213 0 0 0 .108-.198l-.053-1.637a.23.23 0 0 0-.11-.197l-.299-1.229Z",
  },
  {
    id: "minecraft",
    matchNames: ["minecraft", "lunar client", "badlion client", "feather client", "prism launcher"],
    applicationIds: ["432980957394370572", "788869150026268682"],
    brandColor: "#22c55e",
    accentColor: "#4ade80",
    glowColor: "rgba(34, 197, 94, 0.45)",
    borderRgba: "rgba(34, 197, 94, 0.45)",
    pillBg: "rgba(34, 197, 94, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(34, 197, 94, 0.35) 0%, rgba(10, 25, 15, 0.98) 75%)",
    shortName: "MINECRAFT",
    cardLabel: "PLAYING MINECRAFT",
    defaultDetails: "Mojang Studios",
    viewBox: "0 0 24 24",
    svgPath:
      "M4 4h16v16H4V4zm3 3v4h3V7H7zm7 0v4h3V7h-3zm-4 4h4v3h2v4h-2v-2h-4v2H8v-4h2v-3z",
  },
  {
    id: "gta",
    matchNames: ["grand theft auto", "gta v", "gta 5", "gta", "fivem", "redm"],
    applicationIds: ["356875086888632320", "382624125287399424"],
    brandColor: "#f59e0b",
    accentColor: "#22c55e",
    glowColor: "rgba(245, 158, 11, 0.45)",
    borderRgba: "rgba(245, 158, 11, 0.45)",
    pillBg: "rgba(245, 158, 11, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(245, 158, 11, 0.35) 0%, rgba(25, 20, 10, 0.98) 75%)",
    shortName: "GTA V",
    cardLabel: "PLAYING GTA V",
    defaultDetails: "Rockstar Games",
    viewBox: "0 0 24 24",
    svgPath:
      "M22.4 24h-5.225c-.117 0-.455-1.127-1.026-3.375c-1.982-6.909-3.124-10.946-3.417-12.12l3.37-3.325h.099q.681 2.13 6.299 18.768ZM12.342 7.084h-.048a3.382 3.385 0 0 1-.098-.492v-.098a102.619 102.715 0 0 1 3.272-3.275c.13.196.196.356.196.491v.05a140.694 140.826 0 0 1-3.322 3.324M5.994 10.9h-.05q1.004-3.178 1.223-3.275L14 3.702l-3.37 3.324h-.049a3.38 3.38 0 0 1-.098-.492v-.098a102.433 102.529 0 0 1 3.273-3.275c.13.196.196.356.196.491v.05a139.799 139.932 0 0 1-3.322 3.324h-.049q-.585 1.83-2.38 7.97ZM1.6 24h5.225c.117 0 .455-1.127 1.026-3.375c1.982-6.909 3.124-10.946 3.417-12.12L7.898 5.18H7.8q-.681 2.13-6.2 18.768Z",
  },
  {
    id: "fortnite",
    matchNames: ["fortnite", "fortnite battle royale"],
    brandColor: "#9d4edd",
    accentColor: "#00d2ff",
    glowColor: "rgba(157, 78, 221, 0.45)",
    borderRgba: "rgba(157, 78, 221, 0.45)",
    pillBg: "rgba(157, 78, 221, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(157, 78, 221, 0.35) 0%, rgba(20, 10, 30, 0.98) 75%)",
    shortName: "FORTNITE",
    cardLabel: "PLAYING FORTNITE",
    defaultDetails: "Epic Games",
    viewBox: "0 0 24 24",
    svgPath:
      "m15.767 14.171.097-5.05H12.4V5.197h3.99L16.872 0H7.128v24l5.271-.985V14.17z",
  },
  {
    id: "roblox",
    matchNames: ["roblox", "roblox player", "roblox studio"],
    applicationIds: ["495360135816937492"],
    brandColor: "#e11d48",
    accentColor: "#00a2ff",
    glowColor: "rgba(225, 29, 72, 0.45)",
    borderRgba: "rgba(225, 29, 72, 0.45)",
    pillBg: "rgba(225, 29, 72, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(225, 29, 72, 0.35) 0%, rgba(30, 10, 15, 0.98) 75%)",
    shortName: "ROBLOX",
    cardLabel: "PLAYING ROBLOX",
    defaultDetails: "Roblox",
    viewBox: "0 0 24 24",
    svgPath:
      "M18.926 23.998 0 18.892 5.075.002 24 5.108ZM15.348 10.09l-5.282-1.453-1.414 5.273 5.282 1.453z",
  },
  {
    id: "apex",
    matchNames: ["apex legends", "apex"],
    applicationIds: ["541484311354933258"],
    brandColor: "#dc2626",
    accentColor: "#ff7676",
    glowColor: "rgba(220, 38, 38, 0.45)",
    borderRgba: "rgba(220, 38, 38, 0.45)",
    pillBg: "rgba(220, 38, 38, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(220, 38, 38, 0.35) 0%, rgba(30, 10, 10, 0.98) 75%)",
    shortName: "APEX",
    cardLabel: "PLAYING APEX LEGENDS",
    defaultDetails: "Respawn Entertainment",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2L1 21h4.8l6.2-11.2L18.2 21H23L12 2zm0 7.8L7.8 17h8.4L12 9.8z",
  },
  {
    id: "steam",
    matchNames: ["steam"],
    brandColor: "#66c0f4",
    accentColor: "#1b2838",
    glowColor: "rgba(102, 192, 244, 0.45)",
    borderRgba: "rgba(102, 192, 244, 0.45)",
    pillBg: "rgba(102, 192, 244, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(102, 192, 244, 0.35) 0%, rgba(15, 25, 40, 0.98) 75%)",
    shortName: "STEAM",
    cardLabel: "PLAYING ON STEAM",
    defaultDetails: "Valve",
    viewBox: "0 0 24 24",
    svgPath:
      "M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.144-3.351-2.677l-6.405 2.622C2.43 21.79 6.87 24 11.979 24c6.627 0 12-5.373 12-12S18.606 0 11.979 0zM9.42 17.776c-1.382 0-2.503-1.121-2.503-2.503 0-1.382 1.121-2.503 2.503-2.503 1.382 0 2.503 1.121 2.503 2.503 0 1.382-1.121 2.503-2.503 2.503z",
  },
  {
    id: "call-of-duty",
    matchNames: [
      "call of duty",
      "cod",
      "warzone",
      "modern warfare",
      "black ops",
      "mw3",
      "mw2",
      "mw",
      "bo6",
      "bo4",
      "cold war",
      "vanguard",
    ],
    applicationIds: ["774640103738015744", "464528340795457536"],
    brandColor: "#f59e0b",
    accentColor: "#22c55e",
    glowColor: "rgba(245, 158, 11, 0.45)",
    borderRgba: "rgba(245, 158, 11, 0.45)",
    pillBg: "rgba(245, 158, 11, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(245, 158, 11, 0.35) 0%, rgba(20, 18, 10, 0.98) 75%)",
    shortName: "COD",
    cardLabel: "PLAYING CALL OF DUTY",
    defaultDetails: "Activision",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2L2 7v3l10-5 10 5V7L12 2zm0 6L4 12v3l8-4 8 4v-3l-8-5zm0 6l-6 3.5V20l6-3 6 3v-2.5L12 14z",
  },
  {
    id: "rainbow-six",
    matchNames: ["rainbow six", "rainbow 6", "siege", "r6s", "r6"],
    brandColor: "#00b4d8",
    accentColor: "#0284c7",
    glowColor: "rgba(0, 180, 216, 0.45)",
    borderRgba: "rgba(0, 180, 216, 0.45)",
    pillBg: "rgba(0, 180, 216, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(0, 180, 216, 0.35) 0%, rgba(10, 20, 30, 0.98) 75%)",
    shortName: "R6 SIEGE",
    cardLabel: "PLAYING RAINBOW SIX SIEGE",
    defaultDetails: "Ubisoft",
    viewBox: "0 0 24 24",
    svgPath: "M6 2h12v5h-7v3h7v12H6V2zm5 10h3v7h-3v-7z",
  },
  {
    id: "overwatch",
    matchNames: ["overwatch", "overwatch 2", "ow", "ow2"],
    applicationIds: ["356875883907055616"],
    brandColor: "#f97316",
    accentColor: "#fbbf24",
    glowColor: "rgba(249, 115, 22, 0.45)",
    borderRgba: "rgba(249, 115, 22, 0.45)",
    pillBg: "rgba(249, 115, 22, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(249, 115, 22, 0.35) 0%, rgba(30, 15, 10, 0.98) 75%)",
    shortName: "OVERWATCH 2",
    cardLabel: "PLAYING OVERWATCH 2",
    defaultDetails: "Blizzard Entertainment",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.2c1.78 0 3.44.51 4.85 1.39l-2.4 2.87a6.22 6.22 0 0 0-4.9 0L7.15 3.59A9.78 9.78 0 0 1 12 2.2zM4.09 5.38l2.58 2.62a6.3 6.3 0 0 0-1.89 3.86H1.91c.32-2.44 1.15-4.66 2.18-6.48zm15.82 0c1.03 1.82 1.86 4.04 2.18 6.48h-2.87a6.3 6.3 0 0 0-1.89-3.86l2.58-2.62zM6.86 13.86a5.14 5.14 0 0 0 10.28 0h3.04a8.18 8.18 0 0 1-16.36 0h3.04z",
  },
  {
    id: "rocket-league",
    matchNames: ["rocket league", "rocketleague", "rl"],
    applicationIds: ["395807125348286464"],
    brandColor: "#0088ff",
    accentColor: "#38bdf8",
    glowColor: "rgba(0, 136, 255, 0.45)",
    borderRgba: "rgba(0, 136, 255, 0.45)",
    pillBg: "rgba(0, 136, 255, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(0, 136, 255, 0.35) 0%, rgba(10, 20, 35, 0.98) 75%)",
    shortName: "ROCKET LEAGUE",
    cardLabel: "PLAYING ROCKET LEAGUE",
    defaultDetails: "Psyonix",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2L4 5v7c0 5 3.4 9.7 8 10.8 4.6-1.1 8-5.8 8-10.8V5l-8-3zm0 3.2c1.8 0 3.5 1.2 4.2 3.1-1.3 1.2-3 2-4.2 2s-2.9-.8-4.2-2c.7-1.9 2.4-3.1 4.2-3.1zm0 6.8c1.7 0 3.5 1 4.5 2.5-1.3 1.5-2.8 2.5-4.5 2.5s-3.2-1-4.5-2.5c1-1.5 2.8-2.5 4.5-2.5z",
  },
  {
    id: "rust",
    matchNames: ["rust"],
    brandColor: "#cd412b",
    accentColor: "#ea580c",
    glowColor: "rgba(205, 65, 43, 0.45)",
    borderRgba: "rgba(205, 65, 43, 0.45)",
    pillBg: "rgba(205, 65, 43, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(205, 65, 43, 0.35) 0%, rgba(30, 12, 10, 0.98) 75%)",
    shortName: "RUST",
    cardLabel: "PLAYING RUST",
    defaultDetails: "Facepunch Studios",
    viewBox: "0 0 24 24",
    svgPath:
      "M3 3v18h18V3H3zm4 3h10v2h-2v2h2v4h-2v2h2v2H7v-2h2v-2H7v-4h2V8H7V6zm3 4h4v4h-4v-4z",
  },
  {
    id: "fc-fifa",
    matchNames: [
      "ea sports fc",
      "ea sports fc 24",
      "ea sports fc 25",
      "ea fc",
      "fc 24",
      "fc 25",
      "fifa",
      "fifa 23",
      "fifa 22",
      "fifa 21",
    ],
    brandColor: "#10b981",
    accentColor: "#059669",
    glowColor: "rgba(16, 185, 129, 0.45)",
    borderRgba: "rgba(16, 185, 129, 0.45)",
    pillBg: "rgba(16, 185, 129, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(16, 185, 129, 0.35) 0%, rgba(10, 30, 20, 0.98) 75%)",
    shortName: "EA FC",
    cardLabel: "PLAYING EA SPORTS FC",
    defaultDetails: "EA Sports",
    viewBox: "0 0 24 24",
    svgPath: "M12 22L1 3h22L12 22zm0-5.2L18.4 6H5.6L12 16.8z",
  },
  {
    id: "cyberpunk",
    matchNames: ["cyberpunk", "cyberpunk 2077", "phantom liberty"],
    brandColor: "#fcee0a",
    accentColor: "#00f0ff",
    glowColor: "rgba(252, 238, 10, 0.45)",
    borderRgba: "rgba(252, 238, 10, 0.45)",
    pillBg: "rgba(252, 238, 10, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(252, 238, 10, 0.35) 0%, rgba(25, 25, 10, 0.98) 75%)",
    shortName: "CYBERPUNK",
    cardLabel: "PLAYING CYBERPUNK 2077",
    defaultDetails: "CD Projekt Red",
    viewBox: "0 0 24 24",
    svgPath:
      "M2 4l3 12 7 6 7-6 3-12-6 2-4-4-4 4-6-2zm5 5l5-3 5 3-2 5-3 2-3-2-2-5z",
  },
  {
    id: "elden-ring",
    matchNames: ["elden ring", "shadow of the erdtree"],
    brandColor: "#d4af37",
    accentColor: "#f59e0b",
    glowColor: "rgba(212, 175, 55, 0.45)",
    borderRgba: "rgba(212, 175, 55, 0.45)",
    pillBg: "rgba(212, 175, 55, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(212, 175, 55, 0.35) 0%, rgba(25, 20, 10, 0.98) 75%)",
    shortName: "ELDEN RING",
    cardLabel: "PLAYING ELDEN RING",
    defaultDetails: "FromSoftware",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2a6 6 0 0 0-6 6c0 1.9.9 3.6 2.3 4.7A7.96 7.96 0 0 0 4 18h2a6 6 0 0 1 6-6 6 6 0 0 1 6 6h2a7.96 7.96 0 0 0-4.3-5.3A6 6 0 0 0 18 8a6 6 0 0 0-6-6zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 10a6 6 0 0 0-4.5 2.1c1.2 1.2 2.8 1.9 4.5 1.9s3.3-.7 4.5-1.9A6 6 0 0 0 12 14z",
  },
  {
    id: "genshin",
    matchNames: ["genshin", "genshin impact"],
    brandColor: "#38bdf8",
    accentColor: "#818cf8",
    glowColor: "rgba(56, 189, 248, 0.45)",
    borderRgba: "rgba(56, 189, 248, 0.45)",
    pillBg: "rgba(56, 189, 248, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(56, 189, 248, 0.35) 0%, rgba(10, 20, 35, 0.98) 75%)",
    shortName: "GENSHIN",
    cardLabel: "PLAYING GENSHIN IMPACT",
    defaultDetails: "HoYoverse",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 0c0 6.627 5.373 12 12 12-6.627 0-12 5.373-12 12 0-6.627-5.373-12-12-12 6.627 0 12-5.373 12-12z",
  },
  {
    id: "star-rail",
    matchNames: ["honkai", "star rail", "hsr", "honkai: star rail"],
    brandColor: "#c084fc",
    accentColor: "#38bdf8",
    glowColor: "rgba(192, 132, 252, 0.45)",
    borderRgba: "rgba(192, 132, 252, 0.45)",
    pillBg: "rgba(192, 132, 252, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(192, 132, 252, 0.35) 0%, rgba(20, 15, 35, 0.98) 75%)",
    shortName: "STAR RAIL",
    cardLabel: "PLAYING HONKAI: STAR RAIL",
    defaultDetails: "HoYoverse",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 1l2.5 7.5L22 11l-6 5 2 8-6-4.5L6 24l2-8-6-5 7.5-2.5L12 1zm0 5l-1.3 4-4 .6 3 2.7-.9 4.2 3.2-2.3 3.2 2.3-.9-4.2 3-2.7-4-.6L12 6z",
  },
  {
    id: "dbd",
    matchNames: ["dead by daylight", "dbd"],
    brandColor: "#ef4444",
    accentColor: "#991b1b",
    glowColor: "rgba(239, 68, 68, 0.45)",
    borderRgba: "rgba(239, 68, 68, 0.45)",
    pillBg: "rgba(239, 68, 68, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(239, 68, 68, 0.35) 0%, rgba(30, 10, 10, 0.98) 75%)",
    shortName: "DBD",
    cardLabel: "PLAYING DEAD BY DAYLIGHT",
    defaultDetails: "Behaviour Interactive",
    viewBox: "0 0 24 24",
    svgPath:
      "M4 4l2 16h2L6 4H4zm4 0l1.5 16h2L9.5 4H8zm4 0l1 16h2L13 4H12zm4 0l.5 16h2L16.5 4H16zM2 15l19-7v2L2 17v-2z",
  },
  {
    id: "brawlhalla",
    matchNames: ["brawlhalla"],
    brandColor: "#f59e0b",
    accentColor: "#3b82f6",
    glowColor: "rgba(245, 158, 11, 0.45)",
    borderRgba: "rgba(245, 158, 11, 0.45)",
    pillBg: "rgba(245, 158, 11, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(245, 158, 11, 0.35) 0%, rgba(25, 20, 10, 0.98) 75%)",
    shortName: "BRAWLHALLA",
    cardLabel: "PLAYING BRAWLHALLA",
    defaultDetails: "Blue Mammoth Games",
    viewBox: "0 0 24 24",
    svgPath:
      "M3 3l5 5-2 2-5-5 2-2zm18 0l-5 5 2 2 5-5-2-2zM9 9l6 6-1.5 1.5-6-6L9 9zm6-6a5 5 0 0 1 5 5h-2a3 3 0 0 0-3-3V3zM4 8a5 5 0 0 1 5-5v2a3 3 0 0 0-3 3H4zm8 5a4 4 0 0 0-4 4v4h8v-4a4 4 0 0 0-4-4z",
  },
  {
    id: "terraria",
    matchNames: ["terraria"],
    brandColor: "#16a34a",
    accentColor: "#ca8a04",
    glowColor: "rgba(22, 163, 74, 0.45)",
    borderRgba: "rgba(22, 163, 74, 0.45)",
    pillBg: "rgba(22, 163, 74, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(22, 163, 74, 0.35) 0%, rgba(10, 25, 15, 0.98) 75%)",
    shortName: "TERRARIA",
    cardLabel: "PLAYING TERRARIA",
    defaultDetails: "Re-Logic",
    viewBox: "0 0 24 24",
    svgPath:
      "M10 2h4v2h-4V2zm-2 2h8v2H8V4zm-2 2h12v2H6V6zm-2 2h16v4H4V8zm2 4h12v2H6v-2zm4 2h4v8h-4v-8z",
  },
  {
    id: "tf2",
    matchNames: ["team fortress", "tf2", "team fortress 2"],
    brandColor: "#ea580c",
    accentColor: "#ca8a04",
    glowColor: "rgba(234, 88, 12, 0.45)",
    borderRgba: "rgba(234, 88, 12, 0.45)",
    pillBg: "rgba(234, 88, 12, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(234, 88, 12, 0.35) 0%, rgba(30, 15, 10, 0.98) 75%)",
    shortName: "TF2",
    cardLabel: "PLAYING TEAM FORTRESS 2",
    defaultDetails: "Valve",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1 2.05c4.71.49 8.46 4.24 8.95 8.95H13V2.05zm-2 0V11H2.05c.49-4.71 4.24-8.46 8.95-8.95zM2.05 13H11v8.95c-4.71-.49-8.46-4.24-8.95-8.95zm10.95 8.95V13h8.95c-.49 4.71-4.24 8.46-8.95 8.95z",
  },
  {
    id: "dota-2",
    matchNames: ["dota", "dota 2", "dota2"],
    brandColor: "#dc2626",
    accentColor: "#f97316",
    glowColor: "rgba(220, 38, 38, 0.45)",
    borderRgba: "rgba(220, 38, 38, 0.45)",
    pillBg: "rgba(220, 38, 38, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(220, 38, 38, 0.35) 0%, rgba(30, 10, 10, 0.98) 75%)",
    shortName: "DOTA 2",
    cardLabel: "PLAYING DOTA 2",
    defaultDetails: "Valve",
    viewBox: "0 0 24 24",
    svgPath:
      "M2 2v20h20V2H2zm3.5 2.5h3.2L5.5 14V4.5zm13 15h-3.2l3.2-9.5v9.5zM7.2 18.5l9.6-13h2.7l-9.6 13H7.2z",
  },
  {
    id: "destiny-2",
    matchNames: ["destiny", "destiny 2"],
    brandColor: "#f8fafc",
    accentColor: "#38bdf8",
    glowColor: "rgba(248, 250, 252, 0.45)",
    borderRgba: "rgba(248, 250, 252, 0.45)",
    pillBg: "rgba(248, 250, 252, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(248, 250, 252, 0.35) 0%, rgba(20, 25, 35, 0.98) 75%)",
    shortName: "DESTINY 2",
    cardLabel: "PLAYING DESTINY 2",
    defaultDetails: "Bungie",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 1.5L8.5 7.5h7L12 1.5zm-1.8 8L3.5 19.5h5.5l3.2-6.5-2-3.5zm3.6 0l2 3.5 3.2 6.5h5.5L13.8 9.5z",
  },
  {
    id: "warframe",
    matchNames: ["warframe"],
    brandColor: "#38bdf8",
    accentColor: "#a855f7",
    glowColor: "rgba(56, 189, 248, 0.45)",
    borderRgba: "rgba(56, 189, 248, 0.45)",
    pillBg: "rgba(56, 189, 248, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(56, 189, 248, 0.35) 0%, rgba(10, 20, 35, 0.98) 75%)",
    shortName: "WARFRAME",
    cardLabel: "PLAYING WARFRAME",
    defaultDetails: "Digital Extremes",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2L4 9v4l8 7 8-7V9l-8-7zm0 3.5l5 4.5-5 4.5-5-4.5 5-4.5zm0 10.5l-4-3.5h8l-4 3.5z",
  },
  {
    id: "pubg",
    matchNames: ["pubg", "playerunknown", "battlegrounds"],
    brandColor: "#f59e0b",
    accentColor: "#d97706",
    glowColor: "rgba(245, 158, 11, 0.45)",
    borderRgba: "rgba(245, 158, 11, 0.45)",
    pillBg: "rgba(245, 158, 11, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(245, 158, 11, 0.35) 0%, rgba(25, 20, 10, 0.98) 75%)",
    shortName: "PUBG",
    cardLabel: "PLAYING PUBG",
    defaultDetails: "KRAFTON",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2C7 2 3 6 3 11v7h3v4h12v-4h3v-7c0-5-4-9-9-9zm-5 8h10v3H7v-3zm2 5h6v2H9v-2z",
  },
  {
    id: "palworld",
    matchNames: ["palworld"],
    brandColor: "#06b6d4",
    accentColor: "#3b82f6",
    glowColor: "rgba(6, 182, 212, 0.45)",
    borderRgba: "rgba(6, 182, 212, 0.45)",
    pillBg: "rgba(6, 182, 212, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(6, 182, 212, 0.35) 0%, rgba(10, 25, 30, 0.98) 75%)",
    shortName: "PALWORLD",
    cardLabel: "PLAYING PALWORLD",
    defaultDetails: "Pocketpair",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 3a7 7 0 0 1 6.3 4h-4.1l-2.2-2.5V5zm-1 0v1.5L8.8 9H4.7A7 7 0 0 1 11 5zm-7 6h4.5l1.5 2-1.5 2H4a7 7 0 0 1 0-4zm7 8a7 7 0 0 1-6.3-4h4.1l2.2 2.5V19zm1 0v-1.5l2.2-2.5h4.1a7 7 0 0 1-6.3 4zm7-6h-4.5l-1.5-2 1.5-2H20a7 7 0 0 1 0 4z",
  },
  {
    id: "helldivers-2",
    matchNames: ["helldivers", "helldivers 2", "helldivers ii"],
    brandColor: "#eab308",
    accentColor: "#38bdf8",
    glowColor: "rgba(234, 179, 8, 0.45)",
    borderRgba: "rgba(234, 179, 8, 0.45)",
    pillBg: "rgba(234, 179, 8, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(234, 179, 8, 0.35) 0%, rgba(25, 22, 10, 0.98) 75%)",
    shortName: "HELLDIVERS 2",
    cardLabel: "SPREADING DEMOCRACY",
    defaultDetails: "Arrowhead Game Studios",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2l-7 4v6c0 5 3 9 7 10 4-1 7-5 7-10V6l-7-4zm0 3.5l4 2.5v3.5l-4-2-4 2V8l4-2.5zM9 13a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-5 4h4v1.5h-4V17z",
  },
  {
    id: "deadlock",
    matchNames: ["deadlock", "project 8"],
    brandColor: "#f97316",
    accentColor: "#eab308",
    glowColor: "rgba(249, 115, 22, 0.45)",
    borderRgba: "rgba(249, 115, 22, 0.45)",
    pillBg: "rgba(249, 115, 22, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(249, 115, 22, 0.35) 0%, rgba(30, 15, 10, 0.98) 75%)",
    shortName: "DEADLOCK",
    cardLabel: "PLAYING DEADLOCK",
    defaultDetails: "Valve",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2L2 20h20L12 2zm0 4.5l6.5 11.5H5.5L12 6.5zm0 4a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z",
  },
  {
    id: "the-finals",
    matchNames: ["the finals", "thefinals"],
    brandColor: "#ef4444",
    accentColor: "#eab308",
    glowColor: "rgba(239, 68, 68, 0.45)",
    borderRgba: "rgba(239, 68, 68, 0.45)",
    pillBg: "rgba(239, 68, 68, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(239, 68, 68, 0.35) 0%, rgba(30, 10, 10, 0.98) 75%)",
    shortName: "THE FINALS",
    cardLabel: "PLAYING THE FINALS",
    defaultDetails: "Embark Studios",
    viewBox: "0 0 24 24",
    svgPath: "M12 2L1 21h22L12 2zm0 5l6.5 11.5h-13L12 7zm-2 4h4v5h-4v-5z",
  },
  {
    id: "osu",
    matchNames: ["osu!", "osu"],
    brandColor: "#ec4899",
    accentColor: "#f43f5e",
    glowColor: "rgba(236, 72, 153, 0.45)",
    borderRgba: "rgba(236, 72, 153, 0.45)",
    pillBg: "rgba(236, 72, 153, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(236, 72, 153, 0.35) 0%, rgba(30, 10, 25, 0.98) 75%)",
    shortName: "OSU!",
    cardLabel: "CLICKING CIRCLES",
    defaultDetails: "ppy",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17zm0 3a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z",
  },
  {
    id: "geometry-dash",
    matchNames: ["geometry dash", "gd"],
    brandColor: "#22c55e",
    accentColor: "#eab308",
    glowColor: "rgba(34, 197, 94, 0.45)",
    borderRgba: "rgba(34, 197, 94, 0.45)",
    pillBg: "rgba(34, 197, 94, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(34, 197, 94, 0.35) 0%, rgba(10, 25, 15, 0.98) 75%)",
    shortName: "GEOMETRY DASH",
    cardLabel: "PLAYING GEOMETRY DASH",
    defaultDetails: "RobTop Games",
    viewBox: "0 0 24 24",
    svgPath:
      "M3 3h18v18H3V3zm3 3v12h12V6H6zm2 2h3v3H8V8zm5 0h3v3h-3V8zm-5 5h8v2H8v-2z",
  },
  {
    id: "world-of-warcraft",
    matchNames: ["world of warcraft", "warcraft", "wow"],
    brandColor: "#f59e0b",
    accentColor: "#3b82f6",
    glowColor: "rgba(245, 158, 11, 0.45)",
    borderRgba: "rgba(245, 158, 11, 0.45)",
    pillBg: "rgba(245, 158, 11, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(245, 158, 11, 0.35) 0%, rgba(25, 20, 10, 0.98) 75%)",
    shortName: "WOW",
    cardLabel: "PLAYING WORLD OF WARCRAFT",
    defaultDetails: "Blizzard Entertainment",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-4.5 5l2 7 2-5 1 2.5 1-2.5 2 5 2-7h2l-3 10h-2l-2-5-2 5H7L4 7h3.5z",
  },
  {
    id: "diablo",
    matchNames: ["diablo", "diablo iv", "diablo 4", "diablo 3", "diablo ii"],
    brandColor: "#dc2626",
    accentColor: "#7f1d1d",
    glowColor: "rgba(220, 38, 38, 0.45)",
    borderRgba: "rgba(220, 38, 38, 0.45)",
    pillBg: "rgba(220, 38, 38, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(220, 38, 38, 0.35) 0%, rgba(30, 10, 10, 0.98) 75%)",
    shortName: "DIABLO",
    cardLabel: "PLAYING DIABLO",
    defaultDetails: "Blizzard Entertainment",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2l2.5 6.5H21l-5 4 2 6.5-6-4.5-6 4.5 2-6.5-5-4h6.5L12 2zm0 5l-1.3 3.5H7.5l2.7 2-1 3.5 2.8-2 2.8 2-1-3.5 2.7-2h-3.2L12 7z",
  },
  {
    id: "monster-hunter",
    matchNames: ["monster hunter", "monster hunter world", "monster hunter rise", "monster hunter wilds", "mhw"],
    brandColor: "#10b981",
    accentColor: "#eab308",
    glowColor: "rgba(16, 185, 129, 0.45)",
    borderRgba: "rgba(16, 185, 129, 0.45)",
    pillBg: "rgba(16, 185, 129, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(16, 185, 129, 0.35) 0%, rgba(10, 30, 20, 0.98) 75%)",
    shortName: "MONSTER HUNTER",
    cardLabel: "HUNTING MONSTERS",
    defaultDetails: "Capcom",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2C8 6 4 11 4 17a8 8 0 0 0 16 0c0-6-4-11-8-15zm-2 8a2 2 0 1 1 4 0v4a2 2 0 1 1-4 0v-4zm-3 3a1.5 1.5 0 1 1 3 0v3a1.5 1.5 0 1 1-3 0v-3zm8 0a1.5 1.5 0 1 1 3 0v3a1.5 1.5 0 1 1-3 0v-3z",
  },
  {
    id: "lethal-company",
    matchNames: ["lethal company"],
    brandColor: "#f97316",
    accentColor: "#eab308",
    glowColor: "rgba(249, 115, 22, 0.45)",
    borderRgba: "rgba(249, 115, 22, 0.45)",
    pillBg: "rgba(249, 115, 22, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(249, 115, 22, 0.35) 0%, rgba(30, 15, 10, 0.98) 75%)",
    shortName: "LETHAL CO.",
    cardLabel: "FOR THE COMPANY",
    defaultDetails: "Zeekerss",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2a8 8 0 0 0-8 8v5a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-5a8 8 0 0 0-8-8zm-3 8a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm6 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm-5 7h4v2h-4v-2z",
  },
  {
    id: "among-us",
    matchNames: ["among us", "amongus"],
    brandColor: "#ef4444",
    accentColor: "#38bdf8",
    glowColor: "rgba(239, 68, 68, 0.45)",
    borderRgba: "rgba(239, 68, 68, 0.45)",
    pillBg: "rgba(239, 68, 68, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(239, 68, 68, 0.35) 0%, rgba(30, 10, 10, 0.98) 75%)",
    shortName: "AMONG US",
    cardLabel: "PLAYING AMONG US",
    defaultDetails: "Innersloth",
    viewBox: "0 0 24 24",
    svgPath:
      "M10 2a6 6 0 0 0-6 6v10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2h2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V8a6 6 0 0 0-6-6zm4 6a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3h-3a3 3 0 0 1-3-3v-1a3 3 0 0 1 3-3h3zM2 9a1 1 0 0 1 1-1h1v9H3a1 1 0 0 1-1-1V9z",
  },
  {
    id: "phasmophobia",
    matchNames: ["phasmophobia", "phasmo"],
    brandColor: "#06b6d4",
    accentColor: "#a855f7",
    glowColor: "rgba(6, 182, 212, 0.45)",
    borderRgba: "rgba(6, 182, 212, 0.45)",
    pillBg: "rgba(6, 182, 212, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(6, 182, 212, 0.35) 0%, rgba(10, 25, 30, 0.98) 75%)",
    shortName: "PHASMOPHOBIA",
    cardLabel: "GHOST HUNTING",
    defaultDetails: "Kinetic Games",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2a7 7 0 0 0-7 7v11l3-2 3 2 3-2 3 2 3-2v-9a7 7 0 0 0-7-7zm-2 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm4 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-2 5a2 2 0 0 1 2 2h-4a2 2 0 0 1 2-2z",
  },
  {
    id: "sea-of-thieves",
    matchNames: ["sea of thieves", "sot"],
    brandColor: "#14b8a6",
    accentColor: "#f59e0b",
    glowColor: "rgba(20, 184, 166, 0.45)",
    borderRgba: "rgba(20, 184, 166, 0.45)",
    pillBg: "rgba(20, 184, 166, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(20, 184, 166, 0.35) 0%, rgba(10, 30, 25, 0.98) 75%)",
    shortName: "SEA OF THIEVES",
    cardLabel: "SAILING THE SEAS",
    defaultDetails: "Rare",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2a8 8 0 0 0-8 8c0 3 1.7 5.7 4.2 7l-.2 3h8l-.2-3c2.5-1.3 4.2-4 4.2-7a8 8 0 0 0-8-8zm-3 7a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-4 6h2v2h-2v-2z",
  },
  {
    id: "fallout",
    matchNames: ["fallout", "fallout 4", "fallout 76", "fallout: new vegas", "fallout new vegas", "fallout 3"],
    brandColor: "#3b82f6",
    accentColor: "#eab308",
    glowColor: "rgba(59, 130, 246, 0.45)",
    borderRgba: "rgba(59, 130, 246, 0.45)",
    pillBg: "rgba(59, 130, 246, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(59, 130, 246, 0.35) 0%, rgba(10, 20, 35, 0.98) 75%)",
    shortName: "FALLOUT",
    cardLabel: "EXPLORING WASTELAND",
    defaultDetails: "Bethesda Game Studios",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 3a7 7 0 0 1 7 7 7 7 0 0 1-7 7 7 7 0 0 1-7-7 7 7 0 0 1 7-7zm0 2.5a4.5 4.5 0 1 0 4.5 4.5A4.5 4.5 0 0 0 12 7.5z",
  },
  {
    id: "baldurs-gate",
    matchNames: ["baldur's gate", "baldurs gate", "bg3", "baldur's gate 3"],
    brandColor: "#e11d48",
    accentColor: "#f59e0b",
    glowColor: "rgba(225, 29, 72, 0.45)",
    borderRgba: "rgba(225, 29, 72, 0.45)",
    pillBg: "rgba(225, 29, 72, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(225, 29, 72, 0.35) 0%, rgba(30, 10, 15, 0.98) 75%)",
    shortName: "BG3",
    cardLabel: "PLAYING BALDUR'S GATE 3",
    defaultDetails: "Larian Studios",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2L2 7v10l10 5 10-5V7L12 2zm0 3.2L18.5 8 12 11.5 5.5 8 12 5.2zM4.5 9.5l6.5 3.5v7l-6.5-3.2v-7.3zm15 0v7.3l-6.5 3.2v-7l6.5-3.5z",
  },
  {
    id: "tarkov",
    matchNames: ["escape from tarkov", "tarkov", "eft"],
    brandColor: "#94a3b8",
    accentColor: "#f59e0b",
    glowColor: "rgba(148, 163, 184, 0.45)",
    borderRgba: "rgba(148, 163, 184, 0.45)",
    pillBg: "rgba(148, 163, 184, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(148, 163, 184, 0.35) 0%, rgba(20, 25, 30, 0.98) 75%)",
    shortName: "TARKOV",
    cardLabel: "RAIDING IN TARKOV",
    defaultDetails: "Battlestate Games",
    viewBox: "0 0 24 24",
    svgPath:
      "M11 2h2v3h-2V2zm0 17h2v3h-2v-3zM2 11h3v2H2v-2zm17 0h3v2h-3v-2zM12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm-1 3h2v2h-2v-2z",
  },
  {
    id: "witcher",
    matchNames: ["the witcher", "witcher 3", "wild hunt", "witcher"],
    brandColor: "#dc2626",
    accentColor: "#94a3b8",
    glowColor: "rgba(220, 38, 38, 0.45)",
    borderRgba: "rgba(220, 38, 38, 0.45)",
    pillBg: "rgba(220, 38, 38, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(220, 38, 38, 0.35) 0%, rgba(30, 10, 10, 0.98) 75%)",
    shortName: "THE WITCHER",
    cardLabel: "PLAYING THE WITCHER",
    defaultDetails: "CD Projekt Red",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2L4 7l2 8 6 5 6-5 2-8-8-5zm0 3.5l5 3.2-1.3 5-3.7 3.1-3.7-3.1-1.3-5 5-3.2zm-2 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm4 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z",
  },
  {
    id: "red-dead",
    matchNames: [
      "red dead redemption",
      "red dead redemption 2",
      "rdr2",
      "rdr 2",
      "red dead",
    ],
    brandColor: "#dc2626",
    accentColor: "#f59e0b",
    glowColor: "rgba(220, 38, 38, 0.45)",
    borderRgba: "rgba(220, 38, 38, 0.45)",
    pillBg: "rgba(220, 38, 38, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(220, 38, 38, 0.35) 0%, rgba(30, 10, 10, 0.98) 75%)",
    shortName: "RDR2",
    cardLabel: "OUTLAW FOR LIFE",
    defaultDetails: "Rockstar Games",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2l2.4 5 5.6.8-4 4 1 5.6-5-2.7-5 2.7 1-5.6-4-4 5.6-.8L12 2zm0 4.2l-1.3 2.7-3 .4 2.2 2.1-.5 3 2.6-1.4 2.6 1.4-.5-3 2.2-2.1-3-.4L12 6.2z",
  },
  {
    id: "hollow-knight",
    matchNames: ["hollow knight", "silksong", "hollowknight"],
    brandColor: "#94a3b8",
    accentColor: "#38bdf8",
    glowColor: "rgba(148, 163, 184, 0.45)",
    borderRgba: "rgba(148, 163, 184, 0.45)",
    pillBg: "rgba(148, 163, 184, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(148, 163, 184, 0.35) 0%, rgba(15, 20, 30, 0.98) 75%)",
    shortName: "HOLLOW KNIGHT",
    cardLabel: "EXPLORING HALLOWNEST",
    defaultDetails: "Team Cherry",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2C8 2 4 6 4 11c0 4 2.5 7.5 6 9.2V22h4v-1.8c3.5-1.7 6-5.2 6-9.2 0-5-4-9-8-9zm-3 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4z",
  },
  {
    id: "stardew-valley",
    matchNames: ["stardew valley", "stardew"],
    brandColor: "#22c55e",
    accentColor: "#f59e0b",
    glowColor: "rgba(34, 197, 94, 0.45)",
    borderRgba: "rgba(34, 197, 94, 0.45)",
    pillBg: "rgba(34, 197, 94, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(34, 197, 94, 0.35) 0%, rgba(10, 25, 15, 0.98) 75%)",
    shortName: "STARDEW",
    cardLabel: "FARMING IN VALLEY",
    defaultDetails: "ConcernedApe",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2c-4 0-7 3-7 7 0 2.5 1.5 5 3.5 6.5V20h7v-4.5c2-1.5 3.5-4 3.5-6.5 0-4-3-7-7-7zm-2 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm4 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-2 5a3 3 0 0 1-2.8-2h5.6a3 3 0 0 1-2.8 2z",
  },
  {
    id: "garrys-mod",
    matchNames: ["garry's mod", "garrys mod", "gmod"],
    brandColor: "#0284c7",
    accentColor: "#38bdf8",
    glowColor: "rgba(2, 132, 199, 0.45)",
    borderRgba: "rgba(2, 132, 199, 0.45)",
    pillBg: "rgba(2, 132, 199, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(2, 132, 199, 0.35) 0%, rgba(10, 20, 35, 0.98) 75%)",
    shortName: "GMOD",
    cardLabel: "SANDBOXING IN GMOD",
    defaultDetails: "Facepunch Studios",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14h-3a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3h5v3h-5v2h5v3z",
  },
  {
    id: "ark",
    matchNames: [
      "ark: survival evolved",
      "ark: survival ascended",
      "ark survival",
      "ark",
    ],
    brandColor: "#10b981",
    accentColor: "#06b6d4",
    glowColor: "rgba(16, 185, 129, 0.45)",
    borderRgba: "rgba(16, 185, 129, 0.45)",
    pillBg: "rgba(16, 185, 129, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(16, 185, 129, 0.35) 0%, rgba(10, 30, 20, 0.98) 75%)",
    shortName: "ARK",
    cardLabel: "SURVIVING IN ARK",
    defaultDetails: "Studio Wildcard",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2L2 21h20L12 2zm0 4.5l6.5 11.5h-13L12 6.5zm-1 5h2v4h-2v-4z",
  },
  {
    id: "forza",
    matchNames: [
      "forza horizon",
      "forza horizon 5",
      "forza horizon 4",
      "forza motorsport",
      "forza",
    ],
    brandColor: "#ec4899",
    accentColor: "#f59e0b",
    glowColor: "rgba(236, 72, 153, 0.45)",
    borderRgba: "rgba(236, 72, 153, 0.45)",
    pillBg: "rgba(236, 72, 153, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(236, 72, 153, 0.35) 0%, rgba(30, 10, 25, 0.98) 75%)",
    shortName: "FORZA",
    cardLabel: "RACING IN FORZA",
    defaultDetails: "Playground Games",
    viewBox: "0 0 24 24",
    svgPath: "M3 4h18l-3 16H6L3 4zm5 3l1.5 8h5l1.5-8H8z",
  },
  {
    id: "euro-truck",
    matchNames: [
      "euro truck simulator",
      "euro truck simulator 2",
      "ets2",
      "ets 2",
      "american truck simulator",
      "ats",
    ],
    brandColor: "#f59e0b",
    accentColor: "#ef4444",
    glowColor: "rgba(245, 158, 11, 0.45)",
    borderRgba: "rgba(245, 158, 11, 0.45)",
    pillBg: "rgba(245, 158, 11, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(245, 158, 11, 0.35) 0%, rgba(25, 20, 10, 0.98) 75%)",
    shortName: "ETS2",
    cardLabel: "HAULING CARGO",
    defaultDetails: "SCS Software",
    viewBox: "0 0 24 24",
    svgPath:
      "M1 4v13h2a3 3 0 0 0 6 0h6a3 3 0 0 0 6 0h2v-6l-3-7H1zm5 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm12 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM3 6h11v5H3V6zm13 2h3.5l1.8 3H16V8z",
  },
  {
    id: "hearts-of-iron",
    matchNames: ["hearts of iron", "hearts of iron iv", "hoi4", "hoi 4"],
    brandColor: "#64748b",
    accentColor: "#f59e0b",
    glowColor: "rgba(100, 116, 139, 0.45)",
    borderRgba: "rgba(100, 116, 139, 0.45)",
    pillBg: "rgba(100, 116, 139, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(100, 116, 139, 0.35) 0%, rgba(20, 25, 30, 0.98) 75%)",
    shortName: "HOI4",
    cardLabel: "STRATEGY IN HOI4",
    defaultDetails: "Paradox Interactive",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2L3 7v10l9 5 9-5V7l-9-5zm0 3.3L18 9v6l-6 3.3L6 15V9l6-3.7z",
  },
  {
    id: "half-life",
    matchNames: ["half-life", "half life", "half-life 2", "black mesa"],
    brandColor: "#f97316",
    accentColor: "#eab308",
    glowColor: "rgba(249, 115, 22, 0.45)",
    borderRgba: "rgba(249, 115, 22, 0.45)",
    pillBg: "rgba(249, 115, 22, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(249, 115, 22, 0.35) 0%, rgba(30, 15, 10, 0.98) 75%)",
    shortName: "HALF-LIFE",
    cardLabel: "PLAYING HALF-LIFE",
    defaultDetails: "Valve",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 4h2l-3 9h-2l-1.5-4-1.5 4H5l3-9h2l1 3 1-3z",
  },
  {
    id: "assetto-corsa",
    matchNames: ["assetto corsa", "assetto corsa competizione", "acc"],
    brandColor: "#ef4444",
    accentColor: "#f8fafc",
    glowColor: "rgba(239, 68, 68, 0.45)",
    borderRgba: "rgba(239, 68, 68, 0.45)",
    pillBg: "rgba(239, 68, 68, 0.15)",
    artBg: "radial-gradient(circle at 50% 35%, rgba(239, 68, 68, 0.35) 0%, rgba(30, 10, 10, 0.98) 75%)",
    shortName: "ASSETTO CORSA",
    cardLabel: "SIM RACING",
    defaultDetails: "Kunos Simulazioni",
    viewBox: "0 0 24 24",
    svgPath:
      "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 3a7 7 0 1 1-7 7 7 7 0 0 1 7-7zm0 2.5a4.5 4.5 0 1 0 4.5 4.5A4.5 4.5 0 0 0 12 7.5z",
  },
];

export function getGameMonogram(name?: string): string {
  if (!name) return "GM";
  const clean = name.replace(/[^\p{L}\p{N}\s]/gu, " ").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const meaningful = parts.filter(
      (p) =>
        !["of", "the", "and", "in", "a", "an", "for", "to"].includes(
          p.toLowerCase(),
        ),
    );
    const chosen = meaningful.length >= 2 ? meaningful : parts;
    return (chosen[0].slice(0, 1) + chosen[1].slice(0, 1)).toUpperCase();
  }
  if (clean.length >= 2) {
    return clean.slice(0, 2).toUpperCase();
  }
  return (clean.slice(0, 1) || "G").toUpperCase();
}

export function generateTrackWaveform(seedStr: string, barCount = 36): number[] {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }

  const bars: number[] = [];
  for (let i = 0; i < barCount; i++) {
    const t = i / Math.max(1, barCount - 1);
    const envelope = Math.sin(t * Math.PI);
    const pseudo = Math.abs(Math.sin((hash + (i + 1) * 137.5) * 0.1));
    const secondary = Math.abs(Math.cos(i * 0.75 + ((hash >> 3) % 7)));
    const raw = 0.22 + 0.48 * envelope + 0.22 * pseudo + 0.08 * secondary;
    const clamped = Math.max(0.18, Math.min(1.0, Number(raw.toFixed(3))));
    bars.push(clamped);
  }
  return bars;
}

function matchesName(normalizedName: string, match: string): boolean {
  if (normalizedName === match) return true;

  // Exact token match (split on non-alphanumeric separators)
  const tokens = normalizedName.split(/[^a-z0-9]+/i).filter(Boolean);
  if (tokens.includes(match)) return true;

  // Boundary-isolated match to prevent subword false matches (e.g. "trust" matching "rust" or "steamer" matching "steam")
  const escaped = match.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
  return pattern.test(normalizedName);
}

export function getKnownGame(
  name?: string,
  applicationId?: string,
): KnownGame | null {
  if (!name && !applicationId) return null;

  const normalized = (name || "").toLowerCase().trim();

  if (applicationId) {
    for (const game of KNOWN_GAMES) {
      if (game.applicationIds?.includes(applicationId)) {
        return game;
      }
    }
  }

  if (!normalized) return null;

  let bestMatch: { game: KnownGame; matchLength: number; exact: boolean } | null = null;

  for (const game of KNOWN_GAMES) {
    for (const match of game.matchNames) {
      if (matchesName(normalized, match)) {
        const isExact = normalized === match;
        const matchLength = match.length;
        if (
          !bestMatch ||
          (isExact && !bestMatch.exact) ||
          (!bestMatch.exact && matchLength > bestMatch.matchLength)
        ) {
          bestMatch = { game, matchLength, exact: isExact };
        }
      }
    }
  }

  return bestMatch ? bestMatch.game : null;
}

export function findPrimaryGameActivity(
  activities?: LanyardActivity[],
): LanyardActivity | null {
  if (!activities || !Array.isArray(activities) || activities.length === 0) {
    return null;
  }

  const candidates = activities.filter((a) => {
    if (!a || !a.name) return false;
    if (a.type === 2 || a.type === 4) return false;
    if (a.name.toLowerCase() === "spotify") return false;
    return a.type === 0 || a.type === 1 || a.type === 5;
  });

  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  return candidates.slice().sort((a, b) => {
    const aKnown = Boolean(getKnownGame(a.name, a.application_id));
    const bKnown = Boolean(getKnownGame(b.name, b.application_id));
    if (aKnown && !bKnown) return -1;
    if (!aKnown && bKnown) return 1;

    const aHasAssets = Boolean(a.assets?.large_image || a.assets?.small_image);
    const bHasAssets = Boolean(b.assets?.large_image || b.assets?.small_image);
    if (aHasAssets && !bHasAssets) return -1;
    if (!aHasAssets && bHasAssets) return 1;

    const aHasTime = Boolean(a.timestamps?.start || a.timestamps?.end);
    const bHasTime = Boolean(b.timestamps?.start || b.timestamps?.end);
    if (aHasTime && !bHasTime) return -1;
    if (!aHasTime && bHasTime) return 1;

    return 0;
  })[0];
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function formatElapsedHuman(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours} sa ${minutes} dk` : `${hours} sa`;
  }
  if (minutes > 0) {
    return `${minutes} dk`;
  }
  return `${totalSeconds} sn`;
}

export function resolveActivityAssetUrl(
  applicationId?: string,
  assetKey?: string | null,
  size: number = 256,
): string | null {
  if (!assetKey) return null;

  if (assetKey.startsWith("http://") || assetKey.startsWith("https://")) {
    return assetKey;
  }

  if (assetKey.startsWith("mp:")) {
    return `https://media.discordapp.net/${assetKey.slice(3)}`;
  }

  if (assetKey.startsWith("external/")) {
    return `https://media.discordapp.net/${assetKey}`;
  }

  if (assetKey.startsWith("spotify:")) {
    return `https://i.scdn.co/image/${assetKey.slice(8)}`;
  }

  if (applicationId) {
    const hasExt = /\.(png|jpe?g|webp|gif)$/i.test(assetKey);
    const suffix = hasExt ? "" : ".webp";
    return `https://cdn.discordapp.com/app-assets/${applicationId}/${assetKey}${suffix}?size=${size}`;
  }

  return null;
}

function MiniGameThumbnail({
  activity,
}: {
  activity: LanyardActivity;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const known = getKnownGame(activity.name, activity.application_id);

  const largeUrl = resolveActivityAssetUrl(
    activity.application_id,
    activity.assets?.large_image,
    64,
  );
  const smallUrl = resolveActivityAssetUrl(
    activity.application_id,
    activity.assets?.small_image,
    64,
  );
  const imgUrl = largeUrl || smallUrl;

  useEffect(() => {
    setImgFailed(false);
  }, [imgUrl, activity.id, activity.name]);

  if (imgUrl && !imgFailed) {
    return (
      <img
        src={imgUrl}
        alt={activity.name}
        className="guns-discord-game-pill-icon"
        onError={() => setImgFailed(true)}
      />
    );
  }

  if (known) {
    return (
      <span
        className="guns-discord-game-pill-vector"
        style={{
          color: known.brandColor,
          backgroundColor: known.pillBg,
          borderColor: known.brandColor,
        }}
        title={activity.name}
        aria-hidden="true"
      >
        <svg
          width={11}
          height={11}
          viewBox={known.viewBox || "0 0 24 24"}
          fill="currentColor"
        >
          <path d={known.svgPath} />
        </svg>
      </span>
    );
  }

  return (
    <span
      className="guns-discord-game-pill-monogram"
      title={activity.name}
      aria-hidden="true"
    >
      {getGameMonogram(activity.name)}
    </span>
  );
}

function MiniGamePlaytime({ start }: { start?: number }) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!start) return;
    const startMs = start < 10_000_000_000 ? start * 1000 : start;
    const tick = () => setElapsedMs(Math.max(0, Date.now() - startMs));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [start]);

  if (!start) return null;

  return (
    <span
      className="guns-discord-activity-time"
      title={`Oynama süresi: ${formatElapsedHuman(elapsedMs)}`}
    >
      • {formatElapsed(elapsedMs)}
    </span>
  );
}

export function GameCard({ game }: { game: LanyardActivity }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [smallFailed, setSmallFailed] = useState(false);
  const [now, setNow] = useState(Date.now());

  const known = getKnownGame(game.name, game.application_id);

  const start = game.timestamps?.start;
  const end = game.timestamps?.end;

  useEffect(() => {
    if (!start && !end) return;
    const tick = () => setNow(Date.now());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [start, end]);

  const startMs = start ? (start < 10_000_000_000 ? start * 1000 : start) : null;
  const endMs = end ? (end < 10_000_000_000 ? end * 1000 : end) : null;

  const elapsedMs = startMs ? Math.max(0, now - startMs) : null;
  const remainingMs = endMs && endMs > now ? endMs - now : null;

  const largeImgUrl = resolveActivityAssetUrl(
    game.application_id,
    game.assets?.large_image,
    256,
  );
  const smallImgUrl = resolveActivityAssetUrl(
    game.application_id,
    game.assets?.small_image,
    128,
  );

  const primaryImgUrl = largeImgUrl || smallImgUrl;
  const secondaryImgUrl = largeImgUrl ? smallImgUrl : null;

  useEffect(() => {
    setImgFailed(false);
  }, [primaryImgUrl, game.id, game.name]);

  useEffect(() => {
    setSmallFailed(false);
  }, [secondaryImgUrl]);

  const brandColor = known?.brandColor || "#6366f1";
  const accentColor = known?.accentColor || "#00f2fe";
  const glowColor = known?.glowColor || "rgba(99, 102, 241, 0.4)";
  const borderRgba = known?.borderRgba || "rgba(99, 102, 241, 0.35)";


  return (
    <div
      className="guns-game-card"
      style={{
        ["--game-color" as string]: brandColor,
        ["--game-accent" as string]: accentColor,
        ["--game-glow" as string]: glowColor,
        ["--game-border" as string]: borderRgba,
      }}
      aria-label={`Oyun etkinliği: ${game.name}${game.details ? ` - ${game.details}` : ""}`}
    >
      <div className="guns-game-header">
        <div className="guns-game-label">
          {known ? (
            <svg
              width={13}
              height={13}
              viewBox={known.viewBox || "0 0 24 24"}
              fill="currentColor"
              className="guns-game-label-icon"
              aria-hidden="true"
            >
              <path d={known.svgPath} />
            </svg>
          ) : (
            <Gamepad2 size={13} className="guns-game-label-icon" aria-hidden="true" />
          )}
          <span>{known?.cardLabel || `PLAYING ${game.name.toUpperCase()}`}</span>
        </div>
        <div className="guns-game-live-badge" title="Canlı Etkinlik">
          <span className="guns-game-live-dot" aria-hidden="true" />
          <span className="guns-game-live-text">LIVE</span>
        </div>
      </div>

      <div className="guns-game-body">
        <div className="guns-game-art-wrap">
          <div className="guns-game-art-container">
            {primaryImgUrl && !imgFailed ? (
              <img
                src={primaryImgUrl}
                alt={game.assets?.large_text || game.name}
                title={game.assets?.large_text || game.name}
                className="guns-game-art"
                onError={() => setImgFailed(true)}
              />
            ) : known ? (
              <div
                className="guns-game-art-branded"
                style={{
                  background: known.artBg,
                  borderColor: known.brandColor,
                }}
                aria-hidden="true"
              >
                <div
                  className="guns-game-branded-glow"
                  style={{ background: known.glowColor }}
                />
                <svg
                  width={26}
                  height={26}
                  viewBox={known.viewBox || "0 0 24 24"}
                  fill="currentColor"
                  style={{ color: known.brandColor }}
                  className="guns-game-branded-logo"
                >
                  <path d={known.svgPath} />
                </svg>
                <span
                  className="guns-game-branded-title"
                  style={{ color: known.brandColor }}
                >
                  {known.shortName}
                </span>
              </div>
            ) : (
              <div className="guns-game-art-fallback" aria-hidden="true">
                <div className="guns-game-fallback-glow" />
                <div className="guns-game-fallback-hud">
                  <span className="guns-game-fallback-hud-bracket top-left" />
                  <span className="guns-game-fallback-hud-bracket top-right" />
                  <span className="guns-game-fallback-hud-bracket bottom-left" />
                  <span className="guns-game-fallback-hud-bracket bottom-right" />
                  <span className="guns-game-fallback-monogram">{getGameMonogram(game.name)}</span>
                  <span className="guns-game-fallback-chip">GAME</span>
                </div>
              </div>
            )}
          </div>

          {secondaryImgUrl && !smallFailed ? (
            <img
              src={secondaryImgUrl}
              alt={game.assets?.small_text || ""}
              title={game.assets?.small_text || undefined}
              className="guns-game-small-art"
              onError={() => setSmallFailed(true)}
            />
          ) : null}
        </div>

        <div className="guns-game-meta">
          <span className="guns-game-title" title={game.name}>
            {game.name}
          </span>
          {game.details ? (
            <span className="guns-game-details" title={game.details}>
              {game.details}
            </span>
          ) : known?.defaultDetails ? (
            <span className="guns-game-details" title={known.defaultDetails}>
              {known.defaultDetails}
            </span>
          ) : null}
          {game.state ? (
            <span className="guns-game-state" title={game.state}>
              {game.state}
            </span>
          ) : null}
        </div>
      </div>

      {elapsedMs !== null || remainingMs !== null ? (
        <div className="guns-game-footer">
          {elapsedMs !== null ? (
            <div className="guns-game-timer-row">
              <Clock size={11} className="guns-game-timer-icon" aria-hidden="true" />
              <span className="guns-game-elapsed-time">
                {formatElapsed(elapsedMs)} geçti
              </span>
              <span className="guns-game-elapsed-human">
                ({formatElapsedHuman(elapsedMs)})
              </span>
            </div>
          ) : null}

          {remainingMs !== null ? (
            <div className="guns-game-timer-row is-remaining">
              <Timer size={11} className="guns-game-timer-icon" aria-hidden="true" />
              <span className="guns-game-elapsed-time">
                {formatElapsed(remainingMs)} kaldı
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SpotifyIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#1db954"
      aria-hidden="true"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.306c-.218.358-.684.47-1.042.252-2.855-1.745-6.45-2.14-10.686-1.173-.41.094-.82-.162-.914-.572-.094-.41.162-.82.572-.914 4.636-1.06 8.604-.61 11.818 1.365.358.218.47.684.252 1.042zm1.468-3.264c-.274.444-.858.587-1.302.313-3.267-2.008-8.248-2.59-12.112-1.417-.5.152-1.03-.133-1.182-.633-.152-.5.133-1.03.633-1.182 4.414-1.34 9.907-.69 13.65 1.617.444.274.587.858.313 1.302zm.126-3.41c-3.918-2.327-10.375-2.541-14.128-1.402-.6.183-1.237-.16-1.42-.76-.183-.6.16-1.237.76-1.42 4.312-1.308 11.442-1.054 15.938 1.614.54.32.716 1.02.396 1.56-.32.54-1.02.716-1.56.396z" />
    </svg>
  );
}

const SPOTIFY_WAVEFORM_BARS = 36;

function SpotifyCard({ spotify }: { spotify: LanyardSpotify }) {
  const [currentMs, setCurrentMs] = useState(0);

  const rawStart = spotify.timestamps?.start ?? 0;
  const rawEnd = spotify.timestamps?.end ?? 0;
  const start =
    rawStart && rawStart < 10_000_000_000 ? rawStart * 1000 : rawStart;
  const end = rawEnd && rawEnd < 10_000_000_000 ? rawEnd * 1000 : rawEnd;
  const totalMs = end > start ? end - start : 0;

  useEffect(() => {
    if (!start || !end || totalMs <= 0) return;

    function update() {
      const now = Date.now();
      const elapsed = Math.max(0, Math.min(totalMs, now - start));
      setCurrentMs(elapsed);
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [start, end, totalMs]);

  const waveformBars = useMemo(
    () =>
      generateTrackWaveform(
        `${spotify.song}-${spotify.artist}`,
        SPOTIFY_WAVEFORM_BARS,
      ),
    [spotify.song, spotify.artist],
  );

  const progressPercent = totalMs > 0 ? (currentMs / totalMs) * 100 : 0;
  const activeBarsCount =
    totalMs > 0
      ? Math.max(
          currentMs > 0 ? 1 : 0,
          Math.min(
            SPOTIFY_WAVEFORM_BARS,
            Math.round((currentMs / totalMs) * SPOTIFY_WAVEFORM_BARS),
          ),
        )
      : 0;

  const cleanArtist = spotify.artist.replace(/;\s*/g, ", ");
  const trackUrl = spotify.track_id
    ? `https://open.spotify.com/track/${spotify.track_id}`
    : `https://open.spotify.com/search/${encodeURIComponent(`${spotify.song} ${cleanArtist}`)}`;

  return (
    <a
      href={trackUrl}
      target="_blank"
      rel="noreferrer"
      className="guns-spotify-card"
      aria-label={`Spotify: ${spotify.song} - ${cleanArtist}`}
    >
      <div className="guns-spotify-header">
        <div className="guns-spotify-label">
          <SpotifyIcon size={14} />
          <span>LISTENING TO SPOTIFY</span>
        </div>
        <div className="guns-spotify-waves" aria-hidden="true">
          <span className="spotify-wave-bar bar-1" />
          <span className="spotify-wave-bar bar-2" />
          <span className="spotify-wave-bar bar-3" />
        </div>
      </div>

      <div className="guns-spotify-body">
        {spotify.album_art_url ? (
          <div className="guns-spotify-art-wrap">
            <img
              src={spotify.album_art_url}
              alt=""
              className="guns-spotify-art"
            />
          </div>
        ) : null}

        <div className="guns-spotify-meta">
          <span className="guns-spotify-title" title={spotify.song}>
            {spotify.song}
          </span>
          <span className="guns-spotify-artist" title={cleanArtist}>
            by {cleanArtist}
          </span>
          {spotify.album && spotify.album !== spotify.song ? (
            <span className="guns-spotify-album" title={spotify.album}>
              on {spotify.album}
            </span>
          ) : null}
        </div>

        <ArrowUpRight size={15} className="guns-spotify-arrow" aria-hidden="true" />
      </div>

      {totalMs > 0 ? (
        <div className="guns-spotify-progress-wrap">
          <div
            className="guns-spotify-soundwave"
            role="progressbar"
            aria-valuenow={Math.round(progressPercent)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Şarkı çalma ilerlemesi: %${Math.round(progressPercent)}`}
          >
            {waveformBars.map((height, idx) => {
              const isActive = idx < activeBarsCount;
              const isPlayhead = idx === activeBarsCount - 1;
              return (
                <span
                  key={idx}
                  className={`guns-spotify-soundwave-bar ${isActive ? "is-active" : "is-inactive"} ${isPlayhead ? "is-playhead" : ""}`}
                  style={{
                    ["--bar-h" as string]: `${Math.round(height * 100)}%`,
                    animationDelay: `${(idx % 6) * 0.16}s`,
                  }}
                />
              );
            })}
          </div>
          <div className="guns-spotify-time">
            <span>{formatTime(currentMs)}</span>
            <span>{formatTime(totalMs)}</span>
          </div>
        </div>
      ) : null}
    </a>
  );
}

export function DiscordPresence({
  discordUserId,
  fallbackUsername,
  fallbackGlobalName,
  fallbackAvatarUrl,
  customBadges,
  badgeMode = "auto",
}: DiscordPresenceProps) {
  const [data, setData] = useState<LanyardData | null>(null);

  useEffect(() => {
    if (!discordUserId) return;

    let ws: WebSocket | null = null;
    let heartbeatInterval: NodeJS.Timeout | null = null;

    // Fetch initial REST data first for fast render
    fetch(`https://api.lanyard.rest/v1/users/${discordUserId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setData(json.data);
        }
      })
      .catch((err) => {
        console.warn("Lanyard REST fetch failed, using fallback:", err);
      });

    // Connect WebSocket for live real-time updates
    try {
      ws = new WebSocket("wss://api.lanyard.rest/socket");

      ws.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          // Opcode 1: Hello (contains heartbeat interval)
          if (packet.op === 1) {
            const interval = packet.d.heartbeat_interval;
            heartbeatInterval = setInterval(() => {
              if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ op: 3 }));
              }
            }, interval);

            // Opcode 2: Initialize subscription
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  op: 2,
                  d: {
                    subscribe_to_id: discordUserId,
                  },
                }),
              );
            }
          }

          // Opcode 0: Event dispatch
          if (packet.op === 0) {
            if (packet.t === "INIT_STATE" || packet.t === "PRESENCE_UPDATE") {
              setData(packet.d);
            }
          }
        } catch (e) {
          console.warn("Error parsing Lanyard WS message:", e);
        }
      };

      ws.onerror = () => {
        // Silently tolerate WS errors (fallback to REST or static data)
      };
    } catch {
      // WS unsupported or blocked
    }

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (ws) {
        try {
          ws.close();
        } catch {
          // ignore
        }
      }
    };
  }, [discordUserId]);

  const username =
    data?.discord_user?.username || fallbackUsername || "Discord User";
  const displayName =
    data?.discord_user?.global_name ||
    fallbackGlobalName ||
    data?.discord_user?.username ||
    fallbackUsername;

  const status = data?.discord_status || "offline";

  // Build avatar URL (Lanyard dynamic avatar or fallback)
  const avatarUrl = data?.discord_user?.avatar
    ? `https://cdn.discordapp.com/avatars/${discordUserId}/${data.discord_user.avatar}.${
        data.discord_user.avatar.startsWith("a_") ? "gif" : "webp"
      }?size=128`
    : fallbackAvatarUrl;

  // Resolve Discord Badges (Lanyard public_flags + Nitro + custom settings)
  const badges = resolveDiscordBadges({
    publicFlags: data?.discord_user?.public_flags ?? data?.discord_user?.flags,
    avatar: data?.discord_user?.avatar,
    premiumType: data?.discord_user?.premium_type,
    customBadges,
    badgeMode,
  });

  // Check activity
  const spotify = data?.listening_to_spotify ? data.spotify : null;
  const gameActivity = findPrimaryGameActivity(data?.activities);

  return (
    <div className="guns-discord-wrapper">
      {/* Discord Profile Pill */}
      <a
        href={`https://discord.com/users/${encodeURIComponent(discordUserId)}`}
        target="_blank"
        rel="noreferrer"
        className="guns-discord-badge"
        aria-label={`Discord profili: ${displayName} (${status})`}
      >
        <div className="guns-discord-avatar-container">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="guns-discord-avatar-img"
            />
          ) : (
            <div className="guns-discord-avatar-placeholder">
              <span>{username.slice(0, 1).toUpperCase()}</span>
            </div>
          )}
          <span
            className={`guns-discord-status-dot status-${status}`}
            title={`Durum: ${status}`}
          />
        </div>

        <div className="guns-discord-details">
          <div className="guns-discord-name-row">
            <span className="guns-discord-display-name">{displayName}</span>
            <span className="guns-discord-username">@{username}</span>
            {badges.length > 0 ? (
              <div
                className="guns-discord-badges-row"
                role="list"
                aria-label="Discord Rozetleri"
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                {badges.map((badge) => (
                  <DiscordBadgeItem key={badge.id} badge={badge} />
                ))}
              </div>
            ) : null}
          </div>

          {gameActivity ? (
            <div className="guns-discord-activity is-game">
              <MiniGameThumbnail
                key={`${gameActivity.id || gameActivity.name}`}
                activity={gameActivity}
              />
              <span className="guns-discord-activity-text" title={gameActivity.name}>
                {gameActivity.name}
              </span>
              <MiniGamePlaytime start={gameActivity.timestamps?.start} />
            </div>
          ) : spotify ? (
            <div className="guns-discord-activity is-spotify">
              <Headphones size={12} className="guns-discord-activity-icon" />
              <span className="guns-discord-activity-text" title={`${spotify.song} - ${spotify.artist}`}>
                {spotify.song}
              </span>
            </div>
          ) : (
            <div className="guns-discord-status-text">
              <span>{status.toUpperCase()}</span>
            </div>
          )}
        </div>

        <ArrowUpRight size={16} className="guns-discord-arrow" aria-hidden="true" />
      </a>

      {/* Rich Game Activity Card */}
      {gameActivity ? (
        <GameCard
          key={`${gameActivity.id || gameActivity.name}-${gameActivity.timestamps?.start || ""}`}
          game={gameActivity}
        />
      ) : null}

      {/* Rich Spotify Song Profile Card */}
      {spotify ? (
        <SpotifyCard spotify={spotify} />
      ) : null}
    </div>
  );
}
