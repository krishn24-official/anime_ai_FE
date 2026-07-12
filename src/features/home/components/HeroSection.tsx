import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { getOptimizedImageUrl } from '../../../services/imageHelper';

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  route: string;
  ctaText: string;
}

interface HeroSectionProps {
  slides: Slide[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ slides }) => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (!slides.length) return null;

  return (
    <div className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden group bg-anime-bg">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-[0.98] z-0 pointer-events-none'
          }`}
        >
          {/* Background Image with Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-anime-bg via-anime-bg/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-anime-bg/90 via-anime-bg/60 to-transparent z-10" />
          
          <img
            src={getOptimizedImageUrl(slide.image, 1200)}
            srcSet={`${getOptimizedImageUrl(slide.image, 600)} 600w, ${getOptimizedImageUrl(slide.image, 1200)} 1200w`}
            sizes="(max-width: 640px) 600px, 1200px"
            alt={slide.title}
            width={1200}
            height={600}
            loading={index === 0 ? "eager" : "lazy"}
            {...(index === 0 ? { fetchPriority: "high" } : {})}
            className="absolute inset-0 w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-[6000ms]"
          />

          {/* Content */}
          <div className="relative z-20 h-full flex flex-col justify-end pb-16 px-10 md:px-16 max-w-3xl space-y-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-1 bg-white/10 text-white rounded-full border border-white/20 w-fit backdrop-blur-md">
              Editor's Spotlight
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-fraunces text-white leading-tight tracking-tight drop-shadow-md">
              {slide.title}
            </h1>
            
            {/* Metadata Row */}
            <div className="flex items-center space-x-3 text-xs font-mono text-anime-text/80 uppercase tracking-widest">
              <span>Anime</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span>Studio MAPPA</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span>2026</span>
            </div>

            <p className="text-white/80 font-inter text-sm md:text-base leading-relaxed max-w-xl">
              {slide.subtitle}
            </p>
            
            <div className="pt-4 flex items-center space-x-4">
              <button
                onClick={() => navigate(slide.route)}
                className="flex items-center space-x-2 px-7 py-3.5 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all duration-200 cursor-pointer"
              >
                <span>{slide.ctaText}</span>
              </button>
              <button
                onClick={() => navigate(slide.route)}
                className="flex items-center justify-center px-4 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl transition-all duration-200 cursor-pointer backdrop-blur-md"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Carousel Buttons */}
      <button
        onClick={handlePrevSlide}
        aria-label="Previous slide"
        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/40 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-md cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={handleNextSlide}
        aria-label="Next slide"
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/40 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-md cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 right-10 md:right-16 z-30 flex space-x-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === currentSlide ? 'bg-white w-6' : 'bg-white/30 w-1.5 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
