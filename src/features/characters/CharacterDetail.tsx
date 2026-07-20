import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, ArrowLeft } from 'lucide-react';
import { characterService, type FrontendCharacter } from '../../services/characterService';

const parseCharacterDescription = (description: string, charName: string) => {
  if (!description) return { metadata: {} as Record<string, string>, biography: '' };

  let cleaned = description
    .replace(/__+/g, '')
    .replace(/\*+/g, '')
    .trim();

  cleaned = cleaned.replace(/!(?=\S)/g, '').replace(/(?<=\S)!/g, '');
  const metadata: Record<string, string> = {};
  let biography = cleaned;
  const keys = ['Height', 'Weight', 'Family', 'Affiliations', 'Bounty', 'Residence', 'Age', 'Blood Type', 'Relatives', 'Occupation', 'Rank', 'Status'];

  let loop = true;
  while (loop) {
    biography = biography.trim().replace(/^[\s!~]+/, '').trim();
    const match = biography.match(/^(Height|Weight|Family|Affiliations|Bounty|Residence|Age|Blood Type|Relatives|Occupation|Rank|Status):\s*/i);
    if (match) {
      const matchedKey = match[1];
      const normalizedKey = matchedKey.charAt(0).toUpperCase() + matchedKey.slice(1).toLowerCase();
      biography = biography.substring(match[0].length).trim();

      let nextKeyIndex = -1;
      for (const k of keys) {
        const nextKeyRegex = new RegExp(`\\b${k}:`, 'i');
        const searchMatch = biography.match(nextKeyRegex);
        if (searchMatch && searchMatch.index !== undefined) {
          if (nextKeyIndex === -1 || searchMatch.index < nextKeyIndex) {
            nextKeyIndex = searchMatch.index;
          }
        }
      }

      const bangIndex = biography.indexOf('!');
      let nameIndex = -1;
      const nameWords = charName.split(' ');
      const firstName = nameWords[0];
      const searchTerms = [charName, firstName, 'He is', 'She is', 'He was', 'She was', 'Born in', 'A member of'];
      for (const term of searchTerms) {
        if (!term || term.length < 3) continue;
        const termRegex = new RegExp(`\\b${term}\\b`, 'i');
        const termMatch = biography.match(termRegex);
        if (termMatch && termMatch.index !== undefined) {
          if (nameIndex === -1 || termMatch.index < nameIndex) {
            nameIndex = termMatch.index;
          }
        }
      }

      let valueEndIndex = biography.length;
      let cutLength = 0;

      if (nextKeyIndex !== -1) {
        valueEndIndex = Math.min(valueEndIndex, nextKeyIndex);
      }
      if (bangIndex !== -1) {
        if (nextKeyIndex === -1 || bangIndex < nextKeyIndex) {
          valueEndIndex = Math.min(valueEndIndex, bangIndex);
          cutLength = 1;
        }
      }
      if (nameIndex !== -1) {
        if (nameIndex > 3 && (nextKeyIndex === -1 || nameIndex < nextKeyIndex)) {
          valueEndIndex = Math.min(valueEndIndex, nameIndex);
        }
      }

      const val = biography.substring(0, valueEndIndex).trim();
      metadata[normalizedKey] = val;
      biography = biography.substring(valueEndIndex + cutLength).trim();
    } else {
      loop = false;
    }
  }

  biography = biography.replace(/^[\s!~]+/, '').trim();
  return { metadata, biography };
};

const CharacterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<FrontendCharacter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      characterService.fetchCharacter(id)
        .then(data => {
          setCharacter(data);
          setError(null);
        })
        .catch(err => {
          setError(err.response?.data?.detail || "Character not found");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-anime-primary"></div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center pt-20">
        <div className="text-red-500 bg-red-500/10 px-6 py-4 rounded-xl border border-red-500/20">
          {error || "Character not found"}
        </div>
      </div>
    );
  }

  const { metadata, biography } = parseCharacterDescription(character.description, character.name);

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white">
      <div className="max-w-7xl mx-auto px-6 py-24">
        
        <button 
          onClick={() => navigate(-1)} 
          className="mb-8 text-gray-400 hover:text-white transition-colors flex items-center gap-2 group w-fit"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className="shrink-0 w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-2xl border-4 border-white/10 relative">
            <img 
              src={character.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=222&color=fff&size=512`} 
              alt={character.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              {character.name}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              {character.dob && (
                <div>
                  <span className="block text-xs uppercase tracking-wider mb-1 text-gray-500">Birthday</span>
                  <span className="font-medium text-gray-300">{character.dob}</span>
                </div>
              )}
              {character.gender && (
                <div>
                  <span className="block text-xs uppercase tracking-wider mb-1 text-gray-500">Gender</span>
                  <span className="font-medium text-gray-300">{character.gender}</span>
                </div>
              )}
              {character.nativeName && (
                <div>
                  <span className="block text-xs uppercase tracking-wider mb-1 text-gray-500">Native Name</span>
                  <span className="font-medium text-gray-300">{character.nativeName}</span>
                </div>
              )}
            </div>

            {Object.keys(metadata).length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                {Object.entries(metadata).map(([key, value]) => (
                  <div key={key}>
                    <span className="block text-xs uppercase tracking-wider mb-1 text-gray-500">{key}</span>
                    <span className="font-medium text-gray-300 text-sm">{value}</span>
                  </div>
                ))}
              </div>
            )}
            
            {biography && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h2 className="text-xl font-bold">Biography</h2>
                <p className="text-gray-300 leading-relaxed max-w-3xl whitespace-pre-wrap text-sm md:text-base">
                  {biography}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {character.anime_details && character.anime_details.length > 0 && (
          <div className="mt-16 space-y-6">
            <h2 className="text-2xl font-bold border-b border-white/10 pb-4">Appears In</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {character.anime_details.map((item, idx) => (
                <Link to={`/content/anime/${item.id}`} key={idx} className="group flex flex-col space-y-3 cursor-pointer">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg bg-white/5 border border-white/10">
                    <img 
                      src={item.poster || 'https://via.placeholder.com/300x450'} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-10 h-10 text-white fill-white shadow-xl" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-anime-primary transition-colors">{item.title}</h3>
                    {item.year && <p className="text-xs text-gray-400 mt-0.5">{item.year}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default CharacterDetail;
