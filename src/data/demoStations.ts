export const DEMO_STATION_IDS = new Set([
  'g1-station-4',
  'g2-station-1',
  'g2-station-2',
  'g2-station-3',
  'g2-station-4',
  'g2-station-5',
  'g3-station-2',
  'g4-station-2',
  'g5-station-4',
]);

export function isDemoStation(stationId: string): boolean {
  return DEMO_STATION_IDS.has(stationId);
}
