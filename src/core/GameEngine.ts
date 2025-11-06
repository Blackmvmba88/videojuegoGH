import { AudioManager } from './AudioManager';
import { MIDIParser } from './MIDIParser';
import { SongLoader } from './SongLoader';
import { GameState, MIDINote, Song } from '../types';

/**
 * GameEngine - Main game logic controller
 */
export class GameEngine {
  private audioManager: AudioManager;
  private midiParser: MIDIParser;
  private songLoader: SongLoader;
  private gameState: GameState;
  private notes: MIDINote[] = [];
  private animationFrameId: number | null = null;
  private onStateChange?: (state: GameState) => void;
  private totalNotesHit = 0;
  private totalAccuracy = 0;

  constructor() {
    this.audioManager = new AudioManager();
    this.midiParser = new MIDIParser();
    this.songLoader = new SongLoader();
    
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
      
      this.notifyStateChange();
      
      console.log(`Song loaded: ${song.title}`, {
        notes: this.notes.length,
        duration: song.duration,
      });
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
    this.notifyStateChange();
  }

  /**
   * Pause the game
   */
  pauseGame(): void {
    this.gameState.isPlaying = false;
    this.audioManager.pause();
    this.stopGameLoop();
    this.notifyStateChange();
  }

  /**
   * Stop the game and reset
   */
  stopGame(): void {
    this.gameState.isPlaying = false;
    this.audioManager.stop();
    this.stopGameLoop();
    this.gameState.currentTime = 0;
    this.notifyStateChange();
  }

  /**
   * Main game loop
   */
  private startGameLoop(): void {
    const updateGame = () => {
      if (!this.gameState.isPlaying) {
        return;
      }

      this.gameState.currentTime = this.audioManager.getCurrentTime();
      this.notifyStateChange();

      this.animationFrameId = requestAnimationFrame(updateGame);
    };

    updateGame();
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
    this.audioManager.dispose();
    this.midiParser.clear();
  }
}
