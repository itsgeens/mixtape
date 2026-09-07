'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import Link from 'next/link';
import { Disc3, Heart, QrCode as QrIcon, Plus, Trash2, Download, RefreshCw, Volume2, Sparkles, Lock, LogOut, Calendar, Users, ExternalLink, PartyPopper } from 'lucide-react';
import { MasterTapePlayer } from '@/components/playback/MasterTapePlayer';
import { InteractiveTimeline } from '@/components/playback/InteractiveTimeline';
import { fetchRecordings, fetchPrompts, addPrompt, deletePrompt, fetchEvents, createEvent, slugify } from '@/lib/storage-service';
import { Recording, Prompt, EventConfig } from '@/types';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'mixtape2026';
const AUTH_STORAGE_KEY = 'mixtape_admin_auth';

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Events state
  const [events, setEvents] = useState<EventConfig[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(true);

  // Per-event data
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [newPromptText, setNewPromptText] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'events' | 'tape' | 'prompts' | 'qrcode'>('events');

  // Create event form
  const [newCoupleNames, setNewCoupleNames] = useState<string>('');
  const [newEventDate, setNewEventDate] = useState<string>('');
  const [newSlugPreview, setNewSlugPreview] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string>('');

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null;
  const eventId = selectedEvent?.id || selectedEventId || '';

  // Auth check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored === 'authenticated') setIsAuthenticated(true);
    }
  }, []);

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

  // Load events on auth
  const loadEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const evts = await fetchEvents();
      setEvents(evts);
      if (evts.length > 0 && !selectedEventId) {
        setSelectedEventId(evts[0].id);
      }
    } catch (err) {
      console.error('loadEvents error', err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) loadEvents();
  }, [isAuthenticated]);

  // Load per-event data when selected event or tab changes
  const loadData = async () => {
    if (!eventId) return;
    setIsLoading(true);
    try {
      const [recs, pList] = await Promise.all([fetchRecordings(eventId), fetchPrompts(eventId)]);
      setRecordings(recs);
      setPrompts(pList);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && eventId) loadData();
  }, [isAuthenticated, eventId]);

  // Update slug preview
  useEffect(() => {
    setNewSlugPreview(slugify(newCoupleNames));
  }, [newCoupleNames]);

  // QR generation per selected event - uses production URL to avoid Vercel preview SSO login
  const [guestUrl, setGuestUrl] = useState<string>('');
  useEffect(() => {
    if (!eventId || typeof window === 'undefined') return;
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
    const origin = siteUrl || window.location.origin;
    const url = `${origin}/e/${eventId}`;
    setGuestUrl(url);
    QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#020617', light: '#ffffff' } })
      .then((u) => setQrDataUrl(u))
      .catch((err) => console.error('QR code generation error:', err));
  }, [eventId]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupleNames.trim() || !newEventDate) return;
    setIsCreating(true);
    setCreateError('');
    try {
      const created = await createEvent({ coupleNames: newCoupleNames.trim(), eventDate: newEventDate });
      setEvents((prev) => [...prev, created]);
      setSelectedEventId(created.id);
      setNewCoupleNames('');
      setNewEventDate('');
      setActiveTab('qrcode');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create event';
      setCreateError(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromptText.trim() || !eventId) return;
    try {
      const created = await addPrompt(eventId, newPromptText.trim());
      setPrompts((prev) => [...prev, created]);
      setNewPromptText('');
    } catch (err) {
      console.error('Failed to add prompt:', err);
    }
  };

  const handleDeletePrompt = async (promptId: string) => {
    if (!eventId) return;
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
            <p className="text-xs text-slate-400">Enter the admin password to manage all mixtapes.</p>
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
          <Link href="/" className="block text-center text-xs text-slate-500 hover:text-slate-300">← Back to Guest Page</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 max-w-6xl mx-auto w-full">
      {/* Admin Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-6 border-b border-slate-800 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-400 flex justify-center items-center shadow-lg shadow-rose-950">
            <Disc3 className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
              Admin Panel — Mixtape Central <Heart className="w-4 h-4 text-rose-500 fill-rose-500 inline" />
            </h1>
            <p className="text-xs font-mono text-amber-400">{events.length} event{events.length !== 1 ? 's' : ''} • Select an event to manage its mixtape</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {selectedEvent && (
            <Link
              href={`/e/${selectedEvent.id}`}
              className="text-xs bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-2 rounded-lg shadow-md transition-all flex items-center space-x-1"
            >
              <span>Guest Page →</span>
            </Link>
          )}
          <button onClick={loadEvents} className="bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 text-xs px-3 py-2 rounded-lg flex items-center space-x-1.5 transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEvents ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button onClick={handleLogout} className="bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-700 text-xs px-3 py-2 rounded-lg flex items-center space-x-1.5 transition-all" title="Lock admin panel">
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lock</span>
          </button>
        </div>
      </header>

      {/* Event Selector Bar */}
      {events.length > 0 && (
        <div className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Active Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 max-w-[240px]"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.coupleNames} — {ev.eventDate} ({ev.slug})
                </option>
              ))}
            </select>
          </div>
          {selectedEvent && (
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">{selectedEvent.slug}</span>
              <a href={`/e/${selectedEvent.id}`} target="_blank" className="flex items-center gap-1 text-amber-400 hover:text-amber-300">
                <ExternalLink className="w-3 h-3" /> Open Guest Link
              </a>
            </div>
          )}
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center space-x-2 transition-all ${activeTab === 'events' ? 'bg-slate-700 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
        >
          <PartyPopper className="w-4 h-4" />
          <span>All Events ({events.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('tape')}
          className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center space-x-2 transition-all ${activeTab === 'tape' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Mixtape ({recordings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('prompts')}
          className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center space-x-2 transition-all ${activeTab === 'prompts' ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Prompts ({prompts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('qrcode')}
          className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center space-x-2 transition-all ${activeTab === 'qrcode' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
        >
          <QrIcon className="w-4 h-4" />
          <span>QR Code</span>
        </button>
      </div>

      {/* TAB: ALL EVENTS */}
      {activeTab === 'events' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Create Event Card */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <h3 className="text-sm font-extrabold text-white mb-1 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" /> Create New Event
            </h3>
            <p className="text-xs text-slate-400 mb-4">Add a new wedding/party. Guests will use the generated slug as the QR link <span className="font-mono text-amber-400">/e/[slug]</span>.</p>
            <form onSubmit={handleCreateEvent} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block mb-1">Couple Names</label>
                <input
                  type="text"
                  value={newCoupleNames}
                  onChange={(e) => setNewCoupleNames(e.target.value)}
                  placeholder="Sarah & John"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  required
                />
                {newSlugPreview && <p className="text-[10px] font-mono text-slate-500 mt-1">Slug: {newSlugPreview}</p>}
              </div>
              <div>
                <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block mb-1">Event Date</label>
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div className="flex items-end">
                <button type="submit" disabled={isCreating} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl flex justify-center items-center space-x-1 transition-all disabled:opacity-50">
                  <Plus className="w-4 h-4" />
                  <span>{isCreating ? 'Creating…' : 'Create Event'}</span>
                </button>
              </div>
            </form>
            {createError && <p className="text-xs text-rose-400 mt-2">{createError}</p>}
          </div>

          {/* Events Grid */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-400" /> All Events
            </h3>
            {isLoadingEvents ? (
              <p className="text-xs text-slate-500">Loading events…</p>
            ) : events.length === 0 ? (
              <p className="text-xs text-slate-500">No events yet. Create your first above.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {events.map((ev) => {
                  const isSelected = ev.id === selectedEventId;
                  return (
                    <div
                      key={ev.id}
                      onClick={() => {
                        setSelectedEventId(ev.id);
                        setActiveTab('tape');
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-rose-950/30 border-rose-500/60 shadow-md' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold text-white flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> {ev.coupleNames}
                          </p>
                          <p className="text-xs font-mono text-amber-400 mt-0.5">{ev.slug}</p>
                          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {ev.eventDate}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${isSelected ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'}`}>{isSelected ? 'SELECTED' : 'VIEW'}</span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Link href={`/e/${ev.id}`} onClick={(e) => e.stopPropagation()} className="text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 px-2 py-1 rounded border border-slate-700">Guest Link →</Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEventId(ev.id);
                            setActiveTab('qrcode');
                          }}
                          className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700"
                        >
                          QR Code
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: MASTER TAPE PLAYER */}
      {activeTab === 'tape' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {!selectedEvent ? (
            <p className="text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">No event selected. Go to All Events to create or select one.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Guest Recordings</span>
                  <span className="text-2xl font-black text-rose-500 font-mono">{recordings.length}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Total Audio Time</span>
                  <span className="text-2xl font-black text-amber-400 font-mono">{totalMinutes} MIN</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Event</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono mt-2 block truncate">{selectedEvent.coupleNames}</span>
                </div>
              </div>
              <MasterTapePlayer recordings={recordings} currentIndex={currentIndex} onIndexChange={setCurrentIndex} />
              <InteractiveTimeline recordings={recordings} currentIndex={currentIndex} onSelectRecording={setCurrentIndex} />
            </>
          )}
        </div>
      )}

      {/* TAB 2: PROMPTS MANAGER */}
      {activeTab === 'prompts' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {!selectedEvent ? (
            <p className="text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">Select an event first.</p>
          ) : (
            <>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <h3 className="text-sm font-extrabold text-white mb-1">Prompts for {selectedEvent.coupleNames}</h3>
                <p className="text-xs text-slate-400 mb-4">Guests will see these skippable prompt cards during Step 2. Managed per-event.</p>
                <form onSubmit={handleAddPrompt} className="flex gap-2">
                  <input
                    type="text"
                    value={newPromptText}
                    onChange={(e) => setNewPromptText(e.target.value)}
                    placeholder="e.g. What is your favorite memory with the couple?"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-1 transition-all">
                    <Plus className="w-4 h-4" />
                    <span>Add Prompt</span>
                  </button>
                </form>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Active Prompts ({prompts.length})</h3>
                <div className="space-y-2">
                  {prompts.map((p, idx) => (
                    <div key={p.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 font-bold text-xs flex justify-center items-center">{idx + 1}</span>
                        <p className="text-xs font-medium text-slate-200">&ldquo;{p.promptText}&rdquo;</p>
                      </div>
                      <button onClick={() => handleDeletePrompt(p.id)} className="p-2 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {prompts.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No custom prompts yet. Guests will see the default set.</p>}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: QR CODE GENERATOR */}
      {activeTab === 'qrcode' && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-6 animate-in fade-in duration-300">
          {!selectedEvent ? (
            <p className="text-xs text-slate-500">Select an event to generate its QR.</p>
          ) : (
            <>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">QR for {selectedEvent.coupleNames}</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">Print this for reception tables. Guests scan to open <span className="font-mono text-amber-400">/e/{selectedEvent.id}</span></p>
                <p className="text-[11px] font-mono text-slate-500 break-all">{guestUrl}</p>
                {guestUrl.includes('vercel.app') && guestUrl.includes('-') && guestUrl.match(/vercel\.app\/e\//) && guestUrl.includes('gino-tantuico') && (
                  <p className="text-[11px] text-amber-400 bg-amber-950/30 border border-amber-500/30 rounded-lg px-3 py-2 mt-2 max-w-md mx-auto">
                    ⚠️ This is a preview URL requiring Vercel login. Set <span className="font-mono">NEXT_PUBLIC_SITE_URL</span> to your production domain (e.g. https://mixtape.vercel.app) in Vercel → Settings → Environment Variables and redeploy to generate public QR codes.
                  </p>
                )}
              </div>
              {qrDataUrl && (
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-2xl shadow-2xl border-4 border-amber-500/40">
                    <img src={qrDataUrl} alt="Event Guest QR Code" className="w-56 h-56" />
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center gap-3">
                    <a href={qrDataUrl} download={`mixtape_qrcode_${selectedEvent.id}.png`} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center space-x-1.5 transition-all">
                      <Download className="w-4 h-4" />
                      <span>Download QR Image</span>
                    </a>
                    <Link href={`/e/${selectedEvent.id}`} className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-1.5 transition-all">
                      <ExternalLink className="w-4 h-4" />
                      <span>Open Guest Page</span>
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
}
