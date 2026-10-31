import type { CSSProperties } from "react";
import {
  EMPTY_PROFILE,
  isSupabaseConfigured,
  normalizeProfile,
  safeExternalUrl,
} from "@/lib/profile";
import { createServerSupabase } from "@/lib/supabase/server";
import { GunsView } from "@/app/guns-view";

export const dynamic = "force-dynamic";

type LoadState = "ready" | "setup" | "unpublished" | "error";

export default async function HomePage() {
  let profile = EMPTY_PROFILE;
  let state: LoadState = "ready";

  if (!isSupabaseConfigured()) {
    state = "setup";
  } else {
    try {
      const supabase = await createServerSupabase();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", "main")
        .maybeSingle();

      if (error) {
        state = "error";
        console.error("Public profile query failed:", error.message);
      } else if (data) {
        profile = normalizeProfile(data);
      } else {
        state = "unpublished";
      }
    } catch (err) {
      state = "error";
      console.error("Error loading profile:", err);
    }
  }

  const avatarUrl = profile.avatar_url
    ? safeExternalUrl(profile.avatar_url)
    : null;
  const backgroundUrl = profile.background_url
    ? safeExternalUrl(profile.background_url)
    : null;
  const backgroundVideoUrl = profile.background_video_url
    ? safeExternalUrl(profile.background_video_url)
    : null;
  const discordAvatarUrl = profile.discord_avatar_url
    ? safeExternalUrl(profile.discord_avatar_url)
    : null;
  const links = profile.links
    .map((link) => ({ ...link, safeUrl: safeExternalUrl(link.url) }))
    .filter((link) => link.label.trim() && link.safeUrl);

  const containerStyle = {
    "--accent": profile.accent_color,
    "--surface": profile.surface_color,
    "--neon-glow": `${profile.accent_color}40`,
  } as CSSProperties;

  const isCustomCursorActive =
    profile.enable_custom_cursor && profile.cursor_style !== "default";

  return (
    <div
      className="guns-experience-root"
      style={containerStyle}
      data-custom-cursor={isCustomCursorActive ? "true" : "false"}
    >
      <GunsView
        profile={profile}
        avatarUrl={avatarUrl}
        backgroundUrl={backgroundUrl}
        backgroundVideoUrl={backgroundVideoUrl}
        discordAvatarUrl={discordAvatarUrl}
        links={links}
        state={state}
      />
    </div>
  );
}
