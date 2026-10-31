import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminLoginForm } from "@/app/admin/login/login-form";
import { isSupabaseConfigured } from "@/lib/profile";

export default function AdminLoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <main className="admin-stage">
      <div className="admin-wrap">
        <header className="admin-header">
          <Link className="wordmark" href="/" aria-label="Profile dön">
            <span className="wordmark-symbol">b.</span>
            <span>kendime ait</span>
          </Link>
          <Link className="text-link" href="/">
            <ArrowLeft size={15} aria-hidden="true" /> profile dön
          </Link>
        </header>
        <div className="login-wrap">
          <section className="login-card">
            <h1>Yalnızca sana.</h1>
            <p>
              Profilini güncellemek için sahip hesabınla giriş yap. Bu sayfada
              herkese açık kayıt bulunmuyor.
            </p>
            {configured ? (
              <AdminLoginForm />
            ) : (
              <div className="setup-panel" role="status">
                Yönetim panelini açmak için önce Supabase projesini kurup
                ortam değişkenlerini ekle. Kurulum adımları proje içindeki
                README dosyasında.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
