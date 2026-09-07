'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, PenLine } from 'lucide-react';

interface StickerLabelProps {
  guestName: string;
  promptText?: string;
  stage: 'typing' | 'prompt' | 'recording' | 'photo' | 'stuck';
  coupleNames?: string;
  isWriting?: boolean;
}

export const StickerLabel: React.FC<StickerLabelProps> = ({
  guestName,
  promptText,
  stage,
  coupleNames = 'Sarah & John',
  isWriting = false,
}) => {
  const hasName = guestName.trim().length > 0;
  const hasPrompt = !!promptText;
  const isStuck = stage === 'stuck';

  return (
    <motion.div
      layout
      initial={isStuck ? { y: -60, scale: 1.2, rotate: -12, opacity: 0 } : { opacity: 0, y: 8 }}
      animate={
        isStuck
          ? { y: 0, scale: 1, rotate: 1.5, opacity: 1 }
          : { opacity: 1, y: 0, rotate: 0.5 }
      }
      transition={
        isStuck
          ? { type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }
          : { duration: 0.4, ease: 'easeOut' }
      }
      className={`relative w-full max-w-[320px] mx-auto select-none ${isStuck ? 'drop-shadow-xl' : 'drop-shadow-md'}`}
      style={{ transformOrigin: 'center top' }}
    >
      {/* Peel shadow */}
      <div className="absolute inset-0 bg-black/10 rounded-xl blur-[6px] translate-y-1.5 translate-x-0.5 -z-10" />

      <div
        className={`relative rounded-[10px] border border-stone-200 overflow-hidden sticker-paper px-4 py-3 ${isStuck ? 'rotate-[1.2deg]' : 'rotate-[0.4deg]'}`}
      >
        {/* Adhesive shine line */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent pointer-events-none" />
        {/* Pealed corner */}
        <div className="absolute top-0 right-0 w-6 h-6 bg-gradient-to-bl from-stone-200/60 to-transparent rounded-bl-lg border-l border-b border-stone-200/40" />
        <div className="absolute top-[2px] right-[2px] w-2 h-2 bg-stone-900/5 rounded-full" />

        {/* Header row */}
        <div className="flex justify-between items-center text-[7px] font-mono tracking-[0.18em] text-stone-400 uppercase relative z-10">
          <span className="flex items-center gap-1">
            <PenLine className="w-2.5 h-2.5" /> HANDWRITTEN LABEL
          </span>
          <span className="flex items-center gap-1 text-rose-500 font-bold">
            SIDE A <Heart className="w-2.5 h-2.5 fill-rose-500" />
          </span>
        </div>

        {/* Handwritten guest name */}
        <div className="relative z-10 mt-1 min-h-[28px] flex items-baseline justify-center gap-1.5">
          <AnimatePresence mode="wait">
            {hasName ? (
              <motion.span
                key={guestName}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="font-hand font-bold text-[22px] leading-none text-stone-900 tracking-wide"
                style={{ fontFamily: 'var(--font-hand)' }}
              >
                {guestName}
                {isWriting && stage === 'typing' && (
                  <span className="hand-cursor inline-block w-[2px] h-[18px] bg-stone-800 ml-0.5 translate-y-1" />
                )}
              </motion.span>
            ) : (
              <motion.span
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-hand text-[16px] text-stone-400 italic"
                style={{ fontFamily: 'var(--font-hand)' }}
              >
                Your name...
              </motion.span>
            )}
          </AnimatePresence>
          {hasName && (
            <span className="text-[9px] font-sans text-stone-500 tracking-widest uppercase self-end pb-1">
              → for {coupleNames}
            </span>
          )}
        </div>

        {/* Dotted line separator */}
        <div className="relative z-10 my-1.5 border-t border-dashed border-stone-300" />

        {/* Prompt preview - handwritten small */}
        <div className="relative z-10 min-h-[18px]">
          <AnimatePresence mode="wait">
            {hasPrompt ? (
              <motion.p
                key={promptText}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="font-hand text-[13px] leading-tight text-stone-700 text-center px-1 line-clamp-2"
                style={{ fontFamily: 'var(--font-hand)' }}
              >
                “{promptText}”
              </motion.p>
            ) : (
              <p className="font-hand text-[12px] text-stone-400 italic text-center" style={{ fontFamily: 'var(--font-hand)' }}>
                Choose a prompt…
              </p>
            )}
          </AnimatePresence>
        </div>

        {/* Stage badge */}
        <div className="relative z-10 flex justify-center mt-1.5">
          <span
            className={`text-[7px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${
              isStuck
                ? 'bg-emerald-500 text-white border-emerald-600'
                : stage === 'recording'
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : 'bg-stone-800 text-stone-100 border-stone-700'
            }`}
          >
            {isStuck ? '● STUCK ON TAPE' : stage === 'typing' ? '✎ WRITING…' : stage === 'prompt' ? '✦ PICKING PROMPT' : stage === 'recording' ? '● RECORDING' : stage === 'photo' ? '◯ PHOTO' : 'PREVIEW'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
