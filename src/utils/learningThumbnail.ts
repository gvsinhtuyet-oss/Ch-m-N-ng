import thumbnails from '../data/learningThumbnails.json';
export const learningThumbnail = (source: string) => (thumbnails as Record<string,string>)[source] || source;
