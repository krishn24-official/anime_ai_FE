import React, { useState } from 'react';
import { Search, Bell, User, LogOut, Menu } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store';
import { logoutUserThunk } from '../store/slices/authSlice';

interface HeaderProps {
  title?: string;
  isSidebarCollapsed?: boolean;
  notifications?: {
    id: string;
    title: string;
    category: string;
    image: string;
    url?: string;
  }[];
  onClearNotifications?: () => void;
  onToggleMobileSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title = "Welcome back, Otaku!", 
  isSidebarCollapsed = false,
  notifications = [],
  onClearNotifications,
  onToggleMobileSidebar
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.auth);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUserThunk());
  };

  return (
    <header className={`h-20 fixed top-0 right-0 glass-panel border-b border-anime-border flex items-center justify-between px-4 sm:px-8 z-40 transition-all duration-300 w-full lg:w-[calc(100%-16rem)] ${
      isSidebarCollapsed ? 'lg:w-[calc(100%-5rem)]' : ''
    }`}>
      {/* Page Title / Search */}
      <div className="flex items-center space-x-3 sm:space-x-6 min-w-0">
        {/* Mobile Hamburger menu */}
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white lg:hidden cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="text-sm sm:text-base md:text-xl font-bold font-outfit text-white tracking-wide uppercase truncate max-w-[140px] sm:max-w-xs md:max-w-none">
          {title}
        </h2>
        <div className="relative w-64 hidden md:block shrink-0">
          <input
            type="text"
            placeholder="Search news, content, characters..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-anime-primary/50 focus:ring-1 focus:ring-anime-primary/20 transition-all placeholder:text-anime-text/40"
          />
          <Search className="w-4 h-4 text-anime-text/40 absolute left-3 top-3" />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
              localStorage.setItem('last_news_checked_time', String(Date.now() / 1000));
            }}
            className="p-2.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 text-anime-text hover:text-white transition-all relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-anime-pink animate-pulse" />
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-anime-bg/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                {notifications.length > 0 && (
                  <button 
                    onClick={() => {
                      if (onClearNotifications) onClearNotifications();
                      setIsDropdownOpen(false);
                    }}
                    className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-anime-text/40">
                    No new notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id}
                      onClick={() => {
                        navigate('/news');
                        setIsDropdownOpen(false);
                      }}
                      className="p-3.5 flex items-start space-x-3 cursor-pointer hover:bg-white/5 transition-all"
                    >
                      <img src={n.image} alt="" className="w-12 h-9 rounded-lg object-cover bg-white/5 shrink-0" />
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <span className="text-[9px] font-bold text-anime-primary uppercase tracking-wider">{n.category}</span>
                        <p className="text-xs font-medium text-white line-clamp-2 leading-snug">
                          {n.title}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center space-x-3 pl-2 border-l border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-anime-primary to-anime-purple flex items-center justify-center p-0.5 cursor-pointer hover:scale-105 transition-all">
            <div className="w-full h-full bg-anime-bg rounded-[10px] flex items-center justify-center">
              <User className="w-5 h-5 text-anime-primary" />
            </div>
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-sm font-semibold text-white">{currentUser?.display_name || currentUser?.username || 'Guest User'}</p>
            <p className="text-[10px] text-anime-secondary font-medium">Rank: S-Tier</p>
          </div>
          
          <button 
            onClick={handleLogout}
            title="Log Out"
            className="p-2 ml-1 bg-white/5 rounded-xl border border-white/10 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 text-anime-text transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
