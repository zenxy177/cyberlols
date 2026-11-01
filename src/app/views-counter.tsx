"use client";

import { useEffect, useRef, useState } from "react";
import { Eye } from "lucide-react";

type ViewsCounterProps = {
  initialCount: number;
};

function formatViews(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 10_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toLocaleString();
}

export function ViewsCounter({ initialCount }: ViewsCounterProps) {
  const [count, setCount] = useState(initialCount);
  const hasFired = useRef(false);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    // Prevent React StrictMode double execution in single render
    if (hasFired.current) return;
    hasFired.current = true;

    if (typeof window === "undefined") return;

    // Clean up legacy session key if present
    try {
      sessionStorage.removeItem("bio_last_viewed_at");
    } catch {}

    const STORAGE_KEY = "cyber_last_view_timestamp_main";
    const COOKIE_NAME = "cyber_last_view_timestamp_main";
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

    let lastViewedAt: string | null = null;
    try {
      lastViewedAt = localStorage.getItem(STORAGE_KEY);
    } catch {}

    if (!lastViewedAt && typeof document !== "undefined") {
      try {
        const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
        if (match) {
          lastViewedAt = decodeURIComponent(match[1]);
        }
      } catch {}
    }

    const now = Date.now();
    const lastViewedNum = Number(lastViewedAt);
    if (
      Number.isFinite(lastViewedNum) &&
      now - lastViewedNum < TWENTY_FOUR_HOURS_MS &&
      now >= lastViewedNum
    ) {
      // Already counted as a unique visitor within the last 24 hours.
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, String(now));
    } catch {}
    try {
      document.cookie = `${COOKIE_NAME}=${now}; max-age=${24 * 60 * 60}; path=/; SameSite=Lax`;
    } catch {}

    fetch("/api/views", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.views_count === "number") {
          setCount(data.views_count);
        }
      })
      .catch(() => {
        // silently ignore view tracking errors
      });
  }, []);

  return (
    <div
      className="guns-views-counter"
      title={`${count.toLocaleString()} görüntülenme`}
      aria-label={`${count} görüntülenme`}
    >
      <Eye size={13} className="guns-views-icon" aria-hidden="true" />
      <span className="guns-views-number">{formatViews(count)}</span>
    </div>
  );
}
