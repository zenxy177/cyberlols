import React from "react";

export * from "./discord-badges.ts";
import {
  type DiscordBadge,
  getDiscordBadge,
  ALL_DISCORD_BADGES,
} from "./discord-badges.ts";


/**
 * Authentic high-definition Discord Badge SVG icons
 */
export function DiscordBadgeIcon({
  badgeId,
  size = 18,
  className = "",
}: {
  badgeId: string;
  size?: number;
  className?: string;
}) {
  const rawId = React.useId();
  const gradSuffix = `-${rawId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

  switch (badgeId) {
    case "active_developer":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <rect
            x="1.5"
            y="1.5"
            width="21"
            height="21"
            rx="5.5"
            fill="#181a1f"
            stroke="#57f287"
            strokeWidth="1.2"
            strokeOpacity="0.45"
          />
          <path
            d="M6.5 8l4.2 4-4.2 4"
            stroke="#57f287"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.8 16h4.7"
            stroke="#57f287"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
        </svg>
      );

    case "nitro":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`nitro-grad-${badgeId}${gradSuffix}`} x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#b6b3ff" />
              <stop offset="0.45" stopColor="#ff79d7" />
              <stop offset="1" stopColor="#8e6cff" />
            </linearGradient>
          </defs>
          <path
            d="M12 1.8l8.7 5v10.4l-8.7 5-8.7-5V6.8l8.7-5z"
            fill={`url(#nitro-grad-${badgeId}${gradSuffix})`}
          />
          <path
            d="M7.1 15.9l3.2-7.8h2.8l-1.8 4.2h3.1l-1.7 3.6H7.1zm7.1-1.8l2.7-6.3h-2.8l-1.2 2.8h-2.2l1.2-2.8h-2.8l-2.7 6.3h2.8l1.2-2.8h2.2l-1.2 2.8h2.8z"
            fill="#ffffff"
          />
        </svg>
      );

    case "booster":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={`booster-grad-${badgeId}${gradSuffix}`}
              x1="4"
              y1="3"
              x2="20"
              y2="21"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#ff73fa" />
              <stop offset="1" stopColor="#e01e5a" />
            </linearGradient>
          </defs>
          <path
            d="M12 2.5L4 8l8 13.5L20 8l-8-5.5z"
            fill={`url(#booster-grad-${badgeId}${gradSuffix})`}
          />
          <path
            d="M12 2.5L4 8h16l-8-5.5zm0 13.5L7.2 8.8h9.6L12 16z"
            fill="rgba(255, 255, 255, 0.32)"
          />
        </svg>
      );

    case "early_supporter":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10.5" fill="#f47b67" />
          <path
            d="M17.5 7.5h-1.6V6.2c0-.7-.5-1.2-1.2-1.2H9.3c-.7 0-1.2.5-1.2 1.2v1.3H6.5c-.7 0-1.2.5-1.2 1.2v1.5c0 2.2 1.7 4 3.9 4.2.6 1.4 1.8 2.4 3.3 2.6v1.8H10c-.4 0-.8.3-.8.8s.4.8.8.8h4c.4 0 .8-.3.8-.8s-.4-.8-.8-.8h-1.5V17c1.5-.2 2.7-1.2 3.3-2.6 2.2-.2 3.9-2 3.9-4.2V8.7c0-.7-.5-1.2-1.2-1.2h-.2zM6.9 10.2v-1.1h1.2v2.3c-.7-.2-1.2-.7-1.2-1.2zm10.2 1.2V9.1h1.2v1.1c0 .5-.5 1-1.2 1.2z"
            fill="#ffffff"
          />
          <path
            d="M12 8.2l.8 1.6 1.8.3-1.3 1.3.3 1.8-1.6-.8-1.6.8.3-1.8-1.3-1.3 1.8-.3.8-1.6z"
            fill="#fee75c"
          />
        </svg>
      );

    case "bravery":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M12 2L4.5 6.5v4.8c0 5.2 3.2 10.1 7.5 11.4 4.3-1.3 7.5-6.2 7.5-11.4V6.5L12 2z"
            fill="#9c84ef"
          />
          <path
            d="M12 6.2l4.8 4.8-1.8 1.8-3-3-3 3-1.8-1.8L12 6.2zm0 5l2.4 2.4-2.4 2.4-2.4-2.4 2.4-2.4z"
            fill="#ffffff"
          />
        </svg>
      );

    case "brilliance":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M12 2L4.5 6.5v4.8c0 5.2 3.2 10.1 7.5 11.4 4.3-1.3 7.5-6.2 7.5-11.4V6.5L12 2z"
            fill="#f47b67"
          />
          <path
            d="M12 17.8l-4.8-4.8 1.8-1.8 3 3 3-3 1.8 1.8-4.8 4.8zm0-5l-2.4-2.4 2.4-2.4 2.4 2.4-2.4 2.4z"
            fill="#ffffff"
          />
        </svg>
      );

    case "balance":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M12 2L4.5 6.5v4.8c0 5.2 3.2 10.1 7.5 11.4 4.3-1.3 7.5-6.2 7.5-11.4V6.5L12 2z"
            fill="#45ddc0"
          />
          <path
            d="M7.8 8.8l4.2-2.5 4.2 2.5-4.2 6.8-4.2-6.8zm2.5 1.5l1.7 2.8 1.7-2.8-1.7-1-1.7 1z"
            fill="#ffffff"
          />
          <path
            d="M12 16.5v2M9.5 18.5h5"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case "early_bot_developer":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <rect width="24" height="24" rx="6" fill="#2b2d31" />
          <path
            d="M8.5 7.5L4.5 12l4 4.5M15.5 7.5l4 4.5-4 4.5M13.5 6l-3 12"
            stroke="#5865f2"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "staff":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M12 2L4 5.5v5.5c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V5.5L12 2z"
            fill="#5865f2"
          />
          <path
            d="M16.5 9.5c-.9-.4-1.8-.7-2.8-.8-.1.2-.3.5-.4.8-1-.2-2.1-.2-3.1 0-.1-.3-.3-.6-.4-.8-1 .1-1.9.4-2.8.8-1.5 2.2-1.9 4.3-1.7 6.4 1.2.9 2.4 1.4 3.6 1.4.3-.4.6-.8.8-1.2-.4-.2-.8-.4-1.2-.6.1-.1.2-.1.3-.2 2.3 1.1 4.7 1.1 7 0 .1.1.2.1.3.2-.4.3-.8.5-1.2.6.3.4.6.8.8 1.2 1.2 0 2.4-.5 3.6-1.4.3-2.5-.5-4.6-1.7-6.5zm-6.2 5c-.7 0-1.2-.6-1.2-1.4 0-.8.5-1.4 1.2-1.4.7 0 1.2.6 1.2 1.4 0 .8-.5 1.4-1.2 1.4zm3.4 0c-.7 0-1.2-.6-1.2-1.4 0-.8.5-1.4 1.2-1.4.7 0 1.2.6 1.2 1.4 0 .8-.5 1.4-1.2 1.4z"
            fill="#ffffff"
          />
        </svg>
      );

    case "partner":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10.5" fill="#5865f2" />
          <path
            d="M16.2 8.5c-1.3 0-2.4.7-3.1 1.7-.3.4-.6.9-.9 1.4-.4-.7-.9-1.4-1.4-2-.8-.9-1.9-1.4-3.1-1.4-2.3 0-4.2 1.9-4.2 4.2s1.9 4.2 4.2 4.2c1.3 0 2.4-.6 3.1-1.6.4-.5.8-1.1 1.1-1.7.3.6.7 1.2 1.2 1.7.8 1 1.9 1.6 3.1 1.6 2.3 0 4.2-1.9 4.2-4.2s-1.9-4.2-4.2-4.2zm-8.5 6.2c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm8.5 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
            fill="#ffffff"
          />
        </svg>
      );

    case "hypesquad_events":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10.5" fill="#faa61a" />
          <path
            d="M12 4.5l1.8 4.2 4.5.4-3.4 3 1 4.4L12 14.2l-3.9 2.3 1-4.4-3.4-3 4.5-.4L12 4.5z"
            fill="#ffffff"
          />
          <path
            d="M12 7.2l1.1 2.5 2.7.2-2.1 1.8.6 2.6L12 13l-2.3 1.3.6-2.6-2.1-1.8 2.7-.2L12 7.2z"
            fill="#e28a0e"
          />
        </svg>
      );

    case "bug_hunter_1":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M12 2.5L4.5 5.8v5.5c0 5.2 3.2 10.1 7.5 11.4 4.3-1.3 7.5-6.2 7.5-11.4V5.8L12 2.5z"
            fill="#3ba55d"
          />
          <circle cx="12" cy="11.5" r="3.2" fill="#ffffff" />
          <path
            d="M8.5 10.5h-2M8.5 13h-2M15.5 10.5h2M15.5 13h2M10.2 8.2l-1.4-1.4M13.8 8.2l1.4-1.4"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case "bug_hunter_2":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M12 2.5L4.5 5.8v5.5c0 5.2 3.2 10.1 7.5 11.4 4.3-1.3 7.5-6.2 7.5-11.4V5.8L12 2.5z"
            fill="#f1c40f"
          />
          <circle cx="12" cy="11.5" r="3.2" fill="#ffffff" />
          <path
            d="M8.5 10.5h-2M8.5 13h-2M15.5 10.5h2M15.5 13h2M10.2 8.2l-1.4-1.4M13.8 8.2l1.4-1.4"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M10.5 11.5l1.5 1.5 2-2"
            stroke="#f1c40f"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      );

    case "moderator_programs_alumni":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10.5" fill="#5865f2" />
          <path
            d="M12 6L4.5 9.8 12 13.5l7.5-3.7L12 6zm-5 6.2v3.8c0 2.2 2.2 4 5 4s5-1.8 5-4v-3.8l-5 2.5-5-2.5z"
            fill="#ffffff"
          />
        </svg>
      );

    case "quest":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10.5" fill="#8a5cf6" />
          <path
            d="M7 11a5 5 0 0110 0v1a2 2 0 01-2 2h-1l-2 2-2-2H9a2 2 0 01-2-2v-1z"
            fill="#ffffff"
          />
          <circle cx="10" cy="11" r="1" fill="#8a5cf6" />
          <circle cx="14" cy="11" r="1" fill="#8a5cf6" />
        </svg>
      );

    default:
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" fill="#5865f2" />
          <path
            d="M12 7v5l3 3"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

export function DiscordBadgeItem({
  badge,
  size = 18,
}: {
  badge: DiscordBadge;
  size?: number;
}) {
  const [active, setActive] = React.useState(false);

  return (
    <div
      className={`guns-discord-badge-item ${active ? "is-active" : ""}`}
      style={{
        ["--badge-color" as string]: badge.brandColor,
        ["--badge-glow" as string]: badge.glowColor,
      }}
      role="listitem"
      tabIndex={0}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      onPointerDown={(e) => {
        // Prevent parent <a> drag or unwanted activation
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setActive((prev) => !prev);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          setActive((prev) => !prev);
        }
      }}
      aria-label={`${badge.name}: ${badge.description}`}
    >
      <div className="guns-discord-badge-icon-wrap">
        <DiscordBadgeIcon badgeId={badge.id} size={size} />
      </div>

      <div className="guns-discord-badge-tooltip" role="tooltip">
        <div className="guns-discord-badge-tooltip-header">
          <DiscordBadgeIcon badgeId={badge.id} size={13} />
          <span className="guns-discord-badge-tooltip-title">{badge.name}</span>
        </div>
        <p className="guns-discord-badge-tooltip-desc">{badge.description}</p>
        <span className="guns-discord-badge-tooltip-arrow" aria-hidden="true" />
      </div>
    </div>
  );
}
