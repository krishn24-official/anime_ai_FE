import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './features/home/Home';
import Characters from './features/characters/Characters';
import News from './features/news/News';
import Content from './features/content/Content';
import Games from './features/games/Games';
import Chatbot from './features/chatbot/Chatbot';

const App: React.FC = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Determine header title from path
  const getHeaderTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
        return "Welcome to Anime AI!";
      case '/news':
        return "Otaku Tribune News";
      case '/content':
        return "Media Library & Watchlist";
      case '/characters':
        return "Anime Characters & Celebrations";
      case '/games':
        return "Arcade & TikTok Draft";
      case '/chatbot':
        return "AI Companion Dialogue";
      default:
        return "Welcome Back!";
    }
  };

  return (
    <div className="min-h-screen bg-anime-bg text-anime-text">
      {/* Sidebar fixed */}
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      {/* Main Layout Area */}
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'pl-20' : 'pl-64'}`}>
        {/* Header fixed */}
        <Header title={getHeaderTitle(location.pathname)} isSidebarCollapsed={isSidebarCollapsed} />

        {/* Content body offset for fixed Header */}
        <main className="pt-24 px-8 pb-8 min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/news" element={<News />} />
            <Route path="/content" element={<Content />} />
            <Route path="/characters" element={<Characters />} />
            <Route path="/games" element={<Games />} />
            <Route path="/chatbot" element={<Chatbot />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
