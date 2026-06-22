import React, { useState } from "react";
import {
  Sparkles,
  Play,
  Heart,
  Download,
  Flame,
  Loader2,
  Tv,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Activity,
  Music
} from "lucide-react";
import { SongRecord } from "../types";
import { DISCOVER_PLAYLISTS } from "../data/songs";

interface DashboardProps {
  songs: SongRecord[];
  onPlaySong: (song: SongRecord) => void;
  onSetView: (view: "database" | "player" | "journal") => void;
  streakCount: number;
}

export default function Dashboard({ songs, onPlaySong, onSetView, streakCount }: DashboardProps) {
  const [activeMood, setActiveMood] = useState<string>("Focused");
  const [recs, setRecs] = useState<string[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  // Weekly stream minutes (rendered in SVG charts)
  const WEEKLY_HOURS = [
    { day: "Mon", minutes: 35 },
    { day: "Tue", minutes: 54 },
    { day: "Wed", minutes: 12 },
    { day: "Thu", minutes: 42 },
    { day: "Fri", minutes: 80 },
    { day: "Sat", minutes: 95 },
    { day: "Sun", minutes: 60 }
  ];

  // Fetch interactive smart recommendations from our backend Gemini proxy
  const handleFetchRecs = async () => {
    setIsLoadingRecs(true);
    setRecs([]);
    try {
      const response = await fetch("/api/gemini/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activeMood: activeMood,
          currentTracks: songs.map((s) => ({ title: s.title, artist: s.artist })),
        }),
      });
      const data = await response.json();
      if (data && data.recommendations) {
        setRecs(data.recommendations);
      } else {
        setRecs(["Echoes of Midnight by Aether Kid", "Sunlight Sonata by Luna Eclipse", "Winter Cello by Whispering Pines"]);
      }
    } catch {
      setRecs(["Sunset Glitch by Retro Kid", "Focus Ambient by Orbit One", "Folk Woods by Pines"]);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  // Quick matches suggestions to play them if they match our active lists
  const handlePlayRecName = (recName: string) => {
    // Check if we can find a matching track in our current offline catalog
    const titleOnly = recName.split(" by ")[0].toLowerCase();
    const found = songs.find((s) => s.title.toLowerCase().includes(titleOnly));
    if (found) {
      onPlaySong(found);
    } else {
      // Create template simulated playback matching the recommendation
      const fakeTrack: SongRecord = {
        id: `fake-${Date.now()}`,
        title: recName.split(" by ")[0] || recName,
        artist: recName.split(" by ")[1] || "Curated Discovery",
        album: "Gemini Curations",
        coverUrl: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=300&q=80",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        genre: "AI Discovery",
        mood: "Focused",
        rating: 9,
        playCount: 1,
        bpm: 98,
        key: "C Major",
        energy: "Medium",
        tags: ["curated", "ai-discovery"],
        vibe: ["Fresh"],
        releaseDate: "2026",
        dateAdded: "2026-06-22",
        lastPlayed: "2026-06-22",
        favorite: true,
        downloaded: false,
        reviewed: false,
        spotifyUrl: "https://spotify.com",
        kanbanStatus: "Listening",
        linkedSongs: [],
      };
      // Play right away
      onPlaySong(fakeTrack);
    }
  };

  return (
    <div id="dashboard-deck" className="space-y-6 text-white pb-10">
      
      {/* 1. Warm Greeting & Streak Badging Panel */}
      <div className="bg-gradient-to-tr from-[#14142B] to-[#0A0A0F] border border-white/5 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden shadow-2xl">
        {/* Background ambient lighting blobs */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-purple-600/10 rounded-full blur-[40px] pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-24 h-24 bg-pink-500/5 rounded-full blur-[30px] pointer-events-none" />

        <div className="space-y-1">
          <h2 className="font-sans font-extrabold text-white text-xl md:text-2xl tracking-tight leading-none">
            Good evening, Listener! 👤
          </h2>
          <p className="font-sans text-xs text-gray-400 font-medium">
            Ready to explore your custom properties and analytical music journals?
          </p>
        </div>

        {/* Streak score badge */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/20 rounded-xl px-4 py-2.5 shadow-md">
          <Flame className="h-5 w-5 text-orange-400 animate-[bounce_1.5s_infinite]" />
          <div>
            <div className="text-[10px] text-orange-300 font-mono font-bold leading-none uppercase">STREAK WEEK</div>
            <div className="text-[15px] text-white font-mono font-bold mt-1 leading-none">
              {streakCount} Active Days
            </div>
          </div>
        </div>
      </div>

      {/* 2. Recently Played Horizontal slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 font-sans">
            Recently Streaming Tracks
          </span>
          <button
            onClick={() => onSetView("database")}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-sans font-semibold cursor-pointer"
          >
            Manage Catalog →
          </button>
        </div>

        {/* Horizontal Card Sliders */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none pr-1">
          {songs.map((song) => (
            <div
              key={song.id}
              className="min-w-[140px] w-[140px] bg-[#121221] border border-white/5 rounded-2xl p-2.5 hover:border-purple-500/20 group transition-all duration-300 relative overflow-hidden shadow"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 shadow-md">
                <img
                  src={song.coverUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                
                {/* Visual playback play hover overlay */}
                <button
                  onClick={() => onPlaySong(song)}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 hover:bg-white text-black flex items-center justify-center transition-colors">
                    <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                  </div>
                </button>
              </div>

              <div className="mt-2 text-left space-y-0.5">
                <h4 className="font-sans font-bold text-xs text-white truncate">{song.title}</h4>
                <p className="font-sans text-[10px] text-gray-500 truncate">{song.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Quick Shortcuts Grid (Favorites, Offline, etc) */}
      <div className="grid grid-cols-2 gap-4">
        <div
          onClick={() => onSetView("database")}
          className="bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-2xl border border-white/5 flex items-center gap-3.5 hover:border-pink-500/20 cursor-pointer shadow transition-all active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
            <Heart className="h-4.5 w-4.5 fill-current" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-sans text-white">Loved list</h4>
            <p className="text-[10px] text-gray-500 mt-0.5 font-mono">
              {songs.filter((s) => s.favorite).length} Properties relation
            </p>
          </div>
        </div>

        <div
          onClick={() => onSetView("journal")}
          className="bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-2xl border border-white/5 flex items-center gap-3.5 hover:border-purple-500/20 cursor-pointer shadow transition-all active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Download className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-sans text-white">Journal logs</h4>
            <p className="text-[10px] text-gray-500 mt-0.5 font-mono">
              Rich markdown review pages
            </p>
          </div>
        </div>
      </div>

      {/* 4. Curated Gemini mood playlist deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Gemini Curated Recommendations Widget */}
        <div className="bg-[#12121F] border border-white/5 rounded-2xl p-5 space-y-4 shadow-2xl relative">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-purple-400 animate-pulse" />
              <h3 className="font-sans font-semibold text-white text-sm">Smart Recommendation IA</h3>
            </div>
            <span className="font-mono text-[9px] text-slate-500">GEMINI CLOUD</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Choose Mood Factor selectors */}
            <div className="space-y-1.5">
              <label className="text-gray-500 font-medium">Select your current listener Vibe</label>
              <div className="flex flex-wrap gap-1.5">
                {["Happy", "Focused", "Energetic", "Chill", "Melancholy"].map((md) => (
                  <button
                    key={md}
                    onClick={() => {
                      setActiveMood(md);
                      setRecs([]);
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-sans font-medium transition-colors cursor-pointer capitalize ${
                      activeMood === md
                        ? "bg-purple-600/20 text-purple-300 border-purple-500/40"
                        : "bg-white/[0.02] border-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    {md}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleFetchRecs}
              disabled={isLoadingRecs}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-95 text-xs text-white py-2 rounded-xl flex items-center justify-center gap-1.5 font-semibold transition-all disabled:opacity-35 cursor-pointer active:scale-98"
            >
              {isLoadingRecs ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                  <span>Curating soundscape...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                  <span>Get Curations</span>
                </>
              )}
            </button>

            {/* Recommendations Result Items */}
            {recs.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/5 transition-all">
                <span className="text-[10px] text-gray-500 font-mono block">GEMINI RECOMMENDATIONS:</span>
                <div className="space-y-1">
                  {recs.map((recText, idx) => (
                    <div
                      key={idx}
                      onClick={() => handlePlayRecName(recText)}
                      className="flex items-center justify-between p-2 rounded-lg bg-black/30 hover:bg-purple-600/10 border border-white/5 text-[11px] text-gray-300 hover:text-white cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Music className="h-3 w-3 text-pink-400" />
                        <span className="font-semibold truncate">{recText}</span>
                      </div>
                      <span className="text-[8px] text-purple-400 font-mono">PLAY TRACK</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Weekly stats SVG bar chart visualizer */}
        <div className="bg-[#12121F] border border-white/5 rounded-2xl p-5 space-y-4 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-pink-400" />
              <h3 className="font-sans font-semibold text-white text-sm">Listening Metrics</h3>
            </div>
            <span className="font-mono text-[9px] text-gray-500 font-semibold uppercase">Weekly Tracking</span>
          </div>

          {/* SVG coordinate drawing bar charts */}
          <div className="flex-1 flex flex-col justify-end min-h-[140px] py-1.5 font-sans">
            <div className="flex items-end justify-between gap-2.5 px-1 pb-2">
              {WEEKLY_HOURS.map((wt) => {
                // Determine heights dynamically relative to max
                const percentage = (wt.minutes / 100) * 100;
                return (
                  <div key={wt.day} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                    <span className="text-[9px] font-mono font-bold text-pink-400">{wt.minutes}m</span>
                    {/* SVG Container or absolute divs */}
                    <div className="w-full relative bg-white/[0.03] rounded-t-lg h-24 overflow-hidden">
                      <div
                        className="bg-gradient-to-t from-purple-600 to-pink-500 rounded-t-lg absolute bottom-0 left-0 right-0 transition-all duration-700 w-full"
                        style={{ height: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">{wt.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
