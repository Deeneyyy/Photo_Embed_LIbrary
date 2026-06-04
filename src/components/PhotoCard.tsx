/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Photo, PhotoMetadata } from '../types';
import { getPhotoMetadata } from '../utils/github';
import { Aperture, MapPin, Calendar, Camera } from 'lucide-react';
import { motion } from 'motion/react';

interface PhotoCardProps {
  key?: string;
  photo: Photo;
  onClick: () => void;
  onMetadataLoaded?: (photoId: string, metadata: PhotoMetadata) => void;
}

export default function PhotoCard({ photo, onClick, onMetadataLoaded }: PhotoCardProps) {
  const [metadata, setMetadata] = useState<PhotoMetadata | undefined>(photo.metadata);
  const [isLoadingMeta, setIsLoadingMeta] = useState(!photo.metadata);

  useEffect(() => {
    let active = true;
    if (photo.metadata) {
      setMetadata(photo.metadata);
      setIsLoadingMeta(false);
      return;
    }

    const loadMeta = async () => {
      try {
        const meta = await getPhotoMetadata(photo);
        if (active) {
          setMetadata(meta);
          setIsLoadingMeta(false);
          if (onMetadataLoaded) {
            onMetadataLoaded(photo.id, meta);
          }
        }
      } catch (err) {
        // Safe to ignore, fallback handled
      }
    };

    loadMeta();

    return () => {
      active = false;
    };
  }, [photo, onMetadataLoaded]);

  // Clean formatting of date Taken
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Date Unknown';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Date Unknown';
    }
  };

  return (
    <motion.div
      layoutId={`photo-wrapper-${photo.id}`}
      onClick={onClick}
      className="masonry-item relative group overflow-hidden bg-gray-950 rounded-lg border border-gray-900 cursor-pointer shadow-lg hover:shadow-2xl hover:border-gray-800 transition-all duration-300"
    >
      {/* Img frame */}
      <div className="relative overflow-hidden aspect-auto w-full max-h-[500px]">
        <img
          src={photo.url}
          alt={photo.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          data-context-url={photo.url}
          data-context-name={photo.name}
          className="w-full h-auto object-cover transition-transform duration-700 ease-out scale-100 group-hover:scale-105"
        />
        
        {/* Cinematic dark mask on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
          <div className="text-white space-y-2">
            <span className="text-[10px] font-mono text-rose-400 bg-rose-950/40 border border-rose-900/40 px-2 py-0.5 rounded uppercase tracking-wider">
              {photo.album}
            </span>
            <h3 className="font-playfair text-md font-medium tracking-tight text-gray-150 leading-tight">
              {photo.name}
            </h3>

            {/* Quick Metadata highlights */}
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] font-mono text-gray-400 border-t border-gray-800/80 pt-2">
              {metadata?.camera && (
                <span className="flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-gray-500" />
                  {metadata.camera}
                </span>
              )}
              {metadata?.gps?.locationName || metadata?.gps && (
                <span className="flex items-center gap-1 text-rose-300">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {metadata.gps.locationName || `${metadata.gps.lat.toFixed(3)}, ${metadata.gps.lng.toFixed(3)}`}
                </span>
              )}
              {metadata?.dateTaken && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  {formatDate(metadata.dateTaken)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card text label for screenreaders/scrolling when not hovered */}
      <div className="p-3.5 flex justify-between items-start gap-2 group-hover:opacity-60 transition-opacity bg-gray-950">
        <div className="truncate">
          <h4 className="text-xs font-semibold text-gray-200 truncate">{photo.name}</h4>
          <p className="text-[10px] font-mono text-gray-500 mt-0.5">{photo.album}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] font-mono text-gray-500 block">
            {metadata ? metadata.camera?.split(' ')[0] || 'Leica' : 'Analyzing...'}
          </span>
          <span className="text-[9px] font-mono text-gray-600 block">
            {metadata?.dateTaken ? new Date(metadata.dateTaken).getFullYear() : '2025'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
