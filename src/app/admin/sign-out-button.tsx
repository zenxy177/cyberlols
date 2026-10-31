"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export function SignOutButton() {
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function signOut() {
    setPending(true);
    setErrorMessage("");

    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.assign("/admin/login");
    } catch (error) {
      console.error("Admin sign-out failed:", error);
      setErrorMessage("Çıkış yapılamadı. Tekrar deneyebilirsin.");
      setPending(false);
    }
  }

  return (
    <span className="sign-out-control">
      <button
        className="quiet-button"
        disabled={pending}
        onClick={signOut}
        type="button"
      >
        <LogOut size={14} aria-hidden="true" />
        {pending ? "Çıkılıyor…" : "Çıkış"}
      </button>
      {errorMessage ? <span role="alert">{errorMessage}</span> : null}
    </span>
  );
}
