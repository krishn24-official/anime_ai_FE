import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { actorService, type ActorItem } from '../../services/actorService';

const ActorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [actor, setActor] = useState<ActorItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      actorService.getActor(id)
        .catch(err => {
          // If fetch fails, try searching by name
          return actorService.searchActors(id).then(res => {
            if (res && res.length > 0) {
              return actorService.getActor(res[0].id);
            }
            throw err;
          });
        })
        .then(data => {
          setActor(data);
          setError(null);
        })
        .catch(err => {
          setError(err.response?.data?.detail || "Actor not found");
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

  if (error || !actor) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center pt-20">
        <div className="text-red-500 bg-red-500/10 px-6 py-4 rounded-xl border border-red-500/20">
          {error || "Actor not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white">
      <div className="max-w-7xl mx-auto px-6 py-24">
        
        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className="shrink-0 w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-2xl border-4 border-white/10 relative">
            <img 
              src={actor.images?.profile || `https://ui-avatars.com/api/?name=${encodeURIComponent(actor.name)}&background=222&color=fff&size=512`} 
              alt={actor.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              {actor.name}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              {actor.birthdate && (
                <div>
                  <span className="block text-xs uppercase tracking-wider mb-1 text-gray-500">Born</span>
                  <span className="font-medium text-gray-300">{actor.birthdate}</span>
                </div>
              )}
            </div>
            
            {actor.biography && (
              <div className="space-y-3">
                <h2 className="text-xl font-bold">Biography</h2>
                <p className="text-gray-300 leading-relaxed max-w-3xl whitespace-pre-wrap text-sm md:text-base">
                  {actor.biography}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {actor.filmography && actor.filmography.length > 0 && (
          <div className="mt-16 space-y-6">
            <h2 className="text-2xl font-bold border-b border-white/10 pb-4">Known For</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {actor.filmography.map((item, idx) => (
                <Link to={`/content/${item.content_type}/${item.id}`} key={idx} className="group flex flex-col space-y-3 cursor-pointer">
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

export default ActorDetail;
