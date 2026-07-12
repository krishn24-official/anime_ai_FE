import { configureStore } from '@reduxjs/toolkit';
import homeReducer from './slices/homeSlice';
import newsReducer from './slices/newsSlice';
import contentReducer from './slices/contentSlice';
import gamesReducer from './slices/gameSlice';
import chatReducer from './slices/chatSlice';
import characterReducer from './slices/characterSlice';
import authReducer from './slices/authSlice';
import tierListReducer from './slices/tierListSlice';
import trendingReducer from './slices/trendingSlice';
import upcomingReducer from './slices/upcomingSlice';

export const store = configureStore({
  reducer: {
    home: homeReducer,
    news: newsReducer,
    content: contentReducer,
    games: gamesReducer,
    chat: chatReducer,
    characters: characterReducer,
    auth: authReducer,
    tierList: tierListReducer,
    trending: trendingReducer,
    upcoming: upcomingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
