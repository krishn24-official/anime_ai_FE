import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Loader2, Calendar, Film, BookOpen } from 'lucide-react';
import { contentService } from '../../services/contentService';
import type { EpisodeDetail, ChapterDetail } from '../../services/contentService';
import { getOptimizedImageUrl } from '../../services/imageHelper';

interface EpisodeChapterSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'episode' | 'chapter';
  contentId: string;
}

export const EpisodeChapterSummaryModal: React.FC<EpisodeChapterSummaryModalProps> = ({
  isOpen,
  onClose,
  type,
  contentId,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [episodeData, setEpisodeData] = useState<EpisodeDetail | null>(null);
  const [chapterData, setChapterData] = useState<ChapterDetail | null>(null);

  useEffect(() => {
    if (!isOpen || !contentId) return;

    setLoading(true);
    setError(null);
    setEpisodeData(null);
    setChapterData(null);

    const fetchData = async () => {
      try {
        if (type === 'episode') {
          const data = await contentService.fetchEpisodeDetail(contentId);
          setEpisodeData(data);
        } else {
          const data = await contentService.fetchChapterDetail(contentId);
          setChapterData(data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, contentId, type]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const parentTitle = type === 'episode' ? episodeData?.parent_title : chapterData?.parent_title;
  const parentPoster = type === 'episode' ? episodeData?.parent_poster : chapterData?.parent_poster;
  const parentId = type === 'episode' ? episodeData?.parent_id : chapterData?.parent_id;
  const parentType = type === 'episode' ? episodeData?.parent_type : 'manga';

  const handleParentClick = () => {
    if (parentType && parentId) {
      onClose();
      navigate(`/content/${parentType}/${parentId}`);
    }
  };

  const summary = type === 'episode' ? episodeData?.summary : chapterData?.summary;
  const releaseDate = type === 'episode' ? episodeData?.release_date : chapterData?.release_date;

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999] overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg bg-anime-bg border border-anime-border rounded-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all cursor-pointer z-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center p-16">
            <Loader2 className="w-8 h-8 animate-spin text-anime-primary" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-8 text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (episodeData || chapterData) && (
          <>
            {/* Parent Header */}
            {parentPoster && (
              <div
                className="relative w-full h-48 overflow-hidden rounded-t-2xl cursor-pointer group"
                onClick={handleParentClick}
              >
                <img
                  src={getOptimizedImageUrl(parentPoster, 600)}
                  alt={parentTitle || ''}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-anime-bg via-anime-bg/60 to-transparent" />
                <div className="absolute bottom-4 left-5 right-12">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-anime-primary mb-1">
                    {type === 'episode' ? (parentType === 'anime' ? 'Anime' : 'TV Series') : 'Manga'}
                  </p>
                  <h3 className="text-white font-bold text-lg font-fraunces line-clamp-2 group-hover:text-anime-primary transition-colors">
                    {parentTitle || 'Unknown'}
                  </h3>
                </div>
              </div>
            )}

            {/* Detail Body */}
            <div className="p-5 pt-3 space-y-4">
              {/* Episode/Chapter Heading */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {type === 'episode' ? (
                    <Film className="w-4 h-4 text-anime-primary shrink-0" />
                  ) : (
                    <BookOpen className="w-4 h-4 text-anime-primary shrink-0" />
                  )}
                  <h2 className="text-white font-bold text-xl font-fraunces">
                    {type === 'episode'
                      ? `Episode ${episodeData?.episode_number}`
                      : `Chapter ${chapterData?.chapter_number}`}
                  </h2>
                </div>
                {type === 'episode' && episodeData?.title && (
                  <p className="text-anime-text text-sm ml-6">{episodeData.title}</p>
                )}
              </div>

              {/* Badges Row */}
              {type === 'episode' && episodeData && (
                <div className="flex flex-wrap gap-2">
                  {episodeData.is_filler && (
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg bg-red-500/15 text-red-400 border border-red-500/20">
                      Filler
                    </span>
                  )}
                  {episodeData.canon_type && (
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg bg-anime-primary/10 text-anime-primary border border-anime-primary/20">
                      {episodeData.canon_type}
                    </span>
                  )}
                  {episodeData.arc && (
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {episodeData.arc}
                    </span>
                  )}
                  {episodeData.director && (
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg bg-white/5 text-anime-text border border-white/10">
                      Dir. {episodeData.director}
                    </span>
                  )}
                </div>
              )}

              {/* Release Date */}
              {releaseDate && (
                <div className="flex items-center gap-2 text-anime-text/60 text-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(releaseDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-white/5" />

              {/* Summary */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-anime-secondary mb-2">
                  Summary
                </h4>
                {summary ? (
                  <p className="text-anime-text text-sm leading-relaxed font-inter">
                    {summary}
                  </p>
                ) : (
                  <p className="text-anime-text/40 text-sm italic font-inter">
                    No summary available yet.
                  </p>
                )}
              </div>

              {/* Parent Link Button */}
              {parentId && (
                <button
                  onClick={handleParentClick}
                  className="w-full mt-2 py-2.5 bg-white/5 hover:bg-anime-primary/10 border border-white/10 hover:border-anime-primary/30 rounded-xl text-xs font-semibold text-anime-text hover:text-anime-primary transition-all cursor-pointer"
                >
                  View Full {type === 'episode' ? (parentType === 'anime' ? 'Anime' : 'Series') : 'Manga'} Page →
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
