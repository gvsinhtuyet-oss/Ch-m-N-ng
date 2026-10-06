import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { progressService } from '../../services/ProgressService';
import { DEMO_STATION_IDS } from '../../data/demoStations';
import { Heart, Sparkles, MessageCircle, Calendar } from 'lucide-react';
import { RewardBadge } from '../../components/common/RewardBadge';

export const StudentMemoriesView: React.FC = () => {
  const { currentUser, allStationsInCurrentGrade } = useApp();
  const studentId = currentUser?.id || 'guest';
  const stations = allStationsInCurrentGrade.filter(station => DEMO_STATION_IDS.has(station.id));

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <span className="font-extrabold text-xs uppercase tracking-wider text-rose-100">
            KỈ NIỆM HÀNH TRÌNH
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">Nhật Ký Cảm Xúc & Kỉ Niệm Quê Hương</h1>
        <p className="text-xs sm:text-sm text-rose-100 mt-1 max-w-xl">
          Nơi lưu giữ những vật phẩm danh giá và những lời hứa hành động đẹp mà em đã gửi gắm sau mỗi chuyến thám hiểm.
        </p>
      </div>

      {/* Rewards Collected */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>Kho Báu Kỉ Niệm Đã Thu Thập</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stations.map((st) => {
            const prog = progressService.getStationProgress(studentId, st.id);
            return st.rewards.map((rw) => {
              const isUnlocked = prog.rewardsCollected.includes(rw.id);

              return (
                <div
                  key={rw.id}
                  className={`p-4 rounded-2xl border transition flex items-center gap-3.5 ${
                    isUnlocked
                      ? 'bg-amber-50/60 border-amber-200 text-slate-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200/60 opacity-40'
                  }`}
                >
                  <RewardBadge template={rw.template} size="sm" muted={!isUnlocked} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase text-amber-800">
                        {st.titleVi.slice(0, 16)}...
                      </span>
                      <span className="text-[10px] text-slate-400">• Chặng {rw.stage}</span>
                    </div>
                    <h4 className="font-extrabold text-xs text-slate-900">{rw.nameVi}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{rw.descriptionVi}</p>
                  </div>
                </div>
              );
            });
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
