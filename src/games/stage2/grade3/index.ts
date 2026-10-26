import type {GameConfig} from '../types';
import {hoangDieuConfig} from '../hoangDieu';
import {station3Config} from './station3';
import {station4Config} from './station4';
import {station5Config} from './station5';
export const grade3SharedConfigs: Record<string,GameConfig> = {
 [hoangDieuConfig.stationId]:hoangDieuConfig,
 [station3Config.stationId]:station3Config,
 [station4Config.stationId]:station4Config,
 [station5Config.stationId]:station5Config,
};
export const grade3NewPreviewIds=['g3-station-3','g3-station-4','g3-station-5'] as const;
