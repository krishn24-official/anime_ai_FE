import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls the window to the top whenever the route pathname changes.
 * Render this once inside the Router (but outside <Routes>).
 *
 * Only reacts to pathname changes — not search params or hash —
 * so it won't interfere with infinite-scroll or anchor-based navigation.
 */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
