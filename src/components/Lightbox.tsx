/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Photo, PhotoMetadata } from '../types';
import { 
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, 
  Sparkles, Camera, Calendar, MapPin, Layers, Info, Check, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LightboxProps {
  photo: Photo;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSaveAIAnalysis: (photoId: string, analysis: NonNullable<Photo['aiAnalysis']>) => void;
  hasGeminiKey: boolean;
}

export default function Lightbox({
  photo,
  onClose,
  onNext,
  onPrev,
  onSaveAIAnalysis,
  hasGeminiKey,
}: LightboxProps) {
  const [zoomScale, setZoomScale] = useState(1);
  const [showMetaPanel, setShowMetaPanel] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Reset zoom when photo transforms
  useEffect(() => {
    setZoomScale(1);
    setAnalysisError(null);
  }, [photo]);

  // Hook up keyboard hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onClose]);

  const handleZoomIn = () => setZoomScale(p => Math.min(p + 0.25, 3));
  const handleZoomOut = () => setZoomScale(p => Math.max(p - 0.25, 0.5));
  const handleZoomReset = () => setZoomScale(1);

  // Convert blob URL to Base64 in-browser
  const getBlobAsBase64 = async (blobUrl: string): Promise<string> => {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Handle server-side Gemini profiling
  const triggerAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      let finalUrl = photo.url;
      if (photo.url.startsWith('blob:')) {
        try {
          finalUrl = await getBlobAsBase64(photo.url);
        } catch (blobErr: any) {
          throw new Error('Could not translate photo binary for processing.');
        }
      }

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: finalUrl }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to trigger photo evaluation.');
      }

      onSaveAIAnalysis(photo.id, data);
    } catch (err: any) {
      setAnalysisError(err.message || 'Connecting to intelligence pipeline failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not available';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Not available';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex flex-col md:flex-row focus:outline-none"
    >
      {/* 1. Main visual stage (Left pane) */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden p-4 md:p-8 select-none min-h-[50vh] md:min-h-0">
        {/* Top Control Bar overlay */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-4">
          <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 border border-gray-900 rounded-lg text-xs font-mono text-gray-400">
            {photo.album} / <span className="text-white font-medium">{photo.name}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Zoom actions */}
            <div className="flex bg-black/60 backdrop-blur-md p-1 border border-gray-900 rounded-md">
              <button onClick={handleZoomOut} className="p-1 hover:text-white text-gray-400 cursor-pointer" title="Zoom Out">
                <ZoomOut className="w-4 h-4" />
              </button>
              <button onClick={handleZoomReset} className="px-1.5 hover:text-white text-gray-400 cursor-pointer text-[10px] font-mono leading-none" title="Reset Zoom">
                {Math.round(zoomScale * 100)}%
              </button>
              <button onClick={handleZoomIn} className="p-1 hover:text-white text-gray-400 cursor-pointer" title="Zoom In">
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Info toggle */}
            <button
              onClick={() => setShowMetaPanel(!showMetaPanel)}
              className={`p-2 backdrop-blur-md border rounded-md cursor-pointer transition-all ${
                showMetaPanel 
                  ? 'bg-rose-500/10 text-rose-450 border-rose-500/20' 
                  : 'bg-black/60 text-gray-450 border-gray-900 hover:text-white'
              }`}
              title="Toggle Information Panel"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 bg-black/60 backdrop-blur-md border border-gray-900 rounded-md text-gray-400 hover:text-white cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic sliding / scaled image */}
        <div className="w-full h-full flex items-center justify-center relative">
          <motion.div
            key={photo.id}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: zoomScale, opacity: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="max-w-full max-h-full flex items-center justify-center p-4 cursor-grab active:cursor-grabbing"
          >
            <img
              src={photo.url}
              alt={photo.name}
              referrerPolicy="no-referrer"
              data-context-url={photo.url}
              data-context-name={photo.name}
              className="max-w-full max-h-[75vh] md:max-h-[85vh] object-contain rounded shadow-2xl transition-transform duration-300 cursor-default"
              style={{
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)'
              }}
            />
          </motion.div>
        </div>

        {/* Carousel slide controls */}
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/80 border border-gray-900 rounded-full text-gray-455 hover:text-white cursor-pointer select-none transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/80 border border-gray-900 rounded-full text-gray-455 hover:text-white cursor-pointer select-none transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Photo Info Sidebar Panel (Right/Bottom pane) */}
      <AnimatePresence>
        {showMetaPanel && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '100%', maxWidth: '375px', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="w-full md:w-[375px] bg-gray-950 border-t md:border-t-0 md:border-l border-gray-900 flex flex-col overflow-y-auto select-text md:max-h-screen relative z-30 shadow-2xl h-auto shrink-0"
          >
            <div className="p-5 border-b border-gray-900">
              <span className="text-[10px] font-mono font-semibold tracking-widest text-rose-500 uppercase">
                {photo.album}
              </span>
              <h2 className="font-playfair text-lg text-white font-medium leading-tight mt-1 flex items-center justify-between">
                {photo.name}
              </h2>
              <p className="text-xs text-gray-500 mt-2 font-mono">
                File details: {(photo.size ? `${(photo.size / 1024).toFixed(1)} KB` : 'Dynamic Image')}
              </p>
            </div>

            {/* Scrolling panels */}
            <div className="flex-1 p-5 space-y-6">
              
              {/* TIFF EXIF specifications */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold font-mono tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5" />
                  TECHNICAL LOG (EXIF)
                </h3>
                <div className="bg-gray-900/30 border border-gray-900 rounded-lg p-3 space-y-2.5 text-xs font-mono">
                  <div className="flex items-start justify-between gap-2 border-b border-gray-900/60 pb-1.5">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-gray-600" /> CAMERA
                    </span>
                    <span className="text-gray-300 text-right">
                      {photo.metadata?.camera || 'Unavailable'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 border-b border-gray-900/60 pb-1.5">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-gray-600" /> OPTICS
                    </span>
                    <span className="text-gray-400 text-right">
                      {photo.metadata?.lens || 'Unavailable'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 border-b border-gray-900/60 pb-1.5">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-600" /> TAKEN AT
                    </span>
                    <span className="text-gray-300 text-right">
                      {photo.metadata?.dateTaken ? formatDate(photo.metadata.dateTaken) : 'Unavailable'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 border-b border-gray-900/60 pb-1.5">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-gray-600" /> RESOLUTION
                    </span>
                    <span className="text-gray-400 text-right">
                      {photo.metadata?.width && photo.metadata?.height 
                        ? `${photo.metadata.width} × ${photo.metadata.height} px` 
                        : 'Auto Scale'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-600" /> COORDINATES
                    </span>
                    <span className="text-gray-350 text-right truncate">
                      {photo.metadata?.gps 
                        ? `${photo.metadata.gps.lat.toFixed(4)}N, ${photo.metadata.gps.lng.toFixed(4)}E` 
                        : 'No coordinates present'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Server-Side Gemini AI tagging evaluations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold font-mono tracking-wider text-rose-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-550" />
                    AI ANALYSIS REPORT
                  </h3>
                  
                  {photo.aiAnalysis && (
                    <span className="text-[9px] font-mono bg-green-950/40 text-green-400 px-1.5 py-0.2 rounded border border-green-900/50 flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" /> SECURE MATCH
                    </span>
                  )}
                </div>

                {photo.aiAnalysis ? (
                  /* Formatted AI Output presentation */
                  <div className="bg-gray-900/10 border border-gray-900 rounded-lg p-4 space-y-4">
                    {/* Story / Poetic descriptive paragraphs */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono text-gray-500 uppercase block">Poetic Interpretation</span>
                      <blockquote className="font-playfair italic text-sm text-gray-200 leading-relaxed border-l-2 border-rose-500/50 pl-3">
                        "{photo.aiAnalysis.description}"
                      </blockquote>
                      <p className="text-[11px] text-gray-400 leading-relaxed font-sans mt-2">
                        {photo.aiAnalysis.caption}
                      </p>
                    </div>

                    {/* Dominant Colors matching blocks */}
                    {photo.aiAnalysis.dominantColors && photo.aiAnalysis.dominantColors.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono text-gray-500 uppercase block">Dominant Archival Palette</span>
                        <div className="flex items-center gap-2">
                          {photo.aiAnalysis.dominantColors.map((color) => (
                            <div key={color} className="flex flex-col items-center gap-1">
                              <div 
                                className="w-7 h-7 rounded-md border border-gray-800 shadow-md transition-transform hover:scale-110 duration-200 cursor-crosshair"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                              <span className="text-[8px] font-mono text-gray-500">{color}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mood & Semantic theme tags */}
                    <div className="space-y-2 border-t border-gray-900/80 pt-3">
                      {photo.aiAnalysis.mood && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <span className="text-[9px] font-mono text-gray-500 uppercase">Atmosphere:</span>
                          <span className="text-xs text-rose-300 font-medium">
                            {photo.aiAnalysis.mood}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {photo.aiAnalysis.tags.map(tag => (
                          <span key={tag} className="text-[9px] font-mono px-2 py-0.5 bg-gray-900 rounded border border-gray-850 text-gray-300 hover:text-white hover:border-gray-700 transition">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Trigger State block */
                  <div className="bg-gray-900/35 border border-gray-900 rounded-lg p-5 text-center space-y-4">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Evaluate this memory with advanced Gemini AI models to generate semantic tags, mood profiling, and catalog stories on-the-fly.
                    </p>

                    {analysisError && (
                      <div className="bg-rose-950/20 border border-rose-900/50 p-2.5 rounded text-left text-xs text-rose-400 flex items-start gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{analysisError}</span>
                      </div>
                    )}

                    <button
                      onClick={triggerAIAnalysis}
                      disabled={isAnalyzing}
                      className="w-full py-2.5 px-4 bg-rose-650 hover:bg-rose-600 active:bg-rose-700 disabled:bg-gray-900 border border-rose-500/10 hover:border-rose-500/20 disabled:border-transparent text-white rounded-lg text-xs font-semibold cursor-pointer disabled:cursor-not-allowed shadow transition-all duration-300 flex items-center justify-center gap-2 "
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                      {isAnalyzing ? 'Conducting Deep Inspection...' : 'Generate AI Discovery Report'}
                    </button>
                    
                    {!hasGeminiKey && (
                      <p className="text-[9px] font-mono text-gray-500 leading-snug">
                        Note: Requires configure of <strong>GEMINI_API_KEY</strong> inside Settings secrets first.
                      </p>
                    )}
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
