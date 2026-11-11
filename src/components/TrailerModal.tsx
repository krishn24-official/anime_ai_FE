import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { getYouTubeId } from '../utils/youtube';

interface TrailerModalProps {
  url: string | null;
  onClose: () => void;
}

/** Full-screen YouTube player. Renders nothing for a missing or non-YouTube URL. */
export const TrailerModal: React.FC<TrailerModalProps> = ({ url, onClose }) => {
  const videoId = getYouTubeId(url);

  useEffect(() => {
    if (!videoId) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [videoId, onClose]);

  if (!videoId) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Trailer"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10"
      >
        <button
          onClick={onClose}
          aria-label="Close trailer"
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-9 h-9 sm:w-10 sm:h-10 bg-black/60 hover:bg-black/90 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title="Trailer"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    </div>
  );
};
