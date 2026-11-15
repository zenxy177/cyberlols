import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/profile";
import { createServerSupabase } from "@/lib/supabase/server";
import { getRealAnalytics } from "@/lib/analytics-storage";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Not configured" }, { status: 400 });
  }

  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { ok: false, error: "Yetkisiz erişim. Yeniden giriş yapın." },
        { status: 401 },
      );
    }

    const { data: isOwner, error: roleError } =
      await supabase.rpc("is_site_admin");

    if (roleError || !isOwner) {
      return NextResponse.json(
        { ok: false, error: "Bu istatistikler yalnızca site sahibine açıktır." },
        { status: 403 },
      );
    }

    const data = await getRealAnalytics();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Real analytics fetch error:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch analytics" }, { status: 500 });
  }
}
