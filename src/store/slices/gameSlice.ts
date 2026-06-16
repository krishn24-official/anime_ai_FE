import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AkinatorCharacter {
  name: string;
  anime: string;
  image: string;
  attributes: Record<string, boolean>; // e.g., 'naruto': true, 'whiteHair': false
}

interface GameState {
  // Akinator State
  akinator: {
    currentQuestionIndex: number;
    answers: Record<string, 'yes' | 'no' | 'dont_know'>;
    gameState: 'intro' | 'playing' | 'guessed' | 'failed';
    guess: AkinatorCharacter | null;
  };
  // TikTok Swipe Game State
  tiktok: {
    characterPool: { id: string; name: string; anime: string; image: string; power: number; trait: string }[];
    currentCardIndex: number;
    team: { id: string; name: string; anime: string; image: string; power: number; trait: string }[];
    teamEvaluated: boolean;
    synergyScore: number;
    synergyTier: string;
    synergyFeedback: string;
  };
}

const akinatorCharacters: AkinatorCharacter[] = [
  { name: 'Naruto Uzumaki', anime: 'Naruto', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80', attributes: { protagonist: true, ninja: true, dead: false, overpowered: true, teacher: false, whiteHair: false } },
  { name: 'Gojo Satoru', anime: 'Jujutsu Kaisen', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=80', attributes: { protagonist: false, ninja: false, dead: true, overpowered: true, teacher: true, whiteHair: true } },
  { name: 'Kakashi Hatake', anime: 'Naruto', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80', attributes: { protagonist: false, ninja: true, dead: false, overpowered: false, teacher: true, whiteHair: true } },
  { name: 'Monkey D. Luffy', anime: 'One Piece', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=300&auto=format&fit=crop&q=80', attributes: { protagonist: true, ninja: false, dead: false, overpowered: true, teacher: false, whiteHair: false } },
  { name: 'Madara Uchiha', anime: 'Naruto', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80', attributes: { protagonist: false, ninja: true, dead: true, overpowered: true, teacher: false, whiteHair: false } },
  { name: 'Levi Ackerman', anime: 'Attack on Titan', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', attributes: { protagonist: false, ninja: false, dead: false, overpowered: true, teacher: true, whiteHair: false } }
];

const akinatorQuestions = [
  { key: 'protagonist', text: 'Is your character the main protagonist?' },
  { key: 'ninja', text: 'Is your character a ninja?' },
  { key: 'whiteHair', text: 'Does your character have white or silver hair?' },
  { key: 'overpowered', text: 'Is your character extremely overpowered or considered "the strongest"?' },
  { key: 'teacher', text: 'Is your character a teacher/mentor to the main cast?' },
  { key: 'dead', text: 'Is your character dead/deceased in the main series timeline?' }
];

const initialTiktokPool = [
  { id: 't1', name: 'Zoro', anime: 'One Piece', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80', power: 90, trait: 'Lost Direction' },
  { id: 't2', name: 'Sukuna', anime: 'Jujutsu Kaisen', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=80', power: 98, trait: 'Malevolent Cook' },
  { id: 't3', name: 'Saitama', anime: 'One Punch Man', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=300&auto=format&fit=crop&q=80', power: 100, trait: 'Bargain Hunter' },
  { id: 't4', name: 'Killua', anime: 'Hunter x Hunter', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', power: 85, trait: 'Choco Robot Fan' },
  { id: 't5', name: 'Zenitsu', anime: 'Demon Slayer', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80', power: 75, trait: 'Sleep Fighter' },
  { id: 't6', name: 'Lelouch', anime: 'Code Geass', image: 'https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?w=300&auto=format&fit=crop&q=80', power: 95, trait: 'Master Tactician' }
];

const initialState: GameState = {
  akinator: {
    currentQuestionIndex: 0,
    answers: {},
    gameState: 'intro',
    guess: null
  },
  tiktok: {
    characterPool: initialTiktokPool,
    currentCardIndex: 0,
    team: [],
    teamEvaluated: false,
    synergyScore: 0,
    synergyTier: 'F',
    synergyFeedback: ''
  }
};

const gameSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    // Akinator Reducers
    startAkinator: (state) => {
      state.akinator.currentQuestionIndex = 0;
      state.akinator.answers = {};
      state.akinator.gameState = 'playing';
      state.akinator.guess = null;
    },
    answerAkinatorQuestion: (state, action: PayloadAction<'yes' | 'no' | 'dont_know'>) => {
      const qKey = akinatorQuestions[state.akinator.currentQuestionIndex].key;
      state.akinator.answers[qKey] = action.payload;

      // Filter remaining candidates
      const filtered = akinatorCharacters.filter(char => {
        for (const [key, val] of Object.entries(state.akinator.answers)) {
          if (val === 'yes' && char.attributes[key] !== true) return false;
          if (val === 'no' && char.attributes[key] !== false) return false;
        }
        return true;
      });

      if (state.akinator.currentQuestionIndex < akinatorQuestions.length - 1 && filtered.length > 1) {
        state.akinator.currentQuestionIndex += 1;
      } else {
        // Evaluate Guessed Character
        if (filtered.length >= 1) {
          state.akinator.guess = filtered[0];
          state.akinator.gameState = 'guessed';
        } else {
          state.akinator.gameState = 'failed';
        }
      }
    },
    resetAkinator: (state) => {
      state.akinator = initialState.akinator;
    },

    // TikTok Game Reducers
    resetTiktokGame: (state) => {
      state.tiktok.currentCardIndex = 0;
      state.tiktok.team = [];
      state.tiktok.teamEvaluated = false;
      state.tiktok.synergyScore = 0;
      state.tiktok.synergyTier = 'F';
      state.tiktok.synergyFeedback = '';
      // Shuffle pool
      state.tiktok.characterPool = [...initialTiktokPool].sort(() => Math.random() - 0.5);
    },
    addToTeam: (state) => {
      const currentCard = state.tiktok.characterPool[state.tiktok.currentCardIndex];
      if (currentCard && state.tiktok.team.length < 3) {
        state.tiktok.team.push(currentCard);
      }
      state.tiktok.currentCardIndex += 1;

      // Evaluate if team has 3 members or pool ran out
      if (state.tiktok.team.length === 3) {
        const totalPower = state.tiktok.team.reduce((acc, char) => acc + char.power, 0);
        const averagePower = Math.round(totalPower / 3);

        state.tiktok.synergyScore = averagePower;
        state.tiktok.teamEvaluated = true;

        if (averagePower >= 95) {
          state.tiktok.synergyTier = 'S';
          state.tiktok.synergyFeedback = 'Godlike Team! The multiverse is trembling before your lineup.';
        } else if (averagePower >= 85) {
          state.tiktok.synergyTier = 'A';
          state.tiktok.synergyFeedback = 'Elite Team. Ready to conquer the Culling Game or enter Grand Line.';
        } else if (averagePower >= 75) {
          state.tiktok.synergyTier = 'B';
          state.tiktok.synergyFeedback = 'Solid Team. Good synergy but might struggle against top tier gods.';
        } else {
          state.tiktok.synergyTier = 'C';
          state.tiktok.synergyFeedback = 'Average squad. Fun characters, but Saitama is carrying you.';
        }
      }
    },
    skipCard: (state) => {
      state.tiktok.currentCardIndex += 1;
      if (state.tiktok.currentCardIndex >= state.tiktok.characterPool.length && state.tiktok.team.length < 3) {
        state.tiktok.teamEvaluated = true;
        state.tiktok.synergyTier = 'F';
        state.tiktok.synergyFeedback = 'Incomplete team! You ran out of cards without picking 3 members.';
      }
    }
  }
});

export const {
  startAkinator,
  answerAkinatorQuestion,
  resetAkinator,
  resetTiktokGame,
  addToTeam,
  skipCard
} = gameSlice.actions;

export const akinatorQuestionsList = akinatorQuestions;
export default gameSlice.reducer;
