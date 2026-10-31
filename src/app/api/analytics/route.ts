import { NextResponse } from "next/server";
import { getRealAnalytics } from "@/lib/analytics-storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getRealAnalytics();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Real analytics fetch error:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch analytics" }, { status: 500 });
  }
}
