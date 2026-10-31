"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export function AdminLoginForm() {
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage("Giriş yapılamadı. E-posta ve parolanı kontrol et.");
        return;
      }

      window.location.assign("/admin");
    } catch (error) {
      console.error("Admin sign-in failed:", error);
      setErrorMessage("Giriş servisine ulaşılamadı. Biraz sonra tekrar dene.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label className="form-field">
        <span className="field-label">E-posta</span>
        <input
          autoComplete="username"
          name="email"
          placeholder="sahip@ornek.com"
          required
          type="email"
        />
      </label>
      <label className="form-field">
        <span className="field-label">Parola</span>
        <input
          autoComplete="current-password"
          name="password"
          placeholder="Parolan"
          required
          type="password"
        />
      </label>
      {errorMessage ? (
        <p className="form-error" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <button className="login-button" disabled={pending} type="submit">
        {pending ? (
          <LoaderCircle size={17} className="spin" aria-hidden="true" />
        ) : (
          <>
            <span>Panele gir</span>
            <ArrowRight size={17} aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
