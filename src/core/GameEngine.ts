import { AudioManager } from './AudioManager';
import { MIDIParser } from './MIDIParser';
import { SongLoader } from './SongLoader';
import { PitchDetector } from './PitchDetector';
import { GameState, MIDINote, Song } from '../types';

/**
 * GameEngine - Main game logic controller
 */
export class GameEngine {
  private audioManager: AudioManager;
  private midiParser: MIDIParser;
  private songLoader: SongLoader;
  private pitchDetector: PitchDetector;
  private gameState: GameState;
  private notes: MIDINote[] = [];
  private animationFrameId: number | null = null;
  private onStateChange?: (state: GameState) => void;
  private onPitchChange?: (frequency: number, midiNote: number) => void;
  private totalNotesHit = 0;
  private totalAccuracy = 0;
  private currentPitch: number = 0;
  private currentMidiNote: number = 0;
  private activeNotes: Set<number> = new Set(); // Track which notes are currently in the hit window
  private hitNotes: Set<number> = new Set(); // Track which notes have been hit

  // Game configuration constants
  private readonly HIT_WINDOW = 0.5; // seconds before/after note time for hit detection
  private readonly PITCH_TOLERANCE = 1; // Allow +/- 1 semitone for note hits
  private readonly MAX_PITCH_DIFF = this.PITCH_TOLERANCE + 1; // Maximum pitch difference for accuracy calculation

  constructor() {
    this.audioManager = new AudioManager();
    this.midiParser = new MIDIParser();
    this.songLoader = new SongLoader();
    this.pitchDetector = new PitchDetector();
    
    this.gameState = {
      currentSong: null,
      score: 0,
      combo: 0,
      isPlaying: false,
      currentTime: 0,
      accuracy: 0,
    };
  }

  /**
   * Initialize the game engine
   */
  async initialize(): Promise<void> {
    await this.audioManager.initialize();
    await this.pitchDetector.initialize();
  }

  /**
   * Load a song and prepare for gameplay
   */
  async loadSong(songId: string): Promise<void> {
    const song = this.songLoader.getSongById(songId);
    if (!song) {
      throw new Error(`Song with ID ${songId} not found`);
    }

    try {
      // Load MIDI and extract notes
      await this.midiParser.loadMIDI(song.midiPath);
      this.notes = this.midiParser.getNotes();

      // Load audio stems
      await this.audioManager.loadStems(song.vocalStemPath, song.instrumentalStemPath);

      // Update game state
      this.gameState.currentSong = song;
      this.gameState.score = 0;
      this.gameState.combo = 0;
      this.gameState.accuracy = 0;
      this.totalNotesHit = 0;
      this.totalAccuracy = 0;
      this.activeNotes.clear();
      this.hitNotes.clear();
      
      this.notifyStateChange();
      
      if (import.meta.env.DEV) {
        console.log(`Song loaded: ${song.title}`, {
          notes: this.notes.length,
          duration: song.duration,
        });
      }
    } catch (error) {
      console.error('Error loading song:', error);
      throw error;
    }
  }

  /**
   * Start playing the current song
   */
  async startGame(): Promise<void> {
    if (!this.gameState.currentSong) {
      console.warn('No song loaded');
      return;
    }

    this.gameState.isPlaying = true;
    await this.audioManager.play();
    this.startGameLoop();
    
    // Start pitch detection
    this.pitchDetector.startListening((frequency, midiNote) => {
      this.currentPitch = frequency;
      this.currentMidiNote = midiNote;
      
      // Notify UI of pitch change
      if (this.onPitchChange) {
        this.onPitchChange(frequency, midiNote);
      }
      
      // Check if pitch matches any active notes
      this.checkPitchMatch(midiNote);
    });
    
    this.notifyStateChange();
  }

  /**
   * Pause the game
   */
  pauseGame(): void {
    this.gameState.isPlaying = false;
    this.audioManager.pause();
    this.pitchDetector.stopListening();
    this.stopGameLoop();
    this.notifyStateChange();
  }

  /**
   * Stop the game and reset
   */
  stopGame(): void {
    this.gameState.isPlaying = false;
    this.audioManager.stop();
    this.pitchDetector.stopListening();
    this.stopGameLoop();
    this.gameState.currentTime = 0;
    this.activeNotes.clear();
    this.hitNotes.clear();
    this.notifyStateChange();
  }

  /**
   * Main game loop with optimized rendering
   */
  private startGameLoop(): void {
    let lastUpdateTime = performance.now();
    const TARGET_FPS = 60;
    const FRAME_TIME = 1000 / TARGET_FPS;
    
    const updateGame = (timestamp: number) => {
      if (!this.gameState.isPlaying) {
        return;
      }

      const elapsed = timestamp - lastUpdateTime;
      
      // Only update if enough time has passed
      if (elapsed >= FRAME_TIME) {
        this.gameState.currentTime = this.audioManager.getCurrentTime();
        this.updateActiveNotes();
        this.notifyStateChange();
        lastUpdateTime = timestamp - (elapsed % FRAME_TIME); // Maintain consistent timing
      }

      this.animationFrameId = requestAnimationFrame(updateGame);
    };

    this.animationFrameId = requestAnimationFrame(updateGame);
  }

  /**
   * Stop the game loop
   */
  private stopGameLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Update which notes are currently in the hit window
   */
  private updateActiveNotes(): void {
    const currentTime = this.gameState.currentTime;
    
    this.activeNotes.clear();
    
    // Find notes that are currently in the hit window
    for (const note of this.notes) {
      const noteIndex = this.notes.indexOf(note);
      
      // Skip notes that have already been hit
      if (this.hitNotes.has(noteIndex)) {
        continue;
      }
      
      // Check if note is in the hit window
      const timeDiff = Math.abs(note.time - currentTime);
      if (timeDiff <= this.HIT_WINDOW) {
        this.activeNotes.add(noteIndex);
      }
      
      // Check if note was missed (passed the hit window)
      if (note.time < currentTime - this.HIT_WINDOW && !this.hitNotes.has(noteIndex)) {
        this.processNoteMiss();
        this.hitNotes.add(noteIndex); // Mark as processed to avoid multiple misses
      }
    }
  }

  /**
   * Check if the detected pitch matches any active notes
   */
  private checkPitchMatch(detectedMidiNote: number): void {
    for (const noteIndex of this.activeNotes) {
      const note = this.notes[noteIndex];
      
      // Check if pitch matches within tolerance
      const pitchDiff = Math.abs(note.pitch - detectedMidiNote);
      
      if (pitchDiff <= this.PITCH_TOLERANCE && !this.hitNotes.has(noteIndex)) {
        // Calculate accuracy based on pitch difference (0 = perfect, 1 = at tolerance edge)
        const accuracy = 1 - (pitchDiff / this.MAX_PITCH_DIFF);
        
        // Hit the note!
        this.processNoteHit(accuracy);
        this.hitNotes.add(noteIndex);
        
        if (import.meta.env.DEV) {
          console.log(`Note hit! Expected: ${note.pitch}, Detected: ${detectedMidiNote}, Accuracy: ${accuracy.toFixed(2)}`);
        }
        
        // Break after hitting one note to avoid multiple hits in a single frame
        break;
      }
    }
  }

  /**
   * Process a note hit (called when player sings the correct note)
   */
  processNoteHit(accuracy: number): void {
    const baseScore = 100;
    const accuracyBonus = Math.floor(accuracy * 50);
    const comboMultiplier = Math.min(this.gameState.combo / 10, 2);
    
    const points = Math.floor((baseScore + accuracyBonus) * (1 + comboMultiplier));
    
    this.gameState.score += points;
    this.gameState.combo += 1;
    
    // Calculate running average accuracy
    this.totalNotesHit += 1;
    this.totalAccuracy += accuracy;
    this.gameState.accuracy = this.totalAccuracy / this.totalNotesHit;
    
    this.notifyStateChange();
  }

  /**
   * Process a note miss
   */
  processNoteMiss(): void {
    this.gameState.combo = 0;
    this.notifyStateChange();
  }

  /**
   * Get all songs from the song loader
   */
  getAllSongs(): Song[] {
    return this.songLoader.getAllSongs();
  }

  /**
   * Get current game state
   */
  getGameState(): GameState {
    return { ...this.gameState };
  }

  /**
   * Get notes for the current song
   */
  getNotes(): MIDINote[] {
    return [...this.notes];
  }

  /**
   * Get notes in a specific time window
   */
  getNotesInWindow(startTime: number, endTime: number): MIDINote[] {
    return this.notes.filter(
      note => note.time >= startTime && note.time <= endTime
    );
  }

  /**
   * Set a callback for state changes
   */
  setOnStateChange(callback: (state: GameState) => void): void {
    this.onStateChange = callback;
  }

  /**
   * Set a callback for pitch changes
   */
  setOnPitchChange(callback: (frequency: number, midiNote: number) => void): void {
    this.onPitchChange = callback;
  }

  /**
   * Get current detected pitch
   */
  getCurrentPitch(): { frequency: number; midiNote: number } {
    return {
      frequency: this.currentPitch,
      midiNote: this.currentMidiNote,
    };
  }

  /**
   * Notify listeners of state changes
   */
  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getGameState());
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopGameLoop();
    this.pitchDetector.dispose();
    this.audioManager.dispose();
    this.midiParser.clear();
  }
}
