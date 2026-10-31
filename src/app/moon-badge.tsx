"use client";

type MoonBadgeProps = {
  title?: string;
  size?: number;
};

export function MoonBadge({ title = "Moon Knight", size = 20 }: MoonBadgeProps) {
  return (
    <div
      className="guns-moon-badge interactive"
      title={title}
      aria-label={`Rozet: ${title}`}
      role="img"
    >
      <div className="guns-moon-badge-glow" aria-hidden="true" />
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className="guns-moon-icon"
        aria-hidden="true"
      >
        <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 12c0 5.385 4.365 9.75 9.75 9.75 4.14 0 7.697-2.585 9.002-6.748z" />
      </svg>

      {/* Floating Micro Tooltip on Hover */}
      <span className="guns-moon-tooltip" role="tooltip">
        {title}
      </span>
    </div>
  );
}
