"use client";

import {
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  Copy,
  ExternalLink,
  Globe,
  Headphones,
  Laptop,
  LoaderCircle,
  MessageCircle,
  Moon,
  Music,
  Palette,
  Pause,
  Play,
  Plus,
  Save,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  TrendingUp,
  Upload,
  User,
  Volume2,
  Wand2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  clampNumber,
  hexToRgba,
  normalizeProfile,
  type CardBorderEffect,
  type CursorStyle,
  type CursorTrail,
  type NameEffect,
  type Profile,
  type ProfileLink,
} from "@/lib/profile";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { MoonBadge } from "@/app/moon-badge";
import { SocialBadges } from "@/app/social-badges";
import { TypewriterBio } from "@/app/typewriter-bio";
import { DiscordPresence } from "@/app/discord-presence";
import { CustomCursor } from "@/app/custom-cursor";

const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_FILE_SIZE = 20 * 1024 * 1024;
const MAX_AUDIO_FILE_SIZE = 20 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const VIDEO_EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

const AUDIO_EXTENSIONS: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/ogg": "ogg",
};

const PRESET_PLATFORMS = [
  { name: "Kick", url: "https://kick.com/" },
  { name: "Steam", url: "https://steamcommunity.com/id/" },
  { name: "Instagram", url: "https://instagram.com/" },
  { name: "Spotify", url: "https://open.spotify.com/user/" },
  { name: "GitHub", url: "https://github.com/" },
  { name: "X", url: "https://x.com/" },
  { name: "YouTube", url: "https://youtube.com/@" },
  { name: "Twitch", url: "https://twitch.tv/" },
  { name: "TikTok", url: "https://tiktok.com/@" },
  { name: "Telegram", url: "https://t.me/" },
  { name: "Roblox", url: "https://roblox.com/users/" },
  { name: "SoundCloud", url: "https://soundcloud.com/" },
];

const PRESET_COLOR_THEMES = [
  {
    name: "Moon Knight",
    accent: "#e2e8f0",
    surface: "#090a0f",
    description: "Ay ışığı ve gümüş tonları",
  },
  {
    name: "Crimson Red",
    accent: "#ff334b",
    surface: "#090a0f",
    description: "Derin neon kırmızı",
  },
  {
    name: "Cyber Lime",
    accent: "#e6ff5e",
    surface: "#0b0e14",
    description: "Yüksek kontrast siber sarı",
  },
  {
    name: "Electric Blue",
    accent: "#78a7ff",
    surface: "#0a0d18",
    description: "Lanyard & Discord mavisi",
  },
  {
    name: "Phantom Violet",
    accent: "#a855f7",
    surface: "#0e0918",
    description: "Kozmik derin mor",
  },
  {
    name: "Matrix Emerald",
    accent: "#10b981",
    surface: "#08120b",
    description: "Canlı zümrüt yeşili",
  },
];

const BORDER_EFFECT_PRESETS: Array<{
  id: CardBorderEffect;
  title: string;
  desc: string;
}> = [
  {
    id: "lunar_aurora",
    title: "🌙 Lunar Aurora",
    desc: "Ay Işığı & Gümüş Parıltı - Nefes alan hilal aurası (Moon Knight Uyumlu)",
  },
  {
    id: "rgb_flow",
    title: "🌈 RGB Flow",
    desc: "Kromatik Lazer - 360° dönen pürüzsüz gökkuşağı lazer akışı",
  },
  {
    id: "neon_pulse",
    title: "⚡ Neon Pulse",
    desc: "Dinamik Vurgu - Seçtiğin renk paletine göre nabız atan neon",
  },
  {
    id: "cyber_glow",
    title: "🔮 Cyber Glow",
    desc: "Siber Arka Işık - Derin karanlıkta arka plana vuran neon ışığı",
  },
  {
    id: "none",
    title: "🔲 Klasik Cam",
    desc: "Sade Cam - Efektsiz, şeffaf koyu cam kenarlık",
  },
];

const NAME_EFFECT_PRESETS: Array<{
  id: NameEffect;
  title: string;
  desc: string;
}> = [
  {
    id: "lunar_shimmer",
    title: "🌙 Ay Işığı Dalgası",
    desc: "Moon Knight'a özel gümüş-mavi sıvı ışık akışı",
  },
  {
    id: "rgb_wave",
    title: "🌈 RGB Gökkuşağı",
    desc: "360° kesintisiz kromatik spektrum lazer akışı",
  },
  {
    id: "neon_pulse",
    title: "⚡ Neon Nabız",
    desc: "Vurgulu renkte nabız gibi derin parlayan neon aura",
  },
  {
    id: "cyber_glitch",
    title: "👾 Siber Glitch",
    desc: "Siberpunk RGB kanal ayrışması ve anlık titreme",
  },
  {
    id: "sparkle",
    title: "✨ Yıldız Işıltısı",
    desc: "Elmas gibi parıldayan yıldız süpürmesi ve pırıltı",
  },
  {
    id: "none",
    title: "🔲 Sade Beyaz",
    desc: "Efektsiz, temiz ve minimalist beyaz tipografi",
  },
];

const CURSOR_STYLE_PRESETS: Array<{
  id: CursorStyle;
  title: string;
  desc: string;
}> = [
  {
    id: "neon_dot",
    title: "🔴 Siber Neon Nokta",
    desc: "Beyaz neon merkez nokta ve yumuşak yaylı takip halkası",
  },
  {
    id: "crosshair",
    title: "🎯 Taktiksel Nişangah (Crosshair)",
    desc: "Taktiksel sniper nişangahı; linklerin üzerinde 45° döner ve genişler",
  },
  {
    id: "lunar_crescent",
    title: "🌙 Hilal Ay İmleci",
    desc: "Moon Knight parıldayan hilal ay imleci ve etrafında dönen hale",
  },
  {
    id: "default",
    title: "🖱️ Varsayılan Tarayıcı",
    desc: "Özel imleç kapalı; standart Windows / macOS oku",
  },
];

const CURSOR_TRAIL_PRESETS: Array<{
  id: CursorTrail;
  title: string;
  desc: string;
}> = [
  {
    id: "stardust",
    title: "✨ Dökülen Yıldız Tozu",
    desc: "Mouse hareket ettikçe arkasından süzülen ışıltılı ay tozu parçacıkları",
  },
  {
    id: "ghost",
    title: "👻 Hayalet Işık İzi",
    desc: "İmlecin arkasından yumuşak gecikmeyle gelen buğulu ışık halkası",
  },
  {
    id: "none",
    title: "🚫 İz Yok",
    desc: "Yalnızca imleç görünür, arkasında iz bırakmaz",
  },
];

type StudioTab = "identity" | "design" | "audio" | "effects" | "discord" | "socials" | "analytics";

type AnalyticsData = {
  hasRealData?: boolean;
  totalViews: number;
  weeklyViews: number;
  weeklyTrend: Array<{ date: string; dayName: string; views: number }>;
  deviceStats: Array<{ type: string; label: string; percentage: number; count: number }>;
  referrerStats: Array<{ name: string; percentage: number; count: number }>;
  countryStats: Array<{ code: string; name: string; flag: string; percentage: number; count: number }>;
  peakHour: string;
  avgDuration: string;
};

type EditorState = {
  kind: "idle" | "saving" | "success" | "error";
  message: string;
};

export function ProfileEditor({ profile }: { profile: Profile }) {
  const router = useRouter();
  const initial = normalizeProfile(profile);
  const [form, setForm] = useState<Profile>(initial);
  const [originalForm, setOriginalForm] = useState<Profile>(initial);
  const [activeTab, setActiveTab] = useState<StudioTab>("identity");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [editorState, setEditorState] = useState<EditorState>({
    kind: "idle",
    message: "",
  });
  const [needsSchemaMigration, setNeedsSchemaMigration] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [uploading, setUploading] = useState<
    "avatar" | "background" | "background-video" | "audio" | null
  >(null);
  const [testPlaying, setTestPlaying] = useState(false);

  const avatarInput = useRef<HTMLInputElement>(null);
  const backgroundInput = useRef<HTMLInputElement>(null);
  const backgroundVideoInput = useRef<HTMLInputElement>(null);
  const audioInput = useRef<HTMLInputElement>(null);
  const testAudioRef = useRef<HTMLAudioElement | null>(null);

  const [lanyardData, setLanyardData] = useState<{
    status: "idle" | "loading" | "monitored" | "not_monitored";
    details?: string;
    spotify?: {
      song: string;
      artist: string;
    } | null;
  }>({ status: "idle" });

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [editingViews, setEditingViews] = useState(false);
  const [viewsInputVal, setViewsInputVal] = useState<string>(String(initial.views_count));
  const [savingViews, setSavingViews] = useState(false);

  useEffect(() => {
    if (!editingViews) {
      setViewsInputVal(String(form.views_count));
    }
  }, [form.views_count, editingViews]);

  async function handleUpdateViews(newCount: number) {
    if (newCount < 0 || !Number.isFinite(newCount)) return;
    setSavingViews(true);
    setEditorState({ kind: "saving", message: "Görüntülenme sayısı güncelleniyor…" });

    try {
      let succeeded = false;
      let errorMsg = "Sayaç güncellenemedi";

      const res = await fetch("/api/views", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ views_count: newCount }),
      });

      if (res.ok) {
        succeeded = true;
      } else {
        const errJson = await res.json().catch(() => null);
        if (errJson?.error) errorMsg = errJson.error;

        const supabase = createBrowserSupabase();
        const { error } = await supabase
          .from("profiles")
          .update({ views_count: newCount, updated_at: new Date().toISOString() })
          .eq("id", "main");
        if (!error) {
          succeeded = true;
        } else {
          errorMsg = error.message || errorMsg;
        }
      }

      if (!succeeded) {
        throw new Error(errorMsg);
      }

      setForm((prev) => ({ ...prev, views_count: newCount }));
      setOriginalForm((prev) => ({ ...prev, views_count: newCount }));
      setAnalyticsData((prev) => (prev ? { ...prev, totalViews: newCount } : null));
      setViewsInputVal(String(newCount));
      setEditingViews(false);
      setEditorState({
        kind: "success",
        message: `Görüntülenme sayısı başarıyla ${newCount.toLocaleString()} olarak güncellendi.`,
      });
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sayaç güncellenemedi";
      setEditorState({ kind: "error", message: `Hata: ${msg}` });
    } finally {
      setSavingViews(false);
    }
  }

  const hasUnsavedChanges = JSON.stringify(form) !== JSON.stringify(originalForm);

  const persistRef = useRef(persistProfileData);
  persistRef.current = persistProfileData;

  // Keyboard shortcut: Ctrl + S to save
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void persistRef.current();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch Lanyard presence status
  useEffect(() => {
    if (!form.discord_user_id) {
      setLanyardData({ status: "idle" });
      return;
    }

    let isMounted = true;
    setLanyardData((prev) => ({ ...prev, status: "loading" }));

    fetch(`https://api.lanyard.rest/v1/users/${form.discord_user_id}`)
      .then((res) => res.json())
      .then((payload) => {
        if (!isMounted) return;
        if (payload.success && payload.data) {
          const d = payload.data;
          const statusText =
            d.discord_status === "online"
              ? "Çevrim içi"
              : d.discord_status === "dnd"
                ? "Rahatsız Etmeyin"
                : d.discord_status === "idle"
                  ? "Boşta"
                  : "Çevrim dışı";

          let details = statusText;
          let spotifyInfo = null;

          if (d.listening_to_spotify && d.spotify) {
            details = `Spotify: ${d.spotify.song} - ${d.spotify.artist}`;
            spotifyInfo = { song: d.spotify.song, artist: d.spotify.artist };
          } else if (d.activities && d.activities.length > 0) {
            const act = d.activities.find((a: { type: number }) => a.type !== 4);
            if (act) details = `${act.name} oynuyor`;
          }

          setLanyardData({
            status: "monitored",
            details,
            spotify: spotifyInfo,
          });
        } else {
          setLanyardData({
            status: "not_monitored",
            details: "Lanyard sunucusuna katılmadı (discord.gg/lanyard)",
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setLanyardData({
            status: "not_monitored",
            details: "Lanyard API yanıt vermedi",
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [form.discord_user_id]);

  // Fetch Analytics data when analytics tab is opened
  useEffect(() => {
    if (activeTab === "analytics" && !analyticsData) {
      setLoadingAnalytics(true);
      fetch("/api/analytics")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.ok) {
            setAnalyticsData(data);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingAnalytics(false));
    }
  }, [activeTab, analyticsData]);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setEditorState({ kind: "idle", message: "" });
  }

  function updateLink(id: string, key: "label" | "url", value: string) {
    setForm((current) => ({
      ...current,
      links: current.links.map((link) =>
        link.id === id ? { ...link, [key]: value } : link,
      ),
    }));
  }

  function addLink() {
    if (form.links.length >= 12) {
      setEditorState({
        kind: "error",
        message: "En fazla 12 rozet bağlantısı ekleyebilirsin.",
      });
      return;
    }
    update("links", [
      ...form.links,
      { id: crypto.randomUUID(), label: "", url: "" },
    ]);
  }

  function addPresetLink(label: string, defaultUrl: string) {
    if (form.links.length >= 12) {
      setEditorState({
        kind: "error",
        message: "En fazla 12 rozet bağlantısı ekleyebilirsin.",
      });
      return;
    }
    update("links", [
      ...form.links,
      { id: crypto.randomUUID(), label, url: defaultUrl },
    ]);
  }

  function moveLink(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= form.links.length) return;
    const newLinks = [...form.links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[targetIndex];
    newLinks[targetIndex] = temp;
    update("links", newLinks);
  }

  function removeLink(id: string) {
    update(
      "links",
      form.links.filter((link) => link.id !== id),
    );
  }

  function addTypewriterLine() {
    if (form.typewriter_lines.length >= 10) {
      setEditorState({
        kind: "error",
        message: "En fazla 10 daktilo satırı ekleyebilirsin.",
      });
      return;
    }
    update("typewriter_lines", [...form.typewriter_lines, ""]);
  }

  function updateTypewriterLine(index: number, value: string) {
    const updated = [...form.typewriter_lines];
    updated[index] = value;
    update("typewriter_lines", updated);
  }

  function removeTypewriterLine(index: number) {
    const updated = form.typewriter_lines.filter((_, i) => i !== index);
    update("typewriter_lines", updated.length > 0 ? updated : [""]);
  }

  function toggleTestAudio() {
    if (!testAudioRef.current) return;
    if (testPlaying) {
      testAudioRef.current.pause();
      setTestPlaying(false);
    } else {
      testAudioRef.current
        .play()
        .then(() => setTestPlaying(true))
        .catch(() => setTestPlaying(false));
    }
  }

  async function uploadMedia(
    event: ChangeEvent<HTMLInputElement>,
    field: "avatar_url" | "background_url" | "background_video_url" | "audio_url",
    label: "avatar" | "background" | "background-video" | "audio",
  ) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    const isVideo = field === "background_video_url";
    const isAudio = field === "audio_url";

    let maxFileSize = MAX_IMAGE_FILE_SIZE;
    if (isVideo) maxFileSize = MAX_VIDEO_FILE_SIZE;
    if (isAudio) maxFileSize = MAX_AUDIO_FILE_SIZE;

    if (isAudio) {
      const isAudioType =
        file.type.startsWith("audio/") ||
        Boolean(AUDIO_EXTENSIONS[file.type]) ||
        /\.(mp3|wav|ogg)$/i.test(file.name);
      if (!isAudioType) {
        setEditorState({
          kind: "error",
          message: "MP3, WAV veya OGG biçiminde bir ses dosyası seç.",
        });
        return;
      }
    } else if (isVideo) {
      if (!VIDEO_EXTENSIONS[file.type]) {
        setEditorState({
          kind: "error",
          message: "MP4 veya WebM biçiminde bir video seç.",
        });
        return;
      }
    } else {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        setEditorState({
          kind: "error",
          message: "JPG, PNG, WebP veya AVIF biçiminde bir görsel seç.",
        });
        return;
      }
    }

    if (file.size > maxFileSize) {
      setEditorState({
        kind: "error",
        message: isAudio
          ? "Ses dosyası en fazla 20 MB olabilir."
          : isVideo
            ? "Arka plan videosu en fazla 20 MB olabilir."
            : "Görsel en fazla 5 MB olabilir.",
      });
      return;
    }

    setUploading(label);
    setEditorState({ kind: "idle", message: "" });

    try {
      const supabase = createBrowserSupabase();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Giriş süren dolmuş. Yeniden giriş yap.");

      const { data: isOwner, error: roleError } =
        await supabase.rpc("is_site_admin");
      if (roleError) throw roleError;
      if (!isOwner) throw new Error("Bu işlem için sahip yetkisi gerekiyor.");

      const imageExtensions: Record<string, string> = {
        "image/avif": "avif",
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      };

      let extension = "mp3";
      if (isAudio) {
        extension = AUDIO_EXTENSIONS[file.type] || "mp3";
      } else if (isVideo) {
        extension = VIDEO_EXTENSIONS[file.type] || "mp4";
      } else {
        extension = imageExtensions[file.type] || "jpg";
      }

      const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("profile-media")
        .upload(path, file, {
          cacheControl: "3600",
          contentType: file.type || (isAudio ? "audio/mpeg" : undefined),
          upsert: false,
        });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("profile-media").getPublicUrl(path);
      update(field, data.publicUrl);
      setEditorState({
        kind: "success",
        message: isAudio
          ? "Müzik dosyası yüklendi. Değişikliği kaydetmeyi unutma."
          : isVideo
            ? "Arka plan videosu yüklendi."
            : "Görsel yüklendi.",
      });
    } catch (error) {
      setEditorState({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Dosya yüklenemedi. Lütfen tekrar dene.",
      });
    } finally {
      setUploading(null);
    }
  }

  async function persistProfileData(): Promise<boolean> {
    setEditorState({ kind: "saving", message: "Değişiklikler kaydediliyor…" });

    try {
      const supabase = createBrowserSupabase();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Oturum süresi dolmuş. Yeniden giriş yap.");

      const { data: isOwner, error: roleError } =
        await supabase.rpc("is_site_admin");
      if (roleError) throw roleError;
      if (!isOwner) throw new Error("Yalnızca sahip hesabı profil düzenleyebilir.");

      const links: ProfileLink[] = [];
      for (const [index, link] of form.links.entries()) {
        const label = link.label.trim();
        const rawUrl = link.url.trim();
        if (!label && !rawUrl) continue;
        if (!label) {
          throw new Error(`${index + 1}. sıradaki bağlantı için bir etiket girmelisin.`);
        }
        if (!rawUrl) {
          throw new Error(`"${label}" rozeti için bir profil adresi girmelisin.`);
        }
        const normalized = normalizeWebUrl(rawUrl);
        if (!normalized) {
          throw new Error(`"${label}" için geçerli bir web adresi girmelisin.`);
        }
        links.push({
          id: link.id || crypto.randomUUID(),
          label,
          url: normalized,
        });
      }

      const cleanTypewriterLines = form.typewriter_lines
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const safeVolume = clampNumber(form.default_volume, 50, 0, 100);
      const safeBgVideoOpacity = clampNumber(form.background_video_opacity, 70, 0, 100);
      const safeCardOpacity = clampNumber(form.card_opacity, 75, 10, 100);

      // Omit views_count to avoid resetting counter
      const formWithoutViews: Record<string, unknown> = { ...form };
      delete formWithoutViews.views_count;

      const fullPayload = {
        ...formWithoutViews,
        background_video_opacity: safeBgVideoOpacity,
        card_opacity: safeCardOpacity,
        display_name: form.display_name.trim(),
        headline: form.headline.trim(),
        bio: form.bio.trim(),
        location: form.location.trim(),
        audio_title: form.audio_title.trim() || "Arka Plan Müziği",
        audio_artist: form.audio_artist.trim(),
        default_volume: safeVolume,
        click_to_enter_text: form.click_to_enter_text.trim() || "click to enter",
        typewriter_lines:
          cleanTypewriterLines.length > 0
            ? cleanTypewriterLines
            : ["Welcome to my profile.", "Moon Knight aesthetic."],
        enable_custom_cursor: Boolean(form.enable_custom_cursor),
        enable_tilt: Boolean(form.enable_tilt),
        enable_moon_badge: Boolean(form.enable_moon_badge),
        moon_badge_title: form.moon_badge_title.trim() || "Moon Knight",
        enable_lunar_effects: Boolean(form.enable_lunar_effects),
        card_border_effect: form.card_border_effect || "lunar_aurora",
        name_effect: form.name_effect || "lunar_shimmer",
        cursor_style: form.cursor_style || "neon_dot",
        cursor_trail: form.cursor_trail || "stardust",
        enable_click_ripple: Boolean(form.enable_click_ripple),
        links,
        updated_at: new Date().toISOString(),
      };

      let { error: upsertError } = await supabase.from("profiles").upsert(
        fullPayload,
        { onConflict: "id" },
      );

      // Graceful fallback if new effect columns are missing in Supabase (PGRST204)
      if (
        upsertError &&
        (upsertError.code === "PGRST204" ||
          upsertError.message?.toLowerCase().includes("column"))
      ) {
        console.warn(
          "New effect columns not detected in Supabase, saving core profile fields:",
          upsertError.message,
        );
        setNeedsSchemaMigration(true);

        const corePayload = {
          id: form.id || "main",
          display_name: form.display_name.trim(),
          headline: form.headline.trim(),
          bio: form.bio.trim(),
          location: form.location.trim(),
          avatar_url: form.avatar_url,
          background_url: form.background_url,
          background_video_url: form.background_video_url,
          audio_url: form.audio_url,
          audio_title: form.audio_title.trim() || "Arka Plan Müziği",
          audio_artist: form.audio_artist.trim(),
          default_volume: safeVolume,
          click_to_enter_text: form.click_to_enter_text.trim() || "click to enter",
          typewriter_lines:
            cleanTypewriterLines.length > 0
              ? cleanTypewriterLines
              : ["Welcome to my profile.", "Moon Knight aesthetic."],
          discord_user_id: form.discord_user_id,
          discord_username: form.discord_username,
          discord_global_name: form.discord_global_name,
          discord_avatar_url: form.discord_avatar_url,
          accent_color: form.accent_color,
          surface_color: form.surface_color,
          links,
          is_published: form.is_published,
          updated_at: new Date().toISOString(),
        };

        const fallbackResult = await supabase
          .from("profiles")
          .upsert(corePayload, { onConflict: "id" });
        upsertError = fallbackResult.error;
      }

      if (upsertError) {
        throw new Error(
          upsertError.message ||
            (typeof upsertError === "object" ? JSON.stringify(upsertError) : String(upsertError)),
        );
      }

      const updatedForm: Profile = {
        ...form,
        links,
        default_volume: safeVolume,
        background_video_opacity: safeBgVideoOpacity,
        card_opacity: safeCardOpacity,
        typewriter_lines:
          cleanTypewriterLines.length > 0
            ? cleanTypewriterLines
            : ["Welcome to my profile.", "Moon Knight aesthetic."],
      };

      setForm(updatedForm);
      setOriginalForm(updatedForm);
      setEditorState({
        kind: "success",
        message: "Değişiklikler kaydedildi ve profilin güncellendi.",
      });
      router.refresh();
      return true;
    } catch (error: unknown) {
      const err = error as { message?: string };
      const errMessage =
        err?.message ||
        (error instanceof Error ? error.message : null) ||
        (typeof error === "object" ? JSON.stringify(error) : String(error));

      console.error("Profile save failed:", errMessage, error);
      setEditorState({
        kind: "error",
        message: `Kaydedilemedi: ${errMessage}`,
      });
      return false;
    }
  }

  async function handleDiscordConnect() {
    setEditorState({
      kind: "saving",
      message: "Değişiklikler kaydediliyor ve Discord'a yönlendiriliyorsunuz…",
    });

    const success = await persistProfileData();
    if (success) {
      window.location.href = "/api/discord/connect";
    }
  }

  function copyMigrationSql() {
    const sql = `alter table public.profiles
  add column if not exists background_video_url text,
  add column if not exists background_video_opacity integer not null default 70,
  add column if not exists card_opacity integer not null default 75,
  add column if not exists audio_url text,
  add column if not exists audio_title text not null default 'Arka Plan Müziği',
  add column if not exists audio_artist text not null default '',
  add column if not exists default_volume integer not null default 50,
  add column if not exists click_to_enter_text text not null default 'click to enter',
  add column if not exists typewriter_lines text[] not null default array['Welcome to my profile.', 'Moon Knight aesthetic.']::text[],
  add column if not exists enable_custom_cursor boolean not null default true,
  add column if not exists enable_tilt boolean not null default true,
  add column if not exists enable_moon_badge boolean not null default true,
  add column if not exists moon_badge_title text not null default 'Moon Knight',
  add column if not exists enable_lunar_effects boolean not null default true,
  add column if not exists card_border_effect text not null default 'lunar_aurora',
  add column if not exists name_effect text not null default 'lunar_shimmer',
  add column if not exists cursor_style text not null default 'neon_dot',
  add column if not exists cursor_trail text not null default 'stardust',
  add column if not exists enable_click_ripple boolean not null default true,
  add column if not exists views_count bigint not null default 0,
  add column if not exists discord_user_id text,
  add column if not exists discord_username text,
  add column if not exists discord_global_name text,
  add column if not exists discord_avatar_url text;

create table if not exists public.profile_views_log (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null default 'main',
  viewed_at timestamptz not null default now(),
  device_type text not null default 'desktop',
  browser text not null default 'Chrome',
  country_code text not null default 'TR',
  country_name text not null default 'Türkiye',
  referrer text not null default 'Doğrudan (Direct / URL)'
);

alter table public.profile_views_log enable row level security;
grant select, insert on public.profile_views_log to anon, authenticated;

create or replace function public.increment_profile_views(profile_slug text default 'main')
returns bigint
language sql
security definer
as $$
  update public.profiles
  set views_count = coalesce(views_count, 0) + 1
  where id = profile_slug
  returning views_count;
$$;

grant execute on function public.increment_profile_views(text) to anon, authenticated;

create or replace function public.set_profile_views(new_count bigint, profile_slug text default 'main')
returns bigint
language plpgsql
security definer
as $$
begin
  if not (select public.is_site_admin()) then
    raise exception 'Unauthorized';
  end if;

  update public.profiles
  set views_count = greatest(0, new_count)
  where id = profile_slug;
  return greatest(0, new_count);
end;
$$;

grant execute on function public.set_profile_views(bigint, text) to authenticated;

notify pgrst, 'reload schema';`;

    navigator.clipboard.writeText(sql).then(() => {
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 2500);
    });
  }

  // Audio source identification
  const hasExplicitAudio = Boolean(form.audio_url);
  const hasVideoAudio = !hasExplicitAudio && Boolean(form.background_video_url);

  return (
    <div className="studio-dashboard">
      {/* Live Custom Cursor Preview inside Admin Studio */}
      <CustomCursor
        enabled={form.enable_custom_cursor}
        cursorStyle={form.cursor_style}
        cursorTrail={form.cursor_trail}
        enableClickRipple={form.enable_click_ripple}
      />

      {/* Schema Migration Alert if columns are missing */}
      {needsSchemaMigration ? (
        <div className="studio-migration-banner" role="alert">
          <div className="migration-header">
            <Sparkles size={16} className="migration-icon" />
            <div className="migration-text">
              <strong>Supabase Şema Güncellemesi Gerekiyor</strong>
              <p>
                Yeni efekt sütunları Supabase tablonuzda henüz oluşturulmadı.
                Aşağıdaki SQL komutunu Supabase SQL Editor&apos;e yapıştırıp çalıştırın.
              </p>
            </div>
            <button
              type="button"
              onClick={copyMigrationSql}
              className="studio-btn studio-btn-primary migration-copy-btn"
            >
              {sqlCopied ? <Check size={14} /> : <Copy size={14} />}
              <span>{sqlCopied ? "Kopyalandı!" : "SQL Kopyala"}</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Cyber Metric Stats Row */}
      <div className="studio-stats-grid">
        <div className="cyber-stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Toplam Görüntülenme</span>
            <div className="stat-pulse-beacon" />
          </div>
          <div className="stat-card-body">
            {editingViews ? (
              <div className="stat-edit-row">
                <input
                  type="number"
                  min={0}
                  value={viewsInputVal}
                  onChange={(e) => setViewsInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleUpdateViews(Math.max(0, parseInt(viewsInputVal, 10) || 0));
                    } else if (e.key === "Escape") {
                      setEditingViews(false);
                      setViewsInputVal(String(form.views_count));
                    }
                  }}
                  className="cyber-input stat-edit-input"
                  placeholder="Sayı"
                  disabled={savingViews}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateViews(Math.max(0, parseInt(viewsInputVal, 10) || 0))
                  }
                  disabled={savingViews}
                  className="studio-btn studio-btn-sm studio-btn-primary"
                  title="Sayacı Kaydet"
                >
                  {savingViews ? <LoaderCircle size={12} className="spin" /> : <Check size={12} />}
                  <span>Kaydet</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateViews(0)}
                  disabled={savingViews}
                  className="studio-btn studio-btn-sm studio-btn-ghost danger"
                  title="Sayacı 0 Yap"
                >
                  <span>Sıfırla</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingViews(false);
                    setViewsInputVal(String(form.views_count));
                  }}
                  disabled={savingViews}
                  className="studio-btn studio-btn-sm studio-btn-ghost"
                  title="İptal"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <>
                <div className="stat-number-row">
                  <span className="stat-number">{form.views_count.toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setViewsInputVal(String(form.views_count));
                      setEditingViews(true);
                    }}
                    className="studio-btn-tiny-edit"
                    title="Görüntülenme sayısını manuel düzelt veya sıfırla"
                  >
                    <span>Düzenle</span>
                  </button>
                </div>
                <span className="stat-subtext">24 saat tekil sayaç</span>
              </>
            )}
          </div>
        </div>

        <div className="cyber-stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Discord & Spotify</span>
            <div
              className={`stat-status-dot ${
                lanyardData.status === "monitored"
                  ? "is-online"
                  : lanyardData.status === "loading"
                    ? "is-loading"
                    : "is-idle"
              }`}
            />
          </div>
          <div className="stat-card-body">
            <span className="stat-title-highlight">
              {lanyardData.status === "monitored"
                ? form.discord_global_name || form.discord_username || "Warxy"
                : form.discord_user_id
                  ? "Lanyard Bekleniyor"
                  : "Bağlı Değil"}
            </span>
            <span className="stat-subtext truncate">
              {lanyardData.details || "api.lanyard.rest bağlantısı"}
            </span>
          </div>
        </div>

        <div className="cyber-stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Müzik / Ses Motoru</span>
            <Music size={14} className="stat-icon" />
          </div>
          <div className="stat-card-body">
            <span className="stat-title-highlight">
              {hasExplicitAudio
                ? "Özel MP3 Yüklü"
                : hasVideoAudio
                  ? "MP4 Video Sesi Aktif"
                  : "Ses Yok"}
            </span>
            <span className="stat-subtext">
              Başlangıç Sesi: %{form.default_volume}
            </span>
          </div>
        </div>

        <div className="cyber-stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Ay Teması & Rozetler</span>
            <Moon size={14} className="stat-icon" />
          </div>
          <div className="stat-card-body">
            <span className="stat-title-highlight">
              {form.enable_moon_badge ? "🌙 Moon Knight Aktif" : "Rozet Kapalı"}
            </span>
            <span className="stat-subtext">
              {form.links.length} Sosyal Rozet • {form.enable_lunar_effects ? "Kozmik Toz Açık" : "Efekt Kapalı"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Studio Workspace: Left Editor Tabs | Right Live Preview */}
      <div className="studio-split-layout">
        {/* Left Column: Category Tabs & Settings */}
        <div className="studio-left-column">
          {/* Segmented Studio Tabs Bar */}
          <nav className="studio-tabs-bar" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "identity"}
              onClick={() => setActiveTab("identity")}
              className={`studio-tab-btn ${activeTab === "identity" ? "is-active" : ""}`}
            >
              <User size={15} />
              <span>Kimlik & Bio</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "design"}
              onClick={() => setActiveTab("design")}
              className={`studio-tab-btn ${activeTab === "design" ? "is-active" : ""}`}
            >
              <Palette size={15} />
              <span>Tasarım & Medya</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "audio"}
              onClick={() => setActiveTab("audio")}
              className={`studio-tab-btn ${activeTab === "audio" ? "is-active" : ""}`}
            >
              <Music size={15} />
              <span>Müzik & Ses</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "effects"}
              onClick={() => setActiveTab("effects")}
              className={`studio-tab-btn ${activeTab === "effects" ? "is-active" : ""}`}
            >
              <Sparkles size={15} />
              <span>Rozetler & Efektler</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "discord"}
              onClick={() => setActiveTab("discord")}
              className={`studio-tab-btn ${activeTab === "discord" ? "is-active" : ""}`}
            >
              <MessageCircle size={15} />
              <span>Discord Lanyard</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "socials"}
              onClick={() => setActiveTab("socials")}
              className={`studio-tab-btn ${activeTab === "socials" ? "is-active" : ""}`}
            >
              <Globe size={15} />
              <span>Sosyal Rozetler ({form.links.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "analytics"}
              onClick={() => setActiveTab("analytics")}
              className={`studio-tab-btn ${activeTab === "analytics" ? "is-active" : ""}`}
            >
              <BarChart3 size={15} />
              <span>Analitik</span>
            </button>
          </nav>

          {/* Tab Content Panels */}
          <div className="studio-tab-content">
            {/* 1. KIMLIK & BIO TAB */}
            {activeTab === "identity" ? (
              <div className="studio-panel-pane">
                <div className="pane-header">
                  <h3>Profil Kimliği & Daktilo Biyografi</h3>
                  <p>Kartın üzerinde ve tarayıcı sekmesinde görünecek temel bilgiler.</p>
                </div>

                <div className="cyber-fields-grid">
                  <div className="cyber-field">
                    <label className="cyber-label">
                      <span>Görünen İsim</span>
                      <span className="field-hint">Kartın ortasında büyük neon yazı</span>
                    </label>
                    <input
                      type="text"
                      maxLength={60}
                      value={form.display_name}
                      onChange={(e) => update("display_name", e.target.value)}
                      placeholder="Örn: Emir"
                      className="cyber-input"
                    />
                  </div>

                  <div className="cyber-field">
                    <label className="cyber-label">
                      <span>Kısa Başlık / Ünvan</span>
                      <span className="field-hint">İsteğe bağlı alt başlık</span>
                    </label>
                    <input
                      type="text"
                      maxLength={120}
                      value={form.headline}
                      onChange={(e) => update("headline", e.target.value)}
                      placeholder="Örn: developer / gamer"
                      className="cyber-input"
                    />
                  </div>

                  <div className="cyber-field full-width">
                    <div className="cyber-field-header">
                      <label className="cyber-label">
                        <span>Daktilo Biyografi Satırları</span>
                        <span className="field-hint">Sırayla yazılıp silinen daktilo animasyonu</span>
                      </label>
                      <button
                        type="button"
                        onClick={addTypewriterLine}
                        className="studio-btn studio-btn-sm studio-btn-secondary"
                        disabled={form.typewriter_lines.length >= 10}
                      >
                        <Plus size={13} />
                        <span>Satır Ekle</span>
                      </button>
                    </div>

                    <div className="typewriter-lines-list">
                      {form.typewriter_lines.map((line, index) => (
                        <div key={index} className="typewriter-line-item">
                          <span className="line-number">{index + 1}</span>
                          <input
                            type="text"
                            value={line}
                            onChange={(e) => updateTypewriterLine(index, e.target.value)}
                            placeholder={`Daktilo satırı ${index + 1}...`}
                            className="cyber-input"
                          />
                          <button
                            type="button"
                            onClick={() => removeTypewriterLine(index)}
                            className="studio-icon-btn danger"
                            title="Satırı Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="cyber-field full-width">
                    <label className="cyber-label">
                      <span>Sabit Biyografi Metni (Yedek)</span>
                      <span className="field-hint">Daktilo efekti yüklenmezse veya arama motorları için</span>
                    </label>
                    <textarea
                      rows={3}
                      maxLength={500}
                      value={form.bio}
                      onChange={(e) => update("bio", e.target.value)}
                      placeholder="Profilin hakkında kısa bir açıklama..."
                      className="cyber-textarea"
                    />
                  </div>

                  <div className="cyber-field">
                    <label className="cyber-label">
                      <span>Konum</span>
                      <span className="field-hint">Kartta konum pini ile gösterilir</span>
                    </label>
                    <input
                      type="text"
                      maxLength={60}
                      value={form.location}
                      onChange={(e) => update("location", e.target.value)}
                      placeholder="Örn: Istanbul, Turkey"
                      className="cyber-input"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {/* 2. TASARIM & MEDYA TAB */}
            {activeTab === "design" ? (
              <div className="studio-panel-pane">
                <div className="pane-header">
                  <h3>Tasarım & Görsel Medya</h3>
                  <p>Profil fotoğrafı, arka plan videoları ve cyber renk paletleri.</p>
                </div>

                {/* Media Assets Section */}
                <div className="studio-assets-section">
                  {/* Avatar Upload */}
                  <div className="studio-asset-card">
                    <div className="asset-media-preview avatar-preview">
                      {form.avatar_url ? (
                        <img src={form.avatar_url} alt="Avatar" />
                      ) : form.discord_avatar_url ? (
                        <img src={form.discord_avatar_url} alt="Discord Avatar" />
                      ) : (
                        <div className="asset-fallback-letter">
                          {(form.display_name[0] || "E").toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="asset-info">
                      <h4>Profil Fotoğrafı</h4>
                      <p>Önerilen kare JPG/PNG (Maks 5 MB). Boş bırakılırsa Discord avatarı kullanılır.</p>
                      <div className="asset-actions">
                        <label className="studio-btn studio-btn-sm studio-btn-secondary file-upload-btn">
                          {uploading === "avatar" ? (
                            <LoaderCircle size={13} className="spin" />
                          ) : (
                            <Upload size={13} />
                          )}
                          <span>Görsel Yükle</span>
                          <input
                            ref={avatarInput}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            disabled={uploading === "avatar"}
                            onChange={(e) => uploadMedia(e, "avatar_url", "avatar")}
                            className="hidden-file-input"
                          />
                        </label>
                        {form.avatar_url ? (
                          <button
                            type="button"
                            onClick={() => update("avatar_url", null)}
                            className="studio-btn studio-btn-sm studio-btn-ghost danger"
                          >
                            Kaldır
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Background Video Upload */}
                  <div className="studio-asset-card">
                    <div className="asset-media-preview video-preview">
                      {form.background_video_url ? (
                        <video
                          src={form.background_video_url}
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <Play size={20} className="empty-icon" />
                      )}
                    </div>
                    <div className="asset-info">
                      <h4>Arka Plan Videosu (MP4 / WebM)</h4>
                      <p>
                        Tam ekran döngülü video (Maks 20 MB). Video sesi &quot;Click to Enter&quot; ile
                        otomatik çözülür ve müzik çalar ile entegre çalışır.
                      </p>
                      <div className="asset-actions">
                        <label className="studio-btn studio-btn-sm studio-btn-secondary file-upload-btn">
                          {uploading === "background-video" ? (
                            <LoaderCircle size={13} className="spin" />
                          ) : (
                            <Upload size={13} />
                          )}
                          <span>Video Yükle</span>
                          <input
                            ref={backgroundVideoInput}
                            type="file"
                            accept="video/mp4,video/webm"
                            disabled={uploading === "background-video"}
                            onChange={(e) =>
                              uploadMedia(e, "background_video_url", "background-video")
                            }
                            className="hidden-file-input"
                          />
                        </label>
                        {form.background_video_url ? (
                          <button
                            type="button"
                            onClick={() => update("background_video_url", null)}
                            className="studio-btn studio-btn-sm studio-btn-ghost danger"
                          >
                            Videoyu Kaldır
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Background Static Image */}
                  <div className="studio-asset-card">
                    <div className="asset-media-preview image-preview">
                      {form.background_url ? (
                        <img src={form.background_url} alt="Arka Plan" />
                      ) : (
                        <Palette size={20} className="empty-icon" />
                      )}
                    </div>
                    <div className="asset-info">
                      <h4>Sabit Arka Plan Görseli</h4>
                      <p>Video yoksa gösterilecek sabit görsel veya video yükleme posteri.</p>
                      <div className="asset-actions">
                        <label className="studio-btn studio-btn-sm studio-btn-secondary file-upload-btn">
                          {uploading === "background" ? (
                            <LoaderCircle size={13} className="spin" />
                          ) : (
                            <Upload size={13} />
                          )}
                          <span>Görsel Yükle</span>
                          <input
                            ref={backgroundInput}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            disabled={uploading === "background"}
                            onChange={(e) => uploadMedia(e, "background_url", "background")}
                            className="hidden-file-input"
                          />
                        </label>
                        {form.background_url ? (
                          <button
                            type="button"
                            onClick={() => update("background_url", null)}
                            className="studio-btn studio-btn-sm studio-btn-ghost danger"
                          >
                            Kaldır
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Opaklık & Görünürlük Kontrolleri */}
                <div className="studio-opacity-section">
                  <div className="section-title-wrap">
                    <h4>Opaklık & Görünürlük Kontrolleri</h4>
                    <span className="field-hint">
                      Arka plan videosunun netliği ve merkezdeki profil kartının cam saydamlığı
                    </span>
                  </div>

                  <div className="opacity-controls-grid">
                    {/* Background Video Opacity */}
                    <div className="cyber-field full-width">
                      <div className="cyber-field-header">
                        <label className="cyber-label">
                          <span>Arka Plan Video Opaklığı (%{form.background_video_opacity ?? 70})</span>
                          <span className="field-hint">
                            Arka plan videosunun görünürlük ve parlaklık seviyesi. Video soluk veya karanlıksa artırabilirsiniz.
                          </span>
                        </label>
                      </div>
                      <div className="volume-slider-wrap">
                        <input
                          type="range"
                          min={10}
                          max={100}
                          step={5}
                          value={form.background_video_opacity ?? 70}
                          onChange={(e) =>
                            update("background_video_opacity", Number(e.target.value))
                          }
                          className="cyber-range"
                        />
                        <span className="volume-value-badge">
                          %{form.background_video_opacity ?? 70}
                        </span>
                      </div>
                    </div>

                    {/* Center Card Opacity */}
                    <div className="cyber-field full-width mt-2">
                      <div className="cyber-field-header">
                        <label className="cyber-label">
                          <span>Profil Kartı Opaklığı (%{form.card_opacity ?? 75})</span>
                          <span className="field-hint">
                            Merkezdeki profil kartının buzlu cam zemin saydamlığı. Düşürerek arkadaki videoyu daha çok gösterebilirsiniz.
                          </span>
                        </label>
                      </div>
                      <div className="volume-slider-wrap">
                        <input
                          type="range"
                          min={10}
                          max={100}
                          step={5}
                          value={form.card_opacity ?? 75}
                          onChange={(e) => update("card_opacity", Number(e.target.value))}
                          className="cyber-range"
                        />
                        <span className="volume-value-badge">
                          %{form.card_opacity ?? 75}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cyber Colors & Preset Themes */}
                <div className="studio-colors-section">
                  <div className="section-title-wrap">
                    <h4>Cyber Renk Paleti & Hazır Temalar</h4>
                    <span className="field-hint">Tek tıkla hazır siber temaları uygula</span>
                  </div>

                  <div className="preset-themes-grid">
                    {PRESET_COLOR_THEMES.map((theme) => {
                      const isCurrent =
                        form.accent_color.toLowerCase() === theme.accent.toLowerCase();
                      return (
                        <button
                          key={theme.name}
                          type="button"
                          onClick={() => {
                            update("accent_color", theme.accent);
                            update("surface_color", theme.surface);
                          }}
                          className={`preset-theme-card ${isCurrent ? "is-active" : ""}`}
                        >
                          <div
                            className="theme-color-chip"
                            style={{ background: theme.accent }}
                          />
                          <div className="theme-meta">
                            <strong>{theme.name}</strong>
                            <span>{theme.description}</span>
                          </div>
                          {isCurrent ? <Check size={14} className="theme-check" /> : null}
                        </button>
                      );
                    })}
                  </div>

                  <div className="custom-colors-row">
                    <div className="cyber-field">
                      <label className="cyber-label">
                        <span>Vurgu Rengi (Accent)</span>
                      </label>
                      <div className="color-picker-group">
                        <input
                          type="color"
                          value={form.accent_color}
                          onChange={(e) => update("accent_color", e.target.value)}
                          className="color-input-bubble"
                        />
                        <input
                          type="text"
                          value={form.accent_color}
                          onChange={(e) => update("accent_color", e.target.value)}
                          className="cyber-input mono-font"
                        />
                      </div>
                    </div>

                    <div className="cyber-field">
                      <label className="cyber-label">
                        <span>Zemin Rengi (Surface)</span>
                      </label>
                      <div className="color-picker-group">
                        <input
                          type="color"
                          value={form.surface_color}
                          onChange={(e) => update("surface_color", e.target.value)}
                          className="color-input-bubble"
                        />
                        <input
                          type="text"
                          value={form.surface_color}
                          onChange={(e) => update("surface_color", e.target.value)}
                          className="cyber-input mono-font"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* 3. MÜZIK & SES TAB */}
            {activeTab === "audio" ? (
              <div className="studio-panel-pane">
                <div className="pane-header">
                  <h3>Müzik & Ses Motoru</h3>
                  <p>
                    Kullanıcı sayfaya giriş yaptığında (&quot;Click to Enter&quot;) çalacak ses kaynağı.
                  </p>
                </div>

                {/* Video Audio Notice if video is present */}
                {form.background_video_url ? (
                  <div className="studio-callout-box">
                    <Music size={18} className="callout-icon" />
                    <div className="callout-text">
                      <strong>MP4 Video Sesi Aktif</strong>
                      <p>
                        Yüklediğin arka plan videosunun içindeki ses otomatik olarak algılandı.
                        Ayrı bir MP3 yüklemezsen, video sesi açılır ve üst bardaki ses kontrolcüsüyle
                        yönetilir.
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Dedicated MP3 Asset Field */}
                <div className="studio-asset-card audio-source-card">
                  <audio ref={testAudioRef} src={form.audio_url || undefined} preload="metadata" />
                  <div className="asset-media-preview audio-preview">
                    {form.audio_url ? (
                      <button
                        type="button"
                        onClick={toggleTestAudio}
                        className="studio-audio-test-btn"
                        title={testPlaying ? "Durdur" : "Test Oynat"}
                      >
                        {testPlaying ? <Pause size={18} /> : <Play size={18} />}
                      </button>
                    ) : (
                      <Music size={22} className="empty-icon" />
                    )}
                  </div>
                  <div className="asset-info">
                    <h4>Özel Arka Plan Müziği (MP3 / WAV / OGG)</h4>
                    <p>
                      {form.audio_url
                        ? "Özel ses dosyası yüklendi. Test butonuna basarak dinleyebilirsin."
                        : "Video sesinden bağımsız özel bir müzik parçası yükle (Maks 20 MB)."}
                    </p>
                    <div className="asset-actions">
                      <label className="studio-btn studio-btn-sm studio-btn-secondary file-upload-btn">
                        {uploading === "audio" ? (
                          <LoaderCircle size={13} className="spin" />
                        ) : (
                          <Upload size={13} />
                        )}
                        <span>Ses Dosyası Seç</span>
                        <input
                          ref={audioInput}
                          type="file"
                          accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
                          disabled={uploading === "audio"}
                          onChange={(e) => uploadMedia(e, "audio_url", "audio")}
                          className="hidden-file-input"
                        />
                      </label>
                      {form.audio_url ? (
                        <button
                          type="button"
                          onClick={() => update("audio_url", null)}
                          className="studio-btn studio-btn-sm studio-btn-ghost danger"
                        >
                          Müziği Kaldır
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="cyber-fields-grid mt-4">
                  <div className="cyber-field">
                    <label className="cyber-label">
                      <span>Şarkı Başlığı</span>
                      <span className="field-hint">Üst bar ses çalarında görünür</span>
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={form.audio_title}
                      onChange={(e) => update("audio_title", e.target.value)}
                      placeholder="Örn: Arka Plan Müziği"
                      className="cyber-input"
                    />
                  </div>

                  <div className="cyber-field">
                    <label className="cyber-label">
                      <span>Sanatçı Adı (isteğe bağlı)</span>
                      <span className="field-hint">Şarkı başlığının yanında gösterilir</span>
                    </label>
                    <input
                      type="text"
                      maxLength={80}
                      value={form.audio_artist}
                      onChange={(e) => update("audio_artist", e.target.value)}
                      placeholder="Örn: Moon Knight OST"
                      className="cyber-input"
                    />
                  </div>

                  <div className="cyber-field full-width">
                    <div className="cyber-field-header">
                      <label className="cyber-label">
                        <span>Başlangıç Ses Seviyesi (%{form.default_volume})</span>
                        <span className="field-hint">Click to Enter sonrası açılış ses düzeyi</span>
                      </label>
                    </div>
                    <div className="volume-slider-wrap">
                      <Volume2 size={16} className="volume-icon" />
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={form.default_volume}
                        onChange={(e) => update("default_volume", Number(e.target.value))}
                        className="cyber-range"
                      />
                      <span className="volume-value-badge">%{form.default_volume}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* 4. ROZETLER & EFEKTLER TAB */}
            {activeTab === "effects" ? (
              <div className="studio-panel-pane">
                <div className="pane-header">
                  <h3>VIP Rozetler & Siber Efektler</h3>
                  <p>Kullanıcı adı parıltıları, özel nişangah/ay imleçleri, yıldız tozu ve rozetler.</p>
                </div>

                {/* 1. Name FX Selection */}
                <div className="border-effects-section">
                  <div className="section-title-wrap">
                    <h4>Kullanıcı Adı Efekti (Name FX)</h4>
                    <span className="field-hint">Kart üzerindeki isminin parıldama, RGB lazer veya siber glitch stili</span>
                  </div>

                  <div className="fx-preset-grid">
                    {NAME_EFFECT_PRESETS.map((eff) => {
                      const isActive = (form.name_effect || "lunar_shimmer") === eff.id;
                      return (
                        <button
                          key={eff.id}
                          type="button"
                          onClick={() => update("name_effect", eff.id)}
                          className={`fx-preset-btn ${isActive ? "is-active" : ""}`}
                        >
                          <div className="fx-preset-name">
                            <span>{eff.title}</span>
                            {isActive ? <Check size={14} className="theme-check" /> : null}
                          </div>
                          <span className="fx-preset-desc">{eff.desc}</span>
                          <div
                            className={`fx-preview-pill name-fx-${eff.id}`}
                            data-text={form.display_name.trim() || "Warxy"}
                          >
                            {form.display_name.trim() || "Warxy"}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Card Border & Glow Effect Selection */}
                <div className="border-effects-section mt-4">
                  <div className="section-title-wrap">
                    <h4>Kart Çerçeve & Parıltı Efekti (Border FX)</h4>
                    <span className="field-hint">Profil kartının etrafında dönecek veya parıldayacak efekt</span>
                  </div>

                  <div className="border-effects-grid">
                    {BORDER_EFFECT_PRESETS.map((eff) => {
                      const isActive =
                        (form.card_border_effect || "lunar_aurora") === eff.id;
                      return (
                        <button
                          key={eff.id}
                          type="button"
                          onClick={() => update("card_border_effect", eff.id)}
                          className={`border-effect-card ${isActive ? "is-active" : ""}`}
                        >
                          <div className={`fx-bubble-ring fx-bubble-${eff.id}`}>
                            <div className="fx-bubble-inner" />
                          </div>
                          <div className="effect-meta">
                            <strong>{eff.title}</strong>
                            <span>{eff.desc}</span>
                          </div>
                          {isActive ? (
                            <Check size={15} className="theme-check" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Mouse Cursor & Particle Engine Studio */}
                <div className="border-effects-section mt-4">
                  <div className="section-title-wrap">
                    <h4>Mouse İmleç & Partikül Stüdyosu</h4>
                    <span className="field-hint">Masaüstü ziyaretçiler için özel imleç, süzülen yıldız tozu izi ve tıklama şok dalgası</span>
                  </div>

                  {/* Enable Custom Cursor Switch */}
                  <div className="effect-toggle-card mb-3">
                    <div className="effect-card-info">
                      <div className="effect-title-row">
                        <div className="cursor-icon-dot" />
                        <strong>Özel İmleç Sistemi</strong>
                      </div>
                      <p>Masaüstü ziyaretçilerde tarayıcı okunu gizleyip seçtiğin fütüristik imleci aktif eder.</p>
                    </div>
                    <label className="cyber-switch">
                      <input
                        type="checkbox"
                        checked={Boolean(form.enable_custom_cursor)}
                        onChange={(e) => update("enable_custom_cursor", e.target.checked)}
                      />
                      <span className="slider round" />
                    </label>
                  </div>

                  {form.enable_custom_cursor ? (
                    <>
                      {/* Cursor Style Selection */}
                      <div className="mt-3">
                        <label className="cyber-label">
                          <span>İmleç Tarzı (Cursor Style)</span>
                          <span className="field-hint">Fare imlecinin görsel stili</span>
                        </label>
                        <div className="fx-preset-grid">
                          {CURSOR_STYLE_PRESETS.map((cur) => {
                            const isActive = (form.cursor_style || "neon_dot") === cur.id;
                            return (
                              <button
                                key={cur.id}
                                type="button"
                                onClick={() => update("cursor_style", cur.id)}
                                className={`fx-preset-btn ${isActive ? "is-active" : ""}`}
                              >
                                <div className="fx-preset-name">
                                  <span>{cur.title}</span>
                                  {isActive ? <Check size={14} className="theme-check" /> : null}
                                </div>
                                <span className="fx-preset-desc">{cur.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Cursor Trail Selection */}
                      <div className="mt-4">
                        <label className="cyber-label">
                          <span>İmleç Takip İzi (Cursor Trail)</span>
                          <span className="field-hint">Fare hareket ettikçe arkasında bırakacağı parçacık efekti</span>
                        </label>
                        <div className="fx-preset-grid">
                          {CURSOR_TRAIL_PRESETS.map((trl) => {
                            const isActive = (form.cursor_trail || "stardust") === trl.id;
                            return (
                              <button
                                key={trl.id}
                                type="button"
                                onClick={() => update("cursor_trail", trl.id)}
                                className={`fx-preset-btn ${isActive ? "is-active" : ""}`}
                              >
                                <div className="fx-preset-name">
                                  <span>{trl.title}</span>
                                  {isActive ? <Check size={14} className="theme-check" /> : null}
                                </div>
                                <span className="fx-preset-desc">{trl.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Click Shockwave Ripple Toggle */}
                      <div className="effect-toggle-card mt-3">
                        <div className="effect-card-info">
                          <div className="effect-title-row">
                            <Sparkles size={16} className="effect-icon" />
                            <strong>Tıklama Şok Dalgası (Click Ripple)</strong>
                          </div>
                          <p>Sayfada veya kartta herhangi bir yere tıklandığında ay ışığı dalgası patlar.</p>
                        </div>
                        <label className="cyber-switch">
                          <input
                            type="checkbox"
                            checked={Boolean(form.enable_click_ripple)}
                            onChange={(e) => update("enable_click_ripple", e.target.checked)}
                          />
                          <span className="slider round" />
                        </label>
                      </div>
                    </>
                  ) : null}
                </div>

                {/* 4. Toggles Grid */}
                <div className="effects-toggles-grid mt-4">
                  {/* Moon Badge Toggle */}
                  <div className="effect-toggle-card">
                    <div className="effect-card-info">
                      <div className="effect-title-row">
                        <Moon size={18} className="effect-icon-moon" />
                        <strong>Özel Ay Rozeti (Moon Badge)</strong>
                        <div className="badge-preview-pill">
                          <MoonBadge title={form.moon_badge_title} size={16} />
                        </div>
                      </div>
                      <p>İsminin hemen yanında parıldayan lunar hilal rozeti ve hover tooltip&apos;i.</p>
                    </div>
                    <label className="cyber-switch">
                      <input
                        type="checkbox"
                        checked={Boolean(form.enable_moon_badge)}
                        onChange={(e) => update("enable_moon_badge", e.target.checked)}
                      />
                      <span className="slider round" />
                    </label>
                  </div>

                  {form.enable_moon_badge ? (
                    <div className="cyber-field effect-subfield">
                      <label className="cyber-label">
                        <span>Rozet Tooltip Metni</span>
                        <span className="field-hint">Fareyle rozetin üzerine gelindiğinde çıkan yazı</span>
                      </label>
                      <input
                        type="text"
                        maxLength={50}
                        value={form.moon_badge_title}
                        onChange={(e) => update("moon_badge_title", e.target.value)}
                        placeholder="Moon Knight"
                        className="cyber-input"
                      />
                    </div>
                  ) : null}

                  {/* Lunar Stardust Particles */}
                  <div className="effect-toggle-card">
                    <div className="effect-card-info">
                      <div className="effect-title-row">
                        <Sparkles size={18} className="effect-icon" />
                        <strong>Göksel Ay Işığı & Yıldız Tozu</strong>
                      </div>
                      <p>
                        Arka planda yukarı doğru nazikçe süzülen 35 ay tozu partikülü ve avatar
                        çevresinde dönen lunar hale.
                      </p>
                    </div>
                    <label className="cyber-switch">
                      <input
                        type="checkbox"
                        checked={Boolean(form.enable_lunar_effects)}
                        onChange={(e) => update("enable_lunar_effects", e.target.checked)}
                      />
                      <span className="slider round" />
                    </label>
                  </div>

                  {/* 3D Gyro Tilt */}
                  <div className="effect-toggle-card">
                    <div className="effect-card-info">
                      <div className="effect-title-row">
                        <Wand2 size={18} className="effect-icon" />
                        <strong>3D Gyro Tilt (Kart Derinliği)</strong>
                      </div>
                      <p>
                        Fare hareketine göre 60/120 FPS akıcı 3 boyutlu derinlik ve parıltı açısı.
                      </p>
                    </div>
                    <label className="cyber-switch">
                      <input
                        type="checkbox"
                        checked={Boolean(form.enable_tilt)}
                        onChange={(e) => update("enable_tilt", e.target.checked)}
                      />
                      <span className="slider round" />
                    </label>
                  </div>

                  {/* Click to Enter Text */}
                  <div className="cyber-field full-width mt-2">
                    <label className="cyber-label">
                      <span>Click to Enter Giriş Perdesi Metni</span>
                      <span className="field-hint">
                        Ziyaretçi sayfayı ilk açtığında ekranda beliren karşılama yazısı
                      </span>
                    </label>
                    <input
                      type="text"
                      maxLength={60}
                      value={form.click_to_enter_text}
                      onChange={(e) => update("click_to_enter_text", e.target.value)}
                      placeholder="click to enter"
                      className="cyber-input"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {/* 5. DISCORD LANYARD TAB */}
            {activeTab === "discord" ? (
              <div className="studio-panel-pane">
                <div className="pane-header">
                  <h3>Discord & Lanyard Canlı Entegrasyonu</h3>
                  <p>
                    0 TL Sunucu Masrafı kuralıyla gerçek zamanlı Discord durumu ve Spotify müzik kartı.
                  </p>
                </div>

                {/* Lanyard Status Banner */}
                <div
                  className={`studio-lanyard-banner ${
                    lanyardData.status === "monitored"
                      ? "is-active"
                      : lanyardData.status === "loading"
                        ? "is-loading"
                        : "is-warning"
                  }`}
                >
                  <div className="lanyard-banner-avatar">
                    {form.discord_avatar_url ? (
                      <img src={form.discord_avatar_url} alt="Discord Avatar" />
                    ) : (
                      <Headphones size={20} />
                    )}
                  </div>
                  <div className="lanyard-banner-content">
                    <div className="lanyard-tag-row">
                      <strong>
                        {form.discord_global_name || form.discord_username || "Warxy"}
                      </strong>
                      <span className="lanyard-handle">
                        {form.discord_username ? `@${form.discord_username}` : `@lcmyth`}
                      </span>
                    </div>
                    <p className="lanyard-details-text">
                      {lanyardData.status === "monitored"
                        ? `🟢 Lanyard bağlı: ${lanyardData.details}`
                        : lanyardData.status === "loading"
                          ? "Lanyard durumu kontrol ediliyor…"
                          : "⚠️ Canlı durum için hesabının discord.gg/lanyard sunucusunda olması gerekir."}
                    </p>
                  </div>
                  <a
                    href="https://discord.gg/lanyard"
                    target="_blank"
                    rel="noreferrer"
                    className="studio-btn studio-btn-sm studio-btn-secondary"
                  >
                    <span>Lanyard Sunucusu</span>
                    <ExternalLink size={13} />
                  </a>
                </div>

                <div className="cyber-fields-grid mt-4">
                  <div className="cyber-field full-width">
                    <label className="cyber-label">
                      <span>Discord Kullanıcı ID (Snowflake)</span>
                      <span className="field-hint">
                        Discord ayarlarından Geliştirici Modunu açıp profilinize sağ tıklayarak &quot;Kullanıcı ID&apos;sini Kopyala&quot; deyin.
                      </span>
                    </label>
                    <input
                      type="text"
                      maxLength={32}
                      value={form.discord_user_id || ""}
                      onChange={(e) => update("discord_user_id", e.target.value.trim() || null)}
                      placeholder="Örn: 841643897465077760"
                      className="cyber-input mono-font"
                    />
                  </div>

                  <div className="cyber-field full-width">
                    <div className="discord-oauth-card">
                      <div className="oauth-text">
                        <strong>Alternatif: Discord ile Otomatik Yetkilendir</strong>
                        <p>
                          ID yazmak istemiyorsan Discord hesabınla tek tıkla bağlanıp avatar ve kullanıcı adını çekebilirsin.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleDiscordConnect}
                        className="studio-btn studio-btn-discord"
                      >
                        <MessageCircle size={15} />
                        <span>Discord ile Yetkilendir</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* 6. SOSYAL ROZETLER TAB */}
            {activeTab === "socials" ? (
              <div className="studio-panel-pane">
                <div className="pane-header">
                  <h3>Sosyal Bağlantı Rozetleri ({form.links.length}/12)</h3>
                  <p>
                    Kompakt 44x44px squircle rozetler. Marka renkleri ve hover parıltısı ile gösterilir.
                  </p>
                </div>

                {/* Quick Preset Platform Chips */}
                <div className="quick-presets-section">
                  <span className="quick-presets-title">Hızlı Rozet Ekle:</span>
                  <div className="quick-presets-chips">
                    {PRESET_PLATFORMS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => addPresetLink(preset.name, preset.url)}
                        disabled={form.links.length >= 12}
                        className="preset-chip-btn"
                      >
                        <Plus size={12} />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={addLink}
                      disabled={form.links.length >= 12}
                      className="preset-chip-btn custom-chip"
                    >
                      <Plus size={12} />
                      <span>Özel Web Linki</span>
                    </button>
                  </div>
                </div>

                {/* Links List Cards */}
                <div className="social-links-list">
                  {form.links.length === 0 ? (
                    <div className="empty-links-state">
                      <Globe size={28} className="empty-icon" />
                      <h4>Henüz rozet eklenmedi</h4>
                      <p>Yukarıdaki platform butonlarına tıklayarak profil bağlantılarını ekle.</p>
                    </div>
                  ) : (
                    form.links.map((link, index) => (
                      <div key={link.id} className="social-link-card">
                        <div className="link-card-index">#{index + 1}</div>

                        <div className="link-card-inputs">
                          <input
                            type="text"
                            maxLength={30}
                            value={link.label}
                            onChange={(e) => updateLink(link.id, "label", e.target.value)}
                            placeholder="Etiket (Örn: Kick, Steam, Instagram)"
                            className="cyber-input link-label-input"
                          />
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => updateLink(link.id, "url", e.target.value)}
                            placeholder="Profil URL adresi (https://...)"
                            className="cyber-input link-url-input mono-font"
                          />
                        </div>

                        <div className="link-card-actions">
                          <button
                            type="button"
                            onClick={() => moveLink(index, "up")}
                            disabled={index === 0}
                            className="studio-icon-btn"
                            title="Yukarı Taşı"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveLink(index, "down")}
                            disabled={index === form.links.length - 1}
                            className="studio-icon-btn"
                            title="Aşağı Taşı"
                          >
                            <ChevronDown size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeLink(link.id)}
                            className="studio-icon-btn danger"
                            title="Rozeti Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}

            {/* 7. ANALITIK TAB */}
            {activeTab === "analytics" ? (
              <div className="studio-panel-pane analytics-panel-pane">
                <div className="pane-header">
                  <div className="pane-header-row">
                    <div>
                      <h3>Ziyaretçi Analitiği & İstatistikler</h3>
                      <p>Son 7 günün profil trafiği, cihaz kırılımları ve coğrafi dağılım.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLoadingAnalytics(true);
                        fetch("/api/analytics")
                          .then((r) => r.json())
                          .then((d) => setAnalyticsData(d))
                          .finally(() => setLoadingAnalytics(false));
                      }}
                      className="studio-btn studio-btn-sm studio-btn-secondary"
                      disabled={loadingAnalytics}
                    >
                      {loadingAnalytics ? (
                        <LoaderCircle size={13} className="spin" />
                      ) : (
                        <TrendingUp size={13} />
                      )}
                      <span>Yenile</span>
                    </button>
                  </div>
                </div>

                {/* 4 Mini Summary Metrics */}
                <div className="analytics-metrics-row">
                  <div className="analytics-mini-stat">
                    <span className="mini-stat-label">Toplam Ziyaret</span>
                    <strong className="mini-stat-val">
                      {(analyticsData?.totalViews ?? form.views_count).toLocaleString()}
                    </strong>
                    <span className="mini-stat-badge is-positive">
                      {analyticsData?.hasRealData ? "Canlı Gerçek Veri" : "Gerçek Takip Aktif"}
                    </span>
                  </div>
                  <div className="analytics-mini-stat">
                    <span className="mini-stat-label">Bu Haftaki Trafik</span>
                    <strong className="mini-stat-val">
                      {(analyticsData?.weeklyViews ?? 0).toLocaleString()}
                    </strong>
                    <span className="mini-stat-sub">gerçek tekil ziyaret</span>
                  </div>
                  <div className="analytics-mini-stat">
                    <span className="mini-stat-label">En Yoğun Zaman</span>
                    <strong className="mini-stat-val">
                      {analyticsData?.peakHour ?? "Veri Bekleniyor"}
                    </strong>
                    <span className="mini-stat-sub">aktif dönem</span>
                  </div>
                  <div className="analytics-mini-stat">
                    <span className="mini-stat-label">Doğruluk Modu</span>
                    <strong className="mini-stat-val">
                      {analyticsData?.hasRealData ? "100% Gerçek" : "0 Simülasyon"}
                    </strong>
                    <span className="mini-stat-sub">sıfır sahte veri</span>
                  </div>
                </div>

                {/* Dedicated Counter Management Card */}
                <div className="analytics-view-mgmt-card">
                  <div className="analytics-mgmt-header">
                    <TrendingUp size={16} />
                    <h4>Görüntülenme Sayacını Yönet (Hatalı / Test Sayısını Düzelt)</h4>
                  </div>
                  <p className="field-hint">
                    Test esnasında veya hatalı girişlerde şişen görüntülenme sayısını (örn. 42 vb.) buradan istediğiniz gerçek sayıya ayarlayabilir veya tek tıkla sıfırlayabilirsiniz.
                  </p>
                  <div className="analytics-mgmt-actions">
                    <input
                      type="number"
                      min={0}
                      value={viewsInputVal}
                      onChange={(e) => setViewsInputVal(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleUpdateViews(Math.max(0, parseInt(viewsInputVal, 10) || 0));
                        }
                      }}
                      className="cyber-input analytics-mgmt-input"
                      placeholder="Yeni sayaç sayısı"
                      disabled={savingViews}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateViews(Math.max(0, parseInt(viewsInputVal, 10) || 0))
                      }
                      disabled={savingViews}
                      className="studio-btn studio-btn-primary"
                    >
                      {savingViews ? (
                        <LoaderCircle size={14} className="spin" />
                      ) : (
                        <Check size={14} />
                      )}
                      <span>Sayacı Güncelle</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateViews(0)}
                      disabled={savingViews}
                      className="studio-btn studio-btn-ghost danger"
                    >
                      <Trash2 size={14} />
                      <span>Sayacı Sıfırla (0)</span>
                    </button>
                  </div>
                </div>

                {/* Last 7 Days Interactive Bar Chart */}
                <div className="analytics-chart-container">
                  <div className="chart-header">
                    <h4>Haftalık Ziyaretçi Trendi (Son 7 Gün)</h4>
                    <span className="field-hint">Günlük tekil görüntülenme grafiği (100% gerçek kayıtlar)</span>
                  </div>

                  <div className="cyber-bar-chart">
                    {(analyticsData?.weeklyTrend ?? []).map((item, idx) => {
                      const allViews = (analyticsData?.weeklyTrend ?? []).map((t) => t.views);
                      const maxViews = Math.max(...allViews, 0);
                      const heightPercent = maxViews > 0
                        ? Math.max(12, Math.round((item.views / maxViews) * 100))
                        : 8;

                      return (
                        <div key={idx} className="chart-col">
                          <div className="bar-hover-val">{item.views}</div>
                          <div className="bar-track">
                            <div
                              className="bar-fill"
                              style={{ height: `${item.views > 0 ? heightPercent : 6}%` }}
                            />
                          </div>
                          <span className="col-day">{item.dayName}</span>
                          <span className="col-date">{item.date}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2-Column Breakdown: Devices & Referrers */}
                <div className="analytics-breakdown-grid">
                  {/* Device Breakdown */}
                  <div className="analytics-card">
                    <div className="analytics-card-title">
                      <Laptop size={15} />
                      <strong>Cihaz & Platform Dağılımı</strong>
                    </div>
                    <div className="breakdown-list">
                      {(analyticsData?.deviceStats ?? []).map((d) => (
                        <div key={d.type} className="breakdown-item">
                          <div className="breakdown-item-head">
                            <div className="device-item-label">
                              {d.type === "desktop" ? (
                                <Laptop size={14} className="device-icon" />
                              ) : d.type === "mobile" ? (
                                <Smartphone size={14} className="device-icon" />
                              ) : (
                                <Tablet size={14} className="device-icon" />
                              )}
                              <span>{d.label}</span>
                            </div>
                            <span className="breakdown-pct">%{d.percentage}</span>
                          </div>
                          <div className="progress-track">
                            <div
                              className={`progress-fill fill-${d.type}`}
                              style={{ width: `${d.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Referrers */}
                  <div className="analytics-card">
                    <div className="analytics-card-title">
                      <Compass size={15} />
                      <strong>Trafik Kaynakları (Referrers)</strong>
                    </div>
                    <div className="breakdown-list">
                      {(analyticsData?.referrerStats ?? []).length > 0 ? (
                        (analyticsData?.referrerStats ?? []).map((r) => (
                          <div key={r.name} className="breakdown-item">
                            <div className="breakdown-item-head">
                              <span>{r.name}</span>
                              <span className="breakdown-pct">%{r.percentage}</span>
                            </div>
                            <div className="progress-track">
                              <div
                                className="progress-fill fill-ref"
                                style={{ width: `${r.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="field-hint" style={{ padding: "16px 0", textAlign: "center" }}>
                          Henüz harici referans kaynağı tespit edilmedi (Doğrudan ziyaretler bekleniyor).
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Countries */}
                <div className="analytics-card full-width">
                  <div className="analytics-card-title">
                    <Globe size={15} />
                    <strong>Coğrafi Ziyaretçi Dağılımı (Ülkeler)</strong>
                  </div>
                  <div className="countries-grid">
                    {(analyticsData?.countryStats ?? []).length > 0 ? (
                      (analyticsData?.countryStats ?? []).map((c) => (
                        <div key={c.code} className="country-card-item">
                          <span className="country-flag">{c.flag}</span>
                          <div className="country-meta">
                            <strong className="country-name">{c.name}</strong>
                            <span className="country-numbers">
                              {c.count} tekil (%{c.percentage})
                            </span>
                          </div>
                          <div className="country-mini-bar">
                            <div
                              className="country-bar-fill"
                              style={{ width: `${c.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="field-hint" style={{ padding: "16px 0", textAlign: "center", gridColumn: "1 / -1" }}>
                        Henüz coğrafi konum kaydı oluşmadı.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Column: Live Interactive Profile Simulator */}
        <aside className="studio-preview-column">
          <div className="simulator-frame">
            {/* Simulator Header Bar */}
            <div className="simulator-header">
              <div className="simulator-title">
                <span className="live-indicator-dot" />
                <span>CANLI ÖNİZLEME</span>
              </div>
              <div className="device-toggle-buttons">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`device-btn ${previewDevice === "desktop" ? "is-active" : ""}`}
                  title="Masaüstü Görünümü"
                >
                  <Laptop size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`device-btn ${previewDevice === "mobile" ? "is-active" : ""}`}
                  title="Mobil Görünümü"
                >
                  <Smartphone size={13} />
                </button>
              </div>
            </div>

            {/* Simulated Stage Environment */}
            <div
              className={`simulator-viewport device-${previewDevice}`}
              style={{
                backgroundColor: form.surface_color,
                // Apply accent glow to preview
                ["--accent" as string]: form.accent_color,
                ["--surface" as string]: form.surface_color,
              }}
            >
              {form.background_video_url ? (
                <video
                  src={form.background_video_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="simulator-backdrop-video"
                  style={{
                    opacity: (form.background_video_opacity ?? 70) / 100,
                  }}
                />
              ) : form.background_url ? (
                <div
                  className="simulator-backdrop-image"
                  style={{
                    backgroundImage: `url("${form.background_url}")`,
                    opacity: (form.background_video_opacity ?? 70) / 100,
                  }}
                />
              ) : null}

              {/* Simulated Card */}
              <div className="simulator-card-wrapper">
                <div
                  className={`guns-main-card simulator-main-card ${
                    form.enable_lunar_effects ? "has-lunar-aura" : ""
                  } border-fx-${form.card_border_effect || "lunar_aurora"}`}
                  style={(() => {
                    const cardBg = hexToRgba(
                      form.surface_color,
                      (form.card_opacity ?? 75) / 100,
                    );
                    return {
                      backgroundColor: cardBg,
                      ["--card-surface-rgba" as string]: cardBg,
                    };
                  })()}
                >
                  {/* Avatar */}
                  <div className="guns-card-avatar-wrap">
                    <div className="guns-card-avatar-glow" aria-hidden="true" />
                    {form.enable_lunar_effects ? (
                      <div className="guns-avatar-lunar-ring" aria-hidden="true" />
                    ) : null}
                    <div className="guns-card-avatar-frame">
                      {form.avatar_url || form.discord_avatar_url ? (
                        <img
                          src={form.avatar_url || form.discord_avatar_url || ""}
                          alt="Avatar"
                          className="guns-card-avatar-img"
                        />
                      ) : (
                        <div className="guns-card-avatar-fallback">
                          {(form.display_name[0] || "E").toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name & Moon Badge */}
                  <div className="guns-card-identity">
                    <div className="guns-name-badges-row">
                      <h2
                        className={`guns-card-name name-fx-${form.name_effect || "lunar_shimmer"}`}
                        data-text={form.display_name.trim() || form.discord_global_name || "Emir"}
                      >
                        {form.display_name.trim() || form.discord_global_name || "Emir"}
                      </h2>
                      {form.enable_moon_badge ? (
                        <MoonBadge title={form.moon_badge_title} />
                      ) : null}
                    </div>

                    {form.headline.trim() ? (
                      <p className="guns-card-headline">{form.headline}</p>
                    ) : null}

                    {/* Typewriter Preview */}
                    <div className="guns-card-bio-section">
                      <TypewriterBio
                        lines={form.typewriter_lines}
                        fallbackBio={form.bio}
                      />
                    </div>
                  </div>

                  {/* Discord Presence Section */}
                  {form.discord_user_id ? (
                    <div className="guns-card-discord-section">
                      <DiscordPresence
                        discordUserId={form.discord_user_id}
                        fallbackUsername={form.discord_username}
                        fallbackGlobalName={form.discord_global_name}
                        fallbackAvatarUrl={form.discord_avatar_url}
                      />
                    </div>
                  ) : null}

                  {/* Social Badges Grid */}
                  <div className="guns-card-badges-section">
                    <SocialBadges
                      links={form.links
                        .filter((l) => l.label.trim() && l.url.trim())
                        .map((l) => ({ ...l, safeUrl: l.url }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="simulator-footer-hint">
              <span>Düzenlemeler anında önizlemeye yansır.</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Floating Sticky Cyber Action Bar */}
      <div className="studio-sticky-bar">
        <div className="sticky-bar-left">
          {hasUnsavedChanges ? (
            <div className="unsaved-status-badge is-dirty">
              <span className="status-beacon is-amber" />
              <span>Kaydedilmemiş Değişiklikler Var</span>
            </div>
          ) : (
            <div className="unsaved-status-badge is-clean">
              <span className="status-beacon is-green" />
              <span>Tüm Değişiklikler Kaydedildi</span>
            </div>
          )}

          {editorState.message ? (
            <div className={`editor-message-pill kind-${editorState.kind}`}>
              {editorState.kind === "saving" ? (
                <LoaderCircle size={13} className="spin" />
              ) : editorState.kind === "success" ? (
                <Check size={13} />
              ) : editorState.kind === "error" ? (
                <X size={13} />
              ) : null}
              <span>{editorState.message}</span>
            </div>
          ) : null}
        </div>

        <div className="sticky-bar-right">
          {/* Public Visibility Switch */}
          <label className="visibility-toggle-group">
            <span className="toggle-label">
              {form.is_published ? "Herkese Açık" : "Gizli"}
            </span>
            <label className="cyber-switch">
              <input
                type="checkbox"
                checked={Boolean(form.is_published)}
                onChange={(e) => update("is_published", e.target.checked)}
              />
              <span className="slider round" />
            </label>
          </label>

          {/* Quick View Profile Link */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="studio-btn studio-btn-secondary"
            title="Siteyi Canlı Sekmede Aç"
          >
            <span>Siteyi Gör</span>
            <ArrowUpRight size={14} />
          </a>

          {/* Save Profile Button */}
          <button
            type="button"
            onClick={() => void persistProfileData()}
            disabled={editorState.kind === "saving"}
            className="studio-btn studio-btn-save"
          >
            {editorState.kind === "saving" ? (
              <LoaderCircle size={15} className="spin" />
            ) : (
              <Save size={15} />
            )}
            <span>Değişiklikleri Kaydet</span>
            <span className="keyboard-shortcut-hint">Ctrl+S</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function normalizeWebUrl(value: string): string | null {
  const candidate = value.includes("://") ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
