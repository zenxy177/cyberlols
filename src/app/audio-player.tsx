"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

type AudioPlayerProps = {
  audioUrl?: string | null;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  videoAudioFallback?: "video" | "music";
  onVideoAudioChange?: (active: boolean) => void;
  title?: string;
  artist?: string;
  defaultVolume?: number;
  shouldPlay?: boolean;
};

export function AudioPlayer({
  audioUrl,
  videoRef,
  videoAudioFallback = "video",
  onVideoAudioChange,
  title = "Arka Plan Müziği",
  defaultVolume = 50,
  shouldPlay = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [volume, setVolume] = useState(defaultVolume / 100);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isVideo = useRef(Boolean(videoRef));

  const getMedia = useCallback((): HTMLMediaElement | null => {
    if (isVideo.current && videoRef) {
      return videoRef.current;
    }
    return audioRef.current;
  }, [videoRef]);

  const activateAudio = useCallback(() => {
    const video = videoRef?.current;
    const audioTracks = video
      ? (video as HTMLVideoElement & { audioTracks?: { length: number } }).audioTracks
      : undefined;
    const mozHasAudio = video
      ? (video as HTMLVideoElement & { mozHasAudio?: boolean }).mozHasAudio
      : undefined;
    const canUseVideoAudio =
      Boolean(video) &&
      (!audioUrl ||
        (typeof audioTracks?.length === "number"
          ? audioTracks.length > 0
          : typeof mozHasAudio === "boolean"
            ? mozHasAudio
            : videoAudioFallback === "video"));
    const media = canUseVideoAudio ? video : audioRef.current;
    if (!media) return;

    if (
      !canUseVideoAudio &&
      video &&
      video.readyState >= HTMLMediaElement.HAVE_METADATA &&
      video.seekable.length > 0
    ) {
      try {
        video.currentTime = 0;
      } catch (err) {
        console.warn("Background video could not be synchronized with fallback music:", err);
      }
    }

    isVideo.current = canUseVideoAudio;
    onVideoAudioChange?.(canUseVideoAudio);
    setHasStarted(true);
    media.muted = false;
    media.volume = Math.max(0, Math.min(1, defaultVolume / 100));
    setVolume(media.volume);
    media.play()
      .then(() => setError(null))
      .catch((err) => {
        console.warn("Autoplay was prevented or media failed:", err);
        setError("Ses başlatılamadı. Ses ayarlarını kontrol edip yeniden deneyin.");
      });
  }, [audioUrl, defaultVolume, onVideoAudioChange, videoAudioFallback, videoRef]);

  // Synchronize initial volume and cached metadata
  useEffect(() => {
    const el = getMedia();
    if (el) {
      const initialVol = Math.max(0, Math.min(1, defaultVolume / 100));
      if (!isVideo.current || !el.muted) {
        el.volume = initialVol;
      }
      setVolume(initialVol);
    }
  }, [defaultVolume, getMedia]);

  // Synchronize mute state from media element (especially for external videoRef)
  useEffect(() => {
    const el = getMedia();
    if (!el) return;

    function onVolumeChange() {
      if (el) {
        setVolume(el.volume);
        setIsMuted(el.muted);
      }
    }

    el.addEventListener("volumechange", onVolumeChange);
    setIsMuted(el.muted);

    return () => {
      el.removeEventListener("volumechange", onVolumeChange);
    };
  }, [getMedia, hasStarted]);

  // Handle immediate play event dispatched synchronously from Click to Enter user gesture
  useEffect(() => {
    window.addEventListener("guns:play-audio", activateAudio);
    return () => window.removeEventListener("guns:play-audio", activateAudio);
  }, [activateAudio]);

  // Handle play trigger fallback from Click to Enter state
  useEffect(() => {
    if (shouldPlay && !hasStarted) {
      activateAudio();
    }
  }, [shouldPlay, hasStarted, activateAudio]);

  // Close the popover on outside click or Escape
  useEffect(() => {
    if (!panelOpen) return;

    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setPanelOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [panelOpen]);

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    const el = getMedia();
    if (el) {
      el.volume = newVol;
      if (newVol > 0 && el.muted) {
        el.muted = false;
        setIsMuted(false);
      }
    }
  }

  if (!audioUrl && !videoRef) return null;

  return (
    <div ref={rootRef} className="guns-audio-player">
      {audioUrl ? (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          loop
          onError={() => setError("Müzik dosyası yüklenemedi")}
        />
      ) : null}

      <button
        className="guns-audio-mute-button"
        onClick={() => setPanelOpen((open) => !open)}
        aria-label={panelOpen ? "Ses panelini kapat" : "Ses panelini aç"}
        aria-expanded={panelOpen}
        type="button"
      >
        {isMuted || volume === 0 ? (
          <VolumeX size={16} strokeWidth={2} />
        ) : (
          <Volume2 size={16} strokeWidth={2} />
        )}
      </button>

      {panelOpen ? (
        <div className="guns-audio-popover" role="group" aria-label={`Ses seviyesi: ${title}`}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="guns-audio-volume-slider guns-audio-volume-vertical"
            aria-label="Ses seviyesi"
            aria-valuetext={`%${Math.round((isMuted ? 0 : volume) * 100)}`}
          />
        </div>
      ) : null}

      {error ? (
        <span className="guns-audio-error" role="status">
          {error}
        </span>
      ) : null}
    </div>
  );
}
