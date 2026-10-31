"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { Music, Pause, Play, Volume2, VolumeX } from "lucide-react";

type AudioPlayerProps = {
  audioUrl?: string | null;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  title?: string;
  artist?: string;
  defaultVolume?: number;
  shouldPlay?: boolean;
};

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function AudioPlayer({
  audioUrl,
  videoRef,
  title = "Arka Plan Müziği",
  artist = "",
  defaultVolume = 50,
  shouldPlay = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(defaultVolume / 100);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isVideo = Boolean(videoRef && !audioUrl);

  const getMedia = useCallback((): HTMLMediaElement | null => {
    if (isVideo && videoRef) {
      return videoRef.current;
    }
    return audioRef.current;
  }, [isVideo, videoRef]);

  // Synchronize initial volume and cached metadata
  useEffect(() => {
    const el = getMedia();
    if (el) {
      const initialVol = Math.max(0, Math.min(1, defaultVolume / 100));
      if (!isVideo || !el.muted) {
        el.volume = initialVol;
      }
      setVolume(initialVol);
      if (el.duration && !isNaN(el.duration)) {
        setDuration(el.duration);
      }
    }
  }, [defaultVolume, isVideo, getMedia]);

  // Synchronize events from media element (especially for external videoRef)
  useEffect(() => {
    const el = getMedia();
    if (!el) return;

    function onPlay() {
      setIsPlaying(true);
    }
    function onPause() {
      setIsPlaying(false);
    }
    function onEnded() {
      setIsPlaying(false);
    }
    function onTimeUpdate() {
      if (el) setCurrentTime(el.currentTime);
    }
    function onLoadedMetadata() {
      if (el) setDuration(el.duration);
    }
    function onVolumeChange() {
      if (el) {
        setVolume(el.volume);
        setIsMuted(el.muted);
      }
    }

    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("loadedmetadata", onLoadedMetadata);
    el.addEventListener("volumechange", onVolumeChange);

    if (el.duration && !isNaN(el.duration)) setDuration(el.duration);
    if (!el.paused) setIsPlaying(true);
    setIsMuted(el.muted);

    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("loadedmetadata", onLoadedMetadata);
      el.removeEventListener("volumechange", onVolumeChange);
    };
  }, [getMedia]);

  // Handle immediate play event dispatched synchronously from Click to Enter user gesture
  useEffect(() => {
    function handleGesturePlay() {
      const el = getMedia();
      if (!el) return;

      setHasStarted(true);
      if (isVideo) {
        el.muted = false;
        el.volume = Math.max(0, Math.min(1, defaultVolume / 100));
      }

      el.play()
        .then(() => {
          setIsPlaying(true);
          setError(null);
        })
        .catch((err) => {
          console.warn("Autoplay was prevented or media failed:", err);
        });
    }

    window.addEventListener("guns:play-audio", handleGesturePlay);
    return () => window.removeEventListener("guns:play-audio", handleGesturePlay);
  }, [isVideo, defaultVolume, getMedia]);

  // Handle play trigger fallback from Click to Enter state
  useEffect(() => {
    if (shouldPlay && !hasStarted) {
      const el = getMedia();
      if (!el) return;

      setHasStarted(true);
      if (isVideo) {
        el.muted = false;
        el.volume = Math.max(0, Math.min(1, defaultVolume / 100));
      }

      el.play()
        .then(() => {
          setIsPlaying(true);
          setError(null);
        })
        .catch((err) => {
          console.warn("Autoplay was prevented or media failed:", err);
        });
    }
  }, [shouldPlay, isVideo, hasStarted, defaultVolume, getMedia]);

  function togglePlay() {
    const el = getMedia();
    if (!el) return;

    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      if (isVideo && el.muted) {
        el.muted = false;
      }
      el.play()
        .then(() => {
          setIsPlaying(true);
          setError(null);
        })
        .catch((err) => {
          console.error("Playback failed:", err);
          setError("Ses oynatılamadı");
        });
    }
  }

  function toggleMute() {
    const el = getMedia();
    if (!el) return;

    if (isMuted) {
      el.muted = false;
      setIsMuted(false);
    } else {
      el.muted = true;
      setIsMuted(true);
    }
  }

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

  function handleSeek(e: MouseEvent<HTMLDivElement>) {
    const el = getMedia();
    if (!progressBarRef.current || !el || !isFinite(duration) || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const boundedPosition = Math.max(0, Math.min(1, clickPosition));
    const newTime = boundedPosition * duration;
    el.currentTime = newTime;
    setCurrentTime(newTime);
  }

  if (!audioUrl && !videoRef) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="guns-audio-player" role="region" aria-label="Müzik çalar">
      {audioUrl ? (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          loop
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onError={() => setError("Müzik dosyası yüklenemedi")}
        />
      ) : null}

      <div className="guns-audio-disc">
        <button
          className={`guns-audio-play-button${isPlaying ? " is-playing" : ""}`}
          onClick={togglePlay}
          aria-label={isPlaying ? "Müziği duraklat" : "Müziği oynat"}
          type="button"
        >
          {isPlaying ? (
            <Pause size={17} strokeWidth={2.2} />
          ) : (
            <Play size={17} strokeWidth={2.2} className="guns-play-icon-offset" />
          )}
        </button>

        {/* Mini animated equalizer bars */}
        <div className={`guns-audio-visualizer${isPlaying ? " is-animating" : ""}`} aria-hidden="true">
          <span className="visualizer-bar bar-1" />
          <span className="visualizer-bar bar-2" />
          <span className="visualizer-bar bar-3" />
          <span className="visualizer-bar bar-4" />
        </div>
      </div>

      <div className="guns-audio-info">
        <div className="guns-audio-meta">
          <Music size={13} className="guns-audio-note-icon" aria-hidden="true" />
          <span className="guns-audio-title" title={title}>
            {title}
          </span>
          {artist ? <span className="guns-audio-artist">- {artist}</span> : null}
        </div>

        <div
          ref={progressBarRef}
          className="guns-audio-progress-bar"
          onClick={handleSeek}
          role="progressbar"
          aria-valuenow={currentTime}
          aria-valuemin={0}
          aria-valuemax={duration || 100}
        >
          <div
            className="guns-audio-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="guns-audio-timestamps">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="guns-audio-volume-controls">
        <button
          className="guns-audio-mute-button"
          onClick={toggleMute}
          aria-label={isMuted ? "Sesi aç" : "Sesi kapat"}
          type="button"
        >
          {isMuted || volume === 0 ? (
            <VolumeX size={15} strokeWidth={2} />
          ) : (
            <Volume2 size={15} strokeWidth={2} />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="guns-audio-volume-slider"
          aria-label="Ses seviyesi"
        />
      </div>

      {error ? (
        <span className="guns-audio-error" role="status">
          {error}
        </span>
      ) : null}
    </div>
  );
}
