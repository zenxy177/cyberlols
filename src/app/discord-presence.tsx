"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Clock, Gamepad2, Headphones, Timer } from "lucide-react";

type DiscordPresenceProps = {
  discordUserId: string;
  fallbackUsername?: string | null;
  fallbackGlobalName?: string | null;
  fallbackAvatarUrl?: string | null;
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
    matchNames: ["league of legends", "league", "lol"],
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
    matchNames: ["counter-strike", "counter strike", "cs:go", "cs2", "cs 2"],
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
    matchNames: ["minecraft"],
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
    matchNames: ["grand theft auto", "gta v", "gta 5", "gta", "fivem"],
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
    matchNames: ["fortnite"],
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
    matchNames: ["roblox"],
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
];

export function getKnownGame(
  name?: string,
  applicationId?: string,
): KnownGame | null {
  if (!name && !applicationId) return null;

  const normalized = (name || "").toLowerCase().trim();

  for (const game of KNOWN_GAMES) {
    if (applicationId && game.applicationIds?.includes(applicationId)) {
      return game;
    }
    if (normalized) {
      for (const match of game.matchNames) {
        if (normalized.includes(match)) {
          return game;
        }
      }
    }
  }

  return null;
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

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
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

  return <Gamepad2 size={12} className="guns-discord-activity-icon" aria-hidden="true" />;
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

  const fallbackLetter = game.name ? game.name.charAt(0).toUpperCase() : "G";

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
                <Gamepad2 size={22} className="guns-game-fallback-icon" />
                <span className="guns-game-fallback-letter">{fallbackLetter}</span>
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

function SpotifyCard({ spotify }: { spotify: LanyardSpotify }) {
  const [currentMs, setCurrentMs] = useState(0);

  const start = spotify.timestamps?.start ?? 0;
  const end = spotify.timestamps?.end ?? 0;
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

  const progressPercent = totalMs > 0 ? (currentMs / totalMs) * 100 : 0;
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
          <div className="guns-spotify-bar">
            <div
              className="guns-spotify-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
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
