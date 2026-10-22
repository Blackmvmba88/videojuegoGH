# PR 6 — executable MIDI / score / manual TAB slice

Reviewed original head `3d76fd57094f38716d13dfed218417e2e9189485` (2 files, +107 lines). Initially open draft, with no PR workflow runs returned on 2026-10-22. During this work PR #6 was concurrently merged at 06:47:42 UTC, including only original head 3d76fd5. This follow-up slice is delivered separately.

## Findings and implemented scope
- Original score model compiled successfully locally. No tests or CI gate existed.
- Original typed validator could throw on malformed JSON and omitted instrument and velocity validation. It now accepts unknown, returns path-qualified errors, and rejects invalid structures, enums, nonfinite timing, overflow, duplicate/blank track IDs and normalized velocity/confidence outside 0..1. `parseScore` is the import boundary.
- Existing MIDIParser extracts only track zero and is used by the vocal game. It remains compatible. New ScoreImport imports every MIDI track through the already installed @tonejs/midi, assigns deterministic IDs and maps GM programs to guitar/bass/piano/drums/other. Instrument metadata is a hint, not audio recognition.
- MIDI timing uses absolute seconds calculated from the tempo map. v1 BPM represents only the initial tempo; beat quantization must not assume constant tempo. Imported MIDI deliberately has no model confidence.
- ScoreLab imports local MIDI or score JSON, selects a track, steps through notes, displays timing/confidence, and lets the user choose among guitar/bass fret candidates. It preserves manual choices in memory for this session only. Out-of-range notes and unsupported instruments are explicit. No original fingering or playable chord sequence is inferred.
- Lab entry `?mode=score` mounts independently of the vocal engine, avoiding its startup microphone request. The existing vocal gameplay path is unchanged.

## Reproduce
```sh
npm ci
npm run gate
npm run dev -- --host 127.0.0.1
```
Open the printed dev URL with `?mode=score`. The included manual riff is available without files or microphone. Import a .mid/.midi or MusicScore .json (maximum 5 MB), select a guitar/bass track, step through notes and choose a position. Invalid imports keep the previous score and show an error.

## Minimum merge gate
`npm ci` from the committed lockfile, then `npm run gate`: 12 node:test tests (compiled with strict TypeScript), full TypeScript/Vite production build, and ESLint with zero warnings. CI definition: `.github/workflows/score-gate.yml`, Node 22. Local execution: Node 24.19.0. No new dependency or lockfile change.

12 tests cover malformed data, score ranges, duplicate IDs, fret equivalence and limits, alternate tuning, multi-track binary MIDI, percussion, tempo changes, empty/corrupt MIDI and simultaneous notes. Tests use actual binary MIDI serialization/reparse, not mocked transcription.

Evidence: original build PASS; updated 12/12 tests PASS; updated production build PASS; lint PASS. Browser smoke attempt blocked: Playwright CLI is available but Chrome/Chromium executable is absent in this runtime. UI compiles but interactive browser acceptance remains unverified. CI workflow definition is delivered; a green remote run is not claimed.

Before declaring the UI ready: browser smoke must import guitar+bass MIDI, change tracks/notes, retain a selected position, report malformed JSON, display empty/out-of-range notes, and verify no microphone request at `?mode=score`. Require green remote gate on the current SHA or record equivalent local evidence if Actions is unavailable. Keep draft until UI smoke passes; do not silently treat workflow presence as branch protection.

## Integration decision
Score schema, hardened validation, deterministic fret candidates and MIDI-to-score adapter are suitable for integration with the passing core gate. The manual review screen is delivered as a preview; not a validated full-game release. This follow-up slice has not been merged to main; PR #6 itself was merged concurrently by another actor.

## Next priorities (acceptance criteria)
1. **P0 — UI smoke and review persistence:** execute browser acceptance; persist score edits plus TAB decisions separately from source notes, with stable note IDs, tuning/capo and provenance. Reload must reproduce choices. Route reviewed tracks into the game via an explicit adapter, retaining source timing.
2. **P1 — MIDI roundtrip and tempo-aware rhythm:** preserve tempo/time-signature maps in a versioned schema; export/reimport fixtures without pitch or timing loss. Quantization is an optional derived representation with measured timing error, never destructive replacement of observations.
3. **P1 — Playable TAB:** constrained sequence/chord optimization with one note per string at an instant, sustain occupancy, hand span and shift costs. Fixtures must identify impossible chords; manual overrides win. Per-note fret candidates alone cannot satisfy these constraints.
4. **P2 — Measured transcription adapter:** begin with isolated monophonic audio and labeled references; define onset/offset and pitch metrics, confidence semantics, model/version/source provenance and user correction. Existing microphone autocorrelation is not an offline transcription service and has not been benchmarked here.
5. **P3 — Stem separation and polyphonic transcription:** separate backend job lifecycle, resource limits and independently measured stems/transcription quality. Only expose supported instruments after evaluation; never represent MIDI program mapping or an optional stem URL as AI capability.

Not implemented: audio-to-notes, stem generation, audio-synchronized TAB playback, score editing/export, quantization, automatic fingering optimization or persisted selections.
