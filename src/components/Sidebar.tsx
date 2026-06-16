import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Newspaper, Film, Gamepad2, Bot, User, Sparkles } from 'lucide-react';

const Sidebar: React.FC = () => {
  const menuItems = [
    { name: 'Home', path: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'News', path: '/news', icon: <Newspaper className="w-5 h-5" /> },
    { name: 'Content', path: '/content', icon: <Film className="w-5 h-5" /> },
    { name: 'Characters', path: '/characters', icon: <User className="w-5 h-5" /> },
    { name: 'Games', path: '/games', icon: <Gamepad2 className="w-5 h-5" /> },
    { name: 'AI Chatbot', path: '/chatbot', icon: <Bot className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 glass-panel border-r border-anime-border flex flex-col justify-between p-6 z-50">
      <div>
        {/* Logo Section */}
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-anime-purple via-anime-pink to-anime-primary flex items-center justify-center shadow-lg shadow-anime-primary/20">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-outfit tracking-wider bg-gradient-to-r from-white via-anime-primary to-anime-secondary bg-clip-text text-transparent">
              ANIME AI
            </h1>
            <span className="text-[10px] text-anime-secondary tracking-widest block uppercase font-medium">Entertainment Hub</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                  isActive
                    ? 'bg-anime-primary/10 text-anime-primary border-l-4 border-anime-primary shadow-[inset_4px_0_12px_rgba(102,252,241,0.05)]'
                    : 'text-anime-text hover:text-white hover:bg-white/5'
                }`
              }
            >
              {item.icon}
              <span className="font-outfit">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="px-2">
        <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
          <p className="text-xs font-semibold text-white">Version 1.0.0</p>
          <p className="text-[10px] text-anime-secondary">Powered by React & Redux</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
