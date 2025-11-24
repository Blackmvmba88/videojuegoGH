/**
 * PitchDetector - Detects pitch from microphone input using autocorrelation
 */
export class PitchDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private dataArray: Float32Array | null = null;
  private isListening = false;
  private onPitchDetected?: (frequency: number, midiNote: number) => void;
  private rafId: number | null = null;

  /**
   * Initialize the pitch detector with microphone access
   */
  async initialize(): Promise<void> {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create audio context
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;

      // Connect microphone to analyser
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);

      // Create data array for analysis
      const bufferLength = this.analyser.fftSize;
      this.dataArray = new Float32Array(bufferLength);

      if (import.meta.env.DEV) {
        console.log('PitchDetector initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize microphone:', error);
      throw new Error('Microphone access denied or not available');
    }
  }

  /**
   * Start listening for pitch
   */
  startListening(callback: (frequency: number, midiNote: number) => void): void {
    if (!this.audioContext || !this.analyser || !this.dataArray) {
      console.warn('PitchDetector not initialized');
      return;
    }

    this.isListening = true;
    this.onPitchDetected = callback;
    this.detectPitch();
  }

  /**
   * Stop listening for pitch
   */
  stopListening(): void {
    this.isListening = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Main pitch detection loop
   */
  private detectPitch(): void {
    if (!this.isListening || !this.analyser || !this.dataArray) {
      return;
    }

    // Get time domain data
    const buffer = new Float32Array(this.dataArray.length);
    this.analyser.getFloatTimeDomainData(buffer);

    // Detect pitch using autocorrelation
    const frequency = this.autoCorrelate(buffer, this.audioContext!.sampleRate);

    // Convert frequency to MIDI note
    if (frequency > 0 && this.onPitchDetected) {
      const midiNote = this.frequencyToMidi(frequency);
      this.onPitchDetected(frequency, midiNote);
    }

    // Schedule next detection
    this.rafId = requestAnimationFrame(() => this.detectPitch());
  }

  /**
   * Autocorrelation algorithm for pitch detection
   * Based on the YIN algorithm
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private autoCorrelate(buffer: any, sampleRate: number): number {
    // Find the size of the buffer
    const size = buffer.length;
    
    // Calculate RMS (Root Mean Square) to detect if there's enough signal
    let rms = 0;
    for (let i = 0; i < size; i++) {
      rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / size);
    
    // If RMS is too low, there's not enough signal (silence or very quiet)
    if (rms < 0.01) {
      return -1;
    }

    // Autocorrelation
    const correlations = new Array(size).fill(0);
    
    for (let lag = 0; lag < size; lag++) {
      for (let i = 0; i < size - lag; i++) {
        correlations[lag] += buffer[i] * buffer[i + lag];
      }
    }

    // Find the first peak after the first zero crossing
    let foundGoodCorrelation = false;
    let bestOffset = -1;
    let bestCorrelation = 0;
    
    for (let offset = 1; offset < size; offset++) {
      const correlation = correlations[offset];
      
      if (correlation > 0.9 && correlation > correlations[offset - 1]) {
        foundGoodCorrelation = true;
      }
      
      if (foundGoodCorrelation && correlation < 0) {
        break;
      }
      
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    }

    if (bestCorrelation > 0.01 && bestOffset !== -1) {
      const fundamentalFreq = sampleRate / bestOffset;
      return fundamentalFreq;
    }

    return -1;
  }

  /**
   * Convert frequency (Hz) to MIDI note number
   */
  private frequencyToMidi(frequency: number): number {
    return Math.round(69 + 12 * Math.log2(frequency / 440));
  }

  /**
   * Check if currently listening
   */
  isActive(): boolean {
    return this.isListening;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopListening();
    
    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone.mediaStream.getTracks().forEach(track => track.stop());
      this.microphone = null;
    }
    
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
