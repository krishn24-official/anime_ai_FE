/** The 11-character video id of a YouTube URL, or null. */
export const getYouTubeId = (url?: string | null): string | null => {
  if (!url) return null;
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return match && match[2].length === 11 ? match[2] : null;
};
