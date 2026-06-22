import React, { useState } from "react";
import {
  FileText,
  Plus,
  Sparkles,
  Trash2,
  CheckSquare,
  Heading2,
  Quote,
  Eye,
  Loader2,
  BookOpen,
  Music,
  ChevronDown
} from "lucide-react";
import { JournalNote, SongRecord } from "../types";

interface RichJournalProps {
  notes: JournalNote[];
  songs: SongRecord[];
  onAddNewNote: (note: JournalNote) => void;
  onUpdateNote: (note: JournalNote) => void;
  onDeleteNote: (id: string) => void;
  onPlaySongById: (id: string) => void;
}

export default function RichJournal({
  notes,
  songs,
  onAddNewNote,
  onUpdateNote,
  onDeleteNote,
  onPlaySongById,
}: RichJournalProps) {
  const [selectedNote, setSelectedNote] = useState<JournalNote | null>(notes[0] || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editEmoji, setEditEmoji] = useState("📝");
  const [editContent, setEditContent] = useState("");
  const [editLinkedSong, setEditLinkedSong] = useState("");
  
  const [templateType, setTemplateType] = useState<string>("Album Review Template");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);

  // Template lists
  const JOURNAL_TEMPLATES = [
    { name: "Album Review Template", description: "Write deep musical score breakdowns" },
    { name: "Song Analysis Template", description: "Analyze tempo, BPM, scale key and lyric trivia" },
    { name: "Concert Memory Template", description: "Log details of active shows and lineups" },
    { name: "Playlist Story Template", description: "Compose the emotional narrative of a playlist" }
  ];

  const handleSelectNote = (note: JournalNote) => {
    setSelectedNote(note);
    setIsEditing(false);
    setEditTitle(note.title);
    setEditEmoji(note.emoji);
    setEditContent(note.content);
    setEditLinkedSong(note.linkedSongId || "");
  };

  const handleStartEdit = () => {
    if (!selectedNote) return;
    setEditTitle(selectedNote.title);
    setEditEmoji(selectedNote.emoji);
    setEditContent(selectedNote.content);
    setEditLinkedSong(selectedNote.linkedSongId || "");
    setIsEditing(true);
  };

  const handleSaveNote = () => {
    if (!selectedNote) return;
    const updated: JournalNote = {
      ...selectedNote,
      title: editTitle.trim() || selectedNote.title,
      emoji: editEmoji,
      content: editContent,
      linkedSongId: editLinkedSong || undefined,
    };
    onUpdateNote(updated);
    setSelectedNote(updated);
    setIsEditing(false);
  };

  // Create a brand new blank journal entry
  const handleCreateNewNote = () => {
    const freshNote: JournalNote = {
      id: `note-${Date.now()}`,
      title: "New Journal Entry",
      emoji: "✍️",
      coverColor: "from-purple-950 to-pink-900",
      dateCreated: new Date().toISOString().split("T")[0],
      content: `# New Journal Entry\n\nStart writing your thoughts here. You can type \`@\` to link available tracks, or use Gemini templates!`,
      tags: ["#draft"],
    };
    onAddNewNote(freshNote);
    setSelectedNote(freshNote);
    setIsEditing(true);
    setEditTitle(freshNote.title);
    setEditEmoji(freshNote.emoji);
    setEditContent(freshNote.content);
    setEditLinkedSong("");
  };

  // Generate outlining template using our server-side Gemini journal-helper engine
  const handleGenerateAITemplating = async () => {
    if (!selectedNote) return;
    setIsLoadingAI(true);
    
    // Check if we have a linked song or just pick the first standard one
    const placeholderSong = songs.find((s) => s.id === editLinkedSong) || songs[0];
    const songTitle = placeholderSong ? placeholderSong.title : "Unspecified Melody";
    const artistName = placeholderSong ? placeholderSong.artist : "Independent Creator";

    try {
      const response = await fetch("/api/gemini/journal-helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songTitle,
          artistName,
          templateType,
        }),
      });
      const data = await response.json();
      if (data && data.text) {
        setEditContent(data.text);
        if (placeholderSong && !editLinkedSong) {
          setEditLinkedSong(placeholderSong.id);
        }
      }
    } catch (e) {
      console.warn("AI Note generation failed. Active sandbox layout applied.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Quick mention insertion helper
  const handleMentionSong = (song: SongRecord) => {
    const backlinkMarkdown = `\n\n🔗 [@Mention Track Link - ${song.title} by ${song.artist}]\n`;
    setEditContent((prev) => prev + backlinkMarkdown);
    setEditLinkedSong(song.id);
    setShowMentionDropdown(false);
  };

  return (
    <div id="journal-board" className="grid grid-cols-1 md:grid-cols-3 gap-5 text-white h-full max-h-[580px] overflow-hidden">
      
      {/* 1. Left Sidebar: Notes list */}
      <div className="bg-[#0E0E16] border border-white/5 rounded-2xl flex flex-col overflow-hidden max-h-[500px] md:max-h-full">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4.5 w-4.5 text-purple-400" />
            <h3 className="font-sans font-semibold text-white text-sm">Sonic Journals</h3>
          </div>
          <button
            onClick={handleCreateNewNote}
            className="p-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/20 text-white transition-all cursor-pointer"
            title="Create New Note"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Notes Items */}
        <div className="flex-1 p-3 overflow-y-auto space-y-1.5">
          {notes.map((note) => {
            const isSelected = selectedNote?.id === note.id;
            return (
              <div
                key={note.id}
                onClick={() => handleSelectNote(note)}
                className={`flex gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                  isSelected
                    ? "bg-gradient-to-r from-purple-900/40 to-pink-950/20 border-purple-500/40 text-white"
                    : "bg-[#141421]/20 border-transparent hover:border-white/5 text-gray-400 hover:text-white"
                }`}
              >
                <div className="text-xl leading-none">{note.emoji || "📝"}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs truncate">{note.title}</div>
                  <div className="text-[10px] text-gray-500 mt-1 font-mono">{note.dateCreated}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Right Workspace details / live Markdown Editor */}
      <div className="md:col-span-2 bg-[#0C0C14] border border-white/5 rounded-2xl overflow-hidden flex flex-col h-full min-h-[460px]">
        {selectedNote ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Note Header & Actions */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/10 z-10">
              <div className="flex items-center gap-2">
                <span className="text-xl">{isEditing ? editEmoji : selectedNote.emoji}</span>
                <span className="font-sans font-bold text-white text-xs md:text-sm">
                  {isEditing ? `Editing Note...` : selectedNote.title}
                </span>
              </div>

              {/* View/Edit Actions triggers */}
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveNote}
                      className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-[11px] font-sans font-semibold text-white cursor-pointer active:scale-95"
                    >
                      Save Note
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[11px] font-sans text-gray-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleStartEdit}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-sans font-semibold text-white flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Edit Content</span>
                    </button>
                    <button
                      onClick={() => {
                        onDeleteNote(selectedNote.id);
                        setSelectedNote(notes[0] || null);
                      }}
                      className="p-1.5 text-gray-600 hover:text-red-400 rounded-lg cursor-pointer transition-colors"
                      title="Delete Journal Entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Note Workspace Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-5">
              
              {/* EDIT MODE PANEL */}
              {isEditing ? (
                <div className="space-y-4 text-xs font-sans">
                  
                  {/* Inline metadata editors */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-semibold uppercase">Emoji Icon</label>
                      <input
                        type="text"
                        value={editEmoji}
                        onChange={(e) => setEditEmoji(e.target.value)}
                        className="w-full bg-[#141423] border border-white/5 rounded-xl px-3 py-2 text-white text-center text-sm outline-none"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] text-gray-500 font-semibold uppercase">Note Heading Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-[#141423] border border-white/5 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-purple-500/50"
                      />
                    </div>
                  </div>

                  {/* AI Composer Module */}
                  <div className="bg-[#141423]/60 border border-white/5 p-3.5 rounded-xl space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-semibold text-white">
                        <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
                        <span>Compose templates with Gemini 3.5</span>
                      </div>
                      <span className="font-mono text-[9px] text-gray-500">AI AUTOFILL</span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-2">
                      <select
                        value={templateType}
                        onChange={(e) => setTemplateType(e.target.value)}
                        className="bg-[#141425] border border-white/10 rounded-xl px-3 py-2 text-[11px] text-purple-300 outline-none flex-1 max-w-sm cursor-pointer"
                      >
                        {JOURNAL_TEMPLATES.map((t) => (
                          <option key={t.name} value={t.name}>
                            {t.name}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={handleGenerateAITemplating}
                        disabled={isLoadingAI}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer select-none transition-colors disabled:opacity-30"
                      >
                        {isLoadingAI ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Composing outline...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Apply Template</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Notion properties integration: Link track details */}
                  <div className="grid grid-cols-2 gap-3 pb-2 border-b border-white/5">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-semibold uppercase">Linked Song Relation</label>
                      <select
                        value={editLinkedSong}
                        onChange={(e) => setEditLinkedSong(e.target.value)}
                        className="w-full bg-[#141423] border border-white/5 rounded-xl px-3 py-2 text-white outline-none cursor-pointer"
                      >
                        <option value="">No Linked Song</option>
                        {songs.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title} ({s.artist})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* @Mention Tool and Dropdown */}
                    <div className="space-y-1 relative">
                      <label className="text-[10px] text-gray-500 font-semibold uppercase">Inject Connection link</label>
                      <button
                        onClick={() => setShowMentionDropdown(!showMentionDropdown)}
                        className="w-full bg-[#141423] hover:bg-[#14142b] border border-white/5 rounded-xl px-3 py-2 text-white outline-none text-left flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-1 text-purple-400">
                          <Music className="h-3.5 w-3.5" />
                          <span>Insert @Mention Link</span>
                        </span>
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      {showMentionDropdown && (
                        <div className="absolute top-12 left-0 right-0 bg-[#161625] border border-white/10 rounded-xl p-1 shadow-2xl z-40 max-h-40 overflow-y-auto">
                          {songs.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => handleMentionSong(s)}
                              className="w-full text-left px-3 py-2 hover:bg-white/5 text-xs text-slate-300 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <img src={s.coverUrl} className="w-5 h-5 rounded object-cover" />
                              <span className="font-semibold">{s.title}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-semibold uppercase">Journal Text (Markdown supported)</label>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={12}
                      className="w-full bg-[#11111a] border border-white/5 rounded-xl p-4 text-xs font-mono text-gray-300 placeholder-gray-600 leading-relaxed focus:border-purple-500/50 outline-none"
                      placeholder="Type details down here. Markdowns is valid. Include headers, check-boxes, toggles..."
                    />
                  </div>
                </div>
              ) : (
                /* READ ONLY PREVIEW DECK */
                <div className="space-y-4 font-sans text-xs text-gray-300">
                  {/* Related Backlink details */}
                  {selectedNote.linkedSongId && (
                    <div className="bg-gradient-to-r from-purple-950/20 to-pink-950/10 border border-purple-500/10 rounded-2xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🔗</span>
                        <div>
                          <p className="text-[9px] text-gray-500 font-mono">BACKLINKED NOTION PROPERTY RELATION</p>
                          <h5 className="font-bold text-white text-xs">
                            {songs.find((s) => s.id === selectedNote.linkedSongId)?.title || "Unknown Track"}
                          </h5>
                        </div>
                      </div>
                      <button
                        onClick={() => onPlaySongById(selectedNote.linkedSongId!)}
                        className="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-[10px] text-purple-300 border border-purple-500/20 rounded-lg font-mono cursor-pointer transition-colors"
                      >
                        Play Link
                      </button>
                    </div>
                  )}

                  {/* Note Body rendering */}
                  <div className="bg-[#12121c]/40 border border-white/5 rounded-2xl p-5 space-y-4 leading-relaxed font-sans max-h-[360px] overflow-y-auto">
                    {/* Render basic markdown highlights procedurally */}
                    {editContent.split("\n").map((line, idx) => {
                      if (line.startsWith("# ")) {
                        return (
                          <h2 key={idx} className="text-base font-bold text-white border-b border-white/5 pb-1 select-none font-sans mt-3">
                            {line.replace("# ", "")}
                          </h2>
                        );
                      }
                      if (line.startsWith("## ")) {
                        return (
                          <h3 key={idx} className="text-sm font-semibold text-purple-300 select-none font-sans mt-2">
                            {line.replace("## ", "")}
                          </h3>
                        );
                      }
                      if (line.startsWith("> ")) {
                        return (
                          <blockquote key={idx} className="border-l-4 border-pink-500 bg-pink-500/5 p-3 rounded-r-lg font-mono text-[11px] text-pink-300 italic select-none">
                            {line.replace("> ", "")}
                          </blockquote>
                        );
                      }
                      if (line.startsWith("- [x] ")) {
                        return (
                          <div key={idx} className="flex items-start gap-2 text-emerald-400">
                            <span className="mt-0.5">☑</span>
                            <span className="line-through text-gray-500">{line.replace("- [x] ", "")}</span>
                          </div>
                        );
                      }
                      if (line.startsWith("- [ ] ")) {
                        return (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-purple-400 mt-0.5">☐</span>
                            <span>{line.replace("- [ ] ", "")}</span>
                          </div>
                        );
                      }
                      if (line.startsWith("- ")) {
                        return (
                          <div key={idx} className="flex gap-2 items-start pl-3">
                            <span className="text-purple-400 mt-1">•</span>
                            <span>{line.replace("- ", "")}</span>
                          </div>
                        );
                      }

                      // Check for backlink insertions
                      if (line.includes("@Mention Track Link -")) {
                        const cleanLinkStr = line.replace("🔗 [", "").replace("]", "");
                        return (
                          <div key={idx} className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-2.5 my-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Music className="h-3.5 w-3.5 text-purple-400" />
                              <span className="font-semibold text-purple-200">{cleanLinkStr}</span>
                            </div>
                            <span className="text-[9px] text-gray-500 bg-purple-500/10 px-1.5 py-0.5 rounded font-mono select-none">BACKLINKED</span>
                          </div>
                        );
                      }

                      return <p key={idx} className="text-slate-300 font-sans"></p>;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
            <FileText className="h-10 w-10 text-slate-600" />
            <span className="text-xs">No active notes. Select or create one from side-deck!</span>
          </div>
        )}
      </div>
    </div>
  );
}
