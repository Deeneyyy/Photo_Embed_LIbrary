/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Camera, Github, Filter, MapPin, Calendar, Folder, Search, Settings, HelpCircle, X, ChevronDown, CheckCircle2, Code, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RepoConfig, FilterState } from '../types';

interface HeaderProps {
  activeView: 'albums' | 'timeline' | 'map';
  onViewChange: (view: 'albums' | 'timeline' | 'map') => void;
  config: RepoConfig;
  onConfigChange: (config: RepoConfig) => void;
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  availableAlbums: string[];
  availableYears: string[];
  availableLocations: string[];
  isDemoMode: boolean;
  onToggleMode: () => void;
  isConnected: boolean;
  photoCount: number;
  onOpenEmbedGenerator: () => void;
  onOpenUploader: () => void;
}

export default function Header({
  activeView,
  onViewChange,
  config,
  onConfigChange,
  filter,
  onFilterChange,
  availableAlbums,
  availableYears,
  availableLocations,
  isDemoMode,
  onToggleMode,
  isConnected,
  photoCount,
  onOpenEmbedGenerator,
  onOpenUploader,
}: HeaderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Settings form local state
  const [owner, setOwner] = useState(config.owner);
  const [repo, setRepo] = useState(config.repo);
  const [branch, setBranch] = useState(config.branch);
  const [token, setToken] = useState(config.token || '');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onConfigChange({
      owner: owner.trim(),
      repo: repo.trim(),
      branch: branch.trim() || 'main',
      token: token.trim() || undefined
    });
    setShowSettings(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-md border-b border-gray-900 px-4 md:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col gap-3.5">
        {/* Top bar: Branding & Action controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
          </div>

          {/* Clean presentation & curation controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenUploader}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/40 text-rose-300 rounded-lg text-xs font-mono transition-all cursor-pointer"
              title="Upload Local Photos"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Upload</span>
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-gray-900 hover:bg-gray-850 border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer relative"
              title="Exhibition Context Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Middle Bar: Connection Summary & Search / Filter triggers */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-t border-gray-900/40 pt-2">
          {/* Active Repository details tag */}
          <div className="w-full md:w-auto flex items-center gap-2 text-[11px] font-mono text-gray-400 bg-gray-900/25 px-2.5 py-1.5 rounded-lg border border-gray-900/80">
            <Folder className="w-3.5 h-3.5 text-gray-500" />
            <span className="truncate max-w-[200px]">
              {isDemoMode ? 'archival-labs / cinematic' : `${config.owner} / ${config.repo}`}
            </span>
            <span className="text-gray-700">|</span>
            <span className="text-rose-400/80 truncate">{photoCount} photos</span>
          </div>

          {/* Navigation view tabs */}
          <div className="flex bg-gray-900/60 p-0.5 rounded-lg border border-gray-900 w-full md:w-auto">
            <button
              onClick={() => onViewChange('albums')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${
                activeView === 'albums'
                  ? 'bg-rose-500/10 text-rose-450 border border-rose-500/10 shadow-sm'
                  : 'text-gray-450 hover:text-white'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              Albums
            </button>
            <button
              onClick={() => onViewChange('timeline')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${
                activeView === 'timeline'
                  ? 'bg-rose-500/10 text-rose-450 border border-rose-500/10 shadow-sm'
                  : 'text-gray-450 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Timeline
            </button>
            <button
              onClick={() => onViewChange('map')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${
                activeView === 'map'
                  ? 'bg-rose-500/10 text-rose-450 border border-rose-500/10 shadow-sm'
                  : 'text-gray-450 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Map
            </button>
          </div>
        </div>

        {/* Lower bar: Global fuzzy search input & collapsible filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search images by name, tags, cameras, or location description..."
              value={filter.searchQuery}
              onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
              className="w-full bg-gray-950 border border-gray-900 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-rose-500/50 transition-all font-sans"
            />
            {filter.searchQuery && (
              <button
                onClick={() => onFilterChange({ ...filter, searchQuery: '' })}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 border rounded-lg text-sm transition-all cursor-pointer ${
              showFilters || filter.album !== 'all' || filter.year !== 'all' || filter.location !== 'all'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:bg-gray-850'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {(filter.album !== 'all' || filter.year !== 'all' || filter.location !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filters drawer collapsible tray */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-gray-900 pt-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-900/30 p-3 rounded-lg border border-gray-900/70">
                {/* Album selecting filter */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-gray-400 flex items-center gap-1">
                    <Folder className="w-3 h-3 text-rose-500" /> FILE ALBUM
                  </label>
                  <select
                    value={filter.album}
                    onChange={(e) => onFilterChange({ ...filter, album: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-900 rounded-md py-1.5 px-3 text-xs text-gray-300 focus:outline-none focus:border-rose-500/40"
                  >
                    <option value="all">All Albums (Folders)</option>
                    {availableAlbums.map((alb) => (
                      <option key={alb} value={alb}>
                        {alb}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Year selecting filter */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-rose-500" /> TIMELINE YEAR
                  </label>
                  <select
                    value={filter.year}
                    onChange={(e) => onFilterChange({ ...filter, year: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-900 rounded-md py-1.5 px-3 text-xs text-gray-300 focus:outline-none focus:border-rose-500/40"
                  >
                    <option value="all">All Years</option>
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>
                        Year {yr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location selecting filter */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-500" /> GPS LOCATION
                  </label>
                  <select
                    value={filter.location}
                    onChange={(e) => onFilterChange({ ...filter, location: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-900 rounded-md py-1.5 px-3 text-xs text-gray-300 focus:outline-none focus:border-rose-500/40"
                  >
                    <option value="all">All Locations</option>
                    {availableLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reset trigger helper */}
              {(filter.album !== 'all' || filter.year !== 'all' || filter.location !== 'all' || filter.searchQuery !== '') && (
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => onFilterChange({ searchQuery: '', album: 'all', year: 'all', location: 'all' })}
                    className="text-[10px] font-mono text-rose-400 hover:text-rose-300 underline cursor-pointer"
                  >
                    Clear Active Filter Matrices
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* GitHub configuration Settings Modal/Tray overlay */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-gray-950 border border-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl relative"
              >
                <button
                  onClick={() => setShowSettings(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-rose-500">
                    <Github className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-md font-medium text-white">GitHub Connection Settings</h2>
                    <p className="text-xs text-gray-400 font-mono">Archive dynamic fetching coordinates</p>
                  </div>
                </div>

                <form onSubmit={handleSaveSettings} className="flex flex-col gap-4 text-sm">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400 font-mono">GITHUB TARGET OWNER / USERNAME</label>
                    <input
                      type="text"
                      className="w-full bg-gray-900 border border-gray-800 rounded-md px-3 py-2 text-gray-200 placeholder-gray-600 font-sans focus:outline-none focus:border-rose-500/40 text-xs"
                      placeholder="e.g. deendinesh619"
                      value={owner}
                      onChange={(e) => setOwner(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400 font-mono">REPOSITORY NAME</label>
                    <input
                      type="text"
                      className="w-full bg-gray-900 border border-gray-800 rounded-md px-3 py-2 text-gray-200 placeholder-gray-600 font-sans focus:outline-none focus:border-rose-500/40 text-xs"
                      placeholder="e.g. street-photos"
                      value={repo}
                      onChange={(e) => setRepo(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400 font-mono">TARGET BRANCH NAME</label>
                    <input
                      type="text"
                      className="w-full bg-gray-900 border border-gray-800 rounded-md px-3 py-2 text-gray-200 placeholder-gray-600 font-sans focus:outline-none focus:border-rose-500/40 text-xs"
                      placeholder="e.g. main"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-gray-400 font-mono">PERSONAL ACCESS TOKEN (OPTIONAL)</label>
                      <span className="text-[10px] font-mono text-gray-500">(Bypasses rate limiting)</span>
                    </div>
                    <input
                      type="password"
                      className="w-full bg-gray-900 border border-gray-800 rounded-md px-3 py-2 text-gray-200 placeholder-gray-600 font-sans focus:outline-none focus:border-rose-500/40 text-xs text-clip"
                      placeholder="github_pat_..."
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                    />
                  </div>

                  <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-900 text-[11px] leading-relaxed text-gray-400 flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>
                      Make sure your target repository is <strong>public</strong> and has images inside folders. Our applet handles nesting automatically using high-speed recursive indexing.
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        isDemoMode ? onToggleMode() : null; // toggle from demo to live if needed
                        setOwner('deendinesh619');
                        setRepo('street-photos');
                        setBranch('main');
                      }}
                      className="px-3 py-1.5 text-xs text-rose-450 hover:text-white cursor-pointer"
                    >
                      Fill Example Repo
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-rose-650 hover:bg-rose-600 active:bg-rose-700 text-white rounded-md text-xs font-semibold cursor-pointer shadow-lg shadow-rose-950/40 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Apply & Index Repo
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
