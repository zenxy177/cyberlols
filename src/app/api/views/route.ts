import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/profile";
import { recordRealVisit } from "@/lib/analytics-storage";

export async function POST(req: Request) {
  // Always log real visit (captures device, browser, referer, country)
  try {
    await recordRealVisit(req.headers);
  } catch (logErr) {
    console.warn("Analytics real visit record error:", logErr);
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Not configured" }, { status: 400 });
  }

  try {
    const supabase = await createServerSupabase();

    // Call atomic stored procedure (support profile_id, no-arg, and profile_slug)
    let count: number | null = null;
    const rpc1 = await supabase.rpc("increment_profile_views", { profile_id: "main" });
    if (!rpc1.error && typeof rpc1.data === "number") {
      count = rpc1.data;
    } else {
      const rpc2 = await supabase.rpc("increment_profile_views");
      if (!rpc2.error && typeof rpc2.data === "number") {
        count = rpc2.data;
      } else {
        const rpc3 = await supabase.rpc("increment_profile_views", { profile_slug: "main" });
        if (!rpc3.error && typeof rpc3.data === "number") {
          count = rpc3.data;
        } else {
          console.warn("RPC increment_profile_views error:", rpc1.error?.message || rpc2.error?.message);
        }
      }
    }

    if (count === null) {
      const { data: current } = await supabase
        .from("profiles")
        .select("views_count")
        .eq("id", "main")
        .maybeSingle();

      count = Number(current?.views_count) || 1;
    }

    return NextResponse.json({
      ok: true,
      views_count: count,
    });
  } catch (err) {
    console.error("View increment failed:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
