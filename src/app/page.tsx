import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { cache } from "react";
import {
  EMPTY_PROFILE,
  isSupabaseConfigured,
  normalizeProfile,
  safeExternalUrl,
  type Profile,
} from "@/lib/profile";
import { createServerSupabase } from "@/lib/supabase/server";
import { GunsView } from "@/app/guns-view";
import { DynamicTabTitle } from "@/app/dynamic-tab-title";

export const dynamic = "force-dynamic";

type LoadState = "ready" | "setup" | "unpublished" | "error";

const loadHomeProfile = cache(
  async (): Promise<{ profile: Profile; state: LoadState }> => {
    if (!isSupabaseConfigured()) {
      return { profile: EMPTY_PROFILE, state: "setup" };
    }

    try {
      const supabase = await createServerSupabase();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", "main")
        .maybeSingle();

      if (error) {
        console.error("Public profile query failed:", error.message);
        return { profile: EMPTY_PROFILE, state: "error" };
      }
      if (!data) {
        return { profile: EMPTY_PROFILE, state: "unpublished" };
      }
      return { profile: normalizeProfile(data), state: "ready" };
    } catch (err) {
      console.error("Error loading profile:", err);
      return { profile: EMPTY_PROFILE, state: "error" };
    }
  },
);

function profileName(profile: Profile): string {
  return (
    profile.display_name.trim() ||
    profile.discord_global_name?.trim() ||
    "Emir"
  );
}

function metadataBaseUrl(): URL | undefined {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  if (!configured) return undefined;
  try {
    return new URL(configured);
  } catch {
    return undefined;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { profile, state } = await loadHomeProfile();
  const name = profileName(profile);
  const badge = profile.enable_moon_badge ? "🌙" : "";
  const title = `${name} ${badge}`.trim();
  const description = (
    profile.headline.trim() ||
    profile.bio.trim() ||
    `${name} • kişisel bio profili.`
  ).slice(0, 160);
  const avatar = profile.avatar_url ? safeExternalUrl(profile.avatar_url) : null;
  const images = avatar ? [{ url: avatar, alt: name }] : undefined;
  const isPublic = state === "ready" && profile.is_published;

  return {
    metadataBase: metadataBaseUrl(),
    title,
    description,
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      type: "profile",
      siteName: name,
      images,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images,
    },
    robots: isPublic
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

export default async function HomePage() {
  const { profile, state } = await loadHomeProfile();

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

  const handle =
    (profile.discord_username?.trim() || profile.display_name.trim() || "warxy")
      .replace(/^@/, "") || "warxy";

  return (
    <div
      className="guns-experience-root"
      style={containerStyle}
      data-custom-cursor={isCustomCursorActive ? "true" : "false"}
    >
      <DynamicTabTitle
        text={`@${handle}`}
        badge={profile.enable_moon_badge ? "🌙" : ""}
      />
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
