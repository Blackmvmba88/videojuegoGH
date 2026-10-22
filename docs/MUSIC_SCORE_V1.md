# BlackMamba MusicScore v1

New module: `src/core/MusicScore.ts`.

This defines a shared representation for a song, including tracks, instrument IDs, MIDI pitches, note timing, confidence and optional stem URL. Guitar and bass fret candidates are calculated from open-string MIDI pitches; multiple possible positions are returned rather than guessing the original fingering.

## Example
```ts
import { fretCandidates, validateScore, MusicScore } from '../src/core/MusicScore';

const score: MusicScore = {
  schemaVersion: '1.0',
  title: 'Example riff',
  bpm: 120,
  tracks: [{
    id: 'guitar-1',
    instrument: 'guitar',
    notes: [{ pitch: 64, startSeconds: 0, durationSeconds: 0.5, confidence: 0.9 }]
  }]
};

console.log(validateScore(score)); // []
console.log(fretCandidates(64)); // includes E4 open string and other valid frets
```

## Scope and limitations
This is **not** stem separation or automatic audio transcription. It introduces the intermediate representation needed to connect future models to the existing game. Transcription, MIDI import/export, TAB optimization, rhythmic quantization and UI are next steps.

## Validation plan
- TypeScript compile (project build).
- Check pitch 64 maps to guitar first string open and equivalent strings.
- Check pitches below string range return no positions.
- Check invalid note durations, duplicate track IDs and confidence out of range.
- Review any model-produced data before saving.
