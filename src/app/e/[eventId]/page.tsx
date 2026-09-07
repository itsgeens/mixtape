'use client';

import React, { useState, useEffect, use } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Disc3, Heart, CheckCircle2, ArrowRight, UserCheck, ShieldCheck, RefreshCw } from 'lucide-react';
import { CassetteDeck } from '@/components/cassette/CassetteDeck';
import { PolaroidCapture } from '@/components/polaroid/PolaroidCapture';
import { uploadRecording, fetchPrompts, fetchEventById, DEFAULT_EVENT } from '@/lib/storage-service';
import { Prompt, EventConfig } from '@/types';
import { sfxEngine } from '@/lib/audio-sfx';
import Link from 'next/link';

interface DynamicEventPageProps {
  params: Promise<{ eventId: string }>;
}

export default function DynamicEventGuestPage({ params }: DynamicEventPageProps) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId || DEFAULT_EVENT.id;

  const [guestName, setGuestName] = useState<string>('');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [promptIndex, setPromptIndex] = useState<number>(0);
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);

  useEffect(() => {
    fetchEventById(eventId).then((ev) => {
      if (ev) setEventConfig(ev);
    });
    fetchPrompts(eventId).then((pList) => {
      setPrompts(pList);
      if (pList.length > 0) {
        setSelectedPrompt(pList[0].promptText);
      }
    });
  }, [eventId]);

  const handleStep1NameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleShufflePrompt = () => {
    sfxEngine.playButtonClick();
    if (prompts.length === 0) return;
    const nextIdx = (promptIndex + 1) % prompts.length;
    setPromptIndex(nextIdx);
    setSelectedPrompt(prompts[nextIdx].promptText);
  };

  const handleAudioSubmitted = (blob: Blob, duration: number) => {
    setAudioBlob(blob);
    setRecordingDuration(duration);
    setStep(4);
  };

  const handleFinalSubmit = async () => {
    if (!audioBlob) return;
    setIsSubmitting(true);

    try {
      await uploadRecording({
        eventId,
        audioBlob,
        photoDataUrl,
        promptUsed: selectedPrompt || undefined,
        guestName: guestName.trim() || undefined,
        duration: recordingDuration,
      });

      setStep(5);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#f59e0b', '#10b981', '#6366f1'],
      });
    } catch (err) {
      console.error('Submission error:', err);
      setStep(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFlow = () => {
    setAudioBlob(null);
    setPhotoDataUrl(null);
    setRecordingDuration(0);
    setStep(1);
  };

  const activePromptText = prompts[promptIndex]?.promptText || 'Share a favorite memory with the couple!';

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between py-6 px-4 sm:px-6 max-w-xl mx-auto w-full font-sans">
      <header className="flex justify-between items-center pb-4 border-b border-stone-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-stone-800 border border-stone-700 flex justify-center items-center shadow-lg">
            <Disc3 className="w-5 h-5 text-amber-200 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold tracking-tight text-stone-100 flex items-center gap-2">
              Mixtape Memories
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 inline" />
            </h1>
            <p className="text-[11px] font-serif tracking-widest text-amber-200 uppercase">
              {(eventConfig?.coupleNames || DEFAULT_EVENT.coupleNames).toUpperCase()}&apos;S WEDDING
            </p>
          </div>
        </div>
        <Link
          href="/admin"
          className="text-xs bg-stone-900 hover:bg-stone-800 text-stone-400 px-3 py-1.5 rounded-xl border border-stone-800 transition-all"
        >
          Admin
        </Link>
      </header>

      <div className="my-5 grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={`h-1 rounded-full transition-all duration-300 ${
              step >= n ? 'bg-amber-200' : 'bg-stone-800'
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="my-auto space-y-6 bg-stone-900 border border-stone-800 p-7 rounded-3xl shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-stone-800 text-amber-200 border border-stone-700 flex justify-center items-center mx-auto">
              <UserCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-100">Welcome</h2>
            <p className="text-sm text-stone-400 font-sans leading-relaxed">
              Enter your name so the couple knows who left this message.
            </p>
          </div>
          <form onSubmit={handleStep1NameSubmit} className="space-y-4">
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-3.5 text-sm text-stone-100 focus:outline-none focus:border-amber-400 font-sans"
              required
            />
            <button
              type="submit"
              className="w-full py-3.5 bg-stone-100 hover:bg-white text-stone-950 font-bold text-sm rounded-xl shadow-lg transition-all active:scale-[0.98]"
            >
              Continue
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="my-auto space-y-5">
          <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl shadow-xl text-center space-y-4">
            <p className="text-xs text-stone-400 font-sans uppercase tracking-widest">
              What would you like to talk about?
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={promptIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="text-lg font-serif italic text-stone-100 leading-relaxed px-2"
              >
                &ldquo;{activePromptText}&rdquo;
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleShufflePrompt}
              className="w-1/3 py-3.5 bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-bold rounded-xl border border-stone-800 flex items-center justify-center space-x-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="w-2/3 py-3.5 bg-stone-100 hover:bg-white text-stone-950 font-bold text-sm rounded-xl shadow-lg flex justify-center items-center space-x-1.5 transition-all"
            >
              <span>Record Audio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="my-auto space-y-4">
          <div className="flex justify-between items-center bg-stone-900 border border-stone-800 p-3 rounded-2xl">
            <div className="text-xs text-stone-400">
              Recording as <strong className="text-stone-100">{guestName}</strong>
            </div>
            <button
              onClick={() => setStep(2)}
              className="text-xs text-amber-200 hover:underline"
            >
              Change Prompt
            </button>
          </div>
          <CassetteDeck
            onAudioSubmitted={handleAudioSubmitted}
            selectedPrompt={selectedPrompt}
            guestName={guestName}
          />
        </div>
      )}

      {step === 4 && (
        <div className="my-auto space-y-5">
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl text-center space-y-1">
            <p className="text-xs font-serif text-amber-200 tracking-widest uppercase">OPTIONAL</p>
            <h2 className="text-lg font-serif font-bold text-stone-100">Attach a Photo</h2>
            <p className="text-xs text-stone-400 font-sans">
              This will appear on the couple&apos;s tape player while your clip plays.
            </p>
          </div>
          <PolaroidCapture
            onPhotoCaptured={setPhotoDataUrl}
            guestName={guestName}
            onGuestNameChange={setGuestName}
          />
          <button
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-xl flex justify-center items-center space-x-2 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Saving…</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Save to Master Tape</span>
              </>
            )}
          </button>
        </div>
      )}

      {step === 5 && (
        <div className="my-auto bg-stone-900 border border-stone-800 p-8 rounded-3xl text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex justify-center items-center mx-auto border border-emerald-500/40">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-stone-100">Saved!</h2>
            <p className="text-sm text-stone-400 leading-relaxed max-w-sm mx-auto">
              Your voice note from <strong className="text-amber-200">{guestName}</strong> is now on the mixtape.
            </p>
          </div>
          <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={resetFlow}
              className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs px-5 py-3 rounded-xl border border-stone-700 transition-all"
            >
              Record Another 🎙️
            </button>
            <Link
              href="/admin"
              className="bg-stone-100 hover:bg-white text-stone-950 font-bold text-xs px-5 py-3 rounded-xl shadow-lg transition-all flex justify-center items-center space-x-1.5"
            >
              <span>View Admin Tape</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      <footer className="text-center pt-4 border-t border-stone-800 text-[11px] font-serif text-stone-600 tracking-widest uppercase">
        Mixtape Memories
      </footer>
    </main>
  );
}
