import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VSLPlayer } from "@/components/VSLPlayer";
import { defaultSettings, type VSLSettings } from "@/lib/vsl-types";

export const Route = createFileRoute("/embed/$id")({ component: EmbedPage });

function EmbedPage() {
  const { id } = Route.useParams();
  const [data, setData] = useState<{ video_url: string; poster_url: string | null; settings: VSLSettings } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("videos").select("video_url,poster_url,settings").eq("id", id).maybeSingle()
      .then(({ data, error }) => {
        if (error) return setErr(error.message);
        if (!data || !data.video_url) return setErr("Vídeo não encontrado");
        setData({
          video_url: data.video_url,
          poster_url: data.poster_url,
          settings: { ...defaultSettings, ...(data.settings as Partial<VSLSettings>) },
        });
      });
  }, [id]);

  if (err) return <div className="min-h-screen flex items-center justify-center bg-black text-white/80 text-sm">{err}</div>;
  if (!data) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-5xl">
        <VSLPlayer videoUrl={data.video_url} posterUrl={data.poster_url} settings={data.settings} />
      </div>
    </div>
  );
}
