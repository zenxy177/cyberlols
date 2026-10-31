"use client";

import { useRef, useState } from "react";
import type { Profile } from "@/lib/profile";
import { ClickToEnter } from "@/app/click-to-enter";
import { AudioPlayer } from "@/app/audio-player";
import { ProfileCard } from "@/app/profile-card";
import { CustomCursor } from "@/app/custom-cursor";
import { TypewriterBio } from "@/app/typewriter-bio";
import { DiscordPresence } from "@/app/discord-presence";
import { SocialBadges } from "@/app/social-badges";
import { ViewsCounter } from "@/app/views-counter";
import { ShareButton } from "@/app/share-button";
import { MoonBadge } from "@/app/moon-badge";
import { LunarEffects } from "@/app/lunar-effects";
import { ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";

type GunsViewProps = {
  profile: Profile;
  avatarUrl: string | null;
  backgroundUrl: string | null;
  backgroundVideoUrl: string | null;
  discordAvatarUrl: string | null;
  links: Array<Profile["links"][number] & { safeUrl?: string | null }>;
  state: "ready" | "setup" | "unpublished" | "error";
};

export function GunsView({
  profile,
  avatarUrl,
  backgroundUrl,
  backgroundVideoUrl,
  discordAvatarUrl,
  links,
  state,
}: GunsViewProps) {
  const [entered, setEntered] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const displayName =
    profile.display_name.trim() || profile.discord_global_name || "Emir";
  const effectiveAvatar = avatarUrl || discordAvatarUrl;

  const hasExplicitAudio = Boolean(profile.audio_url);
  const hasVideoAudio = !hasExplicitAudio && Boolean(backgroundVideoUrl);
  const hasAudioSource = hasExplicitAudio || hasVideoAudio;

  const audioTitle =
    profile.audio_title?.trim() ||
    (hasVideoAudio ? "Video Sesi" : "Arka Plan Müziği");

  return (
    <>
      {/* Custom Cursor with dynamic styles, trails & click ripples */}
      <CustomCursor
        enabled={profile.enable_custom_cursor}
        cursorStyle={profile.cursor_style}
        cursorTrail={profile.cursor_trail}
        enableClickRipple={profile.enable_click_ripple}
      />

      {/* Click to Enter Overlay */}
      <ClickToEnter
        text={profile.click_to_enter_text || "click to enter"}
        onEnter={() => {
          setEntered(true);
          if (hasVideoAudio && videoRef.current) {
            videoRef.current.muted = false;
            videoRef.current.volume = Math.max(
              0,
              Math.min(1, (profile.default_volume ?? 50) / 100)
            );
            videoRef.current.play().catch(() => {});
          }
        }}
      />

      {/* Ambient Backdrop Media */}
      <div className="guns-stage-backdrop" aria-hidden="true">
        {backgroundVideoUrl ? (
          <video
            ref={videoRef}
            className="guns-backdrop-video"
            autoPlay
            loop
            muted={!entered || hasExplicitAudio}
            playsInline
            src={backgroundVideoUrl}
            poster={backgroundUrl || undefined}
          />
        ) : backgroundUrl ? (
          <div
            className="guns-backdrop-image"
            style={{ backgroundImage: `url("${backgroundUrl}")` }}
          />
        ) : (
          <div className="guns-backdrop-default" />
        )}
        <div className="guns-backdrop-vignette" />
        <div className="guns-backdrop-grain" />

        {/* Celestial Moonlight Stardust Particles */}
        <LunarEffects enabled={profile.enable_lunar_effects} />
      </div>

      <div className={`guns-stage-wrapper${entered ? " is-entered" : ""}`}>
        {/* Floating Top Bar (Views Counter, Audio Player, Share) */}
        <header className="guns-top-bar">
          <div className="guns-top-bar-left">
            <ViewsCounter initialCount={profile.views_count} />
          </div>

          <div className="guns-top-bar-center">
            {hasAudioSource ? (
              <AudioPlayer
                audioUrl={hasExplicitAudio ? profile.audio_url : null}
                videoRef={hasVideoAudio ? videoRef : undefined}
                title={audioTitle}
                artist={profile.audio_artist}
                defaultVolume={profile.default_volume}
                shouldPlay={entered}
              />
            ) : null}
          </div>

          <div className="guns-top-bar-right">
            <ShareButton />
          </div>
        </header>

        {/* Center 3D Tilt Card */}
        <main className="guns-card-container">
          <ProfileCard
            enableTilt={profile.enable_tilt}
            className={`guns-main-card${profile.enable_lunar_effects ? " has-lunar-aura" : ""} border-fx-${profile.card_border_effect || "lunar_aurora"}`}
          >
            {/* Card Header: Avatar & Glow */}
            <div className="guns-card-avatar-wrap">
              <div className="guns-card-avatar-glow" aria-hidden="true" />
              {profile.enable_lunar_effects ? (
                <div className="guns-avatar-lunar-ring" aria-hidden="true" />
              ) : null}
              <div className="guns-card-avatar-frame">
                {effectiveAvatar ? (
                  <img
                    src={effectiveAvatar}
                    alt={`${displayName} avatar`}
                    className="guns-card-avatar-img"
                  />
                ) : (
                  <div className="guns-card-avatar-fallback">
                    {displayName.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Identity Details */}
            <div className="guns-card-identity">
              <div className="guns-name-badges-row">
                <h1
                  className={`guns-card-name name-fx-${profile.name_effect || "lunar_shimmer"}`}
                  data-text={displayName}
                  id="profile-name"
                >
                  {displayName}
                </h1>
                {profile.enable_moon_badge ? (
                  <MoonBadge title={profile.moon_badge_title} />
                ) : null}
              </div>

              {profile.headline.trim() ? (
                <p className="guns-card-headline">{profile.headline}</p>
              ) : null}

              {/* Typewriter animated bio */}
              <div className="guns-card-bio-section">
                <TypewriterBio
                  lines={profile.typewriter_lines}
                  fallbackBio={profile.bio}
                />
              </div>

              {profile.location.trim() ? (
                <div className="guns-card-location">
                  <MapPin size={13} className="guns-location-icon" aria-hidden="true" />
                  <span>{profile.location}</span>
                </div>
              ) : null}
            </div>

            {/* Discord Presence Section */}
            {profile.discord_user_id ? (
              <div className="guns-card-discord-section">
                <DiscordPresence
                  discordUserId={profile.discord_user_id}
                  fallbackUsername={profile.discord_username}
                  fallbackGlobalName={profile.discord_global_name}
                  fallbackAvatarUrl={profile.discord_avatar_url}
                />
              </div>
            ) : null}

            {/* Compact Social Badges Grid */}
            <div className="guns-card-badges-section">
              <SocialBadges links={links} />
            </div>
          </ProfileCard>
        </main>

        {/* Discreet Footer */}
        <footer className="guns-footer">
          <Link href="/admin/login" className="guns-footer-link interactive">
            <span>Sahip Paneli</span>
            <ArrowUpRight size={13} aria-hidden="true" />
          </Link>
        </footer>

        {/* Non-ready Status Banners */}
        {state !== "ready" ? (
          <div
            className={`guns-system-notice notice-${state}`}
            role={state === "error" ? "alert" : "status"}
          >
            {state === "setup"
              ? "Yayınlamak için Supabase ayarları ve profil içeriği gerekiyor."
              : state === "unpublished"
                ? "Profil henüz yayına alınmadı."
                : "Profil şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin."}
          </div>
        ) : null}
      </div>
    </>
  );
}
