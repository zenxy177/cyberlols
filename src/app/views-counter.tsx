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
    // Prevent React StrictMode double execution in single render
    if (hasFired.current) return;
    hasFired.current = true;

    // Check last viewed timestamp (throttle to once per 10 seconds per tab/browser to allow testing)
    const viewedKey = "bio_last_viewed_at";
    const lastViewedAt = typeof window !== "undefined" ? sessionStorage.getItem(viewedKey) : null;
    const now = Date.now();
    if (lastViewedAt && now - Number(lastViewedAt) < 10000) {
      return;
    }
    if (typeof window !== "undefined") {
      sessionStorage.setItem(viewedKey, String(now));
    }

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
