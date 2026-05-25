import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Copy, Save, ExternalLink, Play } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { VSLPlayer } from "@/components/VSLPlayer";
import { defaultSettings, type VSLSettings } from "@/lib/vsl-types";

export const Route = createFileRoute("/videos/$id")({ component: VideoEditor });

function VideoEditor() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [settings, setSettings] = useState<VSLSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<"player" | "banner">("player");

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("videos").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
      if (error) { toast.error(error.message); return; }
      if (!data) { navigate({ to: "/dashboard" }); return; }
      setTitle(data.title);
      setVideoUrl(data.video_url ?? "");
      setSettings({ ...defaultSettings, ...(data.settings as Partial<VSLSettings>) });
      setLoaded(true);
    });
  }, [id, user, navigate]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("videos")
      .update({ title, settings: settings as never }).eq("id", id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Configurações salvas!");
  };

  const embedUrl = typeof window !== "undefined" ? `${window.location.origin}/embed/${id}` : `/embed/${id}`;
  const embedCode = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;">
  <iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="autoplay; fullscreen" allowfullscreen></iframe>
</div>`;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  if (!loaded) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;

  const update = <K extends keyof VSLSettings>(k: K, v: VSLSettings[K]) => setSettings((s) => ({ ...s, [k]: v }));

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-40 bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-primary fill-primary" />
            <span className="font-semibold">{title || "Editor VSL"}</span>
          </div>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground font-semibold shadow-glow hover:opacity-90 disabled:opacity-50 transition">
            <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr_380px] gap-8">
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Título do VSL</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full px-3.5 py-2.5 rounded-lg bg-input border border-border focus:border-primary outline-none text-lg font-semibold transition" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Preview do player</h2>
            {videoUrl ? (
              <VSLPlayer key={JSON.stringify(settings)} videoUrl={videoUrl} settings={settings} />
            ) : (
              <div className="aspect-video bg-card rounded-xl flex items-center justify-center text-muted-foreground">Sem vídeo</div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Dica: o preview reflete exatamente o que aparecerá na sua página de vendas. As mudanças aplicam ao salvar.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card/60 backdrop-blur p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Código embed</h3>
              <a href={embedUrl} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline flex items-center gap-1">
                Abrir <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Cole este código no HTML da sua página de vendas:</p>
            <div className="relative">
              <pre className="text-xs bg-background/80 border border-border rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-all">{embedCode}</pre>
              <button onClick={() => copy(embedCode, "Código")}
                className="absolute top-2 right-2 p-2 rounded-md bg-secondary hover:bg-primary hover:text-primary-foreground transition">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input readOnly value={embedUrl}
                className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-xs font-mono" />
              <button onClick={() => copy(embedUrl, "Link")} className="px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5" /> URL
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          {/* Tabs */}
          <div className="flex rounded-lg bg-background/50 border border-border p-1 gap-1">
            {(["player", "banner"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition ${activeTab === tab ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {tab === "player" ? "Player" : "Adesivo"}
              </button>
            ))}
          </div>

          {activeTab === "player" && (
            <>
              <div className="rounded-xl border border-border bg-card/60 backdrop-blur p-5">
                <h3 className="font-semibold mb-4">Controles do player</h3>
                <Toggle label="Bloquear pause e avanço" checked={settings.block_controls}
                  onChange={(v) => update("block_controls", v)} />
                <p className="text-xs text-muted-foreground mt-2">Impede que o usuário pause ou avance o vídeo (estilo VSL).</p>
              </div>

              <div className="rounded-xl border border-border bg-card/60 backdrop-blur p-5">
                <h3 className="font-semibold mb-4">Formato do vídeo</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(["horizontal", "vertical"] as const).map((orientation) => (
                    <button key={orientation} onClick={() => update("video_orientation", orientation)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${settings.video_orientation === orientation ? "border-primary bg-primary/10" : "border-border bg-input hover:border-primary/50"}`}>
                      <div className={`bg-muted-foreground/30 rounded ${orientation === "horizontal" ? "w-12 h-7" : "w-7 h-12"}`} />
                      <span className="text-xs font-medium">{orientation === "horizontal" ? "Horizontal" : "Vertical"}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card/60 backdrop-blur p-5">
                <h3 className="font-semibold mb-4">Aparência</h3>
                <label className="text-xs text-muted-foreground">Cor principal</label>
                <div className="mt-1 flex gap-2">
                  <input type="color" value={settings.primary_color} onChange={(e) => update("primary_color", e.target.value)}
                    className="w-12 h-10 rounded-lg bg-input border border-border cursor-pointer" />
                  <input value={settings.primary_color} onChange={(e) => update("primary_color", e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-input border border-border focus:border-primary outline-none text-sm font-mono" />
                </div>
              </div>
            </>
          )}

          {activeTab === "banner" && (
            <>
              <div className="rounded-xl border border-border bg-card/60 backdrop-blur p-5">
                <h3 className="font-semibold mb-4">Adesivo sonoro</h3>
                <Toggle label="Mostrar adesivo" checked={settings.show_click_to_listen}
                  onChange={(v) => update("show_click_to_listen", v)} />
              </div>

              <div className="rounded-xl border border-border bg-card/60 backdrop-blur p-5 space-y-4">
                <h3 className="font-semibold">Texto</h3>
                <div>
                  <label className="text-xs text-muted-foreground">Texto superior</label>
                  <input value={settings.banner_text_top} onChange={(e) => update("banner_text_top", e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-input border border-border focus:border-primary outline-none text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Texto inferior</label>
                  <input value={settings.banner_text_bot} onChange={(e) => update("banner_text_bot", e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-input border border-border focus:border-primary outline-none text-sm" />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card/60 backdrop-blur p-5 space-y-4">
                <h3 className="font-semibold">Cores</h3>
                <ColorRow label="Cor do fundo" value={settings.banner_bg} onChange={(v) => update("banner_bg", v)} />
                <ColorRow label="Cor do texto e ícone" value={settings.banner_fg} onChange={(v) => update("banner_fg", v)} />
                <ColorRow label="Cor da onda" value={settings.banner_wave_color} onChange={(v) => update("banner_wave_color", v)} />
              </div>

              <div className="rounded-xl border border-border bg-card/60 backdrop-blur p-5 space-y-4">
                <h3 className="font-semibold">Tamanho e posição</h3>
                <SliderRow label="Largura do adesivo" value={settings.banner_width} min={20} max={90} step={1}
                  display={(v) => `${v}%`} onChange={(v) => update("banner_width", v)} />
                <SliderRow label="Tamanho geral" value={settings.banner_scale} min={0.5} max={2.0} step={0.05}
                  display={(v) => `${Math.round(v * 100)}%`} onChange={(v) => update("banner_scale", v)} />
                <SliderRow label="Opacidade do adesivo" value={settings.banner_opacity} min={10} max={100} step={1}
                  display={(v) => `${v}%`} onChange={(v) => update("banner_opacity", v)} />
              </div>

              <div className="rounded-xl border border-border bg-card/60 backdrop-blur p-5 space-y-4">
                <h3 className="font-semibold">Texto e animação</h3>
                <SliderRow label="Tamanho texto superior" value={settings.banner_font_size_top} min={1} max={9} step={0.1}
                  display={(v) => v.toFixed(1)} onChange={(v) => update("banner_font_size_top", v)} />
                <SliderRow label="Tamanho texto inferior" value={settings.banner_font_size_bot} min={1} max={9} step={0.1}
                  display={(v) => v.toFixed(1)} onChange={(v) => update("banner_font_size_bot", v)} />
                <SliderRow label="Velocidade da onda" value={settings.banner_speed} min={100} max={900} step={50}
                  display={(v) => `${v}ms`} onChange={(v) => update("banner_speed", v)} />
              </div>
            </>
          )}
        </aside>
      </main>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm">{label}</span>
      <button type="button" onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition ${checked ? "bg-primary" : "bg-secondary"}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </label>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="mt-1 flex gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-10 h-9 rounded-lg bg-input border border-border cursor-pointer flex-shrink-0" />
        <input value={value} onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg bg-input border border-border focus:border-primary outline-none text-sm font-mono" />
      </div>
    </div>
  );
}

function SliderRow({ label, value, min, max, step, display, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  display: (v: number) => string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-xs text-muted-foreground">{label}</label>
        <span className="text-xs font-semibold tabular-nums">{display(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-secondary accent-primary cursor-pointer" />
    </div>
  );
}
