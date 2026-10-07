import React, { useEffect, useMemo, useState } from 'react';
import { Station, ExplorationHotspot } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { audioService, NarrationState } from '../../services/AudioService';
import { progressService } from '../../services/ProgressService';
import { RewardClaimModal } from '../common/RewardClaimModal';
import { backgroundMusic } from '../../services/BackgroundMusic';
import { CheckCircle2, ChevronLeft, ChevronRight, ExternalLink, Globe, MapPin, Maximize2, Pause, Play, RotateCcw, Volume2, X } from 'lucide-react';

interface Props { station: Station; onCompleteStage: () => void; }

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const HoiAnStage1Exploration: React.FC<Props> = ({ station, onCompleteStage }) => {
  const { currentUser, role, language, setAssistantHotspot } = useApp();
  const studentId = currentUser?.id || 'guest';
  const readOnly = role !== 'student';
  const [index, setIndex] = useState(0);
  const [narrationState, setNarrationState] = useState<NarrationState>('idle');
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showVr, setShowVr] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const hotspot: ExplorationHotspot = station.hotspots[index] || station.hotspots[0];
  const progress = progressService.getStationProgress(studentId, station.id);
  const options = useMemo(() => shuffle(hotspot.interaction?.options || []), [hotspot]);
  const explored = progress.exploredHotspotIds.includes(hotspot.id);
  const playing = narrationState === 'playing';
  const paused = narrationState === 'paused';

  useEffect(() => {
    setAssistantHotspot(hotspot);
    return () => setAssistantHotspot(null);
  }, [hotspot.id, setAssistantHotspot]);

  useEffect(() => audioService.subscribeState(setNarrationState), []);
  useEffect(() => {
    backgroundMusic.setForegroundSource('hoi-an-vr360', showVr);
    return () => backgroundMusic.setForegroundSource('hoi-an-vr360', false);
  }, [showVr]);
  useEffect(() => {
    setSelected(null); setSubmitted(false); setCorrect(false); audioService.stopNarration();
  }, [index]);

  const speak = () => audioService.speakNarration(
    language === 'en' && hotspot.narrationEn ? hotspot.narrationEn : hotspot.narrationVi,
    language === 'en' ? 'en-US' : 'vi-VN'
  );

  const choose = (id: string) => { if (!submitted) { audioService.playSfx('click'); setSelected(id); } };
  const check = () => {
    if (!selected || !hotspot.interaction) return;
    const ok = !!hotspot.interaction.options.find(o => o.id === selected)?.isCorrect;
    setCorrect(ok); setSubmitted(true); audioService.playSfx(ok ? 'correct' : 'wrong');
    if (ok && !readOnly) progressService.completeHotspot(studentId, station.id, hotspot.id);
  };
  const go = (next: number) => {
    if (next >= 0 && next < station.hotspots.length) { audioService.playSfx('transition'); setIndex(next); }
  };
  const next = () => {
    if (!readOnly) progressService.completeHotspot(studentId, station.id, hotspot.id);
    if (index < station.hotspots.length - 1) go(index + 1);
    else {
      if (!readOnly) progressService.completeStage1(studentId, station.id);
      setShowReward(true);
    }
  };

  return (
    <div className="space-y-3">
      <section className="rounded-[2rem] border border-orange-200 bg-white/94 p-3 shadow-xl backdrop-blur-xl sm:p-4">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-3 py-1 text-[10px] font-black text-white">ĐIỂM CHẠM {index + 1}/{station.hotspots.length}</span>
              {explored && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> ĐÃ KHÁM PHÁ</span>}
            </div>
            <h2 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">{hotspot.titleVi}</h2>
            {hotspot.subtitleVi && <p className="mt-0.5 text-xs font-semibold text-slate-500">{hotspot.subtitleVi}</p>}
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl bg-orange-50 p-1.5">
            {station.hotspots.map((item, i) => (
              <button key={item.id} type="button" onClick={() => go(i)} className={`h-9 min-w-9 rounded-xl px-3 text-xs font-black transition ${i === index ? 'bg-orange-500 text-white shadow-md' : progress.exploredHotspotIds.includes(item.id) ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-600 hover:bg-orange-100'}`}>{i + 1}</button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.55fr_.85fr]">
          <div className="relative min-h-[390px] overflow-hidden rounded-[1.65rem] border-2 border-orange-200 bg-slate-950 shadow-lg sm:min-h-[500px]">
            <button type="button" onClick={() => setShowImage(true)} className="group absolute inset-0 z-0 h-full w-full cursor-zoom-in" aria-label="Xem ảnh lớn">
              <img src={hotspot.image} alt={hotspot.titleVi} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-slate-950/10" />
            </button>
            <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-2xl border border-white/60 bg-white/92 px-4 py-3 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2 text-orange-600"><MapPin className="h-4 w-4" /><span className="text-sm font-black">Khám phá bức tranh Hội An</span></div>
              <p className="mt-0.5 text-[11px] font-semibold text-slate-600">Chạm vào ảnh để xem thật lớn và đọc nội dung.</p>
            </div>
            <div className="absolute right-4 top-4 z-20 flex flex-col items-end gap-2 sm:flex-row">
              {station.vr360Experience?.verified && station.vr360Experience.url && (
                <button
                  type="button"
                  onClick={() => {
                    audioService.playSfx('click');
                    setShowVr(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2 text-xs font-black text-white shadow-xl transition hover:-translate-y-0.5"
                >
                  <Globe className="h-4 w-4" />
                  KHÁM PHÁ 360°
                </button>
              )}
              <button type="button" onClick={() => setShowImage(true)} className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-black text-orange-700 shadow-xl">
                <Maximize2 className="h-4 w-4" /> XEM ẢNH LỚN
              </button>
            </div>
            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 rounded-2xl bg-slate-950/72 p-1.5 backdrop-blur">
                {!playing && !paused && <button type="button" onClick={speak} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2.5 text-xs font-black text-white"><Volume2 className="h-4 w-4" /> NGHE THUYẾT MINH</button>}
                {playing && <><button type="button" onClick={() => audioService.pauseNarration()} className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-3 py-2.5 text-xs font-black text-slate-950"><Pause className="h-4 w-4" /> TẠM DỪNG</button><button type="button" onClick={() => { audioService.stopNarration(); speak(); }} className="rounded-xl bg-white/15 p-2.5 text-white"><RotateCcw className="h-4 w-4" /></button></>}
                {paused && <button type="button" onClick={() => audioService.resumeNarration()} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-3 py-2.5 text-xs font-black text-white"><Play className="h-4 w-4 fill-current" /> TIẾP TỤC NGHE</button>}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-[1.5rem] border border-orange-200 bg-[#fffaf2] p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-orange-600">Câu chuyện điểm đến</p>
              <p className="mt-2 max-h-36 overflow-y-auto text-sm font-semibold leading-6 text-slate-700">{hotspot.narrationVi}</p>
              {hotspot.keyFactVi && <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3"><p className="text-[10px] font-black uppercase text-orange-700">Điều thú vị cần nhớ</p><p className="mt-1 text-xs font-black leading-5 text-slate-800">{hotspot.keyFactVi}</p></div>}
            </div>

            {hotspot.interaction && <div className="rounded-[1.5rem] border border-orange-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-black text-white">?</span><h3 className="text-sm font-black text-slate-950">Thử tài quan sát</h3></div>
              <p className="text-sm font-black leading-5 text-slate-800">{hotspot.interaction.questionVi}</p>
              <div className="mt-3 space-y-2">{options.map(opt => {
                const active = selected === opt.id;
                let cls = 'border-slate-200 bg-white text-slate-700 hover:bg-orange-50';
                if (submitted && correct && opt.isCorrect) cls = 'border-emerald-400 bg-emerald-50 text-emerald-800';
                else if (submitted && !correct && active) cls = 'border-rose-400 bg-rose-50 text-rose-700';
                else if (active) cls = 'border-orange-400 bg-orange-50 text-orange-800 ring-2 ring-orange-200';
                return <button key={opt.id} type="button" disabled={submitted} onClick={() => choose(opt.id)} className={`w-full rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition ${cls}`}>{opt.textVi}</button>;
              })}</div>
              {submitted && <p className={`mt-2 rounded-xl p-2.5 text-xs font-bold ${correct ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>{correct ? 'Chính xác! Em đã mở thêm một dấu ấn của Hội An.' : 'Chưa đúng rồi. Em nhìn lại ảnh hoặc nghe thuyết minh nhé!'}</p>}
              <div className="mt-3">
                {!submitted && <button type="button" disabled={!selected} onClick={check} className="w-full rounded-xl bg-orange-500 py-3 text-xs font-black text-white disabled:bg-slate-200 disabled:text-slate-400">KIỂM TRA</button>}
                {submitted && !correct && <button type="button" onClick={() => { setSubmitted(false); setSelected(null); }} className="w-full rounded-xl bg-amber-400 py-3 text-xs font-black text-slate-950">THỬ LẠI</button>}
                {submitted && correct && <button type="button" onClick={next} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 py-3 text-xs font-black text-white">{index === station.hotspots.length - 1 ? 'HOÀN THÀNH CHẶNG 1' : 'KHÁM PHÁ ĐIỂM TIẾP THEO'} <ChevronRight className="h-4 w-4" /></button>}
              </div>
            </div>}
          </div>
        </div>
      </section>

      {showImage && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/85 p-3 backdrop-blur-md sm:p-6">
        <div className="grid max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-orange-200 bg-[#fffaf2] shadow-2xl lg:grid-cols-[1.55fr_.75fr]">
          <div className="relative min-h-[360px] bg-slate-950 lg:min-h-[620px]">
            <img src={hotspot.image} alt={hotspot.titleVi} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex justify-between">
              <button type="button" disabled={index === 0} onClick={() => go(index - 1)} className="inline-flex items-center gap-1 rounded-full bg-white/95 px-4 py-2 text-xs font-black text-slate-700 shadow disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Trước</button>
              <button type="button" disabled={index === station.hotspots.length - 1} onClick={() => go(index + 1)} className="inline-flex items-center gap-1 rounded-full bg-white/95 px-4 py-2 text-xs font-black text-orange-700 shadow disabled:opacity-40">Tiếp <ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="relative overflow-y-auto p-5 sm:p-7">
            <button type="button" onClick={() => setShowImage(false)} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700"><X className="h-5 w-5" /></button>
            <div className="pr-10"><span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-[10px] font-black uppercase text-orange-700"><MapPin className="h-3.5 w-3.5" /> Điểm nổi bật Hội An</span><h3 className="mt-4 text-3xl font-black text-slate-950">{hotspot.titleVi}</h3>{hotspot.subtitleVi && <p className="mt-1 text-sm font-bold text-orange-700">{hotspot.subtitleVi}</p>}</div>
            <div className="mt-5 rounded-2xl border border-orange-100 bg-white p-4"><p className="text-sm font-semibold leading-6 text-slate-700">{hotspot.narrationVi}</p></div>
            {hotspot.keyFactVi && <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-[10px] font-black uppercase text-orange-700">Điều thú vị cần nhớ</p><p className="mt-1 text-sm font-black text-slate-800">{hotspot.keyFactVi}</p></div>}
            <button type="button" onClick={() => { setShowImage(false); speak(); }} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-3.5 text-sm font-black text-white"><Volume2 className="h-4 w-4" /> NGHE THUYẾT MINH</button>
          </div>
        </div>
      </div>}

      {showVr && station.vr360Experience?.url && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/90 p-3 backdrop-blur-md sm:p-6">
          <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-orange-200 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-slate-900/95 px-4 py-3 text-white sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">{station.vr360Experience.titleVi || 'Khám phá Hội An 360°'}</p>
                  <p className="text-[10px] font-semibold text-slate-400">Không gian thực tế ảo • Trạm Phố cổ Hội An</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={station.vr360Experience.fallbackUrl || station.vr360Experience.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-[10px] font-black text-white hover:bg-white/15 sm:inline-flex"
                >
                  MỞ TAB MỚI <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setShowVr(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-rose-500"
                  aria-label="Đóng trải nghiệm 360 độ"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="relative flex-1 bg-slate-950">
              <iframe
                src={station.vr360Experience.url}
                title={station.vr360Experience.titleVi || 'Khám phá Hội An 360°'}
                className="h-full w-full border-0"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
              <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-950/70 px-4 py-2 text-[10px] font-bold text-white/85 backdrop-blur-md">
                Kéo để quan sát • Chạm để khám phá không gian 360°
              </div>
            </div>
          </div>
        </div>
      )}

      {showReward && <RewardClaimModal reward={station.rewards.find(r => r.stage === 1) || station.rewards[0]} stage={1} alreadyClaimed={!readOnly && progress.rewardsCollected.includes(station.rewards.find(r => r.stage === 1)?.id || '')} onClaim={() => { if (!readOnly) { const reward = station.rewards.find(r => r.stage === 1); if (reward) progressService.claimReward(studentId, station.id, reward.id); } }} onContinue={() => { setShowReward(false); onCompleteStage(); }} />}
    </div>
  );
};