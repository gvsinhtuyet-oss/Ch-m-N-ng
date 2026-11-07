import React, { useCallback, useEffect, useRef } from 'react';
import { progressService } from '../../services/ProgressService';
import { usePortraitStage2Frame } from '../../games/stage2/usePortraitStage2Frame';
import type { Station } from '../../types';

interface Props {
  station: Station;
  studentId: string;
  isReadOnly: boolean;
  onCompleteStage: () => void;
}

/** Approved V18 historical challenge for grade 3 station 2. */
export const HoangDieuPhanChauTrinhV18: React.FC<Props> = ({ station, studentId, isReadOnly, onCompleteStage }) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const fitPortrait = usePortraitStage2Frame();
  const completed = useRef(false);
  const onContinue = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    const reward = station.rewards.find(r => r.stage === 2) || station.rewards[1];
    if (!isReadOnly) progressService.completeStage2(studentId, station.id, reward?.id);
    onCompleteStage();
  }, [station, studentId, isReadOnly, onCompleteStage]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type !== 'cham-danang-game-continue' || event.data?.stationId !== 'g3-station-2') return;
      onContinue();
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onContinue]);

  const prepareGame = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
    const doc = frameRef.current?.contentDocument;
    if (!doc?.querySelector('.scene')) return;
    // Layout is independent of whether the approved HTML already loaded audio.
    fitPortrait(event);
    if (doc.getElementById('cham-danang-shared-audio')) return;
    const mobileLayout = doc.createElement('style');
    mobileLayout.textContent = `
      @media (max-width: 650px) {
        html, body { height: auto !important; overflow-y: auto !important; }
        .scene:not(.is-victory), .scene:not(.is-victory) .shell {
          height: auto !important;
          min-height: 100vh !important;
          min-height: 100dvh !important;
          overflow: visible !important;
        }
        .scene:not(.is-victory) .panel { max-height: none !important; }
      }
    `;
    doc.head.append(mobileLayout);
    const script = doc.createElement('script');
    script.id = 'cham-danang-shared-audio';
    script.src = '/games/shared/game-audio.js';
    script.async = false;
    (doc.head || doc.documentElement).appendChild(script);
  };

  return <iframe data-stage2-game-frame onLoad={prepareGame} ref={frameRef} title="Giải mã dấu ấn lịch sử – Chặng 2" src="/games/grade3-hoang-dieu-phan-chau-trinh/v18/index.html" className="block h-[100dvh] min-h-[500px] w-full rounded-2xl border-0" allow="autoplay; fullscreen" />;
};
