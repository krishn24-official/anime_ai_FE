import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Home, Newspaper, Film, Gamepad2, Bot, User, Sparkles, Menu } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  onToggle, 
  isMobileOpen = false, 
  onMobileClose 
}) => {
  const { currentUser } = useSelector((state: RootState) => state.auth);

  const menuItems = [
    { name: 'Home', path: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'News', path: '/news', icon: <Newspaper className="w-5 h-5" /> },
    { name: 'Content', path: '/content', icon: <Film className="w-5 h-5" /> },
    { name: 'Characters', path: '/characters', icon: <User className="w-5 h-5" /> },
    { name: 'Games', path: '/games', icon: <Gamepad2 className="w-5 h-5" /> },
    { name: 'AI Chatbot', path: '/chatbot', icon: <Bot className="w-5 h-5" /> },
  ];

  if (currentUser?.is_admin) {
    menuItems.push({
      name: 'Admin News',
      path: '/admin/news',
      icon: <Sparkles className="w-5 h-5 text-anime-primary animate-pulse" />
    });
  }

  return (
    <>
      {/* Mobile Sidebar Overlay Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onMobileClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45 lg:hidden transition-opacity duration-300"
        />
      )}

      <aside className={`h-screen fixed left-0 top-0 glass-panel border-r border-anime-border flex flex-col justify-between p-6 z-50 transition-transform duration-300 ${
        isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
      } ${
        isCollapsed ? 'lg:w-20 lg:items-center lg:px-3' : 'lg:w-64'
      }`}>
        <div className="w-full">
          {/* Top Header Row (Logo + Toggle) */}
          <div className={`flex items-center justify-between mb-8 w-full ${isCollapsed ? 'lg:flex-col lg:space-y-4' : ''}`}>
            {/* Logo Section */}
            <div className={`flex items-center transition-all duration-300 ${
              isCollapsed ? 'lg:justify-center lg:w-full' : 'space-x-3 px-2'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-anime-purple via-anime-pink to-anime-primary flex items-center justify-center shadow-lg shadow-anime-primary/20 shrink-0">
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="transition-all duration-300 animate-fade-in">
                  <h1 className="text-xl font-bold font-outfit tracking-wider bg-gradient-to-r from-white via-anime-primary to-anime-secondary bg-clip-text text-transparent">
                    ANIME AI
                  </h1>
                  <span className="text-[10px] text-anime-secondary tracking-widest block uppercase font-medium">Entertainment Hub</span>
                </div>
              )}
            </div>

            {/* Toggle Button (Desktop/Expanded) */}
            {!isCollapsed && (
              <button
                onClick={onToggle}
                aria-label="Collapse sidebar"
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all duration-300 shrink-0 cursor-pointer hidden lg:block"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Close Button (Mobile) */}
            <button
              onClick={onMobileClose}
              aria-label="Close mobile sidebar"
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all duration-300 shrink-0 cursor-pointer lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Toggle Button (Collapsed - rendered below the logo centered) */}
          {isCollapsed && (
            <div className="hidden lg:flex justify-center mb-6 w-full">
              <button
                onClick={onToggle}
                aria-label="Expand sidebar"
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all duration-300 shadow-lg shadow-black/40 z-50 cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          )}

        {/* Navigation Menu */}
        <nav className="space-y-2 w-full">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center rounded-xl transition-all duration-300 font-medium group relative ${
                  isCollapsed ? 'justify-center px-0 py-3.5' : 'space-x-4 px-4 py-3'
                } ${
                  isActive
                    ? 'bg-anime-primary/10 text-anime-primary border-l-4 border-anime-primary shadow-[inset_4px_0_12px_rgba(102,252,241,0.05)]'
                    : 'text-anime-text hover:text-white hover:bg-white/5'
                }`
              }
            >
              {item.icon}
              {!isCollapsed ? (
                <span className="font-outfit transition-all duration-300">{item.name}</span>
              ) : (
                <span className="absolute left-full ml-4 px-3 py-2 bg-anime-bg/95 border border-anime-border text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50 shadow-xl">
                  {item.name}
                </span>
              )}
            </NavLink>
          ))}

          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-share-poster', {
                detail: {
                  type: 'birthday',
                  data: {
                    name: 'Naruto Uzumaki',
                    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500',
                    subtitle: 'Celebrate today!'
                  }
                }
              }));
            }}
            aria-label="Open Poster Studio"
            className={`flex items-center rounded-xl transition-all duration-300 font-medium group relative w-full text-left cursor-pointer text-anime-text hover:text-white hover:bg-white/5 ${
              isCollapsed ? 'justify-center px-0 py-3.5' : 'space-x-4 px-4 py-3'
            }`}
          >
            <Sparkles className="w-5 h-5 text-anime-primary animate-pulse" />
            {!isCollapsed ? (
              <span className="font-outfit transition-all duration-300">Poster Studio</span>
            ) : (
              <span className="absolute left-full ml-4 px-3 py-2 bg-anime-bg/95 border border-anime-border text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50 shadow-xl">
                Poster Studio
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Footer Info */}
      <div className={`px-2 w-full transition-all duration-300 ${isCollapsed ? 'hidden' : 'block'}`}>
        <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
          <p className="text-xs font-semibold text-white">Version 1.0.0</p>
          <p className="text-[10px] text-anime-secondary">Powered by React & Redux</p>
        </div>
      </div>
      </aside>
    </>
  );
};

export default Sidebar;
