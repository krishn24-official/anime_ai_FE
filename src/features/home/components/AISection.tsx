import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bot, ArrowRight, Sparkles, Command } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { sendMessage } from '../../../store/slices/chatSlice';
import type { AppDispatch, RootState } from '../../../store';

const SUGGESTED_PROMPTS = [
  "What should I watch after Attack on Titan?",
  "Explain the ending of Evangelion.",
  "Who are the strongest characters in Jujutsu Kaisen?",
  "Give me a spoiler-free review of Frieren."
];

export const AISection: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [input, setInput] = useState('');
  
  const { messages } = useSelector((state: RootState) => state.chat);
  const lastMessage = messages[messages.length - 1];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    dispatch(sendMessage({ text: input }) as any);
    setInput('');
    navigate('/chatbot');
  };

  const handlePromptClick = (text: string) => {
    dispatch(sendMessage({ text }) as any);
    navigate('/chatbot');
  };

  return (
    <section>
      <SectionHeader 
        title="AI Companion" 
        subtitle="Your personal anime encyclopedia and recommendation assistant."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden relative">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-anime-primary/5 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
        
        {/* Left Side: Assistant Info & Prompts */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-fraunces text-white">Hello, Otaku.</h3>
              <p className="text-sm font-inter text-anime-text/70">Ready to explore new worlds today?</p>
            </div>
          </div>

          <div className="space-y-3 mb-10">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(prompt)}
                className="w-full text-left px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 hover:border-white/20 transition-all font-inter text-sm text-white/80 hover:text-white flex items-center group cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-anime-text/50 mr-3 group-hover:text-anime-primary transition-colors" />
                <span className="truncate">{prompt}</span>
              </button>
            ))}
          </div>

          <button 
            onClick={() => navigate('/chatbot')}
            className="flex items-center justify-center space-x-2 w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all cursor-pointer shadow-lg"
          >
            <span>Open AI Companion</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Right Side: Conversation Preview & Input */}
        <div className="bg-black/20 p-8 md:p-10 border-l border-white/5 flex flex-col justify-end relative">
          
          <div className="flex-1 flex flex-col justify-end space-y-4 mb-6">
            <div className="flex items-center space-x-2 text-xs font-mono text-anime-text/50 uppercase tracking-widest mb-2">
              <Command className="w-3.5 h-3.5" />
              <span>Recent Activity</span>
            </div>
            
            {/* Minimalist Preview Bubble */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-anime-primary/20 flex items-center justify-center border border-anime-primary/30">
                  <Bot className="w-3.5 h-3.5 text-anime-primary" />
                </div>
                <span className="text-xs font-bold font-inter text-anime-primary">Assistant</span>
              </div>
              <p className="text-sm font-inter text-white/90 leading-relaxed">
                {lastMessage?.text || "I'm currently analyzing the latest seasonal drops. Want to hear what's trending in the psychological thriller genre?"}
              </p>
            </div>
          </div>

          {/* Low emphasis input */}
          <form onSubmit={handleSend} className="relative mt-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a quick command..."
              className="w-full bg-white/[0.03] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-white/10 rounded-xl py-3.5 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-white/20 transition-all font-inter placeholder:text-anime-text/40"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>
    </section>
  );
};
