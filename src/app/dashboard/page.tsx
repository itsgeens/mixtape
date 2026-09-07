'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Disc3, Heart, ArrowLeft, Download, QrCode, RefreshCw, Lock, LogOut } from 'lucide-react';
import { MasterTapePlayer } from '@/components/playback/MasterTapePlayer';
import { InteractiveTimeline } from '@/components/playback/InteractiveTimeline';
import { fetchRecordings } from '@/lib/storage-service';
import { Recording } from '@/types';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'mixtape2026';
const AUTH_STORAGE_KEY = 'mixtape_admin_auth';

export default function MasterTapeDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const eventId = 'sarah-john-2026';

  const loadRecordingsData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchRecordings(eventId);
      setRecordings(data);
    } catch (err) {
      console.error('Failed to load recordings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem(AUTH_STORAGE_KEY) === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadRecordingsData();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'authenticated');
      setAuthError('');
    } else {
      setAuthError('Incorrect password.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setPasswordInput('');
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
            <p className="text-xs text-slate-400">Enter password to view dashboard.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Password" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500" autoFocus />
            {authError && <p className="text-xs text-rose-400 text-center">{authError}</p>}
            <button type="submit" className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all">Unlock Dashboard</button>
          </form>
          <Link href="/" className="block text-center text-xs text-slate-500 hover:text-slate-300">← Back to Home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 max-w-4xl mx-auto w-full">
      {/* Navigation Header */}
      <header className="flex justify-between items-center pb-6 border-b border-slate-800 mb-6">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-400 flex justify-center items-center shadow-lg shadow-rose-950">
              <Disc3 className="w-6 h-6 text-white animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Master Tape Dashboard
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500 inline" />
              </h1>
              <p className="text-xs font-tech text-amber-400">
                SARAH & JOHN&apos;S WEDDING MIXTAPE ARCHIVE
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={loadRecordingsData}
            className="bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 text-xs px-3 py-2 rounded-lg flex items-center space-x-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Tape</span>
          </button>
          <button onClick={handleLogout} className="bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-700 text-xs px-3 py-2 rounded-lg flex items-center space-x-1.5 transition-all">
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lock</span>
          </button>
        </div>
      </header>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
          <span className="text-[10px] font-tech text-slate-400 uppercase tracking-widest block mb-1">
            GUEST MESSAGES
          </span>
          <span className="text-2xl font-black text-rose-500 font-digital">
            {recordings.length}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
          <span className="text-[10px] font-tech text-slate-400 uppercase tracking-widest block mb-1">
            TOTAL DURATION
          </span>
          <span className="text-2xl font-black text-amber-400 font-digital">
            {totalMinutes} MIN
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
          <span className="text-[10px] font-tech text-slate-400 uppercase tracking-widest block mb-1">
            TAPE FORMAT
          </span>
          <span className="text-xs font-bold text-emerald-400 font-tech mt-2 block">
            STEREO C-90
          </span>
        </div>
      </div>

      {/* Main Continuous Master Tape Player */}
      <div className="space-y-6">
        <MasterTapePlayer
          recordings={recordings}
          currentIndex={currentIndex}
          onIndexChange={setCurrentIndex}
        />

        {/* Interactive Event Timeline */}
        <InteractiveTimeline
          recordings={recordings}
          currentIndex={currentIndex}
          onSelectRecording={setCurrentIndex}
        />

        {/* Print Table QR J-Card Banner */}
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white rounded-xl p-2 flex justify-center items-center shadow-lg">
              <QrCode className="w-10 h-10 text-slate-950" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                Reception Table QR J-Cards
              </h3>
              <p className="text-xs text-slate-300">
                Place vintage cassette J-card QR codes on reception tables so guests scan & record voice messages instantly.
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="whitespace-nowrap bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all"
          >
            Launch Guest Deck Page
          </Link>
        </div>
      </div>
    </main>
  );
}
