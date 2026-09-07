'use client';

import React from 'react';
import { RecordingState } from '@/types';

interface SpinningReelsProps {
  state: RecordingState;
  progressPercent?: number;
}

export const SpinningReels: React.FC<SpinningReelsProps> = ({
  state,
  progressPercent = 0,
}) => {
  const isSpinning = state === 'recording' || state === 'playing';
  const spinClass = isSpinning ? 'animate-spin-slow' : '';

  const minR = 28;
  const maxR = 48;
  const leftR = maxR - (progressPercent / 100) * (maxR - minR);
  const rightR = minR + (progressPercent / 100) * (maxR - minR);

  return (
    /* Entire cassette body — the outer plastic shell */
    <div className="w-full max-w-sm mx-auto relative select-none">
      {/* Cassette shell — rounded rectangle with characteristic cassette proportions */}
      <div
        className="relative rounded-xl overflow-hidden border border-stone-600/60"
        style={{
          background: 'linear-gradient(180deg, #d4d0c8 0%, #c8c4bb 30%, #b8b4ab 100%)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.6)',
          aspectRatio: '1.55 / 1',
        }}
      >
        {/* Top screw holes */}
        <div className="absolute top-2.5 left-3.5 w-2 h-2 rounded-full bg-stone-500/50 border border-stone-400/60 shadow-inner" />
        <div className="absolute top-2.5 right-3.5 w-2 h-2 rounded-full bg-stone-500/50 border border-stone-400/60 shadow-inner" />

        {/* Label sticker area (sits above window) */}
        <div
          className="mx-4 mt-4 mb-1 rounded-lg px-3 py-1.5 text-center relative"
          style={{
            background: 'linear-gradient(135deg, #fef9ef 0%, #fdf6e3 50%, #f5edd5 100%)',
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.15)',
          }}
        >
          <div className="flex justify-between text-[8px] text-stone-500 font-mono tracking-widest">
            <span>SIDE A · C-90</span>
            <span className="text-rose-600 font-bold">STEREO</span>
          </div>
          <div className="text-sm font-bold font-sans tracking-[0.15em] text-stone-900 uppercase leading-tight">
            MIXTAPE MEMORIES
          </div>
          <div className="text-[10px] text-stone-500 font-serif italic">
            Digital Audio Guestbook
          </div>
        </div>

        {/* Cassette window — the transparent oval/pill shape showing the tape reels */}
        <div className="mx-5 relative">
          <div
            className="rounded-[40px] px-3 py-4 flex justify-between items-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #1a1d24 0%, #0f1116 70%, #0a0c0f 100%)',
              boxShadow: 'inset 0 4px 16px rgba(0,0,0,0.9), inset 0 -1px 3px rgba(255,255,255,0.05), 0 1px 0 rgba(255,255,255,0.3)',
              border: '2px solid #3a3d42',
              height: '110px',
            }}
          >
            {/* Tape path line */}
            <div className="absolute bottom-4 left-12 right-12 h-[1px] bg-amber-900/40" />

            {/* LEFT REEL */}
            <div className="relative z-10 flex justify-center items-center ml-1">
              <div
                className="rounded-full flex justify-center items-center transition-all duration-300"
                style={{
                  width: `${leftR * 2}px`,
                  height: `${leftR * 2}px`,
                  background: 'radial-gradient(circle, #3d2b1a 0%, #2a1c0f 60%, #1a1008 100%)',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)',
                }}
              >
                {/* Hub */}
                <div
                  className={`w-14 h-14 rounded-full flex justify-center items-center ${spinClass}`}
                  style={{
                    background: 'linear-gradient(135deg, #f5f0e8 0%, #e8e3da 50%, #d8d3ca 100%)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.8)',
                    border: '2px solid #b0ab9f',
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-stone-800 relative flex justify-center items-center border border-stone-600">
                    {/* 3 spoke teeth */}
                    {[0, 120, 240].map((deg) => (
                      <div
                        key={deg}
                        className="absolute w-2 h-3.5 rounded-sm"
                        style={{
                          background: 'linear-gradient(135deg, #e8e3d8, #d0cbc0)',
                          transform: `rotate(${deg}deg) translateY(-8px)`,
                          boxShadow: 'inset 0 0 1px rgba(0,0,0,0.3)',
                        }}
                      />
                    ))}
                    <div className="w-3.5 h-3.5 rounded-full bg-stone-700 border border-stone-500 z-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT REEL */}
            <div className="relative z-10 flex justify-center items-center mr-1">
              <div
                className="rounded-full flex justify-center items-center transition-all duration-300"
                style={{
                  width: `${rightR * 2}px`,
                  height: `${rightR * 2}px`,
                  background: 'radial-gradient(circle, #3d2b1a 0%, #2a1c0f 60%, #1a1008 100%)',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)',
                }}
              >
                {/* Hub */}
                <div
                  className={`w-14 h-14 rounded-full flex justify-center items-center ${spinClass}`}
                  style={{
                    background: 'linear-gradient(135deg, #f5f0e8 0%, #e8e3da 50%, #d8d3ca 100%)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.8)',
                    border: '2px solid #b0ab9f',
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-stone-800 relative flex justify-center items-center border border-stone-600">
                    {[0, 120, 240].map((deg) => (
                      <div
                        key={deg}
                        className="absolute w-2 h-3.5 rounded-sm"
                        style={{
                          background: 'linear-gradient(135deg, #e8e3d8, #d0cbc0)',
                          transform: `rotate(${deg}deg) translateY(-8px)`,
                          boxShadow: 'inset 0 0 1px rgba(0,0,0,0.3)',
                        }}
                      />
                    ))}
                    <div className="w-3.5 h-3.5 rounded-full bg-stone-700 border border-stone-500 z-10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom info strip — "HIGH BIAS 70µs EQ" */}
        <div className="flex justify-between items-center px-5 py-1.5">
          <div className="w-2 h-2 rounded-full bg-stone-500/50 border border-stone-400/40 shadow-inner" />
          <span className="text-[8px] font-mono text-stone-500 tracking-[0.2em] uppercase">
            HIGH BIAS 70µs EQ
          </span>
          <div className="w-2 h-2 rounded-full bg-stone-500/50 border border-stone-400/40 shadow-inner" />
        </div>
      </div>
    </div>
  );
};
