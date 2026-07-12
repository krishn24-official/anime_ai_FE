export const resolveContentImage = (item: any, type: string): string => {
  if (!item) return '';
  const mappedType = type === 'tv_series' ? 'tv_series' : (type === 'movies' ? 'movie' : type);

  if (mappedType === 'character' || mappedType === 'characters') {
    return item.images?.profile || '';
  }
  if (mappedType === 'manga') {
    return item.cover_image || '';
  }
  
  return item.images?.poster || 
         item.images?.jpg?.large_image_url || 
         item.images?.jpg?.image_url || 
         item.poster_image || 
         item.poster || 
         '';
};
