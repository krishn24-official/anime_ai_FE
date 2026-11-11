import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Bot, Film, Home, Search, User, type LucideIcon } from 'lucide-react';
import { ProfileMenu } from './ProfileMenu';

interface BottomNavProps {
  onSearch: () => void;
  isSearchOpen: boolean;
}

const LINKS: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/content', label: 'Library', icon: Film },
];
const AI_LINK = { to: '/chatbot', label: 'AI', icon: Bot };

const itemClass = (active: boolean) =>
  `flex-1 flex flex-col items-center justify-center gap-1 h-full text-[11px] font-semibold transition-colors cursor-pointer ${
    active ? 'text-anime-primary' : 'text-anime-text/60 hover:text-white'
  }`;

const Item: React.FC<{ icon: LucideIcon; label: string; active: boolean }> = ({ icon: Icon, label, active }) => (
  <>
    <span className={`flex items-center justify-center w-12 h-7 rounded-full transition-colors ${active ? 'bg-anime-primary/20' : ''}`}>
      <Icon className="w-5 h-5" strokeWidth={active ? 2.4 : 2} />
    </span>
    {label}
  </>
);

/** Phones and tablets: the five most used destinations, always one tap away. */
export const BottomNav: React.FC<BottomNavProps> = ({ onSearch, isSearchOpen }) => {
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (!profileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setProfileOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [profileOpen]);

  const link = ({ to, label, icon, end }: (typeof LINKS)[number]) => (
    <NavLink key={to} to={to} end={end} className={({ isActive }) => itemClass(isActive)}>
      {({ isActive }) => <Item icon={icon} label={label} active={isActive} />}
    </NavLink>
  );

  return (
    <>
      <nav
        aria-label="Main"
        className="lg:hidden fixed inset-x-0 bottom-0 z-40 h-[var(--bottom-nav-h)] pb-[env(safe-area-inset-bottom)] bg-anime-bg/95 backdrop-blur-md border-t border-white/10 flex"
      >
        {LINKS.map(link)}
        <button type="button" onClick={onSearch} aria-pressed={isSearchOpen} className={itemClass(isSearchOpen)}>
          <Item icon={Search} label="Search" active={isSearchOpen} />
        </button>
        {link(AI_LINK)}
        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={profileOpen}
          className={itemClass(profileOpen)}
        >
          <Item icon={User} label="Profile" active={profileOpen} />
        </button>
      </nav>

      {profileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end bg-black/60" onClick={() => setProfileOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Profile"
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-anime-card border-t border-white/10 rounded-t-2xl pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom duration-200"
          >
            <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/20" />
            <ProfileMenu onDone={() => setProfileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};
