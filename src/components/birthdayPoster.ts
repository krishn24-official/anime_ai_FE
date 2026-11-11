// Canvas renderer for the themed birthday share cards.
//
// The character art comes from the DB as a single fixed image, so each theme is
// built from: a background, a colour grade over the image, procedural
// decorations (petals, moon, stripes, confetti…) and shared typography
// (script "Happy Birthday", date ribbon, name pill).

export type BirthdayThemeId = 'classic' | 'dark' | 'sakura' | 'hero' | 'night' | 'celebration';
export type PosterAspect = 'feed' | 'story';

export const POSTER_SIZES: Record<PosterAspect, { width: number; height: number }> = {
  feed: { width: 1080, height: 1350 }, // 4:5 — Instagram / feed post
  story: { width: 1080, height: 1920 }, // 9:16 — stories / status
};

export const BIRTHDAY_THEMES: { id: BirthdayThemeId; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'dark', label: 'Dark' },
  { id: 'sakura', label: 'Sakura' },
  { id: 'hero', label: 'Hero' },
  { id: 'night', label: 'Moonlight' },
  { id: 'celebration', label: 'Celebration' },
];

/** Fonts the renderer uses; load these before drawing. */
export const BIRTHDAY_FONTS = [
  '700 120px "Dancing Script"',
  '120px "Anton"',
  '600 36px "Inter"',
  '700 68px "Inter"',
];

const SCRIPT = '"Dancing Script", "Brush Script MT", cursive';
const IMPACT = '"Anton", "Impact", sans-serif';
const SANS = '"Inter", system-ui, sans-serif';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

interface Palette {
  bgTop: string;
  bgBottom: string;
  border: string;
  ribbonBg: string;
  ribbonText: string;
  happy: string;
  birthday: string;
  nameText: string;
  pillStroke: string;
  pillFill: string;
  ornament: string;
  wish: string;
}

const PALETTES: Record<Exclude<BirthdayThemeId, 'classic'>, Palette> = {
  dark: {
    bgTop: '#141414', bgBottom: '#0a0a0a', border: 'rgba(255,255,255,0.14)',
    ribbonBg: '#2a2a2a', ribbonText: '#ffffff',
    happy: '#ffffff', birthday: '#ffffff',
    nameText: '#e8e8e8', pillStroke: 'rgba(255,255,255,0.35)', pillFill: 'rgba(0,0,0,0.45)',
    ornament: 'rgba(255,255,255,0.45)', wish: 'rgba(255,255,255,0.65)',
  },
  sakura: {
    bgTop: '#2b0f1d', bgBottom: '#1c0912', border: 'rgba(255,150,190,0.45)',
    ribbonBg: '#e0789f', ribbonText: '#ffffff',
    happy: '#ffe3ee', birthday: '#ff8fb8',
    nameText: '#ffe3ee', pillStroke: 'rgba(255,150,190,0.6)', pillFill: 'rgba(40,10,25,0.55)',
    ornament: '#ff9fc2', wish: 'rgba(255,220,235,0.75)',
  },
  hero: {
    bgTop: '#121212', bgBottom: '#090909', border: '#ffd21f',
    ribbonBg: '#ffd21f', ribbonText: '#111111',
    happy: '#ffffff', birthday: '#ffd21f',
    nameText: '#ffffff', pillStroke: '#ffd21f', pillFill: 'rgba(0,0,0,0.7)',
    ornament: '#ffd21f', wish: 'rgba(255,255,255,0.7)',
  },
  night: {
    bgTop: '#1a1038', bgBottom: '#0d0820', border: 'rgba(170,140,255,0.45)',
    ribbonBg: '#6e4fd8', ribbonText: '#ffffff',
    happy: '#f3eeff', birthday: '#c9a7ff',
    nameText: '#efe8ff', pillStroke: 'rgba(190,160,255,0.55)', pillFill: 'rgba(15,8,35,0.6)',
    ornament: '#b89bff', wish: 'rgba(230,220,255,0.7)',
  },
  celebration: {
    bgTop: '#fbf1e1', bgBottom: '#f6e3c7', border: 'rgba(200,110,60,0.35)',
    ribbonBg: '#c8402c', ribbonText: '#ffffff',
    happy: '#3b2418', birthday: '#cf3f2b',
    nameText: '#ffffff', pillStroke: '#cf3f2b', pillFill: '#cf3f2b',
    ornament: '#e0913a', wish: 'rgba(59,36,24,0.7)',
  },
};

export interface BirthdayPosterOptions {
  theme: BirthdayThemeId;
  aspect: PosterAspect;
  name: string;
  wish?: string;
  date: Date;
  image: HTMLImageElement | null;
  /** Vertical focus of the crop, 0 = top, 1 = bottom. Characters' faces tend to be high. */
  focusY?: number;
}

// ── Small helpers ──────────────────────────────────────────────

/** Deterministic PRNG so decorations don't jump around between redraws. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Letter-spaced text, centred on x. (ctx.letterSpacing isn't available everywhere.) */
function spacedWidth(ctx: CanvasRenderingContext2D, text: string, spacing: number) {
  let w = 0;
  for (const ch of text) w += ctx.measureText(ch).width;
  return w + spacing * Math.max(0, [...text].length - 1);
}

function drawSpaced(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, spacing: number) {
  const total = spacedWidth(ctx, text, spacing);
  let x = cx - total / 2;
  const prevAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  for (const ch of text) {
    ctx.fillText(ch, x, y);
    x += ctx.measureText(ch).width + spacing;
  }
  ctx.textAlign = prevAlign;
}

/** Shrink font size until text fits maxWidth. Returns the chosen size. */
function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  build: (size: number) => string,
  start: number,
  min: number,
  maxWidth: number,
  spacing = 0,
) {
  let size = start;
  ctx.font = build(size);
  while (size > min && spacedWidth(ctx, text, spacing) > maxWidth) {
    size -= 2;
    ctx.font = build(size);
  }
  return size;
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  focusY: number,
) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const scale = Math.max(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) * focusY, dw, dh);
  ctx.restore();
}

function fourPointStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

function petal(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rot: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(size * 0.35, -size * 0.55, size * 0.95, -size * 0.45, size, -size * 0.08);
  ctx.lineTo(size * 0.86, 0);
  ctx.lineTo(size, size * 0.08);
  ctx.bezierCurveTo(size * 0.95, size * 0.45, size * 0.35, size * 0.55, 0, 0);
  ctx.fill();
  ctx.restore();
}

function blossom(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rot: number) {
  for (let i = 0; i < 5; i++) {
    petal(ctx, x, y, size, rot + (i * Math.PI * 2) / 5, i % 2 ? '#ffc4da' : '#ffb0cc');
  }
  ctx.fillStyle = '#d94f80';
  ctx.beginPath();
  ctx.arc(x, y, size * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffe28a';
  for (let i = 0; i < 6; i++) {
    const a = rot + (i * Math.PI * 2) / 6;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * size * 0.28, y + Math.sin(a) * size * 0.28, size * 0.045, 0, Math.PI * 2);
    ctx.fill();
  }
}

function giftBox(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, body: string, ribbon: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = 'rgba(80,40,10,0.25)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = body;
  ctx.fillRect(-s / 2, -s * 0.55, s, s * 0.75);
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = body;
  ctx.fillRect(-s * 0.58, -s * 0.72, s * 1.16, s * 0.2);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(-s / 2, -s * 0.52, s, s * 0.06);
  ctx.fillStyle = ribbon;
  ctx.fillRect(-s * 0.08, -s * 0.72, s * 0.16, s * 0.95);
  ctx.lineWidth = s * 0.07;
  ctx.strokeStyle = ribbon;
  ctx.beginPath();
  ctx.ellipse(-s * 0.18, -s * 0.84, s * 0.18, s * 0.1, -0.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(s * 0.18, -s * 0.84, s * 0.18, s * 0.1, 0.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// ── Main renderer ──────────────────────────────────────────────

export function drawBirthdayPoster(canvas: HTMLCanvasElement, opts: BirthdayPosterOptions) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { width: W, height: H } = POSTER_SIZES[opts.aspect];
  canvas.width = W;
  canvas.height = H;

  if (opts.theme === 'classic') {
    drawClassicPoster(ctx, opts, W, H);
    return;
  }

  const p = PALETTES[opts.theme];
  const theme = opts.theme;
  const isStory = opts.aspect === 'story';
  const rand = seeded(hashString(`${theme}:${opts.name}`));
  const focusY = opts.focusY ?? 0.2;
  const wish = (opts.wish || '').trim();
  const name = (opts.name || 'Character').trim().toUpperCase();

  const inset = 24;
  const radius = 40;

  // Text block, anchored to the bottom
  const lift = wish ? (isStory ? 60 : 56) : 0;
  const bottomBase = isStory ? H - 200 : H - 120;
  const pillY = bottomBase - lift;
  const birthdayY = pillY - (theme === 'hero' ? 104 : 112);
  const happyY = birthdayY - (theme === 'hero' ? 132 : 128);
  const imageBottom = Math.min(H - inset, happyY + (isStory ? 260 : 200));

  // 1. Background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, p.bgTop);
  bg.addColorStop(1, p.bgBottom);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Everything inside the card border is clipped to the rounded card
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(inset, inset, W - inset * 2, H - inset * 2, radius);
  ctx.clip();

  if (theme === 'celebration') {
    // Framed image must stop above the (dark) greeting text
    drawCelebrationArt(ctx, opts, W, H, happyY - 110, focusY, rand);
  } else {
    drawFullBleedArt(ctx, opts, W, imageBottom, focusY, p, rand);
  }

  ctx.restore();

  // 2. Card border
  ctx.strokeStyle = p.border;
  ctx.lineWidth = theme === 'hero' ? 5 : 3;
  ctx.beginPath();
  ctx.roundRect(inset, inset, W - inset * 2, H - inset * 2, radius);
  ctx.stroke();

  // 3. Date ribbon (top-right, hanging from the border)
  drawRibbon(ctx, opts.date, W - inset - 56 - 128, inset, 128, 176, p);

  // 4. "Happy Birthday"
  drawGreeting(ctx, theme, W, happyY, birthdayY, p);

  // 5. Name pill
  drawNamePill(ctx, theme, name, W / 2, pillY, W - 260, p);

  // 6. Optional wish line
  if (wish) {
    ctx.fillStyle = p.wish;
    fitFont(ctx, wish, (s) => `italic 500 ${s}px ${SANS}`, 34, 22, W - 200);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(wish, W / 2, pillY + 92);
    ctx.textBaseline = 'alphabetic';
  }
}

// ── Classic (the original share card look) ─────────────────────

function drawClassicPoster(ctx: CanvasRenderingContext2D, opts: BirthdayPosterOptions, W: number, H: number) {
  const pad = 72;
  const name = (opts.name || 'Character').trim();
  const wish = (opts.wish || '').trim();

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);
  if (opts.image) drawCover(ctx, opts.image, 0, 0, W, H, opts.focusY ?? 0.2);

  // Bottom gradient, same stops as the home-page card
  const g = ctx.createLinearGradient(0, H, 0, 0);
  g.addColorStop(0, 'rgba(0,0,0,0.97)');
  g.addColorStop(0.45, 'rgba(0,0,0,0.60)');
  g.addColorStop(0.75, 'rgba(0,0,0,0.10)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Title, word-wrapped, anchored to the bottom
  const title = `Happy Birthday ${name}`;
  ctx.font = `700 84px ${SANS}`;
  const lines: string[] = [];
  let line = '';
  for (const word of title.split(' ')) {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > W - pad * 2) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  const lineH = 100;
  let y = H - pad;
  if (wish) {
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    fitFont(ctx, wish, (s) => `500 ${s}px ${SANS}`, 48, 28, W - pad * 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(wish, pad, y);
    y -= 84;
  }
  const titleTop = y - (lines.length - 1) * lineH;
  ctx.font = `700 84px ${SANS}`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  lines.forEach((l, i) => ctx.fillText(l, pad, titleTop + i * lineH));

  // Amber date badge above the title
  const badge = `${opts.date.getDate()} ${MONTHS[opts.date.getMonth()]}`;
  ctx.font = `700 48px ${SANS}`;
  const bw = ctx.measureText(badge).width + 64;
  const bh = 96;
  const by = titleTop - 84 - bh - 24;
  ctx.fillStyle = 'rgba(245,158,11,0.88)';
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(pad, by, bw, bh, 24);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.fillText(badge, pad + 32, by + bh / 2 + 2);
  ctx.textBaseline = 'alphabetic';
}

// ── Art layers ─────────────────────────────────────────────────

function drawFullBleedArt(
  ctx: CanvasRenderingContext2D,
  opts: BirthdayPosterOptions,
  W: number,
  imageBottom: number,
  focusY: number,
  p: Palette,
  rand: () => number,
) {
  const theme = opts.theme;

  // Layers that sit behind the character (seen through transparent / dark areas)
  if (theme === 'night') {
    // stars across the upper sky
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 70; i++) {
      ctx.globalAlpha = 0.3 + rand() * 0.6;
      ctx.beginPath();
      ctx.arc(rand() * W, rand() * imageBottom * 0.6, rand() * 2.2 + 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Character image
  if (opts.image) {
    ctx.save();
    if (theme === 'dark') ctx.filter = 'saturate(0.55) contrast(1.08)';
    if (theme === 'hero') ctx.filter = 'contrast(1.12) saturate(1.1)';
    drawCover(ctx, opts.image, 0, 0, W, imageBottom, focusY);
    ctx.restore();
  }

  // Colour grade
  if (theme === 'sakura') {
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = 'rgba(255,110,170,0.55)';
    ctx.fillRect(0, 0, W, imageBottom);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(255,120,175,0.10)';
    ctx.fillRect(0, 0, W, imageBottom);
    ctx.restore();
  } else if (theme === 'night') {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(110,80,220,0.55)';
    ctx.fillRect(0, 0, W, imageBottom);
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  // Theme decorations over the image
  if (theme === 'dark') drawBrushStrokes(ctx, W, imageBottom, rand);
  if (theme === 'night') {
    drawMoon(ctx, W * 0.24, imageBottom * 0.2, 118);
    drawSkyline(ctx, W, imageBottom, rand);
  }
  if (theme === 'hero') drawHeroStripes(ctx, W, imageBottom);

  // Fade the image into the background
  const fadeStart = imageBottom * 0.5;
  const fade = ctx.createLinearGradient(0, fadeStart, 0, imageBottom);
  fade.addColorStop(0, hexToRgba(p.bgBottom, 0));
  fade.addColorStop(0.55, hexToRgba(p.bgBottom, 0.7));
  fade.addColorStop(1, hexToRgba(p.bgBottom, 1));
  ctx.fillStyle = fade;
  ctx.fillRect(0, fadeStart, W, imageBottom - fadeStart + 1);

  // Top shade so the ribbon reads on bright images
  const top = ctx.createLinearGradient(0, 0, 0, 220);
  top.addColorStop(0, 'rgba(0,0,0,0.35)');
  top.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, W, 220);

  // Foreground decorations that should overlap the fade / text area
  if (theme === 'sakura') drawSakura(ctx, W, imageBottom, rand);
  if (theme === 'night') {
    ctx.fillStyle = '#d9c8ff';
    for (let i = 0; i < 6; i++) {
      ctx.globalAlpha = 0.5 + rand() * 0.5;
      fourPointStar(ctx, 80 + rand() * (W - 160), imageBottom * (0.55 + rand() * 0.4), 6 + rand() * 8);
    }
    ctx.globalAlpha = 1;
  }
}

function drawCelebrationArt(
  ctx: CanvasRenderingContext2D,
  opts: BirthdayPosterOptions,
  W: number,
  H: number,
  imageBottom: number,
  focusY: number,
  rand: () => number,
) {
  // Soft warm glow
  const glow = ctx.createRadialGradient(W / 2, H * 0.35, 50, W / 2, H * 0.35, W * 0.9);
  glow.addColorStop(0, 'rgba(255,255,255,0.7)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const confettiColors = ['#f2a541', '#e5484d', '#5aa9e6', '#9b5de5', '#3fb68b', '#f7c548'];

  // Confetti behind the frame
  const drawConfetti = (count: number, region: [number, number, number, number]) => {
    const [rx, ry, rw, rh] = region;
    for (let i = 0; i < count; i++) {
      const x = rx + rand() * rw;
      const y = ry + rand() * rh;
      const c = confettiColors[Math.floor(rand() * confettiColors.length)];
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rand() * Math.PI);
      ctx.fillStyle = c;
      ctx.strokeStyle = c;
      const kind = rand();
      if (kind < 0.45) {
        ctx.fillRect(-9, -4, 18, 8);
      } else if (kind < 0.75) {
        ctx.beginPath();
        ctx.arc(0, 0, 5 + rand() * 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.bezierCurveTo(-8, -14, 8, 14, 18, 0);
        ctx.stroke();
      }
      ctx.restore();
    }
  };
  drawConfetti(70, [30, 30, W - 60, H - 60]);

  // Framed character image
  const fx = 96;
  const fy = 96;
  const fw = W - fx * 2;
  const fh = imageBottom - fy;
  const fr = 32;

  ctx.save();
  ctx.shadowColor = 'rgba(90,50,20,0.28)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(fx - 14, fy - 14, fw + 28, fh + 28, fr + 10);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(fx, fy, fw, fh, fr);
  ctx.clip();
  ctx.fillStyle = '#2a1c14';
  ctx.fillRect(fx, fy, fw, fh);
  if (opts.image) drawCover(ctx, opts.image, fx, fy, fw, fh, focusY);
  ctx.restore();

  // A little confetti over the frame edges for depth
  drawConfetti(14, [fx - 40, fy + fh - 80, fw + 80, 140]);
  drawConfetti(10, [fx - 40, fy - 40, fw + 80, 90]);

  // Gifts in the bottom corners
  giftBox(ctx, W - 140, H - 100, 112, '#f2a541', '#cf3f2b');
  giftBox(ctx, 130, H - 92, 84, '#9b5de5', '#f7c548');
}

function drawBrushStrokes(ctx: CanvasRenderingContext2D, W: number, h: number, rand: () => number) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.lineCap = 'round';
  const strokes: [number, number, number, number, number][] = [
    // x1, y1, x2, y2, thickness
    [-40, h * 0.12, W * 0.38, h * 0.02, 70],
    [-60, h * 0.22, W * 0.28, h * 0.14, 40],
    [W * 0.7, h * 0.62, W + 60, h * 0.5, 55],
  ];
  for (const [x1, y1, x2, y2, t] of strokes) {
    for (let i = 0; i < 26; i++) {
      const off = (rand() - 0.5) * t;
      ctx.strokeStyle = `rgba(255,255,255,${0.025 + rand() * 0.05})`;
      ctx.lineWidth = 2 + rand() * 7;
      ctx.beginPath();
      const s = rand() * 0.15;
      const e = 0.85 + rand() * 0.15;
      ctx.moveTo(x1 + (x2 - x1) * s, y1 + (y2 - y1) * s + off);
      ctx.lineTo(x1 + (x2 - x1) * e, y1 + (y2 - y1) * e + off);
      ctx.stroke();
    }
  }
  ctx.restore();

  // Vignette
  const v = ctx.createRadialGradient(W / 2, h * 0.45, h * 0.25, W / 2, h * 0.45, h * 0.85);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, h);
}

function drawMoon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const halo = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 2.6);
  halo.addColorStop(0, 'rgba(200,180,255,0.45)');
  halo.addColorStop(1, 'rgba(200,180,255,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);

  const body = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  body.addColorStop(0, 'rgba(255,255,255,0.95)');
  body.addColorStop(1, 'rgba(215,205,255,0.8)');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // craters
  ctx.fillStyle = 'rgba(150,130,210,0.22)';
  for (const [dx, dy, cr] of [[-0.3, -0.2, 0.18], [0.25, 0.1, 0.12], [-0.05, 0.4, 0.1], [0.35, -0.4, 0.08]]) {
    ctx.beginPath();
    ctx.arc(x + dx * r, y + dy * r, cr * r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSkyline(ctx: CanvasRenderingContext2D, W: number, h: number, rand: () => number) {
  let x = 0;
  const baseY = h;
  while (x < W) {
    const bw = 40 + rand() * 70;
    const bh = 50 + rand() * 120;
    ctx.fillStyle = 'rgba(18,10,42,0.85)';
    ctx.fillRect(x, baseY - bh, bw, bh + 40);
    ctx.fillStyle = 'rgba(255,215,140,0.55)';
    for (let wy = baseY - bh + 12; wy < baseY - 10; wy += 18) {
      for (let wx = x + 8; wx < x + bw - 8; wx += 14) {
        if (rand() < 0.18) ctx.fillRect(wx, wy, 5, 7);
      }
    }
    x += bw + rand() * 6;
  }
}

function drawHeroStripes(ctx: CanvasRenderingContext2D, W: number, h: number) {
  ctx.save();
  ctx.fillStyle = '#ffd21f';
  const band = (x: number, y: number, len: number, thick: number, alpha: number) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(-0.55);
    ctx.fillRect(-len / 2, -thick / 2, len, thick);
    ctx.restore();
  };
  band(W * 0.05, h * 0.58, 520, 46, 0.95);
  band(W * 0.12, h * 0.66, 380, 14, 0.9);
  band(W * 0.96, h * 0.3, 420, 30, 0.9);
  band(W * 0.9, h * 0.36, 260, 10, 0.8);

  // halftone dots in the top-left corner
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 12; col++) {
      const r = Math.max(0, 7 - (row + col) * 0.45);
      if (r <= 0.3) continue;
      ctx.beginPath();
      ctx.arc(60 + col * 26, 60 + row * 26, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawSakura(ctx: CanvasRenderingContext2D, W: number, h: number, rand: () => number) {
  // branch in top-left corner
  ctx.save();
  ctx.strokeStyle = 'rgba(70,30,40,0.85)';
  ctx.lineCap = 'round';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(-20, h * 0.05);
  ctx.quadraticCurveTo(W * 0.18, h * 0.08, W * 0.3, h * 0.02);
  ctx.stroke();
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(W * 0.12, h * 0.065);
  ctx.quadraticCurveTo(W * 0.16, h * 0.14, W * 0.12, h * 0.2);
  ctx.stroke();
  ctx.restore();

  const clusters: [number, number, number][] = [
    [W * 0.06, h * 0.05, 34], [W * 0.18, h * 0.08, 40], [W * 0.29, h * 0.03, 30],
    [W * 0.13, h * 0.17, 32], [W * 0.1, h * 0.21, 24],
    // right-hand cluster near the text area
    [W * 0.9, h * 0.78, 38], [W * 0.82, h * 0.84, 28], [W * 0.95, h * 0.88, 26],
  ];
  for (const [x, y, s] of clusters) blossom(ctx, x, y, s, rand() * Math.PI);

  // falling petals
  for (let i = 0; i < 28; i++) {
    const x = rand() * W;
    const y = rand() * h;
    ctx.globalAlpha = 0.55 + rand() * 0.45;
    petal(ctx, x, y, 10 + rand() * 16, rand() * Math.PI * 2, rand() > 0.5 ? '#ffb7d0' : '#ff9fc2');
  }
  ctx.globalAlpha = 1;
}

// ── Typography ─────────────────────────────────────────────────

function drawRibbon(
  ctx: CanvasRenderingContext2D,
  date: Date,
  x: number,
  y: number,
  w: number,
  h: number,
  p: Palette,
) {
  const notch = 24;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = p.ribbonBg;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w / 2, y + h - notch);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = p.ribbonText;
  ctx.textAlign = 'center';
  ctx.font = `700 72px ${SANS}`;
  ctx.fillText(String(date.getDate()), x + w / 2, y + 88);
  ctx.font = `600 26px ${SANS}`;
  drawSpaced(ctx, MONTHS[date.getMonth()], x + w / 2, y + 126, 4);
}

function drawGreeting(
  ctx: CanvasRenderingContext2D,
  theme: BirthdayThemeId,
  W: number,
  happyY: number,
  birthdayY: number,
  p: Palette,
) {
  const cx = W / 2;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  if (theme === 'hero') {
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 6;
    ctx.shadowOffsetY = 6;
    const skewed = (text: string, y: number, size: number, color: string) => {
      ctx.save();
      ctx.translate(cx, y);
      ctx.transform(1, 0, -0.18, 1, 0, 0);
      ctx.font = `${size}px ${IMPACT}`;
      ctx.fillStyle = color;
      ctx.fillText(text, 0, 0);
      ctx.restore();
    };
    skewed('HAPPY', happyY, 128, p.happy);
    skewed('BIRTHDAY', birthdayY, 138, p.birthday);
    ctx.restore();
    return;
  }

  const shadow = theme === 'celebration' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.65)';
  ctx.shadowColor = shadow;
  ctx.shadowBlur = 18;

  ctx.fillStyle = p.happy;
  ctx.font = `700 132px ${SCRIPT}`;
  ctx.fillText('Happy', cx - 40, happyY);
  const happyW = ctx.measureText('Happy').width;

  ctx.fillStyle = p.birthday;
  ctx.font = `700 156px ${SCRIPT}`;
  ctx.fillText('Birthday', cx, birthdayY);
  const bdayW = ctx.measureText('Birthday').width;
  ctx.shadowBlur = 0;

  // Flourishes
  if (theme === 'dark') {
    ctx.fillStyle = '#ffffff';
    fourPointStar(ctx, cx - 40 + happyW / 2 + 46, happyY - 80, 22);
    fourPointStar(ctx, cx - 40 + happyW / 2 + 82, happyY - 44, 10);
  } else {
    // brush swash under "Birthday"
    ctx.strokeStyle = p.birthday;
    ctx.lineCap = 'round';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx - bdayW * 0.32, birthdayY + 26);
    ctx.quadraticCurveTo(cx + bdayW * 0.1, birthdayY + 6, cx + bdayW * 0.52, birthdayY + 14);
    ctx.stroke();
    if (theme === 'night') {
      ctx.fillStyle = p.birthday;
      fourPointStar(ctx, cx + bdayW / 2 + 10, birthdayY - 110, 16);
    }
  }
  ctx.restore();
}

function drawNamePill(
  ctx: CanvasRenderingContext2D,
  theme: BirthdayThemeId,
  name: string,
  cx: number,
  cy: number,
  maxWidth: number,
  p: Palette,
) {
  const spacing = 6;
  const prefix = theme === 'hero' ? '///  ' : '';
  const text = prefix + name;

  ctx.save();
  const size = fitFont(ctx, text, (s) => `600 ${s}px ${SANS}`, 36, 20, maxWidth - 100, spacing);
  const tw = spacedWidth(ctx, text, spacing);
  const pw = tw + 96;
  const ph = size + 40;
  const px = cx - pw / 2;
  const py = cy - ph / 2;

  ctx.fillStyle = p.pillFill;
  ctx.strokeStyle = p.pillStroke;
  ctx.lineWidth = theme === 'hero' ? 3 : 2;
  ctx.beginPath();
  if (theme === 'hero') {
    // angled tag shape
    const k = 22;
    ctx.moveTo(px + k, py);
    ctx.lineTo(px + pw, py);
    ctx.lineTo(px + pw - k, py + ph);
    ctx.lineTo(px, py + ph);
    ctx.closePath();
  } else {
    ctx.roundRect(px, py, pw, ph, ph / 2);
  }
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = p.nameText;
  ctx.textBaseline = 'middle';
  if (theme === 'hero') {
    // render the slashes in the accent colour
    const slashW = spacedWidth(ctx, prefix, spacing) + spacing;
    let x = cx - tw / 2;
    ctx.textAlign = 'left';
    ctx.fillStyle = p.ornament;
    for (const ch of prefix) {
      ctx.fillText(ch, x, cy + 1);
      x += ctx.measureText(ch).width + spacing;
    }
    ctx.fillStyle = p.nameText;
    drawSpaced(ctx, name, cx - tw / 2 + slashW + spacedWidth(ctx, name, spacing) / 2, cy + 1, spacing);
  } else {
    drawSpaced(ctx, name, cx, cy + 1, spacing);
  }
  ctx.textBaseline = 'alphabetic';

  // Ornaments on either side of the pill
  if (theme !== 'hero' && theme !== 'celebration') {
    const lineLen = 46;
    const gap = 14;
    ctx.strokeStyle = p.ornament;
    ctx.fillStyle = p.ornament;
    ctx.lineWidth = 2;
    for (const dir of [-1, 1]) {
      const edge = dir < 0 ? px : px + pw;
      const start = edge + dir * gap;
      const end = start + dir * lineLen;
      ctx.beginPath();
      ctx.moveTo(start, cy);
      ctx.lineTo(end, cy);
      ctx.stroke();
      if (theme === 'sakura') {
        blossom(ctx, end + dir * 18, cy, 14, dir);
      } else {
        // diamond
        const dx = end + dir * 10;
        ctx.beginPath();
        ctx.moveTo(dx, cy - 7);
        ctx.lineTo(dx + 7, cy);
        ctx.lineTo(dx, cy + 7);
        ctx.lineTo(dx - 7, cy);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Parse "2026-11-08", ISO strings, or Date; falls back to today. */
export function parsePosterDate(value?: string | Date | null): Date {
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  if (typeof value === 'string' && value) {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}
