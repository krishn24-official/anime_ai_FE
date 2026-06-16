export interface BirthdayEntity {
  id: string;
  name: string;
  type: 'character' | 'voice_actor';
  anime: string;
  dob: string; // MM-DD format
  image: string;
  description: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'Anime' | 'Games' | 'Movies' | 'TV-Series';
  date: string;
  image: string;
  author: string;
}

export interface ContentItem {
  id: string;
  title: string;
  category: 'Anime' | 'Manga' | 'Movies' | 'TV-Series' | 'Games';
  poster: string;
  description: string;
  releaseYear: number;
  averageRating: number;
  genres: string[];
}

export interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  image?: string;
}
