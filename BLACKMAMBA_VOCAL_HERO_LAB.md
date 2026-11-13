# BLACKMAMBA VOCAL HERO LAB 🐍🎤🎸
> Laboratorio experimental de interpretación vocal, videojuegos rítmicos e inteligencia artificial. División: BlackMamba RECORDS / BlackMamba Corp.

**Estado (2026-11-13):** visión y plan de integración documentados. NO se afirma que los módulos estén integrados, probados o desplegados. Esta propuesta no reemplaza el README principal.

## Misión
Convertir grabaciones vocales y canto en vivo en un juego musical con medición reproducible: afinación, ritmo, articulación, dinámica, vibrato, resonancia y expresividad. El sistema debe reconocer incertidumbre, evitar calificaciones complacientes y registrar evidencia. La voz puede funcionar como controlador de juego.

## Inventario inicial de integración (pendiente auditoría de código)
- [videojuegoGH](https://github.com/Blackmvmba88/videojuegoGH): candidato anfitrión; existe PITCH_DETECTION.md.
- [Rockhero](https://github.com/Blackmvmba88/Rockhero): posible motor de juego, pistas y puntuación.
- [MasterSong](https://github.com/Blackmvmba88/MasterSong): documenta ECOSISTEMA_MODULAR.md.
- [Iyari-ear](https://github.com/Blackmvmba88/Iyari-ear): candidato para escucha y análisis.
- [faust](https://github.com/Blackmvmba88/faust): candidato DSP; revisar licencia y coste de compilación.
- BlackMamba GLIDE / MusicScore / HEAR AI / Espejo de David: candidatos adicionales; localizar repositorios y verificar contratos reales antes de reutilizar.

## Arquitectura propuesta
```text
Micrófono / archivo de audio
    ├── Captura segura + búfer circular acotado
    ├── DSP rápido: VAD, RMS, pitch + confianza, onset
    │      └── Bus de eventos VocalFrame v1 (contrato por verificar)
    │              ├── Juego rítmico: notas, combos, puntuación, dificultad
    │              ├── Visualización: espectrograma, pentagrama, retroalimentación
    │              └── Registro reproducible de sesión
    └── Análisis diferido opcional: formantes, vibrato, dinámica, fraseo,
           alineación con referencia, articulación y métricas de interpretación
                    └── Espejo de David: informe, incertidumbre y evidencia
```

## Contrato mínimo propuesto (no implementado)
Cada evento debe incluir: timestamp monotónico, sample_rate, pitch_hz opcional, pitch_confidence, rms, voiced, latency_ms y versión de esquema. Notas y puntuaciones deben distinguir detección automática, referencia musical y juicio interpretativo. Guardar audio solo bajo configuración explícita.

## Presupuesto de recursos: Mac mini M1, 8 GB
- Ruta en vivo sin modelos pesados; frames de audio pequeños y cola acotada.
- Evitar procesos y copias duplicadas; procesar streaming por bloques.
- NumPy + SoundFile como base tentativa; SciPy/librosa/WebAudio/WASM/ML únicamente si las pruebas justifican la dependencia.
- Medir memoria residente, uso CPU, latencia p50/p95, drops y tiempo de análisis. No declarar metas cumplidas sin medición.
- Aplicar degradación progresiva: apagar visualizaciones costosas, reducir resolución, diferir análisis; nunca perder audio sin reportarlo.
- Compatibilidad macOS ARM64; aislamiento por entornos y lockfiles.

## Modos de juego
1. **Vocal Arcade:** notas y timing, rachas, combos y dificultad adaptativa.
2. **Duelo contra referencia:** comparación temporal con tolerancias calibradas; no confundir parecido tímbrico con calidad.
3. **Laboratorio:** espectro, formantes, vibrato, estabilidad y errores.
4. **Espejo de David:** evaluación ciega e imparcial con métricas y límites de confianza.
5. **Sesión épica:** varias tomas, progreso longitudinal, comparación de versiones y exportación de evidencia.

## Plan de trabajo y puertas de calidad
- [ ] Auditar READMEs, árbol, dependencias, licencias, pruebas y rendimiento de cada candidato.
- [ ] Elegir un solo anfitrión; documentar decisiones de reutilización vs. reemplazo.
- [ ] Especificar y probar contrato VocalFrame, timestamps y sincronización audio/juego.
- [ ] Prototipo offline determinista con fixtures sintéticos y grabaciones autorizadas.
- [ ] Integrar detección de pitch con intervalos de confianza y silencios.
- [ ] Integrar motor de notas, scoring y render sin bloquear audio.
- [ ] Benchmarks reproducibles en M1/8 GB, con límites de memoria y regresión.
- [ ] Incorporar análisis avanzado por módulos opcionales.
- [ ] Probar sesiones reales con micrófono, consentimiento y calibración de latencia.
- [ ] Revisar licencias de repositorios y assets antes de copiar código o música.

## Criterios de aceptación
- Pruebas unitarias para pitch, onset, scoring y sincronización.
- Reporte reproducible por grabación: parámetros, versión, latencia, métricas, confianza y fallos.
- Cero afirmaciones de reconocimiento de letras, emoción o identidad sin evidencia suficiente.
- Sin instalar dependencias pesadas de manera automática.
- Integración por rama/PR; no sobrescribir implementaciones útiles.

## Metacomandos (protocolo futuro, NO ejecutables aún)
`/vocal inspect <audio>` — inventario y metadatos.
`/vocal analyze <audio> --profile light|deep` — análisis escalonado.
`/vocal benchmark --target m1-8gb` — rendimiento y degradación.
`/vocal compare <session-a> <session-b>` — evolución cuantitativa.
`/vocal play --mode arcade` — sesión interactiva.
Estos comandos son una especificación, no scripts existentes.

## Siguiente iteración
Leer el código real de videojuegoGH y Rockhero; comparar APIs de detección, estructura y dependencias. Abrir una propuesta técnica con pruebas antes de integrar. Documentar implementado/probado/integrado por separado.
