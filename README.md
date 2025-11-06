# 🎤 Vocal Rhythm Game

A vocal rhythm game prototype inspired by Guitar Hero, but focused 100% on voice. Sing along to your favorite songs and hit the right notes to score points!

## 🎮 Features

- **MIDI-based Gameplay**: Visual timeline based on MIDI vocal melodies
- **Song Selection**: Easy-to-use interface for selecting and loading songs
- **Real-time Visualization**: See notes coming down the timeline as you play
- **Scoring System**: Score points and build combos based on vocal accuracy
- **Audio Stems Support**: Separate vocal and instrumental tracks for better gameplay
- **Extensible Architecture**: Easy to add new songs and expand functionality

## 📁 Project Structure

```
vocal-rhythm-game/
├── public/
│   ├── songs/
│   │   ├── song1/
│   │   │   ├── melody.mid
│   │   │   ├── vocal.mp3
│   │   │   └── instrumental.mp3
│   │   └── song2/
│   │       ├── melody.mid
│   │       ├── vocal.mp3
│   │       └── instrumental.mp3
│   └── index.html
├── src/
│   ├── components/
│   │   ├── App.tsx              # Main application component
│   │   ├── SongSelector.tsx     # Song selection interface
│   │   └── GameView.tsx         # Game visualization and controls
│   ├── core/
│   │   ├── GameEngine.ts        # Main game logic controller
│   │   ├── AudioManager.ts      # Audio playback management (Tone.js)
│   │   ├── MIDIParser.ts        # MIDI file parsing (@tonejs/midi)
│   │   └── SongLoader.ts        # Song library management
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── styles/
│   │   ├── index.css            # Global styles
│   │   └── App.css              # Component styles
│   └── main.tsx                 # Application entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Blackmvmba88/videojuegoGH.git
cd videojuegoGH
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## 🎵 Adding Your Own Songs

To add a new song to the game:

1. **Prepare Your Files**:
   - MIDI file with the vocal melody (`melody.mid`)
   - Audio stem with isolated vocals (`vocal.mp3`)
   - Audio stem with instrumental track (`instrumental.mp3`)

2. **Create a Song Folder**:
   ```bash
   mkdir public/songs/my-song
   ```

3. **Add Your Files**:
   - Place all three files in the song folder
   - Ensure files are time-aligned and synchronized

4. **Register the Song**:
   - Open `src/core/SongLoader.ts`
   - Add a new song object to the `songs` array:
   ```typescript
   {
     id: 'my-song',
     title: 'My Song Title',
     artist: 'Artist Name',
     midiPath: '/songs/my-song/melody.mid',
     vocalStemPath: '/songs/my-song/vocal.mp3',
     instrumentalStemPath: '/songs/my-song/instrumental.mp3',
     duration: 240, // duration in seconds
     difficulty: 'medium',
     bpm: 120,
   }
   ```

### Tools for Creating MIDI and Stems

- **MIDI Creation**:
  - Melodyne (extract MIDI from audio)
  - Logic Pro / Ableton (manual transcription)
  - MuseScore (notation software)

- **Stem Separation**:
  - [Spleeter](https://github.com/deezer/spleeter) (Free, open-source)
  - [Demucs](https://github.com/facebookresearch/demucs) (Free, state-of-the-art)
  - iZotope RX De-mix (Professional)
  - Moises.ai (Online service)

## 🎯 How to Play

1. **Select a Song**: Choose from available songs in the song selector
2. **Start the Game**: Click "Start" to begin playing
3. **Sing Along**: Watch the notes come down the timeline
4. **Hit the Notes**: Sing the correct pitch at the right time
5. **Build Combos**: Hit consecutive notes to increase your score multiplier
6. **Track Your Progress**: Monitor your score, combo, and accuracy

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Audio Engine**: Tone.js
- **MIDI Parsing**: @tonejs/midi
- **Styling**: CSS3 with modern features

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Core Modules

### GameEngine
Main game logic controller that coordinates all game systems:
- Song loading and initialization
- Game state management
- Score calculation and combo tracking
- Game loop and timing

### AudioManager
Handles all audio playback using Tone.js:
- Audio context initialization
- Stem loading (vocal and instrumental)
- Playback controls (play, pause, stop, seek)
- Volume control for individual stems

### MIDIParser
Parses MIDI files and extracts vocal notes:
- MIDI file loading
- Note extraction (pitch, time, duration)
- BPM detection
- Duration calculation

### SongLoader
Manages the song library:
- Song metadata storage
- Song retrieval by ID
- Dynamic song addition/removal

## 🎨 Customization

### Styling
All styles are in `src/styles/`. You can customize:
- Colors and gradients
- Component layouts
- Animations and transitions
- Responsive breakpoints

### Game Logic
Modify scoring and gameplay in `src/core/GameEngine.ts`:
- Scoring algorithm
- Combo multipliers
- Accuracy calculation
- Note hit detection window

### Visualization
Update the canvas rendering in `src/components/GameView.tsx`:
- Note appearance and size
- Timeline visualization
- Hit zone styling
- Color schemes

## 🚧 Future Enhancements

Potential features to add:
- [ ] Real-time pitch detection from microphone input
- [ ] Lyric display synchronized with MIDI
- [ ] Multiple difficulty levels per song
- [ ] High score persistence (localStorage or backend)
- [ ] Multiplayer mode
- [ ] Custom note skins and themes
- [ ] Song editor for creating custom charts
- [ ] Practice mode with tempo adjustment
- [ ] Achievement system
- [ ] Leaderboards

## 📄 License

This project is open source and available for forking and modification.

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### Audio Not Playing
- Ensure you've clicked a button to initialize the audio context (browser requirement)
- Check that audio files are in the correct format (MP3, WAV, OGG)
- Verify file paths in `SongLoader.ts`

### MIDI Not Loading
- Confirm MIDI files are valid (test in a MIDI player)
- Check that the MIDI file path is correct
- Ensure the MIDI file has at least one track with notes

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Ensure you're using Node.js v18 or higher
- Check for TypeScript errors: `npm run build`

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the documentation in `/public/songs/` folders

---

Built with ❤️ for vocal rhythm game enthusiasts
