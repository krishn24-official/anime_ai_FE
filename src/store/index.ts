import { configureStore } from '@reduxjs/toolkit';
import homeReducer from './slices/homeSlice';
import newsReducer from './slices/newsSlice';
import contentReducer from './slices/contentSlice';
import gamesReducer from './slices/gameSlice';
import chatReducer from './slices/chatSlice';
import characterReducer from './slices/characterSlice';
import authReducer, { sessionExpired, sessionRefreshed } from './slices/authSlice';
import { apiClient } from '../services/apiClient';
import tierListReducer from './slices/tierListSlice';
import trendingReducer from './slices/trendingSlice';
import todaysReleasesReducer from './slices/todaysReleasesSlice';
import loreAdminReducer from './slices/loreAdminSlice';

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
    todaysReleases: todaysReleasesReducer,
    loreAdmin: loreAdminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

// Keep Redux auth state in sync with token refreshes / expiry handled inside apiClient.
apiClient.onAuthEvent((event) => {
  if (event.type === 'refreshed') {
    store.dispatch(
      sessionRefreshed({
        user: event.user,
        accessToken: event.accessToken,
        refreshToken: event.refreshToken,
      })
    );
  } else if (event.type === 'expired') {
    store.dispatch(sessionExpired());
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
