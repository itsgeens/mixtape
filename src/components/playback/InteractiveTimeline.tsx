'use client';

import React from 'react';
import { Recording } from '@/types';
import { Clock, Volume2, User, Sparkles } from 'lucide-react';

interface InteractiveTimelineProps {
  recordings: Recording[];
  currentIndex: number;
  onSelectRecording: (index: number) => void;
}

export const InteractiveTimeline: React.FC<InteractiveTimelineProps> = ({
  recordings,
  currentIndex,
  onSelectRecording,
}) => {
  if (recordings.length === 0) {
    return (
      <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400">
        <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm">No audio guestbook recordings yet.</p>
        <p className="text-xs text-slate-500 mt-1">Scan the QR code to leave the very first message!</p>
      </div>
    );
  }

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Event Timeline • {recordings.length} Messages
          </h3>
        </div>
        <span className="text-[10px] font-tech text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          Chronological Order
        </span>
      </div>

      {/* Visual Timeline Bar */}
      <div className="relative py-4 px-2">
        {/* Horizontal Connector Line */}
        <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-800 -translate-y-1/2 rounded" />

        {/* Recording Node Buttons */}
        <div className="relative flex justify-between items-center overflow-x-auto py-2 space-x-4 no-scrollbar">
          {recordings.map((rec, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={rec.id || idx}
                onClick={() => onSelectRecording(idx)}
                className="flex flex-col items-center flex-shrink-0 group focus:outline-none"
              >
                <div
                  className={`w-8 h-8 rounded-full flex justify-center items-center font-bold text-xs transition-all duration-300 z-10 ${
                    isActive
                      ? 'bg-rose-500 text-white scale-125 shadow-lg shadow-rose-500/50 ring-4 ring-rose-500/20'
                      : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:scale-110'
                  }`}
                >
                  {isActive ? <Volume2 className="w-4 h-4 animate-pulse" /> : idx + 1}
                </div>
                <span
                  className={`text-[10px] font-tech mt-2 font-medium transition-colors ${
                    isActive ? 'text-rose-400 font-bold' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                >
                  {formatTime(rec.createdAt)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Playlist Item Details Grid */}
      <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-1">
        {recordings.map((rec, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={rec.id || idx}
              onClick={() => onSelectRecording(idx)}
              className={`p-3 rounded-lg border transition-all cursor-pointer flex justify-between items-center ${
                isActive
                  ? 'bg-gradient-to-r from-rose-950/40 to-slate-900 border-rose-500/60 shadow-md'
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <div className={`w-7 h-7 rounded-full flex justify-center items-center text-xs font-bold ${isActive ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {idx + 1}
                </div>
                <div className="truncate">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {rec.guestName || 'Anonymous Guest'}
                    </span>
                    <span className="text-[10px] font-tech text-slate-500">
                      {formatTime(rec.createdAt)}
                    </span>
                  </div>
                  {rec.promptUsed && (
                    <div className="text-[11px] text-amber-400/90 truncate flex items-center gap-1 mt-0.5">
                      <Sparkles className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">&ldquo;{rec.promptUsed}&rdquo;</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-xs font-digital text-slate-400">
                  {rec.duration || 0}s
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
