import React, { useEffect, useState } from 'react';

/** Local audio preview: no upload, stem separation or transcription. */
export const AudioImport: React.FC = () => {
  const [source, setSource] = useState<{ name: string; url: string; size: number } | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => {
    if (source) URL.revokeObjectURL(source.url);
  }, [source]);

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';
    if (!/\.(wav|mp3|flac|ogg|m4a)$/i.test(file.name) || file.size === 0) {
      setError('Archivo inválido. Usa WAV, MP3, FLAC, OGG o M4A.');
      return;
    }
    setError(null);
    setDuration(null);
    setSource({ name: file.name, size: file.size, url: URL.createObjectURL(file) });
  };

  return (
    <section aria-label="Laboratorio de audio" style={{ marginTop: 24, padding: 16, border: '1px solid #777', borderRadius: 12 }}>
      <h2>BlackMamba · Laboratorio de audio</h2>
      <p>Importa y escucha una canción local. Separación instrumental y TAB vendrán después.</p>
      <label htmlFor="blackmamba-audio">Importar audio: </label>
      <input id="blackmamba-audio" type="file" accept="audio/*,.wav,.mp3,.flac,.ogg,.m4a" onChange={handleFile} />
      {error && <p role="alert">{error}</p>}
      {source && <div>
        <p><strong>{source.name}</strong> · {(source.size / 1048576).toFixed(2)} MB
          {duration !== null && Number.isFinite(duration) ? ` · ${duration.toFixed(1)} s` : ''}</p>
        <audio controls preload="metadata" src={source.url}
          onLoadedMetadata={event => setDuration(event.currentTarget.duration)}
          onError={() => setError('El navegador no puede reproducir este códec; prueba WAV o MP3.')} />
      </div>}
    </section>
  );
};
