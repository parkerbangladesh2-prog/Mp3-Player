import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  Database,
  BookOpen,
  Sliders,
  Settings,
  ChevronDown,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Upload,
  Sparkles,
  Download,
  AlertCircle,
  Clock,
  Battery,
  Wifi,
  Smartphone,
  Check,
  FolderOpen,
  ExternalLink
} from "lucide-react";
import { SongRecord, JournalNote, KanbanStatus, MoodType, ViewType } from "./types";
import { INITIAL_SONGS, INITIAL_NOTES } from "./data/songs";
import Dashboard from "./components/Dashboard";
import NotionDatabase from "./components/NotionDatabase";
import Equalizer from "./components/Equalizer";
import RichJournal from "./components/RichJournal";
import NowPlaying from "./components/NowPlaying";
import FileManager from "./components/FileManager";

export default function App() {
  // Global State Stores
  const [songs, setSongs] = useState<SongRecord[]>(INITIAL_SONGS);
  const [notes, setNotes] = useState<JournalNote[]>(INITIAL_NOTES);
  const [activeTab, setActiveTab] = useState<"home" | "database" | "journal" | "equalizer" | "settings" | "files">("home");
  const [activeSong, setActiveSong] = useState<SongRecord>(INITIAL_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(100);

  // Audio Playback parameters state
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [sleepMinutesLeft, setSleepMinutesLeft] = useState<number | null>(null);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string>("Flat");
  const [bandValues, setBandValues] = useState<number[]>(Array(10).fill(0));

  // Visual Customizations
  const [accentColor, setAccentColor] = useState<"purple" | "blue" | "rose">("purple");
  const [layoutDensity, setLayoutDensity] = useState<"compact" | "comfortable" | "spacious">("comfortable");
  const [hardwareOutput, setHardwareOutput] = useState<"speaker" | "wired" | "bluetooth">("speaker");
  const [isBluetoothConnected, setIsBluetoothConnected] = useState<boolean>(true);
  const [showFullPlayerScreen, setShowFullPlayerScreen] = useState<boolean>(false);

  // File Importer variables
  const [pasteAudioUrl, setPasteAudioUrl] = useState<string>("");
  const [pasteAudioTitle, setPasteAudioTitle] = useState<string>("");
  const [pasteAudioArtist, setPasteAudioArtist] = useState<string>("");
  const [importerStatsMsg, setImporterStatsMsg] = useState<string>("");

  // Simulated Time in mobile top screen
  const [simDate, setSimDate] = useState<string>("09:41");

  // HTML5 audio Ref references
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch top clock parameters
  useEffect(() => {
    const clockTimer = setInterval(() => {
      const now = new Date();
      const hrs = now.getHours().toString().padStart(2, "0");
      const mins = now.getMinutes().toString().padStart(2, "0");
      setSimDate(`${hrs}:${mins}`);
    }, 30000);

    const now = new Date();
    setSimDate(`${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`);
    
    return () => clearInterval(clockTimer);
  }, []);

  // Audio Element instantiation
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    // Track state listeners
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 100);
    };

    const handleAudioEnded = () => {
      handleSkipToNextTrack(true);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleAudioEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleAudioEnded);
      audio.pause();
    };
  }, []);

  // Handle source path loading
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Save previous playing status
    const wasPlaying = isPlaying;

    audio.src = activeSong.audioUrl;
    audio.playbackRate = playbackSpeed;
    audio.load();

    if (wasPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      setCurrentTime(0);
    }
  }, [activeSong.id]);

  // Handle Play/Pause toggles
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Handle speed scaling
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Countdowns sleep timers ticks
  useEffect(() => {
    if (sleepMinutesLeft === null) return;
    if (sleepMinutesLeft <= 0) {
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
      setSleepMinutesLeft(null);
      return;
    }

    const timer = setInterval(() => {
      setSleepMinutesLeft((prev) => (prev ? prev - 1 : null));
    }, 60000);

    return () => clearInterval(timer);
  }, [sleepMinutesLeft]);

  // Playing functions
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkipToNextTrack = (endedAutomatic: boolean = false) => {
    const currentIndex = songs.findIndex((s) => s.id === activeSong.id);
    let nextIdx = currentIndex;

    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * songs.length);
    } else if (isRepeat && endedAutomatic) {
      // Stay on same track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
      return;
    } else {
      nextIdx = (currentIndex + 1) % songs.length;
    }

    const targetSong = songs[nextIdx] || songs[0];
    setActiveSong(targetSong);
    setIsPlaying(true);
  };

  const handleSkipToPreviousTrack = () => {
    const currentIndex = songs.findIndex((s) => s.id === activeSong.id);
    let prevIdx = (currentIndex - 1 + songs.length) % songs.length;
    
    // Choose shuffle alternatively
    if (isShuffle) {
      prevIdx = Math.floor(Math.random() * songs.length);
    }

    const targetSong = songs[prevIdx] || songs[0];
    setActiveSong(targetSong);
    setIsPlaying(true);
  };

  const handleSeekSeconds = (sec: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = sec;
      setCurrentTime(sec);
    }
  };

  // Direct play from child list view
  const handlePlayDirectSong = (song: SongRecord) => {
    setActiveSong(song);
    setIsPlaying(true);
    setShowFullPlayerScreen(true);
  };

  // Database additions / edits
  const handleUpdateSongRecord = (updatedSong: SongRecord) => {
    setSongs((prev) => prev.map((s) => (s.id === updatedSong.id ? updatedSong : s)));
    // Sync active if currently selected
    if (activeSong.id === updatedSong.id) {
      setActiveSong(updatedSong);
    }
  };

  const handleAddNewSongRecord = (newSongData: Partial<SongRecord>) => {
    const fresh: SongRecord = {
      ...(newSongData as SongRecord),
      id: `song-${Date.now()}`
    };
    setSongs((prev) => [...prev, fresh]);
  };

  const handleDeleteSongRecord = (songId: string) => {
    setSongs((prev) => prev.filter((s) => s.id !== songId));
    if (activeSong.id === songId) {
      const fallback = songs.find((s) => s.id !== songId) || INITIAL_SONGS[0];
      setActiveSong(fallback);
    }
  };

  // Journal additions / edits
  const handleAddNewNote = (note: JournalNote) => {
    setNotes((prev) => [note, ...prev]);
  };

  const handleUpdateNote = (note: JournalNote) => {
    setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  // Drag and Drop Drag events
  const handleLocalFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith("audio/")) {
        const objectUrl = URL.createObjectURL(file);
        
        // Build new manual track record pointing to local blob url
        const userTrack: SongRecord = {
          id: `local-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ""), // remove ext
          artist: "Device Import Source",
          album: "Local Storage Vault",
          coverUrl: "https://images.unsplash.com/photo-1487180142328-054b783fc471?auto=format&fit=crop&w=300&q=80",
          audioUrl: objectUrl,
          genre: "Offline Audio",
          mood: "Focused",
          rating: 8,
          playCount: 1,
          bpm: 100,
          key: "C Major",
          energy: "Low",
          tags: ["device-file", "offline-sync"],
          vibe: ["Offline"],
          releaseDate: "2026-06",
          dateAdded: new Date().toISOString().split("T")[0],
          lastPlayed: new Date().toISOString().split("T")[0],
          favorite: true,
          downloaded: true,
          reviewed: false,
          spotifyUrl: "",
          kanbanStatus: "Favorites",
          linkedSongs: [],
        };

        setSongs((prev) => [userTrack, ...prev]);
        setActiveSong(userTrack);
        setIsPlaying(true);
        setImporterStatsMsg(`Successfully loaded local track: "${file.name}"!`);
        setTimeout(() => setImporterStatsMsg(""), 5000);
      } else {
        setImporterStatsMsg("Invalid format. Please drag a valid .mp3, .ogg or .wav audio track.");
        setTimeout(() => setImporterStatsMsg(""), 5000);
      }
    }
  };

  // Custom import URL paste
  const handlePasteImportUrl = () => {
    if (!pasteAudioUrl.trim() || !pasteAudioTitle.trim()) {
      setImporterStatsMsg("Please provide at least a Title and valid MP3 track link URL.");
      return;
    }

    const pasteTrack: SongRecord = {
      id: `paste-${Date.now()}`,
      title: pasteAudioTitle.trim(),
      artist: pasteAudioArtist.trim() || "Independent Creator",
      album: "Curation Streams Link",
      coverUrl: "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?auto=format&fit=crop&w=300&q=80",
      audioUrl: pasteAudioUrl.trim(),
      genre: "Online stream",
      mood: "Chill",
      rating: 9,
      playCount: 12,
      bpm: 110,
      key: "G Major",
      energy: "Mild",
      tags: ["curated-stream"],
      vibe: ["Fresh"],
      releaseDate: "2026",
      dateAdded: new Date().toISOString().split("T")[0],
      lastPlayed: new Date().toISOString().split("T")[0],
      favorite: false,
      downloaded: false,
      reviewed: false,
      spotifyUrl: "",
      kanbanStatus: "To Listen",
      linkedSongs: [],
    };

    setSongs((prev) => [pasteTrack, ...prev]);
    setActiveSong(pasteTrack);
    setIsPlaying(true);
    setPasteAudioUrl("");
    setPasteAudioTitle("");
    setPasteAudioArtist("");
    setImporterStatsMsg("Network stream added and active!");
    setTimeout(() => setImporterStatsMsg(""), 4000);
  };

  // Backlink playing handler from journals
  const handlePlaySongById = (id: string) => {
    const found = songs.find((s) => s.id === id);
    if (found) {
      setActiveSong(found);
      setIsPlaying(true);
      setShowFullPlayerScreen(true);
    }
  };

  // JSON Database Backups Exports
  const handleExportBackup = () => {
    const backupContent = {
      songs,
      notes,
      exportedAt: new Date().toISOString(),
      accentColor
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupContent, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `SonicNote_CloudBackup_${Date.now()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  // JSON Database Backups Imports
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.songs && parsed.notes) {
            setSongs(parsed.songs);
            setNotes(parsed.notes);
            if (parsed.accentColor) setAccentColor(parsed.accentColor);
            setImporterStatsMsg("Backup restored successfully into offline engine!");
            setTimeout(() => setImporterStatsMsg(""), 4000);
          } else {
            setImporterStatsMsg("Invalid backup payload format.");
          }
        } catch {
          setImporterStatsMsg("Failed to parse backup JSON file.");
        }
      };
      reader.readAsText(files[0]);
    }
  };

  const getThemeAccentClass = () => {
    return accentColor === "purple"
      ? "from-purple-500 to-indigo-500 hover:shadow-purple-500/20"
      : accentColor === "rose"
      ? "from-pink-500 to-rose-500 hover:shadow-pink-500/20"
      : "from-sky-500 to-blue-500 hover:shadow-sky-500/20";
  };

  const getActiveTextGradient = () => {
    return accentColor === "purple"
      ? "text-purple-400"
      : accentColor === "rose"
      ? "text-pink-400"
      : "text-sky-400";
  };

  return (
    <div className="min-h-screen bg-[#060609] flex items-center justify-center p-4 md:p-8 overflow-y-auto selection:bg-purple-500/30 font-sans">
      
      {/* Outer physical Desktop background display */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* Main Bezel device mockup of smartphone */}
      <div className="w-full max-w-[420px] aspect-[9/19] bg-[#0A0A0F] border-[8px] border-zinc-800 rounded-[48px] shadow-[0_0_80px_rgba(0,0,0,0.8)] relative flex flex-col overflow-hidden select-none">
        
        {/* Notch elements bar top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-12 h-1 bg-black rounded-full" />
        </div>

        {/* Status System bar panel */}
        <div className="pt-7 px-6 pb-2 flex items-center justify-between text-[11px] font-mono text-gray-400 z-40 bg-black/40">
          <span className="font-bold">{simDate}</span>
          <div className="flex items-center gap-1.5 pb-0.5">
            <Wifi className="h-3 w-3" />
            <span className="text-[10px]">5G</span>
            <Battery className="h-3 w-3 text-emerald-400 fill-emerald-400" />
          </div>
        </div>

        {/* Simulated Importer alerts messages overlay */}
        {importerStatsMsg && (
          <div className="absolute top-16 left-4 right-4 z-50 bg-[#161625] border border-purple-500/20 rounded-xl p-3 flex gap-2 items-start text-xs text-purple-200 animate-slide-in shadow-xl">
            <AlertCircle className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
            <span>{importerStatsMsg}</span>
          </div>
        )}

        {/* Central main page viewport containers */}
        <div className="flex-1 overflow-y-auto p-5 pb-24 min-h-0 space-y-6">
          
          {/* Active page loaders */}
          {activeTab === "home" && (
            <Dashboard
              songs={songs}
              onPlaySong={handlePlayDirectSong}
              onSetView={(v) => {
                if (v === "database") setActiveTab("database");
                if (v === "journal") setActiveTab("journal");
              }}
              streakCount={14}
            />
          )}

          {activeTab === "database" && (
            <div className="space-y-6">
              {/* Device Drag Importer panel inside database tab */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleLocalFileDrop}
                className="border-2 border-dashed border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-purple-500/20 rounded-2xl p-6 text-center transition-all cursor-pointer group relative"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload className="h-8 w-8 text-purple-500 group-hover:animate-bounce" />
                  <span className="text-xs font-sans font-bold text-gray-300">Drag & Drop Music File</span>
                  <span className="text-[10px] text-gray-500 font-mono">SUPPORTS MP3, WAV, M4A, OGG</span>
                </div>
              </div>

              {/* URL Stream Link Importer expander */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3.5">
                <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest font-semibold block">IMPORT STREAMING MUSIC URL</span>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Streaming MP3 Link URL..."
                    value={pasteAudioUrl}
                    onChange={(e) => setPasteAudioUrl(e.target.value)}
                    className="w-full bg-[#121223] border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Song Title..."
                      value={pasteAudioTitle}
                      onChange={(e) => setPasteAudioTitle(e.target.value)}
                      className="bg-[#121223] border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Creator Name..."
                      value={pasteAudioArtist}
                      onChange={(e) => setPasteAudioArtist(e.target.value)}
                      className="bg-[#121223] border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 outline-none"
                    />
                  </div>
                  <button
                    onClick={handlePasteImportUrl}
                    className="w-full bg-purple-600/30 hover:bg-purple-600/50 text-[11px] font-sans font-semibold text-purple-300 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Load Curation Node
                  </button>
                </div>
              </div>

              <NotionDatabase
                songs={songs}
                onPlaySong={handlePlayDirectSong}
                onUpdateSong={handleUpdateSongRecord}
                onAddNewSong={handleAddNewSongRecord}
                onDeleteSong={handleDeleteSongRecord}
              />
            </div>
          )}

          {activeTab === "journal" && (
            <RichJournal
              notes={notes}
              songs={songs}
              onAddNewNote={handleAddNewNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onPlaySongById={handlePlaySongById}
            />
          )}

          {activeTab === "files" && (
            <FileManager
              songs={songs}
              onPlaySong={handlePlayDirectSong}
              onCollectSong={handleAddNewSongRecord}
              onDeleteSong={handleDeleteSongRecord}
            />
          )}

          {activeTab === "equalizer" && (
            <Equalizer
              isPlaying={isPlaying}
              activePreset={activePreset}
              setActivePreset={setActivePreset}
              bandValues={bandValues}
              setBandValues={setBandValues}
            />
          )}

          {activeTab === "settings" && (
            <div className="space-y-6 text-xs text-gray-300 font-sans">
              
              {/* UI Accent selectors */}
              <div className="bg-[#12121F] border border-white/5 rounded-2xl p-4 space-y-3.5 shadow-2xl">
                <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest block">Appearance Theme Accent</span>
                <div className="grid grid-cols-3 gap-2">
                  {(["purple", "rose", "blue"] as const).map((color) => {
                    const active = accentColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => setAccentColor(color)}
                        className={`py-2 rounded-xl text-[11px] font-semibold tracking-wide border cursor-pointer capitalize transition-all ${
                          active
                            ? "bg-white/5 border-purple-500 text-white"
                            : "bg-white/[0.01] border-white/5 text-gray-500 hover:text-white"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Density options */}
              <div className="bg-[#12121F] border border-white/5 rounded-2xl p-4 space-y-3.5 shadow-2xl">
                <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest block">Layout Grid density</span>
                <div className="grid grid-cols-3 gap-2">
                  {(["compact", "comfortable", "spacious"] as const).map((den) => {
                    const active = layoutDensity === den;
                    return (
                      <button
                        key={den}
                        onClick={() => setLayoutDensity(den)}
                        className={`py-2 rounded-xl text-[11px] font-semibold border cursor-pointer capitalize transition-all ${
                          active
                            ? "bg-white/5 border-pink-500 text-white"
                            : "bg-white/[0.01] border-white/5 text-gray-500 hover:text-white"
                        }`}
                      >
                        {den}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Output Audio routing select */}
              <div className="bg-[#12121F] border border-white/5 rounded-2xl p-4 space-y-3.5 shadow-2xl">
                <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest block">Audiophiles routing output</span>
                <div className="flex flex-col gap-2 font-sans font-medium text-xs">
                  <label className="flex items-center gap-3 bg-black/20 p-2.5 rounded-xl border border-white/5 cursor-pointer">
                    <input
                      type="radio"
                      name="hardwareOutput"
                      checked={hardwareOutput === "speaker"}
                      onChange={() => setHardwareOutput("speaker")}
                      className="accent-purple-500"
                    />
                    <span>Device Internal Speaker</span>
                  </label>
                  <label className="flex items-center gap-3 bg-black/20 p-2.5 rounded-xl border border-white/5 cursor-pointer">
                    <input
                      type="radio"
                      name="hardwareOutput"
                      checked={hardwareOutput === "wired"}
                      onChange={() => setHardwareOutput("wired")}
                      className="accent-pink-500"
                    />
                    <span>Hi-Res Wired Headphone (AVPlayer Core)</span>
                  </label>
                  <label className="flex items-center gap-3 bg-black/20 p-2.5 rounded-xl border border-white/5 cursor-pointer">
                    <input
                      type="radio"
                      name="hardwareOutput"
                      checked={hardwareOutput === "bluetooth"}
                      onChange={() => setHardwareOutput("bluetooth")}
                      className="accent-sky-500"
                    />
                    <span>Sonic Bluetooth Link</span>
                  </label>
                </div>
              </div>

              {/* Exports JSON Database Backups Panel */}
              <div className="bg-[#12121F] border border-white/5 rounded-2xl p-4 space-y-3.5 shadow-2xl">
                <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest block">Secure Backups & Portability</span>
                <div className="space-y-2">
                  <button
                    onClick={handleExportBackup}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-xs text-white py-2.5 rounded-xl font-sans font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    Download JSON Backup
                  </button>

                  <div className="relative">
                    <label className="w-full bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-gray-300 py-2.5 rounded-xl font-sans font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                      <Upload className="h-4 w-4" />
                      Restore JSON Backup
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportBackup}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Netlify Deployment Assistant Panel */}
              <div className="bg-[#12121F] border border-white/5 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/10 rounded-full blur-[24px] pointer-events-none" />
                
                <div className="flex items-center gap-1.5 text-teal-400">
                  <ExternalLink className="h-4 w-4" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Netlify Deploy Assistant</span>
                </div>

                <p className="text-[11px] text-gray-300 leading-relaxed font-sans">
                  আমরা আপনার জন্য একটি <code className="bg-white/5 px-1 rounded text-teal-300 font-mono text-[10px]">netlify.toml</code> ফাইল তৈরি করেছি যা আপনার সাইটটিকে ঝামেলাহীনভাবে ডেপ্লয় করবে এবং রুট রিফ্রেশ এরর (404) প্রতিরোধ করবে।
                </p>

                <div className="p-3 bg-black/40 rounded-xl space-y-2 text-[11px] font-sans text-gray-400 border border-white/[0.02]">
                  <div className="flex gap-2">
                    <span className="text-teal-400 font-bold">1. Build Command:</span>
                    <span className="text-white font-mono text-[10px]">npm run build</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-teal-400 font-bold">2. Publish Dir:</span>
                    <span className="text-white font-mono text-[10px]">dist</span>
                  </div>
                  <div className="flex flex-col gap-1 pt-1 border-t border-white/5">
                    <span className="text-teal-400 font-bold text-[10px] uppercase">Environment Key:</span>
                    <p className="text-gray-300 text-[10px]">
                      Netlify-এর Site settings-এ গিয়ে <code className="bg-white/10 px-1 rounded text-white font-mono text-[9px]">GEMINI_API_KEY</code> নামে আপনার এপিআই কী-টি যুক্ত করুন।
                    </p>
                  </div>
                </div>

                <a
                  href="https://app.netlify.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-teal-600 hover:bg-teal-500 text-xs text-white py-2 rounded-xl font-sans font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors animate-pulse"
                >
                  Go to Netlify
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Small Bottom Floating Music player sheet snippet bar */}
        <div className="absolute bottom-16 left-4 right-4 z-40 bg-[#121221]/95 backdrop-blur border border-white/10 rounded-2xl p-2 flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <img
            src={activeSong.coverUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-xl object-cover shrink-0 cursor-pointer"
            onClick={() => setShowFullPlayerScreen(true)}
          />
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => setShowFullPlayerScreen(true)}
          >
            <h5 className="font-sans font-bold text-xs text-white truncate text-left">{activeSong.title}</h5>
            <p className="font-sans text-[10px] text-gray-500 truncate text-left">{activeSong.artist}</p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Play pause toggle */}
            <button
              onClick={handlePlayPause}
              className="p-1.5 rounded-full text-white bg-purple-600 hover:bg-purple-500 cursor-pointer active:scale-95 transition-all"
            >
              {isPlaying ? (
                <Pause className="h-3.5 w-3.5 fill-current" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current translate-x-0.5" />
              )}
            </button>
            <button
              onClick={() => setShowFullPlayerScreen(true)}
              className="p-1.5 text-gray-400 hover:text-white cursor-pointer"
            >
              <ChevronDown className="h-4.5 w-4.5 rotate-180" />
            </button>
          </div>
        </div>

        {/* Dynamic slides Full-Screen sheet slide view player */}
        {showFullPlayerScreen && (
          <div className="absolute inset-0 z-50 bg-[#0A0A0F] text-white flex flex-col justify-between overflow-hidden animate-slide-up">
            {/* Close full screen panel bar top */}
            <div className="pt-8 px-6 pb-2 flex items-center justify-between bg-black/40 border-b border-white/5">
              <button
                onClick={() => setShowFullPlayerScreen(false)}
                className="p-2 -ml-2 text-gray-400 hover:text-white bg-white/5 rounded-xl cursor-pointer"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <span className="text-xs font-mono text-gray-400">{activeSong.title}</span>
              <div className="w-8 h-8" /> {/* spacer */}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              <NowPlaying
                activeSong={activeSong}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onSkipNext={() => handleSkipToNextTrack(false)}
                onSkipPrevious={handleSkipToPreviousTrack}
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeekSeconds}
                playbackSpeed={playbackSpeed}
                setPlaybackSpeed={setPlaybackSpeed}
                sleepMinutesLeft={sleepMinutesLeft}
                setSleepMinutesLeft={setSleepMinutesLeft}
                isShuffle={isShuffle}
                setIsShuffle={setIsShuffle}
                isRepeat={isRepeat}
                setIsRepeat={setIsRepeat}
                songPlayList={songs}
                onPlaySong={handlePlayDirectSong}
              />
            </div>
          </div>
        )}

        {/* Simulated Bevel home control pill navigator buttons bottom */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-32 h-1 bg-zinc-700 rounded-full z-40" />

        {/* Bottom Tab pill navigator selection tray */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-black/90 backdrop-blur border-t border-white/5 z-30 flex items-center justify-around px-2">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === "home" ? getActiveTextGradient() : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Home className="h-4.5 w-4.5" />
            <span className="text-[9px] font-sans font-medium tracking-tight">Home</span>
          </button>

          <button
            onClick={() => setActiveTab("database")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === "database" ? getActiveTextGradient() : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Database className="h-4.5 w-4.5" />
            <span className="text-[9px] font-sans font-medium tracking-tight">Library</span>
          </button>

          <button
            onClick={() => setActiveTab("files")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === "files" ? getActiveTextGradient() : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <FolderOpen className="h-4.5 w-4.5" />
            <span className="text-[9px] font-sans font-medium tracking-tight">Files</span>
          </button>

          <button
            onClick={() => setActiveTab("journal")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === "journal" ? getActiveTextGradient() : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <BookOpen className="h-4.5 w-4.5" />
            <span className="text-[9px] font-sans font-medium tracking-tight">Journals</span>
          </button>

          <button
            onClick={() => setActiveTab("equalizer")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === "equalizer" ? getActiveTextGradient() : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Sliders className="h-4.5 w-4.5" />
            <span className="text-[9px] font-sans font-medium tracking-tight">EQ Engine</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === "settings" ? getActiveTextGradient() : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Settings className="h-4.5 w-4.5" />
            <span className="text-[9px] font-sans font-medium tracking-tight">Settings</span>
          </button>
        </div>

      </div>
    </div>
  );
}
