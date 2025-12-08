export interface Translations {
  app: {
    title: string;
    loading: string;
    preparingSong: string;
    error: string;
    dismiss: string;
  };
  songSelector: {
    title: string;
    selectSong: string;
    howToPlay: string;
    instructions: {
      select: string;
      sing: string;
      hitNotes: string;
      buildCombos: string;
    };
  };
  gameView: {
    score: string;
    combo: string;
    accuracy: string;
    yourPitch: string;
    start: string;
    resume: string;
    pause: string;
    stop: string;
    backToSongSelection: string;
  };
  difficulty: {
    easy: string;
    medium: string;
    hard: string;
  };
}

export const translations: Record<string, Translations> = {
  es: {
    app: {
      title: 'Juego de Ritmo Vocal',
      loading: 'Cargando...',
      preparingSong: 'Preparando tu canción...',
      error: 'Error',
      dismiss: 'Cerrar',
    },
    songSelector: {
      title: '🎤 Juego de Ritmo Vocal',
      selectSong: 'Selecciona una Canción',
      howToPlay: 'Cómo Jugar',
      instructions: {
        select: 'Selecciona una canción para comenzar',
        sing: 'Canta junto con la melodía vocal',
        hitNotes: 'Alcanza las notas correctas para ganar puntos',
        buildCombos: 'Construye combos para puntajes más altos',
      },
    },
    gameView: {
      score: 'Puntuación',
      combo: 'Combo',
      accuracy: 'Precisión',
      yourPitch: 'Tu Tono',
      start: 'Comenzar',
      resume: 'Reanudar',
      pause: 'Pausar',
      stop: 'Detener',
      backToSongSelection: 'Volver a Selección de Canciones',
    },
    difficulty: {
      easy: 'Fácil',
      medium: 'Medio',
      hard: 'Difícil',
    },
  },
  en: {
    app: {
      title: 'Vocal Rhythm Game',
      loading: 'Loading...',
      preparingSong: 'Preparing your song...',
      error: 'Error',
      dismiss: 'Dismiss',
    },
    songSelector: {
      title: '🎤 Vocal Rhythm Game',
      selectSong: 'Select a Song',
      howToPlay: 'How to Play',
      instructions: {
        select: 'Select a song to begin',
        sing: 'Sing along with the vocal melody',
        hitNotes: 'Hit the right notes to score points',
        buildCombos: 'Build combos for higher scores',
      },
    },
    gameView: {
      score: 'Score',
      combo: 'Combo',
      accuracy: 'Accuracy',
      yourPitch: 'Your Pitch',
      start: 'Start',
      resume: 'Resume',
      pause: 'Pause',
      stop: 'Stop',
      backToSongSelection: 'Back to Song Selection',
    },
    difficulty: {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
    },
  },
  fr: {
    app: {
      title: 'Jeu de Rythme Vocal',
      loading: 'Chargement...',
      preparingSong: 'Préparation de votre chanson...',
      error: 'Erreur',
      dismiss: 'Fermer',
    },
    songSelector: {
      title: '🎤 Jeu de Rythme Vocal',
      selectSong: 'Sélectionnez une Chanson',
      howToPlay: 'Comment Jouer',
      instructions: {
        select: 'Sélectionnez une chanson pour commencer',
        sing: 'Chantez avec la mélodie vocale',
        hitNotes: 'Atteignez les bonnes notes pour marquer des points',
        buildCombos: 'Construisez des combos pour des scores plus élevés',
      },
    },
    gameView: {
      score: 'Score',
      combo: 'Combo',
      accuracy: 'Précision',
      yourPitch: 'Votre Tonalité',
      start: 'Commencer',
      resume: 'Reprendre',
      pause: 'Pause',
      stop: 'Arrêter',
      backToSongSelection: 'Retour à la Sélection de Chansons',
    },
    difficulty: {
      easy: 'Facile',
      medium: 'Moyen',
      hard: 'Difficile',
    },
  },
  de: {
    app: {
      title: 'Vokal-Rhythmus-Spiel',
      loading: 'Laden...',
      preparingSong: 'Ihr Lied wird vorbereitet...',
      error: 'Fehler',
      dismiss: 'Schließen',
    },
    songSelector: {
      title: '🎤 Vokal-Rhythmus-Spiel',
      selectSong: 'Wählen Sie ein Lied',
      howToPlay: 'Wie man spielt',
      instructions: {
        select: 'Wählen Sie ein Lied aus, um zu beginnen',
        sing: 'Singen Sie mit der Gesangsmelodie',
        hitNotes: 'Treffen Sie die richtigen Noten, um Punkte zu erzielen',
        buildCombos: 'Bauen Sie Combos für höhere Punktzahlen auf',
      },
    },
    gameView: {
      score: 'Punktzahl',
      combo: 'Combo',
      accuracy: 'Genauigkeit',
      yourPitch: 'Ihre Tonhöhe',
      start: 'Start',
      resume: 'Fortsetzen',
      pause: 'Pause',
      stop: 'Stoppen',
      backToSongSelection: 'Zurück zur Liedauswahl',
    },
    difficulty: {
      easy: 'Einfach',
      medium: 'Mittel',
      hard: 'Schwer',
    },
  },
  pt: {
    app: {
      title: 'Jogo de Ritmo Vocal',
      loading: 'Carregando...',
      preparingSong: 'Preparando sua música...',
      error: 'Erro',
      dismiss: 'Fechar',
    },
    songSelector: {
      title: '🎤 Jogo de Ritmo Vocal',
      selectSong: 'Selecione uma Música',
      howToPlay: 'Como Jogar',
      instructions: {
        select: 'Selecione uma música para começar',
        sing: 'Cante junto com a melodia vocal',
        hitNotes: 'Acerte as notas certas para marcar pontos',
        buildCombos: 'Construa combos para pontuações mais altas',
      },
    },
    gameView: {
      score: 'Pontuação',
      combo: 'Combo',
      accuracy: 'Precisão',
      yourPitch: 'Seu Tom',
      start: 'Iniciar',
      resume: 'Retomar',
      pause: 'Pausar',
      stop: 'Parar',
      backToSongSelection: 'Voltar à Seleção de Músicas',
    },
    difficulty: {
      easy: 'Fácil',
      medium: 'Médio',
      hard: 'Difícil',
    },
  },
};

export const languages = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'pt', name: 'Português' },
];

export const defaultLanguage = 'es';
