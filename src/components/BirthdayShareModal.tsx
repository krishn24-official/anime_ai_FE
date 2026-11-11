import React, { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { X, Download, Share2, Check, Copy, Sparkles, Moon, Flower2, Zap, PartyPopper, Image as ImageIcon } from 'lucide-react';
import { getOptimizedImageUrl } from '../services/imageHelper';
import {
  BIRTHDAY_FONTS,
  BIRTHDAY_THEMES,
  drawBirthdayPoster,
  type BirthdayThemeId,
  type PosterAspect,
} from './birthdayPoster';

const THEME_ICONS: Record<BirthdayThemeId, React.ComponentType<{ className?: string }>> = {
  classic: ImageIcon,
  dark: Sparkles,
  sakura: Flower2,
  hero: Zap,
  night: Moon,
  celebration: PartyPopper,
};

const SIZES: { id: PosterAspect; label: string }[] = [
  { id: 'feed', label: 'Post 4:5' },
  { id: 'story', label: 'Story 9:16' },
];

interface BirthdayShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  image?: string;
  date?: Date;
}

/** Themed birthday poster: pick a theme and size, optionally add a wish, then download/copy/share. */
const BirthdayShareModal: React.FC<BirthdayShareModalProps> = ({ isOpen, onClose, name, image, date }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState<BirthdayThemeId>('classic');
  const [aspect, setAspect] = useState<PosterAspect>('feed');
  const [wish, setWish] = useState('');
  // The image we finished loading (or failed to), keyed by its source URL.
  const [loaded, setLoaded] = useState<{ src: string; el: HTMLImageElement | null } | null>(null);
  const img = image && loaded?.src === image ? loaded.el : null;
  const imgLoading = !!image && loaded?.src !== image;
  const [fontsReady, setFontsReady] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [copyError, setCopyError] = useState('');

  // Load the character art with CORS so the canvas stays exportable.
  useEffect(() => {
    if (!isOpen || !image) return;
    const optimized = getOptimizedImageUrl(image, 1080);
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => setLoaded({ src: image, el });
    el.onerror = () => setLoaded({ src: image, el: null });
    // cache-bust to avoid a cached non-CORS response
    el.src = `${optimized}${optimized.includes('?') ? '&' : '?'}cors=1`;
  }, [isOpen, image]);

  // Canvas text doesn't wait for web fonts — load them, then redraw.
  useEffect(() => {
    if (!isOpen || fontsReady || !document.fonts) return;
    let cancelled = false;
    Promise.all(BIRTHDAY_FONTS.map((f) => document.fonts.load(f)))
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setFontsReady(true); });
    return () => { cancelled = true; };
  }, [isOpen, fontsReady]);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    drawBirthdayPoster(canvasRef.current, {
      theme,
      aspect,
      name,
      wish,
      date: date ?? new Date(),
      image: img,
    });
  }, [isOpen, theme, aspect, name, wish, date, img, fontsReady]);

  if (!isOpen) return null;

  const fileName = `${name.replace(/\s+/g, '_')}_birthday_${theme}.png`;

  const toBlob = () =>
    new Promise<Blob | null>((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) return resolve(null);
      canvas.toBlob(resolve, 'image/png');
    });

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    if (Capacitor.isNativePlatform()) {
      try {
        await Filesystem.writeFile({ path: fileName, data: dataUrl.split(',')[1], directory: Directory.Documents });
        alert('Image saved to Documents!');
      } catch (err) {
        console.error('Download failed:', err);
        alert('Failed to save image.');
      }
      return;
    }
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    link.click();
  };

  const flashCopy = (state: 'copied' | 'failed', reason = '') => {
    setCopyState(state);
    setCopyError(reason);
    if (state === 'copied') setTimeout(() => setCopyState('idle'), 2500);
  };

  /** Copy isn't possible: say why. */
  const copyFailed = (reason: string) => {
    console.warn('[BirthdayShare] copy failed:', reason);
    flashCopy('failed', reason);
  };

  const handleCopy = async () => {
    // Image clipboard needs a secure context (https or localhost) and ClipboardItem support.
    if (!window.isSecureContext) return copyFailed(`Page is not secure (${location.origin}) — use https or localhost.`);
    if (!navigator.clipboard?.write) return copyFailed('This browser has no clipboard.write().');
    if (typeof ClipboardItem === 'undefined') return copyFailed('This browser has no ClipboardItem (image copy unsupported).');
    try {
      // Hand the clipboard a promise *synchronously*, so the write stays inside the click's
      // user-activation window (Safari rejects writes that start after an await).
      const blobPromise = toBlob().then((blob) => {
        if (!blob) throw new Error('Canvas export failed');
        return blob;
      });
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blobPromise })]);
      } catch {
        // Older browsers don't accept a promise inside ClipboardItem — retry with the blob itself.
        const blob = await blobPromise;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      }
      flashCopy('copied');
    } catch (err) {
      copyFailed(err instanceof Error ? `${err.name}: ${err.message}` : String(err));
    }
  };

  const handleShare = async () => {
    try {
      const blob = await toBlob();
      if (!blob) return;
      const file = new File([blob], fileName, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `Happy Birthday ${name}`, text: `Happy Birthday ${name}! 🎂` });
      } else {
        handleDownload();
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
      <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl p-5 relative flex flex-col items-center gap-4 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <p className="text-xs font-bold text-white/50 uppercase tracking-widest self-start">Share Card</p>

        {/* Live preview */}
        <div
          className={`relative w-full ${aspect === 'story' ? 'aspect-[9/16] max-w-[220px]' : 'aspect-[4/5] max-w-[280px]'} shrink-0 rounded-xl overflow-hidden shadow-2xl bg-black/40`}
        >
          {imgLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        {/* Theme */}
        <div className="w-full space-y-2">
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Theme</span>
          <div className="flex flex-wrap gap-2">
            {BIRTHDAY_THEMES.map((t) => {
              const Icon = THEME_ICONS[t.id];
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500'
                      : 'bg-white/5 text-white/70 border-white/10 hover:border-white/25'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Size */}
        <div className="w-full space-y-2">
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Size</span>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 gap-1">
            {SIZES.map((s) => (
              <button
                key={s.id}
                onClick={() => setAspect(s.id)}
                className={`flex-1 py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                  aspect === s.id ? 'bg-amber-500 text-black shadow-md' : 'text-white/70 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Wish */}
        <div className="w-full space-y-2">
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Wish (optional)</span>
          <input
            type="text"
            value={wish}
            maxLength={60}
            onChange={(e) => setWish(e.target.value)}
            placeholder="e.g. Have a great one, sensei!"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Actions */}
        <div className="w-full space-y-2 pt-1">
          <button
            onClick={handleDownload}
            disabled={imgLoading}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}
          >
            <Download className="w-4 h-4" />
            Download PNG
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              disabled={imgLoading}
              className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
            >
              {copyState === 'copied' ? (
                <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copied!</span></>
              ) : copyState === 'failed' ? (
                <><X className="w-3.5 h-3.5 text-red-400" /><span className="text-red-400">Copy failed</span></>
              ) : (
                <><Copy className="w-3.5 h-3.5" /><span>Copy Image</span></>
              )}
            </button>
            <button
              onClick={handleShare}
              disabled={imgLoading}
              className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
          {copyState === 'failed' && copyError && (
            <p className="text-[10px] text-red-400/80 leading-snug break-words">Couldn't copy: {copyError}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BirthdayShareModal;
