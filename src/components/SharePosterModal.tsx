import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Copy, Share2, Upload, Sparkles, Check } from 'lucide-react';

interface SharePosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'birthday' | 'event' | 'news';
  initialData?: {
    name?: string;
    title?: string;
    image?: string;
    subtitle?: string;
    date?: string;
    author?: string;
  };
}

type TemplateTheme = {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  background: string[];
  textColor: string;
  accent: string;
};

const TEMPLATES: TemplateTheme[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    primary: '#66FCF1', // Neon Teal
    secondary: '#f15bb5', // Hot Pink
    background: ['#0A0015', '#1F003A', '#0D0221'],
    textColor: '#FFFFFF',
    accent: '#fee440', // Yellow
  },
  {
    id: 'sakura',
    name: 'Sakura Pink',
    primary: '#f15bb5',
    secondary: '#9b5de5',
    background: ['#2A0815', '#4A122E', '#1A040B'],
    textColor: '#FFFFFF',
    accent: '#66FCF1',
  },
  {
    id: 'electric',
    name: 'Electric Cyan',
    primary: '#66FCF1',
    secondary: '#45A29E',
    background: ['#040D1A', '#0A1E36', '#02060D'],
    textColor: '#FFFFFF',
    accent: '#9b5de5',
  },
  {
    id: 'fire',
    name: 'Crimson Fire',
    primary: '#FF4500', // OrangeRed
    secondary: '#fee440', // Yellow
    background: ['#1A0000', '#3D0000', '#0D0000'],
    textColor: '#FFFFFF',
    accent: '#FFD700',
  },
  {
    id: 'gold',
    name: 'Obsidian Gold',
    primary: '#D4AF37', // Gold
    secondary: '#AA7C11',
    background: ['#0D0D0D', '#1A1A1A', '#050505'],
    textColor: '#FFFFFF',
    accent: '#D4AF37',
  }
];

const SharePosterModal: React.FC<SharePosterModalProps> = ({
  isOpen,
  onClose,
  initialType = 'birthday',
  initialData = {}
}) => {
  const [posterType, setPosterType] = useState<'birthday' | 'event' | 'news'>(initialType);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateTheme>(TEMPLATES[0]);
  const [layoutStyle, setLayoutStyle] = useState<'neon' | 'greeting' | 'minimal'>('neon');
  
  // Editable fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [subtext, setSubtext] = useState(''); // E.g., date, author
  const [age, setAge] = useState(''); // Editable age
  const [articleLink, setArticleLink] = useState(''); // New field for platform/article link
  
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync initial props
  useEffect(() => {
    if (isOpen) {
      setPosterType(initialType);
      
      const defaultImg = initialData.image || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600';
      setImageUrl(defaultImg);
      setAge('');

      if (initialType === 'birthday') {
        setTitle(initialData.name || 'Naruto Uzumaki');
        setSubtitle(initialData.subtitle || 'Celebrate with us!');
        setSubtext('Today\'s Celebration');
        setArticleLink('');
      } else if (initialType === 'event') {
        setTitle(initialData.title || 'Spring Anime Festival');
        setSubtitle(initialData.subtitle || 'Special Live Event');
        setSubtext(initialData.date || 'Today\'s Event');
        setArticleLink('');
      } else {
        // news
        setTitle(initialData.title || 'Demon Slayer Movie Announced!');
        setSubtitle('');
        setSubtext(`By ${initialData.author || 'Moctale'} • ${initialData.date || 'Today'}`);
        setArticleLink('');
      }
    }
  }, [isOpen, initialType, initialData]);

  // Load image when imageUrl changes
  useEffect(() => {
    if (!imageUrl) {
      setLoadedImage(null);
      return;
    }
    setImageLoading(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      setLoadedImage(img);
      setImageLoading(false);
    };
    img.onerror = () => {
      console.warn("Failed to load image asynchronously, trying fallback");
      setLoadedImage(null);
      setImageLoading(false);
    };
  }, [imageUrl]);

  // Draw Canvas logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    if (layoutStyle === 'greeting') {
      // ----------------------------------------------------
      // GREETING CARD LAYOUT (White/Playful, balloons)
      // ----------------------------------------------------
      
      // Draw plain white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle pastel radial gradient inside
      const rad = ctx.createRadialGradient(width/2, height/2, 100, width/2, height/2, width*0.7);
      rad.addColorStop(0, '#FFFFFF');
      rad.addColorStop(1, '#F3F4F6');
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, width, height);

      // Draw character / event image in a framed container
      if (loadedImage) {
        ctx.save();
        const frameX = 140;
        const frameY = 280;
        const frameW = 800;
        const frameH = 580;

        // Draw shadow for image frame
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 10;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(frameX - 10, frameY - 10, frameW + 20, frameH + 20, 16);
        ctx.fill();
        ctx.shadowColor = 'transparent'; // reset

        // Fill background of frame with dark neutral to look clean if image is transparent/different aspect ratio
        ctx.fillStyle = '#1F2937';
        ctx.beginPath();
        ctx.roundRect(frameX, frameY, frameW, frameH, 8);
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(frameX, frameY, frameW, frameH, 8);
        ctx.clip();

        // contain fit inside frame (Math.min ensures whole image fits)
        const imgW = loadedImage.width;
        const imgH = loadedImage.height;
        const scale = Math.min(frameW / imgW, frameH / imgH);
        const drawW = imgW * scale;
        const drawH = imgH * scale;
        const drawX = frameX + (frameW - drawW) / 2;
        const drawY = frameY + (frameH - drawH) / 2;
        ctx.drawImage(loadedImage, drawX, drawY, drawW, drawH);
        ctx.restore();
      }

      // Draw Balloons function
      const drawBalloon = (x: number, y: number, color: string) => {
        ctx.save();
        // Draw string
        ctx.strokeStyle = '#9CA3AF';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x, y + 45);
        ctx.bezierCurveTo(x - 20, y + 100, x + 20, y + 140, x, y + 180);
        ctx.stroke();

        // Balloon body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, 40, 50, 0, 0, Math.PI * 2);
        ctx.fill();

        // Balloon knot triangle
        ctx.beginPath();
        ctx.moveTo(x, y + 48);
        ctx.lineTo(x - 8, y + 58);
        ctx.lineTo(x + 8, y + 58);
        ctx.closePath();
        ctx.fill();

        // Glossy highlight shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(x - 12, y - 15, 10, 15, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      // Draw 4 balloons floating on the sides
      drawBalloon(100, 160, '#3B82F6'); // Blue
      drawBalloon(200, 120, '#EF4444'); // Red
      drawBalloon(880, 140, '#F59E0B'); // Orange/Yellow
      drawBalloon(980, 190, '#10B981'); // Green

      // Draw Title text
      if (posterType === 'birthday') {
        ctx.fillStyle = '#EF4444'; // Red
        ctx.font = '900 80px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Happy Birthday', width / 2, 140);

        ctx.fillStyle = '#3B82F6'; // Blue name
        ctx.font = '900 85px "Outfit", sans-serif';
        ctx.fillText(title, width / 2, 230);
      } else {
        ctx.fillStyle = '#10B981';
        ctx.font = '900 70px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(title, width / 2, 140);

        ctx.fillStyle = '#6B7280';
        ctx.font = '700 36px "Inter", sans-serif';
        ctx.fillText(subtitle || subtext, width / 2, 220);
      }

      // Draw wishes / description subtext at bottom
      if (posterType === 'birthday') {
        ctx.fillStyle = '#4B5563';
        ctx.font = 'bold 36px "Inter", sans-serif';
        ctx.fillText(subtitle, width / 2, 920);
        
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '800 28px "Outfit", sans-serif';
        ctx.fillText('CELEBRATING TODAY', width / 2, 980);
      } else {
        ctx.fillStyle = '#4B5563';
        ctx.font = 'medium 30px "Inter", sans-serif';
        ctx.fillText(subtext, width / 2, 920);
      }

    } else if (layoutStyle === 'minimal') {
      // ----------------------------------------------------
      // MINIMAL / MANGA FRAME LAYOUT (Polaroid/Card style)
      // ----------------------------------------------------
      
      // Draw background (outer frame is white, inner is full image)
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, width, height);

      // Draw main image inside the frame using contain fit
      if (loadedImage) {
        ctx.save();
        const frameX = 50;
        const frameY = 140;
        const frameW = width - 100;
        const frameH = height - 300;

        ctx.beginPath();
        ctx.rect(frameX, frameY, frameW, frameH);
        ctx.clip();

        const imgW = loadedImage.width;
        const imgH = loadedImage.height;
        const scale = Math.min(frameW / imgW, frameH / imgH);
        const drawW = imgW * scale;
        const drawH = imgH * scale;
        const drawX = frameX + (frameW - drawW) / 2;
        const drawY = frameY + (frameH - drawH) / 2;
        ctx.drawImage(loadedImage, drawX, drawY, drawW, drawH);
        ctx.restore();
      }

      // Draw solid white margin frame borders
      ctx.fillStyle = '#FFFFFF';
      // Top border
      ctx.fillRect(0, 0, width, 140);
      // Bottom border
      ctx.fillRect(0, height - 160, width, 160);
      // Side borders
      ctx.fillRect(0, 0, 50, height);
      ctx.fillRect(width - 50, 0, 50, height);

      // Draw divider thin lines
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      ctx.strokeRect(47, 137, width - 94, height - 294);

      // Top text overlapping the white header
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      
      if (posterType === 'birthday') {
        ctx.font = '900 75px "Outfit", sans-serif';
        ctx.fillText('HAPPY BIRTHDAY', width / 2, 100);

        // Bottom text overlapping the bottom white footer
        ctx.fillStyle = '#000000';
        ctx.font = '900 80px "Outfit", sans-serif';
        ctx.fillText(title.toUpperCase(), width / 2, 985);
      } else {
        ctx.font = '900 60px "Outfit", sans-serif';
        ctx.fillText(title.toUpperCase(), width / 2, 95);

        ctx.fillStyle = '#000000';
        ctx.font = '800 50px "Outfit", sans-serif';
        ctx.fillText(subtitle || subtext, width / 2, 985);
      }

      // Large Age Badge (overlapping bottom-right corner)
      if (posterType === 'birthday' && age) {
        const badgeX = 850;
        const badgeY = 800;
        const badgeR = 90;

        // Draw shadow for badge
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Draw black text inside
        ctx.fillStyle = '#000000';
        ctx.font = '900 95px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(age, badgeX, badgeY);
        ctx.textBaseline = 'alphabetic'; // reset
      }

    } else {
      // ----------------------------------------------------
      // NEON GLOW LAYOUT (Original cyberpunk style)
      // ----------------------------------------------------
      
      // Draw background cover image
      if (loadedImage) {
        ctx.save();
        const imgW = loadedImage.width;
        const imgH = loadedImage.height;
        
        if (posterType === 'news') {
          // Draw blurred background cover
          const bgScale = Math.max(width / imgW, height / imgH);
          ctx.filter = 'blur(40px) brightness(0.5)';
          ctx.drawImage(loadedImage, (width - imgW * bgScale) / 2, (height - imgH * bgScale) / 2, imgW * bgScale, imgH * bgScale);
          ctx.filter = 'none';

          // Draw full uncropped image centered in the top space
          const availableHeight = 680;
          const contentScale = Math.min((width - 80) / imgW, availableHeight / imgH); // 40px padding on sides
          const drawW = imgW * contentScale;
          const drawH = imgH * contentScale;
          const drawX = (width - drawW) / 2;
          const drawY = (availableHeight - drawH) / 2 + 40; 
          
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur = 30;
          ctx.drawImage(loadedImage, drawX, drawY, drawW, drawH);
          ctx.shadowBlur = 0;
        } else {
          // Standard cover fit for birthday/event
          const scale = Math.max(width / imgW, height / imgH);
          const drawW = imgW * scale;
          const drawH = imgH * scale;
          const drawX = (width - drawW) / 2;
          const drawY = (imgH * scale > height) ? 0 : (height - drawH) / 2;
          ctx.drawImage(loadedImage, drawX, drawY, drawW, drawH);
        }
        ctx.restore();
      }

      // Apply dark overlay gradient for readability
      const overlayGrad = ctx.createLinearGradient(0, 0, 0, height);
      overlayGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
      overlayGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.55)');
      overlayGrad.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
      ctx.fillStyle = overlayGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient glow orbs
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = selectedTemplate.primary + '1A'; // 10% opacity
      ctx.beginPath();
      ctx.arc(width * 0.2, height * 0.2, 350, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = selectedTemplate.secondary + '1A';
      ctx.beginPath();
      ctx.arc(width * 0.8, height * 0.8, 350, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';

      // Outer Neon Border
      ctx.strokeStyle = selectedTemplate.primary;
      ctx.lineWidth = 12;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      ctx.strokeStyle = selectedTemplate.secondary + '66'; // 40% opacity
      ctx.lineWidth = 4;
      ctx.strokeRect(32, 32, width - 64, height - 64);

      // Draw content based on type
      if (posterType === 'birthday') {
        // 1. Draw Birthday Badge
        ctx.fillStyle = selectedTemplate.accent;
        ctx.font = '900 36px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎂 TODAY\'S CELEBRATION 🎂', width / 2, 280);

        // 2. Draw Happy Birthday text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 64px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('HAPPY BIRTHDAY', width / 2, 470);

        // 3. Draw Name (large & neon)
        ctx.fillStyle = selectedTemplate.primary;
        ctx.font = '900 100px "Outfit", sans-serif';
        ctx.shadowColor = selectedTemplate.primary;
        ctx.shadowBlur = 25;
        ctx.fillText(title.toUpperCase(), width / 2, 600);
        ctx.shadowBlur = 0; // reset

        // 4. Subtitle/Wish
        ctx.fillStyle = '#C5C6C7';
        ctx.font = 'italic 38px "Inter", sans-serif';
        ctx.fillText(subtitle, width / 2, 700);

        // Large Age Badge in neon if present
        if (age) {
          ctx.fillStyle = selectedTemplate.accent;
          ctx.font = '900 120px "Outfit", sans-serif';
          ctx.shadowColor = selectedTemplate.accent;
          ctx.shadowBlur = 20;
          ctx.fillText(age, width / 2, 850);
          ctx.shadowBlur = 0;
        }

      } else if (posterType === 'event') {
        // 1. Draw Event Badge
        ctx.fillStyle = selectedTemplate.accent;
        ctx.font = '900 36px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('📅 TODAY\'S SPECIAL EVENT 📅', width / 2, 280);

        // 2. Draw Title (large)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 75px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(title, width / 2, 470);

        // 3. Subtitle
        ctx.fillStyle = selectedTemplate.primary;
        ctx.font = 'bold 44px "Outfit", sans-serif';
        ctx.fillText(subtitle, width / 2, 570);

        // 4. Date/Subtext
        ctx.fillStyle = selectedTemplate.accent;
        ctx.font = '800 38px "Inter", sans-serif';
        ctx.fillText(subtext, width / 2, 670);

      } else {
        // News Poster: full-bleed news layout with headline

        // Headline text wrap logic
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 68px "Outfit", sans-serif';
        ctx.textAlign = 'left';
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 10;
        
        const words = title.split(' ');
        let line = '';
        let currentY = 700;
        const lineHeights = 80;
        const maxWidth = 900;
        const startX = 80;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, startX, currentY);
            line = words[n] + ' ';
            currentY += lineHeights;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, startX, currentY);
        ctx.shadowBlur = 0;

        // Source & Date Info
        ctx.fillStyle = selectedTemplate.primary;
        ctx.font = 'bold 30px "Inter", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(subtext, startX, currentY + 80);
      }
    }

  }, [posterType, selectedTemplate, layoutStyle, title, subtitle, subtext, age, loadedImage]);

  if (!isOpen) return null;

  // Handle local image upload
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
      }
      setImageLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // Download action
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${posterType}_poster_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Copy action
  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }, 'image/png');
    } catch (err) {
      console.error("Failed to copy image:", err);
    }
  };

  // Web Share action
  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'poster.png', { type: 'image/png' });
        
        const shareText = articleLink 
          ? `Check out this awesome anime poster! Read more here: ${articleLink}`
          : 'Check out this awesome anime poster!';

        const shareData: any = {
          files: [file],
          title: 'Anime AI Poster',
          text: shareText
        };


        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share(shareData);
        } else {
          // Fallback to copy link or download
          handleCopy();
        }
      }, 'image/png');
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999] overflow-y-auto">
      <div className="w-full max-w-4xl bg-anime-bg border border-anime-border rounded-2xl p-6 sm:p-8 relative flex flex-col md:flex-row gap-8 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all cursor-pointer z-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Live Preview Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <h3 className="text-sm font-bold text-anime-secondary uppercase tracking-wider self-start flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-anime-primary" />
            <span>Poster Live Preview</span>
          </h3>

          <div 
            className={`relative w-full aspect-square max-w-[380px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/40 flex items-center justify-center ${articleLink ? 'cursor-pointer' : ''}`}
            onClick={() => { if (articleLink) window.open(articleLink, '_blank', 'noopener,noreferrer'); }}
          >
            {imageLoading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 pointer-events-none">
                <div className="w-8 h-8 border-2 border-anime-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>

          {/* Quick theme template picker (only visible in neon layout) */}
          {layoutStyle === 'neon' && (
            <div className="w-full max-w-[380px] space-y-2">
              <span className="text-[10px] text-anime-text/50 font-bold uppercase tracking-wider block">Templates Theme</span>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                      selectedTemplate.id === tmpl.id
                        ? 'bg-anime-primary/20 text-anime-primary border-anime-primary'
                        : 'bg-white/5 text-anime-text/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tmpl.primary }} />
                    <span>{tmpl.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Editors & Inputs */}
        <div className="w-full md:w-[380px] flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold font-fraunces text-white">Poster Studio</h2>
              <p className="text-xs text-anime-text/70 mt-1">Design and download custom anime announcements.</p>
            </div>

            {/* Poster Type Tab selector */}
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
              {(['birthday', 'event', 'news'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setPosterType(type);
                    if (type === 'birthday') {
                      setTitle(initialData.name || 'Naruto Uzumaki');
                      setSubtitle('Celebrate with us!');
                      setSubtext('Today\'s Celebration');
                    } else if (type === 'event') {
                      setTitle(initialData.title || 'Spring Anime Festival');
                      setSubtitle('Special Live Event');
                      setSubtext('Today\'s Event');
                    } else {
                      setTitle(initialData.title || 'Demon Slayer Movie Announced!');
                      setSubtitle('');
                      setSubtext('HOT NEWS');
                    }
                  }}
                  className={`flex-1 py-2 text-center text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                    posterType === type
                      ? 'bg-anime-primary text-anime-bg shadow-md'
                      : 'text-anime-text hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Layout Style Tab Selector */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-anime-secondary font-bold uppercase tracking-wider block">Card Style Layout</span>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 gap-1">
                {([
                  { id: 'neon', name: 'Neon Glow' },
                  { id: 'greeting', name: 'Greeting' },
                  { id: 'minimal', name: 'Minimal' }
                ] as const).map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setLayoutStyle(style.id)}
                    className={`flex-1 py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                      layoutStyle === style.id
                        ? 'bg-anime-primary text-anime-bg shadow-md'
                        : 'text-anime-text hover:text-white'
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Dynamic Text field based on layout */}
              <div>
                <label className="text-[10px] text-anime-secondary font-bold uppercase tracking-wider block mb-1.5">
                  {posterType === 'birthday' ? 'Character Name' : posterType === 'event' ? 'Event Title' : 'Headline Text'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={posterType === 'birthday' ? 'Character name...' : posterType === 'event' ? 'Event title...' : 'Headline...'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-anime-primary"
                />
              </div>

              {/* Age Field (Only visible for Birthday Type) */}
              {posterType === 'birthday' && (
                <div>
                  <label className="text-[10px] text-anime-secondary font-bold uppercase tracking-wider block mb-1.5">
                    Age / Year Number
                  </label>
                  <input
                    type="text"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="E.g., 36, 18, 25 (optional)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-anime-primary"
                  />
                </div>
              )}

              {/* Subtitle/Description (not for news) */}
              {posterType !== 'news' && (
                <div>
                  <label className="text-[10px] text-anime-secondary font-bold uppercase tracking-wider block mb-1.5">
                    {posterType === 'birthday' ? 'Wishes / Subtitle' : 'Sub-Header'}
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Enter wishes or details..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-anime-primary"
                  />
                </div>
              )}

              {/* Tag/Date/Footer Subtext */}
              <div>
                <label className="text-[10px] text-anime-secondary font-bold uppercase tracking-wider block mb-1.5">
                  {posterType === 'birthday' ? 'Category Tag' : posterType === 'event' ? 'Event Date' : 'Author / Date'}
                </label>
                <input
                  type="text"
                  value={subtext}
                  onChange={(e) => setSubtext(e.target.value)}
                  placeholder="Enter details..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-anime-primary"
                />
              </div>

              {/* Platform / Article Link */}
              <div>
                <label className="text-[10px] text-anime-secondary font-bold uppercase tracking-wider block mb-1.5">
                  Platform / Article Link
                </label>
                <input
                  type="url"
                  value={articleLink}
                  onChange={(e) => setArticleLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-anime-primary"
                />
              </div>

              {/* Image Editor */}
              <div className="space-y-2">
                <label className="text-[10px] text-anime-secondary font-bold uppercase tracking-wider block">
                  Poster Image
                </label>
                
                {/* Image URL Input */}
                <input
                  type="text"
                  value={imageUrl.startsWith('data:') ? 'Local file uploaded' : imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste Image URL..."
                  disabled={imageUrl.startsWith('data:')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-anime-primary disabled:opacity-50"
                />

                {/* File Upload triggers */}
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-anime-primary" />
                    <span>Upload Local File</span>
                  </button>
                  {imageUrl.startsWith('data:') && (
                    <button
                      onClick={() => setImageUrl('https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600')}
                      className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-xs font-semibold text-red-400 transition-all cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLocalImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="space-y-3 pt-6 border-t border-white/10">
            <button
              onClick={handleDownload}
              className="w-full py-3.5 bg-gradient-to-r from-anime-primary to-anime-secondary hover:from-anime-purple hover:to-anime-pink text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download High-Res PNG</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400 animate-bounce" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-anime-primary" />
                    <span>Copy Image</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-anime-primary" />
                <span>Share Poster</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SharePosterModal;
