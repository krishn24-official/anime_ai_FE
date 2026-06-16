import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { BirthdayEntity } from '../../types';
import { eventService } from '../../services/eventService';

interface HomeState {
  slides: {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    route: string;
    ctaText: string;
  }[];
  birthdays: BirthdayEntity[];
  loading: boolean;
  error: string | null;
}

// Generate birthdays where some match today's date dynamically, and others are fixed.
const getDynamicBirthdays = (): BirthdayEntity[] => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${month}-${day}`;

  // Next week date
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 2);
  const nextMonth = String(nextWeek.getMonth() + 1).padStart(2, '0');
  const nextDay = String(nextWeek.getDate()).padStart(2, '0');
  const nextStr = `${nextMonth}-${nextDay}`;

  return [
    {
      id: 'b1',
      name: 'Naruto Uzumaki',
      type: 'character',
      anime: 'Naruto Shippuden',
      dob: todayStr, // Always today!
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      description: 'The Hero of the Leaf, Seventh Hokage, and host of the Nine-Tails Kyuubi.'
    },
    {
      id: 'b2',
      name: 'Gojo Satoru',
      type: 'character',
      anime: 'Jujutsu Kaisen',
      dob: todayStr, // Always today!
      image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      description: 'The strongest jujutsu sorcerer of the modern era, user of the Limitless and Six Eyes.'
    },
    {
      id: 'b3',
      name: 'Hiroshi Kamiya',
      type: 'voice_actor',
      anime: 'Attack on Titan (Levi Ackerman)',
      dob: todayStr, // Always today!
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      description: 'Award-winning legendary voice actor behind Levi Ackerman, Yato, and Trafalgar Law.'
    },
    {
      id: 'b4',
      name: 'Monkey D. Luffy',
      type: 'character',
      anime: 'One Piece',
      dob: nextStr, // Future birthday
      image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      description: 'Captain of the Straw Hat Pirates, striving to find the legendary One Piece and become King.'
    },
    {
      id: 'b5',
      name: 'Rie Takahashi',
      type: 'voice_actor',
      anime: 'Re:Zero (Emilia) / Oshi no Ko (Ai Hoshino)',
      dob: nextStr, // Future birthday
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      description: 'Talented voice actress behind Megumin, Emilia, and the pop idol Ai Hoshino.'
    }
  ];
};

export const fetchHomeDataThunk = createAsyncThunk(
  'home/fetchHomeData',
  async (_, { rejectWithValue }) => {
    try {
      const data = await eventService.fetchTodayEvents();
      // map properties if they diverge slightly or cast
      return data.birthdays as BirthdayEntity[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch home data');
    }
  }
);

const initialState: HomeState = {
  slides: [
    {
      id: 's1',
      title: "Today's Special Birthdays!",
      subtitle: "Celebrate with Naruto Uzumaki, Gojo Satoru, and more who share their special day today!",
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
      route: '/birthdays',
      ctaText: 'View All Celebrations'
    },
    {
      id: 's2',
      title: "Latest Anime & Gaming News",
      subtitle: "Demon Slayer Infinity Castle Movie Trilogy Announced, GTA VI Rumors & More!",
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      route: '/news',
      ctaText: 'Read Latest News'
    },
    {
      id: 's3',
      title: "Try the Anime AI Chatbot",
      subtitle: "Ask character backstories, general anime trivia, recommendations, and gaming guides.",
      image: 'https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?w=800&auto=format&fit=crop&q=80',
      route: '/chatbot',
      ctaText: 'Chat Now'
    },
    {
      id: 's4',
      title: "Akinator Character Guesser",
      subtitle: "Think of an anime character or actor and let our AI guess who it is!",
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      route: '/games',
      ctaText: 'Play Game'
    }
  ],
  birthdays: getDynamicBirthdays(),
  loading: false,
  error: null
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeDataThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomeDataThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.birthdays = action.payload;
      })
      .addCase(fetchHomeDataThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export default homeSlice.reducer;
