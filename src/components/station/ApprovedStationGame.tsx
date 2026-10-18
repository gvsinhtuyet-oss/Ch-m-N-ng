import React, { useEffect, useRef, useState } from 'react';
import { Award, CheckCircle2 } from 'lucide-react';
import { Station } from '../../types';
import { progressService } from '../../services/ProgressService';
import { backgroundMusic } from '../../services/BackgroundMusic';

interface Props {
  station: Station;
  studentId: string;
  isReadOnly: boolean;
  onCompleteStage: () => void;
}

const APPROVED_GAMES: Record<string, { path: string; title: string }> = {
  'g2-station-4': { path: '/games/hoi-an/index.html', title: 'Giải mã thương cảng Hội An' },
  'g2-station-2': { path: '/games/cu-lao-cham/index.html', title: 'Biệt đội xanh cứu đảo' },
  'g2-station-3': { path: '/games/dau-an-xua/index.html', title: 'Dấu Ấn Xưa · An Hải' },
};

export const ApprovedStationGame: React.FC<Props> = ({ station, studentId, isReadOnly, onCompleteStage }) => {
  const game = APPROVED_GAMES[station.id];
  const frameRef = useRef<HTMLIFrameElement>(null);
  const completionHandled = useRef(false);
  const [completed, setCompleted] = useState(false);
  const mainReward = station.rewards.find(reward => reward.stage === 2) || station.rewards[1];

  useEffect(() => {
    backgroundMusic.setForegroundSource('approved-station-game', true);
    return () => backgroundMusic.setForegroundSource('approved-station-game', false);
  }, []);

  useEffect(() => {
    const handleGameMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type !== 'cham-danang-game-complete' || event.data?.stationId !== station.id) return;
      if (completionHandled.current) return;

      completionHandled.current = true;
      if (!isReadOnly) {
        progressService.completeStage2(studentId, station.id, mainReward?.id);
      }
      setCompleted(true);
    };

    window.addEventListener('message', handleGameMessage);
    return () => window.removeEventListener('message', handleGameMessage);
  }, [isReadOnly, mainReward?.id, station.id, studentId]);

  if (!game) return null;

  return (
    <section className="mx-auto w-full max-w-[1400px] space-y-3">
      <div className="flex flex-col gap-2 rounded-2xl border border-amber-200 bg-white/95 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <span className="mb-1 inline-block rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-900">
            Chặng 2 · Chinh phục thử thách
          </span>
          <h2 className="text-base font-black text-slate-900 sm:text-lg">{game.title}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">
          <Award className="h-4 w-4" />
          <span>5 nhiệm vụ · truy lại dấu vết đến khi đúng</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-lg">
        <iframe
          ref={frameRef}
          src={game.path}
          title={game.title}
          className="block h-[82vh] min-h-[680px] w-full border-0 max-sm:h-[86vh] max-sm:min-h-[760px]"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      </div>

      {completed && (
        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>Đã hoàn thành trò chơi. Tiến độ Chặng 2 đã được ghi nhận.</span>
          </div>
          <button
            type="button"
            onClick={onCompleteStage}
            className="rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 px-5 py-3 text-sm font-black text-white shadow-md transition hover:brightness-105"
          >
            TIẾP TỤC HÀNH TRÌNH →
          </button>
        </div>
      )}
    </section>
  );
};