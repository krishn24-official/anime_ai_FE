import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { Calendar, ArrowRight, ChevronLeft, ChevronRight, Bot, Send, Sparkles, Share2 } from 'lucide-react';
import { sendMessage } from '../../store/slices/chatSlice';
import { fetchHomeDataThunk } from '../../store/slices/homeSlice';
import { getOptimizedImageUrl } from '../../services/imageHelper';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { slides, birthdays } = useSelector((state: RootState) => state.home);
  const { messages } = useSelector((state: RootState) => state.chat);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [demoInput, setDemoInput] = useState('');

  // Fetch home data on mount
  useEffect(() => {
    dispatch(fetchHomeDataThunk());
  }, [dispatch]);

  const todayStr = (() => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  })();

  const todayBirthdays = birthdays.filter(b => b.dob === todayStr);

  const dynamicSlides = slides.map(slide => {
    if (slide.id === 's1' && todayBirthdays.length > 0) {
      const names = todayBirthdays.slice(0, 3).map(b => b.name).join(', ');
      const extraCount = todayBirthdays.length - 3;
      const subtitleText = extraCount > 0 
        ? `Celebrate with ${names}, and ${extraCount} other characters who share their special day today!`
        : `Celebrate with ${names} who share their special day today!`;

      return {
        ...slide,
        subtitle: subtitleText,
        image: slide.image
      };
    }
    return slide;
  });

  // Auto-play slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % dynamicSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [dynamicSlides.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % dynamicSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + dynamicSlides.length) % dynamicSlides.length);
  };

  const handleSendDemoMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoInput.trim()) return;
    dispatch(sendMessage({ text: demoInput }) as any);
    setDemoInput('');
    navigate('/chatbot');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner Carousel */}
      <div className="relative h-[380px] rounded-2xl overflow-hidden group border border-anime-border/40 shadow-[0_0_30px_rgba(102,252,241,0.15)] bg-black/40">
        {dynamicSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image with Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-anime-bg/95 via-anime-bg/70 to-transparent z-10" />
            
            {/* Ambient Background Glow Orb */}
            <div className="absolute top-1/4 left-10 w-96 h-96 bg-anime-primary/10 rounded-full blur-3xl mix-blend-screen animate-float pointer-events-none z-10" />
            
            <img
              src={getOptimizedImageUrl(slide.image, 1200)}
              srcSet={`${getOptimizedImageUrl(slide.image, 600)} 600w, ${getOptimizedImageUrl(slide.image, 1200)} 1200w`}
              sizes="(max-width: 640px) 600px, 1200px"
              alt={slide.title}
              width={1200}
              height={380}
              loading={index === 0 ? "eager" : "lazy"}
              {...(index === 0 ? { fetchPriority: "high" } : {})}
              className="absolute inset-0 w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-all duration-[6000ms]"
            />
            {/* Content */}
            <div className="relative z-20 h-full flex flex-col justify-center px-12 md:px-16 max-w-2xl space-y-5">
              <span className="px-3.5 py-1 bg-anime-primary/15 text-anime-primary text-xs font-semibold rounded-full border border-anime-primary/40 w-fit uppercase tracking-widest animate-pulse-glow">
                Featured
              </span>
              <h1 className="text-3xl md:text-5xl font-bold font-outfit text-white leading-tight neon-glow-primary">
                {slide.title}
              </h1>
              <p className="text-anime-text text-sm md:text-base leading-relaxed max-w-xl">
                {slide.subtitle}
              </p>
              <button
                onClick={() => navigate(slide.route)}
                className="btn-glow-primary flex items-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-anime-primary to-anime-secondary hover:from-anime-purple hover:to-anime-pink text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 w-fit shadow-lg cursor-pointer"
              >
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-5 h-5 animate-pulse" />
              </button>
            </div>
          </div>
        ))}

        {/* Carousel Buttons */}
        <button
          onClick={handlePrevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/50 hover:bg-anime-primary/20 border border-white/10 hover:border-anime-primary/80 rounded-2xl text-white opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/50 hover:bg-anime-primary/20 border border-white/10 hover:border-anime-primary/80 rounded-2xl text-white opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2.5">
          {dynamicSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlide ? 'bg-anime-primary w-8 shadow-[0_0_8px_#66FCF1]' : 'bg-white/30 w-2 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Dynamic Grid: Birthdays & AI Chat Teaser */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Today's Birthday Section */}
        <div className="lg:col-span-2 premium-card p-7 rounded-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-anime-pink/5 rounded-full blur-3xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-anime-pink animate-float" />
                <h3 className="text-xl font-bold font-outfit text-white neon-glow-pink">Today's Celebrations</h3>
              </div>
              <button 
                onClick={() => navigate('/characters')}
                className="text-sm font-semibold text-anime-primary hover:text-white flex items-center space-x-1 transition-all group/btn cursor-pointer"
              >
                <span>View Calendar</span>
                <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

            {todayBirthdays.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {todayBirthdays.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate('/characters')}
                    className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-anime-pink/40 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 group relative"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={getOptimizedImageUrl(item.image, 128)}
                        alt={item.name}
                        width={64}
                        height={64}
                        loading="lazy"
                        className="w-16 h-16 rounded-xl object-cover border border-white/10 shadow-lg shadow-black/40 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="flex-1 min-w-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider ${
                          item.type === 'character' ? 'bg-anime-primary/20 text-anime-primary' : 'bg-anime-purple/20 text-anime-purple'
                        }`}>
                          {item.type === 'character' ? 'Character' : 'Voice Actor'}
                        </span>
                        <h4 className="font-bold text-white group-hover:text-anime-pink transition-all mt-1 truncate">{item.name}</h4>
                        <p className="text-xs text-anime-text/70 truncate">{item.anime}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.dispatchEvent(new CustomEvent('open-share-poster', {
                            detail: {
                              type: 'birthday',
                              data: {
                                name: item.name,
                                image: item.image,
                                subtitle: `Happy Birthday to the legendary character from ${item.anime}!`
                              }
                            }
                          }));
                        }}
                        className="p-2 bg-black/40 hover:bg-anime-pink border border-white/10 hover:border-anime-pink rounded-xl text-white transition-all cursor-pointer z-20 shrink-0 self-center"
                        title="Share Birthday Poster"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-anime-text text-sm italic">No special celebrations scheduled for today. Check back tomorrow!</p>
            )}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-anime-purple/15 to-anime-pink/15 rounded-xl border border-anime-purple/20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="text-anime-pink w-5 h-5 animate-pulse" />
              <div>
                <p className="text-sm font-semibold text-white">Join the Party</p>
                <p className="text-xs text-anime-text/80">Click the cards to see their lore and voice acting highlights!</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Chatbot Demo Panel */}
        <div className="premium-card p-7 rounded-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-anime-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Bot className="w-6 h-6 text-anime-primary animate-float" />
              <h3 className="text-xl font-bold font-outfit text-white neon-glow-primary">Ask Anime AI</h3>
            </div>
            <p className="text-xs text-anime-text leading-relaxed mb-4">
              Need recommendations, character lore, or want to know what's trending? Ask below to start a chat.
            </p>

            {/* Chat bubble preview with console style */}
            <div className="bg-black/40 rounded-xl p-4 border border-anime-border/20 space-y-2 mb-4 h-28 overflow-y-auto shadow-inner">
              <div className="text-[11px] text-anime-primary font-semibold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-anime-primary animate-ping" />
                <span>AI Assistant:</span>
              </div>
              <div className="text-xs text-white bg-white/5 p-2 rounded-lg leading-relaxed border border-white/5">
                {messages[messages.length - 1]?.text || "Hi! How can I help you today?"}
              </div>
            </div>
          </div>

          <form onSubmit={handleSendDemoMessage} className="relative">
            <input
              type="text"
              value={demoInput}
              onChange={(e) => setDemoInput(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs text-white focus:outline-none focus:border-anime-primary focus:ring-1 focus:ring-anime-primary/30 transition-all duration-300"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 p-1.5 bg-anime-primary text-anime-bg rounded-lg hover:bg-white hover:text-anime-primary transition-all duration-300 cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Home;
