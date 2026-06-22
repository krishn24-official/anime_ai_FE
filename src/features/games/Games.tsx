import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import {
  resetTiktokGame,
  addToTeam,
  skipCard
} from '../../store/slices/gameSlice';
import { apiClient } from '../../services/apiClient';
import { Sparkles, RefreshCw, CheckCircle, XCircle, Heart, X, Play, HelpCircle, Loader2 } from 'lucide-react';
import TierListList from '../tierList/TierListList';
import TierListEditor from '../tierList/TierListEditor';
import TierListView from '../tierList/TierListView';

interface Character {
  id: string;
  name: string;
  image: string;
  anime_ids: string[];
  game_properties: string[];
}

interface Question {
  key: string;
  text: string;
}

const Games: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const isTierListPath = location.pathname.startsWith('/games/tier-lists');
  const [activeGame, setActiveGame] = useState<'akinator' | 'tiktok' | 'tierlist'>(
    isTierListPath ? 'tierlist' : 'akinator'
  );

  useEffect(() => {
    if (location.pathname.startsWith('/games/tier-lists')) {
      setActiveGame('tierlist');
    } else if (location.pathname === '/games' || location.pathname === '/games/') {
      if (activeGame === 'tierlist') {
        setActiveGame('akinator');
      }
    }
  }, [location.pathname]);

  const handleTabChange = (tab: 'akinator' | 'tiktok' | 'tierlist') => {
    setActiveGame(tab);
    if (tab === 'tierlist') {
      navigate('/games/tier-lists');
    } else {
      navigate('/games');
    }
  };

  const { tiktok } = useSelector((state: RootState) => state.games);

  // --- Dynamic Akinator State ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [candidates, setCandidates] = useState<Character[]>([]);
  const [askedKeys, setAskedKeys] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'guessed' | 'failed'>('intro');
  const [questionCount, setQuestionCount] = useState(0);
  const [finalGuess, setFinalGuess] = useState<Character | null>(null);
  const [revealedWho, setRevealedWho] = useState<string>('');

  // Start/Restart Game
  const startNewAkinatorGame = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<{
        total: number;
        characters: Character[];
        questions: Question[];
      }>('/game/characters');

      setAllCharacters(data.characters);
      setAllQuestions(data.questions);
      setCandidates(data.characters);
      setAskedKeys([]);
      setQuestionCount(0);
      setFinalGuess(null);
      setRevealedWho('');

      // Find the first best question
      const firstQuestion = getBestQuestion(data.characters, [], data.questions);
      if (firstQuestion) {
        setCurrentQuestion(firstQuestion);
        setGameState('playing');
      } else {
        setGameState('failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load character database');
    } finally {
      setLoading(false);
    }
  };

  // Pick the most balanced question (minimizes |yes_count - no_count|)
  const getBestQuestion = (currentCandidates: Character[], currentAskedKeys: string[], questionsList: Question[]) => {
    const available = questionsList.filter(q => !currentAskedKeys.includes(q.key));
    let best: Question | null = null;
    let bestScore = Infinity;

    for (const q of available) {
      const yes = currentCandidates.filter(c => c.game_properties.includes(q.key)).length;
      const no = currentCandidates.length - yes;
      if (yes === 0 || no === 0) continue; // skip useless questions
      const score = Math.abs(yes - no);
      if (score < bestScore) {
        bestScore = score;
        best = q;
      }
    }
    return best;
  };

  // Handle Yes/No/Don't Know answers
  const handleAnswer = (answerType: 'yes' | 'no' | 'dont_know') => {
    if (!currentQuestion) return;

    let nextCandidates = [...candidates];
    const nextAskedKeys = [...askedKeys, currentQuestion.key];

    if (answerType !== 'dont_know') {
      const isYes = answerType === 'yes';
      nextCandidates = candidates.filter(char =>
        isYes
          ? char.game_properties.includes(currentQuestion.key)
          : !char.game_properties.includes(currentQuestion.key)
      );
    }

    setCandidates(nextCandidates);
    setAskedKeys(nextAskedKeys);
    setQuestionCount(prev => prev + 1);

    // Evaluate state
    if (nextCandidates.length === 1) {
      setFinalGuess(nextCandidates[0]);
      setGameState('guessed');
    } else if (nextCandidates.length === 0) {
      setGameState('failed');
    } else {
      // Find next best question
      const nextQ = getBestQuestion(nextCandidates, nextAskedKeys, allQuestions);
      if (nextQ) {
        setCurrentQuestion(nextQ);
      } else {
        // No more useful questions to distinguish remaining candidates
        if (nextCandidates.length > 0) {
          setFinalGuess(nextCandidates[0]);
          setGameState('guessed');
        } else {
          setGameState('failed');
        }
      }
    }
  };

  const resetAkinatorGame = () => {
    setGameState('intro');
    setCandidates([]);
    setAskedKeys([]);
    setCurrentQuestion(null);
    setQuestionCount(0);
    setFinalGuess(null);
    setRevealedWho('');
  };

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
        <div className="flex flex-wrap gap-1 bg-white/5 p-1 rounded-xl border border-white/5 shrink-0 justify-center">
          <button
            onClick={() => handleTabChange('akinator')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeGame === 'akinator' ? 'bg-anime-primary text-anime-bg' : 'text-anime-text hover:text-white'
            }`}
          >
            Akinator Guesser
          </button>
          <button
            onClick={() => handleTabChange('tiktok')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeGame === 'tiktok' ? 'bg-anime-primary text-anime-bg' : 'text-anime-text hover:text-white'
            }`}
          >
            TikTok Team Builder
          </button>
          <button
            onClick={() => handleTabChange('tierlist')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeGame === 'tierlist' ? 'bg-anime-primary text-anime-bg' : 'text-anime-text hover:text-white'
            }`}
          >
            Tier Maker
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

          {gameState === 'intro' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-outfit text-white">Think of a Character</h2>
              <p className="text-xs text-anime-text max-w-sm mx-auto leading-relaxed">
                Think of any popular anime character (e.g. Gojo Satoru, Kakashi, Naruto, Luffy, Levi Ackerman) and answer the questions. The AI will try to read your mind!
              </p>
              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                  {error}
                </p>
              )}
              <button
                onClick={startNewAkinatorGame}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-anime-primary to-anime-secondary hover:scale-105 transition-all text-anime-bg font-bold rounded-xl text-sm w-fit mx-auto flex items-center space-x-2 shadow-lg shadow-anime-primary/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading Characters...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-anime-bg" />
                    <span>Start Guessing</span>
                  </>
                )}
              </button>
            </div>
          )}

          {gameState === 'playing' && currentQuestion && (
            <div className="space-y-6">
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-anime-secondary">
                  <span>Progress: {questionCount} / {allQuestions.length}</span>
                  <span>Candidates Left: {candidates.length}</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="bg-anime-primary h-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (questionCount / Math.max(1, allQuestions.length)) * 100)}%`
                    }}
                  />
                </div>
              </div>

              <h3 className="text-xl font-bold text-white max-w-sm mx-auto min-h-[56px] flex items-center justify-center">
                {currentQuestion.text}
              </h3>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => handleAnswer('yes')}
                  className="px-6 py-2.5 bg-green-500/20 hover:bg-green-500/35 border border-green-500/30 text-green-300 font-bold rounded-xl text-xs transition-all"
                >
                  Yes
                </button>
                <button
                  onClick={() => handleAnswer('no')}
                  className="px-6 py-2.5 bg-red-500/20 hover:bg-red-500/35 border border-red-500/30 text-red-300 font-bold rounded-xl text-xs transition-all"
                >
                  No
                </button>
                <button
                  onClick={() => handleAnswer('dont_know')}
                  className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-xs transition-all"
                >
                  I don't know
                </button>
              </div>
            </div>
          )}

          {gameState === 'guessed' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider flex items-center justify-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>I think it's...</span>
                </span>
                <div className="space-y-3 animate-fade-in">
                  <img
                    src={finalGuess?.image || (candidates.length > 0 ? candidates[0].image : 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500')}
                    alt={finalGuess?.name || (candidates.length > 0 ? candidates[0].name : 'Character')}
                    className="w-32 h-32 rounded-2xl object-cover mx-auto border border-anime-border shadow-lg shadow-anime-primary/10"
                  />
                  <h3 className="text-2xl font-bold text-white font-outfit">
                    {finalGuess?.name || (candidates.length > 0 ? candidates[0].name : 'Unknown')}
                  </h3>
                </div>

                <div className="flex justify-center space-x-3 pt-2">
                  <button
                    onClick={() => {
                      alert("Hooray! The AI guessed it right!");
                    }}
                    className="px-6 py-2 bg-green-500/20 hover:bg-green-500/35 border border-green-500/30 text-green-300 font-bold rounded-xl text-xs transition-all"
                  >
                    Yes, that's correct!
                  </button>
                  <button
                    onClick={() => {
                      setGameState('failed');
                    }}
                    className="px-6 py-2 bg-red-500/20 hover:bg-red-500/35 border border-red-500/30 text-red-300 font-bold rounded-xl text-xs transition-all"
                  >
                    No, that's wrong
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <button
                  onClick={resetAkinatorGame}
                  className="px-6 py-2.5 bg-white/5 border border-white/10 hover:border-anime-primary text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-2 mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>
              </div>
            </div>
          )}

          {gameState === 'failed' && (
            <div className="space-y-6">
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center justify-center space-x-1">
                <XCircle className="w-4 h-4" />
                <span>I give up!</span>
              </span>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Who were you thinking of?</h3>
                <div className="max-w-xs mx-auto space-y-2">
                  <select
                    value={revealedWho}
                    onChange={(e) => {
                      setRevealedWho(e.target.value);
                      if (e.target.value) {
                        alert(`Ah, ${e.target.value}! I'll do better next time.`);
                      }
                    }}
                    className="w-full bg-anime-bg/80 border border-anime-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-anime-primary"
                  >
                    <option value="">Select character...</option>
                    {allCharacters
                      .filter(c => !candidates.includes(c))
                      .map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))
                    }
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <button
                  onClick={resetAkinatorGame}
                  className="px-6 py-2.5 bg-white/5 border border-white/10 hover:border-anime-primary text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-2 mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              </div>
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

      {/* Tier Maker Game views */}
      {activeGame === 'tierlist' && (
        <div className="animate-fade-in">
          {(() => {
            const path = location.pathname;
            if (path === '/games/tier-lists' || path === '/games/tier-lists/') {
              return <TierListList />;
            }
            if (path === '/games/tier-lists/create') {
              return <TierListEditor />;
            }
            if (path.startsWith('/games/tier-lists/edit/')) {
              return <TierListEditor />;
            }
            if (path.startsWith('/games/tier-lists/view/')) {
              return <TierListView />;
            }
            return <TierListList />;
          })()}
        </div>
      )}
    </div>
  );
};

export default Games;
