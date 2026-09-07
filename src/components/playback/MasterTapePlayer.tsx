'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Download, Volume2, Sparkles, User, RefreshCcw } from 'lucide-react';
import { Recording } from '@/types';
import { SpinningReels } from '../cassette/SpinningReels';
import { VUMeter } from '../cassette/VUMeter';
import { sfxEngine } from '@/lib/audio-sfx';

interface MasterTapePlayerProps {
  recordings: Recording[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export const MasterTapePlayer: React.FC<MasterTapePlayerProps> = ({
  recordings,
  currentIndex,
  onIndexChange,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [visualizerLevels, setVisualizerLevels] = useState({ leftLevel: 0, rightLevel: 0, peakLevel: 0 });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentRecording = recordings[currentIndex];

  // Visualizer simulation during playback
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        const left = Math.min(100, Math.max(15, Math.floor(Math.random() * 70 + 20)));
        const right = Math.min(100, Math.max(15, Math.floor(Math.random() * 70 + 20)));
        setVisualizerLevels({ leftLevel: left, rightLevel: right, peakLevel: Math.max(left, right) });
      }, 100);
    } else {
      setVisualizerLevels({ leftLevel: 0, rightLevel: 0, peakLevel: 0 });
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  const handlePlayPause = () => {
    sfxEngine.playButtonClick();
    if (!audioRef.current || !currentRecording) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      sfxEngine.playTapeClick();
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.warn('Autoplay error:', err));
    }
  };

  const handleNextTrack = () => {
    if (recordings.length === 0) return;
    sfxEngine.playButtonClick();
    sfxEngine.playTapeRewind(400);

    const nextIndex = (currentIndex + 1) % recordings.length;
    onIndexChange(nextIndex);
  };

  const handlePrevTrack = () => {
    if (recordings.length === 0) return;
    sfxEngine.playButtonClick();
    sfxEngine.playTapeRewind(400);

    const prevIndex = (currentIndex - 1 + recordings.length) % recordings.length;
    onIndexChange(prevIndex);
  };

  // Continuous Auto-Advance between recordings
  const handleTrackEnded = () => {
    sfxEngine.playTapeClick();
    if (currentIndex < recordings.length - 1) {
      sfxEngine.playTapeRewind(500);
      setTimeout(() => {
        onIndexChange(currentIndex + 1);
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
      }, 600);
    } else if (isLooping) {
      sfxEngine.playTapeRewind(800);
      setTimeout(() => {
        onIndexChange(0);
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
      }, 900);
    } else {
      setIsPlaying(false);
    }
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full cassette-metal-dark rounded-2xl p-5 border-4 border-slate-700 shadow-2xl relative">
      {/* Master Tape Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-rose-500 animate-pulse" />
          <span className="text-xs font-tech tracking-widest text-slate-300 uppercase">
            MASTER TAPE CONTINUOUS PLAYBACK • TRACK {currentIndex + 1} OF {recordings.length || 1}
          </span>
        </div>
        <button
          onClick={() => setIsLooping(!isLooping)}
          className={`text-[10px] font-bold px-2 py-1 rounded flex items-center space-x-1 border ${
            isLooping
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          <RefreshCcw className="w-3 h-3" />
          <span>{isLooping ? 'LOOP MODE ON' : 'LOOP OFF'}</span>
        </button>
      </div>

      {/* Main Deck Container with Polaroid Frame & Spinning Reels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Left 2 Cols: Spinning Reels Deck */}
        <div className="md:col-span-2 space-y-3">
          <SpinningReels
            state={isPlaying ? 'playing' : 'idle'}
            progressPercent={duration ? (currentTime / duration) * 100 : 0}
          />
          <VUMeter levels={visualizerLevels} isActive={isPlaying} />
        </div>

        {/* Right 1 Col: Polaroid Selfie Display */}
        <div className="flex flex-col justify-center items-center bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          {currentRecording?.photoUrl ? (
            <div className="w-full max-w-[200px] bg-stone-100 p-2.5 rounded shadow-xl border border-stone-300 transform rotate-1 hover:rotate-0 transition-transform">
              <div className="w-full h-44 bg-slate-900 rounded overflow-hidden shadow-inner">
                {/* eslint-disable-next-html-element-suppression */}
                <img
                  src={currentRecording.photoUrl}
                  alt="Guest Polaroid"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-2 text-center">
                <span className="text-xs font-bold text-slate-900 font-sans truncate block">
                  {currentRecording.guestName || 'Wedding Guest'}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full h-48 rounded-lg border-2 border-dashed border-slate-800 bg-slate-900/50 flex flex-col justify-center items-center text-center p-3">
              <User className="w-10 h-10 text-slate-700 mb-2" />
              <span className="text-xs text-slate-400 font-medium">
                {currentRecording?.guestName || 'Audio Voice Note'}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">No Polaroid Selfie Attached</span>
            </div>
          )}

          {/* Prompt metadata badge */}
          {currentRecording?.promptUsed && (
            <div className="mt-3 w-full bg-amber-500/10 border border-amber-500/30 rounded p-2 text-center">
              <span className="text-[10px] font-tech text-amber-400 uppercase tracking-widest block mb-0.5">
                PROMPT ANSWERED
              </span>
              <p className="text-xs text-amber-200 italic line-clamp-2">
                &ldquo;{currentRecording.promptUsed}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar & Counter */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 mb-4 space-y-2">
        <div className="flex justify-between items-center text-xs font-digital text-rose-500 tracking-widest">
          <span>{formatSecs(currentTime)}</span>
          <span className="text-slate-400 font-tech text-[10px]">
            {currentRecording?.guestName ? `MEMBER: ${currentRecording.guestName.toUpperCase()}` : 'TRACK PLAYBACK'}
          </span>
          <span>{formatSecs(duration)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={(e) => {
            const time = Number(e.target.value);
            setCurrentTime(time);
            if (audioRef.current) audioRef.current.currentTime = time;
          }}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
        />
      </div>

      {/* Player Controls */}
      <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div className="flex space-x-2">
          <button
            onClick={handlePrevTrack}
            disabled={recordings.length <= 1}
            className="tactile-btn p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={handlePlayPause}
            disabled={!currentRecording}
            className="tactile-btn px-6 py-2.5 rounded-lg bg-gradient-to-b from-rose-500 to-rose-700 hover:from-rose-400 hover:to-rose-600 text-white font-bold flex items-center space-x-2 shadow-lg shadow-rose-950 disabled:opacity-40"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            <span className="text-xs tracking-wider">{isPlaying ? 'PAUSE TAPE' : 'PLAY TAPE'}</span>
          </button>
          <button
            onClick={handleNextTrack}
            disabled={recordings.length <= 1}
            className="tactile-btn p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Download Clip Button */}
        {currentRecording?.audioUrl && (
          <a
            href={currentRecording.audioUrl}
            download={`mixtape_${currentRecording.guestName || 'note'}_${currentIndex + 1}.webm`}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-3 py-2 rounded-lg flex items-center space-x-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Save MP3</span>
          </a>
        )}
      </div>

      {/* Hidden Audio Element */}
      {currentRecording?.audioUrl && (
        <audio
          ref={audioRef}
          src={currentRecording.audioUrl}
          onTimeUpdate={() => {
            if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) setDuration(audioRef.current.duration);
          }}
          onEnded={handleTrackEnded}
          className="hidden"
        />
      )}
    </div>
  );
};
