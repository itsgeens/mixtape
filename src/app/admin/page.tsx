'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import Link from 'next/link';
import { Disc3, Heart, QrCode as QrIcon, Plus, Trash2, Download, RefreshCw, Volume2, Sparkles, Lock, LogOut } from 'lucide-react';
import { MasterTapePlayer } from '@/components/playback/MasterTapePlayer';
import { InteractiveTimeline } from '@/components/playback/InteractiveTimeline';
import { fetchRecordings, fetchPrompts, addPrompt, deletePrompt, DEFAULT_EVENT } from '@/lib/storage-service';
import { Recording, Prompt } from '@/types';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'mixtape2026';
const AUTH_STORAGE_KEY = 'mixtape_admin_auth';

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [newPromptText, setNewPromptText] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'tape' | 'prompts' | 'qrcode'>('tape');

  const eventId = DEFAULT_EVENT.id;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [recs, pList] = await Promise.all([
        fetchRecordings(eventId),
        fetchPrompts(eventId),
      ]);
      setRecordings(recs);
      setPrompts(pList);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check existing auth session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored === 'authenticated') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'authenticated');
      setAuthError('');
    } else {
      setAuthError('Incorrect password. Try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setPasswordInput('');
  };

  // Generate QR Code data URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const guestUrl = `${origin}/e/${eventId}`;
      QRCode.toDataURL(guestUrl, { width: 300, margin: 2, color: { dark: '#020617', light: '#ffffff' } })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [eventId]);

  const handleAddPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromptText.trim()) return;
    try {
      const created = await addPrompt(eventId, newPromptText.trim());
      setPrompts((prev) => [...prev, created]);
      setNewPromptText('');
    } catch (err) {
      console.error('Failed to add prompt:', err);
    }
  };

  const handleDeletePrompt = async (promptId: string) => {
    try {
      await deletePrompt(eventId, promptId);
      setPrompts((prev) => prev.filter((p) => p.id !== promptId));
    } catch (err) {
      console.error('Failed to delete prompt:', err);
    }
  };

  const totalSeconds = recordings.reduce((sum, r) => sum + (r.duration || 0), 0);
  const totalMinutes = Math.round(totalSeconds / 60);

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-8 px-4 max-w-md mx-auto w-full">
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-400 flex justify-center items-center mx-auto shadow-lg">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-black text-white">Admin Access</h1>
            <p className="text-xs text-slate-400">Enter the event password to view the mixtape.</p>
            <p className="text-[10px] font-mono text-amber-400/70">EVENT: {eventId}</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Password"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              autoFocus
            />
            {authError && <p className="text-xs text-rose-400 text-center">{authError}</p>}
            <button type="submit" className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all">
              Unlock Admin Panel
            </button>
          </form>
          <Link href={`/e/${eventId}`} className="block text-center text-xs text-slate-500 hover:text-slate-300">
            ← Back to Guest Page
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 max-w-5xl mx-auto w-full">
      {/* Admin Header */}
      <header className="flex justify-between items-center pb-6 border-b border-slate-800 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-400 flex justify-center items-center shadow-lg shadow-rose-950">
            <Disc3 className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
              Admin Panel • {DEFAULT_EVENT.coupleNames}
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 inline" />
            </h1>
            <p className="text-xs font-tech text-amber-400">
              EVENT CODE: {eventId} • {DEFAULT_EVENT.eventDate}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Link
            href={`/e/${eventId}`}
            className="text-xs bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-2 rounded-lg shadow-md transition-all flex items-center space-x-1"
          >
            <span>Guest Page →</span>
          </Link>
          <button
            onClick={loadData}
            className="bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 text-xs px-3 py-2 rounded-lg flex items-center space-x-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleLogout}
            className="bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-700 text-xs px-3 py-2 rounded-lg flex items-center space-x-1.5 transition-all"
            title="Lock admin panel"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lock</span>
          </button>
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('tape')}
          className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center space-x-2 transition-all ${
            activeTab === 'tape'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Mixtape Player ({recordings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('prompts')}
          className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center space-x-2 transition-all ${
            activeTab === 'prompts'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Prompts Manager ({prompts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('qrcode')}
          className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center space-x-2 transition-all ${
            activeTab === 'qrcode'
              ? 'bg-slate-700 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <QrIcon className="w-4 h-4" />
          <span>Event QR Code</span>
        </button>
      </div>

      {/* TAB 1: MASTER TAPE PLAYER */}
      {activeTab === 'tape' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Stats Header */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
              <span className="text-[10px] font-tech text-slate-400 uppercase tracking-widest block mb-1">
                GUEST RECORDINGS
              </span>
              <span className="text-2xl font-black text-rose-500 font-digital">
                {recordings.length}
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
              <span className="text-[10px] font-tech text-slate-400 uppercase tracking-widest block mb-1">
                TOTAL AUDIO TIME
              </span>
              <span className="text-2xl font-black text-amber-400 font-digital">
                {totalMinutes} MIN
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
              <span className="text-[10px] font-tech text-slate-400 uppercase tracking-widest block mb-1">
                MASTER FORMAT
              </span>
              <span className="text-xs font-bold text-emerald-400 font-tech mt-2 block">
                STEREO C-90
              </span>
            </div>
          </div>

          <MasterTapePlayer
            recordings={recordings}
            currentIndex={currentIndex}
            onIndexChange={setCurrentIndex}
          />

          <InteractiveTimeline
            recordings={recordings}
            currentIndex={currentIndex}
            onSelectRecording={setCurrentIndex}
          />
        </div>
      )}

      {/* TAB 2: PROMPTS MANAGER */}
      {activeTab === 'prompts' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <h3 className="text-sm font-extrabold text-white mb-1">
              Add New Inspiration Prompt for Guests
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Guests will see these skippable prompt cards during Step 2 of recording.
            </p>

            <form onSubmit={handleAddPrompt} className="flex gap-2">
              <input
                type="text"
                value={newPromptText}
                onChange={(e) => setNewPromptText(e.target.value)}
                placeholder="e.g. What is your favorite memory with the couple?"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-1 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Prompt</span>
              </button>
            </form>
          </div>

          {/* Prompts List */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Active Prompts ({prompts.length})
            </h3>

            <div className="space-y-2">
              {prompts.map((p, idx) => (
                <div
                  key={p.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 font-bold text-xs flex justify-center items-center">
                      {idx + 1}
                    </span>
                    <p className="text-xs font-medium text-slate-200">
                      &ldquo;{p.promptText}&rdquo;
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeletePrompt(p.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QR CODE GENERATOR */}
      {activeTab === 'qrcode' && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white">
              Event QR Code Generator
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Print this QR code on reception tables (styled as cassette J-cards or tickets) so guests can scan and leave instant voice notes.
            </p>
          </div>

          {qrDataUrl && (
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-2xl shadow-2xl border-4 border-amber-500/40">
                {/* eslint-disable-next-html-element-suppression */}
                <img
                  src={qrDataUrl}
                  alt="Event Guest QR Code"
                  className="w-56 h-56"
                />
              </div>

              <div className="mt-4 flex space-x-3">
                <a
                  href={qrDataUrl}
                  download={`mixtape_qrcode_${eventId}.png`}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center space-x-1.5 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download QR Image</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
