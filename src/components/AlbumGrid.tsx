/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Album, Photo } from '../types';
import { FolderHeart, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface AlbumGridProps {
  photos: Photo[];
  activeAlbum: string;
  onAlbumSelect: (albumName: string) => void;
}

export default function AlbumGrid({ photos, activeAlbum, onAlbumSelect }: AlbumGridProps) {
  // Group photos into structured albums
  const albums = React.useMemo(() => {
    const map: Record<string, Photo[]> = {};
    photos.forEach((photo) => {
      const albName = photo.album || 'Portfolio';
      if (!map[albName]) {
        map[albName] = [];
      }
      map[albName].push(photo);
    });

    return Object.entries(map).map(([name, albumPhotos]) => {
      // Prioritize an image with an AI tag representation, else take the first image
      const coverPhoto = albumPhotos.find((p) => p.url) || albumPhotos[0];
      return {
        id: name,
        name: name,
        photoCount: albumPhotos.length,
        coverPhotoUrl: coverPhoto ? coverPhoto.url : '',
        photos: albumPhotos,
      } as Album;
    });
  }, [photos]);

  if (albums.length === 0) return null;

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between border-b border-gray-900 pb-2">
        <h2 className="text-sm font-semibold tracking-wider text-rose-400 font-mono flex items-center gap-2">
          <FolderHeart className="w-4.5 h-4.5" />
          COLLECTIONS & ALBUMS ({albums.length})
        </h2>
        {activeAlbum !== 'all' && (
          <button
            onClick={() => onAlbumSelect('all')}
            className="text-xs text-rose-550 hover:text-white underline font-mono cursor-pointer"
          >
            Show All Photographic Volumes
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* All Photos cover card */}
        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => onAlbumSelect('all')}
          className={`relative h-40 rounded-xl overflow-hidden border cursor-pointer flex flex-col justify-end p-4 shadow-lg hover:shadow-2xl transition-all ${
            activeAlbum === 'all'
              ? 'border-rose-500/50 ring-2 ring-rose-500/10'
              : 'border-gray-900 bg-gray-950/60 hover:border-gray-800'
          }`}
        >
          {photos.length > 0 && (
            <img
              src={photos[0].url}
              alt="All Photos"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-20 blur-[1px] transition-transform duration-500 hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          <div className="relative z-10">
            <div className="absolute top-[-3.5rem] right-0 p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg">
              <ImageIcon className="w-4 h-4" />
            </div>
            <h3 className="font-playfair text-md font-medium text-white leading-tight">All Memories</h3>
            <p className="text-[10px] font-mono text-gray-400 mt-1">{photos.length} Photographs</p>
          </div>
        </motion.div>

        {/* Folder items */}
        {albums.map((album) => {
          const isSelected = activeAlbum === album.name;
          return (
            <motion.div
              key={album.id}
              whileHover={{ y: -3 }}
              onClick={() => onAlbumSelect(album.name)}
              className={`relative h-40 rounded-xl overflow-hidden border cursor-pointer flex flex-col justify-end p-4 shadow-lg hover:shadow-2xl transition-all ${
                isSelected
                  ? 'border-rose-500/55 ring-2 ring-rose-500/10'
                  : 'border-gray-900 bg-gray-950/60 hover:border-gray-800'
              }`}
            >
              <img
                src={album.coverPhotoUrl}
                alt={album.name}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover opacity-40 transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
              
              <div className="relative z-10 flex flex-col justify-end h-full">
                <span className="self-end p-1 bg-black/60 border border-gray-800 rounded-md mb-auto text-[10px] font-mono text-gray-400 flex items-center gap-1">
                  Qty {album.photoCount}
                </span>

                <div className="flex items-center justify-between gap-1 w-full mt-4">
                  <div className="truncate">
                    <h3 className="font-playfair text-sm md:text-md text-gray-150 leading-tight truncate">
                      {album.name}
                    </h3>
                    <p className="text-[9px] font-mono text-gray-400 mt-0.5">FOLDER ALBUM</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
