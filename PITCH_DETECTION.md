# Pitch Detection Implementation Guide

## Overview

This document describes the real-time pitch detection system implemented for the vocal rhythm game. The system captures microphone input, detects the sung pitch, and automatically scores points when the player matches the expected notes.

## How It Works

### 1. Microphone Capture
The `PitchDetector` class uses the Web Audio API to:
- Request microphone access from the user
- Create an `AudioContext` for audio processing
- Connect the microphone to an `AnalyserNode` for signal analysis

### 2. Pitch Detection Algorithm
The system uses the **autocorrelation method** (based on the YIN algorithm):

```typescript
// Key steps:
1. Capture time-domain audio data from the microphone
2. Calculate RMS (Root Mean Square) to detect signal presence
3. Perform autocorrelation to find the fundamental frequency
4. Convert frequency to MIDI note number
```

**Signal Processing:**
- **FFT Size**: 2048 samples for accurate low-frequency detection
- **Sample Rate**: Browser default (usually 44100 Hz or 48000 Hz)
- **Minimum Signal Threshold**: 0.01 RMS to filter out silence/noise
- **Correlation Threshold**: 0.9 for high-confidence peak detection

### 3. Note Matching
The `GameEngine` coordinates pitch detection with gameplay:

```typescript
// Matching Process:
1. Track "active notes" - notes within the hit window (±0.5 seconds)
2. Compare detected MIDI note with active note pitches
3. Allow ±1 semitone tolerance for successful hits
4. Calculate accuracy based on pitch difference
5. Award points and increase combo on successful hits
```

**Scoring Formula:**
```
baseScore = 100 points
accuracyBonus = accuracy × 50 points (0-50 based on pitch precision)
comboMultiplier = min(combo / 10, 2) (up to 2x multiplier)
finalScore = (baseScore + accuracyBonus) × (1 + comboMultiplier)
```

### 4. Visual Feedback
The `GameView` component displays:
- **Pink circles**: Expected notes scrolling down the timeline
- **Cyan circle**: Player's current pitch in the hit zone
- **Pitch display**: Shows note name (e.g., "C4") and frequency (e.g., "261Hz")
- **Stats panel**: Real-time score, combo, accuracy, and current pitch

## Configuration Options

### Adjustable Parameters

#### PitchDetector (src/core/PitchDetector.ts)
```typescript
MIN_SIGNAL_THRESHOLD = 0.01    // Minimum RMS for signal detection
CORRELATION_THRESHOLD = 0.9    // Minimum correlation for peak detection
MIN_CORRELATION_THRESHOLD = 0.01  // Minimum correlation for valid pitch
```

#### GameEngine (src/core/GameEngine.ts)
```typescript
HIT_WINDOW = 0.5              // Seconds before/after note time
PITCH_TOLERANCE = 1           // Semitones allowed for note hits
MAX_PITCH_DIFF = PITCH_TOLERANCE + 1  // For accuracy calculation
```

### Tuning Tips

**If pitch detection is too sensitive:**
- Increase `MIN_SIGNAL_THRESHOLD` (e.g., 0.02)
- Increase `CORRELATION_THRESHOLD` (e.g., 0.95)

**If pitch detection misses notes:**
- Decrease `MIN_SIGNAL_THRESHOLD` (e.g., 0.005)
- Decrease `CORRELATION_THRESHOLD` (e.g., 0.85)

**For easier/harder gameplay:**
- Adjust `PITCH_TOLERANCE` (0 = exact pitch, 2 = ±2 semitones)
- Adjust `HIT_WINDOW` (0.3 = strict timing, 0.7 = generous timing)

## Technical Details

### Frequency to MIDI Conversion
```typescript
midiNote = 69 + 12 × log₂(frequency / 440)
```
Where:
- 440 Hz = A4 (MIDI note 69)
- Each semitone = frequency ratio of 2^(1/12)

### Autocorrelation Process
1. **Input**: Time-domain audio buffer (Float32Array)
2. **Output**: Fundamental frequency in Hz

The algorithm:
- Computes correlation at various time lags
- Finds the lag with highest positive correlation
- Converts lag to frequency: `frequency = sampleRate / lag`

### Performance Considerations
- Pitch detection runs at ~60 FPS using `requestAnimationFrame`
- Autocorrelation complexity: O(n²) where n = buffer size
- Buffer size of 2048 samples is a good balance between accuracy and performance
- Detection latency: ~50ms (typical for real-time audio processing)

## Browser Compatibility

### Requirements
- **Modern Browser**: Chrome 66+, Firefox 65+, Safari 12+, Edge 79+
- **HTTPS Required**: Microphone access requires secure context (https:// or localhost)
- **Permissions**: User must grant microphone access

### Known Limitations
- Mobile browsers may have higher latency (~100-150ms)
- Some browsers require user interaction before accessing audio devices
- Background tab throttling may affect pitch detection accuracy

## Debugging

### Console Messages
In development mode, the game logs:
```
PitchDetector initialized successfully
Song loaded: [title] { notes: X, duration: Y }
Note hit! Expected: 60, Detected: 60, Accuracy: 1.00
```

### Common Issues

**No pitch detected:**
- Check browser console for initialization errors
- Verify microphone permissions are granted
- Ensure microphone is not muted in system settings
- Try singing louder or moving closer to the microphone

**Inaccurate pitch detection:**
- Check for background noise
- Verify microphone quality (built-in vs. external)
- Ensure proper vocal technique (clear, sustained notes)
- Check microphone input levels (not too loud/distorted)

**High latency:**
- Close other applications using audio
- Try a different browser
- Reduce browser tab count
- Disable browser extensions

## Future Improvements

Potential enhancements to the pitch detection system:

1. **Advanced Algorithms**
   - Implement AMDF (Average Magnitude Difference Function)
   - Add harmonic product spectrum for better accuracy
   - Implement vibrato detection and compensation

2. **Calibration**
   - Auto-calibration for different microphones
   - User-adjustable sensitivity settings
   - Visual pitch deviation indicator

3. **Performance**
   - Web Workers for off-main-thread processing
   - WebAssembly implementation for faster autocorrelation
   - Dynamic buffer size based on device performance

4. **Features**
   - Pitch drift correction
   - Formant analysis for better vocal recognition
   - Multi-pitch detection for harmonies

## References

- [YIN Algorithm Paper](http://audition.ens.fr/adc/pdf/2002_JASA_YIN.pdf)
- [Web Audio API Specification](https://www.w3.org/TR/webaudio/)
- [Autocorrelation Pitch Detection](https://en.wikipedia.org/wiki/Autocorrelation#Pitch_detection)
