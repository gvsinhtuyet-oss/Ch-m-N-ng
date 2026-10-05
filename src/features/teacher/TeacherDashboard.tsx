import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Station } from '../../types';
import { DEMO_STUDENTS, DEMO_CLASSROOMS } from '../../data/mockUsers';
import { implementationService } from '../../services/ImplementationService';
import { progressService } from '../../services/ProgressService';
import { DEMO_STATION_IDS } from '../../data/demoStations';
import { ImplementationModal } from './ImplementationModal';
import {
  Presentation,
  BookOpen,
  CheckCircle2,
  Users,
  BarChart3,
  FileEdit,
  Clock,
  Map as MapIcon,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const {
    currentUser,
    currentGrade,
    setCurrentGrade,
    allStationsInCurrentGrade,
    openStation,
    enterPresentationMode,
    setCurrentView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'teaching' | 'classrooms' | 'results' | 'resources'>('teaching');
  const [selectedStationForImp, setSelectedStationForImp] = useState<Station | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>('class-2-24');
  const [proposalStation, setProposalStation] = useState<Station | null>(null);
  const [proposalText, setProposalText] = useState<string>('');
  const [proposalSent, setProposalSent] = useState<boolean>(false);

  const teacher = currentUser as any;
  const stations = allStationsInCurrentGrade;
  const demoStations = stations.filter(station => DEMO_STATION_IDS.has(station.id));
  const displayStations = [...stations].sort((a, b) => {
    const aDemo = DEMO_STATION_IDS.has(a.id);
    const bDemo = DEMO_STATION_IDS.has(b.id);
    if (aDemo === bDemo) return 0;
    return aDemo ? -1 : 1;
  });
  const currentDemoStation = demoStations[0] || null;
  const implementations = implementationService.getAll();
  const teacherClasses = DEMO_CLASSROOMS.filter(classroom =>
    teacher?.assignedClasses?.includes(classroom.id)
  );
  const classStudents = DEMO_STUDENTS.filter(student => student.classId === selectedClassId);
  const demoStudentSummaries = classStudents.map(student =>
    progressService.getGradeProgress(
      student.id,
      demoStations.map(station => station.id),
      currentGrade
    )
  );
  const participatingStudents = demoStudentSummaries.filter(summary => summary.completedStations > 0).length;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8 space-y-8">
      {/* Teacher Profile Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-sky-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-300 font-bold text-xs uppercase tracking-wider">
              Không Gian Dạy Học – Giáo Viên
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-300 text-slate-950 font-black text-[10px] uppercase tracking-wide">
              Tài khoản demo • Dữ liệu minh họa
            </span>
            <span className="text-xs text-emerald-200">Trường TH Trần Đại Nghĩa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Chào mừng {teacher?.name || 'Cô Trương Sinh Tuyết'}!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
            Hỗ trợ giáo viên tổ chức bài học demo, trình chiếu nội dung, theo dõi tiến độ và ghi nhận triển khai.
          </p>
          <button
            type="button"
            onClick={() => setCurrentView('student-maps')}
            className="mt-3 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/15 text-xs font-black transition"
          >
            <MapIcon className="w-4 h-4 text-amber-300" />
            <span>XEM TRƯỚC BẢN ĐỒ & RƯƠNG KHO BÁU</span>
          </button>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex flex-wrap gap-2 bg-black/20 p-1.5 rounded-2xl backdrop-blur-md border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('teaching')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'teaching' ? 'bg-white text-slate-950 shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>DẠY HỌC</span>
          </button>
          <button
            onClick={() => setActiveTab('classrooms')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'classrooms' ? 'bg-white text-slate-950 shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>LỚP HỌC</span>
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'results' ? 'bg-white text-slate-950 shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>KẾT QUẢ</span>
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'resources' ? 'bg-white text-slate-950 shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>HỌC LIỆU</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DẠY HỌC */}
      {activeTab === 'teaching' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Danh Mục Bài Dạy Khối {currentGrade}</h2>
              <p className="text-xs text-slate-500">
                Mỗi khối hiện có 01 bài demo mở; 04 bài còn lại đang tiếp tục hoàn thiện.
              </p>
            </div>

            {/* Change Grade */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-400 px-2">Khối:</span>
              {[1, 2, 3, 4, 5].map(g => (
                <button
                  key={g}
                  onClick={() => setCurrentGrade(g)}
                  className={`w-7 h-7 rounded-xl text-xs font-bold transition ${
                    currentGrade === g ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {displayStations.map(station => {
              const isDemoReady = DEMO_STATION_IDS.has(station.id);
              const stationImps = isDemoReady
                ? implementations.filter(i => i.stationId === station.id)
                : [];
              const hasImplemented = stationImps.length > 0;

              return (
                <div
                  key={station.id}
                  className={`bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs transition flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
                    isDemoReady ? 'hover:border-emerald-300' : 'opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={station.coverImage}
                      alt={station.titleVi}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shrink-0 shadow-xs"
                    />
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                          Bài {station.number}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">• {station.totalPeriods} tiết</span>
                        {!isDemoReady ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-white text-[11px] font-bold">
                            🔒 ĐANG PHÁT TRIỂN
                          </span>
                        ) : hasImplemented ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Đã triển khai ({stationImps.length} lượt)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold">
                            Chưa ghi nhận triển khai
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-slate-900">{station.titleVi}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{station.subtitleVi}</p>

                      <div className="pt-1 text-[11px] text-slate-600 space-y-0.5">
                        <div>
                          <strong className="text-emerald-800">Yêu cầu cần đạt:</strong>{' '}
                          {station.pedagogyGoals.knowGoalVi.slice(0, 110)}...
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chỉ bài demo đã hoàn thiện mới cho phép dạy / trình chiếu / ghi nhận */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0">
                    {isDemoReady ? (
                      <>
                        <button
                          onClick={() => openStation(station)}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
                          title="Mở nội dung để xem như học sinh"
                        >
                          MỞ BÀI
                        </button>

                        <button
                          onClick={() => enterPresentationMode(station)}
                          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-sm transition flex items-center gap-1.5 active:scale-95"
                          title="Chiếu lên TV hoặc máy chiếu"
                        >
                          <Presentation className="w-3.5 h-3.5" />
                          <span>TRÌNH CHIẾU</span>
                        </button>

                        <button
                          onClick={() => setSelectedStationForImp(station)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm transition flex items-center gap-1.5 active:scale-95"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ĐÃ TRIỂN KHAI</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="px-4 py-2 rounded-xl bg-slate-200 text-slate-500 font-bold text-xs cursor-not-allowed"
                      >
                        ĐANG PHÁT TRIỂN
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: LỚP HỌC */}
      {activeTab === 'classrooms' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Danh Sách Học Sinh & Tiến Độ Lớp</h2>
              <p className="text-xs text-slate-500">Theo dõi việc tham gia và con dấu hộ chiếu của học sinh</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Chọn lớp:</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {teacherClasses.map(classroom => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name} ({classroom.totalStudents} học sinh)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase border-y border-slate-100 font-bold">
                <tr>
                  <th className="py-3 px-4">Mã định danh</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4">Lớp</th>
                  <th className="py-3 px-4">Trạm hoàn thành</th>
                  <th className="py-3 px-4">Con dấu</th>
                  <th className="py-3 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {classStudents.map((st) => {
                  const prog = progressService.getGradeProgress(
                    st.id,
                    demoStations.map(station => station.id),
                    currentGrade
                  );
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-500">{st.studentCode}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{st.displayName}</td>
                      <td className="py-3 px-4">{st.className}</td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-sky-700">{prog.completedStations} / {demoStations.length || 1}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-amber-600">{prog.totalStamps} dấu</span>
                      </td>
                      <td className="py-3 px-4">
                        {demoStations.length > 0 && prog.completedStations === demoStations.length ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Hoàn thành bài demo
                          </span>
                        ) : prog.completedStations > 0 ? (
                          <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
                            Đang học tập
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                            Chưa bắt đầu
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: KẾT QUẢ */}
      {activeTab === 'results' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-black text-slate-900">Báo Cáo Tiến Độ & Kết Quả Lớp</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider border border-amber-300">
                  DỮ LIỆU MINH HỌA
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tổng hợp mức độ tham gia, con dấu đạt được và cảm xúc của học sinh (Không áp lực điểm số).
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold">
              Kỳ học 2025 - 2026
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
              <span className="text-xs font-bold text-emerald-800 uppercase">Tỷ lệ tham gia</span>
              <div className="text-3xl font-black text-emerald-700 mt-1">{participatingStudents}/{classStudents.length}</div>
              <p className="text-[11px] text-emerald-600 mt-1">Học sinh demo đã hoàn thành bài demo trong dữ liệu cục bộ</p>
            </div>

            <div className="p-5 rounded-2xl bg-sky-50 border border-sky-100">
              <span className="text-xs font-bold text-sky-800 uppercase">Lượt triển khai dạy</span>
              <div className="text-3xl font-black text-sky-700 mt-1">{implementations.length} lượt</div>
              <p className="text-[11px] text-sky-600 mt-1">Đã được giáo viên xác nhận trong học kỳ</p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100">
              <span className="text-xs font-bold text-amber-800 uppercase">Bài demo đang mở</span>
              <div className="text-xl font-black text-amber-900 mt-1">{currentDemoStation?.titleVi || 'Đang cập nhật'}</div>
              <p className="text-[11px] text-amber-700 mt-1">01 bài demo/khối để kiểm thử luồng dạy – học</p>
            </div>
          </div>

          {/* Implementation History Log */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-800">Nhật ký các tiết dạy đã triển khai:</h3>
            <div className="space-y-2">
              {implementations.map(imp => (
                <div
                  key={imp.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900">{imp.stationName}</span>
                    <span className="text-slate-400 mx-1.5">•</span>
                    <span className="text-emerald-700 font-semibold">{imp.className}</span>
                    <span className="text-slate-400 mx-1.5">•</span>
                    <span className="text-slate-500">{imp.session}</span>
                    {imp.note && <p className="text-slate-500 text-[11px] mt-0.5 italic">"{imp.note}"</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-medium">
                      {imp.method}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{imp.implementationDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HỌC LIỆU */}
      {activeTab === 'resources' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Kho Tư Liệu & Nguồn Học Liệu Đã Kiểm Chứng</h2>
              <p className="text-xs text-slate-500">
                Tài liệu chuẩn từ Sở GDĐT Đà Nẵng, Trung tâm Bảo tồn Di sản và bảo tàng địa phương.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayStations.map(st => {
              const isDemoReady = DEMO_STATION_IDS.has(st.id);
              return (
              <div key={st.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">{st.titleVi}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Phiên bản {st.version.version}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Căn cứ: {st.officialCurriculumReference}
                </p>
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Số điểm chạm: {st.hotspots.length}</span>
                  {isDemoReady ? (
                    <button
                      onClick={() => {
                        setProposalStation(st);
                        setProposalText('');
                        setProposalSent(false);
                      }}
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>Góp ý học liệu</span>
                    </button>
                  ) : (
                    <span className="text-slate-500 font-bold">🔒 Đang phát triển</span>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Implementation Modal */}
      {selectedStationForImp && (
        <ImplementationModal
          station={selectedStationForImp}
          onClose={() => setSelectedStationForImp(null)}
          onSuccess={() => setSelectedStationForImp(null)}
        />
      )}

      {/* Proposal Modal */}
      {proposalStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              Đề Xuất Chỉnh Sửa Học Liệu: {proposalStation.titleVi}
            </h3>
            <p className="text-xs text-slate-500">
              Ý kiến chuyên môn được ghi nhận trong phiên bản demo để phục vụ rà soát và hoàn thiện học liệu.
            </p>

            {!proposalSent ? (
              <div className="space-y-3">
                <textarea
                  value={proposalText}
                  onChange={(e) => setProposalText(e.target.value)}
                  rows={4}
                  placeholder="Góp ý về từ ngữ, hình ảnh, câu hỏi tương tác hoặc tư liệu cập nhật..."
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setProposalStation(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                      setProposalSent(true);
                      setTimeout(() => setProposalStation(null), 1500);
                    }}
                    disabled={!proposalText.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 disabled:opacity-40 text-white text-xs font-bold"
                  >
                    Gửi đề xuất
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-emerald-700 font-bold text-sm">
                ✓ Đã ghi nhận góp ý học liệu!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
