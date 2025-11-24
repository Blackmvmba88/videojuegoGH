// Core types for the vocal rhythm game

export interface MIDINote {
  pitch: number;
  velocity: number;
  time: number;
  duration: number;
  name: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  midiPath: string;
  vocalStemPath: string;
  instrumentalStemPath: string;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  bpm?: number;
}

export interface GameState {
  currentSong: Song | null;
  score: number;
  combo: number;
  isPlaying: boolean;
  currentTime: number;
  accuracy: number;
}

export interface NoteEvent {
  note: MIDINote;
  time: number;
  isHit: boolean;
}

export interface AudioStem {
  vocal: string;
  instrumental: string;
}
