import React from 'react';
import { Search, Bell, User } from 'lucide-react';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = "Welcome back, Otaku!" }) => {
  return (
    <header className="h-20 w-[calc(100%-16rem)] fixed top-0 right-0 glass-panel border-b border-anime-border flex items-center justify-between px-8 z-40">
      {/* Page Title / Search */}
      <div className="flex items-center space-x-6">
        <h2 className="text-xl font-bold font-outfit text-white tracking-wide uppercase">
          {title}
        </h2>
        <div className="relative w-64 hidden md:block">
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
        <button className="p-2.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 text-anime-text hover:text-white transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-anime-pink animate-pulse" />
        </button>

        {/* Profile */}
        <div className="flex items-center space-x-3 pl-2 border-l border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-anime-primary to-anime-purple flex items-center justify-center p-0.5 cursor-pointer hover:scale-105 transition-all">
            <div className="w-full h-full bg-anime-bg rounded-[10px] flex items-center justify-center">
              <User className="w-5 h-5 text-anime-primary" />
            </div>
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-sm font-semibold text-white">Guest User</p>
            <p className="text-[10px] text-anime-secondary font-medium">Rank: S-Tier</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
