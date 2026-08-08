import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Share2, Loader2, Check } from 'lucide-react';
import { toPng } from 'html-to-image';
import { getOptimizedImageUrl } from '../services/imageHelper';

interface EventCardShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    title: string;
    subtitle: string;
    poster: string;
    yearsAgo: string;   // e.g. "1 Year Ago"
    typeLabel: string;  // e.g. "Movie"
  } | null;
}

const EventCardShareModal: React.FC<EventCardShareModalProps> = ({ isOpen, onClose, event }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Capture the card as soon as the modal opens
  useEffect(() => {
    if (!isOpen || !event) return;
    setCapturedDataUrl(null);

    // Small delay so the DOM renders the card fully (including the image)
    const timer = setTimeout(async () => {
      if (!cardRef.current) return;
      setCapturing(true);
      try {
        const dataUrl = await toPng(cardRef.current, {
          pixelRatio: 3, // 3x for high-res output
          backgroundColor: '#000000',
          style: { transform: 'scale(1)', transformOrigin: 'top left' } // ensures scaling doesn't bug out
        });
        setCapturedDataUrl(dataUrl);
      } catch (err) {
        console.error('[EventCardShare] html-to-image failed:', err);
      } finally {
        setCapturing(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const handleDownload = () => {
    if (!capturedDataUrl) return;
    const link = document.createElement('a');
    link.download = `${event.title.replace(/\s+/g, '_')}_card.png`;
    link.href = capturedDataUrl;
    link.click();
  };

  const handleCopy = async () => {
    if (!capturedDataUrl) return;
    try {
      const res = await fetch(capturedDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleShare = async () => {
    if (!capturedDataUrl) return;
    try {
      const res = await fetch(capturedDataUrl);
      const blob = await res.blob();
      const file = new File([blob], `${event.title}_card.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: event.title, text: `${event.yearsAgo} — ${event.subtitle}` });
      } else {
        handleDownload();
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  // Determine type badge background colour matching the app's badge colours
  const typeBadgeBg = (() => {
    switch (event.typeLabel.toLowerCase()) {
      case 'anime': return 'rgba(139,92,246,0.85)';   // purple
      case 'manga': return 'rgba(59,130,246,0.85)';   // blue
      case 'movie': return 'rgba(0,0,0,0.70)';        // dark
      case 'tv series': return 'rgba(16,185,129,0.85)'; // green
      case 'episode': return 'rgba(239,68,68,0.85)';  // red
      default: return 'rgba(0,0,0,0.70)';
    }
  })();

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
      <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl p-6 relative flex flex-col items-center gap-5">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <p className="text-xs font-bold text-white/50 uppercase tracking-widest self-start">Share Card</p>

        {/* ── THE CARD BEING CAPTURED ─────────────────────────── */}
        {/* This div is what html2canvas captures — it's the exact card from the home page */}
        <div
          ref={cardRef}
          className="relative rounded-xl overflow-hidden shadow-2xl"
          style={{ 
            fontFamily: 'Inter, sans-serif',
            border: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: '#000000',
            width: '200px',
            height: '300px'
          }}
        >
          {/* Poster image (cache-busted to bypass browser's non-CORS cache) */}
          <img
            src={event.poster ? `${getOptimizedImageUrl(event.poster, 600)}${getOptimizedImageUrl(event.poster, 600).includes('?') ? '&' : '?'}cors=1` : ''}
            alt={event.title}
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
          />

          {/* Gradient overlay — exactly matching TodaysEventsSection */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '200px',
              height: '300px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '12px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.60) 45%, rgba(0,0,0,0.10) 75%, transparent 100%)'
            }}
          >
            {/* Years Ago badge */}
            <span
              className="self-start px-2 py-1 text-[9px] font-bold uppercase rounded-md mb-1.5"
              style={{ 
                background: 'rgba(245,158,11,0.88)', 
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff'
              }}
            >
              {event.yearsAgo}
            </span>

            {/* Type badge */}
            <span
              className="self-start px-2 py-1 text-[9px] font-bold uppercase rounded-md mb-2"
              style={{ 
                background: typeBadgeBg, 
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff'
              }}
            >
              {event.typeLabel}
            </span>

            {/* Title */}
            <h3 
              className="font-bold text-sm" 
              style={{ color: '#ffffff', overflow: 'hidden', lineHeight: '1.2' }}
            >
              {event.title}
            </h3>

            {/* Subtitle */}
            <p 
              className="text-[10px] mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis" 
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              {event.subtitle}
            </p>
          </div>
        </div>

        {/* ── Preview of captured image (high-res) ─── */}
        {capturing && (
          <div className="flex flex-col items-center gap-2 text-white/50 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
            <span>Generating image…</span>
          </div>
        )}

        {capturedDataUrl && !capturing && (
          <div className="text-center">
            <p className="text-[10px] text-white/40 mb-2 uppercase tracking-wider">Preview (high-res)</p>
            <img
              src={capturedDataUrl}
              alt="captured card"
              className="w-[140px] aspect-[2/3] rounded-xl object-cover border border-white/10 shadow-xl"
            />
          </div>
        )}

        {/* ── Action Buttons ─────────────────────────── */}
        <div className="w-full space-y-2">
          <button
            onClick={handleDownload}
            disabled={!capturedDataUrl || capturing}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}
          >
            <Download className="w-4 h-4" />
            Download PNG
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              disabled={!capturedDataUrl || capturing}
              className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isCopied ? (
                <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copied!</span></>
              ) : (
                <><span>Copy Image</span></>
              )}
            </button>

            <button
              onClick={handleShare}
              disabled={!capturedDataUrl || capturing}
              className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EventCardShareModal;
