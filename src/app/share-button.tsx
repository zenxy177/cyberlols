"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

export function ShareButton() {
  const [message, setMessage] = useState("");

  async function sharePage() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
        setMessage("Bağlantı paylaşıldı.");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setMessage("Paylaşım açılamadı. Adresi tarayıcıdan kopyalayabilirsin.");
        return;
      }
    }

    if (!navigator.clipboard?.writeText) {
      setMessage("Bu tarayıcıda paylaşım desteklenmiyor.");
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setMessage("Bağlantı kopyalandı.");
    } catch {
      setMessage("Bağlantı kopyalanamadı. Adresi tarayıcıdan kopyalayabilirsin.");
    }
  }

  return (
    <div className="share-control">
      <button className="share-button" type="button" onClick={sharePage}>
        <Share2 size={17} strokeWidth={1.8} aria-hidden="true" />
        <span>Paylaş</span>
      </button>
      <span className="share-feedback" role="status" aria-live="polite">
        {message}
      </span>
    </div>
  );
}
