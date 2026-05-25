import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Play, LogOut, Plus, Upload, Trash2, Settings, Eye } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { defaultSettings } from "@/lib/vsl-types";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

type Video = {
  id: string;
  title: string;
  video_url: string | null;
  poster_url: string | null;
  views: number;
  created_at: string;
};

function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("videos").select("id,title,video_url,poster_url,views,created_at")
      .eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else setVideos(data ?? []);
      });
  }, [user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("vsl-videos").upload(path, file, {
        cacheControl: "3600", upsert: false,
      });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("vsl-videos").getPublicUrl(path);
      const { data, error } = await supabase.from("videos").insert({
        user_id: user.id,
        title: file.name.replace(/\.[^.]+$/, ""),
        video_url: pub.publicUrl,
        settings: defaultSettings as never,
      }).select().single();
      if (error) throw error;
      toast.success("Vídeo enviado!");
      navigate({ to: "/videos/$id", params: { id: data.id } });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const deleteVideo = async (v: Video) => {
    if (!confirm(`Excluir "${v.title}"?`)) return;
    const { error } = await supabase.from("videos").delete().eq("id", v.id);
    if (error) return toast.error(error.message);
    setVideos((vs) => vs.filter((x) => x.id !== v.id));
    toast.success("Vídeo excluído");
  };

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-40 bg-background/60">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold">VSLHost</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            <button onClick={signOut} className="p-2 rounded-lg hover:bg-secondary transition" title="Sair">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Meus VSLs</h1>
            <p className="text-muted-foreground mt-1">{videos.length} vídeo(s) hospedado(s)</p>
          </div>
          <label className={`flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-primary text-primary-foreground font-semibold shadow-glow cursor-pointer hover:opacity-90 transition ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
            {uploading ? <><Upload className="w-4 h-4 animate-pulse" /> Enviando...</> : <><Plus className="w-4 h-4" /> Novo VSL</>}
            <input type="file" accept="video/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl">
            <Upload className="w-12 h-12 mx-auto text-muted-foreground/60" />
            <h3 className="mt-4 font-semibold text-lg">Nenhum VSL ainda</h3>
            <p className="text-muted-foreground text-sm mt-1">Envie seu primeiro vídeo clicando em "Novo VSL"</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {videos.map((v) => (
              <div key={v.id} className="rounded-xl border border-border bg-card/60 backdrop-blur overflow-hidden hover:border-primary/40 transition group">
                <div className="aspect-video bg-black flex items-center justify-center relative">
                  {v.video_url ? (
                    <video src={v.video_url} className="w-full h-full object-cover" muted preload="metadata" />
                  ) : <Play className="w-10 h-10 text-muted-foreground" />}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate">{v.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    <Eye className="w-3 h-3" /> {v.views} views
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Link to="/videos/$id" params={{ id: v.id }} className="flex-1 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium text-center flex items-center justify-center gap-1.5 transition">
                      <Settings className="w-3.5 h-3.5" /> Editar
                    </Link>
                    <button onClick={() => deleteVideo(v)} className="p-2 rounded-lg bg-secondary hover:bg-destructive/20 hover:text-destructive transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
