import React, { useCallback, useEffect } from 'react';
import { progressService } from '../../services/ProgressService';
import type { Station } from '../../types';

interface Props {
  station: Station;
  studentId: string;
  isReadOnly: boolean;
  onCompleteStage: () => void;
}

/** Only mount this component for g3-station-1; the iframe contains approved V12. */
export const MyKheBanThanV12: React.FC<Props> = ({station,studentId,isReadOnly,onCompleteStage}) => {
  const onContinue = useCallback(() => {
    const reward = station.rewards.find(r => r.stage === 2) || station.rewards[1];
    if (!isReadOnly) progressService.completeStage2(studentId,station.id,reward?.id);
    onCompleteStage();
  },[station,studentId,isReadOnly,onCompleteStage]);
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== document.querySelector<HTMLIFrameElement>('#my-khe-v12-frame')?.contentWindow) return;
      if (event.data?.type !== 'cham-danang-game-continue' || event.data?.stationId !== 'g3-station-1') return;
      onContinue();
    };
    window.addEventListener('message',handler);
    return () => window.removeEventListener('message',handler);
  },[onContinue]);
  return <iframe id="my-khe-v12-frame" title="Mật mã hai miền biển – Chặng 2" src="/games/grade3-my-khe-ban-than/v12/index.html" className="block h-[100dvh] min-h-[500px] w-full rounded-2xl border-0" allow="autoplay; fullscreen" />;
};