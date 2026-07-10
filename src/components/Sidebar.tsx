import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Home, Newspaper, Calendar, Film, Gamepad2, Bot, User, Sparkles, Menu } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

type MenuItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  isAction?: boolean;
};

type MenuGroup = {
  label: string;
  items: MenuItem[];
};

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  onToggle, 
  isMobileOpen = false, 
  onMobileClose 
}) => {
  const { currentUser } = useSelector((state: RootState) => state.auth);

  const menuGroups: MenuGroup[] = [
    {
      label: 'DISCOVER',
      items: [
        { name: 'Home', path: '/', icon: <Home className="w-5 h-5 shrink-0" /> },
        { name: 'News', path: '/news', icon: <Newspaper className="w-5 h-5 shrink-0" /> },
        { name: 'Calendar', path: '/schedule', icon: <Calendar className="w-5 h-5 shrink-0" /> },
        { name: 'Characters', path: '/characters', icon: <User className="w-5 h-5 shrink-0" /> },
        { name: 'Library', path: '/content', icon: <Film className="w-5 h-5 shrink-0" /> },
      ]
    },
    {
      label: 'ENTERTAINMENT',
      items: [
        { name: 'Arcade', path: '/games', icon: <Gamepad2 className="w-5 h-5 shrink-0" /> },
        { name: 'AI Companion', path: '/chatbot', icon: <Bot className="w-5 h-5 shrink-0" /> },
      ]
    },
    {
      label: 'CREATE',
      items: [
        { name: 'Studio', isAction: true, icon: <Sparkles className="w-5 h-5 shrink-0" /> },
      ]
    }
  ];

  if ((currentUser as any)?.role === 'admin' || currentUser?.is_admin) {
    menuGroups.push({
      label: 'ADMIN',
      items: [
        { name: 'Admin News', path: '/admin/news', icon: <Newspaper className="w-5 h-5 shrink-0" /> }
      ]
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

      <aside className={`h-screen fixed left-0 top-0 bg-anime-bg/95 backdrop-blur-xl flex flex-col p-6 z-50 transition-all duration-300 ${
        isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
      } ${
        isCollapsed ? 'lg:w-[72px] lg:px-3' : 'lg:w-[260px]'
      }`}>
        <div className="w-full flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {/* Top Header Row (Logo + Toggle) */}
          <div className={`flex items-start justify-between mb-8 w-full ${isCollapsed ? 'lg:flex-col lg:items-center lg:space-y-4' : ''}`}>
            
            {/* Logo Section */}
            <div className={`flex items-center transition-all duration-300 ${
              isCollapsed ? 'lg:justify-center lg:w-full' : 'space-x-4 px-1'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="transition-all duration-300 animate-fade-in flex flex-col justify-center">
                  <h1 className="text-xl font-fraunces font-bold text-white tracking-wide leading-tight">
                    AniVerse
                  </h1>
                  <span className="text-[9px] text-anime-text/50 font-inter mt-1.5 leading-tight">
                    Everything Entertainment.<br/>One Place.
                  </span>
                </div>
              )}
            </div>

            {/* Toggle Button (Desktop/Expanded) */}
            {!isCollapsed && (
              <button
                onClick={onToggle}
                aria-label="Collapse sidebar"
                className="p-1.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white transition-all duration-200 shrink-0 cursor-pointer hidden lg:block"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            {/* Close Button (Mobile) */}
            <button
              onClick={onMobileClose}
              aria-label="Close mobile sidebar"
              className="p-1.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white transition-all duration-200 shrink-0 cursor-pointer lg:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Toggle Button (Collapsed - rendered below the logo centered) */}
          {isCollapsed && (
            <div className="hidden lg:flex justify-center mb-6 w-full">
              <button
                onClick={onToggle}
                aria-label="Expand sidebar"
                className="p-1.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white transition-all duration-200 cursor-pointer"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="w-full pb-4">
            {menuGroups.map((group, groupIdx) => (
              <div key={group.label} className={groupIdx > 0 ? "mt-5 pt-1" : ""}>
                {groupIdx > 0 && (!isCollapsed || isMobileOpen) && (
                  <hr className="border-white/5 mb-4" />
                )}
                {(!isCollapsed || isMobileOpen) && (
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-anime-text/40 mb-3 px-3">
                    {group.label}
                  </h3>
                )}
                <ul className="space-y-2 w-full">
                  {group.items.map(item => {
                    
                    const renderItemContent = (isActive: boolean) => (
                      <>
                        {/* Active Indicator Pill */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-anime-primary rounded-r-full" />
                        )}
                        
                        <div className={`w-5 h-5 flex items-center justify-center shrink-0 ${isActive ? 'text-white' : ''}`}>
                          {item.icon}
                        </div>
                        
                        {!isCollapsed || isMobileOpen ? (
                          <span className="font-inter transition-all duration-300 truncate">
                            {item.name}
                          </span>
                        ) : (
                          <span className="absolute left-full ml-4 px-3 py-1.5 bg-anime-bg/95 border border-anime-border text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 delay-120 ease-out whitespace-nowrap pointer-events-none z-50 shadow-xl translate-x-[4px] group-hover:translate-x-0">
                            {item.name}
                          </span>
                        )}
                      </>
                    );

                    const baseClasses = `flex items-center rounded-[14px] transition-all duration-220 ease-out group relative w-full text-left cursor-pointer ${
                      isCollapsed && !isMobileOpen ? 'justify-center px-0 py-2 h-[44px]' : 'space-x-4 px-3 py-2 h-[44px]'
                    }`;

                    if (item.isAction) {
                      return (
                        <li key={item.name}>
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
                            aria-label={`Open ${item.name}`}
                            className={`${baseClasses} font-medium text-anime-text/60 hover:text-white hover:bg-white/5 hover:translate-x-[2px]`}
                          >
                            {renderItemContent(false)}
                          </button>
                        </li>
                      );
                    }

                    return (
                      <li key={item.name}>
                        <NavLink
                          to={item.path!}
                          className={({ isActive }) =>
                            `${baseClasses} ${
                              isActive
                                ? 'bg-white/10 text-white font-semibold'
                                : 'font-medium text-anime-text/60 hover:text-white hover:bg-white/5 hover:translate-x-[2px]'
                            }`
                          }
                        >
                          {({ isActive }) => renderItemContent(isActive)}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
