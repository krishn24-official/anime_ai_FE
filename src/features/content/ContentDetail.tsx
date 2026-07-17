import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Eye, Bookmark, Clock, ArrowLeft } from 'lucide-react';
import { contentService } from '../../services/contentService';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { toggleWatchlistThunk } from '../../store/slices/contentSlice';
import type { FrontendCategory } from '../../services/contentService';

const ContentDetail: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTrailerUrl, setActiveTrailerUrl] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');

  // Watchlist state from Redux
  const watchlist = useSelector((state: RootState) => state.content.watchlist);
  const isWatched = data ? watchlist.includes(data.id) : false;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (type && id) {
          const res = await contentService.fetchContentDetails(type as any, id);
          setData(res);
          
          // Map URL type to frontend category for comments
          let category: FrontendCategory = 'Anime';
          if (type === 'movie') category = 'Movies';
          if (type === 'tv_series') category = 'TV-Series';
          if (type === 'manga') category = 'Manga';
          
          const commentsRes = await contentService.fetchComments(category, id);
          setComments(commentsRes);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load details');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [type, id]);

  const handleToggleWatchlist = () => {
    if (data && type) {
      let category: FrontendCategory = 'Anime';
      if (type === 'movie') category = 'Movies';
      if (type === 'tv_series') category = 'TV-Series';
      if (type === 'manga') category = 'Manga';
      
      dispatch(toggleWatchlistThunk({ category, id: data.id }));
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !data || !type) return;
    try {
      let category: FrontendCategory = 'Anime';
      if (type === 'movie') category = 'Movies';
      if (type === 'tv_series') category = 'TV-Series';
      if (type === 'manga') category = 'Manga';
      
      await contentService.addComment(category, data.id, commentText);
      setCommentText('');
      // Refetch comments
      const commentsRes = await contentService.fetchComments(category, data.id);
      setComments(commentsRes);
    } catch (err) {
      alert('Failed to post comment. Make sure you are logged in.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="w-12 h-12 border-4 border-anime-primary/20 border-t-anime-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-red-400 font-semibold">{error || 'Content not found.'}</p>
      </div>
    );
  }

  const posterImg = data.images?.poster || 'https://via.placeholder.com/600x900?text=No+Poster';
  // Mock background if none exists, using poster as fallback
  const bgImg = data.images?.banner || posterImg;
  
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  const mainTrailerUrl = data.trailers?.[0]?.url || data.trailer_url;
  const mainTrailerId = getYouTubeId(mainTrailerUrl);

  return (
    <div className="min-h-screen bg-black text-white animate-fade-in -mx-4 sm:-mx-8 -mt-24 pb-20">
      {/* Hero Banner Section */}
      <div className="relative w-full h-[60vh] md:h-[75vh] flex items-end">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={bgImg} 
            alt="Background" 
            className="w-full h-full object-cover opacity-50"
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-28 left-8 p-2 bg-black/40 hover:bg-black/80 rounded-full border border-white/10 transition-all z-20"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Play Trailer Button (Center) */}
        {mainTrailerId && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <button 
              onClick={() => setActiveTrailerUrl(mainTrailerUrl)}
              className="pointer-events-auto w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all cursor-pointer shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
              <Play className="w-6 h-6 ml-1 fill-white" />
            </button>
          </div>
        )}

        {/* Content Details Overlay */}
        <div className="relative z-10 w-full px-8 pb-12 flex flex-col md:flex-row gap-8 items-end">
          {/* Floating Poster */}
          <div className="hidden md:block shrink-0 w-64 rounded-xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10 translate-y-16">
            <img src={posterImg} alt="Poster" className="w-full aspect-[2/3] object-cover" />
          </div>

          {/* Title & Actions */}
          <div className="flex-1 space-y-4">
            <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <span className="capitalize">{type?.replace('_', ' ')}</span>
              <span>•</span>
              <span>{data.year || 'Unknown Year'}</span>
              <span>•</span>
              <span>2h 21m</span> {/* Mock Duration */}
            </div>

            <h1 className="text-5xl md:text-7xl font-bold font-fraunces text-white leading-tight">
              {data.title}
            </h1>

            {/* Mock Meta Info Grid */}
            <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm mt-4">
              <div>
                <span className="block text-gray-400 text-xs mb-1">Directed By</span>
                <span className="font-semibold">{data.crew?.[0]?.name || 'Unknown'}</span>
              </div>
              <div>
                <span className="block text-gray-400 text-xs mb-1">Country</span>
                <span className="font-semibold">India</span> {/* Mock */}
              </div>
              <div>
                <span className="block text-gray-400 text-xs mb-1">Language</span>
                <span className="font-semibold">Hindi</span> {/* Mock */}
              </div>
              <div>
                <span className="block text-gray-400 text-xs mb-1">Age Rating</span>
                <span className="font-semibold">16+</span> {/* Mock */}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={handleToggleWatchlist}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#A855F7] hover:bg-[#9333EA] text-white font-semibold transition-all shadow-lg shadow-purple-500/20"
              >
                <Eye className="w-4 h-4" />
                <span>{isWatched ? 'Watched' : 'Mark as Watched'}</span>
              </button>
              <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/5 text-white font-semibold transition-all">
                <Bookmark className="w-4 h-4" />
                <span>Collections</span>
              </button>
              <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/5 text-white font-semibold transition-all">
                <Clock className="w-4 h-4" />
                <span>Watch Later</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl px-8 pt-24 space-y-16">
        
        {/* Overview & Genres */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Overview</h2>
          <p className="text-gray-300 leading-relaxed text-sm md:text-base">
            {data.description || 'No description available for this title.'}
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            {data.genres?.map((g: string, i: number) => (
              <span key={i} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium">
                {g}
              </span>
            ))}
          </div>
        </section>

        {/* Trailers & Videos */}
        {data.trailers && data.trailers.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Trailers & Videos</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
              {data.trailers.map((t: any, i: number) => {
                const yId = getYouTubeId(t.url);
                if (!yId) return null;
                return (
                  <div 
                    key={i} 
                    onClick={() => setActiveTrailerUrl(t.url)}
                    className="shrink-0 w-72 group cursor-pointer space-y-3"
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group-hover:border-[#62E7E0] transition-colors">
                      <img 
                        src={`https://img.youtube.com/vi/${yId}/mqdefault.jpg`} 
                        alt={t.label} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 ml-1 fill-white" />
                         </div>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors line-clamp-1">{t.label || `Video ${i+1}`}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Cast Section */}
        {data.cast?.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Cast</h2>
            <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
              {data.cast.map((actor: any, idx: number) => (
                <div key={idx} className="flex flex-col items-center shrink-0 w-24">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-transparent hover:border-anime-primary transition-all cursor-pointer">
                    <img 
                      src={actor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(actor.name || actor.english || actor)}&background=222&color=fff`} 
                      alt={actor.name || actor.english || actor} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="mt-3 text-sm font-semibold text-center leading-tight">
                    {actor.name || actor.english || actor}
                  </span>
                  <span className="text-xs text-gray-400 mt-1 text-center line-clamp-1">
                    {actor.role || 'Actor'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Crew Section */}
        {data.crew?.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Crew</h2>
            <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
              {data.crew.map((member: any, idx: number) => (
                <div key={idx} className="flex flex-col items-center shrink-0 w-24">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-transparent hover:border-anime-primary transition-all cursor-pointer">
                    <img 
                      src={member.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || member)}&background=222&color=fff`} 
                      alt={member.name || member} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="mt-3 text-sm font-semibold text-center leading-tight">
                    {member.name || member}
                  </span>
                  <span className="text-xs text-gray-400 mt-1 text-center line-clamp-1">
                    {member.role || 'Crew'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Production House */}
        {data.production_house?.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Production House</h2>
            <div className="flex flex-wrap gap-3">
              {data.production_house.map((ph: string, idx: number) => (
                <span key={idx} className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold">
                  {ph}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Producers */}
        {data.producers?.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Producers</h2>
            <div className="flex flex-wrap gap-3">
              {data.producers.map((producer: string, idx: number) => (
                <span key={idx} className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold">
                  {producer}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Reviews Divider */}
        <div className="h-px w-full bg-white/10 my-8" />

        {/* User Reviews Section */}
        <section className="space-y-8 max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-3xl font-bold">User Reviews</h2>
          </div>

          <div className="bg-[#111] p-4 rounded-2xl border border-white/5">
            <textarea 
              placeholder="Write your review here..."
              className="w-full bg-transparent text-white text-sm resize-none focus:outline-none p-2 placeholder:text-gray-500"
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-3">
              <span className="text-xs text-gray-500 ml-2">{commentText.length}/1000</span>
              <button 
                onClick={handlePostComment}
                disabled={!commentText.trim()}
                className="px-6 py-2 bg-white text-black font-bold rounded-full text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            {comments.map((comment: any, i: number) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.username)}&background=222&color=fff`} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full" 
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-200">{comment.username}</span>
                    <span className="text-xs text-gray-500">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{comment.text}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="text-center text-gray-500 py-8">No reviews yet. Be the first to review!</div>
            )}
          </div>
        </section>

      </div>

      {/* Trailer Modal */}
      {activeTrailerUrl && getYouTubeId(activeTrailerUrl) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
            <button 
              onClick={() => setActiveTrailerUrl(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-all cursor-pointer"
            >
              ✕
            </button>
            <iframe 
              src={`https://www.youtube.com/embed/${getYouTubeId(activeTrailerUrl)}?autoplay=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentDetail;
