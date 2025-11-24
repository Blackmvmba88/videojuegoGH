import { Song } from '../types';

/**
 * SongLoader - Manages loading and providing song data
 */
export class SongLoader {
  private songs: Song[] = [];

  constructor() {
    this.initializeSongs();
  }

  /**
   * Initialize with example songs
   */
  private initializeSongs(): void {
    this.songs = [
      {
        id: 'song1',
        title: 'Ejemplo Canción 1',
        artist: 'Artista Demo',
        midiPath: '/songs/song1/melody.mid',
        vocalStemPath: '/songs/song1/vocal.mp3',
        instrumentalStemPath: '/songs/song1/instrumental.mp3',
        duration: 180, // 3 minutes
        difficulty: 'easy',
        bpm: 120,
      },
      {
        id: 'song2',
        title: 'Ejemplo Canción 2',
        artist: 'Artista Demo',
        midiPath: '/songs/song2/melody.mid',
        vocalStemPath: '/songs/song2/vocal.mp3',
        instrumentalStemPath: '/songs/song2/instrumental.mp3',
        duration: 210, // 3.5 minutes
        difficulty: 'medium',
        bpm: 140,
      },
    ];
  }

  /**
   * Get all available songs
   */
  getAllSongs(): Song[] {
    return [...this.songs];
  }

  /**
   * Get a specific song by ID
   */
  getSongById(id: string): Song | undefined {
    return this.songs.find(song => song.id === id);
  }

  /**
   * Add a new song to the library
   */
  addSong(song: Song): void {
    this.songs.push(song);
  }

  /**
   * Remove a song from the library
   */
  removeSong(id: string): void {
    this.songs = this.songs.filter(song => song.id !== id);
  }
}
