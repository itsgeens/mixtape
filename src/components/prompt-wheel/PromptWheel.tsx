'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Check, MessageSquarePlus } from 'lucide-react';
import { Prompt } from '@/types';
import { sfxEngine } from '@/lib/audio-sfx';

interface PromptWheelProps {
  prompts: Prompt[];
  onSelectPrompt: (promptText: string) => void;
  selectedPrompt?: string;
}

export const PromptWheel: React.FC<PromptWheelProps> = ({
  prompts,
  onSelectPrompt,
  selectedPrompt,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  const activePromptObj = prompts[currentIndex];
  const activePromptText = activePromptObj ? activePromptObj.promptText : 'Share your favorite memory with the couple!';

  const handleNext = () => {
    sfxEngine.playButtonClick();
    if (prompts.length === 0) return;
    const nextIdx = (currentIndex + 1) % prompts.length;
    setCurrentIndex(nextIdx);
    onSelectPrompt(prompts[nextIdx].promptText);
  };

  const handleUsePrompt = (text: string) => {
    sfxEngine.playButtonClick();
    onSelectPrompt(text);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPrompt.trim()) {
      sfxEngine.playButtonClick();
      onSelectPrompt(customPrompt.trim());
      setShowCustomInput(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400/90" />
          <h3 className="text-xs font-serif font-bold uppercase tracking-widest text-stone-300">
            Step 2 • Inspiration Prompt
          </h3>
        </div>
        <button
          onClick={handleNext}
          className="flex items-center space-x-1.5 text-xs text-amber-200 hover:text-amber-100 font-sans font-medium px-2.5 py-1 rounded-full bg-stone-800 border border-stone-700 transition-all"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Next Idea</span>
        </button>
      </div>

      {/* Prompt Card */}
      <div className="relative min-h-24 flex justify-center items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className={`w-full p-4 rounded-xl border text-center transition-all ${
              selectedPrompt === activePromptText
                ? 'bg-amber-950/20 border-amber-500/50 shadow-md'
                : 'bg-stone-950/80 border-stone-800 text-stone-200'
            }`}
          >
            <p className="text-base font-serif italic text-stone-100 leading-relaxed">
              &ldquo;{activePromptText}&rdquo;
            </p>

            <div className="mt-3 flex justify-center items-center">
              <button
                onClick={() => handleUsePrompt(activePromptText)}
                className={`text-xs font-sans font-semibold px-4 py-1.5 rounded-full flex items-center space-x-1.5 transition-all ${
                  selectedPrompt === activePromptText
                    ? 'bg-amber-100 text-stone-950 shadow-md'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{selectedPrompt === activePromptText ? 'Selected' : 'Select This Prompt'}</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Custom Write-In Option */}
      <div className="mt-3 text-center">
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            className="text-xs text-stone-400 hover:text-stone-200 underline font-serif inline-flex items-center space-x-1"
          >
            <MessageSquarePlus className="w-3 h-3" />
            <span>Write custom prompt idea...</span>
          </button>
        ) : (
          <form onSubmit={handleCustomSubmit} className="mt-2 flex gap-2">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Advice for their honeymoon..."
              className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500 font-sans"
              autoFocus
            />
            <button
              type="submit"
              className="bg-amber-100 hover:bg-amber-200 text-stone-950 text-xs font-bold px-3 py-1.5 rounded-xl font-sans"
            >
              Set
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
