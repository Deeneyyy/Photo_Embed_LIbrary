/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { Photo } from '../types';
import L from 'leaflet';
import { MapPin, Image as ImageIcon } from 'lucide-react';

interface MapViewProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
}

export default function MapView({ photos, onPhotoClick }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Filter photos that possess valid GPS coordinates
  const geolocatedPhotos = useMemo(() => {
    return photos.filter((p) => p.metadata?.gps && typeof p.metadata.gps.lat === 'number');
  }, [photos]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 1. Initialize map if not loaded
    if (!mapRef.current) {
      // Find average latitude & longitude to center map
      let centerLat = 35.6762; // Default Tokyo
      let centerLng = 139.6503;
      if (geolocatedPhotos.length > 0) {
        const sumLat = geolocatedPhotos.reduce((acc, p) => acc + (p.metadata?.gps?.lat || 0), 0);
        const sumLng = geolocatedPhotos.reduce((acc, p) => acc + (p.metadata?.gps?.lng || 0), 0);
        centerLat = sumLat / geolocatedPhotos.length;
        centerLng = sumLng / geolocatedPhotos.length;
      }

      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([centerLat, centerLng], geolocatedPhotos.length > 1 ? 3 : 11);

      // Add CartoDB Dark Matter tiles (cinematic dark mode!)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    // 2. Clear old markers
    markersRef.current.forEach((marker) => {
      if (mapRef.current) marker.removeFrom(mapRef.current);
    });
    markersRef.current = [];

    // 3. Populate new circular thumbnail markers
    geolocatedPhotos.forEach((photo) => {
      if (!mapRef.current || !photo.metadata?.gps) return;
      
      const { lat, lng, locationName } = photo.metadata.gps;

      // Unique modern pin: A circular thumbnail with pulse-ring of rose-500 color!
      const iconHtml = `
        <div class="relative w-10 h-10 group flex items-center justify-center">
          <div class="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-25"></div>
          <div class="relative w-8 h-8 rounded-full border-2 border-rose-500 overflow-hidden shadow-lg bg-gray-950 flex items-center justify-center">
            <img src="${photo.url}" alt="${photo.name}" class="w-full h-full object-cover" />
          </div>
          <div class="absolute bottom-[-4px] bg-rose-500 text-[8px] font-mono font-semibold px-1 py-0.2 rounded scale-75 uppercase text-white shadow-md">
            ${photo.album.split(' ')[0]}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-marker-div',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(mapRef.current);

      // Custom pop-up layout with beautiful image frame
      const popupContent = document.createElement('div');
      popupContent.className = 'p-3 flex flex-col gap-2 max-w-[200px] text-gray-200';
      popupContent.innerHTML = `
        <div class="rounded-md overflow-hidden aspect-[3/2] border border-gray-800 bg-gray-950">
          <img src="${photo.url}" class="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity" />
        </div>
        <div>
          <span class="text-[9px] font-mono text-rose-400 font-semibold uppercase block">${photo.album}</span>
          <h4 class="text-xs font-semibold text-white leading-snug truncate mt-0.5">${photo.name}</h4>
          <p class="text-[9px] font-mono text-gray-400 mt-1 flex items-center gap-0.5">
            <span class="text-rose-550">📍</span> ${locationName || `${lat.toFixed(2)}N, ${lng.toFixed(2)}E`}
          </p>
        </div>
        <button class="w-full mt-2 py-1 text-center bg-rose-650 hover:bg-rose-600 text-white rounded text-[10px] font-mono font-semibold transition-all cursor-pointer">
          Open Fullscreen View
        </button>
      `;

      // Assign popup clicks
      const imgCell = popupContent.querySelector('img');
      const actionBtn = popupContent.querySelector('button');

      const handleTrigger = () => {
        onPhotoClick(photo);
      };

      imgCell?.addEventListener('click', handleTrigger);
      actionBtn?.addEventListener('click', handleTrigger);

      marker.bindPopup(popupContent, {
        closeButton: false,
        offset: [0, -10],
      });

      markersRef.current.push(marker);
    });

    // 4. Adjust view bounds if multiple coordinates are loaded
    if (geolocatedPhotos.length > 1 && mapRef.current) {
      const bounds = L.latLngBounds(geolocatedPhotos.map((p) => [p.metadata!.gps!.lat, p.metadata!.gps!.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    // Auto-update Leaflet size (crucial since map size could warp based on display panel toggles)
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [geolocatedPhotos, onPhotoClick]);

  // Handle map cleanups
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-gray-900 pb-2">
        <h2 className="text-sm font-semibold tracking-wider text-rose-400 font-mono flex items-center gap-2">
          <MapPin className="w-4.5 h-4.5" />
          CARTOGRAPHIC PHOTO ATLAS ({geolocatedPhotos.length} PINNED)
        </h2>
        <span className="text-[10px] font-mono text-gray-500">
          Showing coordinates extracted from tiff EXIF datasets
        </span>
      </div>

      {geolocatedPhotos.length === 0 ? (
        <div className="text-center py-20 bg-gray-950/20 border border-gray-900 rounded-xl max-w-md mx-auto">
          <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-300">No Geolocation Coordinates</h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            None of the currently loaded photographs hold EXIF latitude and longitude coordinates. Connect a location-tagged repository to reveal the map.
          </p>
        </div>
      ) : (
        <div ref={mapContainerRef} className="w-full h-[550px] rounded-xl overflow-hidden shadow-2xl border border-gray-900 relative z-10" />
      )}
    </div>
  );
}
