import React, { useState, useEffect } from 'react';
import { SongSelector } from './components/SongSelector';
import { GameView } from './components/GameView';
import { GameEngine } from './core/GameEngine';
import { GameState, Song, MIDINote } from './types';
import './styles/App.css';

const App: React.FC = () => {
  const [gameEngine] = useState(() => new GameEngine());
  const [gameState, setGameState] = useState<GameState>(() => gameEngine.getGameState());
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentNotes, setCurrentNotes] = useState<MIDINote[]>([]);
  const [currentPitch, setCurrentPitch] = useState<{ frequency: number; midiNote: number }>({ frequency: 0, midiNote: 0 });
  const [view, setView] = useState<'selector' | 'game'>('selector');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize game engine
  useEffect(() => {
    const initEngine = async () => {
      try {
        await gameEngine.initialize();
        setSongs(gameEngine.getAllSongs());
        
        // Set up state change listener
        gameEngine.setOnStateChange((newState) => {
          setGameState(newState);
        });
        
        // Set up pitch change listener
        gameEngine.setOnPitchChange((frequency, midiNote) => {
          setCurrentPitch({ frequency, midiNote });
        });
      } catch (err) {
        console.error('Failed to initialize game engine:', err);
        setError('Failed to initialize audio system or microphone. Please check permissions and refresh the page.');
      }
    };

    initEngine();

    // Cleanup on unmount
    return () => {
      gameEngine.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // gameEngine is stable from useState, safe to omit from deps

  // Handle song selection
  const handleSelectSong = async (songId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await gameEngine.loadSong(songId);
      setCurrentNotes(gameEngine.getNotes());
      setView('game');
    } catch (err) {
      console.error('Failed to load song:', err);
      setError('Failed to load song. Please make sure the song files are available.');
    } finally {
      setIsLoading(false);
    }
  };

  // Game controls
  const handleStart = () => {
    gameEngine.startGame();
  };

  const handlePause = () => {
    gameEngine.pauseGame();
  };

  const handleStop = () => {
    gameEngine.stopGame();
  };

  const handleBack = () => {
    gameEngine.stopGame();
    setView('selector');
  };

  if (isLoading) {
    return (
      <div className="app loading">
        <div className="loading-message">
          <h2>Loading...</h2>
          <p>Preparing your song...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app error">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => setError(null)} className="btn btn-primary">
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {view === 'selector' ? (
        <SongSelector songs={songs} onSelectSong={handleSelectSong} />
      ) : (
        <GameView
          gameState={gameState}
          notes={currentNotes}
          currentPitch={currentPitch}
          onStart={handleStart}
          onPause={handlePause}
          onStop={handleStop}
          onBack={handleBack}
        />
      )}
    </div>
  );
};

export default App;
