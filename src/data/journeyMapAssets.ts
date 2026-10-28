import assets from './journeyMapAssets.json';

/** Reviewed mapping from the 25 supplied maps; station IDs are not lesson numbers. */
export const JOURNEY_MAP_ASSETS = assets;
const images = new Map(assets.map(asset => [asset.stationId, asset.image]));
export const journeyMapImage = (stationId: string): string | undefined => images.get(stationId);
