"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Gamepad2, Headphones } from "lucide-react";

type DiscordPresenceProps = {
  discordUserId: string;
  fallbackUsername?: string | null;
  fallbackGlobalName?: string | null;
  fallbackAvatarUrl?: string | null;
};

type LanyardSpotify = {
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

type LanyardData = {
  discord_user: {
    id: string;
    username: string;
    avatar: string | null;
    global_name: string | null;
  };
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities: Array<{
    id: string;
    name: string;
    type: number;
    state?: string;
    details?: string;
  }>;
  listening_to_spotify: boolean;
  spotify: LanyardSpotify | null;
};

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
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
  const gameActivity = data?.activities?.find(
    (a) => a.type === 0 && a.name.toLowerCase() !== "spotify",
  );

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

          {spotify ? (
            <div className="guns-discord-activity is-spotify">
              <Headphones size={12} className="guns-discord-activity-icon" />
              <span className="guns-discord-activity-text" title={`${spotify.song} - ${spotify.artist}`}>
                {spotify.song}
              </span>
            </div>
          ) : gameActivity ? (
            <div className="guns-discord-activity is-game">
              <Gamepad2 size={12} className="guns-discord-activity-icon" />
              <span className="guns-discord-activity-text" title={gameActivity.name}>
                {gameActivity.name}
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

      {/* Rich Spotify Song Profile Card */}
      {spotify ? (
        <SpotifyCard spotify={spotify} />
      ) : null}
    </div>
  );
}
