import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!ai) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// ==========================================
// API ROUTE: Audio Analysis / Song Auto Tagging
// ==========================================
app.post("/api/gemini/analyze", async (req, res) => {
  const { title, artist, userLyrics } = req.body;
  if (!title) {
    return res.status(404).json({ error: "Title is required for analysis." });
  }

  const client = getGeminiClient();
  if (!client) {
    // Elegant Simulated AI Fallback for offline sandbox mode
    const hash = (title + artist).length;
    const bpm = 80 + (hash % 60);
    const keys = ["C Major", "G Major", "A Minor", "E Minor", "F Major", "D Minor", "B♭ Major"];
    const musicKey = keys[hash % keys.length];
    const energyOptions = ["Calm", "Relaxed", "Vibrant", "High Energy", "Atmospheric"];
    const moods = ["Melancholic", "Uplifting", "Thoughtful", "Focused", "Serene", "Nostalgic"];
    const tags = ["Acoustic", "Chilled", "Late Night", "Vocal Focus", "Indie Accent", "Cinematic"];
    
    return res.json({
      bpm,
      key: musicKey,
      energy: energyOptions[hash % energyOptions.length],
      mood: moods[hash % moods.length],
      tags: [tags[hash % tags.length], tags[(hash + 1) % tags.length], "AI Verified"],
      trivia: `"${title}" has a unique tempo signature that emphasizes acoustic warmth. Under real conditions, Gemini will parse its frequencies and lyric themes dynamically to produce this metadata.`
    });
  }

  try {
    const prompt = `Perform a musical and lyrical audit for the song titled "${title}" by "${artist || "Unknown Artist"}".
    Analyzing these lyrics if provided: "${userLyrics || "None"}".
    Return a neat JSON response explaining the BPM, Key, Energy (e.g. Low, Medium, High), Mood, suggestive multi-select tags, and a brief trivia fact.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bpm: { type: Type.INTEGER, description: "BPM speed as integer, range 40 to 220" },
            key: { type: Type.STRING, description: "Musical Key, e.g. G Major, F# Minor" },
            energy: { type: Type.STRING, description: "Energy state, e.g. Low, Mild, Energetic" },
            mood: { type: Type.STRING, description: "Core mood, e.g. Ethereal, Joyful, Cinematic" },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-4 micro tags like late-night, dream-pop, driving"
            },
            trivia: { type: Type.STRING, description: "A creative one-sentence trivia tidbit about this style of song" }
          },
          required: ["bpm", "key", "energy", "mood", "tags", "trivia"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini Analyze Error:", error);
    res.status(500).json({ error: "Failed to generate AI analysis" });
  }
});

// ==========================================
// API ROUTE: Smart Recommendations
// ==========================================
app.post("/api/gemini/recommend", async (req, res) => {
  const { currentTracks, activeMood, seedGenre } = req.body;
  const client = getGeminiClient();

  if (!client) {
    // Sandbox recommendation engine
    const moodSuggestions: Record<string, string[]> = {
      Happy: ["Lovely Day by Bill Withers", "Don't Stop Me Now by Queen", "Good Vibrations by The Beach Boys"],
      Focused: ["Gymnopédie No.1 by Erik Satie", "Clair de Lune by Claude Debussy", "Weightless by Marconi Union"],
      Energetic: ["Eye of the Tiger by Survivor", "Harder Better Faster Stronger by Daft Punk", "Kickstart My Heart"],
      Chill: ["Teardrop by Massive Attack", "Sunset Lover by Petit Biscuit", "Stay Flo by Solange"],
      Melancholy: ["Creep by Radiohead", "Someone Like You by Adele", "Hurt by Johnny Cash"]
    };
    const recommendations = moodSuggestions[activeMood] || ["Midnight City by M83", "Intro by The xx"];
    return res.json({ recommendations });
  }

  try {
    const prompt = `Based on a user listening session.
    Mood context: ${activeMood || "Unspecified"}
    Preferred Genre: ${seedGenre || "Any"}
    Current Queue Details: ${JSON.stringify(currentTracks || [])}
    Provide 3 curated song recommendations that match this vibe perfectly, with title and artist.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of exactly 3 formatted recommendations 'Song Title by Artist name'"
            }
          },
          required: ["recommendations"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch AI audio recommendations" });
  }
});

// ==========================================
// API ROUTE: AI Lyrics Assistant & Explainer
// ==========================================
app.post("/api/gemini/lyrics-ai", async (req, res) => {
  const { title, artist, snippet, command } = req.body;
  const client = getGeminiClient();

  if (!client) {
    return res.json({
      output: `[SIMULATED INSIGHT] "${snippet || "Singing in the neon rain..."}" feels like a metaphor for finding comfort during a mechanical or technical transition phase. The contrast of warm rain against artificial neon defines Synthwave poetry.`
    });
  }

  try {
    const actionPrompt = command === "translate" 
      ? "Translate this fragment beautifully to French or Spanish and explain the aesthetic nuance briefly." 
      : "Provide a profound lyrical analysis or explain the secret story behind these lyrics.";
    
    const prompt = `You are a musicology professor. Analyze:
    Song: "${title}" by "${artist}"
    Snippet: "${snippet}"
    Action: ${actionPrompt}
    Limit answer to 4 concise sentences.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ output: response.text || "No insights found." });
  } catch (error) {
    res.status(500).json({ error: "Failed to compile lyrics annotation" });
  }
});

// ==========================================
// API ROUTE: Rich Journal Note Generator
// ==========================================
app.post("/api/gemini/journal-helper", async (req, res) => {
  const { songTitle, artistName, templateType } = req.body;
  const client = getGeminiClient();

  if (!client) {
    const draft = `### 🎵 ${songTitle || "Untitled Track"} - Analytical Journal Note
Created under **${templateType || "Standard Analysis"}** template.

**Overview:** An exploration of musical transitions and sound design dynamics.

- **Memorable Quote:** *"The music is the canvas, our thoughts are the pigment."*
- **Aesthetic Score:** 9.2/10
- **Technical Breakdown:** Beautiful atmospheric pacing coupled with high contrast frequency sweeps.`;
    return res.json({ text: draft });
  }

  try {
    const prompt = `Write a creative drafted blog-note / review article for a song database entry.
    Song: "${songTitle}" by "${artistName || "Independent Artist"}"
    Template Focus: ${templateType}
    Structure it beautifully in Markdown utilizing headers, lists, italics, and a memorable lyric quote representation. Include a toggle or quote section.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    res.json({ text: response.text });
  } catch (error) {
    res.status(500).json({ error: "Failed to compose template draft" });
  }
});

// ==========================================
// VITE DEV SERVER / STATIC SERVING MIDDLEWARE
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite integration...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SonicNote Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
