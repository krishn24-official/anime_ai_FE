import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ExternalLink, Play } from 'lucide-react';
import type { HeroSlide } from '../../../domain/home';
import { TrailerModal } from '../../../components/TrailerModal';
import { useHeroFeed } from '../hooks/useHeroFeed';
import { imageSrcSet, primaryAction, slideBadge, slideSubtitle } from '../heroSlideMeta';

const AUTOPLAY_MS = 7000;
const SWIPE_PX = 50;
const HEIGHT = 'h-[460px] sm:h-[420px] xl:h-[440px]';

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const HeroSection: React.FC = () => {
  const { slides, loading } = useHeroFeed();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const touchX = useRef<number | null>(null);

  const count = slides.length;
  const go = useCallback((step: number) => setIndex((i) => (i + step + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused || trailerUrl || reducedMotion()) return;
    const timer = setInterval(() => !document.hidden && go(1), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [count, paused, trailerUrl, go, index]);

  const closeTrailer = useCallback(() => setTrailerUrl(null), []);

  if (loading) return <div className={`${HEIGHT} rounded-2xl bg-anime-card animate-pulse`} />;
  if (!count) return null;

  const openDetails = (s: HeroSlide) => s.content && navigate(`/content/${s.content.type}/${s.content.id}`);
  const runPrimary = (s: HeroSlide) => {
    const action = primaryAction(s);
    if (action === 'trailer') setTrailerUrl(s.videoUrl);
    else if (action === 'article') window.open(s.linkUrl!, '_blank', 'noopener,noreferrer');
    else openDetails(s);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Highlights"
      className={`relative ${HEIGHT} rounded-2xl overflow-hidden bg-anime-card border border-white/5`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => (e.key === 'ArrowRight' ? go(1) : e.key === 'ArrowLeft' && go(-1))}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - (touchX.current ?? 0);
        if (touchX.current !== null && Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      {slides.map((s, i) => {
        const active = i === index;
        const action = primaryAction(s);
        const subtitle = slideSubtitle(s);
        return (
          <div
            key={s.key}
            aria-hidden={!active}
            className={`absolute inset-0 transition-opacity duration-700 ${active ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
          >
            <img
              src={s.image}
              srcSet={imageSrcSet(s.image)}
              sizes="(max-width: 768px) 780px, 1280px"
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              className={`absolute inset-0 w-full h-full object-cover ${s.imageIsWide ? 'object-[70%_center]' : 'object-top md:blur-2xl md:scale-110 md:opacity-60'}`}
            />
            {!s.imageIsWide && (
              <img
                src={s.image}
                alt=""
                loading="lazy"
                className="hidden md:block absolute right-8 lg:right-20 top-1/2 -translate-y-1/2 h-[70%] lg:h-[78%] aspect-[2/3] object-cover rounded-xl shadow-2xl shadow-black/60 border border-white/10 z-[1]"
              />
            )}
            {/* Readability: bottom fade on phones, left fade on wide screens */}
            <div className="absolute inset-0 bg-gradient-to-t from-anime-bg via-anime-bg/75 to-anime-bg/10 md:bg-gradient-to-r md:from-anime-bg/95 md:via-anime-bg/70 md:to-transparent" />

            <div className={`relative z-[2] h-full flex flex-col justify-end md:justify-center gap-3 sm:gap-4 px-5 pb-14 sm:px-10 md:pt-6 md:pb-12 lg:px-20 max-w-2xl ${s.imageIsWide ? '' : 'md:max-w-[58%]'}`}>
              <span className="w-fit px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] text-white bg-anime-primary/25 border border-anime-primary/50 backdrop-blur-sm">
                {slideBadge(s)}
              </span>
              <h2 className="text-3xl sm:text-4xl xl:text-5xl font-bold font-fraunces text-white leading-tight line-clamp-2">
                {s.title}
              </h2>
              {subtitle && (
                <p className="text-base sm:text-xl font-semibold text-anime-primary line-clamp-1">{subtitle}</p>
              )}
              {s.description && (
                <p className="text-sm sm:text-base text-white/80 leading-relaxed line-clamp-2 xl:line-clamp-3 max-w-xl">
                  {s.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 pt-1 sm:pt-2">
                <button
                  onClick={() => runPrimary(s)}
                  tabIndex={active ? 0 : -1}
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-violet-200 text-anime-bg font-semibold text-sm sm:text-base hover:bg-white transition-colors cursor-pointer"
                >
                  {action === 'trailer' && <Play className="w-4 h-4 fill-current" />}
                  {action === 'trailer' ? 'Watch Trailer' : action === 'article' ? 'Read Story' : 'View Details'}
                  {action === 'article' && <ExternalLink className="w-4 h-4" />}
                </button>
                {action !== 'details' && s.content && (
                  <button
                    onClick={() => openDetails(s)}
                    tabIndex={active ? 0 : -1}
                    className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full border border-white/40 text-white font-semibold text-sm sm:text-base hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Details
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {count > 1 && (
        <>
          {[-1, 1].map((step) => (
            <button
              key={step}
              onClick={() => go(step)}
              aria-label={step < 0 ? 'Previous slide' : 'Next slide'}
              className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 ${step < 0 ? 'left-4' : 'right-4'} z-20 w-11 h-11 items-center justify-center rounded-full bg-black/40 border border-white/15 text-white hover:bg-white/15 backdrop-blur-md transition-colors cursor-pointer`}
            >
              {step < 0 ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          ))}
          <div className="absolute bottom-5 left-5 sm:left-10 lg:left-20 z-20 flex gap-2">
            {slides.map((s, i) => (
              <button
                key={s.key}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === index ? 'w-8 bg-anime-primary' : 'w-4 bg-white/30 hover:bg-white/60'}`}
              />
            ))}
          </div>
        </>
      )}

      <TrailerModal url={trailerUrl} onClose={closeTrailer} />
    </section>
  );
};
