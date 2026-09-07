'use client';

import React, { useState } from 'react';
import { Square, Play, Pause, ArrowRight, Volume2 } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { SpinningReels } from './SpinningReels';
import { sfxEngine } from '@/lib/audio-sfx';

interface CassetteDeckProps {
  onAudioSubmitted: (audioBlob: Blob, duration: number) => void;
  selectedPrompt?: string;
  guestName?: string;
  coupleNames?: string;
  stickerStage?: 'typing' | 'prompt' | 'recording' | 'photo' | 'stuck';
}

export const CassetteDeck: React.FC<CassetteDeckProps> = ({
  onAudioSubmitted,
  selectedPrompt,
  guestName,
  coupleNames,
  stickerStage = 'recording',
}) => {
  const {
    recordingState,
    recordingTime,
    audioBlob,
    audioUrl,
    audioLevels,
    permissionError,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const [isPlayingReview, setIsPlayingReview] = useState<boolean>(false);
  const audioReviewRef = React.useRef<HTMLAudioElement | null>(null);

  const handleRecClick = () => {
    sfxEngine.playButtonClick(true);
    if (isPlayingReview && audioReviewRef.current) {
      audioReviewRef.current.pause();
      setIsPlayingReview(false);
    }
    startRecording();
  };

  const handleStopClick = () => {
    sfxEngine.playButtonClick();
    if (recordingState === 'recording') {
      stopRecording();
    } else if (isPlayingReview && audioReviewRef.current) {
      audioReviewRef.current.pause();
      audioReviewRef.current.currentTime = 0;
      setIsPlayingReview(false);
    } else {
      resetRecording();
    }
  };

  const handlePlayReview = () => {
    sfxEngine.playButtonClick();
    if (!audioUrl) return;
    if (audioReviewRef.current) {
      if (isPlayingReview) {
        audioReviewRef.current.pause();
        setIsPlayingReview(false);
      } else {
        audioReviewRef.current.play();
        setIsPlayingReview(true);
      }
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-5">
      {/* Permission Error */}
      {permissionError && (
        <div className="bg-red-950/80 border border-red-600 p-2.5 rounded-xl text-red-200 text-xs text-center">
          {permissionError}
        </div>
      )}

      {/* THE CASSETTE TAPE - now with live handwritten sticker */}
      <SpinningReels
        state={isPlayingReview ? 'playing' : recordingState}
        progressPercent={Math.min(100, (recordingTime / 180) * 100)}
        guestName={guestName}
        promptText={selectedPrompt}
        stickerStage={recordingState === 'recording' ? 'recording' : stickerStage}
        showSticker={true}
        coupleNames={coupleNames}
      />

      {/* Timer & Status */}
      <div className="text-center">
        <span className="font-mono text-3xl tracking-[0.2em] text-stone-200">
          {formatTimer(recordingTime)}
        </span>
        <span className="text-[10px] text-stone-500 font-sans block uppercase tracking-wider mt-1">
          {recordingState === 'recording' ? '● Recording' : isPlayingReview ? '▸ Playing Back' : 'Ready to Record'}
        </span>
      </div>

      {/* 3 CIRCULAR BUTTONS */}
      <div className="flex items-center justify-center space-x-8">
        {/* STOP / RESET */}
        <button
          onClick={handleStopClick}
          disabled={recordingState === 'idle' && !isPlayingReview && !audioUrl}
          title="Stop / Reset"
          className="w-14 h-14 rounded-full circular-btn-inset flex items-center justify-center text-stone-300 disabled:opacity-25 transition-all"
        >
          <Square className="w-4 h-4 fill-current" />
        </button>

        {/* REC — Crimson Red Dot */}
        <button
          onClick={handleRecClick}
          disabled={recordingState === 'recording'}
          title="Record"
          className={`w-[72px] h-[72px] rounded-full circular-rec-btn flex items-center justify-center shadow-2xl relative ${
            recordingState === 'recording' ? 'animate-pulse' : ''
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-white/90 shadow-inner" />
        </button>

        {/* PLAY REVIEW */}
        <button
          onClick={audioUrl ? handlePlayReview : undefined}
          disabled={!audioUrl || recordingState === 'recording'}
          title="Play Review"
          className="w-14 h-14 rounded-full circular-btn-inset flex items-center justify-center text-stone-300 disabled:opacity-25 transition-all"
        >
          {isPlayingReview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>
      </div>

      {/* SUBMIT AUDIO RECORDING */}
      {audioBlob && recordingState === 'reviewing' && (
        <div className="p-4 bg-stone-900 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3 animate-in fade-in duration-300">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-medium">
            <Volume2 className="w-4 h-4 flex-shrink-0" />
            <span>Voice note recorded ({recordingTime}s)</span>
          </div>
          <button
            onClick={() => onAudioSubmitted(audioBlob, recordingTime)}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center justify-center space-x-1.5 transition-all active:scale-95"
          >
            <span>Submit Recording</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hidden Audio Player */}
      {audioUrl && (
        <audio
          ref={audioReviewRef}
          src={audioUrl}
          onEnded={() => setIsPlayingReview(false)}
          className="hidden"
        />
      )}
    </div>
  );
};
