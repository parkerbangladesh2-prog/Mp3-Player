import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  RotateCcw,
  Volume2,
  VolumeX,
  Languages,
  Info,
  Loader2,
  Sparkles,
  ChevronDown,
  ListMusic,
  Hourglass,
  Sliders,
  Gauge
} from "lucide-react";
import { SongRecord } from "../types";
import { LYRICS_DB } from "../data/songs";

interface NowPlayingProps {
  activeSong: SongRecord;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipNext: () => void;
  onSkipPrevious: () => void;
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  sleepMinutesLeft: number | null;
  setSleepMinutesLeft: (mins: number | null) => void;
  isShuffle: boolean;
  setIsShuffle: (shuf: boolean) => void;
  isRepeat: boolean;
  setIsRepeat: (rep: boolean) => void;
  songPlayList: SongRecord[];
  onPlaySong: (song: SongRecord) => void;
}

export default function NowPlaying({
  activeSong,
  isPlaying,
  onPlayPause,
  onSkipNext,
  onSkipPrevious,
  currentTime,
  duration,
  onSeek,
  playbackSpeed,
  setPlaybackSpeed,
  sleepMinutesLeft,
  setSleepMinutesLeft,
  isShuffle,
  setIsShuffle,
  isRepeat,
  setIsRepeat,
  songPlayList,
  onPlaySong,
}: NowPlayingProps) {
  const [activeTab, setActiveTab] = useState<"lyrics" | "details" | "queue">("lyrics");
  const [lyricsAIResult, setLyricsAIResult] = useState<string>("");
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [showSleepMenu, setShowSleepMenu] = useState<boolean>(false);

  // References to handle lyrics scrolling automatically
  const lyricContainerRef = useRef<HTMLDivElement | null>(null);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const activeLyrics = LYRICS_DB[activeSong.id] || [];

  // Finding the currently highlighted line index
  let activeLyricIdx = -1;
  for (let i = 0; i < activeLyrics.length; i++) {
    if (currentTime >= activeLyrics[i].time) {
      activeLyricIdx = i;
    } else {
      break;
    }
  }

  // Auto-scroll the active lyrics block into view neatly
  useEffect(() => {
    if (lyricContainerRef.current && activeLyricIdx !== -1) {
      const activeEl = lyricContainerRef.current.children[activeLyricIdx] as HTMLElement;
      if (activeEl) {
        lyricContainerRef.current.scrollTo({
          top: activeEl.offsetTop - lyricContainerRef.current.clientHeight / 2 + activeEl.clientHeight / 2,
          behavior: "smooth",
        });
      }
    }
  }, [activeLyricIdx]);

  // Requesting lyrics translation or AI insights
  const handleLyricsAI = async (command: "translate" | "story") => {
    setIsLoadingAI(true);
    setLyricsAIResult("");
    
    // Pick current highlighted snippet, or full
    const currentLine = activeLyrics[activeLyricIdx]?.text || "No current line";
    const snippet = currentLine;

    try {
      const response = await fetch("/api/gemini/lyrics-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: activeSong.title,
          artist: activeSong.artist,
          snippet,
          command,
        }),
      });
      const data = await response.json();
      setLyricsAIResult(data.output || "No analysis available from Gemini.");
    } catch (err) {
      setLyricsAIResult("Failed to query Gemini. Key might be missing, but local offline mode remains active!");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSliderSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(parseFloat(e.target.value));
  };

  return (
    <div id="now-playing-viewport" className="relative flex flex-col h-full bg-[#0A0A0F] text-white overflow-hidden p-6 gap-5">
      {/* Absolute Blurred Background Cover */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10 blur-[80px] pointer-events-none transition-all duration-700 scale-125"
        style={{ backgroundImage: `url(${activeSong.coverUrl})` }}
      />

      {/* Header Info */}
      <div className="flex items-center justify-between z-10">
        <span className="text-xs tracking-widest text-purple-400 font-mono font-medium">SONICNOTE LIVE DECK</span>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono font-medium">Synced Audio Node</span>
        </div>
      </div>

      {/* Center Track Artwork & Interactive Features */}
      <div className="flex flex-col items-center justify-center flex-1 gap-6 z-10 py-2">
        {/* Vinyl Record Layout */}
        <div className="relative group flex items-center justify-center">
          {/* Outer glow aura */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-pink-600/20 rounded-full blur-[30px] opacity-80 group-hover:opacity-100 transition-opacity" />

          {/* Glowing ring */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 opacity-20 blur group-hover:opacity-40 transition" />

          {/* The Vinyl Body */}
          <div
            className={`relative w-52 h-52 md:w-56 md:h-56 rounded-full bg-[#111] border-4 border-white/5 flex items-center justify-center shadow-2xl overflow-hidden transition-all duration-700 cursor-pointer select-none ${
              isPlaying ? "animate-[spin_12s_linear_infinite]" : "rotate-12 scale-98"
            }`}
          >
            {/* Grooves */}
            <div className="absolute inset-2 rounded-full border border-white/[0.03]" />
            <div className="absolute inset-4 rounded-full border border-white/[0.03]" />
            <div className="absolute inset-8 rounded-full border border-white/[0.03]" />
            <div className="absolute inset-12 rounded-full border border-white/[0.04]" />
            <div className="absolute inset-16 rounded-full border border-white/[0.04]" />
            <div className="absolute inset-20 rounded-full border border-white/[0.05]" />

            {/* Inner Center Album Cover */}
            <div className="absolute w-24 h-24 md:w-28 md:h-28 rounded-full border border-black/80 overflow-hidden flex items-center justify-center bg-zinc-900 z-10">
              <img
                src={activeSong.coverUrl}
                alt={activeSong.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {/* Spindle hole */}
              <div className="absolute w-4 h-4 rounded-full bg-[#0A0A0F] border border-white/20 shadow-inner z-20" />
            </div>
          </div>
        </div>

        {/* Dynamic Titles */}
        <div className="text-center space-y-1 max-w-sm">
          <h2 className="font-sans font-bold text-xl md:text-2xl text-white tracking-tight break-all">
            {activeSong.title}
          </h2>
          <p className="font-sans text-sm text-gray-400 font-medium">
            {activeSong.artist} • <span className="text-purple-400">{activeSong.album}</span>
          </p>
        </div>
      </div>

      {/* Progress & Timing */}
      <div className="space-y-2 z-10">
        <div className="flex justify-between items-center text-xs font-mono text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <div className="flex gap-2 items-center text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full font-mono">
            <span>BPM {activeSong.bpm}</span>
            <span>•</span>
            <span className="text-pink-400">{activeSong.key}</span>
          </div>
          <span>{formatTime(duration || 0)}</span>
        </div>

        {/* Progress seek line */}
        <div className="relative group w-full">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSliderSeek}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-pink-500 transition-all cursor-pointer"
          />
        </div>
      </div>

      {/* Playback Controls Panel */}
      <div className="flex flex-col gap-4 z-10 bg-white/[0.02] border border-white/5 rounded-2xl p-4 shadow-xl">
        {/* Main Deck row */}
        <div className="flex items-center justify-between px-2">
          {/* Shuffle button */}
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isShuffle ? "text-purple-400 bg-purple-500/10" : "text-gray-400 hover:text-white"
            }`}
          >
            <Shuffle className="h-4.5 w-4.5" />
          </button>

          {/* Previous Button */}
          <button
            onClick={onSkipPrevious}
            className="p-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
          >
            <SkipBack className="h-6 w-6 fill-current" />
          </button>

          {/* Massive Play/Pause button */}
          <button
            onClick={onPlayPause}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-rose-400 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6 text-white stroke-3 fill-white" />
            ) : (
              <Play className="h-6 w-6 text-white stroke-3 fill-white translate-x-0.5" />
            )}
          </button>

          {/* Next Button */}
          <button
            onClick={onSkipNext}
            className="p-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
          >
            <SkipForward className="h-6 w-6 fill-current" />
          </button>

          {/* Repeat Button */}
          <button
            onClick={() => setIsRepeat(!isRepeat)}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isRepeat ? "text-pink-400 bg-pink-500/10" : "text-gray-400 hover:text-white"
            }`}
          >
            <RotateCcw className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Micro Config Adjusters (Speed, Sleep timer) */}
        <div className="flex items-center justify-around border-t border-white/5 pt-3 text-xs text-gray-400">
          {/* Playback speed trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSpeedMenu(!showSpeedMenu);
                setShowSleepMenu(false);
              }}
              className="flex items-center gap-1 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <Gauge className="h-3.5 w-3.5 text-purple-400" />
              <span>Speed: {playbackSpeed}x</span>
            </button>
            {showSpeedMenu && (
              <div className="absolute bottom-8 left-0 bg-[#161623] border border-white/10 rounded-xl p-1.5 shadow-2xl z-40 min-w-[90px] flex flex-col gap-1">
                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => {
                      setPlaybackSpeed(spd);
                      setShowSpeedMenu(false);
                    }}
                    className={`px-2 py-1 text-left rounded text-xs transition-colors cursor-pointer ${
                      playbackSpeed === spd ? "text-purple-400 bg-purple-500/10 font-bold" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {spd === 1.0 ? "Normal" : `${spd}x`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sleep timer settings */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSleepMenu(!showSleepMenu);
                setShowSpeedMenu(false);
              }}
              className="flex items-center gap-1 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <Hourglass className="h-3.5 w-3.5 text-pink-400" />
              <span>
                {sleepMinutesLeft !== null ? `Sleep: ${sleepMinutesLeft}m` : "Sleep Timer"}
              </span>
            </button>
            {showSleepMenu && (
              <div className="absolute bottom-8 right-0 bg-[#161623] border border-white/10 rounded-xl p-1.5 shadow-2xl z-40 min-w-[100px] flex flex-col gap-1">
                {[null, 5, 15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins === null ? "off" : mins}
                    onClick={() => {
                      setSleepMinutesLeft(mins);
                      setShowSleepMenu(false);
                    }}
                    className={`px-2 py-1 text-left rounded text-xs transition-colors cursor-pointer ${
                      sleepMinutesLeft === mins ? "text-pink-400 bg-pink-500/10 font-bold" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {mins === null ? "Disable" : `${mins} Minutes`}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Panel Sub-deck (Lyrics | Connected Notes | Queue) */}
      <div className="flex-1 flex flex-col min-h-0 z-10 bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        {/* Navigation Tabs */}
        <div className="flex border-b border-white/5 bg-black/30">
          {(["lyrics", "details", "queue"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setLyricsAIResult("");
              }}
              className={`flex-1 py-3 text-xs font-sans font-semibold transition-all border-b-2 cursor-pointer capitalize ${
                activeTab === tab
                  ? "border-purple-500 text-white bg-white/[0.01]"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab === "details" ? "Acoustic AI Details" : tab}
            </button>
          ))}
        </div>

        {/* Tab content viewport */}
        <div className="flex-1 p-4 overflow-y-auto min-h-0 text-sm">
          {activeTab === "lyrics" && (
            <div className="flex flex-col h-full gap-4">
              {/* Lyrics Scrollable block */}
              <div
                ref={lyricContainerRef}
                className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[140px] text-center snap-y"
                style={{ scrollSnapType: "y mandatory" }}
              >
                {activeLyrics.length > 0 ? (
                  activeLyrics.map((lyr, index) => {
                    const active = index === activeLyricIdx;
                    return (
                      <div
                        key={index}
                        onClick={() => onSeek(lyr.time)}
                        className={`py-1.5 px-2 transition-all duration-300 rounded cursor-pointer snap-center ${
                          active
                            ? "text-white text-base font-bold scale-102 bg-white/[0.03]"
                            : "text-gray-500 text-xs scale-98 hover:text-gray-400"
                        }`}
                      >
                        {lyr.text}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-500 text-xs py-8 font-sans">
                    No lyrics synced for this song. Select another track or click below to generate suggestions.
                  </div>
                )}
              </div>

              {/* Gemini Smart Lyrics Prompters */}
              <div className="border-t border-white/5 pt-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1 font-sans">
                    <Sparkles className="h-3 w-3 text-purple-400 animate-pulse" />
                    Interactive Lyrics AI
                  </span>
                  <span className="font-mono text-[9px] text-gray-500">POWERED BY GEMINI 3.5</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleLyricsAI("story")}
                    className="flex-1 bg-purple-600/25 hover:bg-purple-600/35 border border-purple-500/30 text-purple-300 font-sans font-medium text-xs py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    💡 Line Insight
                  </button>
                  <button
                    onClick={() => handleLyricsAI("translate")}
                    className="flex-1 bg-pink-600/25 hover:bg-pink-600/35 border border-pink-500/30 text-pink-300 font-sans font-medium text-xs py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Languages className="h-3.5 w-3.5" />
                    Translate Snip
                  </button>
                </div>

                {isLoadingAI && (
                  <div className="flex items-center gap-2 justify-center py-4 text-xs text-gray-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400" />
                    <span>Gemini is auditing acoustic files...</span>
                  </div>
                )}

                {lyricsAIResult && (
                  <div className="bg-purple-950/25 border border-purple-500/15 rounded-xl p-3 text-xs text-purple-200 font-sans leading-relaxed transition-all">
                    {lyricsAIResult}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <div className="space-y-4 font-sans text-xs text-gray-300">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-2">
                <h4 className="font-semibold text-white">Advanced Metadata Properties</h4>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="bg-black/20 p-2 rounded">
                    <div className="text-gray-500">GENRE</div>
                    <div className="text-purple-300">{activeSong.genre}</div>
                  </div>
                  <div className="bg-black/20 p-2 rounded">
                    <div className="text-gray-500">MOOD</div>
                    <div className="text-pink-300">{activeSong.mood}</div>
                  </div>
                  <div className="bg-black/20 p-2 rounded">
                    <div className="text-gray-500">TEMPO SPEED</div>
                    <div className="text-indigo-300">{activeSong.bpm} BPM</div>
                  </div>
                  <div className="bg-black/20 p-2 rounded">
                    <div className="text-gray-500">KEY SCALE</div>
                    <div className="text-emerald-300">{activeSong.key}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-2">
                <h4 className="font-semibold text-white">Notion Database Linkage</h4>
                <div className="flex flex-wrap gap-1">
                  <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded text-[10px]">
                    Properties: Linked Song count: {activeSong.linkedSongs.length}
                  </span>
                  <span className="bg-pink-500/10 text-pink-300 border border-pink-500/20 px-2 py-0.5 rounded text-[10px]">
                    State: {activeSong.kanbanStatus}
                  </span>
                  {activeSong.notesId && (
                    <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded text-[10px]">
                      Has Backlinked Note ID {activeSong.notesId}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "queue" && (
            <div className="space-y-2">
              <span className="text-[10px] text-gray-500 font-mono block mb-2">UP NEXT PLAYBACK LIST</span>
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                {songPlayList.map((song) => {
                  const current = song.id === activeSong.id;
                  return (
                    <div
                      key={song.id}
                      onClick={() => onPlaySong(song)}
                      className={`flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer ${
                        current
                          ? "bg-purple-500/10 border border-purple-500/20 text-white"
                          : "bg-white/[0.01] hover:bg-white/[0.04] text-gray-400 hover:text-white"
                      }`}
                    >
                      <img
                        src={song.coverUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0 text-left font-sans text-xs">
                        <div className="font-semibold truncate">{song.title}</div>
                        <div className="text-gray-500 truncate">{song.artist}</div>
                      </div>
                      {current && (
                        <span className="text-[10px] text-purple-400 font-mono animate-pulse">PLAYING</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
