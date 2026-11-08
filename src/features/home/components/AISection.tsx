import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowRight, Bot, Sparkles } from 'lucide-react';
import { sendMessage } from '../../../store/slices/chatSlice';
import type { AppDispatch } from '../../../store';

const STARTERS = [
  'What should I watch after Frieren?',
  'Who are the strongest characters in Jujutsu Kaisen?',
  'Explain the ending of Evangelion.',
];

/** Compact entry point to the AI Companion, with one-tap starter questions. */
export const AISection: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const ask = (text: string) => {
    dispatch(sendMessage({ text }));
    navigate('/chatbot');
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-anime-primary/30 bg-gradient-to-br from-anime-secondary/35 via-anime-card to-anime-card p-5 sm:p-7 h-full flex flex-col">
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-anime-primary/25 blur-3xl pointer-events-none" />
      <div className="relative flex items-center gap-3">
        <span className="w-11 h-11 rounded-xl bg-anime-primary/20 border border-anime-primary/40 flex items-center justify-center">
          <Bot className="w-6 h-6 text-anime-primary" />
        </span>
        <h2 className="text-2xl font-bold font-fraunces text-white">AI Companion</h2>
      </div>
      <p className="relative mt-3 text-sm text-white/75">Your personal anime encyclopedia and recommendation assistant.</p>

      <div className="relative mt-5 space-y-2 flex-1">
        {STARTERS.map((q) => (
          <button
            key={q}
            onClick={() => ask(q)}
            className="w-full flex items-center gap-2.5 text-left px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 hover:border-anime-primary/60 hover:bg-white/[0.08] text-sm text-white/85 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 shrink-0 text-anime-primary" />
            <span className="line-clamp-1">{q}</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => navigate('/chatbot')}
        className="relative mt-5 inline-flex items-center justify-center gap-2 w-full sm:w-auto sm:self-start px-6 py-3 rounded-full bg-violet-200 text-anime-bg font-semibold hover:bg-white transition-colors cursor-pointer"
      >
        Ask Anything <ArrowRight className="w-4 h-4" />
      </button>
    </section>
  );
};
