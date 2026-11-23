"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  type ManualBadge,
  getDiscordBadge,
  isValidBadgeIconUrl,
} from "@/lib/discord-badges";
import { DiscordBadgeIcon } from "@/lib/discord-badges-icons";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export interface DiscordBadgesProps {
  discordUserId?: string | null;
  disabledBadges?: string[];
  manualBadges?: ManualBadge[];
  className?: string;
  size?: number;
}

interface ResolvedApiBadge {
  key: string;
  label: string;
  description: string;
}

interface UnifiedBadgeItem {
  key: string;
  label: string;
  description: string;
  iconUrl?: string;
  brandColor: string;
  glowColor: string;
  sort: number;
}

export function DiscordBadges({
  discordUserId,
  disabledBadges = [],
  manualBadges: propManualBadges,
  className = "",
  size = 18,
}: DiscordBadgesProps) {
  const [apiBadges, setApiBadges] = useState<ResolvedApiBadge[]>([]);
  const [dbManualBadges, setDbManualBadges] = useState<ManualBadge[]>([]);
  const [activeTooltipKey, setActiveTooltipKey] = useState<string | null>(null);
  const [failedImageKeys, setFailedImageKeys] = useState<Set<string>>(new Set());

  // 1. Fetch automatic badges from server endpoint
  useEffect(() => {
    let isCancelled = false;
    const fetchApiBadges = async () => {
      try {
        const queryParam = discordUserId
          ? `?user_id=${encodeURIComponent(discordUserId)}`
          : "";
        const res = await fetch(`/api/discord/badges${queryParam}`, {
          cache: "default",
        });
        if (!res.ok) return;
        const data = (await res.json()) as ResolvedApiBadge[];
        if (!isCancelled && Array.isArray(data)) {
          setApiBadges(data);
        }
      } catch {
        // Silently handle network errors to preserve 0-error client UX
      }
    };

    fetchApiBadges();
    return () => {
      isCancelled = true;
    };
  }, [discordUserId]);

  // 2. Fetch manual badges from Supabase if not passed via props
  useEffect(() => {
    if (propManualBadges !== undefined) return;

    let isCancelled = false;
    const fetchManualBadges = async () => {
      try {
        const supabase = createBrowserSupabase();
        const { data, error } = await supabase
          .from("manual_badges")
          .select("*")
          .eq("enabled", true)
          .order("sort", { ascending: true });

        if (!isCancelled && !error && Array.isArray(data)) {
          setDbManualBadges(data as ManualBadge[]);
        }
      } catch {
        // Silently handle if Supabase is offline or unconfigured
      }
    };

    fetchManualBadges();
    return () => {
      isCancelled = true;
    };
  }, [propManualBadges]);

  // Close active tooltip when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest(".guns-discord-badge-item")) {
        setActiveTooltipKey(null);
      }
    };

    window.addEventListener("click", handleOutsideClick);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  // 3. Merge, filter disabled, deduplicate, and sort badges
  const unifiedBadges = useMemo<UnifiedBadgeItem[]>(() => {
    const disabledSet = new Set(
      disabledBadges.map((k) => k.toLowerCase().trim()),
    );
    const manualSource = propManualBadges ?? dbManualBadges;

    // Map by key for deduplication (manual badges override automatic badges)
    const map = new Map<string, UnifiedBadgeItem>();

    // Add automatic Discord badges
    for (let i = 0; i < apiBadges.length; i++) {
      const b = apiBadges[i];
      const normalizedKey = b.key.toLowerCase().trim();
      if (disabledSet.has(normalizedKey)) continue;

      const registered = getDiscordBadge(normalizedKey);
      map.set(normalizedKey, {
        key: normalizedKey,
        label: b.label || registered?.label || normalizedKey,
        description: b.description || registered?.description || "",
        brandColor: registered?.brandColor || "#5865f2",
        glowColor: registered?.glowColor || "rgba(88, 101, 242, 0.5)",
        sort: i * 10,
      });
    }

    // Add manual badges (overrides automatic entry if same key)
    for (const mb of manualSource) {
      if (mb.enabled === false) continue;
      const normalizedKey = mb.key.toLowerCase().trim();
      if (disabledSet.has(normalizedKey)) continue;

      const registered = getDiscordBadge(normalizedKey);
      const safeIcon = isValidBadgeIconUrl(mb.icon_url) ? mb.icon_url.trim() : "";

      map.set(normalizedKey, {
        key: normalizedKey,
        label: mb.label.trim(),
        description: mb.description.trim(),
        iconUrl: safeIcon || undefined,
        brandColor: registered?.brandColor || "#78a7ff",
        glowColor: registered?.glowColor || "rgba(120, 167, 255, 0.5)",
        sort: typeof mb.sort === "number" ? mb.sort : 999,
      });
    }

    const list = Array.from(map.values());
    list.sort((a, b) => a.sort - b.sort);
    return list;
  }, [apiBadges, propManualBadges, dbManualBadges, disabledBadges]);

  // 4. Zero Layout Shift (CLS = 0): If empty, return null
  if (unifiedBadges.length === 0) {
    return null;
  }

  return (
    <div
      className={`guns-discord-badges-row ${className}`.trim()}
      role="list"
      aria-label="Discord Rozetleri"
    >
      {unifiedBadges.map((badge) => {
        const isActive = activeTooltipKey === badge.key;
        const hasImgFailed = failedImageKeys.has(badge.key);
        const iconSrc = badge.iconUrl || `/badges/${badge.key}.png`;

        return (
          <div
            key={badge.key}
            className={`guns-discord-badge-item ${isActive ? "is-active" : ""}`}
            style={{
              ["--badge-color" as string]: badge.brandColor,
              ["--badge-glow" as string]: badge.glowColor,
            }}
            role="listitem"
            tabIndex={0}
            onMouseEnter={() => setActiveTooltipKey(badge.key)}
            onMouseLeave={() => {
              if (activeTooltipKey === badge.key) setActiveTooltipKey(null);
            }}
            onFocus={() => setActiveTooltipKey(badge.key)}
            onBlur={() => {
              if (activeTooltipKey === badge.key) setActiveTooltipKey(null);
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTooltipKey((prev) => (prev === badge.key ? null : badge.key));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                setActiveTooltipKey((prev) => (prev === badge.key ? null : badge.key));
              }
            }}
            aria-label={`${badge.label}: ${badge.description}`}
          >
            <div className="guns-discord-badge-icon-wrap">
              {!hasImgFailed ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={iconSrc}
                  alt={badge.label}
                  width={size}
                  height={size}
                  loading="lazy"
                  decoding="async"
                  onError={() => {
                    setFailedImageKeys((prev) => {
                      const next = new Set(prev);
                      next.add(badge.key);
                      return next;
                    });
                  }}
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              ) : (
                <DiscordBadgeIcon badgeId={badge.key} size={size} />
              )}
            </div>

            {/* Accessible interactive dark tooltip */}
            <div className="guns-discord-badge-tooltip" role="tooltip">
              <div className="guns-discord-badge-tooltip-header">
                {!hasImgFailed ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={iconSrc}
                    alt=""
                    width={13}
                    height={13}
                    aria-hidden="true"
                    style={{
                      width: "13px",
                      height: "13px",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <DiscordBadgeIcon badgeId={badge.key} size={13} />
                )}
                <span className="guns-discord-badge-tooltip-title">
                  {badge.label}
                </span>
              </div>
              {badge.description ? (
                <p className="guns-discord-badge-tooltip-desc">
                  {badge.description}
                </p>
              ) : null}
              <span className="guns-discord-badge-tooltip-arrow" aria-hidden="true" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DiscordBadges;
