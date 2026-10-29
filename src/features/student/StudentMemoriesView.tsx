import {JourneyRating} from '../../components/station/JourneyRating';
import {Student} from '../../types';
import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { progressService } from '../../services/ProgressService';
import { Heart, Sparkles, MessageCircle, Calendar } from 'lucide-react';
import { RewardBadge } from '../../components/common/RewardBadge';

export const StudentMemoriesView: React.FC = () => {
  const { currentUser, allStationsInCurrentGrade } = useApp();
  const studentId = currentUser?.id || 'guest';
  const stations = allStationsInCurrentGrade;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-5 py-3 space-y-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 text-white rounded-2xl px-4 py-3 sm:px-5 sm:py-3 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
            <Heart className="w-4 h-4 fill-white" />
          </div>
          <span className="font-extrabold text-xs uppercase tracking-wider text-rose-100">
            KỈ NIỆM HÀNH TRÌNH
          </span>
        </div>
        <h1 className="text-lg sm:text-xl font-black">Nhật Ký Cảm Xúc & Kỉ Niệm Quê Hương</h1>
        <p className="hidden sm:block text-xs text-rose-100 mt-1 max-w-xl">
          Nơi lưu giữ những vật phẩm danh giá và những lời hứa hành động đẹp mà em đã gửi gắm sau mỗi chuyến thám hiểm.
        </p>
      </div>

      {/* Rewards Collected */}
      <div className="bg-white/90 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200 space-y-2">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>Kho Báu Kỉ Niệm Đã Thu Thập</span>
        </h2>

        <div className="space-y-1.5">
          {stations.map((st, stationIndex) => {
            const prog = progressService.getStationProgress(studentId, st.id);
            return (
              <section key={st.id} className="rounded-xl border border-amber-300 bg-amber-50/90 px-2 py-1.5 sm:px-3 sm:py-2">
                <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                  <h3 className="min-w-0 max-w-full text-xs font-black text-amber-950 sm:text-sm">
                    Trạm {stationIndex + 1} · {st.titleVi}
                  </h3>
                  {(prog.stampReceived || prog.stationCompleted) && <JourneyRating compact stationId={st.id} userId={currentUser?.id} requireStudent={!!currentUser && !(currentUser as Student).isGuest}/>}
                </div>
                <div className="grid grid-cols-3 gap-1 sm:gap-2">
                  {st.rewards.map(rw => {
                    const collected = prog.rewardsCollected.includes(rw.id);
                    return (
                      <div key={rw.id} title={rw.nameVi} className={`min-w-0 rounded-lg border px-1 py-0.5 text-center ${collected ? 'border-amber-400 bg-white' : 'border-amber-200 bg-white/70 opacity-65'}`}>
                        <div className="mx-auto flex h-8 items-center justify-center sm:h-9">
                          <RewardBadge template={rw.template} size="sm" muted={!collected} />
                        </div>
                        <p className="line-clamp-1 text-[10px] font-bold leading-tight text-amber-950 sm:text-xs">{rw.nameVi}</p>
                        <span className="text-[9px] text-slate-600">{collected ? '✓ Đã nhận' : 'Chưa nhận'}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* Check-in Pledges & Emotional Responses */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-rose-500" />
          <span>Những Điều Em Nhớ & Lời Hứa Hành Động</span>
        </h2>

        <div className="space-y-4">
          {stations.map((st) => {
            const prog = progressService.getStationProgress(studentId, st.id);
            if (!prog.checkInResponse) return null;

            return (
              <div
                key={st.id}
                className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200/70 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm text-slate-900">{st.titleVi}</h3>
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(prog.checkInResponse.submittedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <div className="text-xs space-y-2">
                  <div>
                    <span className="font-bold text-slate-700">Điều em nhớ nhất:</span>
                    <ul className="list-disc pl-5 mt-1 text-slate-600 space-y-0.5">
                      {prog.checkInResponse.rememberOptionIds.map((rId) => {
                        const opt = st.checkIn.rememberOptions.find(o => o.id === rId);
                        return <li key={rId}>{opt?.textVi || rId}</li>;
                      })}
                    </ul>
                  </div>

                  <div>
                    <span className="font-bold text-emerald-800">Hành động em cam kết thực hiện:</span>
                    <ul className="list-disc pl-5 mt-1 text-emerald-900 space-y-0.5">
                      {prog.checkInResponse.actionOptionIds.map((aId) => {
                        const opt = st.checkIn.actionOptions.find(o => o.id === aId);
                        return <li key={aId}>{opt?.textVi || aId}</li>;
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
