# Song 1 - Example Structure

This folder should contain the following files for Song 1:

## Required Files:

1. **melody.mid** - MIDI file containing the vocal melody
   - Track 0 should contain the vocal melody notes
   - Tempo information should be included in the MIDI header

2. **vocal.mp3** - Audio stem with isolated vocals
   - High quality vocal track (preferably 320kbps MP3 or WAV)
   - Should be synchronized with the MIDI file

3. **instrumental.mp3** - Audio stem with instrumental/backing track
   - High quality instrumental track without vocals
   - Should be synchronized with the vocal stem and MIDI file

## File Specifications:

- **Format**: MIDI Type 0 or Type 1 for melody.mid
- **Audio Format**: MP3, WAV, or OGG for audio stems
- **Synchronization**: All files must be time-aligned
- **Duration**: Approximately 3 minutes (180 seconds)

## How to Add Your Song:

1. Export your song's vocal melody as a MIDI file
2. Extract vocal and instrumental stems using tools like:
   - Spleeter
   - Demucs
   - RX De-mix (iZotope)
   - Or use professionally isolated stems if available
3. Place all three files in this folder
4. Update the song metadata in `src/core/SongLoader.ts` if needed

## Tips for Best Results:

- Ensure MIDI notes accurately represent the sung melody
- Use high-quality audio files for better playback
- Test synchronization between MIDI and audio stems
- Consider adding metadata like lyrics or difficulty ratings
