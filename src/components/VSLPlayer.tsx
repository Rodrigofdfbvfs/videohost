import { useEffect, useRef, useState } from "react";
import type { VSLSettings } from "@/lib/vsl-types";
import { VSLBanner } from "@/components/VSLBanner";

type Props = {
  videoUrl: string;
  posterUrl?: string | null;
  settings: VSLSettings;
};

export function VSLPlayer({ videoUrl, posterUrl, settings }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Try to autoplay muted on mount
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, [videoUrl]);

  // Block pause/seek if enabled
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !settings.block_controls) return;
    const onPause = () => { if (!v.ended) v.play().catch(() => {}); };
    let lastTime = 0;
    const onTime = () => {
      if (v.currentTime > lastTime + 1.5) v.currentTime = lastTime;
      else lastTime = v.currentTime;
      setCurrentTime(v.currentTime);
    };
    v.addEventListener("pause", onPause);
    v.addEventListener("timeupdate", onTime);
    return () => {
      v.removeEventListener("pause", onPause);
      v.removeEventListener("timeupdate", onTime);
    };
  }, [settings.block_controls]);

  // Track time when controls aren't blocked
  useEffect(() => {
    const v = videoRef.current;
    if (!v || settings.block_controls) return;
    const onTime = () => setCurrentTime(v.currentTime);
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, [settings.block_controls]);

  const handleUnlock = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.volume = 1;
    v.play().catch(() => {});
    setMuted(false);
    setUnlocked(true);
  };

  const showOverlay = settings.show_click_to_listen && !unlocked;

  const isVertical = settings.video_orientation === "vertical";

  return (
    <div
      className={`relative bg-black rounded-xl overflow-hidden shadow-card ${isVertical ? "aspect-[9/16] max-w-sm mx-auto" : "w-full aspect-video"}`}
      style={{ containerType: "inline-size" }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl ?? undefined}
        className="w-full h-full object-contain bg-black"
        playsInline
        muted={muted}
        autoPlay
        controls={!settings.block_controls && unlocked}
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
      />

      {showOverlay && (
        <VSLBanner settings={settings} onClick={handleUnlock} />
      )}

    </div>
  );
}
