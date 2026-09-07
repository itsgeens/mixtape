'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Check, X, Image as ImageIcon } from 'lucide-react';
import { sfxEngine } from '@/lib/audio-sfx';

interface PolaroidCaptureProps {
  onPhotoCaptured: (photoDataUrl: string | null) => void;
  guestName?: string;
  onGuestNameChange?: (name: string) => void;
}

export const PolaroidCapture: React.FC<PolaroidCaptureProps> = ({
  onPhotoCaptured,
  guestName = '',
  onGuestNameChange,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      setErrorMsg('Camera access unavailable. You can still submit your audio note!');
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const snapPhoto = () => {
    sfxEngine.playButtonClick();
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = Math.min(video.videoWidth || 400, video.videoHeight || 400);
    canvas.width = size;
    canvas.height = size;

    // Draw square cropped camera image
    ctx.drawImage(
      video,
      (video.videoWidth - size) / 2,
      (video.videoHeight - size) / 2,
      size,
      size,
      0,
      0,
      size,
      size
    );

    // Apply Vintage Polaroid Grain & Sepia Filter directly on canvas
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Subtle vintage sepia warm tone
      data[i] = Math.min(255, r * 0.95 + 20);
      data[i + 1] = Math.min(255, g * 0.9 + 10);
      data[i + 2] = Math.min(255, b * 0.85);

      // Add slight film noise/grain
      const noise = (Math.random() - 0.5) * 15;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }

    ctx.putImageData(imageData, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPhotoDataUrl(dataUrl);
    onPhotoCaptured(dataUrl);
    stopCamera();
  };

  const retakePhoto = () => {
    setPhotoDataUrl(null);
    onPhotoCaptured(null);
    startCamera();
  };

  const skipPhoto = () => {
    stopCamera();
    setPhotoDataUrl(null);
    onPhotoCaptured(null);
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <ImageIcon className="w-4 h-4 text-rose-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Optional Polaroid Selfie
          </h3>
        </div>
        {!photoDataUrl && cameraActive && (
          <button
            onClick={skipPhoto}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Skip Photo
          </button>
        )}
      </div>

      {!cameraActive && !photoDataUrl ? (
        /* START CAMERA PROMPT */
        <div className="text-center py-6 border-2 border-dashed border-slate-800 rounded-lg bg-slate-950/50">
          <Camera className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400 mb-3">
            Snap an optional selfie to attach to your voice note!
          </p>
          {errorMsg && <p className="text-xs text-rose-400 mb-2 px-2">{errorMsg}</p>}
          <div className="flex justify-center space-x-2">
            <button
              onClick={startCamera}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center space-x-1.5 transition-all shadow-md shadow-rose-950"
            >
              <Camera className="w-4 h-4" />
              <span>Take Selfie</span>
            </button>
            <button
              onClick={skipPhoto}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-lg"
            >
              Skip
            </button>
          </div>
        </div>
      ) : cameraActive && !photoDataUrl ? (
        /* LIVE CAMERA STREAM */
        <div className="relative flex flex-col items-center">
          <div className="w-64 h-64 bg-black rounded-lg overflow-hidden relative border-4 border-stone-100 shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
          </div>
          <div className="mt-3 flex space-x-3">
            <button
              onClick={snapPhoto}
              className="bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs px-5 py-2 rounded-full flex items-center space-x-1.5 shadow-lg shadow-rose-950"
            >
              <Camera className="w-4 h-4" />
              <span>Snap Photo</span>
            </button>
            <button
              onClick={skipPhoto}
              className="bg-slate-800 text-slate-300 text-xs px-3 py-2 rounded-full"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* POLAROID FRAME RESULT */
        <div className="flex flex-col items-center">
          {/* Authentic Polaroid Card Frame */}
          <div className="w-64 bg-stone-100 p-3 pt-3 pb-6 rounded shadow-2xl border border-stone-300 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            <div className="w-full h-56 bg-slate-900 rounded overflow-hidden shadow-inner border border-stone-300 relative">
              {/* eslint-disable-next-html-element-suppression */}
              <img
                src={photoDataUrl!}
                alt="Polaroid Selfie"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Hand-written signature area */}
            <div className="mt-3 text-center">
              <input
                type="text"
                value={guestName}
                onChange={(e) => onGuestNameChange?.(e.target.value)}
                placeholder="Write your name here..."
                className="w-full bg-transparent text-center text-slate-900 font-bold font-sans text-sm focus:outline-none placeholder:text-slate-400 placeholder:italic border-b border-stone-300 pb-0.5"
              />
            </div>
          </div>

          <div className="mt-3 flex space-x-2">
            <button
              onClick={retakePhoto}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retake</span>
            </button>
            <button
              onClick={() => onPhotoCaptured(photoDataUrl)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded flex items-center space-x-1"
            >
              <Check className="w-3 h-3" />
              <span>Photo Attached</span>
            </button>
            <button
              onClick={skipPhoto}
              className="bg-slate-900 text-slate-400 hover:text-slate-200 text-xs px-2 py-1.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Hidden Canvas for Processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
