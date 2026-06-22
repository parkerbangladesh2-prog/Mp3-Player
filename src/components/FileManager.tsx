import React, { useState, useRef, useEffect } from "react";
import {
  Folder,
  FolderOpen,
  FileAudio,
  FileVideo,
  Plus,
  Play,
  Pause,
  Trash2,
  Video,
  Music,
  Upload,
  Sparkles,
  Volume2,
  VolumeX,
  ExternalLink,
  Maximize2,
  Check,
  Disc,
  FolderPlus,
  Film
} from "lucide-react";
import { SongRecord } from "../types";

export interface VideoRecord {
  id: string;
  title: string;
  url: string;
  duration: string;
  size: string;
  type: string;
  thumbnailUrl: string;
}

interface FileManagerProps {
  songs: SongRecord[];
  onPlaySong: (song: SongRecord) => void;
  onCollectSong: (song: Partial<SongRecord>) => void;
  onDeleteSong: (id: string) => void;
}

export default function FileManager({
  songs,
  onPlaySong,
  onCollectSong,
  onDeleteSong
}: FileManagerProps) {
  // Folder states
  const [currentFolder, setCurrentFolder] = useState<"all" | "music" | "videos">("all");
  
  // Custom video list storage
  const [videoList, setVideoList] = useState<VideoRecord[]>([
    {
      id: "v-1",
      title: "Vaporwave Neon Laser Horizon",
      url: "https://assets.mixkit.co/videos/preview/mixkit-ambient-blue-and-pink-neon-laser-light-background-42171-large.mp4",
      duration: "0:24",
      size: "8.4 MB",
      type: "MP4 Video",
      thumbnailUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80"
    },
    {
      id: "v-2",
      title: "Retro Grid Runner Synth Loop",
      url: "https://assets.mixkit.co/videos/preview/mixkit-retro-futuristic-grid-background-with-laser-lines-42045-large.mp4",
      duration: "0:15",
      size: "4.9 MB",
      type: "MP4 Video",
      thumbnailUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&q=80"
    },
    {
      id: "v-3",
      title: "Spinning Lo-Fi Vinyl Close-Up",
      url: "https://assets.mixkit.co/videos/preview/mixkit-spinning-vinyl-record-player-close-up-vibe-40342-large.mp4",
      duration: "0:12",
      size: "3.2 MB",
      type: "MP4 Video",
      thumbnailUrl: "https://images.unsplash.com/photo-1487180142328-054b783fc471?auto=format&fit=crop&w=300&q=80"
    }
  ]);

  // Player state for active video inside FileManager
  const [activeVideo, setActiveVideo] = useState<VideoRecord | null>(videoList[0]);
  const [videoPlaying, setVideoPlaying] = useState<boolean>(false);
  const [videoMuted, setVideoMuted] = useState<boolean>(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);

  // New item inputs
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<"audio" | "video">("audio");
  const [inputTitle, setInputTitle] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [inputArtist, setInputArtist] = useState("");
  const [inputGenre, setInputGenre] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Update video playing states when video selection changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      if (videoPlaying) {
        videoRef.current.play().catch(() => setVideoPlaying(false));
      }
    }
  }, [activeVideo?.id]);

  // Toggle Play/Pause video
  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (videoPlaying) {
      videoRef.current.pause();
      setVideoPlaying(false);
    } else {
      videoRef.current.play().catch(() => setVideoPlaying(false));
      setVideoPlaying(true);
    }
  };

  // Video metadata listeners
  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setVideoCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration || 0);
    }
  };

  const handleVideoEnded = () => {
    setVideoPlaying(false);
    if (videoRef.current) videoRef.current.currentTime = 0;
  };

  const seekVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setVideoCurrentTime(val);
    }
  };

  const formatVideoTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Handle addition of a harvested track
  const handleCollectItem = () => {
    if (!inputTitle.trim() || !inputUrl.trim()) {
      setErrorMsg("Please specify Title and Audio/Video streaming source URL.");
      return;
    }

    if (addMode === "audio") {
      const freshSong: Partial<SongRecord> = {
        title: inputTitle.trim(),
        artist: inputArtist.trim() || "Independent Collector",
        album: "Collected File Node",
        coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80",
        audioUrl: inputUrl.trim(),
        genre: inputGenre.trim() || "Collected Stream",
        mood: "Focused",
        rating: 9,
        playCount: 1,
        bpm: 105,
        key: "A Minor",
        energy: "Medium",
        tags: ["collected", "file-manager"],
        vibe: ["Fresh"],
        releaseDate: "2026",
        dateAdded: new Date().toISOString().split("T")[0],
        lastPlayed: new Date().toISOString().split("T")[0],
        favorite: true,
        downloaded: false,
        reviewed: false,
        spotifyUrl: "",
        kanbanStatus: "Favorites",
        linkedSongs: []
      };
      
      onCollectSong(freshSong);
      setSuccessMsg("Audio file successfully loaded & synced in your catalog!");
    } else {
      const freshVideo: VideoRecord = {
        id: `v-user-${Date.now()}`,
        title: inputTitle.trim(),
        url: inputUrl.trim(),
        duration: "Stream",
        size: "Network Link",
        type: "MP4 Stream",
        thumbnailUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=300&q=80"
      };

      setVideoList(prev => [freshVideo, ...prev]);
      setActiveVideo(freshVideo);
      setSuccessMsg("Video Stream registered and loaded inside local player!");
    }

    setTimeout(() => {
      setSuccessMsg("");
      setShowAddModal(false);
      setInputTitle("");
      setInputUrl("");
      setInputArtist("");
      setInputGenre("");
    }, 2000);
  };

  // Handling physical file collectors
  const handleLocalCollectionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const objectUrl = URL.createObjectURL(file);

      if (file.type.startsWith("audio/")) {
        const freshSong: Partial<SongRecord> = {
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: "Device Collected Audio",
          album: "Local Storage Vault",
          coverUrl: "https://images.unsplash.com/photo-1487180142328-054b783fc471?auto=format&fit=crop&w=300&q=80",
          audioUrl: objectUrl,
          genre: "Local File",
          mood: "Chill",
          rating: 10,
          playCount: 1,
          bpm: 100,
          key: "C Major",
          energy: "Low",
          tags: ["device-upload", "local-mp3"],
          vibe: ["Offline"],
          releaseDate: "Offline",
          dateAdded: new Date().toISOString().split("T")[0],
          lastPlayed: new Date().toISOString().split("T")[0],
          favorite: true,
          downloaded: true,
          reviewed: false,
          spotifyUrl: "",
          kanbanStatus: "Favorites",
          linkedSongs: []
        };
        onCollectSong(freshSong);
        setSuccessMsg(`Local Audio "${file.name}" collected successfully!`);
        setTimeout(() => setSuccessMsg(""), 3000);
      } else if (file.type.startsWith("video/")) {
        const freshVideo: VideoRecord = {
          id: `v-uploaded-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          url: objectUrl,
          duration: "Local",
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          type: file.type || "Local Video",
          thumbnailUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=300&q=80"
        };
        setVideoList(prev => [freshVideo, ...prev]);
        setActiveVideo(freshVideo);
        setSuccessMsg(`Local Video "${file.name}" loaded successfully!`);
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg("Format unsupported. Please collect standard MP3/Audio or MP4/Video file nodes.");
        setTimeout(() => setErrorMsg(""), 4000);
      }
    }
  };

  const handleDeleteVideo = (ev: React.MouseEvent, id: string) => {
    ev.stopPropagation();
    setVideoList(prev => prev.filter(v => v.id !== id));
    if (activeVideo?.id === id) {
      const rem = videoList.filter(v => v.id !== id);
      setActiveVideo(rem[0] || null);
    }
  };

  return (
    <div id="file-manager-deck" className="space-y-5 text-white pb-6 font-sans">
      
      {/* 1. Interactive Video Player preview screen if active video loaded */}
      {activeVideo && (
        <div className="bg-[#0C0C14] border border-white/5 rounded-2xl overflow-hidden shadow-2xl space-y-2.5 relative">
          
          {/* Header */}
          <div className="px-4 py-2 bg-black/60 border-b border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-pink-400">
              <Film className="h-3.5 w-3.5 text-pink-500 animate-pulse" />
              <span className="font-sans font-bold uppercase tracking-widest text-[10px]">VIDEO ACTIVE DECK</span>
            </div>
            <span className="font-mono text-[9px] text-gray-500">{activeVideo.type} • {activeVideo.size}</span>
          </div>

          {/* Actual video HTML video view */}
          <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
            <video
              ref={videoRef}
              src={activeVideo.url}
              onClick={toggleVideoPlay}
              onTimeUpdate={handleVideoTimeUpdate}
              onLoadedMetadata={handleVideoLoadedMetadata}
              onEnded={handleVideoEnded}
              className="w-full h-full object-contain cursor-pointer"
              playsInline
              muted={videoMuted}
            />

            {/* Custom interactive video play hover button trigger */}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <button
                onClick={toggleVideoPlay}
                className="w-12 h-12 rounded-full bg-pink-600/90 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all cursor-pointer pointer-events-auto"
              >
                {videoPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
              </button>
            </div>

            {/* Video Watermark/Controls labels */}
            {!videoPlaying && (
              <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[9px] font-mono text-gray-300">
                PAUSED
              </div>
            )}
          </div>

          {/* Customized Video track progress scrubber and bottom parameters */}
          <div className="px-4 pb-3.5 pt-1 space-y-2 bg-black/40">
            {/* Range Scrubber info */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-gray-500">{formatVideoTime(videoCurrentTime)}</span>
              <input
                type="range"
                min="0"
                max={videoDuration || 100}
                value={videoCurrentTime}
                onChange={seekVideo}
                className="flex-1 h-1 bg-white/10 rounded appearance-none cursor-pointer accent-pink-500"
              />
              <span className="text-[10px] font-mono text-gray-500">{formatVideoTime(videoDuration)}</span>
            </div>

            {/* Visual sound triggers & Title */}
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-white truncate leading-tight">{activeVideo.title}</h4>
                <p className="text-[9px] text-gray-500 font-mono mt-0.5">ACTIVE SOURCE EXPLORER PATH</p>
              </div>

              {/* Sound mute button */}
              <button
                onClick={() => setVideoMuted(!videoMuted)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                title={videoMuted ? "Unmute Video Audio" : "Mute Video Audio"}
              >
                {videoMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. File Explorer Shell layout with folder filtering tabs */}
      <div className="bg-[#0E0E15] border border-white/5 rounded-2xl p-4 space-y-4 shadow-xl">
        {/* Explorer Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4.5 w-4.5 text-purple-400" />
            <h3 className="font-sans font-bold text-white text-sm">Media File Manager</h3>
          </div>

          {/* Controls to trigger Upload & registration of links */}
          <div className="flex items-center gap-2">
            {/* Native file upload input hidden */}
            <label className="bg-purple-600/20 hover:bg-purple-600/35 text-[11px] font-sans font-semibold text-purple-300 border border-purple-500/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors">
              <Upload className="h-3.5 w-3.5" />
              <span>Import Media</span>
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={handleLocalCollectionUpload}
                className="hidden"
              />
            </label>

            {/* Online URL Modal open button */}
            <button
              onClick={() => {
                setErrorMsg("");
                setSuccessMsg("");
                setShowAddModal(true);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-[11px] font-sans font-semibold text-white px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Collect Link</span>
            </button>
          </div>
        </div>

        {/* Status notification cues */}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-400 animate-slide-in">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-300 animate-slide-in">
            {errorMsg}
          </div>
        )}

        {/* Directory folders navigation list */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setCurrentFolder("all")}
            className={`px-3 py-1.5 rounded-xl border font-sans font-bold transition-all ${
              currentFolder === "all"
                ? "bg-purple-600/10 border-purple-500/30 text-purple-300"
                : "bg-white/[0.01] border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            📂 All Nodes
          </button>
          <button
            onClick={() => setCurrentFolder("music")}
            className={`px-3 py-1.5 rounded-xl border font-sans font-bold transition-all ${
              currentFolder === "music"
                ? "bg-purple-600/10 border-purple-500/30 text-purple-300"
                : "bg-white/[0.01] border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            🎵 Audio (MP3)
          </button>
          <button
            onClick={() => setCurrentFolder("videos")}
            className={`px-3 py-1.5 rounded-xl border font-sans font-bold transition-all ${
              currentFolder === "videos"
                ? "bg-purple-600/10 border-purple-500/30 text-purple-300"
                : "bg-white/[0.01] border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            🎬 Videos
          </button>
        </div>

        {/* Render files dynamically */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          
          {/* A. RENDER VIDEO NODES */}
          {(currentFolder === "all" || currentFolder === "videos") && (
            <div className="space-y-1.5">
              {currentFolder === "all" && videoList.length > 0 && (
                <span className="text-[9px] text-gray-500 font-mono font-bold block pb-1">VIDEO SELECTION NODES</span>
              )}
              {videoList.map(v => {
                const isActive = activeVideo?.id === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => {
                      setActiveVideo(v);
                      setVideoPlaying(true);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? "bg-pink-950/20 border-pink-500/30 text-white"
                        : "bg-[#141421]/30 border-white/[0.02] hover:border-white/5 text-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-black flex items-center justify-center relative shrink-0">
                        <img src={v.thumbnailUrl} className="w-full h-full object-cover opacity-60" />
                        <Play className="h-3 w-3 text-pink-400 absolute fill-current" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate max-w-[170px]">{v.title}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5 flex gap-2 font-mono">
                          <span>{v.duration}</span>
                          <span>•</span>
                          <span>{v.size}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteVideo(e, v.id)}
                      className="p-1.5 text-gray-700 hover:text-red-400 transition-colors rounded-lg cursor-pointer ml-1"
                      title="Remove collected file"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
              {currentFolder === "videos" && videoList.length === 0 && (
                <div className="text-center py-8 text-xs text-gray-500">No collected videos. Import an MP4 link above!</div>
              )}
            </div>
          )}

          {/* Spacer block between folders */}
          {currentFolder === "all" && videoList.length > 0 && songs.length > 0 && <div className="border-t border-white/5 my-3" />}

          {/* B. RENDER AUDIO (MP3) NODES */}
          {(currentFolder === "all" || currentFolder === "music") && (
            <div className="space-y-1.5">
              {currentFolder === "all" && songs.length > 0 && (
                <span className="text-[9px] text-gray-500 font-mono font-bold block pb-1">AUDIO TRACKS REGISTERED ({songs.length})</span>
              )}
              {songs.map(song => (
                <div
                  key={song.id}
                  onClick={() => onPlaySong(song)}
                  className="flex items-center justify-between p-2 rounded-xl border border-white/[0.02] bg-[#141421]/20 hover:border-purple-500/25 text-gray-300 hover:text-white transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={song.coverUrl} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-xs truncate max-w-[200px]">{song.title}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[200px] font-mono">
                        {song.artist} • {song.genre}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      className="px-2 py-1 rounded bg-purple-500/10 hover:bg-purple-500/30 text-purple-300 text-[10px] font-semibold tracking-wide font-mono cursor-pointer transition-colors"
                      title="Play collected MP3 track"
                    >
                      PLAY
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSong(song.id);
                      }}
                      className="p-1.5 text-gray-700 hover:text-red-400 transition-colors rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {currentFolder === "music" && songs.length === 0 && (
                <div className="text-center py-8 text-xs text-gray-500">No audio tracks. drag MP3 files into import zone!</div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* 3. Add Media Link Overlay Modal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0E0E18] border border-white/10 rounded-2xl p-5 max-w-sm w-full space-y-4 animate-slide-up shadow-2xl relative">
            <h4 className="font-sans font-bold text-sm text-white">Harvest Digital Media Link</h4>
            
            {/* Selector mode */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-xl">
              <button
                onClick={() => setAddMode("audio")}
                className={`py-1.5 rounded-lg text-xs font-semibold font-sans transition-colors cursor-pointer ${
                  addMode === "audio" ? "bg-purple-600/30 text-purple-300 border border-purple-500/20" : "text-gray-400"
                }`}
              >
                🎵 Audio (MP3)
              </button>
              <button
                onClick={() => setAddMode("video")}
                className={`py-1.5 rounded-lg text-xs font-semibold font-sans transition-colors cursor-pointer ${
                  addMode === "video" ? "bg-pink-600/30 text-pink-300 border border-pink-500/20" : "text-gray-400"
                }`}
              >
                🎬 Video (MP4)
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-3 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">File Name / Title</label>
                <input
                  type="text"
                  placeholder="e.g. My Custom Lofi Rec..."
                  value={inputTitle}
                  onChange={(e) => setInputTitle(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Stream URL / Path</label>
                <input
                  type="text"
                  placeholder="e.g. https://example.com/file.mp3"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 text-white outline-none font-mono text-[11px]"
                />
              </div>

              {addMode === "audio" && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider">Artist</label>
                    <input
                      type="text"
                      placeholder="Creator Name..."
                      value={inputArtist}
                      onChange={(e) => setInputArtist(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-2 py-1.5 text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider">Genre</label>
                    <input
                      type="text"
                      placeholder="Ambient, Rock..."
                      value={inputGenre}
                      onChange={(e) => setInputGenre(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-2 py-1.5 text-white outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Form actions */}
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 bg-white/5 rounded-xl text-xs font-sans text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCollectItem}
                className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-xs font-sans font-bold text-white transition-all cursor-pointer active:scale-95"
              >
                Collect Media
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
