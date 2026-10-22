import { useRef, useState } from 'react';
import { MusicScore, parseScore, fretCandidates, STANDARD_BASS_TUNING, STANDARD_GUITAR_TUNING } from '../core/MusicScore';
import { importMidiScore } from '../core/ScoreImport';

const demo: MusicScore = {
  schemaVersion: '1.0', title: 'Riff de prueba manual', bpm: 120,
  tracks: [{ id: 'guitar-1', instrument: 'guitar', notes: [64, 67, 69, 64].map((pitch, i) => ({ pitch, startSeconds: i * 0.5, durationSeconds: 0.5 })) }],
};

/** Manual TAB review; independent of audio/microphone permissions. */
export function ScoreLab() {
  const [score, setScore] = useState<MusicScore>(demo);
  const [trackIndex, setTrackIndex] = useState(0);
  const [noteIndex, setNoteIndex] = useState(0);
  const [positions, setPositions] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const request = useRef(0);
  const track = score.tracks[trackIndex];
  const note = track?.notes[noteIndex];
  const tuning = track?.instrument === 'bass' ? STANDARD_BASS_TUNING : STANDARD_GUITAR_TUNING;
  const supported = track?.instrument === 'guitar' || track?.instrument === 'bass';
  const candidates = note && supported ? fretCandidates(note.pitch, tuning) : [];
  const key = `${trackIndex}:${noteIndex}`;

  async function load(file: File | undefined) {
    if (!file) return;
    const id = ++request.current;
    try {
      if (!file.size || file.size > 5 * 1024 * 1024) throw new Error('Usa un archivo de 1 byte a 5 MB.');
      const next = /\.midi?$/i.test(file.name)
        ? importMidiScore(await file.arrayBuffer(), file.name)
        : parseScore(JSON.parse(await file.text()));
      if (id !== request.current) return;
      setScore(next); setTrackIndex(0); setNoteIndex(0); setPositions({}); setError('');
    } catch (err) {
      if (id === request.current) setError(err instanceof Error ? err.message : 'Archivo inválido');
    }
  }
  return <main className="app">
    <h1>MusicScore · Revisión TAB</h1>
    <p>MIDI o JSON local. Instrumentos según metadata MIDI; sin separación ni transcripción de audio.</p>
    <label>Importar MIDI / MusicScore JSON <input type="file" accept=".mid,.midi,.json" onChange={e => { void load(e.target.files?.[0]); e.target.value = ''; }} /></label>
    {error && <p role="alert">{error}</p>}
    <h2>{score.title}</h2>
    <p>{score.bpm} BPM iniciales. Los tiempos originales se conservan en segundos.</p>
    <label>Pista <select value={trackIndex} onChange={e => { setTrackIndex(Number(e.target.value)); setNoteIndex(0); }}>
      {score.tracks.map((item, i) => <option key={item.id} value={i}>{item.id} · {item.instrument} · {item.notes.length} notas</option>)}
    </select></label>
    {note ? <section aria-label="Nota y candidatos TAB">
      <p>Nota {noteIndex + 1}/{track.notes.length}: MIDI {note.pitch} · {note.startSeconds.toFixed(3)} s · duración {note.durationSeconds.toFixed(3)} s · confianza {note.confidence ?? 'no disponible'}</p>
      <button disabled={noteIndex === 0} onClick={() => setNoteIndex(noteIndex - 1)}>Anterior</button>
      <button disabled={noteIndex + 1 === track.notes.length} onClick={() => setNoteIndex(noteIndex + 1)}>Siguiente</button>
      {!supported ? <p>TAB disponible para pistas identificadas como guitarra o bajo.</p> : candidates.length ? <>
        <label>Posición manual <select value={positions[key] ?? ''} onChange={e => setPositions({ ...positions, [key]: e.target.value })}>
          <option value="">Sin elegir</option>
          {candidates.map(p => <option key={p.string} value={`${p.string}:${p.fret}`}>Cuerda {p.string}, traste {p.fret}</option>)}
        </select></label>
        <p>Selección: {positions[key] ?? 'pendiente'}. Se conserva durante esta sesión; no estima la digitación original.</p>
      </> : <p>Fuera del rango de esta afinación (0–24 trastes).</p>}
    </section> : <p>Esta pista no contiene notas.</p>}
    <p><a href="/">Volver al juego vocal</a></p>
  </main>;
}
