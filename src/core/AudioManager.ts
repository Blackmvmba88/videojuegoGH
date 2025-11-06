import * as Tone from 'tone';

/**
 * AudioManager - Manages audio playback using Tone.js
 */
export class AudioManager {
  private vocalPlayer: Tone.Player | null = null;
  private instrumentalPlayer: Tone.Player | null = null;
  private isInitialized = false;

  /**
   * Initialize the audio context (will fully initialize on first user interaction)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Mark as initialized - Tone.js will auto-initialize on first user interaction
    this.isInitialized = true;
    if (import.meta.env.DEV) {
      console.log('Audio manager ready (context will start on user interaction)');
    }
  }

  /**
   * Load audio stems (vocal and instrumental)
   */
  async loadStems(vocalPath: string, instrumentalPath: string): Promise<void> {
    try {
      // Dispose of existing players
      this.dispose();

      // Create new players with error handling
      this.vocalPlayer = new Tone.Player({
        url: vocalPath,
        onerror: (error) => console.error('Error loading vocal stem:', error)
      }).toDestination();
      
      this.instrumentalPlayer = new Tone.Player({
        url: instrumentalPath,
        onerror: (error) => console.error('Error loading instrumental stem:', error)
      }).toDestination();

      // Wait for audio to load
      await Tone.loaded();

      if (import.meta.env.DEV) {
        console.log('Audio stems loaded successfully');
      }
    } catch (error) {
      console.error('Error loading audio stems:', error);
      // Clean up on error
      this.dispose();
      throw new Error('Failed to load audio stems');
    }
  }

  /**
   * Start playback of both stems
   */
  async play(): Promise<void> {
    if (!this.vocalPlayer || !this.instrumentalPlayer) {
      console.warn('Audio stems not loaded');
      return;
    }

    // Ensure audio context is started (requires user gesture)
    await Tone.start();
    
    Tone.Transport.start();
    this.vocalPlayer.start();
    this.instrumentalPlayer.start();
  }

  /**
   * Pause playback
   */
  pause(): void {
    Tone.Transport.pause();
  }

  /**
   * Stop playback and reset
   */
  stop(): void {
    if (this.vocalPlayer) {
      this.vocalPlayer.stop();
    }
    if (this.instrumentalPlayer) {
      this.instrumentalPlayer.stop();
    }
    Tone.Transport.stop();
    Tone.Transport.position = 0;
  }

  /**
   * Set volume for vocal stem (0-1)
   */
  setVocalVolume(volume: number): void {
    if (this.vocalPlayer) {
      this.vocalPlayer.volume.value = Tone.gainToDb(volume);
    }
  }

  /**
   * Set volume for instrumental stem (0-1)
   */
  setInstrumentalVolume(volume: number): void {
    if (this.instrumentalPlayer) {
      this.instrumentalPlayer.volume.value = Tone.gainToDb(volume);
    }
  }

  /**
   * Get current playback time in seconds
   */
  getCurrentTime(): number {
    return Tone.Transport.seconds;
  }

  /**
   * Seek to a specific time
   */
  seek(time: number): void {
    Tone.Transport.seconds = time;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.vocalPlayer) {
      this.vocalPlayer.dispose();
      this.vocalPlayer = null;
    }
    if (this.instrumentalPlayer) {
      this.instrumentalPlayer.dispose();
      this.instrumentalPlayer = null;
    }
  }
}
