import { SongRecord, JournalNote, EqualizerPreset, KanbanStatus } from "../types";

export const LYRICS_DB: Record<string, { time: number; text: string }[]> = {
  "1": [
    { time: 0, text: "🎶 (Spacious Retro Synth Intro) 🎶" },
    { time: 5, text: "Visions and sirens, neon glows through the stream..." },
    { time: 12, text: "Cruising down late night, lost inside of a dream." },
    { time: 20, text: "Metropolitan rain washes over our guide," },
    { time: 28, text: "Will you follow me further, or stay locked in inside?" },
    { time: 35, text: "✨ Chorus: Oh, the digital wind is blowing through the grid!" },
    { time: 42, text: "Hiding all of the secrets that we ever hid." },
    { time: 50, text: "We are particles flowing, echoes in the night..." },
    { time: 58, text: "Under violet skylines, moving faster than light." },
    { time: 65, text: "🎶 (Interlude - Resonant Frequency Sweeps) 🎶" },
    { time: 75, text: "Clocks on the highway show twenty-six minutes to dawn," },
    { time: 82, text: "By the time they look closely, our spirits will be gone." }
  ],
  "2": [
    { time: 0, text: "🎸 (Acoustic Guitar Strumming) 🎸" },
    { time: 4, text: "The summer sunshine is dancing on your face..." },
    { time: 10, text: "A peaceful morning, we are escaping the race." },
    { time: 17, text: "Leave behind all your worries, let the saltwater heal," },
    { time: 24, text: "This is the simple emotion that we wanted to feel." },
    { time: 31, text: "☀️ Chorus: Sing to the summer breeze that blows!" },
    { time: 38, text: "Wherever the winding river flows..." },
    { time: 44, text: "We have got time to waste, we have got songs to write," },
    { time: 51, text: "Everything feels so clear, everything feels so bright." }
  ],
  "3": [
    { time: 0, text: "🎻 (Soft Melancholy Cello Prelude) 🎻" },
    { time: 6, text: "Leaves on the concrete, the autumn turns to gray..." },
    { time: 14, text: "You said you'd call me, but there is nothing left to say." },
    { time: 23, text: "I hear your ghost in the echo of this quiet room," },
    { time: 31, text: "A fading memory, slipping out into the gloom." },
    { time: 40, text: "🌧️ Chorus: Why do we always hold onto what hurts us?" },
    { time: 49, text: "Our fragile paper bridges crumble into dust." },
    { time: 58, text: "You are an oceanside, and I am the falling rain..." },
    { time: 67, text: "Washing the shorelines to drown away the pain." }
  ],
  "4": [
    { time: 0, text: "🌌 (Cosmic Atmospheric Resonance) 🌌" },
    { time: 10, text: "Focusing minds, waves of theta engage..." },
    { time: 25, text: "Turning the secrets of each unwritten page." },
    { time: 40, text: "Deep sleep orbits, stars align to create..." },
    { time: 55, text: "Quiet intelligence, expanding past target state." },
    { time: 70, text: "🧬 Chorus: Peaceful echoes of the quantum tide..." },
    { time: 85, text: "Finding the universe that lives on the inside." }
  ]
};

export const INITIAL_SONGS: SongRecord[] = [
  {
    id: "1",
    title: "Midnight Neon",
    artist: "Aether Kid",
    album: "Synthwave Streams Vol I",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    genre: "Synthwave",
    mood: "Chill",
    rating: 9,
    playCount: 142,
    bpm: 112,
    key: "A Minor",
    energy: "Medium",
    tags: ["driving", "neon-haze", "analog-synth"],
    vibe: ["Nostalgia", "Electronic", "Night Walk"],
    releaseDate: "2024-11-18",
    dateAdded: "2026-05-12",
    lastPlayed: "2026-06-20",
    favorite: true,
    downloaded: true,
    reviewed: true,
    spotifyUrl: "https://spotify.com",
    kanbanStatus: "Listening",
    notesId: "n1",
    linkedSongs: ["4"]
  },
  {
    id: "2",
    title: "Summer Reverie",
    artist: "Luna Eclipse",
    album: "Solar Cycles",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    genre: "Dream Pop",
    mood: "Happy",
    rating: 8,
    playCount: 88,
    bpm: 94,
    key: "G Major",
    energy: "High",
    tags: ["optimistic", "warm", "roadtrip"],
    vibe: ["Summer", "Dreamy", "Acoustic Warmth"],
    releaseDate: "2025-06-01",
    dateAdded: "2026-06-01",
    lastPlayed: "2026-06-21",
    favorite: false,
    downloaded: true,
    reviewed: false,
    spotifyUrl: "https://spotify.com",
    kanbanStatus: "To Listen",
    linkedSongs: []
  },
  {
    id: "3",
    title: "Ghost in the Echo",
    artist: "Whispering Pines",
    album: "Timberline Acoustics",
    coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=300&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    genre: "Acoustic Folk",
    mood: "Melancholy",
    rating: 10,
    playCount: 215,
    bpm: 78,
    key: "D Minor",
    energy: "Low",
    tags: ["melancholic", "reflective", "autumn"],
    vibe: ["Cozy", "Rainy Day", "Vocal Focus"],
    releaseDate: "2023-10-04",
    dateAdded: "2026-04-20",
    lastPlayed: "2026-06-18",
    favorite: true,
    downloaded: false,
    reviewed: true,
    spotifyUrl: "https://spotify.com",
    kanbanStatus: "Reviewed",
    notesId: "n2",
    linkedSongs: ["1"]
  },
  {
    id: "4",
    title: "Deep Space Study",
    artist: "Orbit One",
    album: "The Quantum Tide",
    coverUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=300&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    genre: "Ambient Space",
    mood: "Focused",
    rating: 9,
    playCount: 310,
    bpm: 60,
    key: "C Major",
    energy: "Low",
    tags: ["focus", "alpha-waves", "sleep-sound"],
    vibe: ["Study", "Nocturnal", "Astral"],
    releaseDate: "2026-01-10",
    dateAdded: "2026-06-10",
    lastPlayed: "2026-06-22",
    favorite: false,
    downloaded: true,
    reviewed: true,
    spotifyUrl: "https://spotify.com",
    kanbanStatus: "Favorites",
    linkedSongs: ["1"]
  }
];

export const INITIAL_NOTES: JournalNote[] = [
  {
    id: "n1",
    title: "Midnight Neon: Sound Analysis",
    emoji: "⚡",
    coverColor: "from-indigo-900 to-purple-800",
    dateCreated: "2026-06-15",
    linkedSongId: "1",
    tags: ["#synthwave", "#lyrics", "#analysis"],
    content: `# Midnight Neon Analysis

⚡ **Tempo Matrix:** 112 BPM
🔑 **Scale:** A Minor Key

### Critical Impression
An incredibly cinematic, evocative piece. The opening synthesis brings immediate 80s arcade imagery. I love how the vocals sink directly inside the reverb field rather than standing in front of it.

> Quote: "We are particles flowing, echoes in the night..."

- [x] Complete ID3 tag corrections
- [x] Translate lyrics to Spanish
- [ ] Connect with Orbit One ambient relational properties`
  },
  {
    id: "n2",
    title: "Folk Nostalgia in Timberline Acoustics",
    emoji: "🌲",
    coverColor: "from-amber-900 to-stone-800",
    dateCreated: "2026-06-18",
    linkedSongId: "3",
    tags: ["#folk", "#vibe", "#memories"],
    content: `# Timberline Acoustics Album Review
🌲 *A quiet diary entry written during a rainy afternoon.*

This entire record sounds like log cabins and wet tree leaves. "Ghost in the Echo" uses an elegant D-Minor cello sequence that makes everything else fall completely silent.

### Aesthetic Highlights:
- Custom acoustic cello tracking
- Organic string noise left intentional in the mix
- Quiet, raw vocal deliverable

*Highly recommended for focused writing sessions.*`
  }
];

export const EQ_PRESETS: EqualizerPreset[] = [
  { name: "Flat", bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: "Bass Boost", bands: [8, 6, 4, 3, 1, 0, 0, 0, 0, 0] },
  { name: "Treble Boost", bands: [0, 0, 0, 0, 1, 3, 5, 7, 8, 8] },
  { name: "Rock", bands: [5, 3, -1, -3, -1, 1, 3, 5, 5, 4] },
  { name: "Pop", bands: [-2, -1, 1, 3, 4, 3, 1, -1, -2, -2] },
  { name: "Jazz", bands: [4, 2, 1, 2, -1, -1, 0, 1, 3, 2] },
  { name: "Classical", bands: [5, 3, 2, 2, -1, -1, 0, 2, 4, 4] },
  { name: "Electronic", bands: [6, 5, 1, 0, -2, 2, 0, 1, 5, 6] },
  { name: "Vocal Focus", bands: [-3, -4, -2, 1, 4, 5, 5, 3, 1, -1] }
];

export const DISCOVER_PLAYLISTS = [
  { id: "p1", title: "Midnight Car Drive", description: "Smooth electronic and darkwave waves", count: 18, color: "from-purple-900 to-indigo-950" },
  { id: "p2", title: "Acoustic Warmth & Tea", description: "Soft guitars, cello sweeps and crisp vocals", count: 12, color: "from-amber-950 to-orange-900" },
  { id: "p3", title: "Astral Theta Waves", description: "Perfect deep concentration frequency noise", count: 6, color: "from-emerald-950 to-teal-900" }
];
