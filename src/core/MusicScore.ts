/**
 * Canonical, versioned song representation shared by editor, transcription and game.
 * Times are absolute seconds; pitch is MIDI 0-127. No AI transcription is claimed here.
 */
export interface ScoreNote {
  pitch: number;
  startSeconds: number;
  durationSeconds: number;
  velocity?: number;
  confidence?: number;
}

export type InstrumentKind = 'guitar' | 'bass' | 'drums' | 'vocals' | 'piano' | 'other';

export interface ScoreTrack {
  id: string;
  instrument: InstrumentKind;
  notes: ScoreNote[];
  stemUrl?: string;
}

export interface MusicScore {
  schemaVersion: '1.0';
  title: string;
  bpm: number;
  tracks: ScoreTrack[];
}

export interface FretPosition {
  string: number; // 1 = highest-pitched string
  fret: number;
}

export const STANDARD_GUITAR_TUNING = [64, 59, 55, 50, 45, 40] as const; // E4 B3 G3 D3 A2 E2
export const STANDARD_BASS_TUNING = [43, 38, 33, 28] as const; // G2 D2 A1 E1

/** Returns every feasible position; no claim of original performer fingering. */
export function fretCandidates(
  midiPitch: number,
  tuning: readonly number[] = STANDARD_GUITAR_TUNING,
  maxFret = 24
): FretPosition[] {
  if (!Number.isInteger(midiPitch) || midiPitch < 0 || midiPitch > 127 ||
      !Number.isInteger(maxFret) || maxFret < 0 || maxFret > 36 ||
      tuning.length === 0 || tuning.some(pitch => !Number.isInteger(pitch) || pitch < 0 || pitch > 127)) {
    throw new RangeError('Invalid MIDI pitch, tuning or fret limit');
  }
  return tuning.flatMap((openPitch, i) => {
    const fret = midiPitch - openPitch;
    return fret >= 0 && fret <= maxFret ? [{ string: i + 1, fret }] : [];
  });
}

/** Runtime boundary for JSON and future transcription adapters. Velocity is normalized 0..1. */
export function validateScore(score: unknown): string[] {
  const errors: string[] = [];
  if (!isRecord(score)) return ['Score must be an object'];
  if (score.schemaVersion !== '1.0') errors.push('Unsupported schema version');
  if (typeof score.title !== 'string' || !score.title.trim()) errors.push('Title is required');
  if (typeof score.bpm !== 'number' || !Number.isFinite(score.bpm) || score.bpm <= 0) errors.push('BPM must be positive');
  if (!Array.isArray(score.tracks)) return [...errors, 'Tracks must be an array'];
  const ids = new Set<string>();
  score.tracks.forEach((track, index) => {
    const path = `tracks[${index}]`;
    if (!isRecord(track)) { errors.push(`${path} must be an object`); return; }
    if (typeof track.id !== 'string' || !track.id.trim() || ids.has(track.id)) errors.push(`${path}: Track IDs must be unique and nonempty`);
    if (typeof track.id === 'string') ids.add(track.id);
    if (typeof track.instrument !== 'string' || !['guitar', 'bass', 'drums', 'vocals', 'piano', 'other'].includes(String(track.instrument))) errors.push(`${path}: Invalid instrument`);
    if (track.stemUrl !== undefined && typeof track.stemUrl !== 'string') errors.push(`${path}: Invalid stem URL`);
    if (!Array.isArray(track.notes)) { errors.push(`${path}: Notes must be an array`); return; }
    track.notes.forEach((note, i) => {
      if (!isRecord(note) ||
          typeof note.pitch !== 'number' || !Number.isInteger(note.pitch) || note.pitch < 0 || note.pitch > 127 ||
          typeof note.startSeconds !== 'number' || !Number.isFinite(note.startSeconds) || note.startSeconds < 0 ||
          typeof note.durationSeconds !== 'number' || !Number.isFinite(note.durationSeconds) || note.durationSeconds <= 0 ||
          !Number.isFinite(note.startSeconds + note.durationSeconds) ||
          (note.confidence !== undefined && !unitInterval(note.confidence)) ||
          (note.velocity !== undefined && !unitInterval(note.velocity))) errors.push(`${path}.notes[${i}]: Invalid note`);
    });
  });
  return errors;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function unitInterval(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
}
export function parseScore(value: unknown): MusicScore {
  const errors = validateScore(value);
  if (errors.length) throw new Error(errors.join('; '));
  return value as MusicScore;
}
