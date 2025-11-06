import React, { useEffect, useRef, useState } from 'react';
import { GameState, MIDINote } from '../types';

// Canvas visualization constants
const LOOK_AHEAD_TIME = 3; // seconds to show notes in advance
const HIT_ZONE_Y_OFFSET = 100; // pixels from bottom for hit zone
const HIT_ZONE_HEIGHT = 60; // height of the hit zone in pixels
const HIT_ZONE_PADDING = 50; // padding from canvas edges
const NOTE_RADIUS = 15; // radius of note circles
const MIDDLE_C_MIDI = 60; // MIDI note number for middle C
const PITCH_RANGE = 24; // Range of pitches to display (2 octaves)

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

    const currentTime = gameState.currentTime;
    
    const visible = notes.filter(
      note => note.time >= currentTime && note.time <= currentTime + LOOK_AHEAD_TIME
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
    const hitZoneY = canvas.height - HIT_ZONE_Y_OFFSET;
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.strokeRect(
      HIT_ZONE_PADDING,
      hitZoneY - HIT_ZONE_HEIGHT / 2,
      canvas.width - HIT_ZONE_PADDING * 2,
      HIT_ZONE_HEIGHT
    );

    // Draw notes
    const pixelsPerSecond = canvas.height / LOOK_AHEAD_TIME;

    visibleNotes.forEach(note => {
      const timeUntilNote = note.time - gameState.currentTime;
      const y = canvas.height - (timeUntilNote * pixelsPerSecond);
      
      // Map MIDI pitch to x position
      const normalizedPitch = (note.pitch - MIDDLE_C_MIDI) / PITCH_RANGE;
      const x = normalizedPitch * (canvas.width - HIT_ZONE_PADDING * 2) + HIT_ZONE_PADDING;
      
      // Draw note
      ctx.fillStyle = '#ff006e';
      ctx.beginPath();
      ctx.arc(
        Math.max(HIT_ZONE_PADDING, Math.min(canvas.width - HIT_ZONE_PADDING, x)),
        y,
        NOTE_RADIUS,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Draw note name
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        note.name,
        Math.max(HIT_ZONE_PADDING, Math.min(canvas.width - HIT_ZONE_PADDING, x)),
        y - 20
      );
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
