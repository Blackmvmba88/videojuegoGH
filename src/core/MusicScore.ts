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
      tuning.some(pitch => !Number.isInteger(pitch) || pitch < 0 || pitch > 127)) {
    throw new RangeError('Invalid MIDI pitch, tuning or fret limit');
  }
  return tuning.flatMap((openPitch, i) => {
    const fret = midiPitch - openPitch;
    return fret >= 0 && fret <= maxFret ? [{ string: i + 1, fret }] : [];
  });
}

export function validateScore(score: MusicScore): string[] {
  const errors: string[] = [];
  if (score.schemaVersion !== '1.0') errors.push('Unsupported schema version');
  if (!score.title.trim()) errors.push('Title is required');
  if (!Number.isFinite(score.bpm) || score.bpm <= 0) errors.push('BPM must be positive');
  const ids = new Set<string>();
  for (const track of score.tracks) {
    if (!track.id || ids.has(track.id)) errors.push('Track IDs must be unique and nonempty');
    ids.add(track.id);
    for (const note of track.notes) {
      if (!Number.isInteger(note.pitch) || note.pitch < 0 || note.pitch > 127 ||
          !Number.isFinite(note.startSeconds) || note.startSeconds < 0 ||
          !Number.isFinite(note.durationSeconds) || note.durationSeconds <= 0 ||
          (note.confidence !== undefined && (!Number.isFinite(note.confidence) || note.confidence < 0 || note.confidence > 1))) {
        errors.push('Invalid note in track ' + track.id);
      }
    }
  }
  return errors;
}
