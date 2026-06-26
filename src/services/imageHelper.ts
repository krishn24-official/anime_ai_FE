/**
 * Optimizes external Unsplash URLs by specifying WebP format and correct sizing.
 * If the URL is not from Unsplash or is a relative/local URL, returns it as-is.
 */
export const getOptimizedImageUrl = (url: string, width: number = 800): string => {
  if (!url) return '';
  try {
    if (url.includes('images.unsplash.com')) {
      const urlObj = new URL(url);
      urlObj.searchParams.set('fm', 'webp');
      urlObj.searchParams.set('w', String(width));
      urlObj.searchParams.set('q', '80');
      urlObj.searchParams.delete('auto');
      return urlObj.toString();
    }
  } catch (e) {
    console.warn("Failed to parse image URL in getOptimizedImageUrl:", url, e);
  }
  return url;
};
