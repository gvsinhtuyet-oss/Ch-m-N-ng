import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { DEMO_STUDENTS, DEMO_CLASSROOMS } from '../../data/mockUsers';
import { authService } from '../../services/AuthService';
import { audioService } from '../../services/AudioService';
import { backgroundMusic } from '../../services/BackgroundMusic';
import { studentSyncService } from '../../services/StudentSyncService';
import { readTheme } from '../../services/ThemeService';
import { DEFAULT_APP_BACKGROUND_DATA_URL } from '../../assets/defaultAppBackground';
import {
  Compass,
  GraduationCap,
  Presentation,
  Globe,
  ArrowRight,
  Volume2,
  VolumeX,
  Layers,
  Award,
  BookOpen,
  X,
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const {
    loginAsStudent,
    loginAsTeacher,
    enterTeacherDemo,
    loginAsAdmin,
    soundEnabled,
    toggleSound,
    t,
  } = useApp();

  const [showRolePicker, setShowRolePicker] = useState<boolean>(false);
  const [chosenGrade, setChosenGrade] = useState<number | null>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [showStudentLogin, setShowStudentLogin] = useState<boolean>(false);
  const [adminLogin, setAdminLogin] = useState(false);
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffBusy, setStaffBusy] = useState(false);
  const [showTeacherLogin, setShowTeacherLogin] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<string>('2/24');
  const [studentName, setStudentName] = useState<string>('');
  const [savedStudentId, setSavedStudentId] = useState<string>('');
  const [savedStudentName, setSavedStudentName] = useState<string>('');
  const [savedStudentClass, setSavedStudentClass] = useState<string>('');
  const [savedStudentGrade, setSavedStudentGrade] = useState<number | null>(null);
  const [savedSyncCode, setSavedSyncCode] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [introActive, setIntroActive] = useState(true);
  const [theme, setTheme] = useState(readTheme);
  const [mobileBackground, setMobileBackground] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const introFrameRef = useRef<HTMLIFrameElement | null>(null);

  const STUDENT_PROFILE_KEY = 'cham_danang_student_profile_v1';

  useEffect(() => {
    const refresh = () => setTheme(readTheme());
    const refreshStorage = () => setTheme(readTheme(true));
    const query = window.matchMedia('(max-width: 767px)');
    const resize = () => setMobileBackground(query.matches);
    window.addEventListener('cham-theme-changed', refresh);
    window.addEventListener('storage', refreshStorage);
    query.addEventListener('change', resize);
    return () => {
      window.removeEventListener('cham-theme-changed', refresh);
      window.removeEventListener('storage', refreshStorage);
      query.removeEventListener('change', resize);
    };
  }, []);

  const coverBackground = (
    mobileBackground
      ? theme.coverMobile || theme.coverDesktop
      : theme.coverDesktop || theme.coverMobile
  ) || DEFAULT_APP_BACKGROUND_DATA_URL;

  const roleBackground = (
    mobileBackground
      ? theme.roleMobile || theme.roleDesktop
      : theme.roleDesktop || theme.roleMobile
  ) || coverBackground || DEFAULT_APP_BACKGROUND_DATA_URL;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STUDENT_PROFILE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (typeof saved?.name === 'string') {
        setStudentName(saved.name);
        setSavedStudentName(saved.name);
      }
      if (typeof saved?.className === 'string') {
        setSelectedClass(saved.className);
        setSavedStudentClass(saved.className);
      }
      if (typeof saved?.id === 'string') setSavedStudentId(saved.id);
      if (typeof saved?.syncCode === 'string') setSavedSyncCode(saved.syncCode);
      const storedGrade = Number(saved?.grade);
      const inferredGrade = typeof saved?.className === 'string'
        ? Number(saved.className.split('/')[0])
        : NaN;
      const validGrade = Number.isInteger(storedGrade) && storedGrade >= 1 && storedGrade <= 5
        ? storedGrade
        : inferredGrade;
      if (Number.isInteger(validGrade) && validGrade >= 1 && validGrade <= 5) {
        setSavedStudentGrade(validGrade);
      }
    } catch {
      // Dữ liệu cũ không hợp lệ thì cho học sinh nhập lại.
    }
  }, []);

  useEffect(() => {
    backgroundMusic.setForegroundSource('intro-video', introActive);
    return () => backgroundMusic.setForegroundSource('intro-video', false);
  }, [introActive]);

  useEffect(() => {
    if (!introActive) return;
    const startAudibleIntro = () => {
      try {
        introFrameRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
          '*'
        );
        introFrameRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
          '*'
        );
      } catch {}
    };
    window.addEventListener('pointerdown', startAudibleIntro, { once: true });
    window.addEventListener('keydown', startAudibleIntro, { once: true });
    return () => {
      window.removeEventListener('pointerdown', startAudibleIntro);
      window.removeEventListener('keydown', startAudibleIntro);
    };
  }, [introActive]);

  const stopIntroVideo = () => {
    setIntroActive(false);
    try {
      introFrameRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'stopVideo', args: [] }),
        '*'
      );
    } catch {
      // Nếu iframe chưa sẵn sàng, việc ẩn iframe vẫn dừng phần phát khi component cập nhật.
    }
  };

  const openRolePicker = () => {
    setLoginError('');
    setShowStudentLogin(false);
    setChosenGrade(null);
    setGuestMode(false);
    setShowTeacherLogin(false);
    setAdminLogin(false);
    setShowRolePicker(true);
  };

  const handleStartJourney = () => {
    stopIntroVideo();
    audioService.playSfx('click');
    openRolePicker();
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    audioService.playSfx('click');
    setLoginError('');

    const normalizedName = guestMode ? 'Nhà phiêu lưu tự do' : studentName.trim();
    if (!normalizedName || !chosenGrade) {
      setLoginError('Vui lòng chọn khối và nhập họ tên.');
      return;
    }
    if (!guestMode && !new RegExp(`^${chosenGrade}/[1-9][0-9]{0,2}$`).test(selectedClass)) {
      setLoginError(`Vui lòng chọn lớp thuộc Khối ${chosenGrade}.`);
      return;
    }
    let guestId = '';
    if (guestMode) { try { guestId = localStorage.getItem('cham_danang_guest_id_v1') || ''; } catch {} }

    const isSameSavedStudent =
      !guestMode &&
      !!savedStudentId &&
      savedStudentName.trim().toLocaleLowerCase('vi-VN') === normalizedName.toLocaleLowerCase('vi-VN') &&
      savedStudentClass === selectedClass &&
      (savedStudentGrade === null || savedStudentGrade === chosenGrade);

    const id = (guestMode ? guestId : (isSameSavedStudent ? savedStudentId : '')) ||
      `${guestMode ? 'guest' : 'local-student'}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

    const student = {
      ...DEMO_STUDENTS[0],
      id,
      studentCode: id,
      isGuest: guestMode,
      classId: guestMode ? 'guest' : `class-${selectedClass.replace('/', '-')}`,
      className: guestMode ? 'Khách trải nghiệm' : selectedClass,
      grade: chosenGrade,
      displayName: normalizedName,
      name: normalizedName,
      pinHash: undefined,
    };

    try {
      if (guestMode) {
        localStorage.setItem('cham_danang_guest_id_v1', id);
        localStorage.setItem('cham_danang_guest_grade_v1', String(chosenGrade));
      } else {
        let syncCode = isSameSavedStudent ? savedSyncCode : '';
        if (!syncCode) {
          try {
            const registered = await studentSyncService.register({
              id,
              name: normalizedName,
              className: selectedClass,
              grade: chosenGrade,
            });
            syncCode = registered.syncCode;
          } catch {
            // Máy chủ đồng bộ có thể chưa sẵn sàng; vẫn cho phép học và lưu cục bộ.
          }
        }
        localStorage.setItem(
          STUDENT_PROFILE_KEY,
          JSON.stringify({ id, name: normalizedName, className: selectedClass, grade: chosenGrade, syncCode })
        );
        setSavedStudentId(id);
        setSavedStudentName(normalizedName);
        setSavedStudentClass(selectedClass);
        setSavedStudentGrade(chosenGrade);
        setSavedSyncCode(syncCode);
      }
    } catch {
      // Nếu không lưu được cục bộ, vẫn cho phép vào học.
    }

    try {
      if (authService.current()) await authService.logout();
      loginAsStudent(student);
    } catch (error) { setLoginError((error as Error).message); }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-transparent text-white select-none">
      {/* Nền trang bìa do Quản trị cài riêng. */}
      <img
        src={coverBackground}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: 'blur(' + theme.blur + 'px)', transform: 'scale(1.025)' }}
      />
      <div className="absolute inset-0 bg-white pointer-events-none" style={{ opacity: theme.lightness }} />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/65 via-slate-950/28 to-slate-950/72 pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-transparent via-slate-950/10 to-slate-950/45 pointer-events-none" />

      {/* Top Bar on Cover Page */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-amber-400 p-0.5 shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Compass className="w-6 h-6 text-amber-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>CHẠM ĐÀ NẴNG</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 border border-amber-400/40 text-amber-300">
                GDĐP Tiểu học
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium hidden sm:block">
              Trường Tiểu học Trần Đại Nghĩa • TP Đà Nẵng
            </p>
          </div>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleSound}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/15 transition flex items-center gap-1.5"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Âm thanh' : 'Tắt tiếng'}</span>
          </button>

          <button
            onClick={() => {
              stopIntroVideo();
              audioService.playSfx('click');
              openRolePicker();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-bold border border-white/20 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Presentation className="w-3.5 h-3.5 text-amber-300" />
            <span>Đổi vai trò</span>
          </button>
        </div>
      </header>

      {/* Compact cinematic cover: app identity → intro video → explore */}
      <main className="relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-5 flex flex-col items-center text-center my-auto">
        <div className="space-y-1.5 sm:space-y-2">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-xl leading-none">
            CHẠM ĐÀ NẴNG
          </h1>
          <p className="text-lg sm:text-2xl md:text-3xl font-extrabold text-amber-300 tracking-tight drop-shadow-md">
            Hành trình số khám phá quê hương
          </p>
        </div>

        {/* Intro video: ưu tiên tự phát có tiếng; khi bỏ qua/khám phá thì dừng ngay. */}
        {introActive && (
          <div className="relative w-full max-w-3xl mt-4 sm:mt-5">
            <div className="absolute -inset-1 rounded-[22px] sm:rounded-[26px] bg-gradient-to-r from-sky-500/35 via-white/10 to-amber-400/35 blur-lg pointer-events-none" />
            <div className="relative aspect-video overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-black shadow-2xl shadow-slate-950/60">
              <iframe
                ref={introFrameRef}
                className="absolute inset-0 h-full w-full"
                src="https://www.youtube-nocookie.com/embed/Ud2uUxz9Lw4?autoplay=1&mute=0&playsinline=1&rel=0&modestbranding=1&controls=1&enablejsapi=1"
                title="Video giới thiệu CHẠM ĐÀ NẴNG"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                onLoad={() => {
                  try {
                    introFrameRef.current?.contentWindow?.postMessage(
                      JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
                      '*'
                    );
                    introFrameRef.current?.contentWindow?.postMessage(
                      JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
                      '*'
                    );
                  } catch {}
                }}
              />
              <button
                type="button"
                onClick={handleStartJourney}
                className="absolute right-2.5 top-2.5 sm:right-3 sm:top-3 rounded-xl border border-white/20 bg-slate-950/75 px-3 py-1.5 text-[10px] sm:text-xs font-bold text-white backdrop-blur-md hover:bg-slate-900 transition"
              >
                Bỏ qua
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleStartJourney}
          className="group mt-4 sm:mt-5 inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 px-8 sm:px-11 py-3.5 sm:py-4 text-sm sm:text-base font-black text-slate-950 shadow-2xl shadow-amber-400/30 transition-all duration-200 hover:scale-[1.03] active:scale-95"
        >
          <Compass className="w-5 h-5 transition duration-300 group-hover:rotate-45" />
          <span>CHẠM ĐỂ KHÁM PHÁ</span>
          <ArrowRight className="w-5 h-5 transition duration-200 group-hover:translate-x-1" />
        </button>

        <p className="mt-3 max-w-2xl text-xs sm:text-sm text-slate-200 font-medium leading-relaxed drop-shadow">
          Khám phá Đà Nẵng qua di sản, câu chuyện, nhiệm vụ và trải nghiệm số.
        </p>

        {/* Compact feature strip */}
        <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-2.5 backdrop-blur-md text-[10px] sm:text-xs font-bold text-slate-200">
          <span className="inline-flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-sky-300" />5 khối lớp</span>
          <span className="hidden sm:inline text-white/25">•</span>
          <span className="inline-flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-amber-300" />VR360°</span>
          <span className="hidden sm:inline text-white/25">•</span>
          <span className="inline-flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-emerald-300" />Hộ chiếu số</span>
          <span className="hidden sm:inline text-white/25">•</span>
          <span className="inline-flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-violet-300" />Audio & Quiz</span>
        </div>
      </main>

      {/* Dignified Unit and Authors Credits Footer */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/10 text-xs text-slate-300/90 font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="font-semibold text-white">Trường Tiểu học Trần Đại Nghĩa</span>
        </div>
        <div className="text-[11px] sm:text-xs text-slate-400">
          Chương trình Giáo dục địa phương TP Đà Nẵng
        </div>
        <div className="text-[11px] sm:text-xs">
          <span>Thiết kế: </span>
          <span className="font-bold text-amber-300">Trương Sinh Tuyết – Nguyễn Thị Thanh</span>
        </div>
      </footer>

      {/* Role Picker Modal */}
      {showRolePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
          <img
            src={roleBackground}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: 'blur(' + theme.blur + 'px)', transform: 'scale(1.025)' }}
          />
          <div className="absolute inset-0 bg-white pointer-events-none" style={{ opacity: theme.lightness }} />
          <div className="absolute inset-0 bg-slate-950/38 backdrop-blur-[2px] pointer-events-none" />
          <div className="relative z-10 bg-white/95 backdrop-blur-xl text-slate-800 rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[90dvh] overflow-y-auto shadow-2xl border border-white/80 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold">
                  Phân quyền ứng dụng
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Chọn Vai Trò Trải Nghiệm</h3>
              </div>
              <button
                onClick={() => {
                  setShowRolePicker(false);
                  setShowStudentLogin(false);
                  setShowTeacherLogin(false);
                  setLoginError('');
                }}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!showStudentLogin && !showTeacherLogin ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => {
                    audioService.playSfx('click');
                    setGuestMode(false);
                    setChosenGrade(null);
                    setShowStudentLogin(true);
                  }}
                  className="p-4 rounded-2xl bg-white border-2 border-sky-400 hover:border-sky-600 shadow-sm hover:shadow-md transition text-left space-y-1.5 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold group-hover:scale-110 transition">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-sm text-slate-900">HỌC SINH</h4>
                  <p className="text-[11px] text-slate-500">Chọn khối, chọn lớp và nhập tên để bắt đầu</p>
                </button>

                <button
                  onClick={() => { setGuestMode(true); setChosenGrade(null); setLoginError(''); setShowStudentLogin(true); }}
                  className="p-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md text-left flex items-center gap-4 hover:brightness-110 transition"
                >
                  <Compass className="w-9 h-9 shrink-0" />
                  <div><h4 className="font-black">NHÀ PHIÊU LƯU TỰ DO</h4><p className="text-xs text-violet-100 mt-1">Dành cho khách — đủ nhiệm vụ, vật phẩm, quà và dấu hành trình. Không cần tên hay lớp.</p></div>
                </button>

                <button
                  onClick={async () => {
                    try { await enterTeacherDemo(); setShowRolePicker(false); }
                    catch (error) { setLoginError((error as Error).message); }
                  }}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-md transition text-left space-y-1.5 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-110 transition">
                    <Presentation className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-sm text-slate-900">GIÁO VIÊN</h4>
                  <p className="text-[11px] text-slate-500">Trải nghiệm dành cho giám khảo — không cần đăng nhập</p>
                </button>

                <button
                  onClick={() => {
                    audioService.playSfx('click');
                    setAdminLogin(true);
                    setShowTeacherLogin(true);
                  }}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 shadow-sm hover:shadow-md transition text-left space-y-1.5 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold group-hover:scale-110 transition">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-sm text-slate-900">QUẢN TRỊ</h4>
                  <p className="text-[11px] text-slate-500">Quản lý giao diện, hình ảnh và học liệu</p>
                </button>

              </div>
            ) : showStudentLogin ? (
              /* Student Login Form: chọn khối và nhập thông tin ngay trên cùng một màn hình */
              <form onSubmit={handleStudentSubmit} className="space-y-5 text-xs">
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h4 className="text-lg font-black text-slate-900">
                      {guestMode ? 'Chọn khối để khám phá' : 'Em học khối nào?'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowStudentLogin(false)}
                      className="text-xs font-bold text-slate-500 hover:text-sky-700"
                    >
                      ← Chọn vai trò khác
                    </button>
                  </div>

                  <div className="grid grid-cols-5 gap-2 sm:gap-3">
                    {[
                      'from-sky-500 to-blue-700', 'from-emerald-500 to-teal-700',
                      'from-amber-400 to-orange-600', 'from-rose-500 to-pink-700', 'from-violet-500 to-indigo-700',
                    ].map((color, index) => {
                      const grade = index + 1;
                      const active = chosenGrade === grade;
                      return (
                        <button
                          key={grade}
                          type="button"
                          onClick={() => {
                            setChosenGrade(grade);
                            setLoginError('');
                            if (!guestMode && Number(selectedClass.split('/')[0]) !== grade) {
                              const classroom = DEMO_CLASSROOMS.find(item => item.grade === grade);
                              setSelectedClass(classroom?.name.replace('Lớp ', '') || `${grade}/1`);
                              setSavedStudentId('');
                            }
                          }}
                          className={`min-w-0 rounded-2xl bg-gradient-to-br ${color} px-2 py-4 sm:px-4 sm:py-5 text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:ring-4 focus-visible:ring-sky-300 ${
                            active ? 'ring-4 ring-sky-200 scale-[1.02]' : ''
                          }`}
                        >
                          <GraduationCap className="mx-auto mb-2 h-5 w-5 sm:h-6 sm:w-6" />
                          <span className="block whitespace-nowrap text-sm sm:text-lg font-black">Khối {grade}</span>
                          <span className="mt-1 block text-[9px] sm:text-[10px] text-white/90">
                            {active ? 'Đã chọn ✓' : 'Chạm để chọn'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {chosenGrade && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-4 rounded-2xl border border-sky-100 bg-sky-50/60 p-4 sm:p-5">
                    {!guestMode && (
                      <>
                        <div>
                          <label className="font-bold text-slate-700 block mb-2">
                            Lớp cụ thể của em
                          </label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {DEMO_CLASSROOMS.filter(item => item.grade === chosenGrade).map(item => {
                              const name = item.name.replace('Lớp ', '');
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    if (selectedClass !== name) setSavedStudentId('');
                                    setSelectedClass(name);
                                    setLoginError('');
                                  }}
                                  className={`px-4 py-2.5 rounded-xl border-2 font-bold transition ${
                                    selectedClass === name
                                      ? 'bg-sky-600 border-sky-600 text-white shadow-sm'
                                      : 'bg-white border-sky-200 text-sky-800 hover:bg-sky-50'
                                  }`}
                                >
                                  {item.name}
                                </button>
                              );
                            })}
                          </div>
                          <input
                            value={selectedClass}
                            onChange={event => {
                              setSelectedClass(event.target.value);
                              setSavedStudentId('');
                              setLoginError('');
                            }}
                            required
                            maxLength={5}
                            placeholder={`Ví dụ: ${chosenGrade}/24`}
                            className="w-full p-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            aria-label="Lớp cụ thể"
                          />
                        </div>

                        <div>
                          <label htmlFor="student-name" className="font-bold text-slate-700 block mb-1">
                            Họ và tên học sinh
                          </label>
                          <input
                            id="student-name"
                            type="text"
                            maxLength={100}
                            value={studentName}
                            onChange={event => {
                              setStudentName(event.target.value);
                              setSavedStudentId('');
                              setLoginError('');
                            }}
                            placeholder="Ví dụ: Nguyễn Minh Khang"
                            required
                            className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div>
                      </>
                    )}

                    <div className="rounded-xl bg-white/90 border border-sky-100 px-3 py-2.5 text-[10px] text-sky-800 leading-relaxed">
                      {guestMode
                        ? 'Chọn khối xong là có thể bắt đầu hành trình ngay.'
                        : 'App sẽ ghi nhớ tên, lớp và tiến độ của em trên thiết bị này. Dữ liệu đồng bộ được xử lý tự động, em không cần nhập mã.'}
                    </div>

                    {loginError && (
                      <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                        {loginError}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-black shadow-md shadow-sky-600/30 transition active:scale-[0.99]"
                    >
                      KHÁM PHÁ NGAY
                    </button>
                  </div>
                )}
              </form>
            ) : (
              <form className="space-y-4 text-sm" onSubmit={async e => {
                e.preventDefault(); if(staffBusy) return; setStaffBusy(true); setLoginError('');
                try {
                  const user = await authService.login(staffEmail,staffPassword);
                  setStaffPassword('');
                  if(user.role === 'admin') loginAsAdmin(user); else loginAsTeacher(user);
                  setShowRolePicker(false);
                } catch(error) { setLoginError((error as Error).message); }
                finally { setStaffBusy(false); }
              }}>
                <h4 className="font-black text-lg">{adminLogin ? 'Đăng nhập quản trị' : 'Đăng nhập giáo viên'}</h4>
                <p className="text-slate-500">Dùng email và mật khẩu được nhà trường cấp. Quyền truy cập được xác định theo tài khoản.</p>
                <label className="block font-bold">Email
                  <input type="email" autoComplete="username" required maxLength={254} value={staffEmail} onChange={e=>setStaffEmail(e.target.value)} className="mt-1 w-full p-3 border rounded-xl" />
                </label>
                <label className="block font-bold">Mật khẩu
                  <input type="password" autoComplete="current-password" required maxLength={128} value={staffPassword} onChange={e=>setStaffPassword(e.target.value)} className="mt-1 w-full p-3 border rounded-xl" />
                </label>
                {loginError && <p role="alert" className="p-3 rounded-xl bg-rose-50 text-rose-700">{loginError}</p>}
                <p className="text-xs text-slate-500">Quên mật khẩu? Liên hệ quản trị nhà trường để được đặt lại.</p>
                <div className="flex gap-2">
                  <button type="button" disabled={staffBusy} onClick={()=>{setShowTeacherLogin(false);setStaffPassword('');setLoginError('');}} className="flex-1 p-3 rounded-xl bg-slate-100">Quay lại</button>
                  <button disabled={staffBusy} className="flex-1 p-3 rounded-xl bg-emerald-600 text-white font-bold disabled:opacity-50">{staffBusy ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default LandingView;

