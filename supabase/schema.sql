-- Mixtape Memories Database & Storage Setup SQL

-- 1. Create Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  couple_names TEXT NOT NULL,
  event_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Prompts Table
CREATE TABLE IF NOT EXISTS public.prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Recordings Table
CREATE TABLE IF NOT EXISTS public.recordings (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  guest_name TEXT,
  prompt_used TEXT,
  audio_url TEXT NOT NULL,
  photo_url TEXT,
  duration INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS) & Public Policies
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow public insert events" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read prompts" ON public.prompts FOR SELECT USING (true);
CREATE POLICY "Allow public insert prompts" ON public.prompts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete prompts" ON public.prompts FOR DELETE USING (true);
CREATE POLICY "Allow public read recordings" ON public.recordings FOR SELECT USING (true);
CREATE POLICY "Allow public insert recordings" ON public.recordings FOR INSERT WITH CHECK (true);

-- 5. Create Storage Bucket 'mixtape-recordings'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('mixtape-recordings', 'mixtape-recordings', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Storage" ON storage.objects FOR SELECT USING (bucket_id = 'mixtape-recordings');
CREATE POLICY "Public Insert Storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'mixtape-recordings');
