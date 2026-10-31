import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Eye, Moon, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { ProfileEditor } from "@/app/admin/profile-editor";
import { SignOutButton } from "@/app/admin/sign-out-button";
import {
  EMPTY_PROFILE,
  isSupabaseConfigured,
  normalizeProfile,
} from "@/lib/profile";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const discordNotices: Record<string, { kind: "success" | "error"; message: string }> = {
  connected: {
    kind: "success",
    message: "Discord hesabın bağlandı ve herkese açık profiline eklendi.",
  },
  cancelled: {
    kind: "error",
    message: "Discord bağlantısı iptal edildi; hesabında değişiklik yapılmadı.",
  },
  configuration: {
    kind: "error",
    message:
      "Discord bağlantısı hazır değil. DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET ve DISCORD_REDIRECT_URI ayarlarını ekle.",
  },
  authorization: {
    kind: "error",
    message:
      "Discord hesabı doğrulanamadı. Yönetici oturumunu ve Discord uygulamasının geri dönüş adresini kontrol edip yeniden dene.",
  },
  profile: {
    kind: "error",
    message:
      "Discord hesabı doğrulandı ancak profil kaydedilemedi. Veritabanı şemasını güncelledikten sonra yeniden dene.",
  },
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ discord?: string }>;
}) {
  const { discord: discordStatus } = await searchParams;
  const discordNotice = discordStatus ? discordNotices[discordStatus] : null;

  if (!isSupabaseConfigured()) {
    return (
      <AdminProblem
        title="Panel kuruluma hazır değil."
        description="Supabase proje bilgilerini ortam değişkenlerine ekle ve veritabanı kurulumunu tamamla."
      />
    );
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: isOwner, error: roleError } =
    await supabase.rpc("is_site_admin");

  if (roleError) {
    console.error("Admin authorization check failed:", roleError.message);
    return (
      <AdminProblem
        title="Sahip yetkisi doğrulanamadı."
        description="Supabase şemasının kurulduğunu ve hesabının site_admins tablosuna eklendiğini kontrol et."
      />
    );
  }

  if (!isOwner) {
    return (
      <AdminProblem
        title="Bu panel sana ait değil."
        description="Giriş yaptığın hesap sahip olarak tanımlı değil. Supabase'te yalnızca kendi hesabını site_admins tablosuna ekle."
        signedIn
      />
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", "main")
    .maybeSingle();

  if (error) {
    console.error("Admin profile query failed:", error.message);
    return (
      <AdminProblem
        title="Profil verisi alınamadı."
        description="Supabase tablolarının kurulu olduğunu kontrol et."
      />
    );
  }

  const profile = data ? normalizeProfile(data) : EMPTY_PROFILE;

  return (
    <main className="admin-stage guns-admin-theme">
      <div className="admin-shell">
        {/* Top Navbar */}
        <header className="admin-cyber-header">
          <div className="admin-cyber-header-left">
            <Link className="admin-cyber-brand" href="/" target="_blank" title="Herkese açık profili aç">
              <span className="admin-cyber-mark">
                <Moon size={16} className="brand-moon-icon" />
              </span>
              <div className="admin-cyber-brand-text">
                <span className="brand-title">CYBER</span>
                <span className="brand-badge">STUDIO</span>
              </div>
            </Link>

            <div className="admin-cyber-pill">
              <Eye size={13} className="pill-icon" />
              <span>{profile.views_count.toLocaleString()} görüntülenme</span>
            </div>

            <div className={`admin-cyber-pill status-pill${profile.is_published ? " is-live" : ""}`}>
              <span className="signal-dot" />
              <span>{profile.is_published ? "Yayında" : "Gizli"}</span>
            </div>
          </div>

          <div className="admin-cyber-header-right">
            <Link
              href="/"
              target="_blank"
              className="admin-view-profile-btn"
            >
              <span>Siteyi Gör</span>
              <ArrowUpRight size={14} />
            </Link>

            <div className="admin-owner-pill">
              <ShieldCheck size={14} className="owner-icon" />
              <span>Sahip</span>
            </div>

            <SignOutButton />
          </div>
        </header>

        {/* Notice Message if any */}
        {discordNotice ? (
          <div
            className={`cyber-notice cyber-notice-${discordNotice.kind}`}
            role={discordNotice.kind === "error" ? "alert" : "status"}
          >
            {discordNotice.message}
          </div>
        ) : null}

        {/* Profile Editor Workspace */}
        <div className="admin-studio-workspace">
          <ProfileEditor profile={profile} />
        </div>
      </div>
    </main>
  );
}

function AdminProblem({
  title,
  description,
  signedIn = false,
}: {
  title: string;
  description: string;
  signedIn?: boolean;
}) {
  return (
    <main className="admin-stage">
      <div className="admin-wrap admin-problem-wrap">
        <header className="admin-header">
          <Link className="admin-brand" href="/">
            <span className="admin-brand-mark">🌙</span>
            <span className="admin-brand-name">Cyber Studio</span>
          </Link>
          {signedIn ? <SignOutButton /> : null}
        </header>
        <section className="admin-error-page" role="alert">
          <h1>{title}</h1>
          <p>{description}</p>
          <Link className="preview-link" href="/admin/login">
            <ArrowLeft size={15} aria-hidden="true" />
            Giriş sayfasına dön
          </Link>
        </section>
      </div>
    </main>
  );
}
