'use client';

import React from 'react';
import { AudioVisualizerData } from '@/types';

interface VUMeterProps {
  levels: AudioVisualizerData;
  isActive: boolean;
}

export const VUMeter: React.FC<VUMeterProps> = ({ levels, isActive }) => {
  // Convert 0-100 level to angle degrees (-45deg to +45deg)
  const leftAngle = isActive ? -45 + (levels.leftLevel / 100) * 90 : -45;
  const rightAngle = isActive ? -45 + (levels.rightLevel / 100) * 90 : -45;

  return (
    <div className="w-full grid grid-cols-2 gap-3 p-2.5 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
      {/* LEFT CHANNEL METER */}
      <div className="relative h-20 rounded-lg border border-amber-900/60 bg-gradient-to-b from-amber-100 via-amber-200 to-amber-100 text-slate-950 p-1 overflow-hidden flex flex-col justify-between shadow-inner">
        {/* Scale markings */}
        <div className="flex justify-between items-center text-[9px] font-tech font-bold opacity-80 px-1 select-none">
          <span>-20</span>
          <span>-10</span>
          <span>-5</span>
          <span>0</span>
          <span className="text-rose-700 font-extrabold">+3</span>
        </div>

        <div className="text-[9px] font-tech font-bold text-center tracking-widest opacity-60">
          LEFT CH
        </div>

        {/* Pivot base & needle */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full flex justify-center items-end pointer-events-none">
          <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-400 z-10 -mb-1 shadow" />
          <div
            className="absolute bottom-0 w-0.5 h-14 bg-rose-700 origin-bottom transition-transform duration-100 ease-out z-0 shadow-sm"
            style={{ transform: `rotate(${leftAngle}deg)` }}
          />
        </div>

        {/* LED Peak Dots */}
        <div className="flex justify-end gap-1 px-1 z-10">
          <div className={`w-1.5 h-1.5 rounded-full ${levels.leftLevel > 20 ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-amber-900/30'}`} />
          <div className={`w-1.5 h-1.5 rounded-full ${levels.leftLevel > 60 ? 'bg-amber-500 shadow-[0_0_5px_#f59e0b]' : 'bg-amber-900/30'}`} />
          <div className={`w-1.5 h-1.5 rounded-full ${levels.leftLevel > 85 ? 'bg-rose-600 shadow-[0_0_8px_#e11d48]' : 'bg-amber-900/30'}`} />
        </div>
      </div>

      {/* RIGHT CHANNEL METER */}
      <div className="relative h-20 rounded-lg border border-amber-900/60 bg-gradient-to-b from-amber-100 via-amber-200 to-amber-100 text-slate-950 p-1 overflow-hidden flex flex-col justify-between shadow-inner">
        {/* Scale markings */}
        <div className="flex justify-between items-center text-[9px] font-tech font-bold opacity-80 px-1 select-none">
          <span>-20</span>
          <span>-10</span>
          <span>-5</span>
          <span>0</span>
          <span className="text-rose-700 font-extrabold">+3</span>
        </div>

        <div className="text-[9px] font-tech font-bold text-center tracking-widest opacity-60">
          RIGHT CH
        </div>

        {/* Pivot base & needle */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full flex justify-center items-end pointer-events-none">
          <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-400 z-10 -mb-1 shadow" />
          <div
            className="absolute bottom-0 w-0.5 h-14 bg-rose-700 origin-bottom transition-transform duration-100 ease-out z-0 shadow-sm"
            style={{ transform: `rotate(${rightAngle}deg)` }}
          />
        </div>

        {/* LED Peak Dots */}
        <div className="flex justify-end gap-1 px-1 z-10">
          <div className={`w-1.5 h-1.5 rounded-full ${levels.rightLevel > 20 ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-amber-900/30'}`} />
          <div className={`w-1.5 h-1.5 rounded-full ${levels.rightLevel > 60 ? 'bg-amber-500 shadow-[0_0_5px_#f59e0b]' : 'bg-amber-900/30'}`} />
          <div className={`w-1.5 h-1.5 rounded-full ${levels.rightLevel > 85 ? 'bg-rose-600 shadow-[0_0_8px_#e11d48]' : 'bg-amber-900/30'}`} />
        </div>
      </div>
    </div>
  );
};
