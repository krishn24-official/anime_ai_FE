import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ChatMessage } from '../../types';

interface ChatState {
  messages: ChatMessage[];
  status: 'idle' | 'typing';
}

const initialState: ChatState = {
  messages: [
    {
      id: 'msg_welcome',
      sender: 'bot',
      text: 'Hello, I am your Anime AI Assistant! 🌟 Ask me about anime news, character birthdays, recommended watches, or questions about the games we have on this platform!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ],
  status: 'idle'
};

const getBotResponse = (userInput: string): string => {
  const input = userInput.toLowerCase();
  
  if (input.includes('birthday') || input.includes('born') || input.includes('celebrat')) {
    return "Today is a great day! We're celebrating the birthdays of Naruto Uzumaki and Gojo Satoru! Click the 'Birthdays' link in the sidebar to view full descriptions and actors.";
  }
  if (input.includes('news') || input.includes('latest') || input.includes('happen')) {
    return "In recent news: ufotable announced the Demon Slayer: Infinity Castle Movie Trilogy! Also, GTA VI released a new physics showcase. Check our 'News' tab for categorized details.";
  }
  if (input.includes('game') || input.includes('play') || input.includes('akinator') || input.includes('tiktok')) {
    return "We have two awesome games! 1) Akinator Character Guesser (where I try to guess who you're thinking of) and 2) TikTok-style Team Builder (swipe to build an elite team). Head to 'Games' to play!";
  }
  if (input.includes('recommend') || input.includes('watch') || input.includes('anime')) {
    return "I highly recommend 'Frieren: Beyond Journey\'s End' for a beautiful fantasy slice-of-life, or 'Cyberpunk: Edgerunners' for high-octane sci-fi action. Go to 'Content' to add them to your watchlist!";
  }
  if (input.includes('hello') || input.includes('hi ') || input.includes('hey')) {
    return "Hey there! How can I help you navigate the anime universe today?";
  }
  if (input.includes('who are you') || input.includes('your name')) {
    return "I am the Anime AI Assistant, powered by Redux Thunks and custom heuristics to answer all your anime queries instantly!";
  }
  
  return "That's an interesting question! I am still learning, but you can explore our News, Content, and Games directories to find more information about it!";
};

const characters = [
  {
    name: "Frieren",
    anime: "Frieren: Beyond Journey's End",
    confidence: "98.7%",
    details: "An elven mage who was a member of the party that defeated the Demon King. She is passionate about collecting rare spells and is learning the value of human connections."
  },
  {
    name: "Gojo Satoru",
    anime: "Jujutsu Kaisen",
    confidence: "99.2%",
    details: "The strongest Jujutsu Sorcerer in the world. He is a special grade jujutsu sorcerer and a teacher at the Tokyo Metropolitan Curse Technical College, known for his signature Six Eyes and Limitless techniques."
  },
  {
    name: "Naruto Uzumaki",
    anime: "Naruto / Boruto",
    confidence: "97.5%",
    details: "The Seventh Hokage of Konohagakure. He became the jinchuriki of the Nine-Tailed Demon Fox, Kurama, on the day of his birth, and fought tirelessly to achieve recognition and peace."
  },
  {
    name: "Son Goku",
    anime: "Dragon Ball Series",
    confidence: "98.1%",
    details: "A legendary Saiyan warrior raised on Earth. Originally sent to destroy Earth, he bumped his head as a child, becoming pure-hearted and dedicating his life to fighting strong opponents and defending the universe."
  },
  {
    name: "Monkey D. Luffy",
    anime: "One Piece",
    confidence: "96.9%",
    details: "The captain of the Straw Hat Pirates who ate the Gum-Gum Fruit, turning his body into rubber. His dream is to find the legendary One Piece and become the Pirate King."
  }
];

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (
    payload: string | { text: string; image?: string },
    { dispatch }
  ) => {
    const text = typeof payload === 'string' ? payload : payload.text;
    const image = typeof payload === 'string' ? undefined : payload.image;

    // Add user message
    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text,
      image,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    dispatch(addMessage(userMsg));
    dispatch(setStatus('typing'));

    // Wait 1.5s to simulate bot scanning image & processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    let responseText = '';
    if (image) {
      // Pick a character based on the text prompt or randomly
      const promptLower = text.toLowerCase();
      let chosen = characters[Math.floor(Math.random() * characters.length)];
      
      // Try simple keyword matching
      for (const char of characters) {
        if (promptLower.includes(char.name.toLowerCase()) || promptLower.includes(char.anime.toLowerCase().split(':')[0])) {
          chosen = char;
          break;
        }
      }

      responseText = `🔍 **Analyzing Image...**\n\nI detected an anime character in your image!\n\n**Character identified:** **${chosen.name}**\n**Anime:** *${chosen.anime}*\n**Match Confidence:** \`${chosen.confidence}\`\n\n**Details:** ${chosen.details}\n\nFeel free to ask me anything else about this character or request news and birthdays!`;
    } else {
      responseText = getBotResponse(text);
    }

    const botMsg: ChatMessage = {
      id: `msg_b_${Date.now()}`,
      sender: 'bot',
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    dispatch(addMessage(botMsg));
    dispatch(setStatus('idle'));
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    setStatus: (state, action: PayloadAction<'idle' | 'typing'>) => {
      state.status = action.payload;
    },
    clearHistory: (state) => {
      state.messages = [initialState.messages[0]];
    }
  }
});

export const { addMessage, setStatus, clearHistory } = chatSlice.actions;
export default chatSlice.reducer;
