import { useEffect, useState } from "react";
import type { VSLSettings } from "@/lib/vsl-types";

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

type Props = { settings: VSLSettings; onClick: () => void };

export function VSLBanner({ settings, onClick }: Props) {
  const [activeWave, setActiveWave] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveWave((w) => (w + 1) % 3), settings.banner_speed);
    return () => clearInterval(t);
  }, [settings.banner_speed]);

  const bg = settings.banner_bg ?? "#38a03c";
  const fg = settings.banner_fg ?? "#ffffff";
  const waveColor = settings.banner_wave_color ?? "#ffffff";
  const textTop = settings.banner_text_top ?? "Seu vídeo já começou";
  const textBot = settings.banner_text_bot ?? "Clique para ouvir";
  const fsTop = settings.banner_font_size_top ?? 4.2;
  const fsBot = settings.banner_font_size_bot ?? 3.9;
  const width = settings.banner_width ?? 47;
  const opacity = (settings.banner_opacity ?? 100) / 100;
  const scale = settings.banner_scale ?? 1.0;

  const waveOpacity = (i: number) => (i === activeWave ? 1 : 0.15);

  const pad = `${4 * scale}% ${3 * scale}%`;
  const iconWidth = `${55 * scale}%`;
  const gap = `${3 * scale}%`;
  const radius = `${2 * scale}cqw`;

  return (
    <button
      onClick={onClick}
      aria-label="Clique para ouvir"
      className="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer"
      style={{ background: "rgba(0,0,0,0.45)" }}
    >
      <div
        className="flex flex-col items-center justify-center"
        style={{
          backgroundColor: hexToRgba(bg, opacity),
          width: `${width}%`,
          padding: pad,
          borderRadius: radius,
          gap,
        }}
      >
        <span
          className="font-bold text-center leading-tight w-full"
          style={{ color: fg, fontSize: `${fsTop}cqw`, wordBreak: "break-word" }}
        >
          {textTop}
        </span>

        <svg
          viewBox="0 0 220 130"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: iconWidth, maxWidth: "100%", flexShrink: 0 }}
        >
          <rect fill={fg} x="30" y="44" width="24" height="42" rx="2" />
          <polygon fill={fg} points="54,44 54,86 100,118 100,12" />
          <path d="M108,55 A20,20 0 0,1 108,75" fill="none" stroke={waveColor} strokeWidth="7" strokeLinecap="round" opacity={waveOpacity(0)} />
          <path d="M115,42 A38,38 0 0,1 115,88" fill="none" stroke={waveColor} strokeWidth="7" strokeLinecap="round" opacity={waveOpacity(1)} />
          <path d="M124,28 A58,58 0 0,1 124,102" fill="none" stroke={waveColor} strokeWidth="7" strokeLinecap="round" opacity={waveOpacity(2)} />
        </svg>

        <span
          className="font-bold text-center leading-tight w-full"
          style={{ color: fg, fontSize: `${fsBot}cqw`, wordBreak: "break-word" }}
        >
          {textBot}
        </span>
      </div>
    </button>
  );
}
