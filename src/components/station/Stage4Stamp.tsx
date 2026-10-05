import React, { useState } from 'react';
import { Station } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { audioService } from '../../services/AudioService';
import { progressService } from '../../services/ProgressService';
import confetti from 'canvas-confetti';
import { Award, Compass, Sparkles, CheckCircle2, RotateCcw, ArrowRight, Map, KeyRound, Gift, Download } from 'lucide-react';

interface Props {
  station: Station;
  onReviewJourney: () => void;
  onExploreNext: () => void;
}

const REWARD_ICON_BY_TEMPLATE: Record<string, string> = {
  discovery_compass: '🧭',
  scholar_scroll: '📜',
  heritage_lantern: '🏮',
  nature_leaf: '🍃',
  dragon_gem: '💎',
  pottery_vase: '🏺',
  sea_pearl: '🫧',
  silk_ribbon: '🎀',
};

export const Stage4Stamp: React.FC<Props> = ({ station, onReviewJourney, onExploreNext }) => {
  const { currentUser, role } = useApp();
  const isReadOnly = role !== 'student';
  const studentId = currentUser?.id || 'guest';
  const progress = progressService.getStationProgress(studentId, station.id);

  const [stamped, setStamped] = useState<boolean>(progress.stampReceived || progress.stationCompleted);
  const [giftClaimed, setGiftClaimed] = useState<boolean>(
    progress.journeyMapReceived && progress.keyFragmentReceived
  );

  const [showGiftReveal, setShowGiftReveal] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [savingMap, setSavingMap] = useState(false);
  const canExchange = isReadOnly || (progress.stage1Completed && progress.stage2Completed && progress.stage3Completed);

  const saveMap = async () => {
    setSavingMap(true); setSaveMessage('');
    try {
      let blob: Blob;
      if (station.journeyMap?.image) {
        const response = await fetch(station.journeyMap.image);
        if (!response.ok) throw new Error('Không tải được ảnh bản đồ.');
        blob = await response.blob();
        if (!blob.type.startsWith('image/')) throw new Error('Đường dẫn bản đồ chưa phải tệp ảnh.');
      } else {
        const canvas = document.createElement('canvas');
        canvas.width = 1000; canvas.height = 900;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Trình duyệt chưa hỗ trợ lưu bản đồ.');
        ctx.fillStyle = '#fffbeb'; ctx.fillRect(0, 0, 1000, 900);
        ctx.fillStyle = '#075985'; ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center'; ctx.fillText('CHẠM ĐÀ NẴNG – BẢN ĐỒ HÀNH TRÌNH', 500, 55);
        ctx.font = 'bold 26px Arial';
        const wrap = (text: string, x: number, y: number, width: number, lineHeight: number) => {
          let line = '';
          for (const word of text.split(/\\s+/)) {
            const next = line ? line + ' ' + word : word;
            if (ctx.measureText(next).width > width && line) {
              ctx.fillText(line, x, y); y += lineHeight; line = word;
            } else line = next;
          }
          if (line) { ctx.fillText(line, x, y); y += lineHeight; }
          return y;
        };
        wrap(station.titleVi, 500, 100, 900, 34);
        ctx.strokeStyle = '#b45309'; ctx.lineWidth = 7; ctx.setLineDash([15, 12]);
        ctx.beginPath(); ctx.moveTo(150,230); ctx.bezierCurveTo(300,140,700,140,850,230);
        ctx.bezierCurveTo(950,390,600,420,500,320); ctx.bezierCurveTo(300,500,80,370,150,230); ctx.stroke();
        ctx.setLineDash([]);
        [[150,230],[850,230],[850,370],[150,370]].forEach(([x,y],i) => {
          ctx.fillStyle = '#0284c7'; ctx.beginPath(); ctx.arc(x,y,35,0,Math.PI*2); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.font = 'bold 30px Arial'; ctx.fillText(String(i+1),x,y+10);
        });
        ctx.fillStyle = '#92400e'; ctx.font = 'bold 24px Arial'; ctx.fillText('Hành trình khám phá quê hương',500,280);
        ctx.textAlign = 'left';
        const nodes = station.journeyMap?.summaryNodes || station.hotspots.map(h => ({ titleVi: h.titleVi,textVi: h.keyFactVi }));
        nodes.slice(0,4).forEach((node,i) => {
          const x = i % 2 === 0 ? 50 : 520, y = 470 + Math.floor(i / 2) * 195;
          ctx.fillStyle = '#fef3c7'; ctx.fillRect(x,y,430,180);
          ctx.fillStyle = '#78350f'; ctx.font = 'bold 20px Arial';
          const nextY = wrap((i+1) + '. ' + node.titleVi,x+16,y+32,400,25);
          ctx.font = '18px Arial'; wrap(node.textVi,x+16,nextY+8,400,24);
        });
        blob = await new Promise<Blob>((resolve,reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error('Chưa lưu được bản đồ.')),'image/png'));
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const extension = blob.type === 'image/jpeg' ? 'jpg' : blob.type === 'image/webp' ? 'webp' : blob.type === 'image/svg+xml' ? 'svg' : blob.type === 'image/gif' ? 'gif' : 'png';
      link.href = url; link.download = 'Ban-do-' + station.id + '.' + extension;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setSaveMessage('Đã gửi bản đồ đến thư mục tải xuống.');
    } catch {
      setSaveMessage('Chưa tải được ảnh. Em có thể mở ảnh bản đồ để lưu trực tiếp hoặc thử lại.');
    } finally { setSavingMap(false); }
  };

  const handleStamp = () => {
    audioService.playSfx('stamp');
    setTimeout(() => {
      audioService.playSfx('victory');
    }, 220);

    // Dynamic Confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#0284c7', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#ef4444'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 60,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 60,
          origin: { x: 1 },
        });
      }, 350);
    } catch {
      // ignore
    }

    setStamped(true);
    if (!isReadOnly) {
      progressService.completeStage4(studentId, station.id);
    }
  };

  const handleJourneyGift = () => {
    if (!canExchange) return;
    if (!stamped) handleStamp();

    if (!isReadOnly) {
      const updated = progressService.claimJourneyGift(studentId, station.id);
      if (!updated.journeyMapReceived || !updated.keyFragmentReceived) {
        return;
      }
    }

    audioService.playSfx('map');
    setTimeout(() => audioService.playSfx('treasure'), 360);

    try {
      confetti({
        particleCount: 120,
        spread: 95,
        startVelocity: 38,
        origin: { y: 0.35 },
        zIndex: 10000,
        disableForReducedMotion: true,
      });
      setTimeout(() => {
        confetti({ particleCount: 70, angle: 60, spread: 70, origin: { x: 0, y: 0.65 }, zIndex: 10000, disableForReducedMotion: true });
        confetti({ particleCount: 70, angle: 120, spread: 70, origin: { x: 1, y: 0.65 }, zIndex: 10000, disableForReducedMotion: true });
      }, 280);
    } catch {
      // Celebration is optional if the browser blocks canvas effects.
    }

    setGiftClaimed(true);
    setShowGiftReveal(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <style>{`
        @keyframes journey-map-reveal {
          from { opacity: 0; transform: translateY(50px) scale(.65) rotate(-8deg); }
          to { opacity: 1; transform: translateY(0) scale(1) rotate(0); }
        }
        @keyframes journey-key-flight {
          0% { opacity: 0; transform: translate(-130px, 120px) scale(.25) rotate(-100deg); }
          35% { opacity: 1; transform: translate(30px, -35px) scale(1.3) rotate(20deg); }
          65% { transform: translate(-10px, -15px) scale(1.05) rotate(-10deg); }
          100% { opacity: 1; transform: translate(0, 0) scale(1) rotate(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .journey-map-reveal, .journey-key-flight { animation: none !important; }
        }
      `}</style>
      {showGiftReveal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" aria-label="Bản đồ và chìa khóa hành trình" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-amber-50 to-sky-50 border-4 border-amber-300 p-5 sm:p-8 text-center shadow-2xl space-y-5">
            <h3 className="text-2xl font-black text-sky-950">🎉 Quà hành trình của em!</h3>
            <div className="journey-map-reveal rounded-2xl border-2 border-amber-400 bg-amber-100 p-4 shadow-lg" style={{ animation: 'journey-map-reveal .8s ease-out both' }}>
              <h4 className="font-black text-lg text-amber-950">{station.journeyMap?.titleVi || 'Bản đồ hành trình ' + station.titleVi}</h4>
              {station.journeyMap?.image ? (
                <img src={station.journeyMap.image} alt={'Bản đồ hành trình ' + station.titleVi} className="w-full rounded-xl mt-3" />
              ) : (
                <svg viewBox="0 0 480 240" role="img" aria-label={'Bản đồ khám phá ' + station.titleVi} className="w-full mt-3 rounded-xl bg-amber-50">
                  <path d="M65 65 C140 0 320 0 405 65 S340 230 250 175 S80 260 65 65" fill="none" stroke="#b45309" strokeWidth="5" strokeDasharray="10 8" />
                  {[[65,65],[405,65],[405,175],[65,175]].map(([x,y],i) => (
                    <g key={i}>
                      <circle cx={x} cy={y} r="27" fill="#0284c7" stroke="white" strokeWidth="4" />
                      <text x={x} y={y+8} textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">{i+1}</text>
                    </g>
                  ))}
                  <text x="240" y="105" textAnchor="middle" fontSize="34">🧭</text>
                  <text x="240" y="140" textAnchor="middle" fill="#92400e" fontSize="18" fontWeight="bold">CHẠM ĐÀ NẴNG</text>
                </svg>
              )}
              <div className="grid grid-cols-2 gap-2 mt-3 text-left">
                {(station.journeyMap?.summaryNodes || station.hotspots.map(h => ({ id: h.id, titleVi: h.titleVi, textVi: h.keyFactVi }))).slice(0,4).map((node,i) => (
                  <div key={node.id} className="rounded-xl bg-white/80 p-2 text-xs text-amber-950">
                    <strong>{i+1}. {node.titleVi}</strong>
                    <p className="mt-1">{node.textVi}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="journey-key-flight mx-auto flex items-center justify-center gap-3 rounded-2xl bg-amber-300 p-4 text-amber-950 shadow-lg" style={{ animation: 'journey-key-flight 1.5s .25s ease-out both' }}>
              <KeyRound className="w-14 h-14 shrink-0" />
              <div className="text-left">
                <p className="font-black">Em nhận được 1 mảnh chìa khóa!</p>
                <p className="text-xs">Sưu tập đủ 5 mảnh để mở rương kho báu Khối {station.grade}.</p>
              </div>
            </div>
            <button type="button" disabled={savingMap} onClick={() => void saveMap()} className="w-full rounded-2xl bg-amber-400 py-3 text-amber-950 font-black inline-flex items-center justify-center gap-2 disabled:opacity-50">
              <Download className="w-5 h-5" />{savingMap ? 'Đang lưu...' : 'LƯU BẢN ĐỒ'}
            </button>
            {saveMessage && <p role="status" className="text-sm text-sky-900">{saveMessage}</p>}
            {station.journeyMap?.image && <a href={station.journeyMap.image} target="_blank" rel="noopener noreferrer" className="block text-xs text-sky-800 underline">Mở ảnh bản đồ</a>}
            <button autoFocus type="button" onClick={() => setShowGiftReveal(false)} className="w-full rounded-2xl bg-sky-700 py-3 text-white font-black">
              CẤT QUÀ VÀO BỘ SƯU TẬP
            </button>
          </div>
        </div>
      )}
      <section className="rounded-3xl bg-white border border-amber-200 shadow-sm p-5 sm:p-7 space-y-5 text-center">
        <span className="text-xs font-black text-sky-700 uppercase">Chặng 4 · Dấu ấn cuối hành trình</span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">{station.titleVi}</h2>
        <p className="text-sm text-slate-600">Những kỉ niệm em đã sưu tập</p>
        <div className="grid grid-cols-3 gap-2">
          {station.rewards.map(reward => {
            const received = isReadOnly || progress.rewardsCollected.includes(reward.id);
            return (
              <div key={reward.id} className={`rounded-2xl border p-3 ${received ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-3xl mb-2">{REWARD_ICON_BY_TEMPLATE[reward.template] || '🎁'}</div>
                <p className="text-xs font-bold text-slate-900">{reward.nameVi}</p>
                <p className="text-[11px] mt-1 text-emerald-700">{received ? '✓ Đã nhận' : 'Chưa nhận'}</p>
              </div>
            );
          })}
        </div>
        {!giftClaimed ? (
          <>
            <p className="text-sm text-slate-700">Đổi quà để nhận <strong>bản đồ hành trình</strong> và <strong>1 mảnh chìa khóa</strong>.</p>
            <button type="button" disabled={!canExchange} onClick={handleJourneyGift} className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 font-black shadow-lg disabled:opacity-50 inline-flex items-center justify-center gap-2">
              <Gift className="w-5 h-5" />ĐỔI QUÀ – NHẬN BẢN ĐỒ
            </button>
            {!canExchange && <p className="text-xs text-slate-500">Em cần hoàn thành 3 chặng trước để đổi quà.</p>}
          </>
        ) : (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-3">
            <p className="font-bold text-emerald-900">✓ Đã nhận bản đồ và 1 mảnh chìa khóa</p>
            <button type="button" onClick={() => { setSaveMessage(''); setShowGiftReveal(true); }} className="rounded-xl bg-sky-700 px-5 py-3 text-white font-bold inline-flex items-center gap-2"><Map className="w-4 h-4" />XEM VÀ LƯU BẢN ĐỒ</button>
          </div>
        )}
        {isReadOnly && <p className="text-xs text-amber-800">Bản xem thử – phần thưởng không lưu vào tài khoản.</p>}
        <div className="flex flex-col sm:flex-row gap-3 justify-center border-t pt-4">
          <button type="button" onClick={onReviewJourney} className="rounded-xl bg-slate-100 px-4 py-3 text-slate-700 font-bold text-sm inline-flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" />Học lại</button>
          <button type="button" onClick={onExploreNext} className="rounded-xl bg-sky-700 px-5 py-3 text-white font-bold text-sm inline-flex items-center justify-center gap-2">Khám phá trạm tiếp theo<ArrowRight className="w-4 h-4" /></button>
        </div>
      </section>
    </div>
  );
};
