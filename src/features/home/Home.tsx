import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import { Calendar, ArrowRight, ChevronLeft, ChevronRight, Bot, Send, Sparkles } from 'lucide-react';
import { sendMessage } from '../../store/slices/chatSlice';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { slides, birthdays } = useSelector((state: RootState) => state.home);
  const { messages } = useSelector((state: RootState) => state.chat);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [demoInput, setDemoInput] = useState('');

  // Auto-play slider
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

  const todayStr = (() => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  })();

  const todayBirthdays = birthdays.filter(b => b.dob === todayStr);

  const handleSendDemoMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoInput.trim()) return;
    dispatch(sendMessage(demoInput) as any);
    setDemoInput('');
    navigate('/chatbot');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner Carousel */}
      <div className="relative h-[380px] rounded-2xl overflow-hidden group border border-anime-border shadow-xl">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background Image with Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-anime-bg via-anime-bg/70 to-transparent z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-all duration-[6000ms]"
            />
            {/* Content */}
            <div className="relative z-20 h-full flex flex-col justify-center px-12 md:px-16 max-w-2xl space-y-4">
              <span className="px-3 py-1 bg-anime-primary/20 text-anime-primary text-xs font-semibold rounded-full border border-anime-primary/30 w-fit uppercase tracking-widest">
                Featured
              </span>
              <h1 className="text-3xl md:text-5xl font-bold font-outfit text-white leading-tight">
                {slide.title}
              </h1>
              <p className="text-anime-text text-sm md:text-base leading-relaxed">
                {slide.subtitle}
              </p>
              <button
                onClick={() => navigate(slide.route)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-anime-primary to-anime-secondary hover:from-anime-purple hover:to-anime-pink text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 w-fit shadow-lg shadow-anime-primary/20 hover:shadow-anime-pink/20"
              >
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {/* Carousel Buttons */}
        <button
          onClick={handlePrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/40 hover:bg-anime-primary/20 border border-white/10 hover:border-anime-primary rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/40 hover:bg-anime-primary/20 border border-white/10 hover:border-anime-primary rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx === currentSlide ? 'bg-anime-primary w-6' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Dynamic Grid: Birthdays & AI Chat Teaser */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Today's Birthday Section */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-anime-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-anime-pink animate-bounce" />
                <h3 className="text-xl font-bold font-outfit text-white">Today's Celebrations</h3>
              </div>
              <button 
                onClick={() => navigate('/birthdays')}
                className="text-sm font-semibold text-anime-primary hover:text-white flex items-center space-x-1 transition-all"
              >
                <span>View Calendar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {todayBirthdays.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {todayBirthdays.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate('/birthdays')}
                    className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-anime-pink/40 cursor-pointer transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover border border-white/10"
                      />
                      <div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider ${
                          item.type === 'character' ? 'bg-anime-primary/20 text-anime-primary' : 'bg-anime-purple/20 text-anime-purple'
                        }`}>
                          {item.type === 'character' ? 'Character' : 'Voice Actor'}
                        </span>
                        <h4 className="font-bold text-white group-hover:text-anime-pink transition-all mt-1">{item.name}</h4>
                        <p className="text-xs text-anime-text/70">{item.anime}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-anime-text text-sm italic">No special celebrations scheduled for today. Check back tomorrow!</p>
            )}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-anime-purple/10 to-anime-pink/10 rounded-xl border border-anime-purple/20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="text-anime-pink w-5 h-5" />
              <div>
                <p className="text-sm font-semibold text-white">Join the Party</p>
                <p className="text-xs text-anime-text/80">Click the cards to see their lore and voice acting highlights!</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Chatbot Demo Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-anime-border flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Bot className="w-6 h-6 text-anime-primary" />
              <h3 className="text-xl font-bold font-outfit text-white">Ask Anime AI</h3>
            </div>
            <p className="text-xs text-anime-text leading-relaxed mb-4">
              Need recommendations, character lore, or want to know what's trending? Ask below to start a chat.
            </p>

            {/* Chat bubble preview */}
            <div className="bg-black/30 rounded-xl p-3 border border-white/5 space-y-2 mb-4 h-28 overflow-y-auto">
              <div className="text-[11px] text-anime-secondary font-semibold">AI Assistant:</div>
              <div className="text-xs text-white bg-white/5 p-2 rounded-lg leading-relaxed">
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
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs text-white focus:outline-none focus:border-anime-primary"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 p-1.5 bg-anime-primary text-anime-bg rounded-lg hover:bg-white hover:text-anime-primary transition-all"
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
