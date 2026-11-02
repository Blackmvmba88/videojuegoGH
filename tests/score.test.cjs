const test = require('node:test');
const assert = require('node:assert/strict');
const { Midi } = require('@tonejs/midi');
const { validateScore, parseScore, fretCandidates, STANDARD_BASS_TUNING } = require('../.test-build/MusicScore.js');
const { importMidiScore } = require('../.test-build/ScoreImport.js');
const valid = () => ({ schemaVersion: '1.0', title: 'Riff', bpm: 120, tracks: [{ id: 'g', instrument: 'guitar', notes: [{ pitch: 64, startSeconds: 0, durationSeconds: 0.5 }] }] });
test('valid score, confidence absent, normalized velocity boundaries', () => {
  const s = valid(); assert.deepEqual(validateScore(s), []);
  for (const v of [0, 1]) { s.tracks[0].notes[0].velocity = v; assert.deepEqual(validateScore(s), []); }
});
test('malformed runtime inputs report errors without throwing', () => {
  for (const value of [null, [], 4, {}, { ...valid(), title: 3 }, { ...valid(), tracks: [null] }, { ...valid(), tracks: [{}] }]) {
    assert.ok(validateScore(value).length); assert.throws(() => parseScore(value));
  }
});
test('reject invalid pitches, times, confidence and velocity', () => {
  for (const [field, values] of Object.entries({ pitch: [-1, 128, 2.5, NaN], startSeconds: [-1, Infinity], durationSeconds: [0, -1, NaN], confidence: [-0.1, 1.1, '1'], velocity: [-1, 128] })) {
    for (const value of values) { const s = valid(); s.tracks[0].notes[0][field] = value; assert.ok(validateScore(s).length, `${field}: ${value}`); }
  }
});
test('reject duplicate/blank IDs, unknown instrument and invalid structure', () => {
  const s = valid(); s.tracks.push({ ...s.tracks[0] }); assert.ok(validateScore(s).length);
  for (const patch of [{ id: '  ' }, { instrument: 'violin' }, { instrument: ['guitar'] }, { notes: null }, { notes: [null] }, { stemUrl: 42 }]) {
    const x = valid(); Object.assign(x.tracks[0], patch); assert.ok(validateScore(x).length);
  }
});
test('reject schema, tempo and overflowing note end', () => {
  for (const patch of [{ schemaVersion: '2.0' }, { bpm: 0 }, { bpm: Infinity }, { title: ' ' }]) assert.ok(validateScore({ ...valid(), ...patch }).length);
  const s = valid(); Object.assign(s.tracks[0].notes[0], { startSeconds: Number.MAX_VALUE, durationSeconds: Number.MAX_VALUE }); assert.ok(validateScore(s).length);
});
test('E4 has all six standard guitar positions', () => {
  assert.deepEqual(fretCandidates(64), [0, 5, 9, 14, 19, 24].map((fret, i) => ({ string: i + 1, fret })));
});
test('bass, out-of-range and fret boundary', () => {
  assert.deepEqual(fretCandidates(28, STANDARD_BASS_TUNING), [{ string: 4, fret: 0 }]);
  assert.deepEqual(fretCandidates(27, STANDARD_BASS_TUNING), []);
  assert.deepEqual(fretCandidates(39), []);
  assert.deepEqual(fretCandidates(64, undefined, 0), [{ string: 1, fret: 0 }]);
});
test('custom tuning preserves supplied string numbering; invalid arguments reject', () => {
  assert.deepEqual(fretCandidates(38, [64, 59, 55, 50, 45, 38]), [{ string: 6, fret: 0 }]);
  for (const args of [[-1], [128], [64.5], [64, []], [64, [NaN]], [64, [64], 37]]) assert.throws(() => fretCandidates(...args), RangeError);
});
test('binary MIDI imports all tracks with GM metadata, seconds and no fabricated confidence', () => {
  const midi = new Midi(); midi.header.setTempo(120);
  for (const [program, pitch] of [[24, 64], [32, 28], [0, 60]]) {
    const track = midi.addTrack(); track.instrument.number = program;
    track.addNote({ midi: pitch, time: 0.5, duration: 0.25, velocity: 0.8 });
  }
  const drums = midi.addTrack(); drums.channel = 9; drums.addNote({ midi: 36, time: 0, duration: 0.1 });
  const score = importMidiScore(midi.toArray());
  assert.deepEqual(score.tracks.map(t => t.instrument), ['guitar', 'bass', 'piano', 'drums']);
  assert.equal(new Set(score.tracks.map(t => t.id)).size, 4);
  const n = score.tracks[0].notes[0]; assert.equal(n.startSeconds, 0.5); assert.equal(n.durationSeconds, 0.25); assert.equal(n.confidence, undefined);
});
test('tempo changes retain absolute timing without pretending one BPM is the tempo map', () => {
  const midi = new Midi(); midi.header.tempos = [{ ticks: 0, bpm: 120 }, { ticks: midi.header.ppq, bpm: 60 }]; midi.header.update();
  midi.addTrack().addNote({ midi: 64, ticks: midi.header.ppq * 2, durationTicks: midi.header.ppq });
  const score = importMidiScore(midi.toArray()); assert.equal(score.bpm, 120);
  assert.equal(score.tracks[0].notes[0].startSeconds, 1.5); assert.equal(score.tracks[0].notes[0].durationSeconds, 1);
});
test('empty MIDI and malformed MIDI handled explicitly', () => {
  assert.deepEqual(importMidiScore(new Midi().toArray()).tracks, []);
  assert.throws(() => importMidiScore(new Uint8Array([1, 2, 3])));
});
test('simultaneous notes survive; candidate listing does not claim chord optimization', () => {
  const midi = new Midi(); const t = midi.addTrack(); t.instrument.number = 24;
  for (const midiPitch of [64, 67]) t.addNote({ midi: midiPitch, time: 0, duration: 0.5 });
  const s = importMidiScore(midi.toArray()); assert.equal(s.tracks[0].notes.length, 2); assert.ok(s.tracks[0].notes.every(n => n.startSeconds === 0));
});
