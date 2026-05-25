export type VideoOrientation = "horizontal" | "vertical";

export type VSLSettings = {
  click_to_listen_text: string;
  show_click_to_listen: boolean;
  block_controls: boolean;
  cta_enabled: boolean;
  cta_delay_seconds: number;
  cta_text: string;
  cta_url: string;
  primary_color: string;
  video_orientation: VideoOrientation;
  banner_bg: string;
  banner_fg: string;
  banner_wave_color: string;
  banner_speed: number;
  banner_text_top: string;
  banner_text_bot: string;
  banner_font_size_top: number;
  banner_font_size_bot: number;
  banner_width: number;
  banner_opacity: number;
  banner_scale: number;
};

export const defaultSettings: VSLSettings = {
  click_to_listen_text: "Seu vídeo já começou. Clique para ouvir.",
  show_click_to_listen: true,
  block_controls: true,
  cta_enabled: false,
  cta_delay_seconds: 30,
  cta_text: "QUERO GARANTIR O MEU AGORA",
  cta_url: "https://",
  primary_color: "#6366f1",
  video_orientation: "horizontal",
  banner_bg: "#38a03c",
  banner_fg: "#ffffff",
  banner_wave_color: "#ffffff",
  banner_speed: 320,
  banner_text_top: "Seu vídeo já começou",
  banner_text_bot: "Clique para ouvir",
  banner_font_size_top: 4.2,
  banner_font_size_bot: 3.9,
  banner_width: 47,
  banner_opacity: 100,
  banner_scale: 1.0,
};
