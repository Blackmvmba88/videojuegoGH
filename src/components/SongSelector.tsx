import React from 'react';
import { Song } from '../types';

interface SongSelectorProps {
  songs: Song[];
  onSelectSong: (songId: string) => void;
}

export const SongSelector: React.FC<SongSelectorProps> = ({ songs, onSelectSong }) => {
  return (
    <div className="song-selector">
      <h1>🎤 Vocal Rhythm Game</h1>
      <h2>Select a Song</h2>
      <div className="song-list">
        {songs.map((song) => (
          <div key={song.id} className="song-card" onClick={() => onSelectSong(song.id)}>
            <div className="song-info">
              <h3>{song.title}</h3>
              <p className="artist">{song.artist}</p>
              <div className="song-details">
                <span className="difficulty">{song.difficulty}</span>
                <span className="duration">{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</span>
                {song.bpm && <span className="bpm">{song.bpm} BPM</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="instructions">
        <h3>How to Play</h3>
        <ul>
          <li>Select a song to begin</li>
          <li>Sing along with the vocal melody</li>
          <li>Hit the right notes to score points</li>
          <li>Build combos for higher scores</li>
        </ul>
      </div>
    </div>
  );
};
