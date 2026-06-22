import React, { useState } from "react";
import {
  Table as TableIcon,
  Kanban,
  Grid,
  List,
  Calendar as CalendarIcon,
  Star,
  Play,
  ArrowUpDown,
  Filter,
  Plus,
  Trash2,
  ListPlus,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Search
} from "lucide-react";
import { SongRecord, KanbanStatus, ViewType, MoodType } from "../types";

interface NotionDatabaseProps {
  songs: SongRecord[];
  onPlaySong: (song: SongRecord) => void;
  onUpdateSong: (song: SongRecord) => void;
  onAddNewSong: (song: Partial<SongRecord>) => void;
  onDeleteSong: (id: string) => void;
}

export default function NotionDatabase({
  songs,
  onPlaySong,
  onUpdateSong,
  onAddNewSong,
  onDeleteSong,
}: NotionDatabaseProps) {
  const [activeView, setActiveView] = useState<ViewType>("table");
  const [sortBy, setSortBy] = useState<keyof SongRecord>("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterMood, setFilterMood] = useState<string>("All");
  const [filterGenre, setFilterGenre] = useState<string>("All font");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isUpdatingAI, setIsUpdatingAI] = useState<string | null>(null);

  // Notion database structure presets
  const KANBAN_COLUMNS: KanbanStatus[] = ["To Listen", "Listening", "Favorites", "Reviewed", "Archived"];
  const MOODS: MoodType[] = ["Happy", "Focused", "Energetic", "Chill", "Melancholy"];

  // Sort and filter computation
  const handleSort = (field: keyof SongRecord) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const processedSongs = [...songs]
    .filter((song) => {
      // Mood matching filter
      if (filterMood !== "All" && song.mood !== filterMood) return false;
      // Search term matching
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase();
        return (
          song.title.toLowerCase().includes(query) ||
          song.artist.toLowerCase().includes(query) ||
          song.album.toLowerCase().includes(query) ||
          song.genre.toLowerCase().includes(query) ||
          song.tags.some((t) => t.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (typeof aVal === "boolean" && typeof bVal === "boolean") {
        return sortOrder === "asc" ? (aVal === bVal ? 0 : aVal ? 1 : -1) : (aVal === bVal ? 0 : aVal ? -1 : 1);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortOrder === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

  // Flow handlers to change pipeline / board columns
  const moveKanban = (songId: string, currentStatus: KanbanStatus, direction: "prev" | "next") => {
    const matchedIdx = KANBAN_COLUMNS.indexOf(currentStatus);
    let targetIdx = matchedIdx + (direction === "next" ? 1 : -1);
    if (targetIdx >= 0 && targetIdx < KANBAN_COLUMNS.length) {
      const found = songs.find((s) => s.id === songId);
      if (found) {
        onUpdateSong({
          ...found,
          kanbanStatus: KANBAN_COLUMNS[targetIdx],
        });
      }
    }
  };

  // Auto tag a song using server-side Gemini analysis API proxy
  const triggerAutoAITag = async (song: SongRecord) => {
    setIsUpdatingAI(song.id);
    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: song.title,
          artist: song.artist,
        }),
      });
      const data = await response.json();
      if (data && !data.error) {
        onUpdateSong({
          ...song,
          bpm: data.bpm || song.bpm,
          key: data.key || song.key,
          energy: data.energy || song.energy,
          mood: (data.mood as MoodType) || song.mood,
          tags: data.tags || song.tags,
        });
      }
    } catch (e) {
      console.warn("AI tagging failed. Fallback operational.");
    } finally {
      setIsUpdatingAI(null);
    }
  };

  // Create a brand new record inside our Notion catalog from list
  const handleAddNewRecord = () => {
    const templateRow: Partial<SongRecord> = {
      title: `Draft Track #${songs.length + 1}`,
      artist: "Independent Creator",
      album: "Local Single",
      coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      genre: "Electronica",
      mood: "Focused",
      rating: 8,
      playCount: 1,
      bpm: 100,
      key: "C Major",
      energy: "Medium",
      tags: ["dynamic", "draft"],
      vibe: ["Fresh"],
      releaseDate: new Date().toISOString().split("T")[0],
      dateAdded: new Date().toISOString().split("T")[0],
      lastPlayed: new Date().toISOString().split("T")[0],
      favorite: false,
      downloaded: false,
      reviewed: false,
      spotifyUrl: "https://spotify.com",
      kanbanStatus: "To Listen",
      linkedSongs: [],
    };
    onAddNewSong(templateRow);
  };

  return (
    <div className="bg-[#0D0D15] rounded-2xl border border-white/5 overflow-hidden flex flex-col gap-4 shadow-xl p-4">
      
      {/* Control Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        
        {/* Toggle Option Tabs */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/5 overflow-x-auto">
          {(["table", "board", "gallery", "list", "calendar"] as const).map((view) => (
            <button
              key={view}
              id={`view-${view}`}
              onClick={() => setActiveView(view)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all uppercase leading-none ${
                activeView === view
                  ? "bg-purple-600/30 border border-purple-500/45 text-white"
                  : "text-gray-400 hover:text-white border border-transparent"
              }`}
            >
              {view === "table" && <TableIcon className="h-3.5 w-3.5" />}
              {view === "board" && <Kanban className="h-3.5 w-3.5" />}
              {view === "gallery" && <Grid className="h-3.5 w-3.5" />}
              {view === "list" && <List className="h-3.5 w-3.5" />}
              {view === "calendar" && <CalendarIcon className="h-3.5 w-3.5" />}
              <span>{view}</span>
            </button>
          ))}
        </div>

        {/* Global Catalog Action */}
        <button
          onClick={handleAddNewRecord}
          className="bg-white/10 hover:bg-white/15 outline-none border border-white/10 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 transition-all self-start cursor-pointer active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          New Row (Notion-style)
        </button>
      </div>

      {/* Real Filter & Sort parameters bars */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search matching title, tag, artist vibe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:border-purple-500/50 outline-none font-sans"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-gray-400" />
          <select
            value={filterMood}
            onChange={(e) => setFilterMood(e.target.value)}
            className="bg-[#141423] border border-white/5 rounded-xl px-3 py-2 text-xs text-purple-300 outline-none font-sans cursor-pointer"
          >
            <option value="All">All Moods</option>
            {MOODS.map((m) => (
              <option key={m} value={m}>
                {m} Mood
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* View Rendering Segment */}
      <div className="flex-1 overflow-x-auto min-h-[300px]">
        {/* 1. TABLE VIEW */}
        {activeView === "table" && (
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01] text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort("title")}>
                  Song / Artist <ArrowUpDown className="inline h-3 w-3 ml-1" />
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort("album")}>
                  Album
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort("genre")}>
                  Genre
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort("mood")}>
                  Mood
                </th>
                <th className="py-3 px-4 text-center cursor-pointer hover:text-white" onClick={() => handleSort("bpm")}>
                  BPM
                </th>
                <th className="py-3 px-4 text-center cursor-pointer hover:text-white" onClick={() => handleSort("rating")}>
                  Rating
                </th>
                <th className="py-3 px-4 text-right">Notion Actions</th>
              </tr>
            </thead>
            <tbody>
              {processedSongs.map((song) => (
                <tr key={song.id} className="border-b border-white/5 hover:bg-white/[0.02] group transition-colors">
                  {/* Title / Artist info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onPlaySong(song)}
                        className="w-7 h-7 rounded-full bg-purple-500/10 hover:bg-purple-500 text-purple-400 group-hover:text-white flex items-center justify-center transition-all cursor-pointer"
                      >
                        <Play className="h-3 w-3 fill-current ml-0.5" />
                      </button>
                      <div>
                        <div className="font-semibold text-white truncate max-w-[150px]">{song.title}</div>
                        <div className="text-gray-500 text-[11px] truncate max-w-[150px]">{song.artist}</div>
                      </div>
                    </div>
                  </td>

                  {/* Album */}
                  <td className="py-3 px-4 text-gray-400 truncate max-w-[120px]">
                    {song.album}
                  </td>

                  {/* Genre Inline Editor */}
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={song.genre}
                      onChange={(e) => onUpdateSong({ ...song, genre: e.target.value })}
                      className="bg-transparent text-gray-400 hover:bg-white/5 rounded px-1.5 py-0.5 border border-transparent hover:border-white/5 outline-none text-xs w-20"
                    />
                  </td>

                  {/* Mood Selector Dropdown */}
                  <td className="py-3 px-4">
                    <select
                      value={song.mood}
                      onChange={(e) => onUpdateSong({ ...song, mood: e.target.value as MoodType })}
                      className="bg-transparent text-pink-400 outline-none text-xs cursor-pointer select-none"
                    >
                      {MOODS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* BPM Key */}
                  <td className="py-3 px-4 text-center font-mono text-gray-400">
                    <span className="text-[11px]">{song.bpm || "—"}</span>
                  </td>

                  {/* Star rating picker */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          onClick={() => onUpdateSong({ ...song, rating: star * 2 })}
                          className={`h-3.5 w-3.5 cursor-pointer transition-colors ${
                            song.rating >= star * 2 ? "text-amber-400 fill-amber-400" : "text-gray-600 hover:text-amber-200"
                          }`}
                        />
                      ))}
                    </div>
                  </td>

                  {/* AI & Delete row triggers */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => triggerAutoAITag(song)}
                        disabled={isUpdatingAI === song.id}
                        className="bg-purple-950/40 border border-purple-500/15 hover:border-purple-500/30 px-2 py-1 rounded text-[10px] text-purple-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {isUpdatingAI === song.id ? (
                          <span className="animate-pulse">Analyzing...</span>
                        ) : (
                          <>
                            <Sparkles className="h-2.5 w-2.5" />
                            <span>AI Tag</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => onDeleteSong(song.id)}
                        className="p-1 rounded text-gray-600 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 2. KANBAN BOARD VIEW */}
        {activeView === "board" && (
          <div className="grid grid-cols-5 gap-3 min-w-[900px] py-1">
            {KANBAN_COLUMNS.map((colName) => {
              const columnSongs = processedSongs.filter((s) => s.kanbanStatus === colName);
              return (
                <div key={colName} className="bg-black/30 rounded-xl p-3 border border-white/5 space-y-3">
                  {/* Column Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                    <span className="text-xs font-bold text-gray-300 font-sans tracking-tight">{colName}</span>
                    <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-1.5 py-0.5 rounded-full">
                      {columnSongs.length}
                    </span>
                  </div>

                  {/* Songs list inside Column */}
                  <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                    {columnSongs.map((song) => (
                      <div
                        key={song.id}
                        className="bg-[#12121e] border border-white/5 rounded-xl p-2.5 shadow hover:border-purple-500/30 group transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={song.coverUrl}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white text-xs truncate">{song.title}</div>
                            <div className="text-gray-500 text-[10px] truncate">{song.artist}</div>
                          </div>
                          <button
                            onClick={() => onPlaySong(song)}
                            className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 opacity-60 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                          >
                            <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
                          </button>
                        </div>

                        {/* Kanban transition adjustors */}
                        <div className="flex items-center justify-between mt-3 border-t border-white/5 pt-2">
                          <button
                            onClick={() => moveKanban(song.id, colName, "prev")}
                            disabled={KANBAN_COLUMNS.indexOf(colName) === 0}
                            className="p-1 rounded text-gray-600 disabled:opacity-20 disabled:pointer-events-none hover:text-white cursor-pointer"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-[9px] font-mono font-medium text-pink-400 capitalize">{song.mood}</span>
                          <button
                            onClick={() => moveKanban(song.id, colName, "next")}
                            disabled={KANBAN_COLUMNS.indexOf(colName) === KANBAN_COLUMNS.length - 1}
                            className="p-1 rounded text-gray-600 disabled:opacity-20 disabled:pointer-events-none hover:text-white cursor-pointer"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {columnSongs.length === 0 && (
                      <div className="text-center py-6 text-[10px] text-gray-600 italic">Drag/move items here</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. GALLERY VIEW */}
        {activeView === "gallery" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-1">
            {processedSongs.map((song) => (
              <div
                key={song.id}
                className="group relative bg-[#131322] border border-white/5 rounded-2xl overflow-hidden shadow-md hover:shadow-purple-500/5 transition-all duration-300"
              >
                {/* Artwork box */}
                <div className="relative aspect-square overflow-hidden bg-zinc-900 border-b border-white/5">
                  <img
                    src={song.coverUrl}
                    alt={song.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Absolute gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                  {/* Play circle trigger overlay */}
                  <button
                    onClick={() => onPlaySong(song)}
                    className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg transform translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                  >
                    <Play className="h-4.5 w-4.5 fill-white text-white ml-0.5" />
                  </button>
                </div>

                {/* Properties details */}
                <div className="p-3.5 space-y-1.5">
                  <div>
                    <h4 className="font-sans font-bold text-xs text-white truncate">{song.title}</h4>
                    <p className="font-sans text-[10px] text-gray-400 truncate">{song.artist}</p>
                  </div>
                  
                  {/* Micro tags row */}
                  <div className="flex flex-wrap gap-1 leading-none pt-1">
                    <span className="bg-purple-600/10 text-purple-300 text-[9px] px-1.5 py-0.5 rounded font-sans font-semibold">
                      {song.genre}
                    </span>
                    <span className="bg-pink-600/10 text-pink-300 text-[9px] px-1.5 py-0.5 rounded font-sans font-semibold">
                      {song.mood}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. COMPACT LIST VIEW */}
        {activeView === "list" && (
          <div className="space-y-1.5 py-1">
            {processedSongs.map((song) => (
              <div
                key={song.id}
                className="flex items-center justify-between p-2.5 bg-white/[0.01] hover:bg-white/[0.03] rounded-xl border border-white/5 text-xs transition-colors"
              >
                <div className="flex items-center gap-3 w-1/3 min-w-[150px]">
                  <img
                    src={song.coverUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate">{song.title}</div>
                    <div className="text-gray-500 text-[10px] truncate">{song.artist}</div>
                  </div>
                </div>

                {/* Sub features compact */}
                <span className="text-gray-400 w-1/5 truncate font-sans text-[11px] block">{song.album}</span>
                <span className="text-purple-400 w-1/6 font-mono text-[11px] block">{song.genre}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPlaySong(song)}
                    className="px-3 py-1 bg-white/5 hover:bg-purple-600/20 text-gray-200 hover:text-white border border-white/5 hover:border-purple-500/20 rounded-lg text-[10px] font-semibold tracking-wide cursor-pointer transition-all"
                  >
                    Play Track
                  </button>
                  <button
                    onClick={() => onDeleteSong(song.id)}
                    className="p-1 rounded text-gray-600 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. HEATMAP / CALENDAR VIEW */}
        {activeView === "calendar" && (
          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-sans font-bold text-white text-sm">Listening Calendar Log</h4>
                <p className="text-gray-500 text-[11px]">Heatmap record of daily stream accomplishments (GitHub-style)</p>
              </div>
              <div className="flex gap-2 items-center text-[10px] text-gray-400">
                <span className="bg-white/5 px-2 py-0.5 rounded font-mono">Streak: 12 days</span>
                <span className="bg-pink-500/10 text-pink-300 px-2 py-0.5 rounded font-mono">Total PlayCount: {songs.reduce((acc, s) => acc + s.playCount, 0)}</span>
              </div>
            </div>

            {/* Simulated Heatmap Matrix Grid */}
            <div className="space-y-4 pt-1">
              {/* Matrix blocks 7 days x 20 weeks */}
              <div className="flex flex-wrap gap-1 md:gap-1.5 items-center justify-start bg-black/20 p-4 rounded-xl border border-white/5">
                {Array(90).fill(0).map((_, idx) => {
                  // Generate custom random weights for color intensity
                  const weight = (idx % 6 === 0) ? 0 : (idx % 4 === 0) ? 3 : (idx % 7 === 0) ? 2 : (idx % 9 === 0) ? 4 : 1;
                  const colors = [
                    "bg-[#151525] border border-white/[0.02]", // 0
                    "bg-purple-950/40 border border-purple-500/5", // 1
                    "bg-purple-800/40 border border-purple-500/10", // 2
                    "bg-purple-600/60 border border-purple-400/20", // 3
                    "bg-pink-500 border border-pink-400" // 4
                  ];
                  return (
                    <div
                      key={idx}
                      className={`w-3.5 h-3.5 rounded-sm md:w-4 md:h-4 cursor-pointer transition-transform hover:scale-125 ${colors[weight]}`}
                      title={`Listening logs: ${weight * 4} times played`}
                    />
                  );
                })}
              </div>

              {/* Legend scale */}
              <div className="flex items-center justify-end gap-1.5 text-[10px] text-gray-500 pr-1">
                <span>Less</span>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#151525]" />
                <div className="w-2.5 h-2.5 rounded-sm bg-[#3a1d60]" />
                <div className="w-2.5 h-2.5 rounded-sm bg-[#5c2d91]" />
                <div className="w-2.5 h-2.5 rounded-sm bg-[#8e24aa]" />
                <div className="w-2.5 h-2.5 rounded-sm bg-[#ec407a]" />
                <span>More Activity</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
