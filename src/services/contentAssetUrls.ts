import type {StationContent} from './ContentService';

// These assets are shipped with the app. Never allow protocol-relative URLs,
// traversal, arbitrary root paths or executable HTML in the material editor.
export const isBundledAssetUrl = (value: string) =>
  /^\/(?:images|learning|audio|games)\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-][a-zA-Z0-9_.-]*\.(?:svg|png|jpe?g|webp|gif|pdf|mp3|wav|ogg|mp4|webm)$/i.test(value);

// Older live API revisions accept HTTPS uploads but not newer bundled paths.
// Absolute public asset URLs preserve compatibility without changing the API,
// its authentication or the existing database.
export function contentForServer(content: StationContent, origin: string): StationContent {
  const asset = (url: string) => isBundledAssetUrl(url) ? new URL(url, origin).href : url;
  return {...content, coverImage: asset(content.coverImage), mapImage: asset(content.mapImage),
    hotspots: content.hotspots.map(h => ({...h, image: asset(h.image)})),
    resources: content.resources.map(r => ({...r, url: asset(r.url)})),
  };
}
