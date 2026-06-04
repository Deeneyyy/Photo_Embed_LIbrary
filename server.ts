/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create shared Gemini client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API endpoints FIRST

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!apiKey && apiKey !== 'MY_GEMINI_API_KEY',
  });
});

// AI Image Analyzer proxy route
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Please provide a valid imageUrl in the request body.' });
    }

    if (!ai) {
      return res.status(400).json({
        error: 'Gemini API Key is not configured on the server. Please add your GEMINI_API_KEY in the Secrets panel in AI Studio.',
        fallback: true
      });
    }

    let base64Data = '';
    let contentType = 'image/jpeg';

    if (imageUrl.startsWith('data:')) {
      const matches = imageUrl.match(/^data:([^;]+);base64,(.*)$/);
      if (matches) {
        contentType = matches[1];
        base64Data = matches[2];
      } else {
        throw new Error('Invalid data URI format.');
      }
    } else {
      // Fetch the image
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to retrieve image: ${imageResponse.statusText}`);
      }

      contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
      const arrayBuffer = await imageResponse.arrayBuffer();
      base64Data = Buffer.from(arrayBuffer).toString('base64');
    }

    // Call Gemini 3.5 Flash for cinematic descriptive profiling
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: contentType,
          },
        },
        {
          text: 'Analyze this photograph for a professional, cinematic archival collection. Describe the visual details, mood, recommend 4-8 thematic/color tags, and name the dominant historical colors. Provide a brief 1-sentence caption and a slightly deep poetic/documentary description.',
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            caption: {
              type: Type.STRING,
              description: 'A brief, elegant 1-sentence caption describing the photo.',
            },
            description: {
              type: Type.STRING,
              description: 'A poetic, narrative, or documentary descriptive paragraph about the photo (2-3 sentences).',
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '4 to 8 thematic or atmospheric tags (e.g., Monochrome, Rain, Evening, Leica).',
            },
            dominantColors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of 3-5 hex color codes representing dominant colors.',
            },
            mood: {
              type: Type.STRING,
              description: 'The overall emotional tone or atmospheric mood of the photo (e.g., Nostalgic, Stoic, Calm, High-Contrast).',
            },
          },
          required: ['caption', 'description', 'tags', 'dominantColors', 'mood'],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Gemini returned an empty description.');
    }

    const analysisRaw = JSON.parse(responseText.trim());
    res.json(analysisRaw);

  } catch (error: any) {
    console.error('Gemini image analysis error:', error);
    res.status(500).json({
      error: `Failed to analyze photograph: ${error.message || error}`,
      fallback: true
    });
  }
});

// Vite or Static file hosting setup (only when NOT deployed on Vercel)
if (!process.env.VERCEL) {
  if (process.env.NODE_ENV !== 'production') {
    createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    }).then((vite) => {
      app.use(vite.middlewares);
    }).catch((err) => {
      console.error('Failed to create Vite development middleware:', err);
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server fully initialized and running on http://localhost:${PORT}`);
  });
}

export default app;
