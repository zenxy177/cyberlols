"use client";

import { useRef, useState } from "react";
import { hexToRgba, cardScrimAlpha, type Profile } from "@/lib/profile";
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
import { MapPin } from "lucide-react";

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
  const [videoAudioActive, setVideoAudioActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const displayName =
    profile.display_name.trim() || profile.discord_global_name || "Emir";
  const effectiveAvatar = avatarUrl || discordAvatarUrl;

  const hasExplicitAudio = Boolean(profile.audio_url);
  const hasVideo = Boolean(backgroundVideoUrl);
  const hasAudioSource = hasExplicitAudio || hasVideo;

  const cardBg = hexToRgba(
    profile.surface_color,
    (profile.card_opacity ?? 75) / 100
  );

  // Metin okunabilirliğini kullanıcı opaklığından bağımsız garanti eder.
  const cardScrim = cardScrimAlpha(profile.card_opacity ?? 75);

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
        }}
      />

      {/* Ambient Backdrop Media */}
      <div className="guns-stage-backdrop" aria-hidden="true">
        {backgroundVideoUrl ? (
          <video
            ref={videoRef}
            className="guns-backdrop-video"
            style={{
              opacity: (profile.background_video_opacity ?? 70) / 100,
            }}
            autoPlay
            loop
            muted={!entered || (hasExplicitAudio && !videoAudioActive)}
            playsInline
            src={backgroundVideoUrl}
            poster={backgroundUrl || undefined}
          />
        ) : backgroundUrl ? (
          <div
            className="guns-backdrop-image"
            style={{
              backgroundImage: `url("${backgroundUrl}")`,
              opacity: (profile.background_video_opacity ?? 70) / 100,
            }}
          />
        ) : (
          <div className="guns-backdrop-default" />
        )}
        <div className="guns-backdrop-vignette" />
        <div className="guns-backdrop-grain" />

        {/* Celestial Moonlight Stardust Particles */}
        <LunarEffects enabled={profile.enable_lunar_effects} />
      </div>

      <div
        className={`guns-stage-wrapper${entered ? " is-entered" : ""}`}
        data-entrance-effect={profile.entrance_effect_preset}
      >
        {/* Corner Controls: Volume (top-left), Share (bottom-right) */}
        <div className="guns-corner guns-corner-tl">
          {hasAudioSource ? (
            <AudioPlayer
              audioUrl={hasExplicitAudio ? profile.audio_url : null}
              videoRef={hasVideo ? videoRef : undefined}
              videoAudioFallback={profile.background_video_audio_fallback}
              onVideoAudioChange={setVideoAudioActive}
              title={profile.audio_title?.trim() || "Arka Plan Sesi"}
              artist={profile.audio_artist}
              defaultVolume={profile.default_volume}
              shouldPlay={entered}
            />
          ) : null}
        </div>

        <div className="guns-corner guns-corner-br">
          <ShareButton />
        </div>

        {/* Center 3D Tilt Card */}
        <main className="guns-card-container guns-main-content">
          <ProfileCard
            enableTilt={profile.enable_tilt}
            className={`guns-main-card${profile.enable_lunar_effects ? " has-lunar-aura" : ""} border-fx-${profile.card_border_effect || "lunar_aurora"}`}
            style={{
              backgroundColor: cardBg,
              ["--card-surface-rgba" as string]: cardBg,
              ["--card-scrim-alpha" as string]: cardScrim.toFixed(3),
            }}
          >
            <div className="receiver-readout" aria-hidden="true">
              <span className="receiver-live-indicator">CANLI SİNYAL</span>
              <span className="receiver-frequency">88.4 <small>FM</small></span>
            </div>

            {/* Views counter: bottom-left inside card */}
            <div className="guns-card-corner-views">
              <ViewsCounter initialCount={profile.views_count} />
            </div>

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
            </div>

            {/* Discord Presence Section */}
            {profile.discord_user_id ? (
              <div className="guns-card-discord-section">
                <DiscordPresence
                  discordUserId={profile.discord_user_id}
                  fallbackUsername={profile.discord_username}
                  fallbackGlobalName={profile.discord_global_name}
                  fallbackAvatarUrl={profile.discord_avatar_url}
                  customBadges={profile.discord_badges}
                  badgeMode={profile.discord_badges_mode}
                  appearance={{
                    width: profile.discord_presence_width,
                    padding: profile.discord_presence_padding,
                    avatarSize: profile.discord_presence_avatar_size,
                    artSize: profile.discord_presence_art_size,
                    textScale: profile.discord_presence_text_scale,
                    textGap: profile.discord_presence_text_gap,
                  }}
                />
              </div>
            ) : null}

            {/* Compact Social Badges Grid */}
            <div className="guns-card-badges-section">
              <SocialBadges links={links} layout={profile.links_layout || "dock"} />
            </div>

            <div className="guns-card-extra">
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
          </ProfileCard>
        </main>

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
