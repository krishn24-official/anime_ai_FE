import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import {
  startAkinator,
  answerAkinatorQuestion,
  resetAkinator,
  resetTiktokGame,
  addToTeam,
  skipCard,
  akinatorQuestionsList
} from '../../store/slices/gameSlice';
import { Sparkles, RefreshCw, CheckCircle, XCircle, Heart, X, Play, HelpCircle } from 'lucide-react';

const Games: React.FC = () => {
  const dispatch = useDispatch();
  const [activeGame, setActiveGame] = useState<'akinator' | 'tiktok'>('akinator');
  
  const { akinator, tiktok } = useSelector((state: RootState) => state.games);

  const currentAkinatorQuestion = akinatorQuestionsList[akinator.currentQuestionIndex];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Banner */}
      <div className="glass-panel p-8 rounded-2xl border border-anime-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-anime-primary text-xs font-semibold uppercase tracking-wider">Playground</span>
          <h1 className="text-3xl font-bold font-outfit text-white mt-1">Anime Arcades</h1>
          <p className="text-sm text-anime-text mt-1">
            Challenge our AI in guessing who you think of, or test your drafting skills in our TikTok Team builder.
          </p>
        </div>

        {/* Game toggle */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 shrink-0">
          <button
            onClick={() => setActiveGame('akinator')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeGame === 'akinator' ? 'bg-anime-primary text-anime-bg' : 'text-anime-text hover:text-white'
            }`}
          >
            Akinator Guesser
          </button>
          <button
            onClick={() => setActiveGame('tiktok')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeGame === 'tiktok' ? 'bg-anime-primary text-anime-bg' : 'text-anime-text hover:text-white'
            }`}
          >
            TikTok Team Builder
          </button>
        </div>
      </div>

      {/* Akinator Guesser Game */}
      {activeGame === 'akinator' && (
        <div className="glass-panel p-8 rounded-2xl border border-anime-border max-w-xl mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-anime-primary/10 border border-anime-primary/20 flex items-center justify-center animate-pulse-glow">
              <HelpCircle className="w-8 h-8 text-anime-primary" />
            </div>
          </div>

          {akinator.gameState === 'intro' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-outfit text-white">Think of a Character</h2>
              <p className="text-xs text-anime-text max-w-sm mx-auto leading-relaxed">
                Think of any popular anime character (e.g. Gojo Satoru, Kakashi, Naruto, Luffy, Levi Ackerman) and answer the questions. The AI will try to read your mind!
              </p>
              <button
                onClick={() => dispatch(startAkinator())}
                className="px-8 py-3 bg-gradient-to-r from-anime-primary to-anime-secondary hover:scale-105 transition-all text-anime-bg font-bold rounded-xl text-sm w-fit mx-auto flex items-center space-x-2 shadow-lg shadow-anime-primary/20"
              >
                <Play className="w-4 h-4 fill-anime-bg" />
                <span>Start Guessing</span>
              </button>
            </div>
          )}

          {akinator.gameState === 'playing' && currentAkinatorQuestion && (
            <div className="space-y-6">
              <span className="text-[10px] text-anime-secondary font-bold uppercase tracking-wider">
                Question {akinator.currentQuestionIndex + 1} of {akinatorQuestionsList.length}
              </span>
              <h3 className="text-xl font-bold text-white max-w-sm mx-auto">
                {currentAkinatorQuestion.text}
              </h3>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => dispatch(answerAkinatorQuestion('yes'))}
                  className="px-6 py-2.5 bg-green-500/20 hover:bg-green-500/35 border border-green-500/30 text-green-300 font-bold rounded-xl text-xs transition-all"
                >
                  Yes
                </button>
                <button
                  onClick={() => dispatch(answerAkinatorQuestion('no'))}
                  className="px-6 py-2.5 bg-red-500/20 hover:bg-red-500/35 border border-red-500/30 text-red-300 font-bold rounded-xl text-xs transition-all"
                >
                  No
                </button>
                <button
                  onClick={() => dispatch(answerAkinatorQuestion('dont_know'))}
                  className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-xs transition-all"
                >
                  Probably / Not Sure
                </button>
              </div>
            </div>
          )}

          {akinator.gameState === 'guessed' && akinator.guess && (
            <div className="space-y-6">
              <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider flex items-center justify-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>Guess Complete!</span>
              </span>
              <div className="space-y-3">
                <img
                  src={akinator.guess.image}
                  alt={akinator.guess.name}
                  className="w-32 h-32 rounded-2xl object-cover mx-auto border border-anime-border shadow-lg"
                />
                <h3 className="text-2xl font-bold text-white">{akinator.guess.name}</h3>
                <p className="text-xs text-anime-secondary font-semibold">{akinator.guess.anime}</p>
              </div>

              <button
                onClick={() => dispatch(resetAkinator())}
                className="px-6 py-2.5 bg-white/5 border border-white/10 hover:border-anime-primary text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Play Again</span>
              </button>
            </div>
          )}

          {akinator.gameState === 'failed' && (
            <div className="space-y-6">
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center justify-center space-x-1">
                <XCircle className="w-4 h-4" />
                <span>Failed to Guess</span>
              </span>
              <p className="text-xs text-anime-text">
                Your character is too mysterious or rare! Try playing again with a more mainstream anime star.
              </p>
              <button
                onClick={() => dispatch(resetAkinator())}
                className="px-6 py-2.5 bg-white/5 border border-white/10 hover:border-anime-primary text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TikTok Team Builder Game */}
      {activeGame === 'tiktok' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Swipe Card Deck */}
          <div className="lg:col-span-2 glass-panel p-8 rounded-2xl border border-anime-border flex flex-col justify-between items-center min-h-[420px] text-center space-y-6">
            {!tiktok.teamEvaluated ? (
              <>
                <div className="space-y-1">
                  <span className="text-[10px] text-anime-secondary font-bold uppercase tracking-wider">
                    Anime Team Draft
                  </span>
                  <h3 className="text-lg font-bold text-white">Draft 3 members to form your combat squad!</h3>
                </div>

                {tiktok.currentCardIndex < tiktok.characterPool.length ? (
                  <div className="w-64 glass-panel rounded-2xl overflow-hidden border border-anime-border relative group shadow-2xl animate-fade-in">
                    <div className="h-64 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-anime-bg via-transparent to-transparent z-10" />
                      <img
                        src={tiktok.characterPool[tiktok.currentCardIndex].image}
                        alt={tiktok.characterPool[tiktok.currentCardIndex].name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-4 left-4 z-20 px-2 py-0.5 bg-anime-primary text-anime-bg text-[10px] font-bold rounded uppercase">
                        Power: {tiktok.characterPool[tiktok.currentCardIndex].power}
                      </span>
                    </div>
                    <div className="p-4 relative z-20">
                      <h4 className="font-bold text-white">{tiktok.characterPool[tiktok.currentCardIndex].name}</h4>
                      <p className="text-xs text-anime-text">{tiktok.characterPool[tiktok.currentCardIndex].anime}</p>
                      <p className="text-[10px] text-anime-pink font-semibold mt-1">Trait: {tiktok.characterPool[tiktok.currentCardIndex].trait}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-anime-text italic">No more characters left in the deck.</p>
                )}

                {/* Swipe controls */}
                <div className="flex space-x-6">
                  <button
                    onClick={() => dispatch(skipCard())}
                    className="p-4 bg-red-500/10 hover:bg-red-500/25 border border-red-500/35 hover:scale-105 transition-all rounded-full text-red-400 shadow-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => dispatch(addToTeam())}
                    className="p-4 bg-green-500/10 hover:bg-green-500/25 border border-green-500/35 hover:scale-105 transition-all rounded-full text-green-400 shadow-lg animate-pulse"
                  >
                    <Heart className="w-6 h-6 fill-current" />
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-6 my-auto">
                <span className="w-16 h-16 rounded-full bg-anime-primary/10 flex items-center justify-center mx-auto text-4xl font-black font-outfit border border-anime-primary text-anime-primary">
                  {tiktok.synergyTier}
                </span>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold font-outfit text-white">Draft Synergy Result</h3>
                  <p className="text-xs text-anime-text max-w-sm mx-auto leading-relaxed">{tiktok.synergyFeedback}</p>
                  <p className="text-xs text-anime-primary font-bold">Synergy Score: {tiktok.synergyScore}/100</p>
                </div>

                <button
                  onClick={() => dispatch(resetTiktokGame())}
                  className="px-6 py-2.5 bg-white/5 border border-white/10 hover:border-anime-primary text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-2 mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Draft New Team</span>
                </button>
              </div>
            )}
          </div>

          {/* Current Team list (Sidebar of game) */}
          <div className="glass-panel p-6 rounded-2xl border border-anime-border flex flex-col justify-between h-full">
            <div>
              <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-anime-yellow" />
                <span>Your Draft Team ({tiktok.team.length}/3)</span>
              </h3>

              <div className="space-y-3">
                {tiktok.team.map((char) => (
                  <div key={char.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center space-x-3">
                    <img src={char.image} alt={char.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-bold text-xs text-white">{char.name}</h4>
                      <p className="text-[10px] text-anime-text">{char.anime}</p>
                    </div>
                    <span className="ml-auto text-[10px] text-anime-primary font-bold">Power {char.power}</span>
                  </div>
                ))}
                {tiktok.team.length === 0 && (
                  <p className="text-xs text-anime-text/50 italic py-4">Draft is empty. Swipe right to add team members.</p>
                )}
              </div>
            </div>

            <div className="text-[10px] text-anime-text/40 pt-4 border-t border-white/5 mt-4">
              Add 3 characters to trigger automatic compatibility evaluation.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Games;
