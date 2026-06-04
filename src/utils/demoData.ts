/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Photo } from '../types';

export const DEMO_REPO = {
  owner: 'archival-labs',
  repo: 'cinematic-memories',
  branch: 'main'
};

export const DEMO_PHOTOS: Photo[] = [
  {
    id: 'demo-1',
    name: 'Shibuya Crossing at Midnight',
    url: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=1200&q=80',
    downloadUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80',
    path: 'Japan 25/shibuya_midnight.jpg',
    album: 'Japan 25',
    metadata: {
      dateTaken: '2025-04-12T23:45:00Z',
      camera: 'Leica Q2',
      lens: 'Summilux 28mm f/1.7 ASPH',
      gps: {
        lat: 35.6595,
        lng: 139.7005,
        locationName: 'Shibuya, Tokyo, Japan'
      },
      width: 1200,
      height: 800
    },
    aiAnalysis: {
      caption: 'Moody reflections on wet concrete in Shibuya',
      description: 'A cinematic high-contrast night view of Shibuya, capturing neon light bleed across rain-slicked roads. The framing shows moving silhouettes crossing the white lines under a dome of colorful Tokyo advertising displays.',
      tags: ['Neon', 'Tokyo', 'Rain', 'Night', 'Street', 'Leica'],
      dominantColors: ['#111827', '#E11D48', '#3B82F6', '#FBBF24'],
      mood: 'Cinematic Melancholy'
    }
  },
  {
    id: 'demo-2',
    name: 'Bamboo Forest Morning',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    downloadUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80',
    path: 'Japan 25/arashiyama_morning.jpg',
    album: 'Japan 25',
    metadata: {
      dateTaken: '2025-04-15T07:15:00Z',
      camera: 'Fujifilm X-T5',
      lens: 'XF 35mm f/1.4 R',
      gps: {
        lat: 35.0156,
        lng: 135.6715,
        locationName: 'Kyoto, Japan'
      },
      width: 800,
      height: 1200
    },
    aiAnalysis: {
      caption: 'Soft golden hour rays through towering bamboo stalk groves',
      description: 'Morning rays filtering through vertical bamboo trunks. The lighting highlights the vibrant light greens and deep emerald layers, creating an ethereal, quiet path with subtle depth fog.',
      tags: ['Bamboo', 'Forest', 'Sunlight', 'Kyoto', 'Minimalist', 'Green'],
      dominantColors: ['#065F46', '#22C55E', '#FEF08A', '#1E293B'],
      mood: 'Zen Tranquility'
    }
  },
  {
    id: 'demo-3',
    name: 'Senso-ji Temple Lanterns',
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    downloadUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80',
    path: 'Japan 25/ sensoji_lanterns.jpg',
    album: 'Japan 25',
    metadata: {
      dateTaken: '2025-04-10T19:22:00Z',
      camera: 'Sony Alpha 7R V',
      lens: 'FE 24-70mm f/2.8 GM II',
      gps: {
        lat: 35.7148,
        lng: 139.7967,
        locationName: 'Asakusa, Tokyo'
      },
      width: 1200,
      height: 800
    },
    aiAnalysis: {
      caption: 'Large traditional red paper lantern under temple eaves',
      description: 'Symmetrical shot of the iconic primary lantern at Senso-ji Temple gate. The soft inner glow from the lantern casts warm shadows on the wooden structures and gold inscriptions.',
      tags: ['Temple', 'Tokyo', 'Asakusa', 'Lantern', 'Traditional', 'Red'],
      dominantColors: ['#991B1B', '#F87171', '#0F172A', '#D97706'],
      mood: 'Cultural Elegance'
    }
  },
  {
    id: 'demo-4',
    name: 'Montmartre Steps in Autumn',
    url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    downloadUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80',
    path: 'Paris Archives/montmartre_steps.jpg',
    album: 'Paris Archives',
    metadata: {
      dateTaken: '2024-10-24T15:30:00Z',
      camera: 'Leica M11',
      lens: 'Summicron-M 50mm f/2',
      gps: {
        lat: 48.8867,
        lng: 2.3431,
        locationName: 'Montmartre, Paris, France'
      },
      width: 800,
      height: 1200
    },
    aiAnalysis: {
      caption: 'Empty winding cobblestone steps of Montmartre',
      description: 'Winding steps leading towards Sacré-Cœur, decorated with fallen yellow leaves. Classic vintage iron street lamps frame the cobblestones and traditional Haussmann limestone facade walls.',
      tags: ['Paris', 'Cobblestone', 'Autumn', 'Leica', 'Historical', 'Gold'],
      dominantColors: ['#78350F', '#FEF08A', '#451A03', '#F3F4F6'],
      mood: 'Vintage Romanticism'
    }
  },
  {
    id: 'demo-5',
    name: 'Louvre Pyramid Complex',
    url: 'https://images.unsplash.com/photo-1499856133528-747e6200040f?auto=format&fit=crop&w=1200&q=80',
    downloadUrl: 'https://images.unsplash.com/photo-1499856133528-747e6200040f?q=80',
    path: 'Paris Archives/louvre_pyramid.jpg',
    album: 'Paris Archives',
    metadata: {
      dateTaken: '2024-10-26T21:05:00Z',
      camera: 'Sony Alpha 7R V',
      lens: 'FE 16-35mm f/2.8 GM',
      gps: {
        lat: 48.8606,
        lng: 2.3376,
        locationName: 'Louvre Museum, Paris'
      },
      width: 1200,
      height: 750
    },
    aiAnalysis: {
      caption: 'The glass pyramid glowing hot gold against a dark blue sky',
      description: 'A striking long-exposure photograph centering the illuminated Louvre glass structure. Perfect glassy reflections bounce off the dynamic pool surfaces surrounding the museum entrance.',
      tags: ['architecture', 'Louvre', 'Paris', 'Glass', 'Night', 'Reflection'],
      dominantColors: ['#0B1329', '#E28743', '#1C2541', '#EEF4F8'],
      mood: 'Architectural Grandeur'
    }
  },
  {
    id: 'demo-6',
    name: 'Tower Bridge Foggy Dawn',
    url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
    downloadUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80',
    path: 'London Days/tower_bridge_fog.jpg',
    album: 'London Days',
    metadata: {
      dateTaken: '2024-03-02T06:40:00Z',
      camera: 'Canon EOS R5',
      lens: 'RF 24-105mm f/4 L IS USM',
      gps: {
        lat: 51.5055,
        lng: -0.0754,
        locationName: 'Tower Bridge, London, UK'
      },
      width: 1200,
      height: 800
    },
    aiAnalysis: {
      caption: 'Moody dawn mist swallowing the Gothic arches of Tower Bridge',
      description: 'The iconic shape of London\'s Tower Bridge shrouded in heavy early morning mist. The River Thames remains completely flat, reflecting the pale lavender and soft gray dawn cloud deck.',
      tags: ['London', 'Fog', 'River', 'Bridge', 'Gothic', 'Minimalist'],
      dominantColors: ['#475569', '#94A3B8', '#E2E8F0', '#0F172A'],
      mood: 'Mysterious Solitude'
    }
  },
  {
    id: 'demo-7',
    name: 'Red Telephone Booth in SOHO',
    url: 'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?auto=format&fit=crop&w=1200&q=80',
    downloadUrl: 'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?q=80',
    path: 'London Days/soho_red.jpg',
    album: 'London Days',
    metadata: {
      dateTaken: '2024-03-05T14:15:00Z',
      camera: 'Fujifilm X-T5',
      lens: 'XF 23mm f/2 WR',
      gps: {
        lat: 51.5136,
        lng: -0.1365,
        locationName: 'Soho, London'
      },
      width: 800,
      height: 1200
    },
    aiAnalysis: {
      caption: 'Contrast study of a solitary red telephone cabin',
      description: 'An elegant composition showing London\'s vintage scarlet telephone box adjacent to a dark soot-faced brick townhouse. Soft rain reflections bead details across the black-painted window grids.',
      tags: ['London', 'Red', 'SOHO', 'Vintage', 'Rain', 'Fujifilm'],
      dominantColors: ['#991B1B', '#1E293B', '#475569', '#F1F5F9'],
      mood: 'Urban Noir'
    }
  },
  {
    id: 'demo-8',
    name: 'Manhattan Grid Sunset',
    url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
    downloadUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80',
    path: 'New York Perspectives/manhattanhenge.jpg',
    album: 'New York Perspectives',
    metadata: {
      dateTaken: '2023-05-30T20:12:00Z',
      camera: 'Sony Alpha 7R V',
      lens: 'FE 70-200mm f/2.8 GM OSS II',
      gps: {
        lat: 40.7484,
        lng: -73.9857,
        locationName: '42nd St, New York, NY'
      },
      width: 1200,
      height: 800
    },
    aiAnalysis: {
      caption: 'Perfect golden explosion aligning on a cross street',
      description: 'The spectacular Manhattanhenge phenomenon, where the setting sun aligns directly with the east-west cross streets of the borough grid. Hot gold bursts wrap skyscrapers down the canyon.',
      tags: ['NYC', 'Sunset', 'Street', 'Manhattanhenge', 'Skyscrapers', 'Sony'],
      dominantColors: ['#EA580C', '#0F172A', '#D97706', '#334155'],
      mood: 'Awe-Inspiring Warmth'
    }
  },
  {
    id: 'demo-9',
    name: 'Flatiron Geometry',
    url: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1200&q=80',
    downloadUrl: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?q=80',
    path: 'New York Perspectives/flatiron_blizzard.jpg',
    album: 'New York Perspectives',
    metadata: {
      dateTaken: '2023-12-18T11:00:00Z',
      camera: 'Leica Q2',
      lens: 'Summilux 28mm f/1.7',
      gps: {
        lat: 40.7411,
        lng: -73.9897,
        locationName: 'Flatiron District, NYC'
      },
      width: 800,
      height: 1200
    },
    aiAnalysis: {
      caption: 'Monochrome blizzard swarming the iconic triangle building',
      description: 'A striking nearly black-and-white portrayal of the historical Flatiron Building during an active winter snowstorm. Flurries paint white noise overlaying classic yellow cabs down Fifth Avenue.',
      tags: ['NYC', 'Snow', 'Flatiron', 'Winter', 'Black and White', 'Leica'],
      dominantColors: ['#374151', '#E5E7EB', '#1F2937', '#9CA3AF'],
      mood: 'Chilled Retro-Doc'
    }
  },
  {
    id: 'demo-10',
    name: 'Trastevere Vineyards Alley',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    downloadUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80',
    path: 'Roma Eternal/trastevere_moss.jpg',
    album: 'Roma Eternal',
    metadata: {
      dateTaken: '2024-06-12T17:40:00Z',
      camera: 'Leica M11',
      lens: 'Summilux-M 35mm f/1.4',
      gps: {
        lat: 41.8893,
        lng: 12.4688,
        locationName: 'Trastevere, Rome, Italy'
      },
      width: 800,
      height: 1200
    },
    aiAnalysis: {
      caption: 'Overhanging ivy drapes ancient peach-plaster walls',
      description: 'A cozy medieval Roman alleyway covered in emerald ivy in Trastevere. A solitary blue-painted vintage Vespa coordinates nicely beneath warm terracotta arches.',
      tags: ['Rome', 'Alley', 'Vespa', 'Italy', 'Summer', 'Terracotta'],
      dominantColors: ['#7C2D12', '#065F46', '#FDBA74', '#451A03'],
      mood: 'Sun-drenched Nostalgia'
    }
  }
];
