/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, RefreshCw, Folder, Plus, Check, Copy, CheckCircle2 } from 'lucide-react';
// @ts-ignore
import exifr from 'exifr/dist/lite.esm.js';
import { Photo, PhotoMetadata } from '../types';

interface UploaderProps {
  onPhotosUploaded: (newPhotos: Photo[]) => void;
  availableAlbums: string[];
}

export default function Uploader({ onPhotosUploaded, availableAlbums }: UploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<string>('Uploaded');
  const [customAlbumName, setCustomAlbumName] = useState<string>('');
  const [uploadedPhotoList, setUploadedPhotoList] = useState<Photo[]>([]);
  const [copiedIds, setCopiedIds] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList) => {
    setIsProcessing(true);
    setErrorMsg(null);
    const validPhotos: Photo[] = [];
    const targetAlbumName = selectedAlbum === '_create_new_'
      ? (customAlbumName.trim() || 'Uploaded')
      : selectedAlbum;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        continue;
      }

      try {
        const id = `uploaded-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Generate an Object URL immediately for speedy local rendering
        const localUrl = URL.createObjectURL(file);

        // Fallback metadata based on file creation date
        let metadata: PhotoMetadata = {
          dateTaken: file.lastModified ? new Date(file.lastModified).toISOString() : null,
          camera: null,
          lens: null,
          gps: null,
        };

        // Try extracting high fidelity EXIF directly on the client
        try {
          const output = await exifr.parse(file, {
            tiff: true,
            exif: true,
            gps: true,
          });

          if (output) {
            let dateString = metadata.dateTaken;
            if (output.DateTimeOriginal) {
              dateString = new Date(output.DateTimeOriginal).toISOString();
            } else if (output.CreateDate) {
              dateString = new Date(output.CreateDate).toISOString();
            }

            const cameraName = output.Model || output.Make 
              ? `${output.Make || ''} ${output.Model || ''}`.trim() 
              : null;
            const lensModel = output.LensModel || output.LensInfo 
              ? (output.LensModel || output.LensInfo).toString().trim() 
              : null;

            let gps = null;
            if (output.latitude !== undefined && output.longitude !== undefined) {
              gps = {
                lat: parseFloat(output.latitude),
                lng: parseFloat(output.longitude),
              };
            }

            metadata = {
              dateTaken: dateString,
              camera: cameraName,
              lens: lensModel,
              gps: gps,
              width: output.ExifImageWidth || output.PixelXDimension,
              height: output.ExifImageHeight || output.PixelYDimension,
            };
          }
        } catch (exifErr) {
          // Carry on with fallback metadata
        }

        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");

        const photoObj: Photo = {
          id: id,
          name: nameWithoutExt,
          url: localUrl,
          downloadUrl: localUrl,
          path: `local-uploads/${file.name}`,
          album: targetAlbumName,
          size: file.size,
          metadata: metadata,
          aiAnalysis: null,
        };

        validPhotos.push(photoObj);
      } catch (err) {
        // Safe check
      }
    }

    if (validPhotos.length > 0) {
      setUploadedPhotoList(validPhotos);
    } else {
      setErrorMsg('No valid images detected. Please provide standard JPEG, WebP, or PNG photos.');
    }

    setIsProcessing(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
    }
  };

  const handleCopyLink = (photo: Photo) => {
    navigator.clipboard.writeText(photo.url);
    setCopiedIds(prev => ({ ...prev, [photo.id]: true }));
    setTimeout(() => {
      setCopiedIds(prev => ({ ...prev, [photo.id]: false }));
    }, 2500);
  };

  // Render Post-Upload Success View
  if (uploadedPhotoList.length > 0) {
    return (
      <div className="space-y-4 p-4 text-sans animate-fade-in">
        <div className="flex items-center gap-3 border-b border-gray-901 pb-3 text-emerald-400">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-white">Upload Successful!</h3>
            <p className="text-[11px] text-gray-400">Processed {uploadedPhotoList.length} photo(s) into album <span className="text-rose-450">"{uploadedPhotoList[0].album}"</span>.</p>
          </div>
        </div>

        <div className="max-h-[220px] overflow-y-auto divide-y divide-gray-900 border border-gray-900 rounded-lg bg-gray-950/40 p-2 space-y-2">
          {uploadedPhotoList.map((photo) => (
            <div key={photo.id} className="flex items-center justify-between gap-3 p-2 first:mt-0">
              <div className="flex items-center gap-2 truncate">
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-10 h-10 object-cover rounded border border-gray-800 shrink-0"
                />
                <div className="truncate">
                  <h4 className="text-xs font-medium text-white truncate">{photo.name}</h4>
                  <p className="text-[9px] font-mono text-gray-500 truncate" title={photo.url}>{photo.url}</p>
                </div>
              </div>

              <button
                onClick={() => handleCopyLink(photo)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-mono cursor-pointer transition select-none shrink-0 ${
                  copiedIds[photo.id]
                    ? 'bg-emerald-950/30 text-emerald-405 border border-emerald-900/50'
                    : 'bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300'
                }`}
              >
                {copiedIds[photo.id] ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Address
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-910">
          <button
            onClick={() => {
              setUploadedPhotoList([]);
              setCustomAlbumName('');
            }}
            className="px-3.5 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-850 border border-gray-850 hover:border-gray-800 rounded-lg cursor-pointer transition select-none"
          >
            Upload More
          </button>
          <button
            onClick={() => {
              onPhotosUploaded(uploadedPhotoList);
            }}
            className="px-4 py-1.5 text-xs text-white bg-rose-650 hover:bg-rose-600 rounded-lg cursor-pointer font-semibold shadow transition select-none"
          >
            Finish & Integrate
          </button>
        </div>
      </div>
    );
  }

  // Render Drag-and-Drop and Album Picker Screen
  return (
    <div className="space-y-4 p-4 text-sans">
      {/* 1. Target Album Picker / Creator row */}
      <div className="bg-gray-900/40 border border-gray-900 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-semibold font-mono text-gray-300 uppercase tracking-wider">Destination Album</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="relative">
            <select
              value={selectedAlbum}
              onChange={(e) => setSelectedAlbum(e.target.value)}
              className="w-full bg-gray-950 border border-gray-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-sans cursor-pointer appearance-none pr-8"
            >
              <option value="Uploaded">Uploaded (Default)</option>
              {availableAlbums.filter(a => a && a !== 'Uploaded').map((album) => (
                <option key={album} value={album}>
                  Existing: {album}
                </option>
              ))}
              <option value="_create_new_">+ Create New Album...</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>

          {selectedAlbum === '_create_new_' && (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Enter new album name..."
                value={customAlbumName}
                onChange={(e) => setCustomAlbumName(e.target.value)}
                className="w-full bg-gray-950 border border-gray-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 placeholder-gray-600 font-sans"
              />
            </div>
          )}
        </div>
        <p className="text-[10px] text-gray-500 font-mono">
          All images uploaded in this batch will be categorised into the selected target folder.
        </p>
      </div>

      {/* 2. Drag & Drop box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed rounded-xl p-8 py-10 text-center cursor-pointer select-none transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
          isDragOver
            ? 'border-rose-500 bg-rose-955/10'
            : 'border-gray-800 bg-gray-900/10 hover:border-gray-750 hover:bg-gray-900/20'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*"
          className="hidden"
        />

        <div className={`p-3 rounded-full border transition-all ${
          isDragOver
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            : 'bg-gray-900 border-gray-805 text-gray-400'
        }`}>
          {isProcessing ? (
            <RefreshCw className="w-5 h-5 animate-spin text-rose-450" />
          ) : (
            <Upload className="w-5 h-5 text-gray-400" />
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-white">
            {isProcessing ? 'Processing Photographic Elements...' : 'Upload local images directly'}
          </h3>
          <p className="text-[11px] text-gray-500 mt-1 font-mono">
            Drag files here or click to browse. Automatically extracts EXIF tags, dates, and locations.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-950/20 border border-rose-900/40 p-3 rounded-lg flex items-start gap-2 text-xs text-rose-400 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
