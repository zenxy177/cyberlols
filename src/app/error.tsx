"use client";

import { RotateCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled app error:", error);
  }, [error]);

  return (
    <main className="fallback-stage">
      <div className="fallback-card" role="alert">
        <p className="fallback-code">Yörünge Hatası</p>
        <h1 className="fallback-title">Bir şeyler ters gitti.</h1>
        <p className="fallback-text">
          Sayfa yüklenirken beklenmedik bir hata oluştu. Tekrar deneyebilir ya
          da profile dönebilirsin.
        </p>
        <div className="fallback-actions">
          <button
            className="fallback-btn is-primary"
            type="button"
            onClick={() => reset()}
          >
            <RotateCcw size={16} aria-hidden="true" />
            Tekrar dene
          </button>
          <Link className="fallback-btn" href="/">
            <ArrowLeft size={16} aria-hidden="true" />
            Profile dön
          </Link>
        </div>
      </div>
    </main>
  );
}
