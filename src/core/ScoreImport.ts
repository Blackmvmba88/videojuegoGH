import { Midi } from '@tonejs/midi';
import { InstrumentKind, MusicScore, parseScore } from './MusicScore';

/** GM metadata is a hint, never instrument recognition from audio. */
function instrumentFor(program: number, percussion: boolean): InstrumentKind {
  if (percussion) return 'drums';
  if (program >= 24 && program <= 31) return 'guitar';
  if (program >= 32 && program <= 39) return 'bass';
  if (program <= 7) return 'piano';
  return 'other';
}

/** Absolute seconds include the MIDI tempo map. v1 BPM is only the initial tempo. */
export function importMidiScore(bytes: ArrayBuffer | Uint8Array, title = 'Imported MIDI'): MusicScore {
  const midi = new Midi(bytes);
  return parseScore({
    schemaVersion: '1.0', title: midi.name.trim() || title,
    bpm: midi.header.tempos[0]?.bpm ?? 120,
    tracks: midi.tracks.map((track, index) => ({
      id: `midi-${index + 1}`,
      instrument: instrumentFor(track.instrument.number, track.instrument.percussion),
      notes: track.notes.map(note => ({
        pitch: note.midi, startSeconds: note.time, durationSeconds: note.duration,
        velocity: note.velocity,
      })).sort((a, b) => a.startSeconds - b.startSeconds),
    })),
  });
}
