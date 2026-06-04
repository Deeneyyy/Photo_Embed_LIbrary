/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Photo } from '../types';
import { Calendar, History, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface TimelineViewProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
}

interface DateGroup {
  dateLabel: string; // "April 15, 2025"
  year: string; // "2025"
  monthYear: string; // "April 2025"
  timestamp: number;
  photos: Photo[];
}

export default function TimelineView({ photos, onPhotoClick }: TimelineViewProps) {
  // Sort and group photos
  const groups = useMemo(() => {
    const formattedGroups: Record<string, DateGroup> = {};

    photos.forEach((photo) => {
      // Find representative date taken
      const dateStr = photo.metadata?.dateTaken || '2025-04-10T12:00:00Z'; // Fallback
      let dateObj: Date;
      try {
        dateObj = new Date(dateStr);
      } catch {
        dateObj = new Date();
      }

      const year = dateObj.getFullYear().toString();
      const monthLabel = dateObj.toLocaleDateString(undefined, { month: 'long' });
      const day = dateObj.getDate();
      
      const dateLabel = `${monthLabel} ${day}, ${year}`;
      const monthYear = `${monthLabel} ${year}`;
      const timestamp = dateObj.getTime();

      if (!formattedGroups[dateLabel]) {
        formattedGroups[dateLabel] = {
          dateLabel,
          year,
          monthYear,
          timestamp,
          photos: [],
        };
      }
      formattedGroups[dateLabel].photos.push(photo);
    });

    // Sort groups descending (newer first) and photog records
    return Object.values(formattedGroups)
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((g) => ({
        ...g,
        photos: g.photos.sort((p1, p2) => {
          const t1 = p2.metadata?.dateTaken ? new Date(p2.metadata.dateTaken).getTime() : 0;
          const t2 = p1.metadata?.dateTaken ? new Date(p1.metadata.dateTaken).getTime() : 0;
          return t1 - t2;
        }),
      }));
  }, [photos]);

  if (photos.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-950/20 border border-gray-900 rounded-xl max-w-md mx-auto">
        <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-sm font-medium text-gray-300">No Historical Records Found</h3>
        <p className="text-xs text-gray-500 mt-1">Try relaxing your search filter nodes</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex items-center gap-2 border-b border-gray-900 pb-3">
        <History className="w-4.5 h-4.5 text-rose-500" />
        <h2 className="text-sm font-semibold tracking-wider text-rose-400 font-mono">
          CHRONOLOGICAL MEMORY TIMELINE
        </h2>
      </div>

      <div className="relative border-l border-gray-900 ml-4 md:ml-32 pl-6 md:pl-8 space-y-12">
        {groups.map((group, groupIdx) => (
          <div key={group.dateLabel} className="relative group/timeline">
            {/* Absolute side header for wider screens */}
            <div className="hidden md:block absolute right-full top-0 mr-8 text-right w-24">
              <span className="block text-sm font-semibold text-rose-400 font-mono tracking-tighter">
                {group.dateLabel.split(',')[0]}
              </span>
              <span className="block text-[10px] font-mono text-gray-500">
                {group.year}
              </span>
            </div>

            {/* Micro Dot on lines */}
            <span className="absolute -left-[31px] md:-left-[39px] top-1.5 w-3 h-3 rounded-full bg-rose-500 shadow-lg shadow-rose-950/60 ring-4 ring-gray-950 transition-transform group-hover/timeline:scale-125 duration-300"></span>

            {/* Mobile Header indicator */}
            <div className="md:hidden mb-3">
              <span className="inline-block text-xs font-semibold text-rose-400 font-mono uppercase tracking-wider bg-gray-900 px-2.5 py-1 rounded">
                {group.dateLabel}
              </span>
            </div>

            {/* Photo list nested grids */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {group.photos.map((photo, pIdx) => (
                <motion.div
                  key={photo.id}
                  whileHover={{ y: -3 }}
                  onClick={() => onPhotoClick(photo)}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-950 border border-gray-900 cursor-pointer shadow hover:shadow-xl hover:border-gray-800 transition-all group"
                >
                  <img
                    src={photo.url}
                    alt={photo.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2.5">
                    <span className="text-[9px] font-mono text-rose-400 uppercase tracking-widest">{photo.album}</span>
                    <h4 className="text-xs font-semibold text-white truncate">{photo.name}</h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
