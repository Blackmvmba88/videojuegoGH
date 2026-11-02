import React from 'react';
import { AudioImport } from './AudioImport';
import { Song } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface SongSelectorProps {
  songs: Song[];
  onSelectSong: (songId: string) => void;
}

const getDifficultyTranslation = (difficulty: string, t: ReturnType<typeof useLanguage>['t']): string => {
  const key = difficulty as 'easy' | 'medium' | 'hard';
  return t.difficulty[key] || difficulty;
};

export const SongSelector: React.FC<SongSelectorProps> = ({ songs, onSelectSong }) => {
  const { t } = useLanguage();

  return (
    <div className="song-selector">
      <LanguageSelector />
      <h1>{t.songSelector.title}</h1>
      <h2>{t.songSelector.selectSong}</h2>
      <div className="song-list">
        {songs.map((song) => (
          <div key={song.id} className="song-card" onClick={() => onSelectSong(song.id)}>
            <div className="song-info">
              <h3>{song.title}</h3>
              <p className="artist">{song.artist}</p>
              <div className="song-details">
                <span className="difficulty">{getDifficultyTranslation(song.difficulty, t)}</span>
                <span className="duration">{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</span>
                {song.bpm && <span className="bpm">{song.bpm} BPM</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p><a href="?mode=score">Abrir revisión MIDI / TAB</a></p>
      <AudioImport />
      <div className="instructions">
        <h3>{t.songSelector.howToPlay}</h3>
        <ul>
          <li>{t.songSelector.instructions.select}</li>
          <li>{t.songSelector.instructions.sing}</li>
          <li>{t.songSelector.instructions.hitNotes}</li>
          <li>{t.songSelector.instructions.buildCombos}</li>
        </ul>
      </div>
    </div>
  );
};
