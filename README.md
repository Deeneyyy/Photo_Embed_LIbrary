# GitHub Photo Archive Viewer & Cinematic Museum

A professional, minimal, and highly cinematic digital photo archiving app inspired by Google Photos and documentary portfolios. This application pulls content recursively from any public GitHub repository folder structure, turning nested folders into distinct albums and presenting items across interactive Gallery Grid, chronological Timeline, and geographical Mapping interfaces.

---

## 🌟 Key Features

1. **Incremental GitHub Synchronization**: Connects dynamically to any public GitHub repository. By using the Git Trees API, it indexes the entire directories in exactly **one API call** to keep operations extremely fast and highly respectful of GitHub REST limits.
2. **Dynamic Folder-Based Albums**: Detects repository directories automatically, grouping images into distinct thematic albums (e.g. `Japan 25`, `Paris Archives`) with custom cover wrappers.
3. **Immersive Cinematic Gallery**: High-performance responsive thumbnail masonry with lazy loading, and micro-hover magnification highlighting metadata metrics (taken date, camera body, GPS coordinates).
4. **Hierarchical Timeline**: Sorts photographs in chronological descending sequences and groups them under sticky headers (Year, Month, and Day).
5. **Interactive Mapping**: Automatically extracts latitude and longitude coordinates from photo EXIF tags, plotting them as custom circular thumbnail markers on a Dark Matter Leaflet.js map.
6. **AI Analysis & Tagging (Gemini PRO)**: Integrated server-side API endpoints proxying `gemini-3.5-flash` with 100% security context. On demand, it generates semantic tagging lists, poetic captions, mood evaluations, and color chips representing dominant palettes from photograph pixels.

---

## 🛠️ Technology Stack

- **Client Frame**: React 19, TypeScript, Tailwind CSS, Framer Motion (`motion/react`)
- **Backend Frame**: Node.js Express Server, Vite Dev integration middleware
- **Mapping Engine**: Leaflet.js, OpenStreetMap (CartoDB Dark Matter tiles)
- **Metadata Parser**: `exifr` (efficient client-side binary header reader)
- **AI Integration**: Google GenAI SDK (`@google/genai` on Node.js using `gemini-3.5-flash`)

---

## 📂 Project Architecture

```
├── README.md               # User manual and configuration guide
├── metadata.json           # Cloud deployment rules & major capabilities
├── package.json            # Node dependency scripts
├── server.ts               # Express middle-tier proxy & Vite middleware runner
├── tsconfig.json           # Strict TypeScript rules
├── vite.config.ts          # Vite bundler parameters
├── src/
│   ├── App.tsx             # Master React container (state cache, filters, fallbacks)
│   ├── index.css           # Global typography styles & custom Leaflet overrides
│   ├── main.tsx            # React entry
│   ├── types.ts            # Core TypeScript models and coordinate interfaces
│   ├── components/
│   │   ├── AlbumGrid.tsx   # Folder-based collection covers and stats
│   │   ├── PhotoCard.tsx   # Individual thumbnail cards with EXIF lazy-resolving
│   │   ├── TimelineView.tsx#Chronological sticky year/month layout
│   │   ├── MapView.tsx     # Leaflet container with custom div-icon image markers
│   │   ├── Lightbox.tsx    # Cinematic fullscreen stage & Gemini profiling trigger
│   │   └── Header.tsx      # Multi-parameter navigation & GitHub configurator
│   └── utils/
│       ├── demoData.ts     # Curated fallback photography datasets (Unsplash)
│       └── github.ts       # GitHub Trees API and EXIF extraction hooks
```

---

## 🔑 Environment Variables & Secrets

Create a `.env` file in your root folder (or add secrets in Google AI Studio panel):

```env
# Google Gemini API Key - Required for the AI Analysis features
GEMINI_API_KEY="AI_STUDIO_INJECTED_KEY"

# Public Hosting Application URL (Optional)
APP_URL="http://localhost:3000"
```

---

## 📦 Local Setup Instructions

### 1. Close and Install Dependencies
```bash
npm install
```

### 2. Launch Development Server
```bash
npm run dev
```
This spawns the full-stack server running on standard port `http://localhost:3000`.

### 3. Build Production Target
To bundle the frontend resources into high-performance distribution targets and pre-compile the Node intermediate layer with esbuild:
```bash
npm run build
npm run start
```

---

## 🐙 Configuring Your GitHub Repository

1. Organize your photographs in folders inside a public GitHub repository. Subfolders under root will become albums automatically!
2. Inside **Memory Box settings dialog** (top-right gear action), input your:
   - **GitHub Owner** (the account username)
   - **Repository Name**
   - **Target Branch** (usually `main` or `master`)
3. **Optional Token**: If you plan to index large reservoirs (hundreds of images) regularly, provide a GitHub Personal Access Token (PAT). This increases your IP rate limit from 60 calls/hour to 5000 calls/hour automatically.
