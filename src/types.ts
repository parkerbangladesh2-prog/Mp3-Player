/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type KanbanStatus = "To Listen" | "Listening" | "Favorites" | "Reviewed" | "Archived";
export type MoodType = "Happy" | "Focused" | "Energetic" | "Chill" | "Melancholy";

export interface SongRecord {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  genre: string;
  mood: MoodType;
  rating: number; // 1 to 10 scale or 1 to 5 stars
  playCount: number;
  bpm: number;
  key: string;
  energy: string; // Low, Medium, High
  tags: string[];
  vibe: string[];
  releaseDate: string;
  dateAdded: string; // YYYY-MM-DD
  lastPlayed: string; // YYYY-MM-DD
  favorite: boolean;
  downloaded: boolean;
  reviewed: boolean;
  spotifyUrl: string;
  formulaScore?: number; // Calculated property (e.g. playCount * rating)
  kanbanStatus: KanbanStatus;
  notesId?: string; // Relation backlink to JournalNote
  linkedSongs: string[]; // IDs of other songs
}

export interface JournalNote {
  id: string;
  title: string;
  emoji: string;
  coverColor: string; // Tailwind bg color class
  dateCreated: string; // YYYY-MM-DD
  content: string; // rich Markdown/text
  linkedSongId?: string; // related SongRecord ID
  tags: string[];
}

export interface EqualizerPreset {
  name: string;
  bands: number[]; // 10 bands values from -12dB to +12dB
}

export type ViewType = "table" | "board" | "gallery" | "list" | "calendar";

export interface FilterConfig {
  column: keyof SongRecord | "all";
  operator: "equals" | "contains" | "greater_than" | "less_than" | "search";
  value: string;
}

export interface ListeningActivityItem {
  date: string; // YYYY-MM-DD
  count: number;
}
