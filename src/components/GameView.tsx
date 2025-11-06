import React, { useEffect, useRef, useState } from 'react';
import { GameState, MIDINote } from '../types';

interface GameViewProps {
  gameState: GameState;
  notes: MIDINote[];
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onBack: () => void;
}

export const GameView: React.FC<GameViewProps> = ({
  gameState,
  notes,
  onStart,
  onPause,
  onStop,
  onBack,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visibleNotes, setVisibleNotes] = useState<MIDINote[]>([]);

  // Update visible notes based on current time
  useEffect(() => {
    if (!gameState.currentSong) return;

    const lookAheadTime = 3; // seconds
    const currentTime = gameState.currentTime;
    
    const visible = notes.filter(
      note => note.time >= currentTime && note.time <= currentTime + lookAheadTime
    );
    
    setVisibleNotes(visible);
  }, [gameState.currentTime, notes, gameState.currentSong]);

  // Draw the timeline visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw hit zone
    const hitZoneY = canvas.height - 100;
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, hitZoneY - 30, canvas.width - 100, 60);

    // Draw notes
    const lookAheadTime = 3;
    const pixelsPerSecond = canvas.height / lookAheadTime;

    visibleNotes.forEach(note => {
      const timeUntilNote = note.time - gameState.currentTime;
      const y = canvas.height - (timeUntilNote * pixelsPerSecond);
      
      // Map MIDI pitch to x position (simplified)
      const x = ((note.pitch - 60) / 24) * (canvas.width - 100) + 50;
      
      // Draw note
      ctx.fillStyle = '#ff006e';
      ctx.beginPath();
      ctx.arc(Math.max(50, Math.min(canvas.width - 50, x)), y, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw note name
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(note.name, Math.max(50, Math.min(canvas.width - 50, x)), y - 20);
    });

    // Draw current time indicator
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, hitZoneY);
    ctx.lineTo(canvas.width, hitZoneY);
    ctx.stroke();

  }, [visibleNotes, gameState.currentTime]);

  if (!gameState.currentSong) {
    return <div>Loading...</div>;
  }

  return (
    <div className="game-view">
      <div className="game-header">
        <div className="song-info">
          <h2>{gameState.currentSong.title}</h2>
          <p>{gameState.currentSong.artist}</p>
        </div>
        <div className="game-stats">
          <div className="stat">
            <span className="label">Score</span>
            <span className="value">{gameState.score}</span>
          </div>
          <div className="stat">
            <span className="label">Combo</span>
            <span className="value">{gameState.combo}x</span>
          </div>
          <div className="stat">
            <span className="label">Accuracy</span>
            <span className="value">{Math.floor(gameState.accuracy * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="game-canvas-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="game-canvas"
        />
      </div>

      <div className="game-controls">
        {!gameState.isPlaying ? (
          <button onClick={onStart} className="btn btn-primary">
            {gameState.currentTime > 0 ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button onClick={onPause} className="btn btn-warning">
            Pause
          </button>
        )}
        <button onClick={onStop} className="btn btn-danger">
          Stop
        </button>
        <button onClick={onBack} className="btn btn-secondary">
          Back to Song Selection
        </button>
      </div>

      <div className="game-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${(gameState.currentTime / gameState.currentSong.duration) * 100}%`,
            }}
          />
        </div>
        <div className="time-info">
          <span>{formatTime(gameState.currentTime)}</span>
          <span>{formatTime(gameState.currentSong.duration)}</span>
        </div>
      </div>
    </div>
  );
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
