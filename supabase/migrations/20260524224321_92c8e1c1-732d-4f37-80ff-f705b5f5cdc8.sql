
-- Videos table
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Novo VSL',
  video_url TEXT,
  poster_url TEXT,
  settings JSONB NOT NULL DEFAULT '{
    "click_to_listen_text": "Seu vídeo já começou. Clique para ouvir.",
    "show_click_to_listen": true,
    "block_controls": true,
    "cta_enabled": true,
    "cta_delay_seconds": 30,
    "cta_text": "QUERO GARANTIR O MEU AGORA",
    "cta_url": "https://",
    "primary_color": "#6366f1"
  }'::jsonb,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own videos" ON public.videos
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view videos for embed" ON public.videos
  FOR SELECT TO anon USING (true);
CREATE POLICY "Users can insert own videos" ON public.videos
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own videos" ON public.videos
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own videos" ON public.videos
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.tg_videos_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER videos_updated_at BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.tg_videos_updated_at();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('vsl-videos', 'vsl-videos', true, 524288000)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can read vsl videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'vsl-videos');
CREATE POLICY "Auth users can upload vsl videos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'vsl-videos' AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "Users can update own vsl videos" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'vsl-videos' AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "Users can delete own vsl videos" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'vsl-videos' AND (storage.foldername(name))[1] = auth.uid()::text
  );
