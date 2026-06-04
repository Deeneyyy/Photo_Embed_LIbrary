/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GPSCoords {
  lat: number;
  lng: number;
  locationName?: string;
}

export interface PhotoMetadata {
  dateTaken: string | null;
  camera: string | null;
  lens: string | null;
  gps: GPSCoords | null;
  width?: number;
  height?: number;
}

export interface Photo {
  id: string;
  name: string;
  url: string; // Direct Github raw URL or asset URL
  downloadUrl: string; // URL for downloading or full quality loading
  path: string;
  album: string; // Folder name
  size?: number;
  metadata?: PhotoMetadata;
  aiAnalysis?: {
    caption: string;
    description: string;
    tags: string[];
    dominantColors: string[];
    mood?: string;
  } | null;
}

export interface Album {
  id: string;
  name: string;
  photoCount: number;
  coverPhotoUrl: string;
  photos: Photo[];
}

export interface FilterState {
  searchQuery: string;
  album: string; // 'all' or album name
  year: string; // 'all' or 4-digit string
  location: string; // 'all' or location name string
}

export interface RepoConfig {
  owner: string;
  repo: string;
  branch: string;
  token?: string;
}

