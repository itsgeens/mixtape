import { createClient } from '@supabase/supabase-js';
import { Recording, Prompt, EventConfig } from '@/types';
import { DEFAULT_PROMPTS } from './prompts-data';

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Strip trailing /rest/v1/ if user pasted full REST URL — client expects base project URL
const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const LOCAL_RECORDINGS_KEY = 'mixtape_memories_recordings';
const LOCAL_PROMPTS_KEY = 'mixtape_memories_prompts';
const LOCAL_EVENTS_KEY = 'mixtape_memories_events';

// Default initial event
export const DEFAULT_EVENT: EventConfig = {
  id: 'sarah-john-2026',
  slug: 'sarah-john-2026',
  coupleNames: 'Sarah & John',
  eventDate: '2026-09-15',
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-');
}

// ----------------------------------------------------
// EVENTS MANAGEMENT
// ----------------------------------------------------
function getLocalEvents(): EventConfig[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_EVENTS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

function saveLocalEvents(events: EventConfig[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
}

export async function fetchEvents(): Promise<EventConfig[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: true });
      if (!error && data) {
        const mapped: EventConfig[] = data.map((e) => ({
          id: e.id,
          slug: e.slug,
          coupleNames: e.couple_names,
          eventDate: e.event_date,
          createdAt: e.created_at,
        }));
        // Also sync to local for fallback
        if (typeof window !== 'undefined' && mapped.length > 0) {
          saveLocalEvents(mapped);
        }
        if (mapped.length > 0) return mapped;
      }
    } catch (err) {
      console.warn('Supabase fetchEvents failed, using local fallback:', err);
    }
  }
  const local = getLocalEvents();
  if (local.length > 0) return local;
  // Seed with default if nothing exists
  return [DEFAULT_EVENT];
}

export async function createEvent(input: {
  coupleNames: string;
  eventDate: string;
  slug?: string;
}): Promise<EventConfig> {
  const slug = slugify(input.slug || input.coupleNames);
  const id = slug;
  const newEvent: EventConfig = {
    id,
    slug,
    coupleNames: input.coupleNames.trim(),
    eventDate: input.eventDate,
    createdAt: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { error } = await supabase.from('events').insert([
        {
          id,
          slug,
          couple_names: newEvent.coupleNames,
          event_date: newEvent.eventDate,
        },
      ]);
      if (error) {
        // If slug conflict, throw to surface to UI
        if (error.message.includes('duplicate') || error.code === '23505') {
          throw new Error(`An event with slug "${slug}" already exists. Try a different name.`);
        }
        console.warn('Supabase createEvent failed, saving locally:', error);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('already exists')) throw err;
      console.warn('Supabase createEvent exception, using local fallback:', err);
    }
  }

  // Always persist locally as mirror
  if (typeof window !== 'undefined') {
    const existing = getLocalEvents();
    // Avoid duplicate
    if (!existing.find((e) => e.id === id)) {
      // If we had only default and now creating real events, keep default + new
      const updated = [...existing, newEvent];
      // If existing was empty (seeded default not persisted), include default
      if (updated.length === 1 && newEvent.id !== DEFAULT_EVENT.id) {
        updated.unshift(DEFAULT_EVENT);
      }
      saveLocalEvents(updated);
    }
  }

  return newEvent;
}

export async function fetchEventById(eventId: string): Promise<EventConfig | null> {
  const events = await fetchEvents();
  return events.find((e) => e.id === eventId || e.slug === eventId) || null;
}

// ----------------------------------------------------
// PROMPTS MANAGEMENT
// ----------------------------------------------------

export async function fetchPrompts(eventId: string): Promise<Prompt[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((p) => ({
          id: p.id,
          eventId: p.event_id,
          promptText: p.prompt_text,
          createdAt: p.created_at,
        }));
      }
    } catch (err) {
      console.warn('Error fetching prompts from Supabase, using local fallback:', err);
    }
  }

  // Local fallback
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(`${LOCAL_PROMPTS_KEY}_${eventId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  }

  // Initial default prompts list
  return DEFAULT_PROMPTS.map((text, idx) => ({
    id: `p_${idx}`,
    eventId,
    promptText: text,
  }));
}

export async function addPrompt(eventId: string, promptText: string): Promise<Prompt> {
  const newPrompt: Prompt = {
    id: `p_${Date.now()}`,
    eventId,
    promptText,
    createdAt: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .insert([{ event_id: eventId, prompt_text: promptText }])
        .select()
        .single();

      if (!error && data) {
        newPrompt.id = data.id;
      }
    } catch (err) {
      console.warn('Supabase add prompt failed, using local storage:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const existing = await fetchPrompts(eventId);
    const updated = [...existing, newPrompt];
    localStorage.setItem(`${LOCAL_PROMPTS_KEY}_${eventId}`, JSON.stringify(updated));
  }

  return newPrompt;
}

export async function deletePrompt(eventId: string, promptId: string): Promise<void> {
  if (supabase) {
    try {
      await supabase.from('prompts').delete().eq('id', promptId);
    } catch (err) {
      console.warn('Supabase delete prompt failed:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const existing = await fetchPrompts(eventId);
    const updated = existing.filter((p) => p.id !== promptId);
    localStorage.setItem(`${LOCAL_PROMPTS_KEY}_${eventId}`, JSON.stringify(updated));
  }
}

// ----------------------------------------------------
// RECORDINGS MANAGEMENT
// ----------------------------------------------------

function saveLocally(recording: Recording) {
  if (typeof window === 'undefined') return;
  const existingStr = localStorage.getItem(LOCAL_RECORDINGS_KEY);
  const existing: Recording[] = existingStr ? JSON.parse(existingStr) : [];
  existing.unshift(recording);
  localStorage.setItem(LOCAL_RECORDINGS_KEY, JSON.stringify(existing));
}

function getLocalRecordings(): Recording[] {
  if (typeof window === 'undefined') return [];
  const existingStr = localStorage.getItem(LOCAL_RECORDINGS_KEY);
  return existingStr ? JSON.parse(existingStr) : [];
}

export async function uploadRecording({
  eventId,
  audioBlob,
  photoDataUrl,
  promptUsed,
  guestName,
  duration,
}: {
  eventId: string;
  audioBlob: Blob;
  photoDataUrl?: string | null;
  promptUsed?: string;
  guestName?: string;
  duration: number;
}): Promise<Recording> {
  const recordingId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const createdAt = new Date().toISOString();

  let audioUrl = typeof URL !== 'undefined' ? URL.createObjectURL(audioBlob) : '';
  let photoUrl = photoDataUrl || undefined;

  if (supabase) {
    try {
      // 1. Upload Audio Blob
      const audioFileName = `${eventId}/${recordingId}.webm`;
      const { data: audioData, error: audioErr } = await supabase.storage
        .from('mixtape-recordings')
        .upload(audioFileName, audioBlob, {
          contentType: audioBlob.type || 'audio/webm',
          upsert: true,
        });

      if (!audioErr && audioData) {
        const { data: publicAudio } = supabase.storage
          .from('mixtape-recordings')
          .getPublicUrl(audioFileName);
        if (publicAudio?.publicUrl) {
          audioUrl = publicAudio.publicUrl;
        }
      }

      // 2. Upload Photo Blob
      if (photoDataUrl) {
        const photoFileName = `${eventId}/${recordingId}_photo.jpg`;
        const res = await fetch(photoDataUrl);
        const photoBlob = await res.blob();

        const { data: photoData, error: photoErr } = await supabase.storage
          .from('mixtape-recordings')
          .upload(photoFileName, photoBlob, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (!photoErr && photoData) {
          const { data: publicPhoto } = supabase.storage
            .from('mixtape-recordings')
            .getPublicUrl(photoFileName);
          if (publicPhoto?.publicUrl) {
            photoUrl = publicPhoto.publicUrl;
          }
        }
      }

      // 3. Insert Database Record
      const { error: dbErr } = await supabase.from('recordings').insert([
        {
          id: recordingId,
          event_id: eventId,
          audio_url: audioUrl,
          photo_url: photoUrl,
          prompt_used: promptUsed,
          guest_name: guestName,
          duration,
          created_at: createdAt,
        },
      ]);

      if (dbErr) {
        console.warn('Database insertion failed, saved locally:', dbErr);
      }
    } catch (err) {
      console.warn('Supabase upload failed, using local storage:', err);
    }
  }

  const recording: Recording = {
    id: recordingId,
    eventId,
    audioUrl,
    photoUrl,
    promptUsed,
    guestName,
    duration,
    createdAt,
  };

  saveLocally(recording);
  return recording;
}

export async function fetchRecordings(eventId: string): Promise<Recording[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          eventId: item.event_id,
          audioUrl: item.audio_url,
          photoUrl: item.photo_url,
          promptUsed: item.prompt_used,
          guestName: item.guest_name,
          duration: item.duration,
          createdAt: item.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch failed, returning local recordings:', err);
    }
  }

  const local = getLocalRecordings();
  return local.filter((r) => r.eventId === eventId || !r.eventId);
}
