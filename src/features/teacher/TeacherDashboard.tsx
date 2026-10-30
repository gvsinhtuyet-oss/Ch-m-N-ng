import {LearningFeedbackForm} from '../../components/station/LearningFeedbackForm';
import {learningThumbnail} from '../../utils/learningThumbnail';
import {TeacherWorkspace} from './TeacherWorkspace';
import { ClassRoster } from './ClassRoster';
import { RealClassResults } from './RealClassResults';
import { GddpTeacherLookup } from './GddpTeacherLookup';
import React, { useEffect, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { authService } from '../../services/AuthService';
import { Station, ImplementationRecord } from '../../types';
import { DEMO_STUDENTS, DEMO_CLASSROOMS } from '../../data/mockUsers';
import { implementationService } from '../../services/ImplementationService';
import { progressService } from '../../services/ProgressService';
import { DEMO_STATION_IDS } from '../../data/demoStations';
import { DEFAULT_APP_BACKGROUND_DATA_URL } from '../../assets/defaultAppBackground';
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

  const [activeTab, setActiveTab] = useState<'teaching' | 'classrooms' | 'results' | 'resources' | 'gddp' | 'workspace'>('gddp');
  const [selectedStationForImp, setSelectedStationForImp] = useState<Station | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>('class-2-24');
  const [proposalStation, setProposalStation] = useState<Station | null>(null);

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
  const isDemo=currentUser?.id==='teacher-demo';
  const [implementations,setImplementations]=useState<ImplementationRecord[]>([]);
  const [workflowError,setWorkflowError]=useState('');
  const loadImplementations=async()=>{try{setWorkflowError('');setImplementations(isDemo?implementationService.getAll():await authService.implementations());}catch(e){setWorkflowError((e as Error).message);}};
  useEffect(()=>{void loadImplementations();},[currentUser?.id]);
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-4">
      {activeTab!=='gddp' && currentGrade>=4 && <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><strong>Học liệu lớp {currentGrade} theo chủ đề – chờ kế hoạch tích hợp mới.</strong> Đã rà lời thuyết minh, câu hỏi, đáp án theo nguồn; chưa có xác nhận phê duyệt của tổ chuyên môn. Chưa gắn tuần/bài SGK. Ảnh tư liệu có chú thích nơi chụp, thời điểm và giấy phép. Ảnh Phước Kiều chưa rõ quyền tái sử dụng chỉ được dẫn tại nguồn, chưa nhúng vào app. <a className="underline" href="https://danang.gov.vn/vi/w/ghe-tham-lang-nghe-duc-dong-phuoc-kieu" target="_blank" rel="noopener noreferrer">Xem tư liệu Phước Kiều tại nguồn</a></aside>}
      {activeTab!=='gddp' && currentGrade === 3 && <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><strong>Học liệu lớp 3 theo chủ đề – chờ duyệt tích hợp.</strong> Đủ 5 trạm tham khảo theo đề cương; chưa xác nhận tuần, bài và bộ sách của kế hoạch mới. Bảng tích hợp cũ ghi Hoàng Diệu – Phan Châu Trinh, khác đề cương Huỳnh Thúc Kháng – Phan Châu Trinh. Tư liệu nghề thúng chai Hội An chỉ dùng tham khảo chung, chưa thay cho quy trình riêng của Sơn Trà.</aside>}
      {activeTab!=='gddp' && currentUser?.id === 'teacher-demo' && <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">Chế độ giáo viên trải nghiệm dành cho giám khảo. Bạn có thể xem học liệu và trình chiếu bài học; đăng ảnh, tài liệu chung cần đăng nhập quản trị.</p>}
      {workflowError&&<p role="alert" className="rounded-xl bg-rose-50 p-3 text-rose-700">{workflowError}</p>}
      {/* Teacher Profile Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-sky-800 text-white rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="hidden md:flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-300 font-bold text-xs uppercase tracking-wider">
              Không Gian Dạy Học – Giáo Viên
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-300 text-slate-950 font-black text-[10px] uppercase tracking-wide">
              {currentUser?.id === 'teacher-demo' ? 'Tài khoản demo • Dữ liệu minh họa' : 'Tài khoản giáo viên'}
            </span>
            <span className="text-xs text-emerald-200">{teacher?.schoolName || 'Chọn trường trong kế hoạch của tôi'}</span>
          </div>
          <h1 className="text-base sm:text-xl font-black">
            Chào mừng {teacher?.name || 'Cô Trương Sinh Tuyết'}!
          </h1>
          <p className="hidden md:block text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
            Hỗ trợ giáo viên tổ chức bài học demo, trình chiếu nội dung, theo dõi tiến độ và ghi nhận triển khai.
          </p>
          <button
            type="button"
            onClick={() => setCurrentView('student-maps')}
            className="hidden md:inline-flex mt-3 items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/15 text-xs font-black transition"
          >
            <MapIcon className="w-4 h-4 text-amber-300" />
            <span>XEM TRƯỚC BẢN ĐỒ & RƯƠNG KHO BÁU</span>
          </button>
        </div>

        {/* Four clear entry points; keep existing features in their original tabs. */}
        <nav aria-label="Không gian giáo viên" className="grid grid-cols-2 gap-2 w-full md:w-auto md:min-w-[360px]">
          {([
            {id:'gddp',label:'Dạy học ngay',Icon:Presentation},
            {id:'workspace',label:'Kế hoạch bài dạy',Icon:FileEdit},
            {id:'resources',label:'Kho học liệu',Icon:BookOpen},
            {id:'classrooms',label:'Lớp học của tôi',Icon:Users},
          ] as const).map(({id,label,Icon})=><button key={id} type="button" onClick={()=>setActiveTab(id)} aria-current={activeTab===id?'page':undefined} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition ${activeTab===id?'bg-white text-slate-900 shadow':'bg-white/15 text-white hover:bg-white/25'}`}><Icon className="h-4 w-4 shrink-0"/>{label}</button>)}
          <button type="button" onClick={()=>setActiveTab('teaching')} className="col-span-2 text-xs text-white/90 underline underline-offset-2">Xem danh mục trạm và trình chiếu đầy đủ</button>
          {activeTab==='classrooms'&&<button type="button" onClick={()=>setActiveTab('results')} className="col-span-2 rounded-lg bg-white/15 px-3 py-2 text-sm font-bold text-white">Xem kết quả học sinh</button>}
        </nav>
      </div>

      {activeTab === 'workspace' && <TeacherWorkspace />}
      {activeTab === 'gddp' && <GddpTeacherLookup stations={allStationsInCurrentGrade} currentGrade={currentGrade} onGradeChange={setCurrentGrade} onOpenStudentStage1={station=>openStation(station,1)} />}

      {/* TAB 1: DẠY HỌC */}
      {activeTab === 'teaching' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Danh Mục Bài Dạy Khối {currentGrade}</h2>
              <p className="text-xs text-slate-500">
                {(currentGrade >= 1 && currentGrade <= 5)
                  ? `Khối ${currentGrade} đã mở đủ 05 bài để tổ chức dạy học.`
                  : 'Khối này hiện mở 01 bài demo; các bài còn lại đang tiếp tục hoàn thiện.'}
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
                      loading="lazy" decoding="async"
                      src={learningThumbnail(station.coverImage)}
                      alt={station.titleVi}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shrink-0 shadow-xs"
                      onError={event => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = DEFAULT_APP_BACKGROUND_DATA_URL;
                      }}
                    />
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                          Bài {station.number}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">• {station.totalPeriods>0?`${station.totalPeriods} tiết`:'Chưa xác nhận số tiết'}</span>
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
      {activeTab === 'classrooms' && currentUser?.id !== 'teacher-demo' && <ClassRoster />}
      {activeTab === 'classrooms' && currentUser?.id === 'teacher-demo' && (
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
      {activeTab === 'results' && currentUser?.id !== 'teacher-demo' && <RealClassResults />}

      {activeTab === 'results' && currentUser?.id === 'teacher-demo' && (
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
              <div className="text-xl font-black text-amber-900 mt-1">
                {(currentGrade >= 1 && currentGrade <= 5) ? '05 bài đã sẵn sàng' : (currentDemoStation?.titleVi || 'Đang cập nhật')}
              </div>
              <p className="text-[11px] text-amber-700 mt-1">
                {(currentGrade >= 1 && currentGrade <= 5) ? `Đủ 5 trạm Khối ${currentGrade} để tổ chức dạy – học` : '01 bài demo/khối để kiểm thử luồng dạy – học'}
              </p>
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
          onSuccess={() => {setSelectedStationForImp(null);void loadImplementations();}}
        />
      )}

      {proposalStation && <LearningFeedbackForm station={proposalStation} onClose={()=>setProposalStation(null)}/>}
    </div>
  );
};
