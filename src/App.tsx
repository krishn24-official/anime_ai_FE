import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from './store';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './features/home/Home';
const Characters = React.lazy(() => import('./features/characters/Characters'));
const CharacterDetail = React.lazy(() => import('./features/characters/CharacterDetail'));
const ContentDetail = React.lazy(() => import('./features/content/ContentDetail'));
const News = React.lazy(() => import('./features/news/News'));
const Schedule = React.lazy(() => import('./features/schedule/Schedule'));
const AdminNews = React.lazy(() => import('./features/news/AdminNews'));
const Content = React.lazy(() => import('./features/content/Content'));
const Games = React.lazy(() => import('./features/games/Games'));
const Chatbot = React.lazy(() => import('./features/chatbot/Chatbot'));

// Admin Imports
import AdminTrending from './features/trending/AdminTrending';
import { AdminAnime } from './features/adminAnime/AdminAnime';
import { AdminMovies } from './features/adminMovies/AdminMovies';
import { AdminTvSeries } from './features/adminTvSeries/AdminTvSeries';
import { AdminEpisodesChapters } from './features/adminEpisodes/AdminEpisodesChapters';
import AdminRelationships from './features/adminRelationships/AdminRelationships';
import { AdminCharacters } from './features/adminCharacters/AdminCharacters';
import { AdminActors } from './features/adminActors/AdminActors';

const ActorDetail = React.lazy(() => import('./features/actors/ActorDetail'));

const AdminLayout = () => {
  return <div className="w-full"><Outlet /></div>;
};
const SharePosterModal = React.lazy(() => import('./components/SharePosterModal'));
import InstallPrompt from './components/InstallPrompt';
import PwaUpdater from './components/PwaUpdater';
import AuthPage from './features/auth/AuthPage';
import { addNewArticle } from './store/slices/newsSlice';
import { X } from 'lucide-react';


interface ToastNotification {
  id: string;
  title: string;
  category: string;
  image: string;
  url?: string;
}

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { currentUser } = useSelector((state: RootState) => state.auth);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [notifications, setNotifications] = useState<ToastNotification[]>(() => {
    try {
      const saved = localStorage.getItem('stored_notifications');
      if (!saved) return [];
      const parsed: ToastNotification[] = JSON.parse(saved);
      // Deduplicate by title (keep the first occurrence)
      const seen = new Set<string>();
      return parsed.filter(n => {
        if (seen.has(n.title)) return false;
        seen.add(n.title);
        return true;
      });
    } catch (e) {
      return [];
    }
  });

  // Persist notifications to localStorage
  useEffect(() => {
    localStorage.setItem('stored_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Share Poster state
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareType, setShareType] = useState<'birthday' | 'event' | 'news'>('birthday');
  const [shareData, setShareData] = useState<any>({});

  // Listen for global open-share-poster events
  useEffect(() => {
    const handleOpenShare = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setShareType(customEvent.detail.type || 'birthday');
        setShareData(customEvent.detail.data || {});
        setIsShareOpen(true);
      }
    };
    window.addEventListener('open-share-poster', handleOpenShare);
    return () => {
      window.removeEventListener('open-share-poster', handleOpenShare);
    };
  }, []);



  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  // Establish WebSocket connection for live news alerts
  useEffect(() => {
    if (!currentUser) return;

    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;
    let attempts = 0;
    let isCleanedUp = false;

    const connect = () => {
      if (isCleanedUp) return;
      const lastChecked = localStorage.getItem('last_news_checked_time') || '0';
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const wsUrlBase = apiUrl.replace(/^http/, 'ws');
      const wsUrl = `${wsUrlBase}/ws?last_checked=${lastChecked}`;

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        attempts = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'NEW_ARTICLE') {
            const raw = message.data;

            const mappedCat =
              raw.category === 'TV Series' || raw.category === 'TV-Series' ? 'TV-Series' as const :
                raw.category === 'Games' || raw.category === 'Movies' || raw.category === 'Anime' ? raw.category :
                  'Anime' as const;

            const getCategoryFallbackImage = (category: string) => {
              const animeImages = ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80'];
              const gamesImages = ['https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80'];
              const moviesImages = ['https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80'];
              const tvImages = ['https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80'];
              const pool = category === 'Games' ? gamesImages : category === 'Movies' ? moviesImages : category === 'TV-Series' ? tvImages : animeImages;
              return pool[0];
            };

            const dateStr = raw.published_at ? new Date(raw.published_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

            const item = {
              id: raw.id || String(Date.now()),
              title: raw.title || 'No Title Available',
              summary: raw.summary || raw.description || 'No summary available.',
              content: raw.description || raw.summary || 'No description available.',
              category: mappedCat,
              date: dateStr,
              image: raw.image_url || getCategoryFallbackImage(mappedCat),
              author: (raw.source || 'youtube').toUpperCase(),
              url: raw.url || ''
            };

            // Inject the new article directly into Redux (live page update)
            dispatch(addNewArticle(item));

            // Create notification toast & store persistent notification (deduplicate by title)
            const toastId = String(Date.now()) + Math.random();
            const notificationItem = {
              id: toastId,
              title: item.title,
              category: item.category,
              image: item.image,
              url: item.url
            };
            setToasts(prev => [...prev, notificationItem]);
            setNotifications(prev => {
              const isDuplicate = prev.some(n => n.title === item.title);
              if (isDuplicate) return prev;
              return [...prev, notificationItem];
            });

            // Dismiss toast popup after 6 seconds (remains in notifications)
            setTimeout(() => {
              setToasts(prev => prev.filter(t => t.id !== toastId));
            }, 6000);
          }
        } catch (err) {
          console.error("Error handling WebSocket message:", err);
        }
      };

      ws.onclose = () => {
        if (isCleanedUp) return;
        const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
        attempts++;
        reconnectTimeout = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws?.close();
      };
    };

    connect();

    return () => {
      isCleanedUp = true;
      if (ws) {
        // Prevent onclose from firing after we intentionally close it during cleanup
        ws.onclose = null;
        ws.close();
      }
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [currentUser, dispatch]);

  // Determine header title from path
  const getHeaderTitle = (pathname: string) => {
    if (pathname.startsWith('/games/tier-lists')) {
      return "Anime Tier Maker Workspace";
    }
    if (pathname.startsWith('/games')) {
      return "Arcade & TikTok Draft";
    }
    switch (pathname) {
      case '/':
        return "Welcome to Aniverse!";
      case '/news':
        return "Otaku Tribune News";
      case '/schedule':
        return "Upcoming Schedule";
      case '/admin/news':
        return "Admin News Hub";
      case '/content':
        return "Media Library & Watchlist";
      case '/characters':
        return "Anime Characters & Celebrations";
      case '/chatbot':
        return "AI Companion Dialogue";
      default:
        return "Welcome Back!";
    }
  };

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-anime-bg text-anime-text">
      {/* Sidebar fixed */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Layout Area */}
      <div className={`transition-all duration-300 pl-0 ${isSidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'}`}>
        {/* Header fixed */}
        <Header
          title={getHeaderTitle(location.pathname)}
          isSidebarCollapsed={isSidebarCollapsed}
          notifications={notifications}
          onClearNotifications={() => setNotifications([])}
          onDismissNotification={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Content body offset for fixed Header */}
        <main className="pt-24 px-4 sm:px-8 pb-8 min-h-screen">
          <React.Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
              <div className="w-12 h-12 border-4 border-anime-primary/20 border-t-anime-primary rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-anime-primary uppercase tracking-widest animate-pulse">Loading Anime AI...</p>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/news" element={<News />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/content" element={<Content />} />
              <Route path="/content/:type/:id" element={<ContentDetail />} />
              <Route path="/characters" element={<Characters />} />
              <Route path="/characters/:id" element={<CharacterDetail />} />
              <Route path="/actors/:id" element={<ActorDetail />} />
              <Route path="/games/*" element={<Games />} />
              <Route path="/chatbot" element={<Chatbot />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/trending" replace />} />
                <Route path="news" element={<AdminNews />} />
                <Route path="trending" element={<AdminTrending />} />
                <Route path="anime" element={<AdminAnime />} />
                <Route path="movies" element={<AdminMovies />} />
                <Route path="tv-series" element={<AdminTvSeries />} />
                <Route path="episodes-chapters" element={<AdminEpisodesChapters />} />
                <Route path="relationships" element={<AdminRelationships />} />
                <Route path="manga" element={<div className="p-6 text-white">Manga Admin (Coming Soon)</div>} />
                <Route path="characters" element={<AdminCharacters />} />
                <Route path="actors" element={<AdminActors />} />
              </Route>
            </Routes>
          </React.Suspense>
        </main>
      </div>

      {/* Toast Notification Container */}
      <div className="fixed top-6 right-6 z-[9999] space-y-4 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            onClick={() => {
              navigate('/news');
              setToasts(prev => prev.filter(t => t.id !== toast.id));
            }}
            className="pointer-events-auto bg-anime-bg/95 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl flex items-start space-x-3 cursor-pointer hover:border-anime-primary/45 transition-all duration-300 transform translate-y-0 animate-fade-in"
          >
            <img src={toast.image} alt="" className="w-16 h-12 rounded-lg object-cover bg-white/5 border border-white/5 shrink-0" />
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-anime-primary animate-ping" />
                <span className="text-[10px] font-bold text-anime-primary uppercase tracking-wider">{toast.category}</span>
              </div>
              <p className="text-xs font-semibold text-white line-clamp-2 leading-snug">
                {toast.title}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setToasts(prev => prev.filter(t => t.id !== toast.id));
              }}
              className="p-1 hover:bg-white/5 rounded-lg text-anime-text/40 hover:text-white transition-all cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Share Poster Generator Modal */}
      <React.Suspense fallback={null}>
        <SharePosterModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          initialType={shareType}
          initialData={shareData}
        />
      </React.Suspense>

      {/* PWA Components */}
      <PwaUpdater />
      <InstallPrompt />
    </div>
  );
};

export default App;
