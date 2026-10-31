"use client";

import type { ProfileLink } from "@/lib/profile";
import { Globe, Mail } from "lucide-react";

type SocialBadgesProps = {
  links: Array<ProfileLink & { safeUrl?: string | null }>;
};

type PlatformInfo = {
  name: string;
  icon: (props: { size?: number }) => React.ReactNode;
  brandColor: string;
};

function DiscordIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function SpotifyIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

function SteamIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.524s-2.03 4.524-4.524 4.524h-.105l-4.076 2.911c0 .052.005.105.005.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 14.819C1.903 20.04 6.702 24 12.057 24c6.627 0 12-5.373 12-12s-5.373-12-12-12zm-4.708 17.502c0-.986.804-1.79 1.79-1.79.986 0 1.79.804 1.79 1.79 0 .986-.804 1.79-1.79 1.79-.986 0-1.79-.804-1.79-1.79zm9.053-8.592c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3z" />
    </svg>
  );
}

function GithubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function TwitterIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function YoutubeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function TwitchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
    </svg>
  );
}

function KickIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.25 0h7.5v6.75H12V3h4.5V0H24v7.5h-4.5v3H18v3h1.5v3H24V24h-7.5v-3H12v-3.75H9.75V24H2.25V0z" />
    </svg>
  );
}

function RobloxIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.926 23.998L0 18.892 5.075 0l18.925 5.106-5.074 18.892zM9.441 9.088l-1.577 5.877 5.877 1.577 1.577-5.877-5.877-1.577z" />
    </svg>
  );
}

function TelegramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.196 1.006.128.832.941z" />
    </svg>
  );
}

function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

function SoundcloudIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M1.175 12.225c-.051 0-.094.045-.101.106l-.284 3.197c-.004.053.036.1.094.106.059 0 .101-.045.105-.106l.288-3.197c.004-.06-.038-.106-.102-.106zm1.144-.881c-.066 0-.12.052-.128.125l-.337 4.793c-.005.066.046.126.12.128.075 0 .128-.053.136-.127l.337-4.793c.006-.067-.047-.126-.128-.126zm1.189-.882c-.085 0-.154.066-.162.157l-.348 6.556c-.005.084.058.156.152.158.093 0 .16-.066.168-.158l.348-6.556c.007-.085-.06-.157-.158-.157zm1.229-.026c-.105 0-.188.08-.197.19l-.271 6.582c-.005.104.072.193.187.195.114 0 .196-.08.204-.195l.271-6.582c.007-.104-.073-.19-.194-.19zm1.228-.291c-.122 0-.219.096-.23.226l-.264 7.099c-.005.122.086.226.22.228.133 0 .229-.096.239-.228l.264-7.099c.008-.122-.086-.226-.229-.226zm1.23-.49c-.141 0-.253.11-.266.26l-.234 8.079c-.005.14.099.26.254.262.154 0 .265-.11.276-.262l.234-8.079c.009-.14-.1-.26-.264-.26zm1.232-.303c-.159 0-.286.126-.301.297l-.213 8.672c-.005.159.113.295.289.297.174 0 .3-.127.313-.297l.213-8.672c.01-.159-.113-.296-.301-.296zm1.23-.133c-.177 0-.32.142-.336.333l-.183 8.938c-.004.177.127.33.324.332.195 0 .336-.142.35-.332l.183-8.938c.012-.178-.127-.333-.338-.333zm11.261 2.215c-.477 0-.928.118-1.332.321-.365-2.617-2.607-4.634-5.327-4.634-.413 0-.814.048-1.202.137-.367.085-.688.24-.979.444-.176.124-.265.318-.28.536l-.089 9.07c.015.242.135.438.327.502.26.087.545.137.843.137h7.971c2.188 0 3.962-1.774 3.962-3.962 0-2.187-1.774-3.961-3.962-3.961z" />
    </svg>
  );
}

function PinterestIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.332 1.365-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  );
}

function detectPlatform(url: string, label: string): PlatformInfo {
  let hostname = "";
  try {
    const candidate = url.includes("://") ? url : `https://${url}`;
    hostname = new URL(candidate).hostname.toLowerCase();
  } catch {
    hostname = "";
  }
  const labelLower = label.toLowerCase();

  if (
    hostname === "discord.com" ||
    hostname === "discord.gg" ||
    hostname.endsWith(".discord.com") ||
    hostname.endsWith(".discord.gg") ||
    labelLower.includes("discord")
  ) {
    return { name: "Discord", icon: DiscordIcon, brandColor: "#5865F2" };
  }
  if (
    hostname === "spotify.com" ||
    hostname.endsWith(".spotify.com") ||
    labelLower.includes("spotify")
  ) {
    return { name: "Spotify", icon: SpotifyIcon, brandColor: "#1DB954" };
  }
  if (
    hostname === "steamcommunity.com" ||
    hostname === "steampowered.com" ||
    hostname.endsWith(".steamcommunity.com") ||
    hostname.endsWith(".steampowered.com") ||
    labelLower.includes("steam")
  ) {
    return { name: "Steam", icon: SteamIcon, brandColor: "#66C0F4" };
  }
  if (
    hostname === "instagram.com" ||
    hostname.endsWith(".instagram.com") ||
    labelLower.includes("instagram") ||
    labelLower.includes("insta")
  ) {
    return { name: "Instagram", icon: InstagramIcon, brandColor: "#E1306C" };
  }
  if (
    hostname === "github.com" ||
    hostname.endsWith(".github.com") ||
    labelLower.includes("github")
  ) {
    return { name: "GitHub", icon: GithubIcon, brandColor: "#FFFFFF" };
  }
  if (
    hostname === "twitter.com" ||
    hostname === "x.com" ||
    hostname.endsWith(".twitter.com") ||
    hostname.endsWith(".x.com") ||
    labelLower === "x" ||
    labelLower.includes("twitter")
  ) {
    return { name: "X", icon: TwitterIcon, brandColor: "#E7E9EA" };
  }
  if (
    hostname === "youtube.com" ||
    hostname === "youtu.be" ||
    hostname.endsWith(".youtube.com") ||
    labelLower.includes("youtube") ||
    labelLower.includes("yt")
  ) {
    return { name: "YouTube", icon: YoutubeIcon, brandColor: "#FF0000" };
  }
  if (
    hostname === "twitch.tv" ||
    hostname.endsWith(".twitch.tv") ||
    labelLower.includes("twitch")
  ) {
    return { name: "Twitch", icon: TwitchIcon, brandColor: "#A970FF" };
  }
  if (
    hostname === "kick.com" ||
    hostname.endsWith(".kick.com") ||
    labelLower.includes("kick")
  ) {
    return { name: "Kick", icon: KickIcon, brandColor: "#53FC18" };
  }
  if (
    hostname === "roblox.com" ||
    hostname.endsWith(".roblox.com") ||
    labelLower.includes("roblox")
  ) {
    return { name: "Roblox", icon: RobloxIcon, brandColor: "#FFFFFF" };
  }
  if (
    hostname === "tiktok.com" ||
    hostname.endsWith(".tiktok.com") ||
    labelLower.includes("tiktok")
  ) {
    return { name: "TikTok", icon: TikTokIcon, brandColor: "#FE2C55" };
  }
  if (
    hostname === "soundcloud.com" ||
    hostname.endsWith(".soundcloud.com") ||
    labelLower.includes("soundcloud")
  ) {
    return { name: "SoundCloud", icon: SoundcloudIcon, brandColor: "#FF5500" };
  }
  if (
    hostname === "pinterest.com" ||
    hostname.endsWith(".pinterest.com") ||
    labelLower.includes("pinterest")
  ) {
    return { name: "Pinterest", icon: PinterestIcon, brandColor: "#BD081C" };
  }
  if (
    hostname === "t.me" ||
    hostname === "telegram.org" ||
    hostname.endsWith(".t.me") ||
    labelLower.includes("telegram")
  ) {
    return { name: "Telegram", icon: TelegramIcon, brandColor: "#229ED9" };
  }
  if (
    url.startsWith("mailto:") ||
    labelLower.includes("email") ||
    labelLower.includes("e-posta")
  ) {
    return { name: "Email", icon: Mail, brandColor: "#FFA000" };
  }

  return { name: "Web", icon: Globe, brandColor: "#78A7FF" };
}

export function SocialBadges({ links }: SocialBadgesProps) {
  if (!links || links.length === 0) return null;

  return (
    <div className="guns-social-badges-container" role="list" aria-label="Sosyal Bağlantılar">
      {links.map((link) => {
        const platform = detectPlatform(link.url, link.label);
        const IconComponent = platform.icon;
        const displayName = link.label?.trim() || platform.name;

        return (
          <a
            key={link.id}
            href={link.safeUrl || "#"}
            target="_blank"
            rel="noreferrer"
            className="guns-social-badge interactive"
            style={
              {
                "--badge-color": platform.brandColor,
                "--badge-glow": `${platform.brandColor}66`,
              } as React.CSSProperties
            }
            role="listitem"
            aria-label={displayName}
          >
            <span className="guns-badge-icon" aria-hidden="true">
              <IconComponent size={20} />
            </span>

            {/* Floating Tooltip on Hover */}
            <span className="guns-badge-tooltip" role="tooltip">
              {displayName}
            </span>
          </a>
        );
      })}
    </div>
  );
}
