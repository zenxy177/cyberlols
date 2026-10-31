"use client";

import { useEffect, useRef } from "react";

export function BackgroundVideo({
  poster,
  src,
}: {
  poster: string | null;
  src: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const syncPlayback = () => {
      if (motionPreference.matches) {
        video.pause();
        return;
      }

      void video.play().catch(() => {
        // A still poster remains visible if autoplay is unavailable.
      });
    };

    syncPlayback();
    motionPreference.addEventListener("change", syncPlayback);
    return () => motionPreference.removeEventListener("change", syncPlayback);
  }, []);

  return (
    <video
      aria-hidden="true"
      className="profile-background-video"
      loop
      muted
      playsInline
      poster={poster ?? undefined}
      preload="metadata"
      ref={videoRef}
      src={src}
      tabIndex={-1}
    />
  );
}
