import { Midi } from '@tonejs/midi';
import { MIDINote } from '../types';

/**
 * MIDIParser - Parses MIDI files and extracts vocal notes
 */
export class MIDIParser {
  private midi: Midi | null = null;

  /**
   * Load and parse a MIDI file
   */
  async loadMIDI(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      this.midi = new Midi(arrayBuffer);
      console.log('MIDI loaded successfully:', this.midi.name);
    } catch (error) {
      console.error('Error loading MIDI file:', error);
      throw new Error('Failed to load MIDI file');
    }
  }

  /**
   * Extract notes from the MIDI file (typically from the first track)
   */
  getNotes(): MIDINote[] {
    if (!this.midi) {
      console.warn('MIDI not loaded');
      return [];
    }

    const notes: MIDINote[] = [];
    
    // Extract notes from the first track (assuming vocal melody is on track 0)
    if (this.midi.tracks.length > 0) {
      const track = this.midi.tracks[0];
      
      track.notes.forEach((note) => {
        notes.push({
          pitch: note.midi,
          velocity: note.velocity,
          time: note.time,
          duration: note.duration,
          name: note.name,
        });
      });
    }

    return notes.sort((a, b) => a.time - b.time);
  }

  /**
   * Get BPM from MIDI file
   */
  getBPM(): number {
    if (!this.midi || !this.midi.header.tempos.length) {
      return 120; // Default BPM
    }
    return this.midi.header.tempos[0].bpm;
  }

  /**
   * Get total duration of the MIDI file
   */
  getDuration(): number {
    if (!this.midi) {
      return 0;
    }
    return this.midi.duration;
  }

  /**
   * Clear the loaded MIDI data
   */
  clear(): void {
    this.midi = null;
  }
}
