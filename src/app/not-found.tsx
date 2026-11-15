import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 • Sayfa bulunamadı",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="fallback-stage">
      <div className="fallback-card">
        <p className="fallback-code">404</p>
        <h1 className="fallback-title">Bu sayfa ay ışığında kayboldu.</h1>
        <p className="fallback-text">
          Aradığın sayfa taşınmış veya hiç var olmamış olabilir. Profil ana
          sayfasına dönerek devam edebilirsin.
        </p>
        <div className="fallback-actions">
          <Link className="fallback-btn is-primary" href="/">
            <ArrowLeft size={16} aria-hidden="true" />
            Profile dön
          </Link>
        </div>
      </div>
    </main>
  );
}
