import React, { useEffect, useRef, useState } from 'react';
import { Award, CheckCircle2, Maximize2, Minimize2 } from 'lucide-react';
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
  'g1-station-2': { path: '/games/hoi-vui-que-em/index.html', title: 'Hội vui quê em' },
  'g1-station-4': { path: '/games/thanh-dien-hai/index.html', title: 'Nhà thám hiểm nhí – Thành Điện Hải' },
  'g1-station-1': { path: '/games/ban-do-que-em/index.html', title: 'Bản đồ quê em' },
  'g2-station-1': { path: '/games/det-sac-mau-que-em/index.html', title: 'Dệt Sắc Màu Quê Em' },
  'g2-station-5': { path: '/games/ron-rang-hoi-que/index.html', title: 'Rộn Ràng Chợ Quê' },
  'g2-station-4': { path: '/games/hoi-an/index.html', title: 'Giải mã thương cảng Hội An' },
  'g2-station-2': { path: '/games/cu-lao-cham/index.html', title: 'Biệt đội xanh cứu đảo' },
  'g2-station-3': { path: '/games/dau-an-xua/index.html', title: 'Dấu Ấn Xưa · An Hải' },
};

export const ApprovedStationGame: React.FC<Props> = ({ station, studentId, isReadOnly, onCompleteStage }) => {
  const game = APPROVED_GAMES[station.id];
  const frameRef = useRef<HTMLIFrameElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const completionHandled = useRef(false);
  const [completed, setCompleted] = useState(false);
  const mainReward = station.rewards.find(reward => reward.stage === 2) || station.rewards[1];

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(document.fullscreenElement === fullscreenContainerRef.current);
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  const toggleFullscreen = async () => {
    const container = fullscreenContainerRef.current;
    if (!container) return;
    try {
      if (document.fullscreenElement === container) {
        await document.exitFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
        await container.requestFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch {
      // The browser may disallow fullscreen; the normal game remains usable.
    }
  };

  useEffect(() => {
    backgroundMusic.setForegroundSource('approved-station-game', true);
    return () => backgroundMusic.setForegroundSource('approved-station-game', false);
  }, []);

  useEffect(() => {
    const handleGameMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type === 'cham-danang-game-continue' && event.data?.stationId === station.id && completionHandled.current) {
        onCompleteStage();
        return;
      }
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
  }, [isReadOnly, mainReward?.id, station.id, studentId, onCompleteStage]);

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
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex shrink-0 items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">
            <Award className="h-4 w-4" />
            <span>{station.id === 'g1-station-2' || station.id === 'g1-station-4' ? '4 nhiệm vụ · cùng chơi, cùng khám phá' : '5 nhiệm vụ · truy lại dấu vết đến khi đúng'}</span>
          </div>
          <button
            type="button"
            onClick={() => { void toggleFullscreen(); }}
            aria-label="Mở trò chơi toàn màn hình"
            className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-sky-800"
          >
            <Maximize2 className="h-4 w-4" />
            Toàn màn hình
          </button>
        </div>
      </div>

      <div
        ref={fullscreenContainerRef}
        className={isFullscreen
          ? 'relative flex h-[100dvh] w-screen items-center justify-center overflow-hidden bg-slate-950'
          : 'relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-lg'}
      >
        {isFullscreen && (
          <button
            type="button"
            onClick={() => { void toggleFullscreen(); }}
            aria-label="Thoát toàn màn hình"
            className="absolute right-3 top-3 z-20 inline-flex items-center gap-2 rounded-xl bg-slate-950/75 px-3 py-2 text-xs font-black text-white shadow-md backdrop-blur-sm hover:bg-slate-800"
          >
            <Minimize2 className="h-4 w-4" />
            Thu nhỏ
          </button>
        )}
        <iframe
          ref={frameRef}
          src={game.path}
          title={game.title}
          className={isFullscreen
            ? 'block h-full w-full border-0'
            : 'block h-[82vh] min-h-[680px] w-full border-0 max-sm:h-[86vh] max-sm:min-h-[760px]'}
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
