/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Photo, PhotoMetadata, RepoConfig, FilterState } from './types';
import { DEMO_PHOTOS, DEMO_REPO } from './utils/demoData';
import { fetchPhotosFromGithub } from './utils/github';
import Header from './components/Header';
import AlbumGrid from './components/AlbumGrid';
import PhotoCard from './components/PhotoCard';
import TimelineView from './components/TimelineView';
import MapView from './components/MapView';
import Lightbox from './components/Lightbox';
import Uploader from './components/Uploader';

import { Image as ImageIcon, Sparkles, AlertTriangle, RefreshCw, Layers, Code, Check, Copy, X, Folder, Calendar, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Help resolve location coordinates to labels for neat sorting/filtering
function getPresetLocationName(lat: number, lng: number): string {
  if (Math.abs(lat - 35.65) < 0.1) return 'Shibuya, Tokyo';
  if (Math.abs(lat - 35.7) < 0.1) return 'Asakusa, Tokyo';
  if (Math.abs(lat - 35.0) < 0.1) return 'Kyoto, Japan';
  if (Math.abs(lat - 48.88) < 0.1) return 'Montmartre, Paris';
  if (Math.abs(lat - 48.86) < 0.1) return 'Louvre Museum, Paris';
  if (Math.abs(lat - 51.5) < 0.1) return 'London, UK';
  if (Math.abs(lat - 40.74) < 0.1) return 'New York City, USA';
  if (Math.abs(lat - 41.8) < 0.2) return 'Rome, Italy';
  return 'General Location';
}

export default function App() {
  // 1. Initial State configurations
  const [config, setConfig] = useState<RepoConfig>(() => {
    try {
      const saved = localStorage.getItem('_memorybox_github_config');
      return saved ? JSON.parse(saved) : DEMO_REPO;
    } catch {
      return DEMO_REPO;
    }
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return config.owner === 'archival-labs' && config.repo === 'cinematic-memories';
  });

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isEmbedMode, setIsEmbedMode] = useState<boolean>(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.get('embed') === 'true';
    } catch {
      return false;
    }
  });

  const [activeView, setActiveView] = useState<'albums' | 'timeline' | 'map'>(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const viewQuery = searchParams.get('view');
      if (viewQuery === 'timeline' || viewQuery === 'map' || viewQuery === 'albums') {
        return viewQuery;
      }
    } catch {}
    return 'albums';
  });

  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);
  const [showEmbedGenerator, setShowEmbedGenerator] = useState<boolean>(false);
  const [showUploader, setShowUploader] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [embedStartingView, setEmbedStartingView] = useState<'albums' | 'timeline' | 'map'>('albums');

  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    album: 'all',
    year: 'all',
    location: 'all',
  });

  const [serverStatus, setServerStatus] = useState({
    hasApiKey: false,
  });

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    photoUrl: string;
    photoName: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    photoUrl: '',
    photoName: '',
  });

  const [copiedContext, setCopiedContext] = useState<boolean>(false);

  // Context Menu logic to intercept right-clicks on photos
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      let target = e.target as HTMLElement | null;
      while (target && target !== document.body) {
        const url = target.getAttribute('data-context-url');
        const name = target.getAttribute('data-context-name');
        if (url) {
          e.preventDefault();
          setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            photoUrl: url,
            photoName: name || 'Photograph',
          });
          setCopiedContext(false);
          return;
        }
        target = target.parentElement;
      }
    };

    const handleWindowClick = () => {
      setContextMenu((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('click', handleWindowClick);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('click', handleWindowClick);
    };
  }, []);

  // Load backend status check
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setServerStatus({ hasApiKey: data.hasApiKey });
      })
      .catch((err) => {
        // console.warn('Could not contact backend API context', err);
      });
  }, []);

  // Save config to local Storage
  useEffect(() => {
    localStorage.setItem('_memorybox_github_config', JSON.stringify(config));
  }, [config]);

  // Indexing Photographs side-effect
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setErrorMessage(null);

    if (isDemoMode) {
      // Demo load matching local mock database
      setTimeout(() => {
        if (active) {
          setPhotos(DEMO_PHOTOS);
          setIsLoading(false);
        }
      }, 600);
      return;
    }

    // Dynamic GitHub API crawl recursive query
    const loadGitHubPhotos = async () => {
      try {
        const repoPhotos = await fetchPhotosFromGithub(config);
        if (active) {
          if (repoPhotos.length === 0) {
            setPhotos([]); // empty repo fallback
            setErrorMessage('Connected successfully, but no valid images (.jpg, .jpeg, .png, .webp) were detected in the repository.');
          } else {
            setPhotos(repoPhotos);
          }
          setIsLoading(false);
        }
      } catch (err: any) {
        if (active) {
          setErrorMessage(err.message || 'An error occurred while communicating with the GitHub directory tree.');
          setIsLoading(false);
        }
      }
    };

    loadGitHubPhotos();

    return () => {
      active = false;
    };
  }, [config, isDemoMode]);

  // Callback to insert lazy parsed EXIF metadata into state cache securely
  const handlePhotoMetadataLoaded = useCallback((photoId: string, meta: PhotoMetadata) => {
    setPhotos((prevPhotos) =>
      prevPhotos.map((photo) => {
        if (photo.id !== photoId) return photo;
        
        const existingMeta = photo.metadata || {};
        const mergedGPS = meta.gps
          ? {
              ...meta.gps,
              locationName: meta.gps.locationName || getPresetLocationName(meta.gps.lat, meta.gps.lng),
            }
          : null;

        return {
          ...photo,
          metadata: {
            ...existingMeta,
            ...meta,
            gps: mergedGPS,
          },
        };
      })
    );
  }, []);

  // Callback to insert server-proxied Gemini descriptive report into state cache
  const handlePhotoAIAnalysisSaved = useCallback((photoId: string, analysis: NonNullable<Photo['aiAnalysis']>) => {
    setPhotos((prevPhotos) =>
      prevPhotos.map((photo) => {
        if (photo.id !== photoId) return photo;
        const updatedPhoto = {
          ...photo,
          aiAnalysis: analysis,
        };
        // Update lightbox reference too if open
        if (activePhoto && activePhoto.id === photoId) {
          setActivePhoto(updatedPhoto);
        }
        return updatedPhoto;
      })
    );
  }, [activePhoto]);

  const handlePhotosUploaded = useCallback((newPhotos: Photo[]) => {
    setPhotos((prevPhotos) => [...newPhotos, ...prevPhotos]);
    setFilter((currentFilter) => ({ ...currentFilter, album: 'all' }));
  }, []);

  // View toggle demo matrix modes
  const handleToggleMode = () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      // Fallback clean placeholder configs if default repo was active
      if (config.owner === 'archival-labs' && config.repo === 'cinematic-memories') {
        setConfig({
          owner: 'deendinesh619',
          repo: 'street-photos',
          branch: 'main',
        });
      }
    } else {
      setIsDemoMode(true);
    }
  };

  // List filter generators: computes valid filters matching active photograph parameters
  const availableAlbums = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => {
      if (p.album) set.add(p.album);
    });
    return Array.from(set).sort();
  }, [photos]);

  const availableYears = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => {
      const year = p.metadata?.dateTaken ? new Date(p.metadata.dateTaken).getFullYear() : undefined;
      if (year) {
        set.add(year.toString());
      } else {
        // Default mock matching years based on mock elements
        set.add('2025');
        set.add('2024');
        set.add('2023');
      }
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [photos]);

  const availableLocations = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => {
      const name = p.metadata?.gps?.locationName;
      if (name) set.add(name);
    });
    return Array.from(set).sort();
  }, [photos]);

  // Main Photographic filters pipeline logic
  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      // 1. Album matching
      if (filter.album !== 'all' && photo.album !== filter.album) {
        return false;
      }

      // 2. Year matching
      if (filter.year !== 'all') {
        const year = photo.metadata?.dateTaken ? new Date(photo.metadata.dateTaken).getFullYear().toString() : '2025'; // fallback representation
        if (year !== filter.year) return false;
      }

      // 3. Location matching
      if (filter.location !== 'all') {
        const locName = photo.metadata?.gps?.locationName;
        if (locName !== filter.location) return false;
      }

      // 4. Fuzzy text Search matching (name, description text, cameras, lens, or tag matrices)
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase().trim();
        const nameMatch = photo.name.toLowerCase().includes(query);
        const fileFolderMatch = photo.album.toLowerCase().includes(query);
        
        const cameraMatch = photo.metadata?.camera?.toLowerCase().includes(query) || false;
        const locMatch = photo.metadata?.gps?.locationName?.toLowerCase().includes(query) || false;
        
        const aiSummaryMatch = photo.aiAnalysis?.description.toLowerCase().includes(query) || false;
        const aiCaptionMatch = photo.aiAnalysis?.caption.toLowerCase().includes(query) || false;
        const aiTagsMatch = photo.aiAnalysis?.tags.some(t => t.toLowerCase().includes(query)) || false;

        return nameMatch || fileFolderMatch || cameraMatch || locMatch || aiSummaryMatch || aiCaptionMatch || aiTagsMatch;
      }

      return true;
    });
  }, [photos, filter]);

  // Lightbox carousel navigators (Next / Prev)
  const activePhotoIndex = useMemo(() => {
    if (!activePhoto) return -1;
    return filteredPhotos.findIndex((p) => p.id === activePhoto.id);
  }, [activePhoto, filteredPhotos]);

  const handleNextPhoto = useCallback(() => {
    if (activePhotoIndex === -1 || filteredPhotos.length <= 1) return;
    const nextIdx = (activePhotoIndex + 1) % filteredPhotos.length;
    setActivePhoto(filteredPhotos[nextIdx]);
  }, [activePhotoIndex, filteredPhotos]);

  const handlePrevPhoto = useCallback(() => {
    if (activePhotoIndex === -1 || filteredPhotos.length <= 1) return;
    const prevIdx = (activePhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setActivePhoto(filteredPhotos[prevIdx]);
  }, [activePhotoIndex, filteredPhotos]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 selection:bg-rose-500/20 selection:text-rose-300">
      {/* 1. Only show main header if NOT in embed mode */}
      {!isEmbedMode && (
        <Header
          activeView={activeView}
          onViewChange={(view) => {
            setActiveView(view);
            // Auto clear selective inner triggers
            if (view === 'map' && filter.location !== 'all') {
              setFilter(f => ({ ...f, location: 'all' }));
            }
          }}
          config={config}
          onConfigChange={(newCfg) => {
            setConfig(newCfg);
            setIsDemoMode(false); // Disable demo mode once a real configuration is loaded
          }}
          filter={filter}
          onFilterChange={setFilter}
          availableAlbums={availableAlbums}
          availableYears={availableYears}
          availableLocations={availableLocations}
          isDemoMode={isDemoMode}
          onToggleMode={handleToggleMode}
          isConnected={!isDemoMode && photos.length > 0 && !errorMessage}
          photoCount={photos.length}
          onOpenEmbedGenerator={() => setShowEmbedGenerator(true)}
          onOpenUploader={() => setShowUploader(true)}
        />
      )}

      {/* 2. Floating action capsule for embedded mode article readers */}
      {isEmbedMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-900/80 backdrop-blur-md border border-gray-805 rounded-full py-1.5 px-3 flex items-center gap-1.5 shadow-2xl select-none">
          <button
            onClick={() => setActiveView('albums')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
              activeView === 'albums' 
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            Albums
          </button>
          <button
            onClick={() => setActiveView('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
              activeView === 'timeline' 
                ? 'bg-rose-500/10 text-rose-440 border border-rose-500/20 shadow-sm' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Timeline
          </button>
          <button
            onClick={() => setActiveView('map')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
              activeView === 'map' 
                ? 'bg-rose-500/10 text-rose-440 border border-rose-500/20 shadow-sm' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Map
          </button>
        </div>
      )}

      <main className={isEmbedMode ? "w-full min-h-[90vh] p-2 sm:p-4 pb-20" : "max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 min-h-[60vh]"}>
        {/* Loading overlay panel */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <RefreshCw className="w-10 h-10 text-rose-500 animate-spin" />
            <div className="text-center">
              <h3 className="text-md font-medium text-white font-sans">Indexing Photographic Archive...</h3>
              <p className="text-xs text-gray-500 font-mono mt-1">
                {isDemoMode ? 'Loading local fine-art portfolio datasets' : `Connecting to Git Tree API at ${config.owner}/${config.repo}`}
              </p>
            </div>
          </div>
        ) : errorMessage ? (
          /* Error report board with dynamic recover option */
          <div className="max-w-md mx-auto text-center py-16 bg-gray-900/10 border border-gray-900 rounded-xl p-8 space-y-5">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
            <div>
              <h3 className="text-md font-medium text-white">Repository Indexing Interrupted</h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <div className="pt-3 flex flex-col sm:flex-row items-center gap-2 justify-center">
              <button
                onClick={handleToggleMode}
                className="w-full sm:w-auto px-4 py-2 bg-rose-650 hover:bg-rose-600 border border-rose-500/10 text-white rounded-lg text-xs font-semibold cursor-pointer shadow transition"
              >
                Launch Beautiful Demo Mode
              </button>
            </div>
          </div>
        ) : (
          /* Active Interactive Screen panels */
          <div className="space-y-4">
            {activeView === 'albums' && (
              <div className="space-y-8 fade-in">
                {/* 1. Folders drawer */}
                <AlbumGrid
                  photos={photos}
                  activeAlbum={filter.album}
                  onAlbumSelect={(alb) => setFilter({ ...filter, album: alb })}
                />

                {/* 2. Masonry photograph thumbnails portfolio flow */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-900 pb-2">
                    <h2 className="text-xs font-semibold tracking-wider text-rose-400 font-mono uppercase flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-rose-500" />
                      MASTER PHOTOGRAPHY CAROUSEL ({filteredPhotos.length})
                    </h2>
                    <span className="text-[10px] font-mono text-gray-500 text-right">
                      {filter.album !== 'all' ? `FILTER: Album (${filter.album})` : 'Curation Grid'}
                    </span>
                  </div>

                  {filteredPhotos.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900/15 border border-gray-900 rounded-xl max-w-sm mx-auto">
                      <ImageIcon className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                      <h4 className="text-xs font-semibold text-gray-300">No photos matching active matrices</h4>
                      <p className="text-[10px] text-gray-500 mt-1">Try relaxing search keywords or selectors</p>
                    </div>
                  ) : (
                    <div className="masonry-grid">
                      {filteredPhotos.map((photo) => (
                        <PhotoCard
                          key={photo.id}
                          photo={photo}
                          onClick={() => setActivePhoto(photo)}
                          onMetadataLoaded={handlePhotoMetadataLoaded}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeView === 'timeline' && (
              <div className="fade-in">
                <TimelineView
                  photos={filteredPhotos}
                  onPhotoClick={setActivePhoto}
                />
              </div>
            )}

            {activeView === 'map' && (
              <div className="fade-in">
                <MapView
                  photos={filteredPhotos}
                  onPhotoClick={setActivePhoto}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* 3. Immersive Cinematic Lightbox stage */}
      <AnimatePresence>
        {activePhoto && (
          <Lightbox
            photo={activePhoto}
            onClose={() => setActivePhoto(null)}
            onNext={handleNextPhoto}
            onPrev={handlePrevPhoto}
            onSaveAIAnalysis={handlePhotoAIAnalysisSaved}
            hasGeminiKey={serverStatus.hasApiKey}
          />
        )}
      </AnimatePresence>

      {/* Upload Drag-and-Drop modal Drawer overlay */}
      <AnimatePresence>
        {showUploader && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-950 border border-gray-905 rounded-xl p-5 w-full max-w-lg relative shadow-2xl"
            >
              <button
                onClick={() => setShowUploader(false)}
                className="absolute top-4 right-4 p-1.5 bg-gray-900 hover:bg-gray-850 border border-gray-850 hover:border-gray-800 text-gray-400 hover:text-white rounded-lg cursor-pointer transition select-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="mb-4">
                <span className="text-[9px] font-mono uppercase tracking-widest text-rose-500">Local Archive</span>
                <h2 className="font-playfair text-lg text-white font-medium mt-0.5">Upload exhibition files</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Upload photos directly to keep them in this curation grid.
                </p>
              </div>

              <div className="border border-gray-900 bg-gray-950/20 rounded-xl p-1 bg-gray-900/30">
                <Uploader 
                  availableAlbums={availableAlbums}
                  onPhotosUploaded={(newPhotos) => {
                    handlePhotosUploaded(newPhotos);
                    setShowUploader(false);
                  }} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Embed Generator overlay panel */}
      <AnimatePresence>
        {showEmbedGenerator && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-950 border border-gray-905 rounded-xl p-6 w-full max-w-xl relative shadow-2xl text-sans"
            >
              <button
                onClick={() => {
                  setShowEmbedGenerator(false);
                  setCopiedCode(false);
                }}
                className="absolute top-4 right-4 p-1.5 bg-gray-900 hover:bg-gray-850 border border-gray-850 hover:border-gray-800 text-gray-400 hover:text-white rounded-lg cursor-pointer transition select-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="mb-4">
                <span className="text-[9px] font-mono uppercase tracking-widest text-rose-500">EXHIBITION EMBED KIT</span>
                <h2 className="font-playfair text-lg text-white font-medium mt-0.5">Generate Article Iframe</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Embed this clean, photographic gallery inside your substacks, blogs, or news reports.
                </p>
              </div>

              {/* View selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-semibold text-rose-450 font-mono tracking-wider uppercase">1. STARTING SCREEN</h4>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['albums', 'timeline', 'map'] as const).map((view) => (
                      <button
                        key={view}
                        onClick={() => setEmbedStartingView(view)}
                        className={`py-1.5 rounded-lg border text-xs font-mono capitalize transition-all text-center cursor-pointer ${
                          embedStartingView === view
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 font-medium'
                            : 'bg-gray-900 border-gray-900 text-gray-500 hover:text-white hover:border-gray-800'
                        }`}
                      >
                        {view === 'albums' ? 'Grid' : view}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-[10px] font-semibold text-rose-450 font-mono tracking-wider uppercase">2. CONFIGURATION</h4>
                  <div className="bg-gray-900/40 border border-gray-900 rounded-lg p-2.5 text-[10px] font-mono text-gray-400 space-y-0.5">
                    <div>Frame Height: <span className="text-white">600px</span></div>
                    <div>Responsive: <span className="text-green-450">Fluid width (100%)</span></div>
                    <div>Interface: <span className="text-white">Floating Minimal Pill</span></div>
                  </div>
                </div>
              </div>

              {/* Code output snippet */}
              <div className="space-y-2.5 mt-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-gray-400 font-mono">COPY EXIHBITION SNIPPET</span>
                  <button
                    onClick={() => {
                      const embedUrl = `${window.location.origin}${window.location.pathname}?embed=true&view=${embedStartingView}`;
                      const iframeSnippet = `<iframe src="${embedUrl}" width="100%" height="600" style="border:none; border-radius:12px; background:#030712;" allow="geolocation; camera"></iframe>`;
                      navigator.clipboard.writeText(iframeSnippet);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-650 hover:bg-rose-600 text-white rounded-lg text-xs font-sans transition-all cursor-pointer font-medium"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied snippet!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 bg-gray-950 border border-gray-900 rounded-lg text-xs font-mono text-rose-450 break-all select-all select-text selection:bg-rose-500/20 max-h-[120px] overflow-y-auto leading-relaxed">
                  {`<iframe src="${window.location.origin}${window.location.pathname}?embed=true&view=${embedStartingView}" width="100%" height="600" style="border:none; border-radius:12px; background:#030712;" allow="geolocation; camera"></iframe>`}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Right-Click Context Menu */}
      <AnimatePresence>
        {contextMenu.visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              top: Math.min(contextMenu.y, window.innerHeight - 150),
              left: Math.min(contextMenu.x, window.innerWidth - 200),
            }}
            className="fixed z-50 min-w-[190px] bg-gray-950/95 backdrop-blur-md border border-gray-900 rounded-lg shadow-2xl p-1.5 focus:outline-none text-sans font-sans"
          >
            <div className="px-2.5 py-1.5 border-b border-gray-900/60 mb-1 border-t-0 border-l-0 border-r-0">
              <p className="text-[9px] font-mono font-medium text-rose-500 uppercase tracking-widest truncate">
                Photographic Action
              </p>
              <p className="text-[11px] font-semibold text-gray-200 truncate mt-0.5" title={contextMenu.photoName}>
                {contextMenu.photoName}
              </p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(contextMenu.photoUrl);
                setCopiedContext(true);
                setTimeout(() => setCopiedContext(false), 2000);
              }}
              className="w-full text-left px-2.5 py-2 text-xs rounded hover:bg-rose-500/10 hover:text-rose-450 text-gray-300 transition duration-150 flex items-center justify-between gap-2 cursor-pointer select-none border-0"
            >
              <span className="flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5" />
                Copy Image Address
              </span>
              {copiedContext && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            <a
              href={contextMenu.photoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-left px-2.5 py-2 text-xs rounded hover:bg-gray-900 hover:text-white text-gray-300 transition duration-150 flex items-center gap-1.5 cursor-pointer select-none text-decoration-none"
            >
              <Code className="w-3.5 h-3.5 text-gray-500" />
              Open Image in New Tab
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Footer - only display if NOT in embed mode */}
      {!isEmbedMode && (
        <footer className="border-t border-gray-905 py-8 text-center text-xs font-mono text-gray-500 select-none">
        </footer>
      )}
    </div>
  );
}
