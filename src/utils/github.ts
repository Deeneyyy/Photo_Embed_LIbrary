/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Photo, RepoConfig, PhotoMetadata } from '../types';
// @ts-ignore
import exifr from 'exifr/dist/lite.esm.js';

// Cache for EXIF data to avoid re-fetching
const exifCache: Record<string, PhotoMetadata> = {};

/**
 * Normalizes a image name from file path
 */
function getFilenameWithoutExtension(path: string): string {
  const parts = path.split('/');
  const filename = parts[parts.length - 1];
  return filename.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
}

/**
 * Gets the parent directory name to use as album
 */
function getAlbumName(path: string): string {
  const parts = path.split('/');
  if (parts.length > 1) {
    return parts.slice(0, -1).join(' / ');
  }
  return 'Portfolio'; // Fallback for root photos
}

/**
 * Fetch default branch of a repository
 */
export async function fetchDefaultBranch(
  owner: string,
  repo: string,
  token?: string
): Promise<string> {
  const headers: HeadersInit = {};
  if (token && token.trim()) {
    headers['Authorization'] = `token ${token.trim()}`;
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch repo info from GitHub: ${response.statusText}`);
  }
  const data = await response.json();
  return data.default_branch || 'main';
}

/**
 * Fetches all photos from a public GitHub repository using the dynamic trees recursively.
 */
export async function fetchPhotosFromGithub(config: RepoConfig): Promise<Photo[]> {
  const { owner, repo, token } = config;
  
  // 1. Resolve default branch if not specified or fallback
  let branchName = config.branch;
  if (!branchName) {
    try {
      branchName = await fetchDefaultBranch(owner, repo, token);
    } catch (e) {
      branchName = 'main'; // default safe assumption
    }
  }

  const headers: HeadersInit = {};
  if (token && token.trim()) {
    headers['Authorization'] = `token ${token.trim()}`;
  }

  // Use the recursive git trees API to get everything in 1 call
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branchName}?recursive=1`;
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please provide a Personal Access Token in Settings to bypass.');
    }
    throw new Error(`GitHub repository not found or inaccessible: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.tree || !Array.isArray(data.tree)) {
    throw new Error('Invalid repository structure returned from GitHub.');
  }

  const imageRegex = /\.(jpg|jpeg|png|webp)$/i;
  
  const photos: Photo[] = data.tree
    .filter((file: any) => file.type === 'blob' && imageRegex.test(file.path))
    .map((file: any) => {
      const album = getAlbumName(file.path);
      const name = getFilenameWithoutExtension(file.path);
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branchName}/${file.path}`;
      
      return {
        id: file.sha || file.path,
        name: name,
        url: rawUrl,
        downloadUrl: rawUrl,
        path: file.path,
        album: album,
        size: file.size,
        metadata: undefined, // Will be parsed lazily
        aiAnalysis: null
      };
    });

  return photos;
}

/**
 * Lazily parses EXIF metadata for an individual photo.
 * Falls back gracefully to date attributes/upload metadata on error.
 */
export async function getPhotoMetadata(photo: Photo): Promise<PhotoMetadata> {
  // Return cached metadata if present
  if (exifCache[photo.id]) {
    return exifCache[photo.id];
  }

  const fallbackMeta: PhotoMetadata = {
    dateTaken: null,
    camera: null,
    lens: null,
    gps: null
  };

  try {
    // exifr can parse image URLs directly client-side if CORS is configured (which raw.githubusercontent.com is)
    // We parse with simple properties
    const output = await exifr.parse(photo.url, {
      tiff: true,
      exif: true,
      gps: true,
      interop: false,
      ifd1: false
    });

    if (output) {
      let dateString: string | null = null;
      if (output.DateTimeOriginal) {
        dateString = new Date(output.DateTimeOriginal).toISOString();
      } else if (output.CreateDate) {
        dateString = new Date(output.CreateDate).toISOString();
      } else if (output.ModifyDate) {
        dateString = new Date(output.ModifyDate).toISOString();
      }

      const camera = output.Model || output.Make ? `${output.Make || ''} ${output.Model || ''}`.trim() : null;
      const lens = output.LensModel || output.LensInfo ? (output.LensModel || output.LensInfo).toString().trim() : null;
      
      let gps = null;
      if (output.latitude !== undefined && output.longitude !== undefined) {
        gps = {
          lat: parseFloat(output.latitude),
          lng: parseFloat(output.longitude),
          locationName: undefined // Resolved map-side or lazy looked up
        };
      }

      const metadata: PhotoMetadata = {
        dateTaken: dateString,
        camera: camera,
        lens: lens,
        gps: gps,
        width: output.ExifImageWidth || output.PixelXDimension,
        height: output.ExifImageHeight || output.PixelYDimension
      };

      exifCache[photo.id] = metadata;
      return metadata;
    }
  } catch (error) {
    // console.warn('Could not parse EXIF for', photo.name, error);
  }

  // Graceful fallback: see if we can extract date from title/path or fallback to current
  exifCache[photo.id] = fallbackMeta;
  return fallbackMeta;
}
