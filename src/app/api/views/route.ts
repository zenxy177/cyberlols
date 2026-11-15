import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/profile";
import { describeVisit } from "@/lib/analytics-storage";

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Not configured" }, { status: 400 });
  }

  try {
    const supabase = await createServerSupabase();

    // Check if caller is site admin/owner to avoid self-view inflation
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let isAdmin = false;
    if (user) {
      const { data: isOwner } = await supabase.rpc("is_site_admin");
      isAdmin = Boolean(isOwner);
    }

    if (isAdmin) {
      // Do not count the site owner/admin's visits as visitor views!
      const { data: current } = await supabase
        .from("profiles")
        .select("views_count")
        .eq("id", "main")
        .maybeSingle();

      return NextResponse.json({
        ok: true,
        views_count: Number(current?.views_count) || 0,
        is_admin: true,
      });
    }

    // Atomik kayıt: aynı IP 24 saat içinde tekrar sayılmaz. Anon istemci
    // log tablosunu okuyamadığı için tekilleştirme RPC içinde yapılır.
    const visit = describeVisit(req.headers);
    const visitRpc = await supabase.rpc("record_profile_view", {
      profile_slug: visit.payload.profile_id,
      device_type: visit.payload.device_type,
      browser_name: visit.payload.browser,
      visitor_country: visit.payload.country_code,
      country_label: visit.payload.country_name,
      referrer_source: visit.payload.referrer,
      visitor_ip_hash: visit.ipHash,
    });

    if (!visitRpc.error && visitRpc.data) {
      const row = Array.isArray(visitRpc.data) ? visitRpc.data[0] : visitRpc.data;
      const recorded = Number(row?.current_views_count);
      if (Number.isFinite(recorded)) {
        return NextResponse.json({
          ok: true,
          views_count: recorded,
          unique: Boolean(row?.visit_recorded),
        });
      }
    } else if (visitRpc.error) {
      console.warn("RPC record_profile_view error:", visitRpc.error.message);
    }

    // Eski şema yedeği: RPC yoksa log yaz ve sayacı artır.
    try {
      await supabase.from("profile_views_log").insert(visit.payload);
    } catch (logErr) {
      console.warn("Analytics visit log insert error:", logErr);
    }

    // Call atomic stored procedure (schema uses profile_slug; default arg also works)
    let count: number | null = null;
    const rpc1 = await supabase.rpc("increment_profile_views", { profile_slug: "main" });
    if (!rpc1.error && typeof rpc1.data === "number") {
      count = rpc1.data;
    } else {
      const rpc2 = await supabase.rpc("increment_profile_views");
      if (!rpc2.error && typeof rpc2.data === "number") {
        count = rpc2.data;
      } else {
        console.warn("RPC increment_profile_views error:", rpc1.error?.message || rpc2.error?.message);
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

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, views_count: 0 });
  }

  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from("profiles")
      .select("views_count")
      .eq("id", "main")
      .maybeSingle();

    return NextResponse.json({
      ok: true,
      views_count: Number(data?.views_count) || 0,
    });
  } catch {
    return NextResponse.json({ ok: false, views_count: 0 });
  }
}

export async function PATCH(req: Request) {
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
      return NextResponse.json({ ok: false, error: "Yetkisiz erişim. Yeniden giriş yapın." }, { status: 401 });
    }

    const { data: isOwner } = await supabase.rpc("is_site_admin");
    if (!isOwner) {
      return NextResponse.json({ ok: false, error: "Bu işlem için sahip yetkisi gerekiyor." }, { status: 403 });
    }

    const body = await req.json();
    const newCountRaw = Number(body.views_count);
    if (!Number.isFinite(newCountRaw) || newCountRaw < 0) {
      return NextResponse.json({ ok: false, error: "Geçersiz görüntülenme sayısı." }, { status: 400 });
    }

    const newCount = Math.round(newCountRaw);

    // Call stored procedure or direct update
    const rpcResult = await supabase.rpc("set_profile_views", {
      new_count: newCount,
      profile_slug: "main",
    });

    if (rpcResult.error) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ views_count: newCount, updated_at: new Date().toISOString() })
        .eq("id", "main");

      if (updateError) {
        return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 });
      }
    }

    if (newCount === 0) {
      try {
        await supabase.from("profile_views_log").delete().eq("profile_id", "main");
      } catch {
        // ignore if table doesn't exist
      }
    }

    return NextResponse.json({ ok: true, views_count: newCount });
  } catch (err) {
    console.error("View update failed:", err);
    return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
  }
}

